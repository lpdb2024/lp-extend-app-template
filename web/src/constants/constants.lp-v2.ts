/**
 * LivePerson API v2 Routes
 * These routes connect to the new NestJS backend v2 API structure
 * which provides strongly-typed interfaces for all LP APIs
 */

import { V2 } from "./constants";

// =============================================================================
// Account Configuration Routes (Contact Center Management)
// =============================================================================

export const LP_ACCOUNT_CONFIG_ROUTES = {
  // Base path for account config
  BASE: (accountId: string) => `${V2}/account-config/${accountId}`,

  // Skills
  SKILLS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/skills`,
  SKILL_BY_ID: (accountId: string, skillId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.SKILLS(accountId)}/${skillId}`,

  // Users
  USERS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/users`,
  USER_BY_ID: (accountId: string, userId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.USERS(accountId)}/${userId}`,

  // Agent Groups
  AGENT_GROUPS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/agent-groups`,
  AGENT_GROUP_BY_ID: (accountId: string, agentGroupId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.AGENT_GROUPS(accountId)}/${agentGroupId}`,

  // Profiles
  PROFILES: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/profiles`,
  PROFILE_BY_ID: (accountId: string, profileId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.PROFILES(accountId)}/${profileId}`,

  // Lines of Business
  LOBS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/lobs`,
  LOB_BY_ID: (accountId: string, lobId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.LOBS(accountId)}/${lobId}`,

  // Predefined Content
  PREDEFINED_CONTENT: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/predefined-content`,
  PREDEFINED_CONTENT_BY_ID: (accountId: string, contentId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.PREDEFINED_CONTENT(accountId)}/${contentId}`,

  // Automatic Messages
  AUTOMATIC_MESSAGES: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/automatic-messages`,
  AUTOMATIC_MESSAGE_BY_ID: (accountId: string, messageId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.AUTOMATIC_MESSAGES(accountId)}/${messageId}`,

  // Working Hours
  WORKING_HOURS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/working-hours`,
  WORKING_HOURS_BY_ID: (accountId: string, workingHoursId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.WORKING_HOURS(accountId)}/${workingHoursId}`,

  // Special Occasions
  SPECIAL_OCCASIONS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/special-occasions`,
  SPECIAL_OCCASION_BY_ID: (accountId: string, occasionId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.SPECIAL_OCCASIONS(accountId)}/${occasionId}`,

  // Campaigns
  CAMPAIGNS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/campaigns`,
  CAMPAIGN_BY_ID: (accountId: string, campaignId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.CAMPAIGNS(accountId)}/${campaignId}`,

  // Engagements (under campaigns)
  ENGAGEMENTS: (accountId: string, campaignId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.CAMPAIGN_BY_ID(accountId, campaignId)}/engagements`,
  ENGAGEMENT_BY_ID: (accountId: string, campaignId: string | number, engagementId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.ENGAGEMENTS(accountId, campaignId)}/${engagementId}`,

  // Goals
  GOALS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/goals`,
  GOAL_BY_ID: (accountId: string, goalId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.GOALS(accountId)}/${goalId}`,

  // Visitor Profiles
  VISITOR_PROFILES: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/visitor-profiles`,
  VISITOR_PROFILE_BY_ID: (accountId: string, profileId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.VISITOR_PROFILES(accountId)}/${profileId}`,

  // Visitor Behaviors
  VISITOR_BEHAVIORS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/visitor-behaviors`,
  VISITOR_BEHAVIOR_BY_ID: (accountId: string, behaviorId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.VISITOR_BEHAVIORS(accountId)}/${behaviorId}`,

  // Onsite Locations
  ONSITE_LOCATIONS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/onsite-locations`,
  ONSITE_LOCATION_BY_ID: (accountId: string, locationId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.ONSITE_LOCATIONS(accountId)}/${locationId}`,

  // Window Configurations
  WINDOW_CONFIGURATIONS: (accountId: string) => `${LP_ACCOUNT_CONFIG_ROUTES.BASE(accountId)}/window-configurations`,
  WINDOW_CONFIGURATION_BY_ID: (accountId: string, windowId: string | number) =>
    `${LP_ACCOUNT_CONFIG_ROUTES.WINDOW_CONFIGURATIONS(accountId)}/${windowId}`,
};

