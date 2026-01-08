/**
 * Command Center Constants
 * Routes and action keys for the Agent Manager Command Center
 */

import { V2 } from "./constants";

// =============================================================================
// Command Center Routes
// =============================================================================

export const CC_ROUTES = {
  // Dashboard
  DASHBOARD_SUMMARY: (accountId: string) => `${V2}/command-center/${accountId}/dashboard/summary`,
  DASHBOARD_TRENDS: (accountId: string) => `${V2}/command-center/${accountId}/dashboard/trends`,

  // Agents
  AGENTS: (accountId: string) => `${V2}/command-center/${accountId}/agents`,
  AGENT_DETAIL: (accountId: string, agentId: string) => `${V2}/command-center/${accountId}/agents/${agentId}`,
  AGENT_STATUS: (accountId: string, agentId: string) => `${V2}/command-center/${accountId}/agents/${agentId}/status`,
  AGENT_METRICS: (accountId: string, agentId: string) => `${V2}/command-center/${accountId}/agents/${agentId}/metrics`,

  // Conversations
  CONVERSATIONS: (accountId: string) => `${V2}/command-center/${accountId}/conversations`,
  CONVERSATION_DETAIL: (accountId: string, convId: string) => `${V2}/command-center/${accountId}/conversations/${convId}`,
  CONVERSATION_TRANSCRIPT: (accountId: string, convId: string) => `${V2}/command-center/${accountId}/conversations/${convId}/transcript`,
  BULK_ACTION: (accountId: string) => `${V2}/command-center/${accountId}/conversations/bulk`,

  // Queue
  QUEUE_HEALTH: (accountId: string) => `${V2}/command-center/${accountId}/queue/health`,
  QUEUE_BY_SKILL: (accountId: string) => `${V2}/command-center/${accountId}/queue/by-skill`,
  SKILL_METRICS: (accountId: string) => `${V2}/command-center/${accountId}/skills/metrics`,

  // WFM
  SHIFTS: (accountId: string) => `${V2}/command-center/${accountId}/wfm/shifts`,
  SHIFT_DETAIL: (accountId: string, shiftId: string) => `${V2}/command-center/${accountId}/wfm/shifts/${shiftId}`,
  SHIFT_TEMPLATES: (accountId: string) => `${V2}/command-center/${accountId}/wfm/templates`,
  IMPORT_SHIFTS: (accountId: string) => `${V2}/command-center/${accountId}/wfm/import`,

  // Adherence
  ADHERENCE_SUMMARY: (accountId: string) => `${V2}/command-center/${accountId}/adherence/summary`,
  ADHERENCE_AGENTS: (accountId: string) => `${V2}/command-center/${accountId}/adherence/agents`,
  ADHERENCE_RULES: (accountId: string) => `${V2}/command-center/${accountId}/adherence/rules`,
  ADHERENCE_RULE: (accountId: string, ruleId: string) => `${V2}/command-center/${accountId}/adherence/rules/${ruleId}`,

  // Alerts
  ALERTS: (accountId: string) => `${V2}/command-center/${accountId}/alerts`,
  ALERT_DETAIL: (accountId: string, alertId: string) => `${V2}/command-center/${accountId}/alerts/${alertId}`,
  ALERT_ACKNOWLEDGE: (accountId: string, alertId: string) => `${V2}/command-center/${accountId}/alerts/${alertId}/acknowledge`,
  ALERT_RESOLVE: (accountId: string, alertId: string) => `${V2}/command-center/${accountId}/alerts/${alertId}/resolve`,
  ALERT_RULES: (accountId: string) => `${V2}/command-center/${accountId}/alerts/rules`,
  ALERT_INJECT: (accountId: string) => `${V2}/command-center/${accountId}/alerts/inject`,

  // Communication
  BROADCAST: (accountId: string) => `${V2}/command-center/${accountId}/communication/broadcast`,
  HAND_RAISES: (accountId: string) => `${V2}/command-center/${accountId}/communication/hand-raises`,
  HAND_RAISE_RESPOND: (accountId: string, raiseId: string) => `${V2}/command-center/${accountId}/communication/hand-raises/${raiseId}/respond`,

  // QA
  QA_QUEUE: (accountId: string) => `${V2}/command-center/${accountId}/qa/queue`,
  QA_REVIEW: (accountId: string, reviewId: string) => `${V2}/command-center/${accountId}/qa/reviews/${reviewId}`,
  SCORECARDS: (accountId: string) => `${V2}/command-center/${accountId}/qa/scorecards`,
  SCORECARD: (accountId: string, scorecardId: string) => `${V2}/command-center/${accountId}/qa/scorecards/${scorecardId}`,

  // Forecasting (Legacy - Messaging Interactions API)
  FORECASTING_STATUS: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/status`,
  FORECASTING_METRICS: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/metrics`,
  FORECASTING_BACKFILL_START: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/backfill/start`,
  FORECASTING_BACKFILL_JOBS: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/backfill/jobs`,
  FORECASTING_BACKFILL_JOB: (accountId: string, jobId: string) => `${V2}/command-center/${accountId}/forecasting/backfill/jobs/${jobId}`,
  FORECASTING_BACKFILL_RUNNING: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/backfill/running`,
  FORECASTING_BACKFILL_CANCEL: (accountId: string, jobId: string) => `${V2}/command-center/${accountId}/forecasting/backfill/cancel/${jobId}`,
  FORECASTING_SYNC: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/sync`,
  FORECASTING_HEATMAP: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/heatmap`,
  FORECASTING_STAFFING: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/staffing`,
  FORECASTING_ERLANG_C: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/erlang-c`,
  FORECASTING_SLA_CONFIG: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/sla-config`,
  FORECASTING_SLA_CONFIG_SKILL: (accountId: string, skillId: number) => `${V2}/command-center/${accountId}/forecasting/sla-config/${skillId}`,
  FORECASTING_WEEKLY: (accountId: string) => `${V2}/command-center/${accountId}/forecasting/forecast`,

  // WFM Reports (Agent Activity API - 14 day rolling)
  WFM_DASHBOARD: (accountId: string) => `${V2}/command-center/${accountId}/wfm/dashboard`,
  WFM_AGENT_PERFORMANCE: (accountId: string) => `${V2}/command-center/${accountId}/wfm/agent-performance`,
  WFM_HEATMAP: (accountId: string) => `${V2}/command-center/${accountId}/wfm/heatmap`,
  WFM_FORECAST: (accountId: string) => `${V2}/command-center/${accountId}/wfm/forecast`,
  WFM_TEST_LP_API: (accountId: string) => `${V2}/command-center/${accountId}/wfm/test-lp-api`,

  // Widgets
  WIDGETS: (accountId: string) => `${V2}/command-center/${accountId}/widgets`,
  WIDGET: (accountId: string, widgetId: string) => `${V2}/command-center/${accountId}/widgets/${widgetId}`,
  WIDGET_CONTEXT: (accountId: string) => `${V2}/command-center/${accountId}/widgets/context`,
};

