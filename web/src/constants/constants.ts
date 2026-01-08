import type { AppEnvVar } from "src/interfaces";

export const APP_NAME = "Extend";

export const LE_BACKGROUND_URL =
  "https://lpcdn.lpsnmedia.net/le/apps/agent-workspace/1.51.0-release_1166406301/img/dark-theme-background.3175f99.png";

export enum APP_ENV {
  LOCAL = "local",
  QA = "QA",
  ALPHA = "Alpha",
  GCP_QA = "GCP_QA",
  GCP_ALPHA = "GCP_Alpha",
  GCP_PROD_AU = "GCP_Prod_AU",
  GCP_PROD_EU = "GCP_Prod_EU",
  GCP_PROD_US = "GCP_Prod_US",
}
export const FIREBASE_CONF = {
  DEV: {
    apiKey: process.env.FIREBASE_DEV_API_KEY,
    authDomain: process.env.FIREBASE_DEV_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_DEV_PROJECT_ID,
    storageBucket: process.env.FIREBASE_DEV_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_DEV_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_DEV_APP_ID,
    measurementId: process.env.FIREBASE_DEV_MEASUREMENT_ID,
  },
};
export const initConfig = (lpEnv: APP_ENV): AppEnvVar => {
  switch (lpEnv) {
    case APP_ENV.LOCAL:
      console.info(FIREBASE_CONF.DEV);
      return {
        env: APP_ENV.LOCAL,
        phase: "DEFAULT",
        datacenter: "sy",
        grid: "qa",
        firebase: FIREBASE_CONF.DEV,
      };
    default:
      return {
        env: APP_ENV.LOCAL,
        phase: "DEFAULT",
        datacenter: "sy",
        grid: "qa",
        firebase: FIREBASE_CONF.DEV,
      };
  }
};
export const HOST_MAP: Record<string, AppEnvVar> = {
  localhost: initConfig(APP_ENV.LOCAL),
  "127.0.0.1": initConfig(APP_ENV.LOCAL),
};
export const DEFAULT_APP_ENV = initConfig(APP_ENV.LOCAL);

export const APP_TRACE_ID = "X-Request-ID";

export enum ROLES {
  // basic user roles
  USER = "USER", // any user playing pre-made demo
  ADMIN = "ADMIN", // demo creator
  SUPER_ADMIN = "SUPER_ADMIN", // super admin
}

export const V1 = "api/v1";
export const V2 = "api/v2";

export const GOOGLE_LOCATIONS = {
  BUCKET: process.env.dev ? "lp-demo-builder" : "lp-demo-builder",
  FOLDER_GENERAL: "general",
  FOLDER_BRANDS: "brands",
};

export const GOOGLE_TYPES = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PLACE_NAME: "place-name" as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PLACE_ADDRESS: "place-address" as any,
};

export const redirect_uri = () => {
  return `${window.location.origin}/callback`;
};

export const API_ROUTES = {
  AGENT_ACTION: (siteId: string, conversationId: string) =>
    `${V1}/workflow-agent-function/${siteId}/${conversationId}`,
  AGENT_FAAS_ARGS: (siteId: string, conversationId: string) =>
    `${V1}/workflow-agent-populate/${siteId}/${conversationId}`,
  AGENT_FAAS_GENAI: (siteId: string, conversationId: string) =>
    `${V1}/workflow-faas-genai/${siteId}/${conversationId}`,
  AUTHENTICATE_APP: () => `${V1}/authenticate`,
  AUTHENTICATE_APP_BY_ID: (id: string) =>
    `${API_ROUTES.AUTHENTICATE_APP()}/${id}`,
  CALLBACK: () => `${V1}/callback`,
  CC_BASE: (siteId: string) => `${V1}/account/${siteId}`,
  DEMOS: (siteId: string) => `${V1}/demos/${siteId}`,
  DEMOS_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.DEMOS(siteId)}/${id}`,
  // DOMAINS: () => `${V1}/domains`,
  // DOMAINS_BY_ID: (id: string) => `${API_ROUTES.DOMAINS()}/${id}`,
  ENGAGEMENTS: (siteId: string) => `${V1}/account/${siteId}/engagements`,
  ENGAGEMENTS_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.ENGAGEMENTS(siteId)}/${id}`,
  FORMS: (siteId: string) => `${V1}/forms/${siteId}`,
  FORMS_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.FORMS(siteId)}/${id}`,
  FORMS_BY_ID_PUBLIC: (id: string) => `${V1}/form/${id}`,
  LOGIN: (siteId: string) => `${V1}/login/${siteId}`,
  IDP: (siteId: string) => `${V1}/idp/${siteId}`,
  DOMAINS_BY_ID: (siteId: string) => `${API_ROUTES.IDP(siteId)}/domains`,
  LOGIN_URL: (siteId: string) => `${API_ROUTES.IDP(siteId)}/login-url`,
  TOKEN: (siteId: string) => `${API_ROUTES.IDP(siteId)}/token`,
  CB_TOKEN: (siteId: string) =>
    `${API_ROUTES.IDP(siteId)}/authenticate-conv-builder`,
  PROACTIVE_APP_JWT: (siteId: string) =>
    `api/v2/proactive-messaging/${siteId}/app-jwt`,
  LOGOUT: (siteId: string) => `${V1}/logout/${siteId}`,
  MANAGER_BOT: (siteId: string) => `${V1}/manager-bot/${siteId}`,
  MANAGER_BOT_POLICIES: (siteId: string) =>
    `${API_ROUTES.MANAGER_BOT(siteId)}/policies`,
  MANAGER_BOT_POLICY_DESCRIPTION: (siteId: string, policyId: string) =>
    `${API_ROUTES.MANAGER_BOT(siteId)}/policies/${policyId}/description`,
  MANAGER_BOT_POLICIES_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.MANAGER_BOT_POLICIES(siteId)}/${id}`,
  MANAGER_BOT_EVENTS: (siteId: string, fromTime: number, toTime: number) =>
    `${API_ROUTES.MANAGER_BOT(
      siteId
    )}/events?from_time=${fromTime}&to_time=${toTime}`,
  CONTROL_TOWER: (siteId: string) => `${V1}/control-tower/${siteId}`,
  CONTROL_TOWER_EVENTS: (siteId: string) =>
    `${API_ROUTES.CONTROL_TOWER(siteId)}/events`,
  WS_CONTROL_TOWER: (siteId: string) => `wss://${V1}/control-tower/${siteId}`,
  // WS_CONTROL_TOWER: (siteId: string) => `wss://127.0.0.1:3001/${V1}/control-tower/${siteId}`,
  SSO_LOGIN: (siteId: string) => `${V1}/sso/login/${siteId}`,
  SSO_LOGOUT: (siteId: string) => `${V1}/sso/logout/${siteId}`,
  SKILLS: (siteId: string) => `${V1}/skills/${siteId}`,
  STORAGE_FILE_RESOURCES: (siteId: string) =>
    `${API_ROUTES.CC_BASE(siteId)}/storage/resources`,
  STORAGE_FILES: (siteId: string) => `${API_ROUTES.CC_BASE(siteId)}/storage`,
  STORAGE_FILES_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.STORAGE_FILES(siteId)}/${id}`,
  UPLOAD_IMAGE_URL: () => `${V1}/upload-image-url`,
  USERS: (siteId: string) => `${API_ROUTES.CC_BASE(siteId)}/users`,
  USERS_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.CC_BASE(siteId)}/users/${id}`,
  USERS_DETAILS: (siteId: string) => `${API_ROUTES.USERS(siteId)}_details`,
  USERS_SELF: (siteId: string) => `${API_ROUTES.CC_BASE(siteId)}/users/self`,
  USERS_CSS_CREDENTIALS: (siteId: string) =>
    `${API_ROUTES.AUTHENTICATE_APP()}/${siteId}/ccs`,
  WINDOWS: (siteId: string) => `${V1}/account/${siteId}/windows`,
  WINDOWS_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.WINDOWS(siteId)}/${id}`,
  PROACTIVE_BASE: (siteId: string) => `${V1}/account/${siteId}/proactive`,
  PROACTIVE_HANDOFFS: (siteId: string) =>
    `${API_ROUTES.PROACTIVE_BASE(siteId)}/handoffs`,
  PROACTIVE_CONFIG: (siteId: string) =>
    `${API_ROUTES.PROACTIVE_BASE(siteId)}/config`,
  PROACTIVE_AUTHENTICATE: (siteId: string) =>
    `${V1}/account/${siteId}/proactive/authenticate`,
  POST_PROACTIVE: (siteId: string) =>
    `${API_ROUTES.PROACTIVE_BASE(siteId)}/send`,
  WORKFLOW_EVENTS: (siteId: string, conversationId: string) =>
    `${V1}/workflow-events/${siteId}/${conversationId}`,
  UPDATE_WORKFLOW_EVENT: (siteId: string, workflowId: string) =>
    `${V1}/workflow-events/${siteId}/workflow_id/${workflowId}`,
  WORKFLOW_EVENTS_READ: (siteId: string, conversationId: string) =>
    `${API_ROUTES.WORKFLOW_EVENTS(siteId, conversationId)}/read`,
  WORKFLOWS: (siteId: string) => `${V1}/workflows/${siteId}`,
  WORKFLOWS_BY_ID: (siteId: string, id: string) =>
    `${API_ROUTES.WORKFLOWS(siteId)}/${id}`,
  WEBVIEW_COMMAND: (siteId: string, conversationId: string) =>
    `${V1}/lp-connector/${siteId}/${conversationId}/command`,
  CONFIRM_INSTALL: (siteId: string) =>
    `${V1}/lp-connector/${siteId}/confirm-install`,
  CONVERSATION_TAGS: (siteId: string, conversationId: string) =>
    `${V1}/tags/${siteId}/${conversationId}`,
};

export const MESSAGING_ROUTES = {
  BASE: (siteId: string) => `${V1}/messaging/${siteId}`,
  UMS: (domain: string, siteId: string) =>
    `wss://${domain}/ws_api/account/${siteId}/messaging/consumer?v=3`,
  BRAND_UMS: (domain: string, siteId: string, token: string) =>
    `wss://${domain}/ws_api/account/${siteId}/messaging/brand/${token}?v=2.1&integrationVersion=3.7.0`,
  DOMAINS: (siteId: string) => `${MESSAGING_ROUTES.BASE(siteId)}/domains`,
  CONNECTORS: (siteId: string) => `${MESSAGING_ROUTES.BASE(siteId)}/connectors`,
  CONNECTORS_BY_ID: (siteId: string, id: string) =>
    `${MESSAGING_ROUTES.BASE(siteId)}/connectors/${id}`,
  IDP: (siteId: string) => `${MESSAGING_ROUTES.BASE(siteId)}/idp`,
  CONSUMER_JWS: (siteId: string) =>
    `${MESSAGING_ROUTES.BASE(siteId)}/consumer-jws`,
  CONSUMER_JWT: (siteId: string) =>
    `${MESSAGING_ROUTES.BASE(siteId)}/consumer-jwt`,
  AUTHORIZE: (siteId: string) => `${MESSAGING_ROUTES.BASE(siteId)}/authorize`,
  USERS: (siteId: string) => `${MESSAGING_ROUTES.BASE(siteId)}/users`,
  UPLOAD_FILE: (siteId: string) =>
    `${MESSAGING_ROUTES.BASE(siteId)}/upload-file`,
};

