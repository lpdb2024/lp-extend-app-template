/**
 * Prompts Interfaces
 * TypeScript interfaces for LivePerson Prompt Library API
 */

/**
 * Source types for prompt variables
 */
export type PromptVariableSourceType =
  | 'PROMPT_LIBRARY_RESERVED_KEYWORD'
  | 'INTERNAL_VARIABLES'
  | 'SITE_SETTINGS'
  | 'BOT_CONTEXT';

/**
 * Variable configuration in a prompt
 */
export interface IPromptVariable {
  name: string;
  sourceType: PromptVariableSourceType;
  value?: string;
}

/**
 * Generic LLM configuration
 */
export interface IPromptGenericConfig {
  llmProvider: string;
  llm: string;
  llmSubscriptionName?: string;
  samplingTemperature?: number;
  maxResponseTokens?: number;
  maxPromptTokens?: number;
  completionsNumber?: number;
}

/**
 * Client-specific configuration
 */
export interface IPromptClientConfig {
  maxConversationTurns?: number;
  maxConversationMessages?: number;
  maxConversationTokens?: number;
  includeLastUserMessage?: boolean;
  piiMaskingEnabled?: boolean;
}

/**
 * Complete prompt configuration
 */
export interface IPromptConfiguration {
  genericConfig: IPromptGenericConfig;
  clientConfig: IPromptClientConfig;
  variables: IPromptVariable[];
}

/**
 * Version detail for a prompt
 */
export interface IPromptVersionDetail {
  version: number;
  createdBy: string;
  createdAt: number;
}

/**
 * Client types for prompts
 */
export type PromptClientType =
  | 'AUTO_SUMMARIZATION'
  | 'MESSAGING_BOT'
  | 'CONV_ASSIST'
  | 'COPILOT_REWRITE'
  | 'VOICE_BOT'
  | 'VOICE_AGENT'
  | 'ROUTING_AI_AGENT_MESSAGING_BOT'
  | 'ROUTING_AI_AGENT_VOICE_BOT'
  | 'LANGUAGE_DETECTION'
  | 'TRANSLATION';

/**
 * Prompt entity returned by LivePerson Prompt Library API
 */
export interface IPrompt {
  accountId: string;
  id: string;
  name: string;
  clientType: PromptClientType;
  description: string;
  langCode: string;
  promptHeader: string;
  createdBy: string;
  createdAt: number;
  updatedBy?: string;
  updatedAt: number;
  version: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  default: boolean;
  configuration: IPromptConfiguration;
  versionDetails: IPromptVersionDetail[];
}

/**
 * System prompt (read-only, provided by LivePerson)
 */
export interface ISystemPrompt extends IPrompt {
  // System prompts are structurally the same but read-only
}

/**
 * Account prompt (can be created/modified by account)
 */
export interface IAccountPrompt extends IPrompt {
  // Account prompts are user-manageable
}

/**
 * LLM Provider subscription models
 */
export interface ILLMProviderModels {
  [modelName: string]: 'ENABLED' | 'DISABLED';
}

/**
 * LLM Provider subscription
 */
export interface ILLMProviderSubscription {
  models: ILLMProviderModels;
  account_id: string;
  provider_name: string;
  subscription_name: string;
  enable_subscription: boolean;
  llmType: 'INTERNAL' | 'EXTERNAL';
  supported_clients?: PromptClientType[];
  created_at: number;
  updated_at: number;
}

/**
 * Response wrapper for prompts list
 */
export interface IPromptsResponse {
  success: boolean;
  statusCode: number;
  successResult: {
    prompts: IPrompt[];
  };
}

/**
 * Response wrapper for LLM providers list
 */
export interface ILLMProvidersResponse {
  success: boolean;
  statusCode: number;
  successResult: {
    provider_subscriptions: ILLMProviderSubscription[];
  };
}

/**
 * Data for creating a new prompt
 */
export interface ICreatePrompt {
  name: string;
  clientType: PromptClientType;
  description?: string;
  langCode?: string;
  promptHeader: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  default?: boolean;
  configuration: IPromptConfiguration;
}

/**
 * Data for updating a prompt
 */
export interface IUpdatePrompt {
  name?: string;
  description?: string;
  langCode?: string;
  promptHeader?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  default?: boolean;
  configuration?: Partial<IPromptConfiguration>;
}