// =============================================================================
// Command Center Action Keys
// =============================================================================

export enum CC_ACTION_KEYS {
  // Dashboard
  GET_DASHBOARD_SUMMARY = "CC_GET_DASHBOARD_SUMMARY",
  GET_DASHBOARD_TRENDS = "CC_GET_DASHBOARD_TRENDS",

  // Agents
  GET_AGENTS = "CC_GET_AGENTS",
  GET_AGENT_DETAIL = "CC_GET_AGENT_DETAIL",
  UPDATE_AGENT_STATUS = "CC_UPDATE_AGENT_STATUS",
  GET_AGENT_METRICS = "CC_GET_AGENT_METRICS",

  // Conversations
  GET_CONVERSATIONS = "CC_GET_CONVERSATIONS",
  GET_CONVERSATION_DETAIL = "CC_GET_CONVERSATION_DETAIL",
  GET_CONVERSATION_TRANSCRIPT = "CC_GET_CONVERSATION_TRANSCRIPT",
  EXECUTE_BULK_ACTION = "CC_EXECUTE_BULK_ACTION",

  // Queue
  GET_QUEUE_HEALTH = "CC_GET_QUEUE_HEALTH",
  GET_QUEUE_BY_SKILL = "CC_GET_QUEUE_BY_SKILL",
  GET_SKILL_METRICS = "CC_GET_SKILL_METRICS",

  // WFM
  GET_SHIFTS = "CC_GET_SHIFTS",
  CREATE_SHIFT = "CC_CREATE_SHIFT",
  UPDATE_SHIFT = "CC_UPDATE_SHIFT",
  DELETE_SHIFT = "CC_DELETE_SHIFT",
  IMPORT_SHIFTS = "CC_IMPORT_SHIFTS",

  // Adherence
  GET_ADHERENCE_SUMMARY = "CC_GET_ADHERENCE_SUMMARY",
  GET_ADHERENCE_AGENTS = "CC_GET_ADHERENCE_AGENTS",
  GET_ADHERENCE_RULES = "CC_GET_ADHERENCE_RULES",
  CREATE_ADHERENCE_RULE = "CC_CREATE_ADHERENCE_RULE",
  UPDATE_ADHERENCE_RULE = "CC_UPDATE_ADHERENCE_RULE",

  // Alerts
  GET_ALERTS = "CC_GET_ALERTS",
  ACKNOWLEDGE_ALERT = "CC_ACKNOWLEDGE_ALERT",
  RESOLVE_ALERT = "CC_RESOLVE_ALERT",
  GET_ALERT_RULES = "CC_GET_ALERT_RULES",
  INJECT_ALERT = "CC_INJECT_ALERT",

