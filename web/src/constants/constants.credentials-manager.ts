/**
 * Credentials Manager Constants
 */

import { V1 } from "./constants";

const getBase = (accountId: string) => `${V1}/credentials/${accountId}`;
const getCredential = (accountId: string, credentialId: string) =>
  `${getBase(accountId)}/${credentialId}`;

export const CREDENTIALS_ROUTES = {
  BASE: getBase,
  CREDENTIAL: getCredential,
  HEADERS: (accountId: string, credentialId: string) =>
    `${getCredential(accountId, credentialId)}/headers`,
  REFRESH: (accountId: string, credentialId: string) =>
    `${getCredential(accountId, credentialId)}/refresh`,
  AUTHORIZE: (accountId: string, credentialId: string) =>
    `${getCredential(accountId, credentialId)}/authorize`,
  AUTHORIZE_CALLBACK: (accountId: string, credentialId: string) =>
    `${getCredential(accountId, credentialId)}/authorize/callback`,
  TEST: (accountId: string, credentialId: string) =>
    `${getCredential(accountId, credentialId)}/test`,
};

export enum CREDENTIALS_ACTION_KEYS {
  // CRUD
  LIST_CREDENTIALS = "CREDENTIALS_LIST",
  GET_CREDENTIAL = "CREDENTIALS_GET",
  CREATE_CREDENTIAL = "CREDENTIALS_CREATE",
  UPDATE_CREDENTIAL = "CREDENTIALS_UPDATE",
  DELETE_CREDENTIAL = "CREDENTIALS_DELETE",
  // Auth
  GET_AUTH_HEADERS = "CREDENTIALS_GET_HEADERS",
  REFRESH_TOKEN = "CREDENTIALS_REFRESH",
  GET_AUTHORIZE_URL = "CREDENTIALS_GET_AUTHORIZE_URL",
  AUTHORIZE_CALLBACK = "CREDENTIALS_AUTHORIZE_CALLBACK",
  TEST_CREDENTIAL = "CREDENTIALS_TEST",
}
