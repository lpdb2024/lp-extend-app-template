import { defineStore } from 'pinia'
import ApiService from 'src/services/ApiService'
import ErrorService from 'src/services/ErrorService'
import { CB_ACTION_KEYS, CB_BUILDER_ROUTES } from 'src/constants'
import { useUserStore } from './store-user'
import type {
  Bot,
  BotGroup,
  ChatBot,
  CBDialog,
  CBInteraction,
  NLUDomain,
  KnowledgeBase,
  BotUser,
  BotInstanceStatus,
  Responder,
  GlobalFunctions,
  BotEnvironment,
  LPAppCredentials,
  LPSkill,
  CBAuthInfo,
  DebugLogRecords,
  DebugLogResponse,
  CBApiResponse,
  PaginatedResult,
  AddBotAgentRequest,
  // KAI On-Demand types
  KAISearchRequestConfig,
  KAISearchRequestConfigBasic,
  KAIArticle,
  KAIResponse,
  KAISuccessResult,
  KAIArticlesResponse,
  RequestTemplate,
  DefaultPrompt,
  DefaultPromptResponse,
  // Bot Agents Status types
  BotAgentStatus,
  BotAgentsStatusResponse,
  PCSBotStatus,
  PCSBotsStatusResponse,
} from 'src/interfaces'
import { Notify } from 'quasar'

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService)

// ============ State Interface ============
interface ConvBuilderState {
  // Auth
  cbToken: string | null
  cbOrg: string | null
  cbAuthInfo: CBAuthInfo | null

  // Data
  bots: Bot[]
  botGroups: BotGroup[]
  chatBots: Map<string, ChatBot>
  dialogs: Map<string, CBDialog[]>
  interactions: Map<string, CBInteraction[]>
  nluDomains: NLUDomain[]
  knowledgeBases: KnowledgeBase[]
  botUsers: BotUser[]
  responders: Map<string, Responder[]>
  globalFunctions: Map<string, GlobalFunctions>
  botEnvironments: BotEnvironment[]
  lpSkills: LPSkill[]
  credentials: unknown[]
  dialogTemplates: unknown[]
  debugLogs: DebugLogRecords[]
  totalIntentsCount: number

  // Bot Agents Status data
  botAgentsStatus: BotAgentStatus[]
  pcsBotsStatus: PCSBotStatus[]

  // KAI On-Demand data
  kaiConfigs: KAISearchRequestConfig[]
  kaiArticles: KAIArticle[]
  kaiArticleCategories: string[]
  kaiCategoryFilters: string[]
  defaultPrompt: DefaultPrompt | null

  // Loading states
  loading: {
    auth: boolean
    bots: boolean
    botGroups: boolean
    dialogs: boolean
    interactions: boolean
    nluDomains: boolean
    knowledgeBases: boolean
    botUsers: boolean
    responders: boolean
    globalFunctions: boolean
    environment: boolean
    skills: boolean
    credentials: boolean
    dialogTemplates: boolean
    debugLogs: boolean
    botAgentsStatus: boolean
    pcsBotsStatus: boolean
    kaiConfigs: boolean
    kaiArticles: boolean
    defaultPrompt: boolean
  }
}

