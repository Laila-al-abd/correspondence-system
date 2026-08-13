"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const domain_exception_filter_1 = require("./interface/shared/domain-exception.filter");
const request_context_middleware_1 = require("./interface/shared/request-context.middleware");
const MAX_BODY_SIZE = '15mb';
const DEFAULT_ORIGINS = ['http://localhost:3001', 'http://127.0.0.1:3001'];
function allowedOrigins() {
    const configured = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    return configured.length > 0 ? configured : DEFAULT_ORIGINS;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('trust proxy', 1);
    app.use((0, express_1.json)({ limit: MAX_BODY_SIZE }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: MAX_BODY_SIZE }));
    app.use(request_context_middleware_1.requestContextMiddleware);
    app.enableCors({
        origin: allowedOrigins(),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
        maxAge: 86400,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new domain_exception_filter_1.DomainExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ICS API')
        .setDescription('Intelligent Administrative Correspondence System')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
        .addSecurityRequirements('JWT')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map