export const PROMPT_ROUTES = {
  BASE: (siteId: string) => `${V1}/prompts/${siteId}`,
  PROMPT: (siteId: string, id: string) => `${PROMPT_ROUTES.BASE(siteId)}/${id}`,
  PROCESS_PROMPT: (siteId: string) => `${PROMPT_ROUTES.BASE(siteId)}/request`,
};

// @conv_gen_router.post("/conv-gen/{site_id}/verticals")
export const CONV_GEN_ROUTES = {
  BASE: (siteId: string) => `${V1}/conv-gen/${siteId}`,
  VERTICALS: (siteId: string) => `${CONV_GEN_ROUTES.BASE(siteId)}/verticals`,
  TOGGLE_VERTICAL: (siteId: string, id: string) =>
    `${CONV_GEN_ROUTES.VERTICALS(siteId)}/${id}/state`,
  TOGGLE_INTENT: (siteId: string, verticalId: string, intentId: string) =>
    `${CONV_GEN_ROUTES.VERTICAL(siteId, verticalId)}/intents/${intentId}/state`,
  UPDATE_INTENT: (siteId: string, verticalId: string, intentId: string) =>
    `${CONV_GEN_ROUTES.VERTICAL(siteId, verticalId)}/intents/${intentId}`,
  CONVERSATIONS: (siteId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversations`,
  SAVE_CONVERSATION: (siteId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversation`,
  GET_CONVERSATIONS: (siteId: string, verticalId: string, intentId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversations/${verticalId}/${intentId}`,
  VERTICAL: (siteId: string, id: string) =>
    `${CONV_GEN_ROUTES.VERTICALS(siteId)}/${id}`,
  VERTICAL_CONVERSATIONS: (
    siteId: string,
    verticalId: string,
    intentId: string
  ) =>
    `${CONV_GEN_ROUTES.VERTICAL(siteId, verticalId)}/conversations/${intentId}`,
  // // // @conv_gen_router.post("/conv-gen/{site_id}/conversations-random")
  CONVERSATIONS_RANDOM: (siteId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversations-random`,
  CONVERSATIONS_STATUS: (siteId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversations/status`,
  CONVERSATIONS_STATUS_ID: (siteId: string, reqId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversations/status/${reqId}`,
  STOP_CONVERSATIONS_CREATION: (siteId: string, reqId: string) =>
    `${CONV_GEN_ROUTES.BASE(siteId)}/conversations/stop/${reqId}`,
};

export const CONV_CLOUD_ROUTES1 = {
  BASE: (siteId: string) => `${V1}/conversational-cloud/${siteId}/`,
  CAMPAIGNS: (siteId: string) => `${V1}/campaigns/${siteId}`,
  CAMPAIGNS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES1.CAMPAIGNS(siteId)}/${id}`,
  ACCOUNT_CONFIG: (siteId: string) => `${V1}/account-configuration/${siteId}`,
  CCS_BASE: (siteId: string) => `${V1}/ccs/${siteId}`,
  CCS_NAMESPACES: (siteId: string) =>
    `${CONV_CLOUD_ROUTES1.CCS_BASE(siteId)}/namespaces`,
  FAAS_FUNCTIONS: (siteId: string) => `${V1}/faas/${siteId}`,
  FAAS_FUNCTIONS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES1.FAAS_FUNCTIONS(siteId)}/${id}`,
  KNOWLEDGE_ARTICLES: (siteId: string, id: string) =>
    `${V1}/knowledge-articles/${siteId}/${id}`,
  KNOWLEDGE_SEARCH: (siteId: string, kbId: string) =>
    `${V1}/knowledge-search/${siteId}/${kbId}`,
  SKILLS: (siteId: string) => `${V1}/skills/${siteId}`,
  SKILLS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES1.SKILLS(siteId)}/${id}`,
  USERS: (siteId: string) => `${V1}/users/${siteId}`,
  USERS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES1.USERS(siteId)}/${id}`,
  ENGAGEMENTS: (siteId: string) => `${V1}/engagements/${siteId}`,
  ENGAGEMENTS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES1.ENGAGEMENTS(siteId)}/${id}`,
  WEBVIEW: (siteId: string) => `${V1}/webview/${siteId}`,
  BOT_LOGS: (siteId: string, id: string) => `${V1}/bot-logs/${siteId}/${id}`,
  CONVERSATION_BY_ID: (siteId: string, id: string) =>
    `${V1}/conversations/${siteId}/${id}`,
};

export const CONV_CLOUD_ROUTES = {
  BASE: (siteId: string) => `${V1}/conversational-cloud/${siteId}/`,
  // @conversational_cloud_router.post("/conversational-cloud/{site_id}/agent-view")
  AGENT_VIEW: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}agent-view`,
  AGENT_STATS: (siteId: string, agentId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}agent-stats/${agentId}`,
  // @conversational_cloud_router.post("/conversational-cloud/{site_id}/agent-metrics")
  AGENT_METRICS: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}agent-metrics`,
  APP_KEYS: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}app-key`,
  CAMPAIGNS: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}campaigns`,
  CAMPAIGNS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.CAMPAIGNS(siteId)}/${id}`,
  DEFAULT_PROMPT: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}default-prompt`,
  ACCOUNT_CONFIG: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}account-configuration`,
  CANNED_RESPONSES: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}canned-responses`,
  // @conversational_cloud_router.put("/conversational-cloud/{site_id}/canned-responses/{canned_response_id}")
  CANNED_RESPONSES_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.CANNED_RESPONSES(siteId)}/${id}`,
  CCS_BASE: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}ccs`,
  CCS_NAMESPACES: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.CCS_BASE(siteId)}/namespaces`,
  DOMAINS: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}domains`,
  FAAS_FUNCTIONS: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}faas`,
  FAAS_FUNCTIONS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.FAAS_FUNCTIONS(siteId)}/${id}`,
  // @conversational_cloud_router.get("/conversational-cloud/{site_id}/current-queue-health")
  QUEUE_HEALTH: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}current-queue-health`,
  SKILLS: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}skills`,
  SKILLS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.SKILLS(siteId)}/${id}`,
  USERS: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}users`,
  USERS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.USERS(siteId)}/${id}`,
  ENGAGEMENTS: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}engagements`,
  ENGAGEMENTS_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.ENGAGEMENTS(siteId)}/${id}`,
  ENGAGEMENT: (siteId: string, campaignId: string, engId: string) =>
    `${CONV_CLOUD_ROUTES.CAMPAIGNS(siteId)}/${campaignId}/engagements/${engId}`,
  WEBVIEW: (siteId: string) => `${CONV_CLOUD_ROUTES.BASE(siteId)}webview`,
  BOT_LOGS: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}bot-logs/${id}`,
  CONVERSATION_BY_ID: (siteId: string, id: string) =>
    `${V1}/conversations/${siteId}/${id}`,
  // @conversational_cloud_router.post("/conversational-cloud/{site_id}/messaging-interactions")
  CONVERSATIONS: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}messaging-interactions`,
  CONVERSATION: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}messaging-interactions/${id}`,
  // https://sy.smmsghistproxy.liveperson.net/messaging_history/api/account/31487986/conversations/conversation/search?v=2&source=ccuiNAWConsInfoSubscr&offset=0&limit=50&NC=true&__d=68881
  CONVERSATION_PROXY: (siteId: string, conversationId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(
      siteId
    )}messaging-interactions-proxy/${conversationId}`,
  // @conversational_cloud_router.post("/conversational-cloud/{site_id}/process-conversations")
  PROCESS_CONVERSATIONS: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}process-conversations`,
  // @conversational_cloud_router.get("/conversational-cloud/{site_id}/automatic-messages")
  AUTOMATIC_MESSAGES: (siteId: string) =>
    `${CONV_CLOUD_ROUTES.BASE(siteId)}automatic-messages`,
  // @conversational_cloud_router.get("/conversational-cloud/{site_id}/automatic-messages/{message_id}")
  AUTOMATIC_MESSAGES_BY_ID: (siteId: string, id: string) =>
    `${CONV_CLOUD_ROUTES.AUTOMATIC_MESSAGES(siteId)}/${id}`,
};

