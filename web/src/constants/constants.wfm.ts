/**
 * WFM Dashboard Constants
 * Routes and action keys for workforce management functionality
 */

import { V2 } from "./constants";

// =============================================================================
// WFM Dashboard Routes (uses existing LP v2 APIs)
// =============================================================================

export const WFM_ROUTES = {
  // Agent Metrics (real-time)
  AGENT_METRICS_STATES: (accountId: string) => `${V2}/agent-metrics/${accountId}/states`,
  AGENT_METRICS_LOAD: (accountId: string) => `${V2}/agent-metrics/${accountId}/load`,
  AGENT_METRICS_UTILIZATION: (accountId: string) => `${V2}/agent-metrics/${accountId}/utilization`,
  AGENT_METRICS_ACTIVITY: (accountId: string) => `${V2}/agent-metrics/${accountId}/activity`,
  AGENT_METRICS_PERFORMANCE: (accountId: string) => `${V2}/agent-metrics/${accountId}/performance`,
  AGENT_METRICS_ONLINE: (accountId: string) => `${V2}/agent-metrics/${accountId}/online`,
  AGENT_METRICS_AVAILABLE: (accountId: string) => `${V2}/agent-metrics/${accountId}/available`,
  AGENT_METRICS_OVERLOADED: (accountId: string) => `${V2}/agent-metrics/${accountId}/overloaded`,
  AGENT_METRICS_BY_SKILL: (accountId: string) => `${V2}/agent-metrics/${accountId}/skills`,
  AGENT_METRICS_BY_GROUP: (accountId: string) => `${V2}/agent-metrics/${accountId}/groups`,
  AGENT_METRICS_TRENDS: (accountId: string) => `${V2}/agent-metrics/${accountId}/trends/activity`,

  // Messaging Operations (queue health)
  QUEUE_HEALTH: (accountId: string) => `${V2}/messaging-operations/${accountId}/queue-health`,
  QUEUE_HEALTH_CURRENT: (accountId: string) => `${V2}/messaging-operations/${accountId}/queue-health/current`,
  QUEUE_SUMMARY: (accountId: string) => `${V2}/messaging-operations/${accountId}/queue-summary`,
  CONVERSATION_METRICS: (accountId: string) => `${V2}/messaging-operations/${accountId}/conversation`,
  SKILL_SEGMENT: (accountId: string) => `${V2}/messaging-operations/${accountId}/skill-segment`,
  AGENT_SEGMENT: (accountId: string) => `${V2}/messaging-operations/${accountId}/agent-segment`,
  CSAT_DISTRIBUTION: (accountId: string) => `${V2}/messaging-operations/${accountId}/csat-distribution`,
  HOURLY_METRICS: (accountId: string) => `${V2}/messaging-operations/${accountId}/hourly-metrics`,

  // Key Messaging Metrics
  KMM_METRICS: (accountId: string) => `${V2}/key-messaging-metrics/${accountId}/metrics`,
  KMM_AGENT_VIEW: (accountId: string) => `${V2}/key-messaging-metrics/${accountId}/agent-view`,
  KMM_ONLINE_AGENTS: (accountId: string) => `${V2}/key-messaging-metrics/${accountId}/online-agents`,
  KMM_QUEUE_METRICS: (accountId: string) => `${V2}/key-messaging-metrics/${accountId}/queue-metrics`,
  KMM_HISTORICAL: (accountId: string) => `${V2}/key-messaging-metrics/${accountId}/historical`,

  // Agent Activity (historical)
  AGENT_STATUS_CHANGES: (accountId: string) => `${V2}/agent-activity/${accountId}/status-changes`,
  AGENT_INTERVAL_METRICS: (accountId: string) => `${V2}/agent-activity/${accountId}/interval-metrics`,
  AGENT_SESSIONS: (accountId: string) => `${V2}/agent-activity/${accountId}/sessions`,
};

// =============================================================================
// WFM Action Keys
// =============================================================================

export const WFM_ACTION_KEYS = {
  // Agent Metrics
  GET_AGENT_STATES: "WFM_GET_AGENT_STATES",
  GET_AGENT_LOAD: "WFM_GET_AGENT_LOAD",
  GET_AGENT_UTILIZATION: "WFM_GET_AGENT_UTILIZATION",
  GET_AGENT_ACTIVITY: "WFM_GET_AGENT_ACTIVITY",
  GET_AGENT_PERFORMANCE: "WFM_GET_AGENT_PERFORMANCE",
  GET_ONLINE_AGENTS: "WFM_GET_ONLINE_AGENTS",
  GET_AVAILABLE_AGENTS: "WFM_GET_AVAILABLE_AGENTS",
  GET_OVERLOADED_AGENTS: "WFM_GET_OVERLOADED_AGENTS",
  GET_SKILL_METRICS: "WFM_GET_SKILL_METRICS",
  GET_GROUP_METRICS: "WFM_GET_GROUP_METRICS",
  GET_ACTIVITY_TRENDS: "WFM_GET_ACTIVITY_TRENDS",

  // Queue Health
  GET_QUEUE_HEALTH: "WFM_GET_QUEUE_HEALTH",
  GET_QUEUE_CURRENT: "WFM_GET_QUEUE_CURRENT",
  GET_QUEUE_SUMMARY: "WFM_GET_QUEUE_SUMMARY",
  GET_CONVERSATION_METRICS: "WFM_GET_CONVERSATION_METRICS",
  GET_SKILL_SEGMENT: "WFM_GET_SKILL_SEGMENT",
  GET_CSAT_DISTRIBUTION: "WFM_GET_CSAT_DISTRIBUTION",
  GET_HOURLY_METRICS: "WFM_GET_HOURLY_METRICS",

  // KMM
  GET_KMM_METRICS: "WFM_GET_KMM_METRICS",
  GET_KMM_AGENT_VIEW: "WFM_GET_KMM_AGENT_VIEW",

  // Agent Activity
  GET_STATUS_CHANGES: "WFM_GET_STATUS_CHANGES",
  GET_INTERVAL_METRICS: "WFM_GET_INTERVAL_METRICS",
};
