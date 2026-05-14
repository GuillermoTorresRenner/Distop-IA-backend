import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Distop-IA');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // Cookie parser middleware
  app.use(cookieParser());

  // Subimos el límite del body parser para aceptar uploads de imágenes
  // como dataURL base64 (pizarra colaborativa). El DTO de upload limita
  // cada dataURL a ~3MB (≈ 2.2MB binario); 5MB acá deja margen para el
  // wrap JSON y otros campos.
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ limit: '5mb', extended: true }));

  // Serve static files from public folder
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  const config = new DocumentBuilder()
    .setTitle('Distop-IA API')
    .setDescription('API documentation for Distop-IA backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // OpenAPI JSON export endpoint
  app.use('/docs-json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  await app.listen(envs.port);

  logger.log(`Application is running on: ${envs.backendUrl}/api`);
  logger.log(`Swagger docs available at: ${envs.backendUrl}/docs`);
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
});
