// ============ Common Response Wrapper ============
export interface CBApiResponse<T> {
  success: boolean
  error?: string
  errorCode?: string
  message?: string
  successResult?: T
}

export interface PageContext {
  page: number
  size: number
  totalSize: number
}

export interface PaginatedResult<T> {
  pageContext: PageContext
  data: T[]
}

// ============ Bot Groups ============
export interface BotGroup {
  botGroupId: string
  botGroupName: string
  name?: string // Alias for botGroupName in some responses
  transferMessage: string
  channel: 'MESSAGING' | 'CHAT'
  organizationId: string
  collaborationEnabled: boolean
  numberOfBots: number
  createdAt: number
  updatedAt: number
  createdBy: string | null
  createdByName: string | null
  updatedBy: string | null
  updatedByName: string | null
  // When expand-all=true is used, bots are embedded in the response
  bots?: Bot[]
}

// ============ Bots / Chatbots ============
export interface Bot {
  botId: string
  botName: string
  botDescription: string | null
  botType: 'CUSTOMER_FACING_BOT' | 'POST_SURVEY_BOT' | 'AGENT_FACING_BOT'
  channel: 'MESSAGING' | 'CHAT'
  botLanguage: string
  agentAnnotationsEnabled: boolean
  debuggingEnabled: boolean
  botVersion: string
  entityDataSourceId: string | null
  skills: string[] | null
  publicBot: boolean
  organizationId: string
  botGroupId: string | null
  botGroupName?: string // Added when extracting bots from groups
  chatBotPlatformUserId: string
  createdAt: number
  updatedAt: number
  createdBy: string | null
  createdByName: string | null
  updatedBy: string | null
  updatedByName: string | null
  numberOfDialogs: number
  numberOfInteractions: number
  numberOfIntegrations: number
  numberOfActiveAgents: number
  numberOfInactiveAgents: number
  numberOfDomains: number
  numberOfIntents: number
  hasDisambiguation: boolean
  hasAutoescalation: boolean
  smallTalkEnabled: boolean
}

export interface BotPlatform {
  id: string
  platform: string
  botId: string
  status: string
  integrationType: string
}

export interface ChatBot {
  id: string
  name: string
  description: string | null
  personality: string | null
  status: string
  chatBotPlatformUserId: string
  platforms: BotPlatform[]
  getStartedButtonPayload: string
  imageURL: string | null
  createdBy: string | null
  modifiedBy: string | null
  creationTime: number
  modificationTime: number
  entityDataSourceId: string | null
  demo: boolean
  language: string
  enterpriseIntegrations: null
  organizationId: string
  autoEscalation: null
  skipNLP: boolean
  environmentId: string | null
  sessionLength: number
  passThroughMode: boolean
  transcriptDisabled: boolean
  botTemplateId: string | null
  version: string
  defaultErrorMessage: string | null
  sessionExpiredMessage: string | null
  thankyouMessage: string | null
  shortenUrl: string | null
  chatBotType: string
  channel: string
  startDialog: string | null
  publicBot: boolean
  skillIds: string[] | null
  transferGroupId: string | null
  readOnlyBot: boolean
  enableDebug: boolean
  enableAgentAnnotations: boolean
  botAttributes: null
  voiceAttributes: null
  emailTranscriptId: string | null
  emailTranscriptSenderEmail: string | null
  emailTranscriptSenderName: string | null
  emailTranscriptEnabled: boolean | null
  thankYouMessageEnabled: boolean | null
  externalId: string | null
  surveyTargetingParameters: null
  fallbackLimit: number
  fallbackLimitMessage: string | null
  voiceType: string | null
  voiceGender: string | null
  voiceToneSetting: string | null
  voiceAudioCueSetting: string | null
  smallTalkEnabled: boolean
  chatBotTypeName: string
  voiceSupported: boolean
  messagingSupported: boolean
}

export interface ChatBotMetrics {
  chatBotId: string
  totalSubscribers: number
  totalMessages: number
}

export interface ChatBotSummary {
  chatBot: ChatBot
  chatBotMetrics: ChatBotMetrics
}

export interface ChatBotSummaryList {
  chatBotSummaryList: ChatBotSummary[]
}

// ============ Dialogs ============
export interface CBDialog {
  chatBotId: string
  id: string
  name: string
  creationTime: string
  modificationTime: string
  description: string
  dialogType: 'DIALOG' | 'FALLBACK_DIALOG' | 'SURVEY_DIALOG'
  status: 'ENABLED' | 'DISABLED'
  disambiguteOnlySelectedDomains: boolean
}

export interface CBDialogGroup {
  Group: CBDialog[]
}

