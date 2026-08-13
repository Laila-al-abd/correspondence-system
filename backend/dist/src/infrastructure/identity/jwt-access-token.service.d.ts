import { ConfigService } from '@nestjs/config';
import { AccessTokenClaims, AccessTokenService, IssuedToken } from '../../domain/identity/ports/access-token.service';
export declare class JwtAccessTokenService implements AccessTokenService {
    private readonly secret;
    private readonly issuer;
    private readonly ttlSeconds;
    constructor(config: ConfigService);
    issue(claims: AccessTokenClaims): IssuedToken;
    verify(token: string): AccessTokenClaims;
    private sign;
    private signatureMatches;
}
