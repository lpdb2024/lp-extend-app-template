import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
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
  const port = configService.get<number>('PORT');

  // Parse Firebase service account from GOOGLE_SERVICE_ACCOUNT env variable (JSON string)
  const serviceAccountJson = configService.get<string>('GOOGLE_SERVICE_ACCOUNT');
  let firebaseConfig: admin.ServiceAccount;
  try {
    firebaseConfig = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
  } catch (err) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT environment variable as JSON');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  });

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

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cookieParser());
  console.log(`listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
