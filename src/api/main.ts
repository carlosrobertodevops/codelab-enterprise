import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  const webOrigin = process.env.WEB_ORIGIN || 'http://localhost';
  app.enableCors({
    origin: [webOrigin],
    credentials: true,
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CodeLab API')
    .setDescription('NestJS API for CodeLab (courses, comments, progress, payments, uploads, webhooks)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.API_PORT || 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
}

bootstrap();
