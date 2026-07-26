import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from './interface/shared/domain-exception.filter';
import { requestContextMiddleware } from './interface/shared/request-context.middleware';

/** Frontend origins allowed by default, for local development. */
const DEFAULT_ORIGINS = ['http://localhost:3001', 'http://127.0.0.1:3001'];

/**
 * Origins permitted to call this API, read from CORS_ORIGINS as a
 * comma-separated list, e.g.
 * "https://ics.university.edu,https://staff.university.edu".
 * Falls back to the local Next.js dev server so a fresh clone runs with no
 * configuration at all.
 */
function allowedOrigins(): string[] {
  const configured = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return configured.length > 0 ? configured : DEFAULT_ORIGINS;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestContextMiddleware);

  // ── CORS ─────────────────────────────────────────────────────────────
  // Browsers refuse calls from a page whose origin differs from the API's,
  // so the frontend has to be named here. An explicit allow-list is used
  // instead of a wildcard: origin '*' would let any site on the internet
  // call this API from a signed-in user's browser.
  app.enableCors({
    origin: allowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
    maxAge: 86400,
  });
  // ─────────────────────────────────────────────────────────────────────

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  // ── Swagger ──────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('ICS API')
    .setDescription('Intelligent Administrative Correspondence System')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addSecurityRequirements('JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // ─────────────────────────────────────────────────────────────────────
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