// ============ Store Definition ============
export const useConvBuilderStore = defineStore('convbuilder', {
  state: (): ConvBuilderState => ({
    // Auth
    cbToken: null,
    cbOrg: null,
    cbAuthInfo: null,

    // Data
    bots: [],
    botGroups: [],
    chatBots: new Map(),
    dialogs: new Map(),
    interactions: new Map(),
    nluDomains: [],
    knowledgeBases: [],
    botUsers: [],
    responders: new Map(),
    globalFunctions: new Map(),
    botEnvironments: [],
    lpSkills: [],
    credentials: [],
    dialogTemplates: [],
    debugLogs: [],
    totalIntentsCount: 0,

    // Bot Agents Status data
    botAgentsStatus: [],
    pcsBotsStatus: [],

    // KAI On-Demand data
    kaiConfigs: [],
    kaiArticles: [],
    kaiArticleCategories: [],
    kaiCategoryFilters: [],
    defaultPrompt: null,

    // Loading states
    loading: {
      auth: false,
      bots: false,
      botGroups: false,
      dialogs: false,
      interactions: false,
      nluDomains: false,
      knowledgeBases: false,
      botUsers: false,
      responders: false,
      globalFunctions: false,
      environment: false,
      skills: false,
      credentials: false,
      dialogTemplates: false,
      debugLogs: false,
      botAgentsStatus: false,
      pcsBotsStatus: false,
      kaiConfigs: false,
      kaiArticles: false,
      defaultPrompt: false,
    },
  }),

  getters: {
    isAuthenticated: (state) => !!state.cbToken && !!state.cbOrg,
    getBotById: (state) => (botId: string) => state.bots.find((b: Bot) => b.botId === botId),
    getChatBotById: (state) => (chatBotId: string) => state.chatBots.get(chatBotId),
    getDialogsForBot: (state) => (botId: string) => state.dialogs.get(botId) || [],
    getInteractionsForBot: (state) => (botId: string) => state.interactions.get(botId) || [],
    getRespondersForChatBot: (state) => (chatBotId: string) => state.responders.get(chatBotId) || [],
    getGlobalFunctionsForBot: (state) => (botId: string) => state.globalFunctions.get(botId),
    getKnowledgeBaseById: (state) => (kbId: string) => state.knowledgeBases.find((kb: KnowledgeBase) => kb.id === kbId),
    activeBots: (state) => state.bots.filter((b: Bot) => b.numberOfActiveAgents > 0),
    messagingBots: (state) => state.bots.filter((b: Bot) => b.channel === 'MESSAGING'),
    chatBotsByChannel: (state) => state.bots.filter((b: Bot) => b.channel === 'CHAT'),
    // KAI getters
    filteredArticles: (state) => {
      const categories = state.kaiCategoryFilters
      if (categories.length === 0) return state.kaiArticles
      return state.kaiArticles.filter((article: KAIArticle) => categories.includes(article.category))
    },
  },

  actions: {
    // ============ Helper ============
    getAccountId(): string {
      const accountId = useUserStore().accountId
      if (!accountId) throw new Error('No accountId found')
      return accountId
    },

    // ============ Authentication ============
    async authenticate(): Promise<CBAuthInfo | null> {
      try {
        this.loading.auth = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.TOKEN(accountId)
        const { data } = await ApiService.get<CBAuthInfo>(url, CB_ACTION_KEYS.AUTHENTICATE)

        if (data.success && data.successResult) {
          this.cbAuthInfo = data
          this.cbToken = data.successResult.apiAccessToken
          this.cbOrg = data.successResult.sessionOrganizationId
        }
        return data
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.auth = false
      }
    },

    // ============ Bots ============
    /**
     * Fetches all bots by first getting bot groups, then fetching bots from each group
     * using bot-group-id parameter, plus unassigned bots.
     */
    async getBots(): Promise<Bot[] | null> {
      try {
        this.loading.bots = true
        const accountId = this.getAccountId()
        const allBots: Bot[] = []

        // First, get all bot groups
        const groupsUrl = `${CB_BUILDER_ROUTES.BOT_GROUPS(accountId)}?page=1&size=100`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: groupsData } = await ApiService.get<any>(
          groupsUrl,
          CB_ACTION_KEYS.GET_BOT_GROUPS
        )

        console.log('Bot groups raw response:', groupsData)

        // Handle different response structures
        let groups: BotGroup[] = []
        if (groupsData?.successResult?.data && Array.isArray(groupsData.successResult.data)) {
          groups = groupsData.successResult.data
        } else if (Array.isArray(groupsData?.successResult)) {
          groups = groupsData.successResult
        } else if (Array.isArray(groupsData)) {
          groups = groupsData
        }
        console.log('Parsed bot groups:', groups.length, groups.map(g => ({ id: g.botGroupId, name: g.botGroupName })))
        this.botGroups = groups

        // Collect group IDs plus 'un_assigned' for bots without a group
        const groupIds = ['un_assigned', ...groups.map((g: BotGroup) => g.botGroupId)]

        // Fetch bots from each group in parallel using bot-group-id parameter
        const botPromises = groupIds.map(async (groupId) => {
          try {
            const params = new URLSearchParams({
              'bot-group-id': groupId,
              'sort-by': 'botName:asc',
              page: '1',
              size: '100',
            })
            const url = `${CB_BUILDER_ROUTES.BOTS_BY_GROUP(accountId)}?${params}`
            const { data } = await ApiService.get<CBApiResponse<PaginatedResult<Bot>>>(
              url,
              `${CB_ACTION_KEYS.GET_BOTS_BY_GROUP}_${groupId}`
            )
            console.log(`Bots response for group ${groupId}:`, data)

            // Response could be successResult.data (paginated) or successResult directly (array)
            const bots = data.successResult?.data || (Array.isArray(data.successResult) ? data.successResult : [])

            // Find the group name for this groupId
            const group = groups.find(g => g.botGroupId === groupId)
            const groupName = group?.botGroupName || (groupId === 'un_assigned' ? 'Unassigned' : groupId)

            // Add group info to each bot
            return bots.map((bot: Bot) => ({
              ...bot,
              botGroupId: groupId,
              botGroupName: groupName
            }))
          } catch (err) {
            console.warn(`Failed to fetch bots for group ${groupId}:`, err)
            return []
          }
        })

        const botsArrays = await Promise.all(botPromises)
        console.log('Bot groups:', groupIds, 'Bot arrays:', botsArrays.map((arr, i) => `${groupIds[i]}: ${arr.length}`))
        botsArrays.forEach((bots) => {
          allBots.push(...bots)
        })

        // Deduplicate bots by botId (in case a bot appears in multiple responses)
        const uniqueBots = Array.from(
          new Map(allBots.map((bot) => [bot.botId, bot])).values()
        )

        console.log(`Total unique bots fetched: ${uniqueBots.length}`)
        this.bots = uniqueBots
        return uniqueBots
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.bots = false
      }
    },

    async getBotLogs(botId: string): Promise<DebugLogRecords[] | null> {
      try {
        this.loading.debugLogs = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.BOT_LOGS(accountId, botId)
        const { data } = await ApiService.get<DebugLogResponse>(url, CB_ACTION_KEYS.GET_BOT_LOGS)

        if (data.successResult?.logs) {
          this.debugLogs = data.successResult.logs
        }
        return data.successResult?.logs || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.debugLogs = false
      }
    },

    async getBotStatus(botId: string): Promise<BotInstanceStatus | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.BOT_STATUS(accountId, botId)
        const { data } = await ApiService.get<CBApiResponse<BotInstanceStatus>>(url, CB_ACTION_KEYS.GET_BOT_STATUS)
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async startBot(botId: string, lpAccountId: string, lpAccountUser: string): Promise<boolean> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.BOT_START(accountId, botId)
        await ApiService.put(url, { lpAccountId, lpAccountUser }, CB_ACTION_KEYS.START_BOT)
        return true
      } catch (error) {
        handleRequestError(error, true)
        return false
      }
    },

    async stopBot(botId: string, lpAccountId: string, lpAccountUser: string): Promise<boolean> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.BOT_STOP(accountId, botId)
        await ApiService.put(url, { lpAccountId, lpAccountUser }, CB_ACTION_KEYS.STOP_BOT)
        return true
      } catch (error) {
        handleRequestError(error, true)
        return false
      }
    },

    // ============ Bot Groups ============
    async getBotGroups(page = 1, size = 10): Promise<PaginatedResult<BotGroup> | null> {
      try {
        this.loading.botGroups = true
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.BOT_GROUPS(accountId)}?page=${page}&size=${size}`
        const { data } = await ApiService.get<CBApiResponse<PaginatedResult<BotGroup>>>(url, CB_ACTION_KEYS.GET_BOT_GROUPS)

        if (data.successResult?.data) {
          this.botGroups = data.successResult.data
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.botGroups = false
      }
    },

    async getBotsByGroup(
      botGroupId = 'un_assigned',
      sortBy = 'botName:asc',
      page = 1,
      size = 10
    ): Promise<PaginatedResult<Bot> | null> {
      try {
        this.loading.bots = true
        const accountId = this.getAccountId()
        const params = new URLSearchParams({
          'bot-group-id': botGroupId,
          'sort-by': sortBy,
          page: String(page),
          size: String(size),
        })
        const url = `${CB_BUILDER_ROUTES.BOTS_BY_GROUP(accountId)}?${params}`
        const { data } = await ApiService.get<CBApiResponse<PaginatedResult<Bot>>>(url, CB_ACTION_KEYS.GET_BOTS_BY_GROUP)
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.bots = false
      }
    },

    // ============ Chatbots ============
    async getChatBot(chatBotId: string): Promise<ChatBot | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.CHATBOT(accountId, chatBotId)
        const { data } = await ApiService.get<CBApiResponse<ChatBot>>(url, CB_ACTION_KEYS.GET_CHATBOT)

        if (data.successResult) {
          this.chatBots.set(chatBotId, data.successResult)
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    // ============ Dialogs ============
    async getDialogs(botId: string): Promise<CBDialog[] | null> {
      try {
        this.loading.dialogs = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.DIALOGS(accountId, botId)
        const { data } = await ApiService.get<CBApiResponse<{ Group: CBDialog[] }>>(url, CB_ACTION_KEYS.GET_DIALOGS)

        if (data.successResult?.Group) {
          this.dialogs.set(botId, data.successResult.Group)
        }
        return data.successResult?.Group || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.dialogs = false
      }
    },

    // ============ Interactions ============
    async getInteractions(botId: string): Promise<CBInteraction[] | null> {
      try {
        this.loading.interactions = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.INTERACTIONS(accountId, botId)
        const { data } = await ApiService.get<CBApiResponse<{ message: CBInteraction[] }>>(url, CB_ACTION_KEYS.GET_INTERACTIONS)

        if (data.successResult?.message) {
          this.interactions.set(botId, data.successResult.message)
        }
        return data.successResult?.message || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.interactions = false
      }
    },

    // ============ Responders / Integrations ============
    async getResponders(chatBotId: string): Promise<Responder[] | null> {
      try {
        this.loading.responders = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.RESPONDERS(accountId, chatBotId)
        const { data } = await ApiService.get<CBApiResponse<Responder[]>>(url, CB_ACTION_KEYS.GET_RESPONDERS)

        if (data.successResult) {
          this.responders.set(chatBotId, data.successResult)
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.responders = false
      }
    },

    // ============ NLU Domains ============
    async getNLUDomains(): Promise<NLUDomain[] | null> {
      try {
        this.loading.nluDomains = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.NLU_DOMAINS(accountId)
        const { data } = await ApiService.get<CBApiResponse<{ DomainList: NLUDomain[] }>>(url, CB_ACTION_KEYS.GET_NLU_DOMAINS)

        if (data.successResult?.DomainList) {
          this.nluDomains = data.successResult.DomainList
        }
        return data.successResult?.DomainList || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.nluDomains = false
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getDomainIntents(domainId: string): Promise<any[] | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.DOMAIN_INTENTS(accountId, domainId)
        console.log(`Fetching intents for domain ${domainId} from:`, url)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.get<CBApiResponse<any>>(
          url,
          `${CB_ACTION_KEYS.GET_DOMAIN_INTENTS}_${domainId}`
        )
        console.log(`Intents raw response for domain ${domainId}:`, data)
        // Response structure may vary - could be successResult.intents, successResult, or direct array
        if (data.successResult?.intents) {
          return data.successResult.intents
        }
        if (Array.isArray(data.successResult)) {
          return data.successResult
        }
        return data.successResult || null
      } catch (error) {
        console.error(`Failed to fetch intents for domain ${domainId}:`, error)
        return null
      }
    },

    // ============ Knowledge Bases ============
    async getKnowledgeBases(includeMetrics = true): Promise<KnowledgeBase[] | null> {
      try {
        this.loading.knowledgeBases = true
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.KNOWLEDGE_BASES(accountId)}?includeMetrics=${includeMetrics}`
        console.info('[ConvBuilderStore] getKnowledgeBases URL:', url)
        const { data } = await ApiService.get<CBApiResponse<{ KnowledgeDataSource: KnowledgeBase[] }>>(
          url,
          CB_ACTION_KEYS.GET_KNOWLEDGE_BASES
        )

        // Handle response - could be wrapped in successResult or direct
        const kbs = data?.successResult?.KnowledgeDataSource
          || (Array.isArray(data) ? data : [])
        this.knowledgeBases = kbs
        return kbs
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.knowledgeBases = false
      }
    },

    async getKnowledgeBase(kbId: string, includeMetrics = true): Promise<KnowledgeBase | null> {
      try {
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.KNOWLEDGE_BASE(accountId, kbId)}?includeMetrics=${includeMetrics}`
        const { data } = await ApiService.get<CBApiResponse<{ KnowledgeDataSource: KnowledgeBase }>>(
          url,
          CB_ACTION_KEYS.GET_KNOWLEDGE_BASE
        )
        return data.successResult?.KnowledgeDataSource || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getKBContentSources(kbId: string, includeKmsRecipeDetails = true): Promise<any> {
      try {
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.KB_CONTENT_SOURCES(accountId, kbId)}?includeKmsRecipeDetails=${includeKmsRecipeDetails}`
        const { data } = await ApiService.get<CBApiResponse<unknown[]>>(
          url,
          CB_ACTION_KEYS.GET_KB_CONTENT_SOURCES
        )
        return data.successResult || data || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async getKBArticlesFromKB(
      kbId: string,
      options: {
        page?: number
        size?: number
        sortAscByLastModificationTime?: boolean
        articleIds?: string[]
        includeConflictingDetails?: boolean
      } = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
      try {
        const accountId = this.getAccountId()
        const {
          page = 1,
          size = 20,
          sortAscByLastModificationTime = false,
          articleIds = [],
          includeConflictingDetails = true
        } = options
        const url = `${CB_BUILDER_ROUTES.KB_ARTICLES(accountId, kbId)}?includeConflictingDetails=${includeConflictingDetails}`
        // Use dynamic action key with kbId to prevent request cancellation when fetching from multiple KBs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.post<CBApiResponse<any>>(
          url,
          { page, size, sortAscByLastModificationTime, articleIds },
          `${CB_ACTION_KEYS.GET_KB_ARTICLES}_${kbId}`
        )
        return data.successResult || data || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    // ============ Bot Users / Agent Management ============
    async getBotUsers(): Promise<BotUser[] | null> {
      try {
        this.loading.botUsers = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.BOT_USERS(accountId)
        const { data } = await ApiService.get<CBApiResponse<BotUser[]>>(url, CB_ACTION_KEYS.GET_BOT_USERS)

        if (data.successResult) {
          this.botUsers = data.successResult
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.botUsers = false
      }
    },

    async addBotAgent(lpUserId: string, chatBotId: string, request: AddBotAgentRequest): Promise<boolean> {
      try {
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.ADD_BOT_AGENT(accountId, lpUserId)}?chatBotId=${chatBotId}`
        await ApiService.post(url, request, CB_ACTION_KEYS.ADD_BOT_AGENT)
        return true
      } catch (error) {
        handleRequestError(error, true)
        return false
      }
    },

    // ============ Global Functions ============
    async getGlobalFunctions(botId: string): Promise<GlobalFunctions | null> {
      try {
        this.loading.globalFunctions = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.GLOBAL_FUNCTIONS(accountId, botId)
        const { data } = await ApiService.get<CBApiResponse<GlobalFunctions>>(url, CB_ACTION_KEYS.GET_GLOBAL_FUNCTIONS)

        if (data.successResult) {
          this.globalFunctions.set(botId, data.successResult)
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.globalFunctions = false
      }
    },

    // ============ Bot Environment ============
    async getBotEnvironment(): Promise<BotEnvironment[] | null> {
      try {
        this.loading.environment = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.BOT_ENVIRONMENT(accountId)
        console.log('Fetching bot environments from:', url)
        const { data } = await ApiService.get<CBApiResponse<BotEnvironment[]>>(url, CB_ACTION_KEYS.GET_BOT_ENVIRONMENT)

        console.log('Bot environments raw response:', data)
        // Response could be:
        // 1. { successResult: [...] } - our backend wrapped response
        // 2. [...] - direct array from LP API (less common)
        let environments: BotEnvironment[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawData = data as any
        if (Array.isArray(rawData)) {
          // Direct array response
          environments = rawData
        } else if (Array.isArray(rawData?.successResult)) {
          // Wrapped array
          environments = rawData.successResult
        }
        console.log('Bot environments fetched:', environments.length)
        this.botEnvironments = environments
        return environments
      } catch (error) {
        console.error('Bot environments fetch error:', error)
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.environment = false
      }
    },

    // ============ LP Skills ============
    async getLPSkills(): Promise<LPSkill[] | null> {
      try {
        this.loading.skills = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.LP_SKILLS(accountId)
        const { data } = await ApiService.get<CBApiResponse<LPSkill[]>>(url, CB_ACTION_KEYS.GET_LP_SKILLS)

        if (data.successResult) {
          this.lpSkills = data.successResult
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.skills = false
      }
    },

    // ============ Credentials ============
    async getCredentials(): Promise<unknown[] | null> {
      try {
        this.loading.credentials = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.CREDENTIALS(accountId)
        const { data } = await ApiService.get<CBApiResponse<unknown[]>>(url, CB_ACTION_KEYS.GET_CREDENTIALS)

        if (data.successResult) {
          this.credentials = data.successResult
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.credentials = false
      }
    },

    async getLPAppCredentials(chatBotId: string): Promise<LPAppCredentials | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.LP_APP_CREDENTIALS(accountId, chatBotId)
        const { data } = await ApiService.get<CBApiResponse<LPAppCredentials>>(url, CB_ACTION_KEYS.GET_LP_APP_CREDENTIALS)
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    // ============ Dialog Templates ============
    async getDialogTemplates(): Promise<unknown[] | null> {
      try {
        this.loading.dialogTemplates = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.DIALOG_TEMPLATES(accountId)
        const { data } = await ApiService.get<CBApiResponse<unknown[]>>(url, CB_ACTION_KEYS.GET_DIALOG_TEMPLATES)

        if (data.successResult) {
          this.dialogTemplates = data.successResult
        }
        return data.successResult || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.dialogTemplates = false
      }
    },

    // ============ Bot Agents Status ============
    async getBotAgentsStatus(environment = 'PRODUCTION'): Promise<BotAgentStatus[] | null> {
      try {
        this.loading.botAgentsStatus = true
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.BOT_AGENTS_STATUS(accountId)}?environment=${environment}`
        const { data } = await ApiService.get<BotAgentsStatusResponse>(url, CB_ACTION_KEYS.GET_BOT_AGENTS_STATUS)

        const statusList = data?.statusList || []
        this.botAgentsStatus = statusList
        return statusList
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.botAgentsStatus = false
      }
    },

    // ============ PCS Bots Status ============
    async getPCSBotsStatus(showBotsData = true): Promise<PCSBotStatus[] | null> {
      try {
        this.loading.pcsBotsStatus = true
        const accountId = this.getAccountId()
        const url = `${CB_BUILDER_ROUTES.PCS_BOTS_STATUS(accountId)}?showBotsData=${showBotsData}`
        const { data } = await ApiService.get<PCSBotsStatusResponse>(url, CB_ACTION_KEYS.GET_PCS_BOTS_STATUS)

        const statusList = data?.statusList || []
        this.pcsBotsStatus = statusList
        return statusList
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.pcsBotsStatus = false
      }
    },

    // ============ KAI On-Demand ============
    async getDefaultPrompt(): Promise<DefaultPrompt | null> {
      try {
        this.loading.defaultPrompt = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_DEFAULT_PROMPT(accountId)
        const { data } = await ApiService.get<DefaultPromptResponse>(url, CB_ACTION_KEYS.GET_DEFAULT_PROMPT)

        if (data.successResult?.prompt) {
          this.defaultPrompt = data.successResult.prompt
        }
        return data.successResult?.prompt || null
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.defaultPrompt = false
      }
    },

    async getKAIConfigs(useCache = false): Promise<KAISearchRequestConfig[] | null> {
      try {
        if (useCache && this.kaiConfigs.length > 0) {
          return this.kaiConfigs
        }
        this.loading.kaiConfigs = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_OD_CONFIGS(accountId)
        const { data } = await ApiService.get<KAISearchRequestConfig[]>(url, CB_ACTION_KEYS.GET_KAI_OD_CONFIGS)

        this.kaiConfigs = data
        return data
      } catch (error) {
        handleRequestError(error, true)
        return null
      } finally {
        this.loading.kaiConfigs = false
      }
    },

    async getKAIConfig(configId: string): Promise<KAISearchRequestConfig | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_OD_CONFIG_BY_ID(accountId, configId)
        const { data } = await ApiService.get<KAISearchRequestConfig>(url, CB_ACTION_KEYS.GET_KAI_OD_CONFIG)
        return data
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async addKAIConfig(config: KAISearchRequestConfigBasic): Promise<KAISearchRequestConfig | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_OD_CONFIG(accountId)
        const { data } = await ApiService.post<KAISearchRequestConfig>(url, config, CB_ACTION_KEYS.ADD_KAI_OD_CONFIG)
        return data
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async updateKAIConfig(config: KAISearchRequestConfig): Promise<KAISearchRequestConfig | null> {
      try {
        if (!config.id) throw new Error('Config ID is required')
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_OD_CONFIG_BY_ID(accountId, config.id)
        const { data } = await ApiService.put<KAISearchRequestConfig>(url, config, CB_ACTION_KEYS.UPDATE_KAI_OD_CONFIG)
        return data
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async searchKB(kbId: string, requestTemplate: RequestTemplate): Promise<KAISuccessResult | null> {
      try {
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_KB_SEARCH(accountId, kbId)
        const { data } = await ApiService.post<KAIResponse>(url, requestTemplate, CB_ACTION_KEYS.SEARCH_KB)

        if (data.success) {
          return data.successResult.success[0] ?? null
        } else {
          Notify.create({
            type: 'negative',
            message: 'Search Error',
            caption: data.errorCode,
          })
          return null
        }
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async getKBArticles(kbId: string): Promise<KAIArticle[]> {
      this.kaiArticleCategories = []
      this.kaiArticles = []
      this.kaiCategoryFilters = []

      try {
        this.loading.kaiArticles = true
        const accountId = this.getAccountId()
        const url = CB_BUILDER_ROUTES.KAI_KB_ARTICLES(accountId, kbId)
        const { data } = await ApiService.post<KAIArticlesResponse>(
          url,
          { page: 1, sortAscByLastModificationTime: false, size: 200 },
          CB_ACTION_KEYS.GET_KB_ARTICLES
        )

        if (data.success) {
          const categories: string[] = []
          data.successResult.success.articles.forEach((article: KAIArticle) => {
            if (!categories.includes(article.category)) {
              categories.push(article.category)
            }
          })
          this.kaiArticleCategories = categories
          this.kaiArticles = data.successResult.success.articles
          return data.successResult.success.articles
        } else {
          Notify.create({
            type: 'negative',
            message: 'Error',
            caption: 'Error retrieving articles',
          })
          return []
        }
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.kaiArticles = false
      }
    },

    setCategoryFilters(filters: string[]) {
      this.kaiCategoryFilters = filters
    },

    setTotalIntentsCount(count: number) {
      this.totalIntentsCount = count
    },

    // ============ Reset ============
    reset() {
      this.$reset()
    },
  },
})
