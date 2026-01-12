import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: true,
    abortOnError: false,
  });
  app.useLogger(app.get(Logger));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8080;

  const config = new DocumentBuilder()
    .setTitle('LP Extend example')
    .setDescription(
      'Categorised API endpoints for LP Conversational Cloud Services and internal LP Extend services.',
    )
    .setVersion('1.0')
    .addBearerAuth({
      description: `Please enter your Conversational Cloud bearer Token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .addTag('LP Extend')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS with credentials support for cookie-based auth
  app.enableCors({
    origin: true, // Reflect request origin - in production, set to specific origins
    credentials: true, // Allow cookies to be sent cross-origin
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Cookie parser with secret for signed cookies (should match shell's COOKIE_SECRET)
  const cookieSecret = configService.get<string>('COOKIE_SECRET') || 'lp-extend-default-secret-change-in-production';
  app.use(cookieParser(cookieSecret));
  console.log(`listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