// ============ Interactions ============
export interface ResponseMatch {
  name?: string
  conditions: unknown[]
  contextConditions: unknown[]
  contextMatchConditionType?: string
  action: {
    name: string
    value: string
  }
  contextDataVariables: unknown[]
}

export interface TileData {
  text?: string
  buttons: unknown[]
  quickReplyList: unknown[]
  sampleUserInput?: string
  escalation?: {
    tangoContextEnabled: boolean
  }
}

export interface CBInteractionContent {
  contentType: 'STATIC' | 'DYNAMIC'
  results?: {
    type: string
    tile: {
      tileData: TileData[]
    }
  }
  responderName?: string
  responderId?: string
}

export interface CBInteraction {
  id: string
  chatBotId: string
  userInputRequired: boolean
  name: string
  pattern?: string[]
  type: string
  content: CBInteractionContent
  preProcessMessage?: string
  postProcessMessage?: string
  group: string
  status: 'ACTIVE' | 'INACTIVE'
  required?: boolean
  nextMessageId?: string
  prevMessageId?: string
  responseMatches: ResponseMatch[]
  interactionType: string
  changeResponse?: { enabled: boolean }
  cancelResponse?: { enabled: boolean }
  comment?: {
    content: string
    lastCommenterName: string
    lastCommenterId: string
    lastModifiedDate: number
  }
}

export interface CBInteractionList {
  message: CBInteraction[]
  pcsSynchronizationWithAcChecked?: boolean
}

// ============ NLU Domains ============
export interface DuplicatePhrase {
  normalizedPhrase: string
  duplicatePhrases: {
    intentId: string
    intentName: string
    phrase: string
  }[]
}

export interface DuplicatePhrases {
  duplicates: DuplicatePhrase[]
  domainId: string
}

export interface NLUDomain {
  id: string
  name: string
  chatBotPlatformUserId: string
  organizationId: string
  status: 'ACTIVE' | 'INACTIVE'
  creationTime: string
  modificationTime: string
  modifiedBy: string
  enableKeyPhraseMatch: boolean
  keyPhraseMatchThreshold: number
  type: string
  intentUploadFileName?: string
  entityUploadFileName?: string
  duplicatePhrases?: DuplicatePhrases
  nluShareDataAgree: boolean
  migrationNluShareDataAgreeTs: number
  acceptMaskedMessages: boolean
  language?: string
  domainOrigin: 'USER' | 'GLOBAL'
  verticalType?: string
  verticalName?: string
  primary: boolean
  intentAnalyzerEnabled: boolean
  hasLiveIntents: boolean
  numberOfIntents?: number
}

export interface DomainList {
  DomainList: NLUDomain[]
}

// ============ Knowledge Base (KAI) ============
export interface KBLandingPageMetrics {
  kbId: string
  organizationId: string
  numOfTotalArticles: number
  numOfActiveArticles: number
  numOfRedundantArticles?: number
  numOfConflictingArticles?: number
  numOfArticlesHaveIntents: number
  lastContentUpdatedTime: number
  connectedBots?: string[]
  connectedConvAssistSkills?: string[]
  modifiedTime: number
  createdTime: number
}

export interface SyncStatusDetails {
  syncStatus: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED'
  syncStatusMessage: string | null
  syncTime: number
}

export interface KnowledgeBase {
  createdByName: string
  modifiedByName: string
  id: string
  name: string
  type: 'KnowledgeBase'
  googleSheetUrl?: string
  chatBotPlatformUserId: string
  status: 'ACTIVE' | 'INACTIVE'
  modificationTime?: string
  syncStatusDetails?: SyncStatusDetails
  dataSourceConfiguration: {
    properties: Record<string, unknown>
  }
  organizationId: string
  privateAccess: boolean
  language: string
  langCode: string
  entitiesAvailable: boolean
  intentAssociationType?: string
  entitiesDataSourceId?: string
  publicKB: boolean
  createdAt: number
  modifiedAt: number
  createdBy: string
  modifiedBy: string
  kbConfigProperties: {
    enableAssessments?: string
    llmEnrichment: string
    kms_secret?: string
    type?: string
  }
  domainType?: string
  kBLandingPageMetrics?: KBLandingPageMetrics
}

export interface KnowledgeBaseList {
  KnowledgeDataSource: KnowledgeBase[]
}

export interface KnowledgeBaseDetail {
  KnowledgeDataSource: KnowledgeBase
}

// ============ Bot Agent Management ============
export interface BotUser {
  lpUserId: string
  lpAccountId: string
  lpAccountUser: string
  botId: string
  chatBotId: string
  deploymentEnvironment: 'PRODUCTION' | 'STAGING'
  type: 'messaging' | 'chat'
  configurations: {
    lpUserRole: string
    enableAccessibility: boolean
    tileDisplay: string
  }
}

