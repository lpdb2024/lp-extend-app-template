/**
 * Conversation Orchestrator Store
 * Pinia store for LivePerson Conversation Orchestrator data
 * Manages KB Rules, Bot Rules, and Agent Preferences for Conversation Assist
 */

import { defineStore } from 'pinia'
import { useUserStore } from './store-user'
import ApiService from 'src/services/ApiService'
import ErrorService from 'src/services/ErrorService'
import { CO_ROUTES, ACTION_KEYS_AC } from 'src/constants'

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService)

// ============================================================================
// Interfaces
// ============================================================================

export interface LLMPrompt {
  id: string
  name: string
  promptContextParams?: Record<string, unknown>
  promptTemplate?: string
  version?: number
}

export interface LLMConfig {
  llmPrompt?: LLMPrompt
  fallbackLlmPrompt?: LLMPrompt
}

export interface SearchConfig {
  confidenceLevel: string
  mode: string
  numberOfAnswers: number
  status: string
}

export interface KBRuleAction {
  id: string
  enable: boolean
  processingType: string
  type: string
  queryTypesToExclude?: string[]
  searchConfig?: SearchConfig
  llmConfig?: {
    llmEnrichment: boolean
    promptContextParams?: Record<string, unknown>
    promptTemplateId?: string
    promptTemplateName?: string
    promptTemplateVersion?: number
  }
}

export interface KBRuleAddon {
  agentGroups: number[]
  belongOperator: 'AND' | 'OR'
  confidenceScore: string | number
  isEnabledForInline?: boolean
  isEnabledForWidget?: boolean
  isLlmEnabled?: boolean
  isQuerySimplificationAllowed?: boolean
  knowledgeBases: string[]
  llmConfig?: LLMConfig
  profiles: number[]
  retrieveArticlesCount?: number
  retrieveOperator?: string
  actions?: KBRuleAction[]
}

export interface KBRule {
  id: string
  brandId: string
  name: string
  description?: string
  status: boolean
  type: 'knowledgebase'
  conversationType?: string
  skills: number[]
  addons: KBRuleAddon[]
  modifiedAt?: number
  modifiedBy?: string
  createdAt?: number
  createdBy?: string
}

export interface BotRuleAddon {
  agentGroups: number[]
  belongOperator: 'AND' | 'OR'
  bots: string[]
  confidenceScore: number
  profiles: number[]
  isEnabledForInline?: boolean
  isEnabledForWidget?: boolean
}

export interface BotRule {
  id: string
  brandId: string
  name: string
  description?: string
  status: boolean
  type: 'bot'
  conversationType?: string
  skills: number[]
  addons: BotRuleAddon[]
  joinBotPhrase?: string
  removeBotPhrase?: string
  modifiedAt?: number
  modifiedBy?: string
  createdAt?: number
  createdBy?: string
}

export interface AgentPreferences {
  type: string
  accountId: string
  userId: string
  inlineRecommendations: boolean
  structuredContent: boolean
  thumbVoting: boolean
  agentGroups: number[]
  pdcReplies: boolean
}

// ============================================================================
// State Interface
// ============================================================================

interface ConversationOrchestratorState {
  kbRules: KBRule[]
  botRules: BotRule[]
  agentPreferences: AgentPreferences | null
  loading: {
    kbRules: boolean
    botRules: boolean
    agentPreferences: boolean
    all: boolean
  }
  lastFetched: {
    kbRules: number | null
    botRules: number | null
    agentPreferences: number | null
  }
}

// ============================================================================
// Store Definition
// ============================================================================