export const TEXT_SPEECH_ROUTES = {
  BASE: (siteId: string) => `${V1}/speech/${siteId}`,
  TEXT_TO_SPEECH: (siteId: string) =>
    `${TEXT_SPEECH_ROUTES.BASE(siteId)}/text-to-speech`,
  VOICES: (siteId: string) => `${TEXT_SPEECH_ROUTES.BASE(siteId)}/voices`,
  COLLECTIONS: (siteId: string) =>
    `${TEXT_SPEECH_ROUTES.BASE(siteId)}/collections`,
  TEXT_TO_SPEECH_BY_VOICE: (siteId: string, voiceId: string) =>
    `${TEXT_SPEECH_ROUTES.BASE(siteId)}/voices/${voiceId}/text-to-speech`,
};

export const GOOGLE_CLOUD_ROUTES = {
  base: (siteId: string) => `${V1}/google-storage/${siteId}`,
  ASSETS: () => `${V1}/google-storage/app-assets`,
  STORAGE_FILES: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/storage`,
  BRAND: (accountId: string) => `${GOOGLE_CLOUD_ROUTES.base(accountId)}/brand`,
  ALL_FILES: (siteId: string) => `${GOOGLE_CLOUD_ROUTES.base(siteId)}/all`,
  APP_RESOURCES: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/app-resources`,
  IMAGE: (siteId: string) => `${GOOGLE_CLOUD_ROUTES.base(siteId)}/images`,
  IMAGE_URL: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/image-url`,
  IMAGE_SEARCH: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/search`,
  WEB_SEARCH: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/search-google-web`,
  IMAGE_BASE64: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/image-base64`,
  STORAGE_BASE64: (siteId: string) =>
    `${GOOGLE_CLOUD_ROUTES.base(siteId)}/storage-base64`,
};

export const USER_ROUTES = {
  SELF: (siteId: string) => `${V1}/users/${siteId}/self`,
  USERS: (siteId: string) => `${V1}/users/${siteId}`,
  CREDENTIALS: (siteId: string) => `${V1}/users/${siteId}/credentials`,
};

export enum ACTION_KEYS {
  APP_SETTINGS_UPDATE = "APP_SETTINGS_UPDATE",
  APP_SETTINGS_GET = "APP_SETTINGS_GET",
  USER_SETTINGS_GET = "USER_SETTINGS_GET",
  USER_SETTINGS_UPDATE = "USER_SETTINGS_UPDATE",
  SIMULATOR_RUN_TASK = "SIMULATOR_RUN_TASK",
  VERTICALS_GET = "VERTICALS_GET",
  PERSONAS_TEMPLATES = "PERSONAS_TEMPLATES",
  PERSONAS_GET = "PERSONAS_GET",
  PERSONAS_CREATE = "PERSONAS_CREATE",
  PERSONAS_UPDATE = "PERSONAS_UPDATE",
  PERSONAS_DELETE = "PERSONAS_DELETE",
  PERSONAS_GET_ALL = "PERSONAS_GET_ALL",
  PERSONAS_GET_BY_ID = "PERSONAS_GET_BY_ID",
  SCENARIOS_TEMPLATES = "SCENARIOS_TEMPLATES",
  SCENARIOS_GET = "SCENARIOS_GET",
  SCENARIOS_CREATE = "SCENARIOS_CREATE",
  SCENARIOS_UPDATE = "SCENARIOS_UPDATE",
  SCENARIOS_DELETE = "SCENARIOS_DELETE",
  SCENARIOS_GET_ALL = "SCENARIOS_GET_ALL",
  TASK_STATUS = "TASK_STATUS",
  TASK_RUN = "TASK_RUN",
  CONVERSATIONS_DELETE = "CONVERSATIONS_DELETE",
  CONVERSATIONS_GET_ALL = "CONVERSATIONS_GET_ALL",
  CONVERSATIONS_CREATE = "CONVERSATIONS_CREATE",
  CONVERSATIONS_UPDATE = "CONVERSATIONS_UPDATE",
  GET_SLIDE_THEMES = "GET_SLIDE_THEMES",
  SAVE_SLIDE_THEME = "SAVE_SLIDE_THEME",
  SEND_PROACTIVE = "SEND_PROACTIVE",
  GET_PROACTIVE_APP_JWT = "GET_PROACTIVE_APP_JWT",
  SAVE_PROACTIVE_CONFIGURATION = "SAVE_PROACTIVE_CONFIGURATION",
  GET_PROACTIVE_CONFIGURATION = "GET_PROACTIVE_CONFIGURATION",
  GET_PROACTIVE_CONFIGURATIONS = "GET_PROACTIVE_CONFIGURATIONS",
  DELETE_PROACTIVE_CONFIGURATION = "DELETE_PROACTIVE_CONFIGURATION",
  GET_CREDENTIALS = "GET_CREDENTIALS",
  SAVE_CREDENTIALS = "SAVE_CREDENTIALS",
  GET_DEMO_BY_ID = "GET_DEMO_BY_ID",
  REMOVE_DEMO = "REMOVE_DEMO",
  GET_DEMOS = "GET_DEMOS",
  SAVE_DEMO = "SAVE_DEMO",
  SEARCH_KB = "SEARCH_KB",
  GET_KBS = "GET_KBS",
  GET_KB_ARTICLES = "GET_KB_ARTICLES",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_CCS = "LOGIN_CCS",
  SSO_LOGIN = "SSO_LOGIN",
  SSO_LOGOUT = "SSO_LOGOUT",
  GET_DOMAINS = "GET_DOMAINS",
  REQUEST_AUTH = "REQUEST_AUTH",
  REQUEST_AUTH_CB = "REQUEST_AUTH_CB",
  CREATE_USER = "CREATE_USER",
  GET_USER_DATA = "GET_USER_DATA",
  SET_USER_DATA = "SET_USER_DATA",
  GET_PROMPTS = "GET_PROMPTS",
  GET_PROMPT = "GET_PROMPT",
  CREATE_PROMPT = "CREATE_PROMPT",
  UPDATE_PROMPT = "UPDATE_PROMPT",
  DELETE_PROMPT = "DELETE_PROMPT",
  PROCESS_PROMPT = "PROCESS_PROMPT",
  GET_CAMPAIGNS = "GET_CAMPAIGNS",
  GET_CAMPAIGN_BY_ID = "GET_CAMPAIGN_BY_ID",
  DELETE_CAMPAIGN = "DELETE_CAMPAIGN",
  GET_CANNED_RESPONSES = "GET_CANNED_RESPONSES",
  GET_IMAGE = "GET_IMAGE",
  UPLOAD_IMAGE_URL = "UPLOAD_IMAGE_URL",
  GET_DEMO = "GET_DEMO",
  CREATE_DEMO = "CREATE_DEMO",
  DELETE_DEMO = "DELETE_DEMO",
  UPDATE_DEMO = "UPDATE_DEALERSHIP_RECORD",
  GET_STORAGE_FILES = "GET_STORAGE_FILES",
  GET_STORAGE_ASSETS = "GET_STORAGE_ASSETS",
  ADD_STORAGE_FILE = "ADD_STORAGE_FILE",
  DELETE_STORAGE_FILE = "DELETE_STORAGE_FILE",
  CREATE_WINDOW = "CREATE_WINDOW",
  GET_WINDOW = "GET_WINDOW",
  UPDATE_WINDOW = "UPDATE_WINDOW",
  DELETE_WINDOW = "DELETE_WINDOW",
  GET_ENGAGEMENTS = "GET_ENGAGEMENTS",
  GET_ENGAGEMENT = "GET_ENGAGEMENT",
  CREATE_ENGAGEMENT = "CREATE_ENGAGEMENT",
  UPDATE_ENGAGEMENT = "UPDATE_ENGAGEMENT",
  DELETE_ENGAGEMENT = "DELETE_ENGAGEMENT",
  GET_UNAUTH_IDP = "GET_UNAUTH_IDP",
  GET_SKILLS = "GET_SKILLS",
  GET_SKILL = "GET_SKILL",
  CREATE_SKILL = "CREATE_SKILL",
  UPDATE_SKILL = "UPDATE_SKILL",
  GET_USERS = "GET_USERS",
  GET_CONNECTORS = "GET_CONNECTORS",
  AUTHENTICATE_CONNECTOR = "AUTHENTICATE_CONNECTOR",
  AUTHORIZE_CONNECTOR = "AUTHORIZE_CONNECTOR",
  GET_PROACTIVE_CONFIG = "GET_PROACTIVE_CONFIG",
  GET_PROACTIVE_HANDOFFS = "GET_PROACTIVE_HANDOFFS",
  AUTHENTICATE_PROACTIVE = "AUTHENTICATE_PROACTIVE",
  GET_PROACTIVE_CONFIGS = "GET_PROACTIVE_CONFIGS",
  POST_PROACTIVE = "POST_PROACTIVE",
  GET_FORMS = "GET_FORMS",
  GET_FORM = "GET_FORM",
  GET_FORM_BY_ID = "GET_FORM_BY_ID",
  CREATE_FORM = "CREATE_FORM",
  UPDATE_FORM = "UPDATE_FORM",
  DELETE_FORM = "DELETE_FORM",
  SEND_WEBVIEW = "SEND_WEBVIEW",
  GET_CCS_NAMESPACES = "GET_CCS_NAMESPACES",
  CREATE_CCS_NAMESPACE = "CREATE_CCS_NAMESPACE",
  // Manager Bot Policies
  GET_POLICIES = "GET_POLICIES",
  CREATE_POLICY = "CREATE_POLICY",
  UPDATE_POLICY = "UPDATE_POLICY",
  DELETE_POLICY = "DELETE_POLICY",
  ADD_MANAGER_BOT = "ADD_MANAGER_BOT",
  GET_MANAGER_BOT = "GET_MANAGER_BOT",
  DELETE_MANAGER_BOT = "DELETE_MANAGER_BOT",
  UPDATE_MANAGER_BOT = "UPDATE_MANAGER_BOT",
  ADD_POLICY = "ADD_POLICY",
  GET_POLICY = "GET_POLICY",
  REMOVE_POLICY = "REMOVE_POLICY",
  GET_FAAS_FUNCTIONS = "GET_FAAS_FUNCTIONS",
  GET_MANAGER_BOT_EVENTS = "GET_MANAGER_BOT_EVENTS",
  ADD_MANAGER_BOT_EVENT = "ADD_MANAGER_BOT_EVENT",
  CONTROL_TOWER_EVENTS = "CONTROL_TOWER_EVENTS",
  GET_WORKFLOWS_EVENTS = "GET_WORKFLOWS_EVENTS",
  GET_BOT_LOGS = "GET_BOT_LOGS",
  GET_CONVERSATION_BY_ID = "GET_CONVERSATION_BY_ID",
  GET_WORKFLOWS = "GET_WORKFLOWS",
  ADD_WORKFLOW = "ADD_WORKFLOW",
  GET_WORKFLOW = "GET_WORKFLOW",
  UPDATE_WORKFLOW = "UPDATE_WORKFLOW",
  DELETE_WORKFLOW = "DELETE_WORKFLOW",
  INVOKE_FAAS = "INVOKE_FAAS",
  WEBVIEW_COMMAND = "WEBVIEW_COMMAND",
  GET_CONVERSATION_TAGS = "GET_CONVERSATION_TAGS",
  ADD_CONVERSATION_TAGS = "ADD_CONVERSATION_TAG",
  DELETE_CONVERSATION_TAGS = "DELETE_CONVERSATION_TAG",
  GET_POLICY_SUGGESTIONS = "GET_POLICY_SUGGESTIONS",
  GET_ACCOUNT_CONFIG = "GET_ACCOUNT_CONFIG",
  POST_AGENT_ACTION = "POST_AGENT_ACTION",
  POPULATE_FAAS_ARGS = "POPULATE_FAAS_ARGS",
  EXPLAIN_FAAS_RESULT = "EXPLAIN_FAAS_RESULT",
  CONFIRM_INSTALL = "CONFIRM_INSTALL",
  REMOVE_WINDOW_CONFIG = "REMOVE_WINDOW_CONFIG",
  ADD_WINDOW_CONFIG = "ADD_WINDOW_CONFIG",
  GET_WINDOW_CONFIG = "GET_WINDOW_CONFIG",
  GET_WINDOW_CONFIGS = "GET_WINDOW_CONFIGS",
  GET_ALL_THEMES = "GET_ALL_THEMES",
  ADD_THEME = "ADD_THEME",
}