// =============================================================================
// Messaging History Routes
// =============================================================================

export const LP_MESSAGING_HISTORY_ROUTES = {
  BASE: (accountId: string) => `${V2}/messaging-history/${accountId}`,
  CONVERSATIONS: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.BASE(accountId)}/conversations`,

  // Search conversations with filters
  SEARCH: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/search`,

  // Get conversation(s) by ID
  BY_ID: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/by-id`,

  // Get conversations by consumer
  BY_CONSUMER: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/by-consumer`,

  // Get open conversations
  OPEN: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/open`,

  // Get recent closed conversations
  RECENT_CLOSED: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/recent-closed`,

  // Get conversation with full transcript
  TRANSCRIPT: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/${conversationId}/transcript`,

  // Search conversations by keyword
  SEARCH_KEYWORD: (accountId: string) => `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/search-keyword`,

  // Legacy route for backwards compatibility
  CONVERSATION_BY_ID: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/${conversationId}`,
  CONVERSATIONS_BY_CONSUMER: (accountId: string) =>
    `${LP_MESSAGING_HISTORY_ROUTES.CONVERSATIONS(accountId)}/by-consumer`,
};

// =============================================================================
// Messaging Operations Routes (Real-time)
// =============================================================================

export const LP_MESSAGING_OPERATIONS_ROUTES = {
  BASE: (accountId: string) => `${V2}/messaging-operations/${accountId}`,
  QUEUE_HEALTH: (accountId: string) => `${LP_MESSAGING_OPERATIONS_ROUTES.BASE(accountId)}/queue-health`,
  MESSAGING_CURRENT_QUEUE: (accountId: string) => `${LP_MESSAGING_OPERATIONS_ROUTES.BASE(accountId)}/current-queue`,
  ENGAGEMENT_ACTIVITY: (accountId: string) => `${LP_MESSAGING_OPERATIONS_ROUTES.BASE(accountId)}/engagement-activity`,
  AGENT_ACTIVITY: (accountId: string) => `${LP_MESSAGING_OPERATIONS_ROUTES.BASE(accountId)}/agent-activity`,
  SLA_HISTOGRAM: (accountId: string) => `${LP_MESSAGING_OPERATIONS_ROUTES.BASE(accountId)}/sla-histogram`,
};

// =============================================================================
// Key Messaging Metrics Routes (Reporting)
// =============================================================================

export const LP_KEY_MESSAGING_METRICS_ROUTES = {
  BASE: (accountId: string) => `${V2}/key-messaging-metrics/${accountId}`,
  SUMMARY: (accountId: string) => `${LP_KEY_MESSAGING_METRICS_ROUTES.BASE(accountId)}/summary`,
  BY_TIME: (accountId: string) => `${LP_KEY_MESSAGING_METRICS_ROUTES.BASE(accountId)}/by-time`,
  BY_SKILL: (accountId: string) => `${LP_KEY_MESSAGING_METRICS_ROUTES.BASE(accountId)}/by-skill`,
  BY_AGENT: (accountId: string) => `${LP_KEY_MESSAGING_METRICS_ROUTES.BASE(accountId)}/by-agent`,
  BY_AGENT_GROUP: (accountId: string) => `${LP_KEY_MESSAGING_METRICS_ROUTES.BASE(accountId)}/by-agent-group`,
};

// =============================================================================
// Agent Activity Routes
// =============================================================================

export const LP_AGENT_ACTIVITY_ROUTES = {
  BASE: (accountId: string) => `${V2}/agent-activity/${accountId}`,
  STATUS: (accountId: string) => `${LP_AGENT_ACTIVITY_ROUTES.BASE(accountId)}/status`,
  METRICS: (accountId: string) => `${LP_AGENT_ACTIVITY_ROUTES.BASE(accountId)}/metrics`,
  DISTRIBUTION: (accountId: string) => `${LP_AGENT_ACTIVITY_ROUTES.BASE(accountId)}/distribution`,
};

