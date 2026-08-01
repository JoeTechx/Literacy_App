import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global prefix: all routes are /api/v1/...
  app.setGlobalPrefix('api/v1');

  // ── Global validation pipe: auto-validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // strips unknown fields
      forbidNonWhitelisted: false,
      transform: true,        // auto-converts types (e.g. string → number)
    }),
  );

  // ── CORS: allow the web dashboard and React Native app to call this API
  // Set CORS_ORIGIN in .env. For React Native, '*' is required as RN doesn't use CORS.
  // For production web, set this to your deployed frontend domain.
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Literacy App Backend is running!`);
  console.log(`📡 API:  http://localhost:${port}/api/v1`);
  console.log(`📖 Env: ${process.env.NODE_ENV || 'development'}\n`);
}
bootstrap();