export enum GOOGLE_ACTION_KEYS {
  SEARCH_GOOGLE_WEB = "SEARCH_GOOGLE_WEB",
  SEARCH_GOOGLE_IMAGES = "SEARCH_GOOGLE_IMAGES",
  STORAGE_REMOVE_IMAGE = "STORAGE_REMOVE_IMAGE",
  DEMO_FILES_GET = "DEMO_FILES_GET",
  STORAGE_ADD_IMAGE = "STORAGE_ADD_IMAGE",
  STORAGE_GET_IMAGE = "STORAGE_GET_IMAGE",
  STORAGE_GET_IMAGES = "STORAGE_GET_IMAGES",
  STORAGE_DELETE_IMAGE = "STORAGE_DELETE_IMAGE",
  STORAGE_DELETE_IMAGES = "STORAGE_DELETE_IMAGES",
  GET_STORAGE_FILES = "GET_STORAGE_FILES",
  STORAGE_ADD_IMAGE_BASE64 = "STORAGE_ADD_IMAGE_BASE64",
}

export enum ACTION_KEYS_CONV_GEN {
  CREATE_CONVERSATIONS = "CREATE_CONVERSATIONS",
  TOGGLE_VERTICAL = "TOGGLE_VERTICAL",
  TOGGLE_INTENT = "TOGGLE_INTENT",
  CREATE_RANDOM_CONVERSATIONS = "CREATE_RANDOM_CONVERSATIONS",
  GET_CREATION_STATUS = "GET_CREATION_STATUS",
  STOP_CREATION = "STOP_CREATION",
  GET_CONVERSATIONS = "GET_CONVERSATIONS",
  CREATE_VERTICAL = "CREATE_VERTICAL",
  GET_VERTICAL = "GET_VERTICAL",
  GET_VERTICALS = "GET_VERTICALS",
  UPDATE_VERTICAL = "UPDATE_VERTICAL",
  DELETE_VERTICAL = "DELETE_VERTICAL",
  CREATE_INTENT = "CREATE_INTENT",
  GET_INTENTS = "GET_INTENTS",
  GET_INTENT = "GET_INTENT",
  UPDATE_INTENT = "UPDATE_INTENT",
  DELETE_INTENT = "DELETE_INTENT",
  SAVE_SAMPLE_CONVERSATION = "SAVE_SAMPLE_CONVERSATION",
  GET_ALL_CONVERSATIONS = "GET_ALL_CONVERSATIONS",
  CONFIRM_INSTALL = "CONFIRM_INSTALL",
}

export enum ACTION_KEYS_MESSAGING {
  GET_UNAUTH_TOKEN = "GET_UNAUTH_TOKEN",
  GET_USERS = "GET_USERS",
  GET_DOMAINS = "GET_DOMAINS",
  GET_CONNECTORS = "GET_CONNECTORS",
  GET_CONNECTOR = "GET_CONNECTOR",
  AUTH_IDP = "AUTH_IDP",
  AUTHORIZE_JWT = "AUTHORIZE_JWT",
  UPLOAD_FILE = "UPLOAD_FILE",
}