// =============================================================================
// Agent Metrics Routes (Operational Realtime)
// =============================================================================

export const LP_AGENT_METRICS_ROUTES = {
  BASE: (accountId: string) => `${V2}/agent-metrics/${accountId}`,
  LIST: (accountId: string) => `${LP_AGENT_METRICS_ROUTES.BASE(accountId)}/list`,
  SUMMARY: (accountId: string) => `${LP_AGENT_METRICS_ROUTES.BASE(accountId)}/summary`,
  BY_AGENT: (accountId: string, agentId: string | number) =>
    `${LP_AGENT_METRICS_ROUTES.BASE(accountId)}/agent/${agentId}`,
  BY_SKILL: (accountId: string, skillId: string | number) =>
    `${LP_AGENT_METRICS_ROUTES.BASE(accountId)}/skill/${skillId}`,
};

// =============================================================================
// Actual Handle Time Routes (Beta)
// =============================================================================

export const LP_ACTUAL_HANDLE_TIME_ROUTES = {
  BASE: (accountId: string) => `${V2}/actual-handle-time/${accountId}`,
  BY_AGENT: (accountId: string) => `${LP_ACTUAL_HANDLE_TIME_ROUTES.BASE(accountId)}/by-agent`,
  BY_SKILL: (accountId: string) => `${LP_ACTUAL_HANDLE_TIME_ROUTES.BASE(accountId)}/by-skill`,
  BY_TIME: (accountId: string) => `${LP_ACTUAL_HANDLE_TIME_ROUTES.BASE(accountId)}/by-time`,
};

// =============================================================================
// Net Handle Time Routes (Beta)
// =============================================================================

export const LP_NET_HANDLE_TIME_ROUTES = {
  BASE: (accountId: string) => `${V2}/net-handle-time/${accountId}`,
  BY_AGENT: (accountId: string) => `${LP_NET_HANDLE_TIME_ROUTES.BASE(accountId)}/by-agent`,
  BY_SKILL: (accountId: string) => `${LP_NET_HANDLE_TIME_ROUTES.BASE(accountId)}/by-skill`,
  BY_TIME: (accountId: string) => `${LP_NET_HANDLE_TIME_ROUTES.BASE(accountId)}/by-time`,
};

// =============================================================================
// Proactive Messaging Routes
// =============================================================================

export const LP_PROACTIVE_MESSAGING_ROUTES = {
  BASE: (accountId: string) => `${V2}/proactive-messaging/${accountId}`,

  // Campaigns
  CAMPAIGNS: (accountId: string) => `${LP_PROACTIVE_MESSAGING_ROUTES.BASE(accountId)}/campaigns`,
  CAMPAIGN_BY_ID: (accountId: string, campaignId: string) =>
    `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGNS(accountId)}/${campaignId}`,
  ACTIVATE_CAMPAIGN: (accountId: string, campaignId: string) =>
    `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGN_BY_ID(accountId, campaignId)}/activate`,
  PAUSE_CAMPAIGN: (accountId: string, campaignId: string) =>
    `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGN_BY_ID(accountId, campaignId)}/pause`,
  CANCEL_CAMPAIGN: (accountId: string, campaignId: string) =>
    `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGN_BY_ID(accountId, campaignId)}/cancel`,

  // Active/Scheduled/Draft campaigns (convenience)
  ACTIVE_CAMPAIGNS: (accountId: string) => `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGNS(accountId)}/status/active`,
  SCHEDULED_CAMPAIGNS: (accountId: string) => `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGNS(accountId)}/status/scheduled`,
  DRAFT_CAMPAIGNS: (accountId: string) => `${LP_PROACTIVE_MESSAGING_ROUTES.CAMPAIGNS(accountId)}/status/draft`,

  // Handoffs
  HANDOFFS: (accountId: string) => `${LP_PROACTIVE_MESSAGING_ROUTES.BASE(accountId)}/handoffs`,
  HANDOFF_BY_ID: (accountId: string, handoffId: string) =>
    `${LP_PROACTIVE_MESSAGING_ROUTES.HANDOFFS(accountId)}/${handoffId}`,

  // Test Message
  TEST_MESSAGE: (accountId: string) => `${LP_PROACTIVE_MESSAGING_ROUTES.BASE(accountId)}/test-message`,
};

