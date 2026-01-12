/**
 * Prompts Store
 * Pinia store for LivePerson Prompt Library data
 * Used for managing system prompts, account prompts, and LLM providers
 */

import { defineStore } from 'pinia'
import { useUserStore } from './store-user'
import ApiService from 'src/services/ApiService'
import ErrorService from 'src/services/ErrorService'
import { Notify } from 'quasar'
import { V2 } from 'src/constants'

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService)

// ============================================================================
// Routes
// ============================================================================

const PROMPTS_ROUTES = {
  SYSTEM: () => `${V2}/prompts/system`,
  ACCOUNT: (accountId: string) => `${V2}/prompts/${accountId}`,
  ACCOUNT_BY_ID: (accountId: string, promptId: string) =>
    `${V2}/prompts/${accountId}/${promptId}`,
  LLM_PROVIDERS: (accountId: string) =>
    `${V2}/prompts/${accountId}/llm-providers`,
}

const ACTION_KEYS_PROMPTS = {
  SYSTEM_PROMPTS_GET: 'SYSTEM_PROMPTS_GET',
  ACCOUNT_PROMPTS_GET: 'ACCOUNT_PROMPTS_GET',
  ACCOUNT_PROMPT_GET_BY_ID: 'ACCOUNT_PROMPT_GET_BY_ID',
  ACCOUNT_PROMPT_CREATE: 'ACCOUNT_PROMPT_CREATE',
  ACCOUNT_PROMPT_UPDATE: 'ACCOUNT_PROMPT_UPDATE',
  ACCOUNT_PROMPT_DELETE: 'ACCOUNT_PROMPT_DELETE',
  LLM_PROVIDERS_GET: 'LLM_PROVIDERS_GET',
}

// ============================================================================
// Interfaces
// ============================================================================

export interface PromptVariable {
  name: string
  sourceType: 'PROMPT_LIBRARY_RESERVED_KEYWORD' | 'INTERNAL_VARIABLES' | 'SITE_SETTINGS' | 'BOT_CONTEXT'
  value?: string
}

export interface PromptGenericConfig {
  llmProvider: string
  llm: string
  llmSubscriptionName?: string
  samplingTemperature?: number
  maxResponseTokens?: number
  maxPromptTokens?: number
  completionsNumber?: number
}

export interface PromptClientConfig {
  maxConversationTurns?: number
  maxConversationMessages?: number
  maxConversationTokens?: number
  includeLastUserMessage?: boolean
  piiMaskingEnabled?: boolean
}

export interface PromptConfiguration {
  genericConfig: PromptGenericConfig
  clientConfig: PromptClientConfig
  variables: PromptVariable[]
}

export interface PromptVersionDetail {
  version: number
  createdBy: string
  createdAt: number
}

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
  | 'TRANSLATION'

export interface LPPrompt {
  accountId: string
  id: string
  name: string
  clientType: PromptClientType
  description: string
  langCode: string
  promptHeader: string
  createdBy: string
  createdAt: number
  updatedBy?: string
  updatedAt: number
  version: number
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  default: boolean
  configuration: PromptConfiguration
  versionDetails: PromptVersionDetail[]
}

export interface LLMProviderModels {
  [modelName: string]: 'ENABLED' | 'DISABLED'
}

export interface LLMProviderSubscription {
  models: LLMProviderModels
  account_id: string
  provider_name: string
  subscription_name: string
  enable_subscription: boolean
  llmType: 'INTERNAL' | 'EXTERNAL'
  supported_clients?: PromptClientType[]
  created_at: number
  updated_at: number
}

export interface CreatePromptData {
  name: string
  clientType: PromptClientType
  description?: string
  langCode?: string
  promptHeader: string
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  default?: boolean
  configuration: PromptConfiguration
}

export interface UpdatePromptData {
  name?: string
  description?: string
  langCode?: string
  promptHeader?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  default?: boolean
  configuration?: Partial<PromptConfiguration>
}

// Loading state keys
type LoadingKey =
  | 'systemPrompts'
  | 'accountPrompts'
  | 'llmProviders'
  | 'all'

// ============================================================================
// State Interface
// ============================================================================

interface PromptsState {
  systemPrompts: LPPrompt[]
  accountPrompts: LPPrompt[]
  llmProviders: LLMProviderSubscription[]

