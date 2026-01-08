import { V1 } from './constants'

export enum CB_ACTION_KEYS {
  // Authentication
  AUTHENTICATE = 'CB_AUTHENTICATE',

  // Bots
  GET_BOTS = 'CB_GET_BOTS',
  GET_BOT_LOGS = 'CB_GET_BOT_LOGS',
  GET_BOT_STATUS = 'CB_GET_BOT_STATUS',
  START_BOT = 'CB_START_BOT',
  STOP_BOT = 'CB_STOP_BOT',
  GET_BOT_AGENTS_STATUS = 'CB_GET_BOT_AGENTS_STATUS',
  GET_PCS_BOTS_STATUS = 'CB_GET_PCS_BOTS_STATUS',

  // Bot Groups
  GET_BOT_GROUPS = 'CB_GET_BOT_GROUPS',
  GET_BOTS_BY_GROUP = 'CB_GET_BOTS_BY_GROUP',

  // Chatbots
  GET_CHATBOT = 'CB_GET_CHATBOT',

  // Dialogs
  GET_DIALOGS = 'CB_GET_DIALOGS',

  // Interactions
  GET_INTERACTIONS = 'CB_GET_INTERACTIONS',

  // Responders / Integrations
  GET_RESPONDERS = 'CB_GET_RESPONDERS',

  // NLU Domains
  GET_NLU_DOMAINS = 'CB_GET_NLU_DOMAINS',
  GET_DOMAIN_INTENTS = 'CB_GET_DOMAIN_INTENTS',

  // Knowledge Bases
  GET_KNOWLEDGE_BASES = 'CB_GET_KNOWLEDGE_BASES',
  GET_KNOWLEDGE_BASE = 'CB_GET_KNOWLEDGE_BASE',
  GET_KB_CONTENT_SOURCES = 'CB_GET_KB_CONTENT_SOURCES',
  GET_KB_ARTICLES = 'CB_GET_KB_ARTICLES',
  SEARCH_KB = 'CB_SEARCH_KB',

  // Bot Users / Agent Management
  GET_BOT_USERS = 'CB_GET_BOT_USERS',
  ADD_BOT_AGENT = 'CB_ADD_BOT_AGENT',

  // Global Functions
  GET_GLOBAL_FUNCTIONS = 'CB_GET_GLOBAL_FUNCTIONS',

  // Environment
  GET_BOT_ENVIRONMENT = 'CB_GET_BOT_ENVIRONMENT',

  // Skills
  GET_LP_SKILLS = 'CB_GET_LP_SKILLS',

  // Credentials
  GET_CREDENTIALS = 'CB_GET_CREDENTIALS',
  GET_LP_APP_CREDENTIALS = 'CB_GET_LP_APP_CREDENTIALS',

  // Dialog Templates
  GET_DIALOG_TEMPLATES = 'CB_GET_DIALOG_TEMPLATES',

  // KAI On-Demand
  GET_DEFAULT_PROMPT = 'CB_GET_DEFAULT_PROMPT',
  GET_KAI_OD_CONFIGS = 'CB_GET_KAI_OD_CONFIGS',
  GET_KAI_OD_CONFIG = 'CB_GET_KAI_OD_CONFIG',
  ADD_KAI_OD_CONFIG = 'CB_ADD_KAI_OD_CONFIG',
  UPDATE_KAI_OD_CONFIG = 'CB_UPDATE_KAI_OD_CONFIG',
}

const CB_BASE = (accountId: string) => `${V1}/conversation-builder/${accountId}`
const KAI_BASE = (accountId: string) => `${V1}/kai/${accountId}`
const KAI_OD_BASE = (accountId: string) => `${KAI_BASE(accountId)}/on-demand`