// =============================================================================
// Outbound Reporting Routes
// =============================================================================

export const LP_OUTBOUND_REPORTING_ROUTES = {
  BASE: (accountId: string) => `${V2}/outbound-reporting/${accountId}`,
  CAMPAIGNS: (accountId: string) => `${LP_OUTBOUND_REPORTING_ROUTES.BASE(accountId)}/campaigns`,
  CAMPAIGN_BY_ID: (accountId: string, campaignId: string) =>
    `${LP_OUTBOUND_REPORTING_ROUTES.CAMPAIGNS(accountId)}/${campaignId}`,
  MESSAGES: (accountId: string) => `${LP_OUTBOUND_REPORTING_ROUTES.BASE(accountId)}/messages`,
  PERFORMANCE: (accountId: string, campaignId: string) =>
    `${LP_OUTBOUND_REPORTING_ROUTES.CAMPAIGN_BY_ID(accountId, campaignId)}/performance`,
  AGENT_ACTIVITY: (accountId: string) => `${LP_OUTBOUND_REPORTING_ROUTES.BASE(accountId)}/agent-activity`,
  SKILL_METRICS: (accountId: string) => `${LP_OUTBOUND_REPORTING_ROUTES.BASE(accountId)}/skill-metrics`,
};

// =============================================================================
// Message Routing Routes
// =============================================================================

export const LP_MESSAGE_ROUTING_ROUTES = {
  BASE: (accountId: string) => `${V2}/message-routing/${accountId}`,

  // Routing Tasks
  TASKS: (accountId: string) => `${LP_MESSAGE_ROUTING_ROUTES.BASE(accountId)}/tasks`,
  TASK_BY_ID: (accountId: string, taskId: string) =>
    `${LP_MESSAGE_ROUTING_ROUTES.TASKS(accountId)}/${taskId}`,

  // Routing Rules
  RULES: (accountId: string) => `${LP_MESSAGE_ROUTING_ROUTES.BASE(accountId)}/rules`,
  RULE_BY_ID: (accountId: string, ruleId: string) =>
    `${LP_MESSAGE_ROUTING_ROUTES.RULES(accountId)}/${ruleId}`,

  // Skill Routing Configuration
  SKILL_CONFIG: (accountId: string, skillId: string | number) =>
    `${LP_MESSAGE_ROUTING_ROUTES.BASE(accountId)}/skills/${skillId}/config`,

  // Agent Availability
  AGENT_AVAILABILITY: (accountId: string) => `${LP_MESSAGE_ROUTING_ROUTES.BASE(accountId)}/agents/availability`,
  AGENT_AVAILABILITY_BY_ID: (accountId: string, agentId: string | number) =>
    `${LP_MESSAGE_ROUTING_ROUTES.AGENT_AVAILABILITY(accountId)}/${agentId}`,

  // Queue Status
  QUEUE_STATUS: (accountId: string) => `${LP_MESSAGE_ROUTING_ROUTES.BASE(accountId)}/queues/status`,
  QUEUE_BY_SKILL: (accountId: string, skillId: string | number) =>
    `${LP_MESSAGE_ROUTING_ROUTES.QUEUE_STATUS(accountId)}/${skillId}`,

  // Transfer
  TRANSFER: (accountId: string) => `${LP_MESSAGE_ROUTING_ROUTES.BASE(accountId)}/transfer`,
};

// =============================================================================
// Connect to Messaging Routes (IVR/Voice to Messaging)
// =============================================================================

export const LP_CONNECT_TO_MESSAGING_ROUTES = {
  BASE: (accountId: string) => `${V2}/connect-to-messaging/${accountId}`,
  CONVERSATIONS: (accountId: string) => `${LP_CONNECT_TO_MESSAGING_ROUTES.BASE(accountId)}/conversations`,
  CONVERSATION_BY_ID: (accountId: string, conversationId: string) =>
    `${LP_CONNECT_TO_MESSAGING_ROUTES.CONVERSATIONS(accountId)}/${conversationId}`,
  SEND_MESSAGE: (accountId: string, conversationId: string) =>
    `${LP_CONNECT_TO_MESSAGING_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/messages`,
  CLOSE_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_CONNECT_TO_MESSAGING_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/close`,
  TRANSFER_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_CONNECT_TO_MESSAGING_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/transfer`,
  CAPABILITIES: (accountId: string) => `${LP_CONNECT_TO_MESSAGING_ROUTES.BASE(accountId)}/capabilities`,
};

