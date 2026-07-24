import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  AccessTokenClaims,
  AccessTokenService,
  IssuedToken,
} from '../../domain/identity/ports/access-token.service'
import { InvalidTokenError } from '../../application/errors'

interface JwtPayload {
  sub?: unknown
  email?: unknown
  iss?: unknown
  exp?: unknown
}

const encode = (input: string): string =>
  Buffer.from(input, 'utf8').toString('base64url')

/**
 * Stateless JSON Web Tokens signed with HMAC-SHA256 (HS256).
 *
 * Implemented directly on Node's crypto module rather than pulling in a JWT
 * dependency: HS256 is a header/payload/signature triple where the signature is
 * an HMAC over "header.payload". Signing and verification are a few lines, the
 * comparison is constant-time (timingSafeEqual), and there is no third-party
 * code in the security-critical path. The secret and lifetime come from the
 * environment via ConfigService, so they are never hard-coded.
 */
@Injectable()
export class JwtAccessTokenService implements AccessTokenService {
  private readonly secret: string
  private readonly issuer: string
  private readonly ttlSeconds: number

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('JWT_SECRET')
    this.issuer = config.get<string>('JWT_ISSUER') ?? 'ics'
    this.ttlSeconds = Number(config.get<string>('JWT_EXPIRES_IN') ?? '3600')
  }

  issue(claims: AccessTokenClaims): IssuedToken {
    const now = Math.floor(Date.now() / 1000)
    const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = encode(
      JSON.stringify({
        sub: claims.userId,
        email: claims.email,
        iss: this.issuer,
        iat: now,
        exp: now + this.ttlSeconds,
      }),
    )
    const signingInput = `${header}.${payload}`
    const signature = this.sign(signingInput)
    return {
      accessToken: `${signingInput}.${signature}`,
      tokenType: 'Bearer',
      expiresIn: this.ttlSeconds,
    }
  }

  verify(token: string): AccessTokenClaims {
    const parts = token.split('.')
    if (parts.length !== 3) throw new InvalidTokenError()
    const [header, payload, signature] = parts

    if (!this.signatureMatches(`${header}.${payload}`, signature))
      throw new InvalidTokenError()

    let decoded: JwtPayload
    try {
      decoded = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as JwtPayload
    } catch {
      throw new InvalidTokenError()
    }

    const now = Math.floor(Date.now() / 1000)
    if (typeof decoded.exp !== 'number' || decoded.exp < now)
      throw new InvalidTokenError('Token has expired.')
    if (decoded.iss !== this.issuer) throw new InvalidTokenError()
    if (typeof decoded.sub !== 'string' || decoded.sub.length === 0)
      throw new InvalidTokenError()

    return {
      userId: decoded.sub,
      email: typeof decoded.email === 'string' ? decoded.email : undefined,
    }
  }

  private sign(signingInput: string): string {
    return createHmac('sha256', this.secret).update(signingInput).digest('base64url')
  }

  private signatureMatches(signingInput: string, provided: string): boolean {
    const expected = Buffer.from(this.sign(signingInput))
    const actual = Buffer.from(provided)
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  }
}
