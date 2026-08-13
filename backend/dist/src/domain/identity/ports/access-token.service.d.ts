export interface AccessTokenClaims {
    userId: string;
    email?: string;
}
export interface IssuedToken {
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: number;
}
export interface AccessTokenService {
    issue(claims: AccessTokenClaims): IssuedToken;
    verify(token: string): AccessTokenClaims;
}
