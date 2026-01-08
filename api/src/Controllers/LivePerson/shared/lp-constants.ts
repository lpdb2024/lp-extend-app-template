/**
 * LivePerson API Constants
 * Central location for all LP service domains, API versions, and enums
 */

/**
 * LivePerson Service Domain Names
 * Used with Domain API to resolve base URLs
 */
export enum LP_SERVICE_DOMAINS {
  // Account Configuration
  ACCOUNT_CONFIG_READ = 'accountConfigReadOnly',
  ACCOUNT_CONFIG_WRITE = 'accountConfigReadWrite',

  // Messaging & History
  MSG_HIST = 'msgHist',
  ENG_HIST = 'engHistDomain',
  ASYNC_MESSAGING = 'asyncMessagingEnt',

  // Agent & Operations
  AGENT_VEP = 'agentVep',
  AGENT_MANAGER = 'agentManagerWorkspace',
  AGENT_ACTIVITY = 'agentActivityDomain',
  LE_DATA_REPORTING = 'leDataReporting',

  // Authentication
  SENTINEL = 'sentinel',

  // App Management
  APP_KEY_MANAGEMENT = 'appKeyManagement',

  // Conversation Builder / AI
  CB_LE_INTEGRATIONS = 'cbLeIntegrations',
  CB_SSO = 'convBuild',
  CB_MGMT = 'bcmgmt',
  CB_INTG = 'bcintg',
  CB_NLU = 'bcnlu',
  AI_STUDIO = 'aistudio',
  BOT = 'bot',
  BOT_PLATFORM = 'botPlatform',
  BOT_LOGS = 'botlogs',
  KB = 'kb',
  CONTEXT = 'context',
  RECOMMENDATION = 'recommendation',

  // Proactive Messaging
  PROACTIVE = 'proactive',
  PROACTIVE_HANDOFF = 'proactiveHandoff',

  // Other
  MC_FEATURE = 'mcfeature',
  LIVE_ENGAGE_UI = 'liveEngageUI',

  // Prompt Library
  PROMPT_LIBRARY = 'promptlibrary',

  // Conversation Orchestrator (Intent ID / Conversation Assist)
  CORE_AI_INTENT = 'coreAIIntent',

  // FaaS (LivePerson Functions)
  FAAS_UI = 'faasUI',
}

/**
 * LivePerson API Versions by Service
 */
export enum LP_API_VERSIONS {
  // Account Config APIs
  USERS = '6.0',
  SKILLS = '2.0',
  AGENT_GROUPS = '2.0',
  PROFILES = '4.0',
  LOBS = '2.0',
  PREDEFINED_CONTENT = '2.0',
  AUTOMATIC_MESSAGES = '2.0',
  WORKING_HOURS = '1.0',
  SPECIAL_OCCASIONS = '1.0',
  STATUS_REASONS = '2.0',
  CAMPAIGNS = '3.4',
  GOALS = '3.0',
  VISITOR_PROFILES = '2.0',
  VISITOR_BEHAVIORS = '2.0',
  ONSITE_LOCATIONS = '3.0',
  ACCOUNT_SETTINGS = '3.0',
  WIDGETS = '2.0',

  // App Management
  APP_INSTALL = '1.0',
  APP_KEYS = '1.0',

  // Connector API
  CONNECTORS = '2.0',

  // Prompt Library
  PROMPTS = '2.0',

  // Messaging History
  MSG_HIST_CONVERSATIONS = '1.0',

  // Messaging Operations
  MSG_OPERATIONS = '1',

  // Connect to Messaging
  CONNECT_TO_MESSAGING = '1.0',

  // Login
  LOGIN = '1.3',
  SENTINEL_TOKEN = '2.0',
}

/**
 * LivePerson API Path Templates
 * Use with string interpolation for accountId
 */
