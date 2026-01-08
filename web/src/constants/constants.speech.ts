import { V1 } from "./constants";

export const CONNECTOR_API_ROUTES = {
  BASE: (siteId: string) => `${V1}/connector-api/${siteId}/`,
  BATCH_REQUEST_SYNTHETIC_CONVERSATIONS: (siteId: string) =>
    `${CONNECTOR_API_ROUTES.BASE(siteId)}batch-request-synthetic-conversations`,
  AGENT_MESSAGE: (siteId: string) =>
    `${CONNECTOR_API_ROUTES.BASE(siteId)}agent-message`,
};

export enum SPEECH_ACTION_KEYS {
  LIST_COLLECTIONS = "LIST_COLLECTIONS",
  TEXT_TO_SPEECH = "TEXT_TO_SPEECH",
  LIST_VOICES = "LIST_VOICES",
  GET_AUDIO = "GET_AUDIO",
}