export enum PERMISSIONS {
  DEMO_BUILDER = "DEMO_BUILDER",
  DEMO_PLAYER = "DEMO_PLAYER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export const ROLES_PRIVILEGED = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const TITLE_SUFFIX = "Solutions Toolkit";

export enum ROUTE_NAMES {
  ADMINISTRATION = "admin",
  BACKUP_DEPLOY = "backup-deploy",
  AGENT_WORKSPACE = "agent-workspace",
  LOGOUT = "logout",
  BRANDKIT = "brandkit",
  CONVERSATION_MANAGER = "conversation-manager",
  CANVAS = "canvas",
  APPS = "apps",
  CALLBACK = "callback",
  CONTROL_TOWER_PARENT = "control-tower-parent",
  CONTROL_TOWER = "control-tower",
  CONTROL_TOWER_LANDING = "control-tower-landing",
  CONTROL_TOWER_POLICY = "control-tower-policy",
  CONTROL_TOWER_EVENTS = "control-tower-events",
  CONVERSATION_GENERATOR = "conversation-generator",
  CONVERSATION_TESTER = "c-tester",
  SITE_SETTINGS = "site-settings",
  CONVERSATION_DEBUGGER = "conversation-debugger",
  CONV_CLOUD_CONFIG = "conversational-cloud-config",
  CONTEXT_SERVICE = "context-service",
  DEMO_BUILDER_PARENT = "demo-builder-parent",
  DEMO_BUILDER_LANDING = "demo-builder-landing",
  DEMO_BUILDER = "demo-builder",
  DEMO_BUILDER_BY_ID = "demo-builder-by-id",
  DEMO_BUILDER_BY_ID_QUICK_START = "demo-builder-by-id-quick-start",
  DEMO_BUILDER_BY_ID_SVG = "demo-builder-by-id-svg",
  DEMO_BUILDER_BY_ID_SNAP = "demo-builder-by-id-snap",
  DEMO_PLAYER = "liveperson-presentation-home",
  DEMO_PLAYER_BY_ID = "liveperson-presentation",
  FILE_MANAGER = "file-manager",
  FORM_BUILDER = "form-builder",
  APP = "app",
  INDEX = "index",
  KB_WIDGET = "kb-widget",
  LOGIN = "login",
  QR_CODE_GENERATOR = "qr-code-generator",
  MANAGER_BOT = "manager-bot",
  PROACTIVE_BUILDER = "proactive-builder",
  QR_BUILDER = "qr-builder",
  SKILL_ROUTING = "skill-routing",
  RFPRESPONDER = "rfpresponder",
  SOLUTIONS_TOOLKIT = "solutions-toolkit",
  SOLUTIONS_TOOLKIT_NO_ACC = "solutions-toolkit-no-acc",
  LP_FORM = "lp-form",
  WORKFLOWS = "workflows",
  AGENT_TOOLKIT = "agent-toolkit",
  AGENT_WORKFLOW = "agent-workflow",
  DEMONSTRATION = "demonstration",
  DEMONSTRATION_CONTROLLER = "demonstration-controller",
  DEMONSTRATION_PARENT = "demonstration-parent",
  SOLUTIONS_STUDIO = "solutions-studio",
  WINDOW_EDITOR = "window-editor",
  SYNTHETIC_CUSTOMERS = "synthetic-customers",
  ACCOUNT_SETUP = "account-setup",
  EXTERNAL_APP = "external-app",
  API_EXPLORER = "api-explorer",
  WFM_DASHBOARD = "wfm-dashboard",
  AI_STUDIO_HELPER = "ai-studio-helper",
  COMMAND_CENTER = "command-center",
  ACCOUNT_FEATURES = "account-features",
  MCP_EXPLORER = "mcp-explorer",
  QA_ASSESSMENT = "qa-assessment",
  CONVERSATION_DESIGNER = "conversation-designer",
  AGENT_LIBRARY = "agent-library",
  ROUTES_LIBRARY = "routes-library",
  TRANSCRIPT_ANALYZER = "transcript-analyzer",
  KB_OPTIMIZER = "kb-optimizer",
  GLOBAL_VARIABLES = "global-variables",
  API_BUILDER = "api-builder",
  CREDENTIALS_MANAGER = "credentials-manager",
  APPLICATION_MAKER = "application-maker",
  USER_GUIDE_EDITOR = "user-guide-editor",
  RICH_CONTENT_BUILDER = "rich-content-builder",
}

export enum SUB_ROUTE_NAMES {
  SOLUTIONS_STUDIO_GENERAL = "solutions-studio-general",
  QA_ASSESSMENTS = "qa-assessments",
  QA_ASSESSMENT_EXECUTE = "qa-assessment-execute",
  QA_BATCH_ASSESSMENT = "qa-batch-assessment",
}

export const ROUTE_TITLES: { [p in ROUTE_NAMES]: string } = {
  [ROUTE_NAMES.RFPRESPONDER]: "RFP Responder",
  [ROUTE_NAMES.BACKUP_DEPLOY]: "Backup & Deploy",
  [ROUTE_NAMES.AGENT_WORKSPACE]: "Agent Workspace",
  [ROUTE_NAMES.SYNTHETIC_CUSTOMERS]: "Synthetic Customers",
  [ROUTE_NAMES.CONVERSATION_MANAGER]: "Conversation Manager",
  [ROUTE_NAMES.LOGOUT]: "Logout",
  [ROUTE_NAMES.APP]: "Solutions Toolkit",
  [ROUTE_NAMES.QR_CODE_GENERATOR]: "QR Code Generator",
  [ROUTE_NAMES.BRANDKIT]: "Brandkit",
  [ROUTE_NAMES.INDEX]: TITLE_SUFFIX,
  [ROUTE_NAMES.CANVAS]: "Canvas",
  [ROUTE_NAMES.KB_WIDGET]: "Knowledge Base Widget",
  [ROUTE_NAMES.SOLUTIONS_TOOLKIT]: "Solutions Toolkit",
  [ROUTE_NAMES.SOLUTIONS_TOOLKIT_NO_ACC]: "Solutions Toolkit",
  [ROUTE_NAMES.LOGIN]: `Login - ${TITLE_SUFFIX}`,
  [ROUTE_NAMES.CALLBACK]: `Callback - ${TITLE_SUFFIX}`,
  [ROUTE_NAMES.ADMINISTRATION]: "Admin",
  [ROUTE_NAMES.CONTROL_TOWER]: "Control Tower",
  [ROUTE_NAMES.CONVERSATION_GENERATOR]: "Conversation Generator",
  [ROUTE_NAMES.FILE_MANAGER]: "File Manager",
  [ROUTE_NAMES.CONTEXT_SERVICE]: "Context Service",
  [ROUTE_NAMES.DEMO_BUILDER_LANDING]: "Demo Builder",
  [ROUTE_NAMES.DEMO_BUILDER_PARENT]: "Demo Builder",
  [ROUTE_NAMES.DEMO_BUILDER]: "Demo Builder",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID]: "Demo Builder",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID_QUICK_START]: "Demo Builder quick-start",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID_SVG]: "Demo Builder SVG",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID_SNAP]: "Demo Builder Snap",
  [ROUTE_NAMES.DEMO_PLAYER]: "Demo Player",
  [ROUTE_NAMES.DEMO_PLAYER_BY_ID]: "Demo Player",
  [ROUTE_NAMES.FORM_BUILDER]: "Form Builder",
  [ROUTE_NAMES.QR_BUILDER]: "QR Builder",
  [ROUTE_NAMES.APPS]: "Apps",
  [ROUTE_NAMES.MANAGER_BOT]: "Manager Bot",
  [ROUTE_NAMES.PROACTIVE_BUILDER]: "Proactive Builder",
  [ROUTE_NAMES.CONV_CLOUD_CONFIG]: "Conversational Cloud",
  [ROUTE_NAMES.CONVERSATION_TESTER]: "Conversation Tester",
  [ROUTE_NAMES.CONVERSATION_DEBUGGER]: "Conversation Debugger",
  [ROUTE_NAMES.SKILL_ROUTING]: "Skill Routing",
  [ROUTE_NAMES.LP_FORM]: "LP Form",
  [ROUTE_NAMES.CONTROL_TOWER_POLICY]: "Control Tower",
  [ROUTE_NAMES.WORKFLOWS]: "Workflows",
  [ROUTE_NAMES.AGENT_TOOLKIT]: "Agent Toolkit",
  [ROUTE_NAMES.AGENT_WORKFLOW]: "Agent Workflow",
  [ROUTE_NAMES.CONTROL_TOWER_PARENT]: "Control Tower",
  [ROUTE_NAMES.CONTROL_TOWER_LANDING]: "Control Tower",
  [ROUTE_NAMES.CONTROL_TOWER_EVENTS]: "Control Tower",
  [ROUTE_NAMES.DEMONSTRATION_PARENT]: "Demonstration-Parent",
  [ROUTE_NAMES.DEMONSTRATION]: "Demonstration",
  [ROUTE_NAMES.DEMONSTRATION_CONTROLLER]: "Demonstration",
  [ROUTE_NAMES.SOLUTIONS_STUDIO]: "Solutions Studio",
  [ROUTE_NAMES.WINDOW_EDITOR]: "Window Editor",
  [ROUTE_NAMES.SITE_SETTINGS]: "Site Settings",
  [ROUTE_NAMES.ACCOUNT_SETUP]: "Account Setup",
  [ROUTE_NAMES.EXTERNAL_APP]: "External Application",
  [ROUTE_NAMES.API_EXPLORER]: "API Explorer",
  [ROUTE_NAMES.WFM_DASHBOARD]: "WFM Dashboard",
  [ROUTE_NAMES.AI_STUDIO_HELPER]: "AI Studio Helper",
  [ROUTE_NAMES.COMMAND_CENTER]: "Command Center",
  [ROUTE_NAMES.ACCOUNT_FEATURES]: "Account Features",
  [ROUTE_NAMES.MCP_EXPLORER]: "MCP Explorer",
  [ROUTE_NAMES.QA_ASSESSMENT]: "QA Assessment",
  [ROUTE_NAMES.CONVERSATION_DESIGNER]: "AI Conversation Designer",
  [ROUTE_NAMES.AGENT_LIBRARY]: "Agent Library",
  [ROUTE_NAMES.ROUTES_LIBRARY]: "Routes Library",
  [ROUTE_NAMES.TRANSCRIPT_ANALYZER]: "Transcript Analyzer",
  [ROUTE_NAMES.KB_OPTIMIZER]: "KB Optimizer",
  [ROUTE_NAMES.GLOBAL_VARIABLES]: "Global Variables",
  [ROUTE_NAMES.API_BUILDER]: "API Builder",
  [ROUTE_NAMES.CREDENTIALS_MANAGER]: "Credentials Manager",
  [ROUTE_NAMES.APPLICATION_MAKER]: "Application Maker",
  [ROUTE_NAMES.USER_GUIDE_EDITOR]: "User Guide Editor",
  [ROUTE_NAMES.RICH_CONTENT_BUILDER]: "Rich Content Builder",
};

export const ROUTE_COLORS: { [p in ROUTE_NAMES]: string } = {
  [ROUTE_NAMES.ADMINISTRATION]: "primary",
  [ROUTE_NAMES.BACKUP_DEPLOY]: "primary",
  [ROUTE_NAMES.SITE_SETTINGS]: "primary",
  [ROUTE_NAMES.RFPRESPONDER]: "primary",
  [ROUTE_NAMES.AGENT_WORKSPACE]: "primary",
  [ROUTE_NAMES.SYNTHETIC_CUSTOMERS]: "primary",
  [ROUTE_NAMES.CONVERSATION_MANAGER]: "primary",
  [ROUTE_NAMES.LOGOUT]: "primary",
  [ROUTE_NAMES.APP]: "primary",
  [ROUTE_NAMES.QR_CODE_GENERATOR]: "green",
  [ROUTE_NAMES.BRANDKIT]: "primary",
  [ROUTE_NAMES.CANVAS]: "primary",
  [ROUTE_NAMES.LP_FORM]: "primary",
  [ROUTE_NAMES.KB_WIDGET]: "primary",
  [ROUTE_NAMES.SOLUTIONS_TOOLKIT]: "primary",
  [ROUTE_NAMES.SOLUTIONS_TOOLKIT_NO_ACC]: "primary",
  [ROUTE_NAMES.INDEX]: "primary",
  [ROUTE_NAMES.LOGIN]: "primary",
  [ROUTE_NAMES.CALLBACK]: "primary",
  [ROUTE_NAMES.CONTROL_TOWER]: "cyan-14",
  [ROUTE_NAMES.CONVERSATION_TESTER]: "indigo-14",
  [ROUTE_NAMES.CONVERSATION_DEBUGGER]: "indigo-14",
  [ROUTE_NAMES.FILE_MANAGER]: "red",
  [ROUTE_NAMES.DEMO_BUILDER_LANDING]: "indigo",
  [ROUTE_NAMES.DEMO_BUILDER_PARENT]: "indigo",
  [ROUTE_NAMES.DEMO_BUILDER]: "indigo",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID]: "indigo",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID_QUICK_START]: "Demo Builder quick-start",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID_SVG]: "indigo",
  [ROUTE_NAMES.DEMO_BUILDER_BY_ID_SNAP]: "indigo",
  [ROUTE_NAMES.DEMO_PLAYER]: "indigo",
  [ROUTE_NAMES.DEMO_PLAYER_BY_ID]: "indigo",
  [ROUTE_NAMES.FORM_BUILDER]: "pink",
  [ROUTE_NAMES.QR_BUILDER]: "green",
  [ROUTE_NAMES.APPS]: "primary",
  [ROUTE_NAMES.MANAGER_BOT]: "teal-14",
  [ROUTE_NAMES.PROACTIVE_BUILDER]: "purple",
  [ROUTE_NAMES.CONV_CLOUD_CONFIG]: "orange",
  [ROUTE_NAMES.CONTEXT_SERVICE]: "cyan-14",
  [ROUTE_NAMES.SKILL_ROUTING]: "blue-grey-6",
  [ROUTE_NAMES.CONTROL_TOWER_POLICY]: "cyan-14",
  [ROUTE_NAMES.WORKFLOWS]: "purple-14",
  [ROUTE_NAMES.AGENT_WORKFLOW]: "purple-14",
  [ROUTE_NAMES.AGENT_TOOLKIT]: "purple-14",
  [ROUTE_NAMES.CONVERSATION_GENERATOR]: "brown-14",
  [ROUTE_NAMES.CONTROL_TOWER_PARENT]: "cyan-14",
  [ROUTE_NAMES.CONTROL_TOWER_LANDING]: "cyan-14",
  [ROUTE_NAMES.CONTROL_TOWER_EVENTS]: "cyan-14",
  [ROUTE_NAMES.DEMONSTRATION_PARENT]: "indigo",
  [ROUTE_NAMES.DEMONSTRATION]: "indigo",
  [ROUTE_NAMES.DEMONSTRATION_CONTROLLER]: "indigo",
  [ROUTE_NAMES.SOLUTIONS_STUDIO]: "indigo-14",
  [ROUTE_NAMES.WINDOW_EDITOR]: "indigo-14",
  [ROUTE_NAMES.ACCOUNT_SETUP]: "primary",
  [ROUTE_NAMES.EXTERNAL_APP]: "blue-grey",
  [ROUTE_NAMES.API_EXPLORER]: "teal",
  [ROUTE_NAMES.WFM_DASHBOARD]: "green",
  [ROUTE_NAMES.AI_STUDIO_HELPER]: "purple",
  [ROUTE_NAMES.COMMAND_CENTER]: "deep-purple",
  [ROUTE_NAMES.ACCOUNT_FEATURES]: "teal",
  [ROUTE_NAMES.MCP_EXPLORER]: "deep-purple",
  [ROUTE_NAMES.QA_ASSESSMENT]: "amber",
  [ROUTE_NAMES.CONVERSATION_DESIGNER]: "indigo",
  [ROUTE_NAMES.AGENT_LIBRARY]: "purple",
  [ROUTE_NAMES.ROUTES_LIBRARY]: "amber",
  [ROUTE_NAMES.TRANSCRIPT_ANALYZER]: "teal",
  [ROUTE_NAMES.KB_OPTIMIZER]: "orange",
  [ROUTE_NAMES.GLOBAL_VARIABLES]: "deep-purple",
  [ROUTE_NAMES.API_BUILDER]: "cyan",
  [ROUTE_NAMES.CREDENTIALS_MANAGER]: "amber",
  [ROUTE_NAMES.APPLICATION_MAKER]: "indigo",
  [ROUTE_NAMES.USER_GUIDE_EDITOR]: "teal",
  [ROUTE_NAMES.RICH_CONTENT_BUILDER]: "purple",
};