  // Communication
  SEND_BROADCAST = "CC_SEND_BROADCAST",
  GET_HAND_RAISES = "CC_GET_HAND_RAISES",
  RESPOND_HAND_RAISE = "CC_RESPOND_HAND_RAISE",

  // QA
  GET_QA_QUEUE = "CC_GET_QA_QUEUE",
  SUBMIT_QA_REVIEW = "CC_SUBMIT_QA_REVIEW",
  GET_SCORECARDS = "CC_GET_SCORECARDS",

  // Widgets
  GET_WIDGETS = "CC_GET_WIDGETS",
  INSTALL_WIDGET = "CC_INSTALL_WIDGET",
  UNINSTALL_WIDGET = "CC_UNINSTALL_WIDGET",
}

// =============================================================================
// Command Center Navigation
// =============================================================================

export interface CCNavItem {
  name: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

export const CC_NAV_ITEMS: CCNavItem[] = [
  { name: 'dashboard', label: 'Dashboard', icon: 'sym_o_dashboard' },
  { name: 'agents', label: 'Agents', icon: 'sym_o_support_agent' },
  { name: 'conversations', label: 'Conversations', icon: 'sym_o_forum' },
  { name: 'forecasting', label: 'Forecasting', icon: 'sym_o_analytics' },
  { name: 'wfm', label: 'Scheduling', icon: 'sym_o_calendar_month' },
  { name: 'adherence', label: 'Adherence', icon: 'sym_o_schedule' },
  { name: 'alerts', label: 'Alerts', icon: 'sym_o_notifications' },
  { name: 'communication', label: 'Team', icon: 'sym_o_group' },
  { name: 'qa', label: 'QA', icon: 'sym_o_fact_check' },
  { name: 'widgets', label: 'Widgets', icon: 'sym_o_widgets' },
];

// =============================================================================
// Status Colors & Icons
// =============================================================================

export const AGENT_STATUS_CONFIG = {
  ONLINE: { color: 'positive', icon: 'sym_o_circle', label: 'Online' },
  AWAY: { color: 'warning', icon: 'sym_o_do_not_disturb_on', label: 'Away' },
  BACK_SOON: { color: 'info', icon: 'sym_o_schedule', label: 'Back Soon' },
  OFFLINE: { color: 'grey', icon: 'sym_o_circle', label: 'Offline' },
};

export const AGENT_STATE_CONFIG = {
  AVAILABLE: { color: 'positive', label: 'Available' },
  BUSY: { color: 'warning', label: 'Busy' },
  OCCUPIED: { color: 'negative', label: 'At Capacity' },
};

export const ALERT_SEVERITY_CONFIG = {
  critical: { color: 'negative', icon: 'sym_o_error', label: 'Critical' },
  warning: { color: 'warning', icon: 'sym_o_warning', label: 'Warning' },
  info: { color: 'info', icon: 'sym_o_info', label: 'Info' },
};

export const SENTIMENT_CONFIG = {
  positive: { color: 'positive', icon: 'sym_o_sentiment_satisfied', label: 'Positive' },
  neutral: { color: 'grey', icon: 'sym_o_sentiment_neutral', label: 'Neutral' },
  negative: { color: 'negative', icon: 'sym_o_sentiment_dissatisfied', label: 'Negative' },
  unknown: { color: 'grey-5', icon: 'sym_o_help', label: 'Unknown' },
};

export const HAND_RAISE_TYPE_CONFIG = {
  help: { color: 'warning', icon: 'sym_o_help', label: 'Need Help' },
  question: { color: 'info', icon: 'sym_o_contact_support', label: 'Question' },
  escalation: { color: 'orange', icon: 'sym_o_trending_up', label: 'Escalation' },
  technical: { color: 'purple', icon: 'sym_o_build', label: 'Technical Issue' },
  threat: { color: 'negative', icon: 'sym_o_gpp_maybe', label: 'Customer Threat' },
};

// =============================================================================
// Refresh Intervals (milliseconds)
// =============================================================================

export const CC_REFRESH_INTERVALS = {
  REALTIME: 5000,       // 5 seconds - for critical real-time data
  FREQUENT: 15000,      // 15 seconds - for frequently changing data
  STANDARD: 30000,      // 30 seconds - for standard updates
  SLOW: 60000,          // 1 minute - for less critical data
};

// =============================================================================
// Default Settings
// =============================================================================

export const CC_DEFAULTS = {
  LOAD_THRESHOLD_WARNING: 70,
  LOAD_THRESHOLD_CRITICAL: 90,
  QUEUE_WARNING_THRESHOLD: 10,
  QUEUE_CRITICAL_THRESHOLD: 25,
  WAIT_TIME_WARNING: 180,      // 3 minutes
  WAIT_TIME_CRITICAL: 300,     // 5 minutes
  SLA_TARGET: 80,              // 80% within SLA
  ADHERENCE_TARGET: 95,        // 95% adherence
};
