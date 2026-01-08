import { V1 } from './constants'

export const CONNECTOR_API_ROUTES = {
  BASE: (siteId: string) => `${V1}/connector-api/${siteId}/`,
  BATCH_REQUEST_SYNTHETIC_CONVERSATIONS: (siteId: string) => `${CONNECTOR_API_ROUTES.BASE(siteId)}batch-request-synthetic-conversations`,
  AGENT_MESSAGE: (siteId: string) => `${CONNECTOR_API_ROUTES.BASE(siteId)}agent-message`
}

export enum CONN_API_ACTION_KEYS {
  BATCH_REQUEST_CONVERSATIONS = 'BATCH_REQUEST_CONVERSATIONS',
  STOP_ALL_CONVERSATIONS = 'STOP_ALL_CONVERSATIONS',
  SEND_AGENT_MESSAGE = 'SEND_AGENT_MESSAGE',
}
