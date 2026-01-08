import {
  UsersDocument,
  CredentialsDocument,
} from 'src/Controllers/users/users.interfaces';
import { LpToken } from 'src/Controllers/CCIDP/cc-idp.interfaces';
import { AppUserDto } from 'src/Controllers/CCIDP/cc-idp.dto';

import {
  ServiceWorkerData,
  ApplicationSettingsDto,
  AppSettingsDTO,
  UserSettingsDTO,
} from 'src/Controllers/AccountConfig/account-config.dto';

import { AccountSettingsDTO } from 'src/Controllers/AccountSettings/account-settings.dto';

import { EncryptedApiKeyDto } from 'src/Controllers/CCAppManagement/cc-app-manager.interfaces.dto';


export const FirestoreDatabaseProvider = 'firestoredb';
export const FirestoreOptionsProvider = 'firestoreOptions';
export const FirestoreCollectionProviders: string[] = [
  UsersDocument.collectionName,
  CredentialsDocument.collectionName,
  LpToken.collectionName,
  AppUserDto.collectionName,
  ServiceWorkerData.collectionName,
  ApplicationSettingsDto.collectionName,
  AppSettingsDTO.collectionName,
  UserSettingsDTO.collectionName,
  EncryptedApiKeyDto.collectionName,
  // Account settings collection
  AccountSettingsDTO.collectionName,
];
