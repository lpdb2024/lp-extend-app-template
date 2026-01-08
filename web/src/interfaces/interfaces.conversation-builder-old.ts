// ============ Legacy CB Interfaces ============
// Most types have been moved to interfaces.conversation-builder.ts
// This file is kept for backwards compatibility

// export interface KAIArticleContent {
//   id: string
//   title: string
//   summary: string
//   detail: string
//   videoURL?: string
//   imageURL?: string
//   contentUrl?: string
//   category?: string
//   tags?: string[]
// }
// export interface KAIArticle {
//   id: string
//   title: string
//   summary: string
//   detail: string
//   videoURL: string
//   imageURL: string
//   contentUrl: string
//   modifiedBy: string
//   source: string
//   score: number
//   matchStatus: string
//   category: string
//   tags: string[]
//   createTime: number
//   modificationTime: number
//   status: string
//   intentMatchScore: number
//   matchType: string
//   answerBeforeLlmEnrichment: string
//   llmUsed: boolean
//   potentiallyHallucinatedStatements: []
// }

// export interface KAIResponse {
//   llmConfig: {
//     promptId: string
//     promptName: string
//     llmEnrichment: boolean
//     promptTemplate: string
//   }
//   numberOfAnswers: number
//   mode: string
//   confidenceLevel: string
//   status: string
//   consumerQuery: string
//   isPreview: boolean
//   kaiClient: string
//   success: boolean
//   errorCode: string
//   successResult: {
//     llmPrompt: string
//     success: {
//       id: string
//       title: string
//       summary: string
//       detail: string
//       videoURL: string
//       imageURL: string
//       contentUrl: string
//       modifiedBy: string
//       source: string
//       score: number
//       matchStatus: string
//       category: string
//       createTime: number
//       modificationTime: number
//       status: string
//       intentMatchScore: number
//       matchType: string
//       answerBeforeLlmEnrichment: string
//       llmUsed: boolean
//       potentiallyHallucinatedStatements: []
//     }[]
//   }
// }

// export interface KAISuccessResult {
//   error?: boolean
//   id: string
//   title: string
//   summary: string
//   detail: string
//   videoURL: string
//   contentUrl: string
//   imageURL: string
//   modifiedBy: string
//   source: string
//   score: number
//   matchStatus: string
//   category: string
//   createTime: number
//   modificationTime: number
//   status: string
//   intentMatchScore: number
//   matchType: string
//   answerBeforeLlmEnrichment: string
//   llmUsed: boolean
//   potentiallyHallucinatedStatements: []
// }

// export interface KAIArticlesResponse {
//   success: boolean
//   successResult: {
//     pagination: {
//       nextPage: number
//       page: number
//       totalSize: number
//       totalPages: number
//       size: number
//     }
//     success: {
//       articles: KAIArticle[]
//     }
//   }
// }

// Types moved to interfaces.conversation-builder.ts:
// - DebugLog
// - DebugLogRecords
// - DebugLogResponse
// - CBDebugRecords
// - ChatBot (now with full platform support)
