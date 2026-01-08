/**
 * Conversation Orchestrator Interfaces
 * TypeScript interfaces for LivePerson Conversation Orchestrator API
 * Domain: intentid (KB Rules, Bot Rules, Agent Preferences)
 */

/**
 * LLM Prompt configuration in rules
 */
export interface ILLMPrompt {
  id: string;
  name: string;
  promptContextParams?: Record<string, unknown>;
  promptTemplate?: string;
  version?: number;
}

/**
 * LLM Configuration for KB rules
 */
export interface ILLMConfig {
  llmPrompt?: ILLMPrompt;
  fallbackLlmPrompt?: ILLMPrompt;
}

/**
 * Search configuration for KAI actions
 */
export interface ISearchConfig {
  confidenceLevel: string;
  mode: string;
  numberOfAnswers: number;
  status: string;
}

/**
 * Action configuration in KB rules
 */
export interface IKBRuleAction {
  id: string;
  enable: boolean;
  processingType: string;
  type: string;
  queryTypesToExclude?: string[];
  searchConfig?: ISearchConfig;
  llmConfig?: {
    llmEnrichment: boolean;
    promptContextParams?: Record<string, unknown>;
    promptTemplateId?: string;
    promptTemplateName?: string;
    promptTemplateVersion?: number;
  };
}

/**
 * Addon configuration for KB rules
 */
export interface IKBRuleAddon {
  agentGroups: number[];
  belongOperator: 'AND' | 'OR';
  confidenceScore: string | number;
  isEnabledForInline?: boolean;
  isEnabledForWidget?: boolean;
  isLlmEnabled?: boolean;
  isQuerySimplificationAllowed?: boolean;
  knowledgeBases: string[];
  llmConfig?: ILLMConfig;
  profiles: number[];
  retrieveArticlesCount?: number;
  retrieveOperator?: string;
  actions?: IKBRuleAction[];
}

/**
 * KB Rule entity
 */
export interface IKBRule {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  status: boolean;
  type: 'knowledgebase';
  conversationType?: string;
  skills: number[];
  addons: IKBRuleAddon[];
  modifiedAt?: number;
  modifiedBy?: string;
  createdAt?: number;
  createdBy?: string;
}

/**
 * Addon configuration for Bot rules
 */
export interface IBotRuleAddon {
  agentGroups: number[];
  belongOperator: 'AND' | 'OR';
  bots: string[];
  confidenceScore: number;
  profiles: number[];
  isEnabledForInline?: boolean;
  isEnabledForWidget?: boolean;
}

/**
 * Bot Rule entity
 */
export interface IBotRule {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  status: boolean;
  type: 'bot';
  conversationType?: string;
  skills: number[];
  addons: IBotRuleAddon[];
  joinBotPhrase?: string;
  removeBotPhrase?: string;
  modifiedAt?: number;
  modifiedBy?: string;
  createdAt?: number;
  createdBy?: string;
}

/**
 * Agent Preferences for Conversation Assist
 */
export interface IAgentPreferences {
  type: string;
  accountId: string;
  userId: string;
  inlineRecommendations: boolean;
  structuredContent: boolean;
  thumbVoting: boolean;
  agentGroups: number[];
  pdcReplies: boolean;
}

/**
 * Response wrapper for KB rules list
 */
export interface IKBRulesResponse {
  rows: IKBRule[];
  total: number;
  enabledCount: number;
}

/**
 * Response wrapper for Bot rules list
 */
export interface IBotRulesResponse {
  rows: IBotRule[];
  total: number;
  enabledCount: number;
}

/**
 * Data for creating/updating a KB rule
 */
export interface ICreateKBRule {
  name: string;
  description?: string;
  status?: boolean;
  skills: number[];
  addons: IKBRuleAddon[];
  conversationType?: string;
}

/**
 * Data for updating a KB rule
 */
export interface IUpdateKBRule extends Partial<ICreateKBRule> {
  id?: string;
}

/**
 * Data for creating a Bot rule
 */
export interface ICreateBotRule {
  name: string;
  description?: string;
  status?: boolean;
  skills: number[];
  addons: IBotRuleAddon[];
  conversationType?: string;
  joinBotPhrase?: string;
  removeBotPhrase?: string;
}

/**
 * Data for updating a Bot rule
 */
export interface IUpdateBotRule extends Partial<ICreateBotRule> {
  id?: string;
}