  // Metadata
  lastFetched: Record<string, number>
  loading: Record<LoadingKey, boolean>
  error: string | null
}

// ============================================================================
// Store Definition
// ============================================================================

export const usePromptsStore = defineStore('prompts', {
  state: (): PromptsState => ({
    systemPrompts: [],
    accountPrompts: [],
    llmProviders: [],

    // Metadata
    lastFetched: {},
    loading: {
      systemPrompts: false,
      accountPrompts: false,
      llmProviders: false,
      all: false,
    },
    error: null,
  }),

  getters: {
    // Account ID helper
    accountId(): string | null {
      return useUserStore().accountId || sessionStorage.getItem('accountId')
    },

    // Get prompt by ID
    getSystemPromptById: (state) => (id: string) =>
      state.systemPrompts.find((p) => p.id === id),

    getAccountPromptById: (state) => (id: string) =>
      state.accountPrompts.find((p) => p.id === id),

    // Get prompts by client type
    getSystemPromptsByClientType: (state) => (clientType: PromptClientType) =>
      state.systemPrompts.filter((p) => p.clientType === clientType),

    getAccountPromptsByClientType: (state) => (clientType: PromptClientType) =>
      state.accountPrompts.filter((p) => p.clientType === clientType),

    // Get active prompts
    activeSystemPrompts: (state) =>
      state.systemPrompts.filter((p) => p.status === 'ACTIVE'),

    activeAccountPrompts: (state) =>
      state.accountPrompts.filter((p) => p.status === 'ACTIVE'),

    // Get default prompts
    defaultSystemPrompts: (state) =>
      state.systemPrompts.filter((p) => p.default),

    defaultAccountPrompts: (state) =>
      state.accountPrompts.filter((p) => p.default),

    // Get enabled LLM providers
    enabledLLMProviders: (state) =>
      state.llmProviders.filter((p) => p.enable_subscription),

    // Get providers by type
    internalLLMProviders: (state) =>
      state.llmProviders.filter((p) => p.llmType === 'INTERNAL'),

    externalLLMProviders: (state) =>
      state.llmProviders.filter((p) => p.llmType === 'EXTERNAL'),

    // Stats
    entityCounts: (state) => ({
      systemPrompts: state.systemPrompts.length,
      accountPrompts: state.accountPrompts.length,
      llmProviders: state.llmProviders.length,
      activeSystemPrompts: state.systemPrompts.filter((p) => p.status === 'ACTIVE').length,
      activeAccountPrompts: state.accountPrompts.filter((p) => p.status === 'ACTIVE').length,
    }),

    // Is any data loading
    isLoading: (state) => Object.values(state.loading).some((v) => v),

    // Has data been fetched
    hasData: (state) =>
      state.systemPrompts.length > 0 ||
      state.accountPrompts.length > 0 ||
      state.llmProviders.length > 0,
  },

  actions: {
    // ========================================================================
    // Fetch Actions
    // ========================================================================

    async fetchSystemPrompts(useCache = false): Promise<LPPrompt[]> {
      if (useCache && this.systemPrompts.length > 0) return this.systemPrompts
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.systemPrompts = true
      try {
        const url = PROMPTS_ROUTES.SYSTEM()
        const { data } = await ApiService.get<{ data: LPPrompt[] }>(
          url,
          ACTION_KEYS_PROMPTS.SYSTEM_PROMPTS_GET,
          undefined, // no query params
          { headers: { 'x-account-id': accountId } }
        )
        const prompts = data?.data || []
        this.systemPrompts = prompts.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.systemPrompts = Date.now()
        return this.systemPrompts
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.systemPrompts = false
      }
    },

    async fetchAccountPrompts(useCache = false): Promise<LPPrompt[]> {
      if (useCache && this.accountPrompts.length > 0) return this.accountPrompts
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.accountPrompts = true
      try {
        const url = PROMPTS_ROUTES.ACCOUNT(accountId)
        const { data } = await ApiService.get<{ data: LPPrompt[] }>(
          url,
          ACTION_KEYS_PROMPTS.ACCOUNT_PROMPTS_GET
        )
        const prompts = data?.data || []
        this.accountPrompts = prompts.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.accountPrompts = Date.now()
        return this.accountPrompts
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.accountPrompts = false
      }
    },

    async fetchLLMProviders(useCache = false): Promise<LLMProviderSubscription[]> {
      if (useCache && this.llmProviders.length > 0) return this.llmProviders
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.llmProviders = true
      try {
        const url = PROMPTS_ROUTES.LLM_PROVIDERS(accountId)
        const { data } = await ApiService.get<{ data: LLMProviderSubscription[] }>(
          url,
          ACTION_KEYS_PROMPTS.LLM_PROVIDERS_GET
        )
        const providers = data?.data || []
        this.llmProviders = providers.sort((a, b) =>
          a.provider_name.localeCompare(b.provider_name)
        )
        this.lastFetched.llmProviders = Date.now()
        return this.llmProviders
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.llmProviders = false
      }
    },

    // ========================================================================
    // Bulk Fetch
    // ========================================================================

    async fetchAllPromptData(showNotification = true): Promise<void> {
      this.loading.all = true
      this.error = null

      const notification = showNotification
        ? Notify.create({
            type: 'ongoing',
            message: 'Loading prompt library...',
            spinner: true,
            timeout: 0,
            position: 'top',
          })
        : null

      try {
        await Promise.all([
          this.fetchSystemPrompts(),
          this.fetchAccountPrompts(),
          this.fetchLLMProviders(),
        ])

        if (notification) {
          notification({
            type: 'positive',
            message: 'Prompt library loaded',
            spinner: false,
            timeout: 2000,
          })
        }
      } catch (error) {
        this.error = 'Failed to load prompt library'
        if (notification) {
          notification({
            type: 'negative',
            message: 'Failed to load prompt library',
            spinner: false,
            timeout: 3000,
          })
        }
        throw error
      } finally {
        this.loading.all = false
      }
    },

    // ========================================================================
    // CRUD Operations
    // ========================================================================

    async createPrompt(data: CreatePromptData): Promise<LPPrompt | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = PROMPTS_ROUTES.ACCOUNT(accountId)
        const { data: response } = await ApiService.post<{ data: LPPrompt }>(
          url,
          data,
          ACTION_KEYS_PROMPTS.ACCOUNT_PROMPT_CREATE
        )
        const newPrompt = response?.data

        if (newPrompt) {
          this.accountPrompts.push(newPrompt)
          this.accountPrompts.sort((a, b) => a.name.localeCompare(b.name))

          Notify.create({
            type: 'positive',
            message: `Prompt "${newPrompt.name}" created successfully`,
            timeout: 3000,
          })
        }

        return newPrompt
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async updatePrompt(
      promptId: string,
      updates: UpdatePromptData
    ): Promise<LPPrompt | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = PROMPTS_ROUTES.ACCOUNT_BY_ID(accountId, promptId)
        const { data: response } = await ApiService.put<{ data: LPPrompt }>(
          url,
          updates,
          ACTION_KEYS_PROMPTS.ACCOUNT_PROMPT_UPDATE
        )
        const updatedPrompt = response?.data

        if (updatedPrompt) {
          const index = this.accountPrompts.findIndex((p) => p.id === promptId)
          if (index !== -1) {
            this.accountPrompts[index] = updatedPrompt
          }

          Notify.create({
            type: 'positive',
            message: `Prompt "${updatedPrompt.name}" updated successfully`,
            timeout: 3000,
          })
        }

        return updatedPrompt
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async deletePrompt(promptId: string): Promise<boolean> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = PROMPTS_ROUTES.ACCOUNT_BY_ID(accountId, promptId)
        await ApiService.delete(url, ACTION_KEYS_PROMPTS.ACCOUNT_PROMPT_DELETE)

        const index = this.accountPrompts.findIndex((p) => p.id === promptId)
        if (index !== -1) {
          this.accountPrompts.splice(index, 1)
        }

        Notify.create({
          type: 'positive',
          message: 'Prompt deleted successfully',
          timeout: 3000,
        })

        return true
      } catch (error) {
        handleRequestError(error, true)
        return false
      }
    },

    // ========================================================================
    // Reset
    // ========================================================================

    resetState(): void {
      this.$reset()
    },
  },

  persist: {
    storage: sessionStorage,
    pick: ['lastFetched'],
  },
})