export const CB_BUILDER_ROUTES = {
  BASE: CB_BASE,

  // Authentication
  TOKEN: (accountId: string) => `${CB_BASE(accountId)}/token`,

  // Bots
  BOTS: (accountId: string) => `${CB_BASE(accountId)}/bots`,
  BOT_LOGS: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/logs`,
  BOT_STATUS: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/status`,
  BOT_START: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/start`,
  BOT_STOP: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/stop`,

  // Bot Groups
  BOT_GROUPS: (accountId: string) => `${CB_BASE(accountId)}/bot-groups`,
  BOTS_BY_GROUP: (accountId: string) => `${CB_BASE(accountId)}/bot-groups/bots`,

  // Chatbots
  CHATBOT: (accountId: string, chatBotId: string) => `${CB_BASE(accountId)}/chatbots/${chatBotId}`,

  // Dialogs
  DIALOGS: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/dialogs`,

  // Interactions
  INTERACTIONS: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/interactions`,

  // Responders / Integrations
  RESPONDERS: (accountId: string, chatBotId: string) => `${CB_BASE(accountId)}/chatbots/${chatBotId}/responders`,

  // NLU Domains
  NLU_DOMAINS: (accountId: string) => `${CB_BASE(accountId)}/nlu/domains`,
  DOMAIN_INTENTS: (accountId: string, domainId: string) => `${CB_BASE(accountId)}/nlu/domains/${domainId}/intents`,

  // Knowledge Bases (via CB controller)
  KNOWLEDGE_BASES: (accountId: string) => `${CB_BASE(accountId)}/knowledge-bases`,
  KNOWLEDGE_BASE: (accountId: string, kbId: string) => `${CB_BASE(accountId)}/knowledge-bases/${kbId}`,
  KB_CONTENT_SOURCES: (accountId: string, kbId: string) => `${CB_BASE(accountId)}/knowledge-bases/${kbId}/content-sources`,
  KB_ARTICLES: (accountId: string, kbId: string) => `${CB_BASE(accountId)}/knowledge-bases/${kbId}/articles`,

  // Bot Users / Agent Management
  BOT_USERS: (accountId: string) => `${CB_BASE(accountId)}/bot-users`,
  ADD_BOT_AGENT: (accountId: string, lpUserId: string) => `${CB_BASE(accountId)}/bot-users/${lpUserId}`,

  // Global Functions
  GLOBAL_FUNCTIONS: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/global-functions`,

  // Environment
  BOT_ENVIRONMENT: (accountId: string) => `${CB_BASE(accountId)}/bot-environment`,

  // Skills
  LP_SKILLS: (accountId: string) => `${CB_BASE(accountId)}/lp-skills`,

  // Credentials
  CREDENTIALS: (accountId: string) => `${CB_BASE(accountId)}/credentials`,
  LP_APP_CREDENTIALS: (accountId: string, chatBotId: string) => `${CB_BASE(accountId)}/chatbots/${chatBotId}/lp-app-credentials`,

  // Dialog Templates
  DIALOG_TEMPLATES: (accountId: string) => `${CB_BASE(accountId)}/dialog-templates`,

  // Bot Agents Status
  BOT_AGENTS_STATUS: (accountId: string) => `${CB_BASE(accountId)}/bot-agents-status`,
  PCS_BOTS_STATUS: (accountId: string) => `${CB_BASE(accountId)}/pcs-bots-status`,

  // KAI On-Demand Routes (via KAI controller)
  KAI_DEFAULT_PROMPT: (accountId: string) => `${KAI_BASE(accountId)}/default-prompt`,
  KAI_KB_SEARCH: (accountId: string, kbId: string) => `${KAI_OD_BASE(accountId)}/${kbId}/search`,
  KAI_KB_ARTICLES: (accountId: string, kbId: string) => `${KAI_OD_BASE(accountId)}/${kbId}/articles`,
  KAI_OD_CONFIGS: (accountId: string) => `${KAI_OD_BASE(accountId)}/configs`,
  KAI_OD_CONFIG: (accountId: string) => `${KAI_OD_BASE(accountId)}/config`,
  KAI_OD_CONFIG_BY_ID: (accountId: string, configId: string) => `${KAI_OD_BASE(accountId)}/config/${configId}`,

  // Legacy alias (for backward compatibility)
  BOTLOGS: (accountId: string, botId: string) => `${CB_BASE(accountId)}/bots/${botId}/logs`,
}