// export const ACTIVE_ROUTES

export enum LOGIN_METHOD {
  CONVERSATIONAL_CLOUD_SSO = "SSO",
}

export enum STORAGE_KEYS {
  AUTO_CONNECT = "__flows_autoConnect__",
  THEME = "__theme__",
  LOGIN_METHOD = "__login_loginMethod__",
  REMEMBER_ACCOUNT_ID = "__login_rememberAccountId__",
  ACCOUNT_ID = "__login_accountId__",
}

export enum SLIDE_NAMES {
  INTRODUCTION = "Introduction",
  AGENDA = "Agenda",
  WEB_MESSAGING = "Web Messaging",
  MOBILE_MESSAGING = "Mobile Messaging",
  GENERAL = "General slide",
  LOGIN = "Login",
  AUTH_WEB_MESSAGING = "Auth Web Messaging",
}

export enum BACKGROUND_TYPES {
  IMAGE = "image",
  IFRAME = "iframe",
  GOOGLE_SLIDE = "google-slide",
  VIDEO = "video",
  COLOR = "color",
}
export type BackgroundType = keyof typeof BACKGROUND_TYPES;

export const cmOptions = {
  mode: "text/javascript", // Language mode
  theme: "dracula", // Theme
};

export const dragOptions = {
  animation: 200,
  group: "description",
  disable: false,
  ghostClass: "ghost",
};
// interface IFORM_TYPES {
//   [key: string]: string
// }
export enum FORM_TYPES {
  BANNER = "banner",
  STATEMENT = "statement",
  FREE_TEXT = "free text",
  INPUT = "input",
  PASSWORD = "password",
  MULTIPLE_CHOICE = "multiple choice",
  RADIO_BUTTONS = "radio buttons",
  CHECKBOXES = "checkboxes",
  DROPDOWN = "dropdown",
  DATE = "date",
  TIME = "time",
  FILE_UPLOAD = "file upload",
  IMAGE = "image",
}
export const RESPONSE_QUESTION_TYPES = {
  [FORM_TYPES.INPUT]: true,
  [FORM_TYPES.PASSWORD]: true,
  [FORM_TYPES.MULTIPLE_CHOICE]: true,
  [FORM_TYPES.RADIO_BUTTONS]: true,
  [FORM_TYPES.CHECKBOXES]: true,
  [FORM_TYPES.DROPDOWN]: true,
  [FORM_TYPES.DATE]: true,
  [FORM_TYPES.TIME]: true,
  [FORM_TYPES.FILE_UPLOAD]: true,
  [FORM_TYPES.FREE_TEXT]: true,
  [FORM_TYPES.STATEMENT]: false,
  [FORM_TYPES.BANNER]: false,
  [FORM_TYPES.IMAGE]: false,
};

export const COLORS = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "negative",
  "info",
  "warning",
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
];

export const BASE_COLORS = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "negative",
  "info",
  "warning",
  "white",
  "black",
];

export const VARIANT_COLORS = [
  "red",
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
];

export const FORM_FONTS = [
  "arial",
  "arial black",
  "bebasNeue",
  "courier new",
  "exo",
  "georgia",
  "helvetica",
  "impact",
  "inter",
  "lucida console",
  "lucida sans unicode",
  "palatino linotype",
  "raleway",
  "roboto",
  "space-grotesk",
  "tahoma",
  "times new roman",
  "trebuchet ms",
  "verdana",
];

// lists of common quick replies based on vertical industries
export const verticalQuickReplies = [
  {
    name: "health insurance",
    values: ["make a claim", "find a doctor", "update my policy"],
  },
  {
    name: "retail",
    values: ["find a store", "return an item", "check my order"],
  },
  {
    name: "banking",
    values: ["check my balance", "transfer money", "report fraud"],
  },
  {
    name: "travel",
    values: ["book a flight", "change my reservation", "check in"],
  },
  {
    name: "telecom",
    values: ["change my plan", "pay my bill", "report an issue"],
  },
  {
    name: "utilities",
    values: ["pay my bill", "report an issue", "change my plan"],
  },
  {
    name: "insurance",
    values: ["make a claim", "update my policy", "find a doctor"],
  },
  {
    name: "automotive",
    values: ["find a dealer", "schedule a service", "order parts"],
  },
  {
    name: "entertainment",
    values: ["buy tickets", "find a show", "check showtimes"],
  },
  {
    name: "education",
    values: ["apply for a program", "find a course", "check my grades"],
  },
];

// class IRecord(BaseMixin):
//     id: str = Field(
//         default="", description="The id of the record"
//     )
//     event_occured: bool = Field(
//         default=False, description="The event_occured of the record"
//     )
//     conversationId: str = Field(
//         default="", description="The conversationId of the record"
//     )
//     site_id: str = Field(
//         default="", description="The site_id of the record"
//     )
//     consumerId: str = Field(
//         default="", description="The consumerId of the record"
//     )
//     stage: str = Field(
//         default="", description="The stage of the record"
//     )
//     skillId: int = Field(
//         default=-1, description="The skillId of the record"
//     )
//     state: str = Field(
//         default="", description="The state of the record"
//     )
//     startTs: int = Field(
//         default=0, description="The startTs of the record"
//     )
//     events: list[IPolicyRecordBasic] = Field(
//         default=[], description="The events of the record"
//     )
//     expires_at: datetime  = Field(
//         default="", description="The expires_at of the record", example="2 February 2024 at 20:08:08 UTC+11"
//     )

export const authenticationErrors = {
  9000: "DEFAULT,",
  9001: "SERVER_ERROR,",
  9007: "CUSTOMER_JWT_NOT_VALID - failed to validate customer JWT - mostly due to public key doesn't match customer private key ( in the connector config)",
  9008: "LP_JWT_NOT_VALID - failed to validate LP JWT",
  9009: "ESAPI_ERROR - esapi validation errors",
  9010: "SERVICE_TIMEOUT- idp controller timed out",
  9011: "CUSTOMER_AUTH_FAILED - validation authcode against customer site failed",
  9012: "INPUT_VALIDATION_ERROR - input is not valid",
  9013: "AUTHENTICATION_TIMEOUT - the Customer endpoint auth call timed out",
  9014: "AUTHENTICATE_EXCEPTION - authentication encounterd unexpected error",
  9015: "UNSUPPORTED_AUTH_TYPE - connector Type is not supported",
  1001: "PARSE_ERROR - failed to parse JWT",
  1003: "NO_SUCH_ALGORITHM",
  1004: "JOSE_EXECEPTION - failed to decrypt JWE",
  1005: "INVALID_KEY_SPEC",
  1006: "UNSUPPORTED_ENCODING",
  1007: "SNMP_INIT_FAILED",
  1008: "JWT_NOT_VALID - input is not in JWT format",
  1009: "JWT_PARSING_ERROR",
  1010: "LP_JWT_PARSING_ERROR",
  1011: "JWT_MISSING_CALIMESET",
  1012: "JWT_EXPIRED",
  1022: "AC_CLIENT_INIT_FAILED",
  1023: "AC_CONNECTOR_FAILED - failed to fetch connector configuration",
  1024: "AC_CONNECTOR_NOT_FOUND - no connector found",
  1025: "AC_CONNECTOR_TYPE_NOT_FOUND - connector found but the type is not supported",
  1026: "SDE_PARSE_EXCEPTION",
  1027: "RSA_DECRYPTOR_INIT_ERROR",
  1028: "RSA_VERIFIER_INIT_ERROR - the customer public key is not valid",
  1029: "AES_SECRET_DECODING_ERROR - failed to decode hex AES secret",
  1030: "ENCRYPTION_INIT_FAILED",
  1031: "ENCRYPTION_FAILED",
  1032: "DECRYPTION_INIT_FAILED",
  1033: "DECRYPTION_DECODE_EXCEPTION",
  1034: "DECRYPTION_EXCEPTION",
  1036: "DEPENDENCY_TESTER_INIT_FAILED - failed create Health service dependency tester",
  1037: "LE_AUTH_DESERIALIZER_FAILED - failed deserializ le auth data",
  1038: "JWK_PARSE_FAILED - failed to parse JWK data",
  1039: "ITE_SETTINGS_TYPE_NOT_FOUND , //Site settings not found",
  1040: "SITE_SETTINGS_JWK_NOT_FOUND //Site settings JWK not found",
  1041: "JWK_ID_NOT_FOUND - JWK kid was not found",
  1042: "MULTIPLE_JWK_WITHOUT_KID_HEADER - JWK kid was not found in header where ther eis multiple jwks",
  1043: "SSL_INIT_FAILED",
  1044: "CASSANDRA_CLIENT_INIT_FAILED",
  1045: "BLACKLIST_UPDATE_FAILED",
  1046: "BLACKLIST_READ_FAILED",
  1047: "BLACKLIST_ADD_FAILED",
  1048: "BLACKLIST_REMOVE_FAILED",
  1049: "UN_AUTH_JWT_FOUND_IN_BLACKLIST",
  1050: "AC_PROVISION_DATA_NOT_FOUND - no Provision featrue found",
  2001: "NON_AUTH_JWT_REFRESH_EXPIRED",
  2002: "NON_AUTH_JWT_INVALID_SIGNATURE",
  2004: "NON_AUTH_JWT_WRONG_ACCOUNT_ID",
  2005: "NON_AUTH_JWT_MESSAGING_FEATURE_OFF",
  2006: "CAPTCHA_VERIFICATION_FAILED",
  2007: "CAPTCHA_VERIFICATION_SERVICE_ERROR",
};

