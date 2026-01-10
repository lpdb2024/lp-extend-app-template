import type { QTableProps } from "quasar";
import { V1, V2 } from "./constants";

export const CCAPP_ROUTES = {
  BASE: (accountId: string) => `${V1}/cc-app/${accountId}/`,
  APPID: (accountId: string, appId: string) =>
    `${CCAPP_ROUTES.BASE(accountId)}${appId}`,
};

// =============================================================================
// v1 Routes (Legacy - kept for backward compatibility)
// =============================================================================
const AC_ROUTES_V1_BASE = (accountId: string) => `${V1}/account/${accountId}/`;

const AC_ROUTES_V1 = {
  BASE: AC_ROUTES_V1_BASE,
  BRAND: (accountId: string) => `${AC_ROUTES_V1_BASE(accountId)}brand-details`,
  APP_KEYS: (accountId: string) => `${AC_ROUTES_V1_BASE(accountId)}app-keys`,
  APP_SETTINGS: (accountId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}app_settings`,
  APP_SETTINGS_MANY: (accountId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}app-settings-many`,
  CONFIG: (accountId: string) => `${AC_ROUTES_V1_BASE(accountId)}config`,
  CONFIG_ALL: (accountId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}account-config`,
  DOMAINS: (accountId: string) => `${AC_ROUTES_V1_BASE(accountId)}domains`,
  API_KEYS: (accountId: string) => `${AC_ROUTES_V1_BASE(accountId)}api-keys`,
  APPLICATION: (accountId: string) => `${AC_ROUTES_V1_BASE(accountId)}application`,
  API_KEYS_BY_ID: (accountId: string, keyId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}keys/${keyId}`,
  INSTALLED_APPS: (accountId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}installed_applications`,
  INSTALLED_APPS_BY_ID: (accountId: string, id: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}installed_applications/${id}`,
  SERVICE_WORKERS: (accountId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}service-workers`,
  SERVICE_WORKER_BY_ID: (accountId: string, id: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}service-workers/${id}`,
  // Automatic messages default (not in v2 yet)
  AUTOMATIC_MESSAGES_DEFAULT: (accountId: string) =>
    `${AC_ROUTES_V1_BASE(accountId)}automatic-messages-default`,
};

// =============================================================================
// v2 Routes (New strongly-typed LivePerson API structure)
// =============================================================================
const AC_ROUTES_V2_BASE = (accountId: string) => `${V1}/account-config/${accountId}`;

