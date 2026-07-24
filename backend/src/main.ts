import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from './interface/shared/domain-exception.filter';
import { requestContextMiddleware } from './interface/shared/request-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestContextMiddleware);
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