export enum ButtonType {
  UNELEVATED = "unelevated",
  OUTLINED = "outlined",
  FLAT = "flat",
  PUSH = "push",
}

export enum GRADIENT_TYPES {
  LINEAR = "linear",
  RADIAL = "radial",
}

export enum RADIAL_GRADIENT_TYPES {
  CIRCLE = "circle",
  ELLIPSE = "ellipse",
}

export enum GRADIENT_SIZES {
  CLOSEST_SIDE = "closest-side",
  CLOSEST_CORNER = "closest-corner",
  FARTHEST_SIDE = "farthest-side",
  FARTHEST_CORNER = "farthest-corner",
}

export enum GRADIENT_POSITIONS {
  TOP = "top",
  TOP_RIGHT = "top right",
  RIGHT = "right",
  BOTTOM_RIGHT = "bottom right",
  BOTTOM = "bottom",
  BOTTOM_LEFT = "bottom left",
  LEFT = "left",
  TOP_LEFT = "top left",
}

export enum CHANNELS_NAMES {
  WEB = "web",
  IN_APP = "in-app",
  WHATSAPP = "whatsapp",
  SMS = "sms",
  APPLE_BUSINESS_CHAT = "apple-business-chat",
  FACEBOOK = "facebook",
}

export const CHANNELS = [
  { value: CHANNELS_NAMES.WEB, name: CHANNELS_NAMES.WEB, active: true },
  { value: CHANNELS_NAMES.IN_APP, name: CHANNELS_NAMES.IN_APP, active: true },
  {
    value: CHANNELS_NAMES.WHATSAPP,
    name: CHANNELS_NAMES.WHATSAPP,
    active: true,
  },
  { value: CHANNELS_NAMES.SMS, name: CHANNELS_NAMES.SMS, active: true },
  {
    value: CHANNELS_NAMES.APPLE_BUSINESS_CHAT,
    name: CHANNELS_NAMES.APPLE_BUSINESS_CHAT,
    active: true,
  },
  {
    value: CHANNELS_NAMES.FACEBOOK,
    name: CHANNELS_NAMES.FACEBOOK,
    active: true,
  },
];

export const API_ROUTES_LLM_TASKS = {
  BASE: (accountId: string) => `${V1}/llm_task/${accountId}`,
  GENERATE_CONVERSATIONS: (accountId: string) =>
    `${API_ROUTES_LLM_TASKS.BASE(accountId)}/generate_conversations`,
};