const AC_ROUTES_V2 = {
  BASE: AC_ROUTES_V2_BASE,

  // Skills
  SKILLS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/skills`,
  SKILLS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/skills/${id}`,
  SKILLS_DEPENDENCIES: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/skills/${id}/dependencies`,
  SKILLS_SMART_DELETE: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/skills/${id}/smart-delete`,

  // Users
  USERS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/users`,
  USERS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/users/${id}`,
  USERS_SELF: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/users/self`,
  USERS_BATCH: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/users/batch`,
  USERS_BATCH_REMOVE_SKILL: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/users/batch/remove-skill`,

  // Agent Groups
  AGENT_GROUPS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/agent-groups`,
  AGENT_GROUPS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/agent-groups/${id}`,

  // Profiles
  PROFILES: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/profiles`,
  PROFILES_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/profiles/${id}`,

  // LOBs
  LOBS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/lobs`,
  LOBS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/lobs/${id}`,

  // Predefined Content
  PREDEFINED_CONTENT: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/predefined-content`,
  PREDEFINED_CONTENT_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/predefined-content/${id}`,

  // Automatic Messages
  AUTOMATIC_MESSAGES: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/automatic-messages`,
  AUTOMATIC_MESSAGES_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/automatic-messages/${id}`,

  // Working Hours
  WORKING_HOURS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/working-hours`,
  WORKING_HOURS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/working-hours/${id}`,

  // Special Occasions
  SPECIAL_OCCASIONS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/special-occasions`,
  SPECIAL_OCCASIONS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/special-occasions/${id}`,

  // Campaigns
  CAMPAIGNS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/campaigns`,
  CAMPAIGNS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/campaigns/${id}`,

  // Engagements (under campaigns)
  ENGAGEMENTS: (accountId: string, campaignId: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/campaigns/${campaignId}/engagements`,
  ENGAGEMENTS_BY_ID: (accountId: string, campaignId: string | number, engId: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/campaigns/${campaignId}/engagements/${engId}`,

  // Goals
  GOALS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/goals`,
  GOALS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/goals/${id}`,

  // Visitor Profiles
  VISITOR_PROFILES: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/visitor-profiles`,
  VISITOR_PROFILES_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/visitor-profiles/${id}`,

  // Visitor Behaviors
  VISITOR_BEHAVIORS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/visitor-behaviors`,
  VISITOR_BEHAVIORS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/visitor-behaviors/${id}`,

  // Onsite Locations
  ONSITE_LOCATIONS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/onsite-locations`,
  ONSITE_LOCATIONS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/onsite-locations/${id}`,

  // Window Configurations
  WINDOW_CONFIGURATIONS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/window-configurations`,
  WINDOW_CONFIGURATIONS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/window-configurations/${id}`,

  // Connectors (uses separate endpoint path)
  CONNECTORS: (accountId: string) => `${V2}/connector/${accountId}`,
  CONNECTORS_BY_ID: (accountId: string, id: string | number) =>
    `${V2}/connector/${accountId}/${id}`,

  // App Installations
  APP_INSTALLATIONS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/app-installations`,
  APP_INSTALLATIONS_BY_ID: (accountId: string, id: string) =>
    `${AC_ROUTES_V2_BASE(accountId)}/app-installations/${id}`,

  // Widgets (UI Personalization)
  WIDGETS: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/widgets`,
  WIDGETS_BY_ID: (accountId: string, id: string | number) =>
    `${AC_ROUTES_V2_BASE(accountId)}/widgets/${id}`,

  // Account Properties (Settings)
  ACCOUNT_PROPERTIES: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/properties`,
  ACCOUNT_PROPERTIES_BY_ID: (accountId: string, id: string) =>
    `${AC_ROUTES_V2_BASE(accountId)}/properties/${id}`,

  // Account Features (Feature Grants)
  ACCOUNT_FEATURES: (accountId: string) => `${AC_ROUTES_V2_BASE(accountId)}/features`,
};

// =============================================================================
// Conversation Orchestrator Routes (KB Rules, Bot Rules, Agent Preferences)
// =============================================================================
const CO_ROUTES_BASE = (accountId: string) => `${V2}/conversation-orchestrator/${accountId}`;

export const CO_ROUTES = {
  KB_RULES: (accountId: string) => `${CO_ROUTES_BASE(accountId)}/kb-rules`,
  KB_RULES_BY_ID: (accountId: string, ruleId: string) => `${CO_ROUTES_BASE(accountId)}/kb-rules/${ruleId}`,
  BOT_RULES: (accountId: string) => `${CO_ROUTES_BASE(accountId)}/bot-rules`,
  BOT_RULES_BY_ID: (accountId: string, ruleId: string) => `${CO_ROUTES_BASE(accountId)}/bot-rules/${ruleId}`,
  AGENT_PREFERENCES: (accountId: string) => `${CO_ROUTES_BASE(accountId)}/agent-preferences`,
};

// =============================================================================
// FaaS Routes (Lambdas, Schedules, Proxy Settings)
// =============================================================================
const FAAS_ROUTES_BASE = (accountId: string) => `${V2}/faas/${accountId}`;

export const FAAS_ROUTES = {
  LAMBDAS: (accountId: string) => `${FAAS_ROUTES_BASE(accountId)}/lambdas`,
  LAMBDAS_BY_ID: (accountId: string, lambdaId: string) => `${FAAS_ROUTES_BASE(accountId)}/lambdas/${lambdaId}`,
  SCHEDULES: (accountId: string) => `${FAAS_ROUTES_BASE(accountId)}/schedules`,
  SCHEDULES_BY_ID: (accountId: string, scheduleId: string) => `${FAAS_ROUTES_BASE(accountId)}/schedules/${scheduleId}`,
  PROXY_SETTINGS: (accountId: string) => `${FAAS_ROUTES_BASE(accountId)}/proxy-settings`,
  PROXY_SETTINGS_BY_ID: (accountId: string, settingId: number) => `${FAAS_ROUTES_BASE(accountId)}/proxy-settings/${settingId}`,
};

// =============================================================================
// Unified AC_ROUTES (uses v2 for new LP APIs, v1 for legacy/app-specific)
// =============================================================================
export const AC_ROUTES = {
  // v1 base for legacy app-specific routes
  BASE: AC_ROUTES_V1.BASE,

  // v1 routes (legacy, not yet migrated or app-specific)
  BRAND: AC_ROUTES_V1.BRAND,
  APP_KEYS: AC_ROUTES_V1.APP_KEYS,
  APP_SETTINGS: AC_ROUTES_V1.APP_SETTINGS,
  APP_SETTINGS_MANY: AC_ROUTES_V1.APP_SETTINGS_MANY,
  CONFIG: AC_ROUTES_V1.CONFIG,
  CONFIG_ALL: AC_ROUTES_V1.CONFIG_ALL,
  DOMAINS: AC_ROUTES_V1.DOMAINS,
  API_KEYS: AC_ROUTES_V1.API_KEYS,
  APPLICATION: AC_ROUTES_V1.APPLICATION,
  API_KEYS_BY_ID: AC_ROUTES_V1.API_KEYS_BY_ID,
  INSTALLED_APPS: AC_ROUTES_V1.INSTALLED_APPS,
  INSTALLED_APPS_BY_ID: AC_ROUTES_V1.INSTALLED_APPS_BY_ID,
  SERVICE_WORKERS: AC_ROUTES_V1.SERVICE_WORKERS,
  SERVICE_WORKER_BY_ID: AC_ROUTES_V1.SERVICE_WORKER_BY_ID,
  AUTOMATIC_MESSAGES_DEFAULT: AC_ROUTES_V1.AUTOMATIC_MESSAGES_DEFAULT,

  // v2 routes (new strongly-typed LP APIs)
  SKILLS: AC_ROUTES_V2.SKILLS,
  SKILLS_BY_ID: AC_ROUTES_V2.SKILLS_BY_ID,
  SKILLS_DEPENDENCIES: AC_ROUTES_V2.SKILLS_DEPENDENCIES,
  SKILLS_SMART_DELETE: AC_ROUTES_V2.SKILLS_SMART_DELETE,
  USERS: AC_ROUTES_V2.USERS,
  USERS_BY_ID: AC_ROUTES_V2.USERS_BY_ID,
  USERS_SELF: AC_ROUTES_V2.USERS_SELF,
  USERS_BATCH: AC_ROUTES_V2.USERS_BATCH,
  USERS_BATCH_REMOVE_SKILL: AC_ROUTES_V2.USERS_BATCH_REMOVE_SKILL,
  AGENT_GROUPS: AC_ROUTES_V2.AGENT_GROUPS,
  AGENT_GROUPS_BY_ID: AC_ROUTES_V2.AGENT_GROUPS_BY_ID,
  PROFILES: AC_ROUTES_V2.PROFILES,
  PROFILES_BY_ID: AC_ROUTES_V2.PROFILES_BY_ID,
  LOBS: AC_ROUTES_V2.LOBS,
  LOBS_BY_ID: AC_ROUTES_V2.LOBS_BY_ID,
  PREDEFINED_CONTENT: AC_ROUTES_V2.PREDEFINED_CONTENT,
  PREDEFINED_CONTENT_BY_ID: AC_ROUTES_V2.PREDEFINED_CONTENT_BY_ID,
  PDC: AC_ROUTES_V2.PREDEFINED_CONTENT,
  PDC_BY_ID: AC_ROUTES_V2.PREDEFINED_CONTENT_BY_ID,
  AUTOMATIC_MESSAGES: AC_ROUTES_V2.AUTOMATIC_MESSAGES,
  AUTOMATIC_MESSAGES_BY_ID: AC_ROUTES_V2.AUTOMATIC_MESSAGES_BY_ID,
  WORKING_HOURS: AC_ROUTES_V2.WORKING_HOURS,
  WORKING_HOURS_BY_ID: AC_ROUTES_V2.WORKING_HOURS_BY_ID,
  SPECIAL_OCCASIONS: AC_ROUTES_V2.SPECIAL_OCCASIONS,
  SPECIAL_OCCASIONS_BY_ID: AC_ROUTES_V2.SPECIAL_OCCASIONS_BY_ID,
  CAMPAIGNS: AC_ROUTES_V2.CAMPAIGNS,
  CAMPAIGNS_BY_ID: AC_ROUTES_V2.CAMPAIGNS_BY_ID,
  ENGAGEMENTS: AC_ROUTES_V2.ENGAGEMENTS,
  ENGAGEMENTS_BY_ID: AC_ROUTES_V2.ENGAGEMENTS_BY_ID,
  GOALS: AC_ROUTES_V2.GOALS,
  GOALS_BY_ID: AC_ROUTES_V2.GOALS_BY_ID,
  VISITOR_PROFILES: AC_ROUTES_V2.VISITOR_PROFILES,
  VISITOR_PROFILES_BY_ID: AC_ROUTES_V2.VISITOR_PROFILES_BY_ID,
  VISITOR_BEHAVIORS: AC_ROUTES_V2.VISITOR_BEHAVIORS,
  VISITOR_BEHAVIORS_BY_ID: AC_ROUTES_V2.VISITOR_BEHAVIORS_BY_ID,
  ONSITE_LOCATIONS: AC_ROUTES_V2.ONSITE_LOCATIONS,
  ONSITE_LOCATIONS_BY_ID: AC_ROUTES_V2.ONSITE_LOCATIONS_BY_ID,
  WINDOW_CONFIGURATIONS: AC_ROUTES_V2.WINDOW_CONFIGURATIONS,
  WINDOW_CONFIGURATIONS_BY_ID: AC_ROUTES_V2.WINDOW_CONFIGURATIONS_BY_ID,
  CONNECTORS: AC_ROUTES_V2.CONNECTORS,
  CONNECTORS_BY_ID: AC_ROUTES_V2.CONNECTORS_BY_ID,
  APP_INSTALLATIONS: AC_ROUTES_V2.APP_INSTALLATIONS,
  APP_INSTALLATIONS_BY_ID: AC_ROUTES_V2.APP_INSTALLATIONS_BY_ID,
  WIDGETS: AC_ROUTES_V2.WIDGETS,
  WIDGETS_BY_ID: AC_ROUTES_V2.WIDGETS_BY_ID,
  ACCOUNT_PROPERTIES: AC_ROUTES_V2.ACCOUNT_PROPERTIES,
  ACCOUNT_PROPERTIES_BY_ID: AC_ROUTES_V2.ACCOUNT_PROPERTIES_BY_ID,
  ACCOUNT_FEATURES: AC_ROUTES_V2.ACCOUNT_FEATURES,
};

// Export separate v1 and v2 routes for explicit usage
export { AC_ROUTES_V1, AC_ROUTES_V2 };

export const ACTION_KEYS_AC = {
  GET_SERVICE_WORKERS: "GET_SERVICE_WORKERS",
  GET_SERVICE_WORKER_BY_ID: "GET_SERVICE_WORKER_BY_ID",
  DELETE_SERVICE_WORKER: "DELETE_SERVICE_WORKER",
  CREATE_SERVICE_WORKER: "CREATE_SERVICE_WORKER",

  AGENT_GROUPS_GET: "AGENT_GROUPS_GET",
  AGENT_GROUPS_GET_BY_ID: "AGENT_GROUPS_GET_BY_ID",
  AGENT_GROUPS_CREATE: "AGENT_GROUPS_CREATE",
  AGENT_GROUPS_UPDATE: "AGENT_GROUPS_UPDATE",
  AGENT_GROUPS_DELETE: "AGENT_GROUPS_DELETE",

  SPECIAL_OCCASIONS_GET: "SPECIAL_OCCASIONS_GET",
  SPECIAL_OCCASIONS_GET_BY_ID: "SPECIAL_OCCASIONS_GET_BY_ID",
  SPECIAL_OCCASIONS_CREATE: "SPECIAL_OCCASIONS_CREATE",
  SPECIAL_OCCASIONS_UPDATE: "SPECIAL_OCCASIONS_UPDATE",
  SPECIAL_OCCASIONS_DELETE: "SPECIAL_OCCASIONS_DELETE",

  WORKING_HOURS_GET: "WORKING_HOURS_GET",
  WORKING_HOURS_GET_BY_ID: "WORKING_HOURS_GET_BY_ID",
  WORKING_HOURS_CREATE: "WORKING_HOURS_CREATE",
  WORKING_HOURS_UPDATE: "WORKING_HOURS_UPDATE",
  WORKING_HOURS_DELETE: "WORKING_HOURS_DELETE",

  AUTOMATIC_MESSAGES_GET: "AUTOMATIC_MESSAGES_GET",
  AUTOMATIC_MESSAGES_GET_DEFAULT: "AUTOMATIC_MESSAGES_GET_DEFAULT",
  AUTOMATIC_MESSAGES_GET_BY_ID: "AUTOMATIC_MESSAGES_GET_BY_ID",
  AUTOMATIC_MESSAGES_CREATE: "AUTOMATIC_MESSAGES_CREATE",
  AUTOMATIC_MESSAGES_UPDATE: "AUTOMATIC_MESSAGES_UPDATE",
  AUTOMATIC_MESSAGES_DELETE: "AUTOMATIC_MESSAGES_DELETE",

  PREDEFINED_CONTENT_GET: "PREDEFINED_CONTENT_GET",
  PREDEFINED_CONTENT_GET_BY_ID: "PREDEFINED_CONTENT_GET_BY_ID",
  PREDEFINED_CONTENT_CREATE: "PREDEFINED_CONTENT_CREATE",
  PREDEFINED_CONTENT_UPDATE: "PREDEFINED_CONTENT_UPDATE",
  PREDEFINED_CONTENT_DELETE: "PREDEFINED_CONTENT_DELETE",

  PROFILES_GET: "PROFILES_GET",
  PROFILES_GET_BY_ID: "PROFILES_GET_BY_ID",
  PROFILES_CREATE: "PROFILES_CREATE",
  PROFILES_UPDATE: "PROFILES_UPDATE",
  PROFILES_DELETE: "PROFILES_DELETE",

  LOBS_GET: "LOBS_GET",
  LOBS_GET_BY_ID: "LOBS_GET_BY_ID",
  LOBS_CREATE: "LOBS_CREATE",
  LOBS_UPDATE: "LOBS_UPDATE",
  LOBS_DELETE: "LOBS_DELETE",

  ENGAGEMENT_DELETE: "ENGAGEMENT_DELETE",
  ENGAGEMENT_CREATE: "ENGAGEMENT_CREATE",
  ENGAGEMENT_UPDATE: "ENGAGEMENT_UPDATE",
  ENGAGEMENT_GET_ALL: "ENGAGEMENT_GET_ALL",
  ENGAGEMENT_GET_BY_ID: "ENGAGEMENT_GET_BY_ID",
  APP_KEYS_GET: "APP_KEYS_GET",

  CAMPAIGNS_GET_ALL: "CAMPAIGNS_GET_ALL",
  CAMPAIGNS_GET_BY_ID: "CAMPAIGNS_GET_BY_ID",
  CAMPAIGNS_CREATE: "CAMPAIGNS_CREATE",
  CAMPAIGNS_UPDATE: "CAMPAIGNS_UPDATE",
  CAMPAIGNS_DELETE: "CAMPAIGNS_DELETE",
  CAMPAIGNS_BY_ID: "CAMPAIGNS_BY_ID",

  APPLICATION_GET: "APPLICATION_GET",
  APPLICATION_UPDATE: "APPLICATION_UPDATE",

  BRAND_GET: "BRAND_GET",
  BRAND_UPDATE: "BRAND_UPDATE",

  CONFIG_GET: "CONFIG_GET",
  CONFIG_GET_ALL: "CONFIG_GET_ALL",
  CONFIG_UPDATE: "CONFIG_UPDATE",

  SKILL_DELETE: "SKILL_DELETE",
  SKILL_CREATE: "SKILL_CREATE",
  SKILL_UPDATE: "SKILL_UPDATE",
  SKILL_GET_ALL: "SKILL_GET_ALL",
  SKILL_GET_BY_ID: "SKILL_GET_BY_ID",
  SKILL_DEPENDENCIES: "SKILL_DEPENDENCIES",
  SKILL_SMART_DELETE: "SKILL_SMART_DELETE",

  USERS_GET: "USERS_GET",
  USERS_GET_BY_ID: "USERS_GET_BY_ID",
  USERS_UPDATE: "USERS_UPDATE",
  USERS_CREATE: "USERS_CREATE",
  USERS_DELETE: "USERS_DELETE",
  USERS_SELF: "USERS_SELF",
  USERS_BATCH: "USERS_BATCH",
  USERS_BATCH_REMOVE_SKILL: "USERS_BATCH_REMOVE_SKILL",

  // New v2 action keys for additional APIs
  GOALS_GET: "GOALS_GET",
  GOALS_GET_BY_ID: "GOALS_GET_BY_ID",
  GOALS_CREATE: "GOALS_CREATE",
  GOALS_UPDATE: "GOALS_UPDATE",
  GOALS_DELETE: "GOALS_DELETE",

  VISITOR_PROFILES_GET: "VISITOR_PROFILES_GET",
  VISITOR_PROFILES_GET_BY_ID: "VISITOR_PROFILES_GET_BY_ID",

  VISITOR_BEHAVIORS_GET: "VISITOR_BEHAVIORS_GET",
  VISITOR_BEHAVIORS_GET_BY_ID: "VISITOR_BEHAVIORS_GET_BY_ID",

  ONSITE_LOCATIONS_GET: "ONSITE_LOCATIONS_GET",
  ONSITE_LOCATIONS_GET_BY_ID: "ONSITE_LOCATIONS_GET_BY_ID",

  WINDOW_CONFIGURATIONS_GET: "WINDOW_CONFIGURATIONS_GET",
  WINDOW_CONFIGURATIONS_GET_BY_ID: "WINDOW_CONFIGURATIONS_GET_BY_ID",

  CONNECTORS_GET: "CONNECTORS_GET",
  CONNECTORS_GET_BY_ID: "CONNECTORS_GET_BY_ID",

  APP_INSTALLATIONS_GET: "APP_INSTALLATIONS_GET",
  APP_INSTALLATIONS_GET_BY_ID: "APP_INSTALLATIONS_GET_BY_ID",
  APP_INSTALLATIONS_CREATE: "APP_INSTALLATIONS_CREATE",
  APP_INSTALLATIONS_UPDATE: "APP_INSTALLATIONS_UPDATE",
  APP_INSTALLATIONS_DELETE: "APP_INSTALLATIONS_DELETE",

  WIDGETS_GET: "WIDGETS_GET",
  WIDGETS_GET_BY_ID: "WIDGETS_GET_BY_ID",
  WIDGETS_CREATE: "WIDGETS_CREATE",
  WIDGETS_UPDATE: "WIDGETS_UPDATE",
  WIDGETS_DELETE: "WIDGETS_DELETE",

  ACCOUNT_PROPERTIES_GET: "ACCOUNT_PROPERTIES_GET",
  ACCOUNT_PROPERTIES_GET_BY_ID: "ACCOUNT_PROPERTIES_GET_BY_ID",
  ACCOUNT_PROPERTIES_CREATE: "ACCOUNT_PROPERTIES_CREATE",
  ACCOUNT_PROPERTIES_UPDATE: "ACCOUNT_PROPERTIES_UPDATE",

  // Account Features (Feature Grants)
  ACCOUNT_FEATURES_GET: "ACCOUNT_FEATURES_GET",
  ACCOUNT_FEATURES_UPDATE: "ACCOUNT_FEATURES_UPDATE",

  // Conversation Orchestrator
  CO_KB_RULES_GET: "CO_KB_RULES_GET",
  CO_KB_RULES_GET_BY_ID: "CO_KB_RULES_GET_BY_ID",
  CO_KB_RULES_CREATE: "CO_KB_RULES_CREATE",
  CO_KB_RULES_UPDATE: "CO_KB_RULES_UPDATE",
  CO_KB_RULES_DELETE: "CO_KB_RULES_DELETE",
  CO_BOT_RULES_GET: "CO_BOT_RULES_GET",
  CO_BOT_RULES_GET_BY_ID: "CO_BOT_RULES_GET_BY_ID",
  CO_BOT_RULES_CREATE: "CO_BOT_RULES_CREATE",
  CO_BOT_RULES_UPDATE: "CO_BOT_RULES_UPDATE",
  CO_BOT_RULES_DELETE: "CO_BOT_RULES_DELETE",
  CO_AGENT_PREFERENCES_GET: "CO_AGENT_PREFERENCES_GET",
  CO_AGENT_PREFERENCES_UPDATE: "CO_AGENT_PREFERENCES_UPDATE",

  // FaaS
  FAAS_LAMBDAS_GET: "FAAS_LAMBDAS_GET",
  FAAS_LAMBDAS_GET_BY_ID: "FAAS_LAMBDAS_GET_BY_ID",
  FAAS_LAMBDAS_CREATE: "FAAS_LAMBDAS_CREATE",
  FAAS_LAMBDAS_UPDATE: "FAAS_LAMBDAS_UPDATE",
  FAAS_LAMBDAS_DELETE: "FAAS_LAMBDAS_DELETE",
  FAAS_SCHEDULES_GET: "FAAS_SCHEDULES_GET",
  FAAS_SCHEDULES_GET_BY_ID: "FAAS_SCHEDULES_GET_BY_ID",
  FAAS_SCHEDULES_CREATE: "FAAS_SCHEDULES_CREATE",
  FAAS_SCHEDULES_UPDATE: "FAAS_SCHEDULES_UPDATE",
  FAAS_SCHEDULES_DELETE: "FAAS_SCHEDULES_DELETE",
  FAAS_PROXY_SETTINGS_GET: "FAAS_PROXY_SETTINGS_GET",
  FAAS_PROXY_SETTINGS_CREATE: "FAAS_PROXY_SETTINGS_CREATE",
  FAAS_PROXY_SETTINGS_DELETE: "FAAS_PROXY_SETTINGS_DELETE",
};

export const SWHheaders: QTableProps["columns"] = [
  {
    name: "enabled",
    required: false,
    label: "Key enabled",
    align: "left",
    field: "enabled",
    style: "max-width: 50px",
  },
  {
    name: "appName",
    required: false,
    label: "App Key",
    align: "left",
    field: "appName",
  },
  {
    name: "id",
    required: false,
    label: "Key ID",
    align: "left",
    field: "id",
  },
  {
    name: "isEnabled",
    required: false,
    label: "User enabled",
    align: "left",
    field: "isEnabled",
  },
  {
    name: "loginName",
    required: false,
    label: "Agent Login",
    align: "left",
    field: "loginName",
    style: "max-width: 300px; white-space: normal",
  },
  {
    name: "userId",
    required: false,
    label: "user ID",
    align: "left",
    field: "userId",
  },

  {
    name: "select",
    required: false,
    label: "select",
    align: "left",
    field: "select",
  },
];

export enum SettingProperty {
  CURRENCY = "le.general.currency",
  TIMEZONE = "le.general.timezone",
  ACCOUNT_ID = "le.general.accountId",
  LOB_ENABLED = "lob.enabled",
  AUTH_LOGIN_SYSTEM = "le.auth.login.system",
  INTENT_ANALYZER_CONTRACT_SIGNED_DATE = "intelligence.intentAnalyzer.contractSigned.date",
  INTENT_ANALYZER_MAX_DOMAINS = "intelligence.intentAnalyzer.maxDomains",
  MANAGER_WORKSPACE_METRICS_CONFIGURATION = "le.agent.messaging.managerWorkspaceMetricsConfiguration",
  ROUTING_SETTINGS_SOURCE = "le.site.routingSettings.source",
  ACD_RESPONSE_TIME_UNIT = "messaging.ACD.response.time.unit",
  ROUTING_AUTOACCEPT = "messaging.routing.autoaccept",
  WRAP_UP_TIME = "wrap.up.time",
  FALLBACK_TO_SKILL_ON_INVALID_TRANSFER_STATE = "messaging.fallback.to.skill.on.invalid.transfer.state",
  AGENT_WEBHOOK_EVENTS_ENABLED = "message.routing.agent.webhook.events.enabled",
  ACD_MANUAL_AUTOFOCUS_CONVERSATION = "messaging.ACD.manual.autoFocusConversation",
  RING_FOR_ALL_ENABLE = "messaging.ring.for.all.enable",
  ACD_RESPONSE_TIME = "messaging.ACD.response.time",
  SOCIAL_SETTINGS_TWITTER = "social.settings.twitter",
  MC_FIRST_TIME = "le.mc.first.time",
  LLM_BRAND_DETAILS = "lp.llm.brandDetails",
  TWITTER_AGENT_ACCOUNT_REPLY_CHOOSE_ENABLED = "socialmessaging.connectors.twitter.agent.accountReplyChoose.enabled",
  FACEBOOK_METADATA_ENABLED = "socialmessaging.connectors.facebook.metadata.enabled",
  UI_DATASOURCE_ENABLED = "socialmessaging.ui.datasource.enabled",
  STEP_UP_NOTIFICATIONS = "messaging.stepUpNotifications",
  AUTO_MESSAGES_SOURCE = "le.site.autoMessages.source",
  FILE_SHARING_ENABLED = "messaging.file.sharing.enabled",
  AGENT_FILE_SHARING_ENABLED = "messaging.agent.file.sharing.enabled",
  DEFAULT_RESPONSE_TIME_URGENT_UNIT = "messaging.default.response.time.urgent.unit",
  DEFAULT_RESPONSE_URGENT_TIME = "messaging.default.response.urgent.time",
  DEFAULT_RESPONSE_TIME = "messaging.default.response.time",
  DEFAULT_RESPONSE_TIME_UNIT = "messaging.default.response.time.unit",
  DEFAULT_RESPONSE_PRIORITIZED_TIME = "messaging.default.response.prioritized.time",
  DEFAULT_RESPONSE_TIME_PRIORITIZED_UNIT = "messaging.default.response.time.prioritized.unit",
  AGENT_SURVEY_SUPPORT = "le.agent.survey.support",
  CANNED_RESPONSES_SOURCE = "le.site.cannedResponses.source",
  CONVERSIONS_WINDOW_SIZE = "le.conversions.window.size",
  CAMPAIGN_ENGAGEMENT_CAPPING = "le.campaign.engagement.capping",
  BLOCK_CONSUMER_HISTORY = "unauth.messaging.block.consumer.history",
  CAMPAIGN_CAPPING = "le.campaign.capping",
  CAMPAIGN_CONTROLGROUP = "le.campaign.controlgroup",
  CAMPAIGN_DEPENDENCY_INDICATOR_MAX_ITEMS_TO_DISPLAY = "le.campaign.dependencyIndicator.maxItemsToDisplay",
  MESSAGING_ATTRIBUTION = "le.general.messaging.attribution",
  CAMPAIGN_SHOW_HISTORY_CLOSED_MESSAGING = "le.campaign.show.history.closed.messaging",
  CAMPAIGN_REINVITE_AFTER_DECLINE = "le.campaign.reinviteAfterDecline",
  CAMPAIGN_UN_AUTH_MESSAGING = "le.campaign.un.auth.messaging",
  GENERAL_ATTRIBUTION = "le.general.attribution",
  USERS_SOURCE = "le.site.users.source",
  FILTER_SECURE_FORMS = "messaging.FilterSecureForms",
  ACCOUNT_INFO = "le.site.accountInfo",
  BOT_MUTE_NOTIFICATION = "messaging.bot.mute.notification",
  BRAND_ROLLOVER_CONFIG = "messaging.brand.rollover.config",
  PROFILE_LOGO_URL = "account.profile.logo.url",
  LANGUAGE = "le.general.language",
  THEME = "le.general.theme",
}