// =============================================================================
// Connector API Routes (Third-party messaging connectors)
// =============================================================================

export const LP_CONNECTOR_ROUTES = {
  BASE: (accountId: string) => `${V2}/connector/${accountId}`,
  CONVERSATIONS: (accountId: string) => `${LP_CONNECTOR_ROUTES.BASE(accountId)}/conversations`,
  CONVERSATION_BY_ID: (accountId: string, conversationId: string) =>
    `${LP_CONNECTOR_ROUTES.CONVERSATIONS(accountId)}/${conversationId}`,
  SEND_MESSAGE: (accountId: string, conversationId: string) =>
    `${LP_CONNECTOR_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/messages`,
  CLOSE_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_CONNECTOR_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/close`,
  RESOLVE_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_CONNECTOR_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/resolve`,
  TRANSFER_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_CONNECTOR_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/transfer`,
  SET_TTR: (accountId: string, conversationId: string) =>
    `${LP_CONNECTOR_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/ttr`,
  CONSUMER_PROFILE: (accountId: string) => `${LP_CONNECTOR_ROUTES.BASE(accountId)}/consumer-profile`,
};

// =============================================================================
// Messaging REST API Routes
// =============================================================================

export const LP_MESSAGING_REST_ROUTES = {
  BASE: (accountId: string) => `${V2}/messaging-rest/${accountId}`,
  CONVERSATIONS: (accountId: string) => `${LP_MESSAGING_REST_ROUTES.BASE(accountId)}/conversations`,
  CONVERSATION_BY_ID: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_REST_ROUTES.CONVERSATIONS(accountId)}/${conversationId}`,
  SEND_MESSAGE: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_REST_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/messages`,
  CLOSE_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_REST_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/close`,
  TRANSFER_CONVERSATION: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_REST_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/transfer`,
  UPDATE_CONVERSATION_FIELD: (accountId: string, conversationId: string) =>
    `${LP_MESSAGING_REST_ROUTES.CONVERSATION_BY_ID(accountId, conversationId)}/field`,
  SUBSCRIBE_EVENTS: (accountId: string) => `${LP_MESSAGING_REST_ROUTES.BASE(accountId)}/events/subscribe`,
  UNSUBSCRIBE_EVENTS: (accountId: string) => `${LP_MESSAGING_REST_ROUTES.BASE(accountId)}/events/unsubscribe`,
  CONSUMER_PROFILE: (accountId: string, consumerId: string) =>
    `${LP_MESSAGING_REST_ROUTES.BASE(accountId)}/consumers/${consumerId}/profile`,
};

// =============================================================================
// Action Keys for v2 LP APIs
// =============================================================================

export const LP_V2_ACTION_KEYS = {
  // Skills
  SKILLS_GET_ALL: "LP_V2_SKILLS_GET_ALL",
  SKILLS_GET_BY_ID: "LP_V2_SKILLS_GET_BY_ID",
  SKILLS_CREATE: "LP_V2_SKILLS_CREATE",
  SKILLS_UPDATE: "LP_V2_SKILLS_UPDATE",
  SKILLS_DELETE: "LP_V2_SKILLS_DELETE",

  // Users
  USERS_GET_ALL: "LP_V2_USERS_GET_ALL",
  USERS_GET_BY_ID: "LP_V2_USERS_GET_BY_ID",
  USERS_CREATE: "LP_V2_USERS_CREATE",
  USERS_UPDATE: "LP_V2_USERS_UPDATE",
  USERS_DELETE: "LP_V2_USERS_DELETE",

  // Agent Groups
  AGENT_GROUPS_GET_ALL: "LP_V2_AGENT_GROUPS_GET_ALL",
  AGENT_GROUPS_GET_BY_ID: "LP_V2_AGENT_GROUPS_GET_BY_ID",
  AGENT_GROUPS_CREATE: "LP_V2_AGENT_GROUPS_CREATE",
  AGENT_GROUPS_UPDATE: "LP_V2_AGENT_GROUPS_UPDATE",
  AGENT_GROUPS_DELETE: "LP_V2_AGENT_GROUPS_DELETE",

  // Profiles
  PROFILES_GET_ALL: "LP_V2_PROFILES_GET_ALL",
  PROFILES_GET_BY_ID: "LP_V2_PROFILES_GET_BY_ID",

  // LOBs
  LOBS_GET_ALL: "LP_V2_LOBS_GET_ALL",
  LOBS_GET_BY_ID: "LP_V2_LOBS_GET_BY_ID",
  LOBS_CREATE: "LP_V2_LOBS_CREATE",
  LOBS_UPDATE: "LP_V2_LOBS_UPDATE",
  LOBS_DELETE: "LP_V2_LOBS_DELETE",

  // Campaigns
  CAMPAIGNS_GET_ALL: "LP_V2_CAMPAIGNS_GET_ALL",
  CAMPAIGNS_GET_BY_ID: "LP_V2_CAMPAIGNS_GET_BY_ID",
  CAMPAIGNS_CREATE: "LP_V2_CAMPAIGNS_CREATE",
  CAMPAIGNS_UPDATE: "LP_V2_CAMPAIGNS_UPDATE",
  CAMPAIGNS_DELETE: "LP_V2_CAMPAIGNS_DELETE",

  // Engagements
  ENGAGEMENTS_GET_ALL: "LP_V2_ENGAGEMENTS_GET_ALL",
  ENGAGEMENTS_GET_BY_ID: "LP_V2_ENGAGEMENTS_GET_BY_ID",
  ENGAGEMENTS_CREATE: "LP_V2_ENGAGEMENTS_CREATE",
  ENGAGEMENTS_UPDATE: "LP_V2_ENGAGEMENTS_UPDATE",
  ENGAGEMENTS_DELETE: "LP_V2_ENGAGEMENTS_DELETE",

  // Messaging History
  CONVERSATIONS_SEARCH: "LP_V2_CONVERSATIONS_SEARCH",
  CONVERSATION_GET_BY_ID: "LP_V2_CONVERSATION_GET_BY_ID",
  CONVERSATIONS_BY_CONSUMER: "LP_V2_CONVERSATIONS_BY_CONSUMER",
  CONVERSATIONS_OPEN: "LP_V2_CONVERSATIONS_OPEN",
  CONVERSATIONS_RECENT_CLOSED: "LP_V2_CONVERSATIONS_RECENT_CLOSED",
  CONVERSATION_TRANSCRIPT: "LP_V2_CONVERSATION_TRANSCRIPT",
  CONVERSATIONS_SEARCH_KEYWORD: "LP_V2_CONVERSATIONS_SEARCH_KEYWORD",

  // Messaging Operations
  QUEUE_HEALTH_GET: "LP_V2_QUEUE_HEALTH_GET",
  ENGAGEMENT_ACTIVITY_GET: "LP_V2_ENGAGEMENT_ACTIVITY_GET",
  AGENT_ACTIVITY_GET: "LP_V2_AGENT_ACTIVITY_GET",

  // Agent Metrics
  AGENT_METRICS_LIST: "LP_V2_AGENT_METRICS_LIST",
  AGENT_METRICS_SUMMARY: "LP_V2_AGENT_METRICS_SUMMARY",

  // Proactive Messaging
  PROACTIVE_CAMPAIGNS_GET: "LP_V2_PROACTIVE_CAMPAIGNS_GET",
  PROACTIVE_CAMPAIGN_CREATE: "LP_V2_PROACTIVE_CAMPAIGN_CREATE",
  PROACTIVE_HANDOFFS_GET: "LP_V2_PROACTIVE_HANDOFFS_GET",
  PROACTIVE_TEST_MESSAGE: "LP_V2_PROACTIVE_TEST_MESSAGE",
};
