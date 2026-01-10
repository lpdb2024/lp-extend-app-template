import {
  UsersDocument,
  CredentialsDocument,
} from 'src/Controllers/users/users.interfaces';

import { AccountSettingsDTO } from 'src/Controllers/AccountSettings/account-settings.dto';
import { LpToken } from 'src/Controllers/LivePerson/ConversationBuilder/cb.interfaces';

// Collection name constants
const APP_USERS_COLLECTION = 'app-users';
const LP_TOKENS_COLLECTION = 'lp-tokens';
const APP_SETTINGS_COLLECTION = 'app-settings';
const SERVICE_WORKERS_COLLECTION = 'service-workers';
const USER_SETTINGS_COLLECTION = 'user-settings';

export const FirestoreDatabaseProvider = 'firestoredb';
export const FirestoreOptionsProvider = 'firestoreOptions';
export const FirestoreCollectionProviders: string[] = [
  UsersDocument.collectionName,
  CredentialsDocument.collectionName,
  AccountSettingsDTO.collectionName,
  // App collections
  APP_USERS_COLLECTION,
  LP_TOKENS_COLLECTION,
  LpToken.collectionName, // 'lp_tokens' - used by ConversationBuilderService
  APP_SETTINGS_COLLECTION,
  SERVICE_WORKERS_COLLECTION,
  USER_SETTINGS_COLLECTION,
];
