import { Module, DynamicModule } from '@nestjs/common';
import { Firestore, Settings } from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';


import { DBService } from './firestore.service';
import {
  FirestoreDatabaseProvider,
  FirestoreOptionsProvider,
  FirestoreCollectionProviders,
} from './firestore.providers';



type FirestoreModuleOptions = {
  imports: any[];
  providers: any[];
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
