"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAccessTokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const errors_1 = require("../../application/errors");
const encode = (input) => Buffer.from(input, 'utf8').toString('base64url');
let JwtAccessTokenService = class JwtAccessTokenService {
    secret;
    issuer;
    ttlSeconds;
    constructor(config) {
        this.secret = config.getOrThrow('JWT_SECRET');
        this.issuer = config.get('JWT_ISSUER') ?? 'ics';
        this.ttlSeconds = Number(config.get('JWT_EXPIRES_IN') ?? '3600');
    }
    issue(claims) {
        const now = Math.floor(Date.now() / 1000);
        const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = encode(JSON.stringify({
            sub: claims.userId,
            email: claims.email,
            iss: this.issuer,
            iat: now,
            exp: now + this.ttlSeconds,
        }));
        const signingInput = `${header}.${payload}`;
        const signature = this.sign(signingInput);
        return {
            accessToken: `${signingInput}.${signature}`,
            tokenType: 'Bearer',
            expiresIn: this.ttlSeconds,
        };
    }
    verify(token) {
        const parts = token.split('.');
        if (parts.length !== 3)
            throw new errors_1.InvalidTokenError();
        const [header, payload, signature] = parts;
        if (!this.signatureMatches(`${header}.${payload}`, signature))
            throw new errors_1.InvalidTokenError();
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        }
        catch {
            throw new errors_1.InvalidTokenError();
        }
        const now = Math.floor(Date.now() / 1000);
        if (typeof decoded.exp !== 'number' || decoded.exp < now)
            throw new errors_1.InvalidTokenError('Token has expired.');
        if (decoded.iss !== this.issuer)
            throw new errors_1.InvalidTokenError();
        if (typeof decoded.sub !== 'string' || decoded.sub.length === 0)
            throw new errors_1.InvalidTokenError();
        return {
            userId: decoded.sub,
            email: typeof decoded.email === 'string' ? decoded.email : undefined,
        };
    }
    sign(signingInput) {
        return (0, node_crypto_1.createHmac)('sha256', this.secret).update(signingInput).digest('base64url');
    }
    signatureMatches(signingInput, provided) {
        const expected = Buffer.from(this.sign(signingInput));
        const actual = Buffer.from(provided);
        return expected.length === actual.length && (0, node_crypto_1.timingSafeEqual)(expected, actual);
    }
};
exports.JwtAccessTokenService = JwtAccessTokenService;
exports.JwtAccessTokenService = JwtAccessTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtAccessTokenService);
//# sourceMappingURL=jwt-access-token.service.js.map