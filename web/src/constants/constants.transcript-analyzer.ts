/**
 * Transcript Analyzer Constants
 * Routes and action keys for the Transcript Analyzer API
 */

import { V2 } from "./constants";

const BASE = `${V2}/transcript-analyzer`;

// ============================================================================
// Routes
// ============================================================================

export const TRANSCRIPT_ANALYZER_ROUTES = {
  // Ingestion Jobs
  JOBS: (accountId: string) => `${BASE}/${accountId}/jobs`,
  JOB: (accountId: string, jobId: string) => `${BASE}/${accountId}/jobs/${jobId}`,
  JOB_CANCEL: (accountId: string, jobId: string) => `${BASE}/${accountId}/jobs/${jobId}/cancel`,
  JOB_RESUME: (accountId: string, jobId: string) => `${BASE}/${accountId}/jobs/${jobId}/resume`,
  JOB_RETRY: (accountId: string, jobId: string) => `${BASE}/${accountId}/jobs/${jobId}/retry`,

  // Enriched Conversations
  CONVERSATIONS_SEARCH: (accountId: string) => `${BASE}/${accountId}/conversations/search`,
  CONVERSATION: (accountId: string, conversationId: string) =>
    `${BASE}/${accountId}/conversations/${conversationId}`,

  // Analytics & Metrics
  METRICS: (accountId: string) => `${BASE}/${accountId}/metrics`,
  DASHBOARD: (accountId: string) => `${BASE}/${accountId}/metrics/dashboard`,
  DASHBOARD_ENHANCED: (accountId: string) => `${BASE}/${accountId}/metrics/dashboard/enhanced`,
  AGENTS: (accountId: string) => `${BASE}/${accountId}/metrics/agents`,
  TRANSFERS: (accountId: string) => `${BASE}/${accountId}/metrics/transfers`,
  GEOGRAPHIC: (accountId: string) => `${BASE}/${accountId}/metrics/geographic`,
  CAMPAIGNS: (accountId: string) => `${BASE}/${accountId}/metrics/campaigns`,

  // AI Insights
  INSIGHTS_QUERY: (accountId: string) => `${BASE}/${accountId}/insights/query`,
  INSIGHTS_SUGGESTIONS: (accountId: string) => `${BASE}/${accountId}/insights/suggestions`,
  INSIGHTS_ANOMALIES: (accountId: string) => `${BASE}/${accountId}/insights/anomalies`,

  // Taxonomy Management
  TAXONOMY: (accountId: string) => `${BASE}/${accountId}/taxonomy`,
  TAXONOMY_ITEM: (accountId: string, itemId: string) => `${BASE}/${accountId}/taxonomy/${itemId}`,
  TAXONOMY_DEACTIVATE: (accountId: string, itemId: string) =>
    `${BASE}/${accountId}/taxonomy/${itemId}/deactivate`,
  TAXONOMY_APPROVE: (accountId: string, itemId: string) =>
    `${BASE}/${accountId}/taxonomy/${itemId}/approve`,
  TAXONOMY_MERGE: (accountId: string) => `${BASE}/${accountId}/taxonomy/merge`,
  TAXONOMY_PENDING: (accountId: string) => `${BASE}/${accountId}/taxonomy/pending`,
};

// ============================================================================
// Action Keys (for request tracking)
// ============================================================================

export const TRANSCRIPT_ANALYZER_ACTION_KEYS = {
  // Jobs
  CREATE_JOB: 'transcript-analyzer:create-job',
  LIST_JOBS: 'transcript-analyzer:list-jobs',
  GET_JOB: 'transcript-analyzer:get-job',
  CANCEL_JOB: 'transcript-analyzer:cancel-job',
  DELETE_JOB: 'transcript-analyzer:delete-job',
  RESUME_JOB: 'transcript-analyzer:resume-job',
  RETRY_JOB: 'transcript-analyzer:retry-job',

  // Conversations
  SEARCH_CONVERSATIONS: 'transcript-analyzer:search-conversations',
  GET_CONVERSATION: 'transcript-analyzer:get-conversation',

  // Metrics
  GET_METRICS: 'transcript-analyzer:get-metrics',
  GET_DASHBOARD: 'transcript-analyzer:get-dashboard',
  GET_ENHANCED_DASHBOARD: 'transcript-analyzer:get-enhanced-dashboard',
  GET_AGENTS: 'transcript-analyzer:get-agents',
  GET_TRANSFERS: 'transcript-analyzer:get-transfers',
  GET_GEOGRAPHIC: 'transcript-analyzer:get-geographic',
  GET_CAMPAIGNS: 'transcript-analyzer:get-campaigns',

  // Insights
  QUERY_INSIGHTS: 'transcript-analyzer:query-insights',
  GET_SUGGESTIONS: 'transcript-analyzer:get-suggestions',
  GET_ANOMALIES: 'transcript-analyzer:get-anomalies',

  // Taxonomy
  LIST_TAXONOMY: 'transcript-analyzer:list-taxonomy',
  CREATE_TAXONOMY: 'transcript-analyzer:create-taxonomy',
  UPDATE_TAXONOMY: 'transcript-analyzer:update-taxonomy',
  DELETE_TAXONOMY: 'transcript-analyzer:delete-taxonomy',
  DEACTIVATE_TAXONOMY: 'transcript-analyzer:deactivate-taxonomy',
  APPROVE_TAXONOMY: 'transcript-analyzer:approve-taxonomy',
  MERGE_TAXONOMY: 'transcript-analyzer:merge-taxonomy',
  GET_PENDING_REVIEW: 'transcript-analyzer:get-pending-review',
};