// AI_STUDIO(): string { return `${v1}/ai-studio` },
export const API_ROUTES_AI_STUDIO = {
  BASE: (accountId: string) => `${V1}/ai-studio/${accountId}`,

  // Categories
  CATEGORIES: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/categories`,
  CATEGORY: (accountId: string, categoryId: string) =>
    `${API_ROUTES_AI_STUDIO.CATEGORIES(accountId)}/${categoryId}`,

  // Conversations
  CONVERSATIONS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/conversations`,
  CONVERSATIONS_EXPORT: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.CONVERSATIONS(accountId)}/export`,
  CONVERSATIONS_UPLOAD: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.CONVERSATIONS(accountId)}/upload`,
  CONVERSATION: (accountId: string, convId: string) =>
    `${API_ROUTES_AI_STUDIO.CONVERSATIONS(accountId)}/${convId}`,
  CONVERSATION_ATTRIBUTES: (accountId: string, convId: string) =>
    `${API_ROUTES_AI_STUDIO.CONVERSATION(accountId, convId)}/attributes`,
  CONVERSATION_CLOSE: (accountId: string, convId: string) =>
    `${API_ROUTES_AI_STUDIO.CONVERSATION(accountId, convId)}/close`,

  // Summary
  SUMMARY: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/summary`,
  SUMMARY_BATCH: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.SUMMARY(accountId)}/batch`,
  SUMMARY_BATCH_BY_ID: (accountId: string, summaryId: string) =>
    `${API_ROUTES_AI_STUDIO.SUMMARY_BATCH(accountId)}/${summaryId}`,

  // Query
  QUERY: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/query`,

  // Simulations
  SIMULATIONS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/simulations`,
  SIMULATION: (accountId: string, simulationId: string) =>
    `${API_ROUTES_AI_STUDIO.SIMULATIONS(accountId)}/${simulationId}`,
  SIMULATION_STATUS: (accountId: string, simulationId: string) =>
    `${API_ROUTES_AI_STUDIO.SIMULATION(accountId, simulationId)}/status`,
  SIMULATION_JOB: (accountId: string, simulationId: string, jobId: string) =>
    `${API_ROUTES_AI_STUDIO.SIMULATION(accountId, simulationId)}/jobs/${jobId}`,
  SIMULATION_CANCEL: (accountId: string, simulationId: string) =>
    `${API_ROUTES_AI_STUDIO.SIMULATION(accountId, simulationId)}/cancel`,

  // Transcript Analysis
  TRANSCRIPT_ANALYSIS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/transcript-analysis`,
  TRANSCRIPT_ANALYSIS_BY_ID: (accountId: string, analysisId: string) =>
    `${API_ROUTES_AI_STUDIO.TRANSCRIPT_ANALYSIS(accountId)}/${analysisId}`,

  // Knowledgebases
  KNOWLEDGEBASES: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/knowledgebases`,
  KNOWLEDGEBASES_KAI: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASES(accountId)}/kai`,
  KNOWLEDGEBASE: (accountId: string, kbId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASES(accountId)}/${kbId}`,
  KNOWLEDGEBASE_HEALTH: (accountId: string, kbId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASE(accountId, kbId)}/health`,
  KNOWLEDGEBASE_REFRESH: (accountId: string, kbId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASE(accountId, kbId)}/refresh`,
  KNOWLEDGEBASE_SEARCH: (accountId: string, kbId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASE(accountId, kbId)}/search`,
  KNOWLEDGEBASE_ITEMS: (accountId: string, kbId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASE(accountId, kbId)}/items`,
  KNOWLEDGEBASE_ITEMS_SOURCE: (accountId: string, kbId: string, sourceId: string) =>
    `${API_ROUTES_AI_STUDIO.KNOWLEDGEBASE_ITEMS(accountId, kbId)}/${sourceId}`,

  // Evaluators
  EVALUATOR_SIMILARITY: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/evaluators/similarity`,
  EVALUATOR_RESOLUTION: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/evaluators/resolution`,
  EVALUATOR_GUIDED_ROUTING: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/evaluators/guided-routing`,

  // Generators
  GENERATOR_QA_MODEL: (accountId: string, modelId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/generators/qa/model/${modelId}`,
  GENERATOR_QA_KB: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/generators/qa/knowledgebase`,
  GENERATOR_QA_CONV_CLOUD: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/generators/qa/conversation-cloud`,
  GENERATOR_ROUTES_KAI_LLM: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/generators/routes/kai-llm`,
  GENERATOR_ROUTES_KAI: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/generators/routes/kai`,
  GENERATOR_ROUTES_KAI_STATUS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/generators/routes/kai/status`,

  // Prompt Library
  PROMPT_LIBRARY: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/prompt-library`,
  PROMPT_LIBRARY_BY_ID: (accountId: string, promptId: string) =>
    `${API_ROUTES_AI_STUDIO.PROMPT_LIBRARY(accountId)}/${promptId}`,
  PROMPT_LIBRARY_PROVIDERS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.PROMPT_LIBRARY(accountId)}/providers`,
  PROMPT_LIBRARY_SYSTEM: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.PROMPT_LIBRARY(accountId)}/system`,

  // Users
  USERS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/users`,
  USERS_SELF: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.USERS(accountId)}/self`,
  USERS_DETAILS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.USERS(accountId)}/details`,
  USER: (accountId: string, userId: string) =>
    `${API_ROUTES_AI_STUDIO.USERS(accountId)}/${userId}`,
  USER_MODELS: (accountId: string, userId: string) =>
    `${API_ROUTES_AI_STUDIO.USER(accountId, userId)}/models`,
  USER_TERMS: (accountId: string, userId: string) =>
    `${API_ROUTES_AI_STUDIO.USER(accountId, userId)}/terms`,

  // Flows
  FLOWS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.BASE(accountId)}/flows`,
  FLOWS_RESPONSE: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.FLOWS(accountId)}/response`,
  FLOW: (accountId: string, flowId: string) =>
    `${API_ROUTES_AI_STUDIO.FLOWS(accountId)}/${flowId}`,

  // Legacy aliases
  GENERATE_CONVERSATIONS: (accountId: string) =>
    `${API_ROUTES_LLM_TASKS.BASE(accountId)}/generate_conversations`,
  LIST_FLOWS: (accountId: string) =>
    `${API_ROUTES_AI_STUDIO.FLOWS(accountId)}`,
  INVOKE_FLOW: (accountId: string, flowId: string) =>
    `${API_ROUTES_AI_STUDIO.FLOW(accountId, flowId)}`,
};

export enum ACTION_KEYS_AI_STUDIO {
  // Categories
  GET_CATEGORIES = "AIS_GET_CATEGORIES",
  CREATE_CATEGORY = "AIS_CREATE_CATEGORY",
  UPDATE_CATEGORY = "AIS_UPDATE_CATEGORY",
  DELETE_CATEGORY = "AIS_DELETE_CATEGORY",

  // Conversations
  GET_CONVERSATIONS = "AIS_GET_CONVERSATIONS",
  CREATE_CONVERSATION = "AIS_CREATE_CONVERSATION",
  EXPORT_CONVERSATIONS = "AIS_EXPORT_CONVERSATIONS",
  UPLOAD_CONVERSATIONS = "AIS_UPLOAD_CONVERSATIONS",
  GET_CONVERSATION = "AIS_GET_CONVERSATION",
  UPDATE_CONVERSATION = "AIS_UPDATE_CONVERSATION",
  DELETE_CONVERSATION = "AIS_DELETE_CONVERSATION",
  UPDATE_CONVERSATION_ATTRIBUTES = "AIS_UPDATE_CONVERSATION_ATTRIBUTES",
  CLOSE_CONVERSATION = "AIS_CLOSE_CONVERSATION",

  // Summary
  CREATE_SUMMARY = "AIS_CREATE_SUMMARY",
  CREATE_BATCH_SUMMARY = "AIS_CREATE_BATCH_SUMMARY",
  GET_BATCH_SUMMARIES = "AIS_GET_BATCH_SUMMARIES",
  GET_BATCH_SUMMARY = "AIS_GET_BATCH_SUMMARY",
  DELETE_BATCH_SUMMARY = "AIS_DELETE_BATCH_SUMMARY",

  // Query
  GENERATE_QUERY = "AIS_GENERATE_QUERY",

  // Simulations
  GET_SIMULATIONS = "AIS_GET_SIMULATIONS",
  CREATE_SIMULATION = "AIS_CREATE_SIMULATION",
  GET_SIMULATION = "AIS_GET_SIMULATION",
  UPDATE_SIMULATION = "AIS_UPDATE_SIMULATION",
  DELETE_SIMULATION = "AIS_DELETE_SIMULATION",
  GET_SIMULATION_STATUS = "AIS_GET_SIMULATION_STATUS",
  GET_SIMULATION_JOB = "AIS_GET_SIMULATION_JOB",
  CANCEL_SIMULATION = "AIS_CANCEL_SIMULATION",

  // Transcript Analysis
  CREATE_TRANSCRIPT_ANALYSIS = "AIS_CREATE_TRANSCRIPT_ANALYSIS",
  GET_TRANSCRIPT_ANALYSES = "AIS_GET_TRANSCRIPT_ANALYSES",
  GET_TRANSCRIPT_ANALYSIS = "AIS_GET_TRANSCRIPT_ANALYSIS",
  UPDATE_TRANSCRIPT_ANALYSIS = "AIS_UPDATE_TRANSCRIPT_ANALYSIS",
  DELETE_TRANSCRIPT_ANALYSIS = "AIS_DELETE_TRANSCRIPT_ANALYSIS",

  // Knowledgebases
  GET_KNOWLEDGEBASES = "AIS_GET_KNOWLEDGEBASES",
  GET_KNOWLEDGEBASES_KAI = "AIS_GET_KNOWLEDGEBASES_KAI",
  GET_KNOWLEDGEBASE = "AIS_GET_KNOWLEDGEBASE",
  DELETE_KNOWLEDGEBASE = "AIS_DELETE_KNOWLEDGEBASE",
  GET_KNOWLEDGEBASE_HEALTH = "AIS_GET_KNOWLEDGEBASE_HEALTH",
  REFRESH_KNOWLEDGEBASE = "AIS_REFRESH_KNOWLEDGEBASE",
  SEARCH_KNOWLEDGEBASE = "AIS_SEARCH_KNOWLEDGEBASE",
  GET_KNOWLEDGEBASE_ITEMS = "AIS_GET_KNOWLEDGEBASE_ITEMS",
  GET_KNOWLEDGEBASE_ITEMS_SOURCE = "AIS_GET_KNOWLEDGEBASE_ITEMS_SOURCE",
  CREATE_KNOWLEDGEBASE_ITEM = "AIS_CREATE_KNOWLEDGEBASE_ITEM",
  UPDATE_KNOWLEDGEBASE_ITEM = "AIS_UPDATE_KNOWLEDGEBASE_ITEM",
  DELETE_KNOWLEDGEBASE_ITEM = "AIS_DELETE_KNOWLEDGEBASE_ITEM",

  // Evaluators
  EVALUATE_SIMILARITY = "AIS_EVALUATE_SIMILARITY",
  EVALUATE_RESOLUTION = "AIS_EVALUATE_RESOLUTION",
  EVALUATE_GUIDED_ROUTING = "AIS_EVALUATE_GUIDED_ROUTING",

  // Generators
  GENERATE_QA_FROM_MODEL = "AIS_GENERATE_QA_FROM_MODEL",
  GENERATE_QA_FROM_KB = "AIS_GENERATE_QA_FROM_KB",
  GENERATE_QA_FROM_CONV_CLOUD = "AIS_GENERATE_QA_FROM_CONV_CLOUD",
  GENERATE_KAI_ROUTES_LLM = "AIS_GENERATE_KAI_ROUTES_LLM",
  GENERATE_KAI_ROUTES = "AIS_GENERATE_KAI_ROUTES",
  GET_KAI_ROUTES_STATUS = "AIS_GET_KAI_ROUTES_STATUS",

  // Prompt Library
  GET_PROMPTS = "AIS_GET_PROMPTS",
  CREATE_PROMPT = "AIS_CREATE_PROMPT",
  UPDATE_PROMPT = "AIS_UPDATE_PROMPT",
  GET_LLM_PROVIDERS = "AIS_GET_LLM_PROVIDERS",
  GET_SYSTEM_PROMPTS = "AIS_GET_SYSTEM_PROMPTS",

  // Users
  GET_SELF = "AIS_GET_SELF",
  GET_USERS = "AIS_GET_USERS",
  GET_USERS_DETAILS = "AIS_GET_USERS_DETAILS",
  CREATE_USER = "AIS_CREATE_USER",
  UPDATE_USER = "AIS_UPDATE_USER",
  DELETE_USER = "AIS_DELETE_USER",
  UPDATE_USER_MODELS = "AIS_UPDATE_USER_MODELS",
  AGREE_TO_TERMS = "AIS_AGREE_TO_TERMS",

  // Flows
  GET_FLOWS = "AIS_GET_FLOWS",
  GET_FLOW = "AIS_GET_FLOW",
  INVOKE_FLOW = "AIS_INVOKE_FLOW",
  INVOKE_FLOW_RESPONSE = "AIS_INVOKE_FLOW_RESPONSE",
}

// Legacy alias for backward compatibility
export const AIS_ACTION_KEYS = {
  GET_WEBSITE: "GET_WEBSITE",
  INVOKE_FLOW: ACTION_KEYS_AI_STUDIO.INVOKE_FLOW,
  GENERATE_CONVERSATIONS: "GENERATE_CONVERSATIONS",
  LIST_FLOWS: ACTION_KEYS_AI_STUDIO.GET_FLOWS,
};

export const initialPagination = {
  sortBy: "desc",
  descending: false,
  page: 2,
  rowsPerPage: 0,
};

// const getType = (
//   value: string | number | object | null | undefined
// ): string => {
//   if (value === null || value === undefined) {
//     return "String";
//   }
//   if (typeof value === "number") {
//     return "Float";
//   }
//   if (typeof value === "string") {
//     return "String";
//   }
//   if (Array.isArray(value)) {
//     return "String Array";
//   }
//   if (typeof value === "object") {
//     return "Json Object";
//   }
//   return "Unknown";
// };

export enum AC_VALUE_TYPES {
  STRING = "String",
  FLOAT = "Float",
  INTEGER = "Integer",
  BOOLEAN = "Boolean",
  JSON_OBJECT = "Json Object",
  STRING_ARRAY = "String Array",
  UNKNOWN = "Unknown",
}

//  * 0 - Float: For numeric values, typically used for decimal numbers.
//  * 1 - Integer: For whole numbers, used when the value should not be a decimal.
// * 2 - String: For text values, used for any string input.
// * 3 - String Array: For lists of strings, used when multiple string values are needed.
// * 4 - Json Object: For complex objects, used when the value is a structured JSON object.
// * 5 - Unknown: For any other type that does not fit the above categories.

export function getACValueType(value: number) {
  switch (value) {
    case 0:
      return AC_VALUE_TYPES.FLOAT;
    case 1:
      return AC_VALUE_TYPES.INTEGER;
    case 2:
      return AC_VALUE_TYPES.STRING;
    case 3:
      return AC_VALUE_TYPES.STRING_ARRAY;
    case 4:
      return AC_VALUE_TYPES.JSON_OBJECT;
    default:
      return AC_VALUE_TYPES.UNKNOWN;
  }
}
