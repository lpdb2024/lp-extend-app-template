import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './dependencies/logging.middleware';
import { FirestoreModule } from './firestore/firestore.module';
import { AuthService } from './Firebase/auth.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerModule } from 'nestjs-pino';
import * as admin from 'firebase-admin';

/* modules */
import { HelperModule } from './Controllers/HelperService/helper-service.module';
import { UsersModule } from './Controllers/users/users.module';
import { GoogleStorageModule } from './Controllers/GoogleStorage/googlestorage.module';
import { APIModule } from './Controllers/APIService/api.module';
import { LivePersonModule } from './Controllers/LivePerson/liveperson.module';
import { AuthModule } from './auth/auth.module';
import { AccountSettingsModule } from './Controllers/AccountSettings/account-settings.module';
import { LpExtendAuthModule } from './auth/lpextend-auth.module';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    // Parse Firebase service account from GOOGLE_SERVICE_ACCOUNT env variable (JSON string)
    const serviceAccountJson = configService.get<string>('GOOGLE_SERVICE_ACCOUNT');

    // Firebase is optional - return null if not configured
    if (!serviceAccountJson) {
      console.log('[Firebase] No GOOGLE_SERVICE_ACCOUNT configured - Firebase disabled');
      return null;
    }

    try {
      const firebaseConfig = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
      return admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
        storageBucket: `${firebaseConfig.projectId}.appspot.com`,
      });
    } catch (error) {
      console.error('[Firebase] Failed to parse GOOGLE_SERVICE_ACCOUNT:', error);
      return null;
    }
  },
};

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)', '/callback/(.*)'],
      serveRoot: '',
    }),
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    // }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            levelFirst: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,reqId,req,res',
            messageFormat:
              '{req.method} {req.url} {res.statusCode} {res.responseTime}ms {msg}',
            level: 'info',
            prettyPrint: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname,reqId',
            },
          },
        },
        autoLogging: true,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    FirestoreModule.forRoot({
      imports: [],
      providers: [firebaseProvider],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Parse service account from GOOGLE_SERVICE_ACCOUNT env variable
        const serviceAccountJson = configService.get<string>('GOOGLE_SERVICE_ACCOUNT');

        // Firestore is optional - return empty config if not configured
        if (!serviceAccountJson) {
          console.log('[Firestore] No GOOGLE_SERVICE_ACCOUNT configured - Firestore disabled');
          return {
            projectId: '',
            credentials: {},
          };
        }

        try {
          const serviceAccount = JSON.parse(serviceAccountJson);
          return {
            projectId: serviceAccount.project_id,
            credentials: serviceAccount,
          };
        } catch (error) {
          console.error('[Firestore] Failed to parse GOOGLE_SERVICE_ACCOUNT:', error);
          return {
            projectId: '',
            credentials: {},
          };
        }
      },
    }),

    HelperModule,
    APIModule,
    GoogleStorageModule,
    UsersModule,
    LivePersonModule,
    AuthModule,
    AccountSettingsModule,
    LpExtendAuthModule, // v2 API key-based auth for LP Extend shell integration
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // LpExtendAuthModule applies its own middleware via NestModule.configure()
    // All routes are protected by default via APP_GUARD
    // Use @Public() decorator to make routes public

    // Logging for all routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    console.log('AppModule configured with LpExtendAuth (v2 API key auth)');
  }
}
