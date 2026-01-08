import { Module, DynamicModule } from '@nestjs/common';
import { Firestore, Settings } from '@google-cloud/firestore';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

const configService = new ConfigService();

import { DBService } from './firestore.service';
import {
  FirestoreDatabaseProvider,
  FirestoreOptionsProvider,
  FirestoreCollectionProviders,
} from './firestore.providers';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
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

  return admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    storageBucket: `${firebaseConfig.projectId}.appspot.com`,
  });
  }
}

type FirestoreModuleOptions = {
  imports: any[];
  useFactory: (...args: any[]) => Settings;
  inject: any[];
};

@Module({})
export class FirestoreModule {
  static forRoot(options: FirestoreModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: FirestoreOptionsProvider,
      useFactory: options.useFactory,
      inject: options.inject,
    };
    const dbProvider = {
      provide: FirestoreDatabaseProvider,
      useFactory: (config) => new Firestore(config),
      inject: [FirestoreOptionsProvider],
    };
    const collectionProviders = FirestoreCollectionProviders.map(
      (providerName) => ({
        provide: providerName,
        useFactory: (db) => db.collection(providerName),
        inject: [FirestoreDatabaseProvider],
      }),
    );
    return {
      global: true,
      module: FirestoreModule,
      imports: options.imports,
      providers: [optionsProvider, dbProvider, ...collectionProviders, DBService],
      exports: [dbProvider, ...collectionProviders, DBService],
    };
  }
}
