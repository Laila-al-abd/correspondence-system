/**
 * The claims carried by an access token: at minimum, which user the token
 * represents. Deliberately small -- authorization (roles/permissions) is
 * resolved fresh from the database on each request, never trusted from the
 * token, so a revoked role takes effect immediately.
 */
export interface AccessTokenClaims {
  userId: string
  email?: string
}

/** A freshly issued token plus the metadata a client needs to use it. */
export interface IssuedToken {
  accessToken: string
  tokenType: "Bearer"
  expiresIn: number
}

/**
 * Issues and verifies stateless access tokens. This is a port: the login use
 * case issues a token, the HTTP edge verifies it. The concrete signing scheme
 * (JWT/HS256) lives in the infrastructure layer, so nothing in the domain or
 * application depends on a particular token format or library.
 */
export interface AccessTokenService {
  issue(claims: AccessTokenClaims): IssuedToken
  verify(token: string): AccessTokenClaims
}
