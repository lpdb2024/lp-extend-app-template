import { V1 } from './constants'

export const KAI_OD_ROUTES = {
  BASE: (siteId: string) => `${V1}/kai/${siteId}/on-demand`,
  CONFIG: (siteId: string) => `${KAI_OD_ROUTES.BASE(siteId)}/config`,
  CONFIG_ID: (siteId: string, id: string) => `${KAI_OD_ROUTES.CONFIG(siteId)}/${id}`,
  CONFIGS: (siteId: string) => `${KAI_OD_ROUTES.BASE(siteId)}/configs`,
  KNOWLEDGE_SEARCH: (siteId: string, id: string) => `${KAI_OD_ROUTES.BASE(siteId)}/${id}/search`,
  ARTICLES: (siteId: string, id: string) => `${KAI_OD_ROUTES.BASE(siteId)}/${id}/articles`
}

export const KAI_ROUTES = {
  BASE: (siteId: string) => `${V1}/kai/${siteId}`,
  DEFAULT_PROMPT: (siteId: string) => `${KAI_ROUTES.BASE(siteId)}/default-prompt`,
  CONFIG: (siteId: string) => `${KAI_OD_ROUTES.BASE(siteId)}/config`,
  CONFIG_ID: (siteId: string, id: string) => `${KAI_OD_ROUTES.CONFIG(siteId)}/${id}`,
  CONFIGS: (siteId: string) => `${KAI_OD_ROUTES.BASE(siteId)}/configs`,
  KNOWLEDGE_SEARCH: (siteId: string, id: string) => `${KAI_OD_ROUTES.BASE(siteId)}/${id}/search`,
  ARTICLES: (siteId: string, id: string) => `${KAI_OD_ROUTES.BASE(siteId)}/${id}/articles`,
  KNOWLEDGE_BASES: (siteId: string) => `${KAI_ROUTES.BASE(siteId)}/knowledge-bases`,
  KNOWLEDGE_BASE: (siteId: string, id: string) => `${KAI_ROUTES.BASE(siteId)}/${id}`,
  KNOWLEDGE_BASES_BY_ID: (siteId: string, kbId: string) => `${KAI_ROUTES.KNOWLEDGE_BASES(siteId)}/${kbId}`
}

export enum KAI_OD_ACTION_KEYS {
  GET_KNOWLEDGE_BASE = 'GET_KNOWLEDGE_BASE',
  GET_DEFAULT_PROMPT = 'GET_DEFAULT_PROMPT',
  GET_KNOWLEDGE_BASES = 'GET_KNOWLEDGE_BASES',
  ADD_KAI_ON_DEMAND_CONFIG = 'ADD_KAI_ON_DEMAND_CONFIG',
  GET_KAI_ON_DEMAND_CONFIGS = 'GET_KAI_ON_DEMAND_CONFIGS',
  GET_KAI_ON_DEMAND_CONFIG = 'GET_KAI_ON_DEMAND_CONFIG',
  UPDATE_KAI_ON_DEMAND_CONFIG = 'UPDATE_KAI_ON_DEMAND_CONFIG',
  SEARCH_KB = 'SEARCH_KB',
  GET_ARTICLES = 'GET_ARTICLES'
}