export const LP_API_PATHS = {
  // Account Config - Users
  USERS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-users/users`,
    BY_ID: (accountId: string, userId: string) =>
      `/api/account/${accountId}/configuration/le-users/users/${userId}`,
    BATCH: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-users/users/batch`,
  },

  // Account Config - Skills
  SKILLS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-users/skills`,
    BY_ID: (accountId: string, skillId: string) =>
      `/api/account/${accountId}/configuration/le-users/skills/${skillId}`,
  },

  // Account Config - Agent Groups
  AGENT_GROUPS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-users/agentGroups`,
    BY_ID: (accountId: string, groupId: string) =>
      `/api/account/${accountId}/configuration/le-users/agentGroups/${groupId}`,
  },

  // Account Config - Profiles
  PROFILES: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-users/profiles`,
    BY_ID: (accountId: string, profileId: string) =>
      `/api/account/${accountId}/configuration/le-users/profiles/${profileId}`,
  },

  // Account Config - LOBs
  LOBS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-users/lobs`,
    BY_ID: (accountId: string, lobId: string) =>
      `/api/account/${accountId}/configuration/le-users/lobs/${lobId}`,
  },

  // Account Config - Predefined Content
  PREDEFINED_CONTENT: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/engagement-window/canned-responses`,
    BY_ID: (accountId: string, contentId: string) =>
      `/api/account/${accountId}/configuration/engagement-window/canned-responses/${contentId}`,
  },

  // Account Config - Automatic Messages
  AUTOMATIC_MESSAGES: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/engagement-window/unified-auto-messages`,
    BY_ID: (accountId: string, messageId: string) =>
      `/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}`,
    DEFAULTS: (accountId: string) =>
      `/api/account/default/configuration/engagement-window/unified-auto-messages-defaults`,
  },

  // Account Config - Working Hours
  WORKING_HOURS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/ac-common/workinghours`,
    BY_ID: (accountId: string, workingHoursId: string) =>
      `/api/account/${accountId}/configuration/ac-common/workinghours/${workingHoursId}`,
  },

  // Account Config - Special Occasions
  SPECIAL_OCCASIONS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/ac-common/specialoccasion`,
    BY_ID: (accountId: string, occasionId: string) =>
      `/api/account/${accountId}/configuration/ac-common/specialoccasion/${occasionId}`,
  },

  // Account Config - Status Reasons
  STATUS_REASONS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-agents/status-reasons`,
    BY_ID: (accountId: string, reasonId: string) =>
      `/api/account/${accountId}/configuration/le-agents/status-reasons/${reasonId}`,
  },

  // Account Config - Campaigns
  CAMPAIGNS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-campaigns/campaigns`,
    BY_ID: (accountId: string, campaignId: string) =>
      `/api/account/${accountId}/configuration/le-campaigns/campaigns/${campaignId}`,
  },

  // Account Config - Engagements
  ENGAGEMENTS: {
    BASE: (accountId: string, campaignId: string) =>
      `/api/account/${accountId}/configuration/le-campaigns/campaigns/${campaignId}/engagements`,
    BY_ID: (accountId: string, campaignId: string, engagementId: string) =>
      `/api/account/${accountId}/configuration/le-campaigns/campaigns/${campaignId}/engagements/${engagementId}`,
  },

  // Account Config - Goals
  GOALS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-goals/goals`,
    BY_ID: (accountId: string, goalId: string) =>
      `/api/account/${accountId}/configuration/le-goals/goals/${goalId}`,
  },

  // Account Config - Visitor Profiles
  VISITOR_PROFILES: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-targeting/visitor-profiles`,
    BY_ID: (accountId: string, profileId: string) =>
      `/api/account/${accountId}/configuration/le-targeting/visitor-profiles/${profileId}`,
  },

  // Connector API (Third-party messaging connectors)
  CONNECTORS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-connectors/connectors`,
    BY_ID: (accountId: string, connectorId: string) =>
      `/api/account/${accountId}/configuration/le-connectors/connectors/${connectorId}`,
  },

  // App Installations (Installed Applications)
  APP_INSTALLATIONS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/app-install/installations`,
    BY_ID: (accountId: string, appId: string) =>
      `/api/account/${accountId}/configuration/app-install/installations/${appId}`,
  },

  // UI Personalization - Widgets
  WIDGETS: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/le-ui-personalization/widgets`,
    BY_ID: (accountId: string, widgetId: string) =>
      `/api/account/${accountId}/configuration/le-ui-personalization/widgets/${widgetId}`,
  },

  // Account Settings - Properties
  ACCOUNT_PROPERTIES: {
    BASE: (accountId: string) =>
      `/api/account/${accountId}/configuration/setting/properties`,
    BY_ID: (accountId: string, propertyId: string) =>
      `/api/account/${accountId}/configuration/setting/properties/${propertyId}`,
  },

  // Messaging History
  MSG_HIST: {
    CONVERSATIONS: (accountId: string) =>
      `/messaging_history/api/account/${accountId}/conversations/search`,
    CONVERSATION_BY_ID: (accountId: string) =>
      `/messaging_history/api/account/${accountId}/conversations/conversation/search`,
    CONVERSATIONS_BY_CONSUMER: (accountId: string) =>
      `/messaging_history/api/account/${accountId}/conversations/consumer/search`,
  },

  // Messaging Operations (Real-time)
  MSG_OPERATIONS: {
    CONVERSATION: (accountId: string) =>
      `/operations/api/account/${accountId}/msgconversation`,
    QUEUE_HEALTH: (accountId: string) =>
      `/operations/api/account/${accountId}/msgqueuehealth`,
    CURRENT_QUEUE_HEALTH: (accountId: string) =>
      `/operations/api/account/${accountId}/msgqueuehealth/current`,
    CSAT_DISTRIBUTION: (accountId: string) =>
      `/operations/api/account/${accountId}/msgcsatdistribution`,
    SKILL_SEGMENT: (accountId: string) =>
      `/operations/api/account/${accountId}/msgskillsegments`,
    AGENT_SEGMENT: (accountId: string) =>
      `/operations/api/account/${accountId}/msgagentsegments`,
  },

  // Domain API
  DOMAINS: {
    ALL: (accountId: string) =>
      `/api/account/${accountId}/service/baseURI.json`,
    BY_SERVICE: (accountId: string, serviceName: string) =>
      `/api/account/${accountId}/service/${serviceName}/baseURI.json`,
  },

  // Key Messaging Metrics (agentManagerWorkspace domain)
  KEY_MESSAGING_METRICS: {
    METRICS: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/metrics`,
    AGENT_VIEW: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent_view`,
    HISTORICAL: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/historical`,
  },

  // Agent Activity (agentActivityDomain)
  AGENT_ACTIVITY: {
    STATUS_CHANGES: (accountId: string) =>
      `/api/v2/account/${accountId}/status-changes`,
    STATUS_CHANGES_V1: (accountId: string) =>
      `/api/account/${accountId}/status-changes`,
    INTERVAL_METRICS: (accountId: string) =>
      `/api/account/${accountId}/interval-metrics`,
  },

  // Actual Handle Time (agentActivityDomain - same domain)
  ACTUAL_HANDLE_TIME: {
    AGENT_SEGMENTS: (accountId: string) =>
      `/api/account/${accountId}/agent-segments`,
    BREAKDOWN_FILES: (accountId: string) =>
      `/api/account/${accountId}/agent-segments/breakdown`,
    BREAKDOWN_FILE: (accountId: string) =>
      `/api/account/${accountId}/agent-segments/files`,
  },

  // Net Handle Time (agentActivityDomain - same domain)
  NET_HANDLE_TIME: {
    AGENT_SEGMENTS: (accountId: string) =>
      `/api/account/${accountId}/net-agent-segments`,
    BREAKDOWN_FILES: (accountId: string) =>
      `/api/account/${accountId}/net-agent-segments/breakdown`,
    BREAKDOWN_FILE: (accountId: string) =>
      `/api/account/${accountId}/net-agent-segments/files`,
  },

  // Agent Metrics (agentManagerWorkspace domain - Operational Realtime)
  AGENT_METRICS: {
    STATES: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/states`,
    LOAD: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/load`,
    UTILIZATION: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/utilization`,
    ACTIVITY: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/activity`,
    PERFORMANCE: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/performance`,
    TIME_SERIES: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/time-series`,
    SKILLS: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/skills`,
    GROUPS: (accountId: string) =>
      `/manager_workspace/api/account/${accountId}/agent-metrics/groups`,
  },

  // Message Routing (asyncMessagingEnt domain)
  MESSAGE_ROUTING: {
    // Routing Tasks
    TASKS: (accountId: string) =>
      `/api/account/${accountId}/routing/tasks`,
    TASK_BY_ID: (accountId: string, taskId: string) =>
      `/api/account/${accountId}/routing/tasks/${taskId}`,
    TASK_CANCEL: (accountId: string, taskId: string) =>
      `/api/account/${accountId}/routing/tasks/${taskId}/cancel`,

    // Routing Rules
    RULES: (accountId: string) =>
      `/api/account/${accountId}/routing/rules`,
    RULE_BY_ID: (accountId: string, ruleId: string) =>
      `/api/account/${accountId}/routing/rules/${ruleId}`,

    // Skill Routing Configuration
    SKILL_CONFIG: (accountId: string, skillId: number) =>
      `/api/account/${accountId}/routing/skills/${skillId}/config`,

    // Agent Availability
    AGENT_AVAILABILITY: (accountId: string, agentId: string) =>
      `/api/account/${accountId}/routing/agents/${agentId}/availability`,
    AGENTS_AVAILABILITY: (accountId: string) =>
      `/api/account/${accountId}/routing/agents/availability`,

    // Queue Management
    QUEUE_STATUS: (accountId: string, skillId: number) =>
      `/api/account/${accountId}/routing/queues/${skillId}`,
    QUEUES_STATUS: (accountId: string) =>
      `/api/account/${accountId}/routing/queues`,

    // Transfer
    TRANSFER: (accountId: string) =>
      `/api/account/${accountId}/routing/transfer`,
    TRANSFER_BY_ID: (accountId: string, transferId: string) =>
      `/api/account/${accountId}/routing/transfer/${transferId}`,
  },

  // Proactive Messaging
  PROACTIVE_MESSAGING: {
    CAMPAIGNS: (accountId: string) =>
      `/api/v2/account/${accountId}/campaign`,
    CAMPAIGN_BY_ID: (accountId: string, campaignId: string) =>
      `/api/v2/account/${accountId}/campaign/${campaignId}`,
    CAMPAIGN_ACTIVATE: (accountId: string, campaignId: string) =>
      `/api/v2/account/${accountId}/campaign/${campaignId}/activate`,
    CAMPAIGN_PAUSE: (accountId: string, campaignId: string) =>
      `/api/v2/account/${accountId}/campaign/${campaignId}/pause`,
    CAMPAIGN_CANCEL: (accountId: string, campaignId: string) =>
      `/api/v2/account/${accountId}/campaign/${campaignId}/cancel`,
    HANDOFFS: (accountId: string) =>
      `/api/account/${accountId}/app/prmsg/handoffs/list`,
    HANDOFF_BY_ID: (accountId: string, handoffId: string) =>
      `/api/account/${accountId}/app/prmsg/handoffs/${handoffId}`,
    TEST_MESSAGE: (accountId: string) =>
      `/api/v2/account/${accountId}/test-message`,
  },

  // Connect to Messaging (asyncMessagingEnt domain)
  CONNECT_TO_MESSAGING: {
    CREATE_CONVERSATION: (accountId: string) =>
      `/api/account/${accountId}/c2m/conversation`,
    SEND_MESSAGE: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/c2m/conversation/${conversationId}/message`,
    CLOSE_CONVERSATION: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/c2m/conversation/${conversationId}/close`,
    TRANSFER_CONVERSATION: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/c2m/conversation/${conversationId}/transfer`,
    GET_CONVERSATION: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/c2m/conversation/${conversationId}`,
    GET_CAPABILITIES: (accountId: string) =>
      `/api/account/${accountId}/c2m/capabilities`,
  },

  // Outbound Reporting (leDataReporting domain)
  OUTBOUND_REPORTING: {
    CAMPAIGNS: (accountId: string) =>
      `/api/account/${accountId}/outbound/campaigns`,
    CAMPAIGN_BY_ID: (accountId: string, campaignId: string) =>
      `/api/account/${accountId}/outbound/campaigns/${campaignId}`,
    MESSAGES: (accountId: string) =>
      `/api/account/${accountId}/outbound/messages`,
    CAMPAIGN_PERFORMANCE: (accountId: string, campaignId: string) =>
      `/api/account/${accountId}/outbound/campaigns/${campaignId}/performance`,
    AGENT_ACTIVITY: (accountId: string) =>
      `/api/account/${accountId}/outbound/agents/activity`,
    SKILL_METRICS: (accountId: string) =>
      `/api/account/${accountId}/outbound/skills/metrics`,
  },

  // Messaging REST API (Connector API - asyncMessagingEnt domain)
  MSG_REST: {
    CREATE_CONVERSATION: (accountId: string) =>
      `/api/account/${accountId}/messaging/consumer/conversation`,
    CONVERSATIONS: (accountId: string) =>
      `/api/account/${accountId}/messaging/consumer/conversations`,
    CONVERSATION_BY_ID: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/messaging/consumer/conversation/${conversationId}`,
    SEND_MESSAGE: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/messaging/consumer/conversation/${conversationId}/event`,
    CONSUMER_PROFILE: (accountId: string, consumerId: string) =>
      `/api/account/${accountId}/messaging/consumer/profile/${consumerId}`,
    SUBSCRIBE_EVENTS: (accountId: string) =>
      `/api/account/${accountId}/messaging/consumer/conversation/subscribe`,
    UNSUBSCRIBE_EVENTS: (accountId: string, conversationId: string) =>
      `/api/account/${accountId}/messaging/consumer/conversation/${conversationId}/unsubscribe`,
  },

  // Prompt Library (promptlibrary domain)
  PROMPTS: {
    SYSTEM: () => `/v2/system/prompts`,
    ACCOUNT: (accountId: string) => `/v2/accounts/${accountId}/prompts`,
    ACCOUNT_BY_ID: (accountId: string, promptId: string) =>
      `/v2/accounts/${accountId}/prompts/${promptId}`,
    LLM_PROVIDERS: (accountId: string) =>
      `/v2/accounts/${accountId}/configurations/llm-providers`,
  },
} as const;

/**
 * Common query parameters for LP APIs
 */
export const LP_QUERY_PARAMS = {
  SELECT_ALL: 'select=$all',
  INCLUDE_DELETED: 'include_deleted=true',
  SOURCE_CCUI: 'source=ccui',
} as const;

/**
 * Standard HTTP headers for LP APIs
 */
export const LP_HEADERS = {
  CONTENT_TYPE_JSON: 'application/json',
  ACCEPT_JSON: 'application/json',
  IF_MATCH: 'If-Match',
  AC_REVISION: 'ac-revision',
  ETAG: 'eTag',
} as const;

/**
 * User Types in LivePerson
 */
export enum LP_USER_TYPES {
  HUMAN = 0,
  BOT = 1,
  SYSTEM = 2,
}

/**
 * Role Type IDs in LivePerson
 */
export enum LP_ROLE_TYPES {
  AGENT = 1,
  AGENT_MANAGER = 2,
  CAMPAIGN_MANAGER = 3,
  ADMIN = 4,
  LPA = 5,
}

/**
 * Conversation Status
 */
export enum LP_CONVERSATION_STATUS {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

/**
 * Queue States
 */
export enum LP_QUEUE_STATES {
  IN_QUEUE = 'IN_QUEUE',
  ACTIVE = 'ACTIVE',
}