export interface BotInstanceStatus {
  botId: string
  status: 'RUNNING' | 'STOPPED' | 'ERROR'
  lpAccountId: string
  lpAccountUser: string
}

export interface AddBotAgentRequest {
  deploymentEnvironment: 'PRODUCTION' | 'STAGING'
  type: 'messaging' | 'chat'
  configurations: {
    lpUserRole: string
    enableAccessibility: boolean
    tileDisplay: string
  }
  lpUserId: string
  lpAccountId: string
  lpAccountUser: string
  botId: string
}

// ============ Responders / Integrations ============
export interface Responder {
  id: string
  chatBotId: string
  name: string
  type: string
  url?: string
  method?: string
  headers?: Record<string, string>
  body?: string
  responseMapping?: Record<string, string>
}

// ============ Global Functions ============
export interface GlobalFunctions {
  chatBotId: string
  code: string
  lastModified: number
  lastModifiedBy: string
}

// ============ Bot Environment ============
export interface BotEnvironmentVariable {
  key: string
  value: string
  csdsWebhook?: string | null
}

export interface BotEnvironment {
  id: string
  name: string
  orgId: string
  description?: string
  variables: BotEnvironmentVariable[]
  created?: number
  updated?: number
  createdBy?: string
  updatedBy?: string
}

// ============ LP App Credentials ============
export interface LPAppCredentials {
  chatBotId: string
  appKey: string
  appSecret: string
  accessToken: string
  accessTokenSecret: string
}

// ============ LP Skills ============
export interface LPSkill {
  id: number
  name: string
  description: string
  maxWaitTime: number
  defaultTimeToHold: number
}

// ============ CB Auth ============
export interface CBAuthInfo {
  success: boolean
  successResult: {
    chatBotPlatformUser: {
      id: string
      name: string
      email: string
      firstname: string
      lastname: string
      userLoginType: string
      userId: string
      role: string
      orgId: string
      status: string
      creationTime: string
      modificationTime: string
      cb2Enabled: boolean
    }
    apiAccessToken: string
    apiAccessPermToken: string
    config: unknown
    sessionOrganizationId: string
    leAccountId: string
    cbRegion: string
    enabledFeatures: string[]
    siteSettings: unknown[]
    leUserId: string
    privileges: number[]
    isElevatedLpa: boolean
  }
  message: string
}

// ============ Debug Logs (existing) ============
export interface DebugLog {
  level: string
  message: string
  location?: string
  json?: string | null
  type?: string
  content: {
    title: string
    summary: string
    expandable: boolean
    useSummary?: boolean
    description?: {
      key: string
      value: string
      isJson?: boolean
    }[]
    metadata?: {
      key: string
      value: string
    }[]
  }
  tags: string[]
  timestamp: number
}

export interface DebugLogRecords {
  userId: string
  id: string
  timestamp?: number
  message?: string
  accountId: string
  debugLogs: DebugLog[]
}

export interface DebugLogResponse {
  success: boolean
  successResult: {
    logs: DebugLogRecords[]
  }
}

export interface CBDebugRecords {
  userMessage?: string | null
  logMessages: string[]
  debugLogs: DebugLog[]
  errorIndexes?: number[]
  userId: string
  id: string
  accountId: string
}

// ============ Bot Agents Status (cbMonitoring) ============
export interface BotAgentStatus {
  appName: string
  botId: string
  botName: string
  botVersion: string
  cbSocketStatus: string
  lpSocketStatus: string
  createTime: number
  updateTime: number
  deployed: boolean
  environment: string
  haType?: string
  lastManualOperation?: string
  lpAccountId: string
  lpAccountUser?: string
  manualOperationPerformedById?: string
  manualOperationPerformedByName?: string
  manualOperationTs: number
  nodeStatus: string
  organizationId: string
  serverName?: string
  type: string
  ccLastCheck?: number
  lastMessageTime?: number
  orgName?: string
  lpUserId?: string
  pipelineConfig: Record<string, unknown>
}

export interface BotAgentsStatusResponse {
  statusList: BotAgentStatus[]
}

// ============ PCS Bots Status ============
export interface PCSBotStatus {
  createTime: number
  updateTime: number
  authType: string
  success: boolean
  pipelineConfig: Record<string, unknown>
  botName: string
  statusCode: number
  nodeStatus: string
  lpSocketStatus: string
  bcSocketStatus: string
  botVersion: string
  organizationId: string
  organizationName: string
  deployed: boolean
  changed: boolean
  lpAccountId: string
  type: string
  botId: string
  configurations: Record<string, unknown>
  manualOperationTs: number
  pm2Info: Record<string, unknown>
}

export interface PCSBotsStatusResponse {
  statusList: PCSBotStatus[]
}
