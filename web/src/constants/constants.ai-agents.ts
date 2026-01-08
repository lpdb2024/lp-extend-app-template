import { V1 } from './constants'

// ============ AI Agents API Routes ============
const AI_AGENTS_BASE = `${V1}/ai-agents`
const FLOW_SESSION_BASE = `${V1}/flow/session`

export const AI_AGENTS_ROUTES = {
  LIST: (accountId: string) => `${AI_AGENTS_BASE}/${accountId}/list`,
  CREATE: (accountId: string) => `${AI_AGENTS_BASE}/${accountId}`,
  AGENT: (accountId: string, id: string) => `${AI_AGENTS_BASE}/${accountId}/${id}`,
  DUPLICATE: (accountId: string, id: string) => `${AI_AGENTS_BASE}/${accountId}/${id}/duplicate`,
  PREVIEW_TEMPLATE: (accountId: string, id: string) => `${AI_AGENTS_BASE}/${accountId}/${id}/preview-template`,
  IMPORT: (accountId: string) => `${AI_AGENTS_BASE}/${accountId}/import`,
  EXPORT: (accountId: string) => `${AI_AGENTS_BASE}/${accountId}/export`,
  // Session routes (ai-agents controller)
  SESSION: (accountId: string) => `${AI_AGENTS_BASE}/${accountId}/session`,
  SESSION_ID: (accountId: string, sessionId: string) => `${AI_AGENTS_BASE}/${accountId}/session/${sessionId}`,
  SESSION_MESSAGE: (accountId: string, sessionId: string) => `${AI_AGENTS_BASE}/${accountId}/session/${sessionId}/message`,
  SESSION_DEBUG: (accountId: string, sessionId: string) => `${AI_AGENTS_BASE}/${accountId}/session/${sessionId}/debug`,
}

// Flow Session Routes (flow-session controller - used by flow designer)
export const FLOW_SESSION_ROUTES = {
  BASE: FLOW_SESSION_BASE,
  SESSION: (sessionId: string) => `${FLOW_SESSION_BASE}/${sessionId}`,
  MESSAGE: (sessionId: string) => `${FLOW_SESSION_BASE}/${sessionId}/message`,
  START: (sessionId: string) => `${FLOW_SESSION_BASE}/${sessionId}/start`,
  DEBUG: (sessionId: string) => `${FLOW_SESSION_BASE}/${sessionId}/debug`,
  DEBUG_SUMMARY: (sessionId: string) => `${FLOW_SESSION_BASE}/${sessionId}/debug/summary`,
}

// ============ AI Agents Action Keys ============
export enum AI_AGENTS_ACTION_KEYS {
  // Agent CRUD
  CREATE_AGENT = 'AI_AGENTS_CREATE',
  LIST_AGENTS = 'AI_AGENTS_LIST',
  GET_AGENT = 'AI_AGENTS_GET',
  UPDATE_AGENT = 'AI_AGENTS_UPDATE',
  DELETE_AGENT = 'AI_AGENTS_DELETE',
  DUPLICATE_AGENT = 'AI_AGENTS_DUPLICATE',
  IMPORT_AGENTS = 'AI_AGENTS_IMPORT',
  EXPORT_AGENTS = 'AI_AGENTS_EXPORT',
  PREVIEW_TEMPLATE = 'AI_AGENTS_PREVIEW_TEMPLATE',
  // Session
  CREATE_SESSION = 'AI_AGENTS_CREATE_SESSION',
  GET_SESSION = 'AI_AGENTS_GET_SESSION',
  SEND_MESSAGE = 'AI_AGENTS_SEND_MESSAGE',
  DELETE_SESSION = 'AI_AGENTS_DELETE_SESSION',
  GET_DEBUG_LOGS = 'AI_AGENTS_GET_DEBUG_LOGS',
}
