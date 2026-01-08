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
import { PreAuthMiddleware } from 'src/auth/auth.middleware';
import { AuthService } from './Firebase/auth.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerModule } from 'nestjs-pino';
import * as admin from 'firebase-admin';

/* modules */
// import { CatsModule } from './Controllers/cats/cats.module';
import { AccountConfigModule } from './Controllers/AccountConfig/account-config.module';
import { AccountConfigController } from './Controllers/AccountConfig/account-config.controller';
import { HelperModule } from './Controllers/HelperService/helper-service.module';
import { UsersModule } from './Controllers/users/users.module';
import { UsersController } from './Controllers/users/users.controller';
import { GoogleStorageModule } from './Controllers/GoogleStorage/googlestorage.module';
import { GoogleStorageController } from './Controllers/GoogleStorage/googlestorage.controller';
import { MessagingModule } from './Controllers/Messaging/messaging.module';
import { CCIdpModule } from './Controllers/CCIDP/cc-idp.module';
import { LLMTaskModule } from './Controllers/LLMTaskController/llm-task.module';
import { CCAppMgtModule } from './Controllers/CCAppManagement/cc-app-manager.module';
import { CCAppMgtController } from './Controllers/CCAppManagement/cc-app-manager.controller';
import { ConnectorAPIModule } from './Controllers/ConnectorAPI/connector-api.module';
import { ConversationBuilderModule } from './Controllers/ConversationBuilder/cb.module';
import { ConversationBuilderController } from './Controllers/ConversationBuilder/cb.controller';
// import { ConversationCloudModule } from './Controllers/ConversationalCloud/conversation-cloud.module';
import { ConversationCloudController } from './Controllers/ConversationalCloud/conversation-cloud.controller';
// import { DevtoolsModule } from '@nestjs/devtools-integration';
import { AIStudioModule } from './Controllers/AIStudio/ai-studio.module';
import { APIModule } from './Controllers/APIService/api.module';
import { LivePersonModule } from './Controllers/LivePerson/liveperson.module';
import { AuthModule } from './auth/auth.module';
import { UserSettingsModule } from './Controllers/UserSettings/user-settings.module';
import { AccountSettingsModule } from './Controllers/AccountSettings/account-settings.module';
import { AIStudioController } from './Controllers/AIStudio/ai-studio.controller';

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
    AIStudioModule,
    ConversationBuilderModule,
    APIModule,
    ConnectorAPIModule,
    MessagingModule,
    AccountConfigModule,
    GoogleStorageModule,
    UsersModule,
    LLMTaskModule,
    CCIdpModule,
    CCAppMgtModule,
    LivePersonModule,
    AuthModule,
    UserSettingsModule,
    AccountSettingsModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PreAuthMiddleware)
      .exclude(
        {
          path: '/api/v1/connector_api/*',
          method: RequestMethod.ALL,
        },
        '*v1/connector_api/*',
      )
      .forRoutes(
        AccountConfigController,
        UsersController,
        GoogleStorageController,
        CCAppMgtController,
        ConversationBuilderController,
        ConversationCloudController,
        AIStudioController
        // AIStudioController handles its own auth - token passed directly to AI Studio APIs
      );

    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    console.log('AppModule configure');
  }
}
