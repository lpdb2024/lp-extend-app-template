import { V1 } from './constants'

// ============ API Builder API Routes ============
const API_BUILDER_BASE = `${V1}/api-builder`

export const API_BUILDER_ROUTES = {
  // Collections
  LIST_COLLECTIONS: (accountId: string) => `${API_BUILDER_BASE}/${accountId}/collections`,
  CREATE_COLLECTION: (accountId: string) => `${API_BUILDER_BASE}/${accountId}/collections`,
  COLLECTION: (accountId: string, collectionId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}`,
  DUPLICATE_COLLECTION: (accountId: string, collectionId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/duplicate`,
  IMPORT_COLLECTION: (accountId: string) => `${API_BUILDER_BASE}/${accountId}/collections/import`,
  EXPORT_COLLECTION: (accountId: string, collectionId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/export`,
  IMPORT_CURL: (accountId: string, collectionId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/import-curl`,
  // Folders
  CREATE_FOLDER: (accountId: string, collectionId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/folders`,
  DELETE_FOLDER: (accountId: string, collectionId: string, folderId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/folders/${folderId}`,
  // Requests
  CREATE_REQUEST: (accountId: string, collectionId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/requests`,
  UPDATE_REQUEST: (accountId: string, collectionId: string, requestId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/requests/${requestId}`,
  DELETE_REQUEST: (accountId: string, collectionId: string, requestId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/requests/${requestId}`,
  DUPLICATE_REQUEST: (accountId: string, collectionId: string, requestId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/requests/${requestId}/duplicate`,
  MOVE_ITEM: (accountId: string, collectionId: string, itemId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/items/${itemId}/move`,
  EXECUTE_REQUEST: (accountId: string, collectionId: string, requestId: string) => `${API_BUILDER_BASE}/${accountId}/collections/${collectionId}/requests/${requestId}/execute`,
  // Logs
  LIST_LOGS: (accountId: string) => `${API_BUILDER_BASE}/${accountId}/logs`,
  DELETE_LOG: (accountId: string, logId: string) => `${API_BUILDER_BASE}/${accountId}/logs/${logId}`,
}

// ============ API Builder Action Keys ============
export enum API_BUILDER_ACTION_KEYS {
  // Collections
  LIST_COLLECTIONS = 'API_BUILDER_LIST_COLLECTIONS',
  CREATE_COLLECTION = 'API_BUILDER_CREATE_COLLECTION',
  GET_COLLECTION = 'API_BUILDER_GET_COLLECTION',
  UPDATE_COLLECTION = 'API_BUILDER_UPDATE_COLLECTION',
  DELETE_COLLECTION = 'API_BUILDER_DELETE_COLLECTION',
  DUPLICATE_COLLECTION = 'API_BUILDER_DUPLICATE_COLLECTION',
  IMPORT_COLLECTION = 'API_BUILDER_IMPORT_COLLECTION',
  EXPORT_COLLECTION = 'API_BUILDER_EXPORT_COLLECTION',
  IMPORT_CURL = 'API_BUILDER_IMPORT_CURL',
  // Folders
  CREATE_FOLDER = 'API_BUILDER_CREATE_FOLDER',
  DELETE_FOLDER = 'API_BUILDER_DELETE_FOLDER',
  // Requests
  CREATE_REQUEST = 'API_BUILDER_CREATE_REQUEST',
  UPDATE_REQUEST = 'API_BUILDER_UPDATE_REQUEST',
  DELETE_REQUEST = 'API_BUILDER_DELETE_REQUEST',
  DUPLICATE_REQUEST = 'API_BUILDER_DUPLICATE_REQUEST',
  MOVE_ITEM = 'API_BUILDER_MOVE_ITEM',
  EXECUTE_REQUEST = 'API_BUILDER_EXECUTE_REQUEST',
  // Logs
  LIST_LOGS = 'API_BUILDER_LIST_LOGS',
  DELETE_LOG = 'API_BUILDER_DELETE_LOG',
}
