// export interface DefaultPrompt {
//   id: string
//   name: string
//   clientType: string
//   description: string
//   langCode: string
//   promptHeader: string
//   isDefault: boolean
//   createdBy: string
//   creationTime: number
// }

// export interface DefaultPromptSuccessResult {
//   prompt: DefaultPrompt
// }

// export interface DefaultPromptResponse {
//   success: boolean
//   statusCode: number
//   successResult: DefaultPromptSuccessResult
// }

export interface kBLandingPageMetrics {
  kbId: string;
  organizationId: string;
  numOfTotalArticles: number;
  numOfActiveArticles: number;
  numOfArticlesHaveIntents: number;
  lastContentUpdatedTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connectedConvAssistSkills: any[];
  modifiedTime: number;
  createdTime: number;
}

export interface kbConfigProperties {
  llmEnrichment: string;
}

export interface dataSourceConfiguration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any;
}

export interface KnowledgeDataSource {
  createdByName: string;
  modifiedByName: string;
  id: string;
  name: string;
  type: string;
  chatBotPlatformUserId: string;
  status: string;
  dataSourceConfiguration: dataSourceConfiguration;
  organizationId: string;
  privateAccess: boolean;
  language: string;
  langCode: string;
  entitiesAvailable: boolean;
  publicKB: boolean;
  createdAt: number;
  modifiedAt: number;
  createdBy: string;
  modifiedBy: string;
  kbConfigProperties: kbConfigProperties;
  kBLandingPageMetrics: kBLandingPageMetrics;
}

export interface KnowledgeDataSourceResponse {
  success: boolean;
  errorCode: string;
  successResult: {
    KnowledgeDataSource: KnowledgeDataSource[];
  };
}

export interface IKnowledgeBaseDetail {
  createdByName: string;
  modifiedByName: string;
  id: string;
  name: string;
  type: string;
  chatBotPlatformUserId: string;
  status: string;
  dataSourceConfiguration: dataSourceConfiguration;
  organizationId: string;
  privateAccess: boolean;
  language: string;
  langCode: string;
  entitiesAvailable: boolean;
  publicKB: boolean;
  createdAt: number;
  modifiedAt: number;
  createdBy: string;
  modifiedBy: string;
  kbConfigProperties: kbConfigProperties;
  kBLandingPageMetrics: kBLandingPageMetrics;
}

export interface IKnowledgeBaseDetailResponse {
  success: boolean;
  errorCode: string;
  successResult: {
    KnowledgeDataSource: IKnowledgeBaseDetail;
  };
}

export interface KAISearchRequestConfig {
  name?: string;
  description?: string;
  id?: string;
  kbId: string;
  siteId: string;
  llmConfig: {
    llmEnrichment: boolean
    promptTemplateId?: string
    // promptTemplate?: string
    // promptId?: string
    // promptName?: string
  }
  entitySource: string | null
  numberOfAnswers: number
  mode: string
  confidenceLevel: string
  status: string
  consumerQuery?: string
  isPreview: boolean
  kaiClient: string
}

export interface LLMConfig {
  promptId: string
  promptName: string
  llmEnrichment: boolean
  promptTemplate: string
}
export interface KAISearchRequestConfigBasic {
  id?: string
  name: string | null
  siteId: string | null
  description: string | null
  llmConfig: {
    promptId: string
    promptName: string
    llmEnrichment: boolean
    promptTemplate: string
  } | null
}

export interface KAIArticleContent {
  id: string
  title: string
  summary: string
  detail: string
  videoURL?: string
  imageURL?: string
  contentUrl?: string
  category?: string
  tags?: string[]
}
export interface KAIArticle {
  id: string
  title: string
  summary: string
  detail: string
  videoURL: string
  imageURL: string
  contentUrl: string
  modifiedBy: string
  source: string
  score: number
  matchStatus: string
  category: string
  tags: string[]
  createTime: number
  modificationTime: number
  status: string
  intentMatchScore: number
  matchType: string
  answerBeforeLlmEnrichment: string
  llmUsed: boolean
  potentiallyHallucinatedStatements: []
}

export interface KAIResponse {
  llmConfig: {
    promptId: string
    promptName: string
    llmEnrichment: boolean
    promptTemplate: string
  }
  numberOfAnswers: number
  mode: string
  confidenceLevel: string
  status: string
  consumerQuery: string
  isPreview: boolean
  kaiClient: string
  success: boolean
  errorCode: string
  successResult: {
    llmPrompt: string
    success: {
      id: string
      title: string
      summary: string
      detail: string
      videoURL: string
      imageURL: string
      contentUrl: string
      modifiedBy: string
      source: string
      score: number
      matchStatus: string
      category: string
      createTime: number
      modificationTime: number
      status: string
      intentMatchScore: number
      matchType: string
      answerBeforeLlmEnrichment: string
      llmUsed: boolean
      potentiallyHallucinatedStatements: []
    }[]
  }
}
export interface RequestTemplate {
  llmConfig: {
    promptId: string
    promptName: string
    llmEnrichment: boolean
    promptTemplate: string
  }
  entitySource?: string
  numberOfAnswers: number
  mode: string
  confidenceLevel: string
  status: string
  consumerQuery: string
  isPreview: boolean
  kaiClient: string
}

export interface KAISuccessResult {
  error?: boolean
  id: string
  title: string
  summary: string
  detail: string
  videoURL: string
  contentUrl: string
  imageURL: string
  modifiedBy: string
  source: string
  score: number
  matchStatus: string
  category: string
  createTime: number
  modificationTime: number
  status: string
  intentMatchScore: number
  matchType: string
  answerBeforeLlmEnrichment: string
  llmUsed: boolean
  potentiallyHallucinatedStatements: []
}

export interface KAIArticlesResponse {
  success: boolean
  successResult: {
    pagination: {
      nextPage: number
      page: number
      totalSize: number
      totalPages: number
      size: number
    }
    success: {
      articles: KAIArticle[]
    }
  }
}