export const useConversationOrchestratorStore = defineStore('conversationOrchestrator', {
  state: (): ConversationOrchestratorState => ({
    kbRules: [],
    botRules: [],
    agentPreferences: null,
    loading: {
      kbRules: false,
      botRules: false,
      agentPreferences: false,
      all: false,
    },
    lastFetched: {
      kbRules: null,
      botRules: null,
      agentPreferences: null,
    },
  }),

  getters: {
    accountId(): string | null {
      const userStore = useUserStore()
      return userStore.accountId || null
    },

    hasData(): boolean {
      return this.kbRules.length > 0 || this.botRules.length > 0 || this.agentPreferences !== null
    },

    enabledKBRules(): KBRule[] {
      return this.kbRules.filter(r => r.status)
    },

    disabledKBRules(): KBRule[] {
      return this.kbRules.filter(r => !r.status)
    },

    enabledBotRules(): BotRule[] {
      return this.botRules.filter(r => r.status)
    },

    disabledBotRules(): BotRule[] {
      return this.botRules.filter(r => !r.status)
    },

    entityCounts(): { kbRules: number; botRules: number } {
      return {
        kbRules: this.kbRules.length,
        botRules: this.botRules.length,
      }
    },
  },

  actions: {
    // ========================================================================
    // KB Rules
    // ========================================================================

    async fetchKBRules(useCache = false): Promise<KBRule[]> {
      if (useCache && this.kbRules.length > 0) return this.kbRules

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.kbRules = true
      try {
        const url = `${CO_ROUTES.KB_RULES(accountId)}?size=100`
        const { data } = await ApiService.get<{ data: KBRule[]; total: number; enabledCount: number }>(
          url,
          ACTION_KEYS_AC.CO_KB_RULES_GET
        )
        this.kbRules = data?.data || []
        this.lastFetched.kbRules = Date.now()
        return this.kbRules
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.kbRules = false
      }
    },

    // ========================================================================
    // Bot Rules
    // ========================================================================

    async fetchBotRules(useCache = false): Promise<BotRule[]> {
      if (useCache && this.botRules.length > 0) return this.botRules

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.botRules = true
      try {
        const url = `${CO_ROUTES.BOT_RULES(accountId)}?size=100`
        const { data } = await ApiService.get<{ data: BotRule[]; total: number; enabledCount: number }>(
          url,
          ACTION_KEYS_AC.CO_BOT_RULES_GET
        )
        this.botRules = data?.data || []
        this.lastFetched.botRules = Date.now()
        return this.botRules
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.botRules = false
      }
    },

    // ========================================================================
    // Agent Preferences
    // ========================================================================

    async fetchAgentPreferences(useCache = false): Promise<AgentPreferences | null> {
      if (useCache && this.agentPreferences) return this.agentPreferences

      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.agentPreferences = true
      try {
        const url = CO_ROUTES.AGENT_PREFERENCES(accountId)
        const { data } = await ApiService.get<{ data: AgentPreferences }>(
          url,
          ACTION_KEYS_AC.CO_AGENT_PREFERENCES_GET
        )
        this.agentPreferences = data?.data || data || null
        this.lastFetched.agentPreferences = Date.now()
        return this.agentPreferences
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.agentPreferences = false
      }
    },

    // ========================================================================
    // Fetch All
    // ========================================================================

    async fetchAll(): Promise<void> {
      this.loading.all = true
      try {
        await Promise.all([
          this.fetchKBRules(),
          this.fetchBotRules(),
          this.fetchAgentPreferences(),
        ])
      } finally {
        this.loading.all = false
      }
    },

    // ========================================================================
    // Snapshot Methods
    // ========================================================================

    getSnapshot(): Record<string, unknown> {
      return {
        kbRules: this.kbRules,
        botRules: this.botRules,
        agentPreferences: this.agentPreferences,
      }
    },

    loadSnapshot(snapshot: Record<string, unknown>): void {
      if (snapshot.kbRules) this.kbRules = snapshot.kbRules as KBRule[]
      if (snapshot.botRules) this.botRules = snapshot.botRules as BotRule[]
      if (snapshot.agentPreferences) this.agentPreferences = snapshot.agentPreferences as AgentPreferences
    },

    reset(): void {
      this.kbRules = []
      this.botRules = []
      this.agentPreferences = null
      this.lastFetched = {
        kbRules: null,
        botRules: null,
        agentPreferences: null,
      }
    },
  },
})
