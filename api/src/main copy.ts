import { NestFactory, PartialGraphHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
import * as bodyParser from 'body-parser';
import { HttpExceptionFilter } from './utils/HttpExceptionFilter';
// import { ServiceAccount } from 'firebase-admin';
import { LoggerModule, Logger } from 'nestjs-pino'


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: true,
    abortOnError: false
  });
  app.useLogger(app.get(Logger));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  const firebaseConfig = {
    type: configService.get<string>('TYPE'),
    project_id: configService.get<string>('PROJECT_ID'),
    private_key_id: configService.get<string>('PRIVATE_KEY_ID'),
    private_key: configService.get<string>('PRIVATE_KEY'),
    client_email: configService.get<string>('CLIENT_EMAIL'),
    client_id: configService.get<string>('CLIENT_ID'),
    auth_uri: configService.get<string>('AUTH_URI'),
    token_uri: configService.get<string>('TOKEN_URI'),
    auth_provider_x509_cert_url: configService.get<string>('AUTH_CERT_URL'),
    client_x509_cert_url: configService.get<string>('CLIENT_CERT_URL'),
    universe_domain: configService.get<string>('UNIVERSAL_DOMAIN'),
  } as admin.ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  });

  const config = new DocumentBuilder()
    .setTitle('LP Extend example')
    .setDescription('Categorised API endpoints for LP Conversational Cloud Services and internal LP Extend services.')
    .setVersion('1.0')
    .addBearerAuth(
      { 
      description: `Please enter your Conversational Cloud bearer Token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header'
    }
    )
    .addTag('LP Extend')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  // app.setGlobalPrefix('api');

  

  

  app.use(cookieParser());

  // app.useGlobalFilters(new HttpExceptionFilter());

  console.log(`listening on port ${port}`);
  await app.listen(port);
}
bootstrap();

// import * as fs from 'fs';

// bootstrap().catch((err) => {
//   fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
//   process.exit(1);
// });

