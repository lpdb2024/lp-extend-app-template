// import { KVPObject } from './interfaces'

import type { ConversationStatuses } from "src/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
// export interface kBLandingPageMetrics {
//   kbId: string;
//   organizationId: string;
//   numOfTotalArticles: number;
//   numOfActiveArticles: number;
//   numOfArticlesHaveIntents: number;
//   lastContentUpdatedTime: number;
//   connectedConvAssistSkills: any[];
//   modifiedTime: number;
//   createdTime: number;
// }

// export interface kbConfigProperties {
//   llmEnrichment: string;
// }

// export interface dataSourceConfiguration {
//   properties: any;
// }

// export interface KnowledgeDataSource {
//   createdByName: string;
//   modifiedByName: string;
//   id: string;
//   name: string;
//   type: string;
//   chatBotPlatformUserId: string;
//   status: string;
//   dataSourceConfiguration: dataSourceConfiguration;
//   organizationId: string;
//   privateAccess: boolean;
//   language: string;
//   langCode: string;
//   entitiesAvailable: boolean;
//   publicKB: boolean;
//   createdAt: number;
//   modifiedAt: number;
//   createdBy: string;
//   modifiedBy: string;
//   kbConfigProperties: kbConfigProperties;
//   kBLandingPageMetrics: kBLandingPageMetrics;
// }

// export interface KnowledgeDataSourceResponse {
//   success: boolean;
//   errorCode: string;
//   successResult: {
//     KnowledgeDataSource: KnowledgeDataSource[];
//   };
// }

// export interface KAISearchRequestConfig {
//   name?: string;
//   description?: string;
//   id?: string;
//   kbId: string;
//   siteId: string;
//   llmConfig: {
//     llmEnrichment: boolean
//     promptTemplateId?: string
//     // promptTemplate?: string
//     // promptId?: string
//     // promptName?: string
//   }
//   entitySource: string | null
//   numberOfAnswers: number
//   mode: string
//   confidenceLevel: string
//   status: string
//   consumerQuery?: string
//   isPreview: boolean
//   kaiClient: string
// }

// export interface LLMConfig {
//   promptId: string
//   promptName: string
//   llmEnrichment: boolean
//   promptTemplate: string
// }
// export interface KAISearchRequestConfigBasic {
//   id?: string
//   name: string | null
//   siteId: string | null
//   description: string | null
//   llmConfig: {
//     promptId: string
//     promptName: string
//     llmEnrichment: boolean
//     promptTemplate: string
//   } | null
// }

// export interface RequestTemplate {
//   llmConfig: {
//     promptId: string
//     promptName: string
//     llmEnrichment: boolean
//     promptTemplate: string
//   }
//   entitySource: string | null
//   numberOfAnswers: number
//   mode: string
//   confidenceLevel: string
//   status: string
//   consumerQuery: string
//   isPreview: boolean
//   kaiClient: string
// }

export interface ProcessAction {
  name: string;
  skillId?: string;
  agentId?: string;
  message?: string;
}

export interface PayloadFilters {
  skillIds: number[];
  status: ConversationStatuses[];
  latestConversationQueueState?: string | null;
  latestAgentIds?: number[];
  start: {
    from: string | null;
    to: string | null;
  };
}
export interface ProcessConversationsRequest {
  conversations: string[];
  action: ProcessAction;
}

export interface ConversationSurveys {
  conversationSurveys: any[];
}

export interface MessageStatus {
  messageId: string;
  seq: number;
  dialogId: string;
  time: string;
  timeL: number;
  participantId: string;
  participantType: string;
  messageDeliveryStatus: string;
}

export interface MessageScore {
  messageId: string;
  messageRawScore: number;
  mcs: number;
  time: string;
  timeL: number;
}

export interface Interaction {
  assignedAgentId: string;
  assignedAgentFullName: string;
  assignedAgentLoginName: string;
  assignedAgentNickname: string;
  interactionTimeL: number;
  interactionTime: string;
  interactiveSequence: number;
  dialogId: string;
}
export interface Transfer {
  timeL: number;
  time: string;
  assignedAgentId: string;
  targetSkillId: number;
  targetSkillName: string;
  reason: string;
  by: string;
  sourceSkillId: number;
  sourceSkillName: string;
  sourceAgentId: string;
  sourceAgentFullName: string;
  sourceAgentLoginName: string;
  sourceAgentNickname: string;
  dialogId: string;
}

export interface ConsumerParticipant {
  participantId: string;
  firstName: string;
  lastName: string;
  token: string;
  email: string;
  phone: string;
  avatarURL: string;
  time: string;
  timeL: number;
  joinTime: string;
  joinTimeL: number;
  consumerName: string;
  dialogId: string;
}

export interface AgentParticipant {
  agentFullName: string;
  agentNickname: string;
  agentLoginName: string;
  agentDeleted: boolean;
  agentId: string;
  agentPid: string;
  userType: string;
  userTypeName: string;
  role: string;
  agentGroupName: string;
  agentGroupId: number;
  time: string;
  timeL: number;
  permission: string;
  dialogId: string;
}

export interface personalInfo {
  serverTimeStamp: string;
  originalTimeStamp: number;
  personalInfo: {
    name: string;
    surname: string;
    language: string;
    contacts: string[];
  };
}
export interface customerInfo {
  serverTimeStamp: string;
  originalTimeStamp: number;
  customerInfo: {
    customerId: string;
    socialId: string;
    imei: string;
    userName: string;
    companyBranch: string;
  };
}
export type SDEType = "PERSONAL_INFO" | "CUSTOMER_INFO";

export interface SDEEvent {
  customerInfo?: {
    customerInfo: customerInfo;
  };
  personalInfo?: {
    personalInfo: personalInfo;
  };
  sdeType: SDEType;
  serverTimeStamp: string;
}
export interface SDE {
  events: SDEEvent[];
}

export interface Campaign {
  campaignEngagementName: string;
  campaignName: string;
  goalName: string;
}

export interface Info {
  startTime: string;
  startTimeL: number;
  endTime: string;
  endTimeL: number;
  duration: number;
  conversationId: string;
  brandId: string;
  latestAgentId: string;
  latestAgentNickname: string;
  latestAgentFullName: string;
  latestAgentLoginName: string;
  agentDeleted: boolean;
  latestSkillId: number;
  latestSkillName: string;
  source: string;
  mcs: number;
  alertedMCS: number;
  status: string;
  fullDialogStatus: string;
  firstConversation: boolean;
  device: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  latestAgentGroupId: number;
  latestAgentGroupName: string;
  latestQueueState: string;
  isPartial: boolean;
  visitorId: string;
  sessionId: string;
  interactionContextId: string;
  timeZone: string;
  features: string[];
  language: string;
  integration: string;
  integrationVersion: string;
  appId: string;
  ipAddress: string;
  latestHandlerAccountId: string;
  latestHandlerSkillId: number;
  firstIntentName: string;
  firstIntentLabel: string;
}

/*
 "quickReplies": {
        "content": "{\"type\":\"quickReplies\",\"itemsPerRow\":8,\"replies\":[{\"type\":\"button\",\"title\":\"1\",\"tooltip\":\"1\",\"click\":{\"actions\":[{\"type\":\"publishText\",\"text\":\"1\"}]}},{\"type\":\"button\",\"title\":\"qr 2\",\"tooltip\":\"qr 2\",\"click\":{\"actions\":[{\"type\":\"publishText\",\"text\":\"qr 2\"}]}}]}"
      }
*/

export interface IAction {
  type: string;
  text?: string;
  target?: string;
  uri?: string;
}

interface QuickReply {
  type: string;
  title: string;
  tooltip: string;
  click: {
    actions: IAction[];
  };
}
export interface QuickReplies {
  type: string;
  itemsPerRow: number;
  replies: QuickReply[];
}

export interface MessageRecord {
  type: string;
  messageData: {
    msg: {
      text: string;
    };
    quickReplies?: QuickReply[];
  };
  messageId: string;
  audience: string;
  seq: number;
  dialogId: string;
  participantId: string;
  source: string;
  time: string;
  timeL: number;
  integrationSource: string;
  sentBy: string;
  contextData: {
    rawMetadata: string;

    structuredMetadata: any[];
  };
  predefinedContent: boolean;
}

export interface ConversationHistoryRecords {
  info: Info;
  campaign: Campaign;
  messageRecords: MessageRecord[];
  agentParticipants: AgentParticipant[];
  agentParticipantsActive: AgentParticipant[];
  consumerParticipants: ConsumerParticipant[];
  transfers: Transfer[];
  interactions: Interaction[];
  messageScores: MessageScore[];
  messageStatuses: MessageStatus[];
  conversationSurveys: ConversationSurveys;
  sdes: SDE;
}

export interface ConversationHistoryResponse {
  _metadata: {
    count: number;
    self: {
      rel: string;
      href: string;
    };
    shardsStatusResult: {
      partialResult: boolean;
    };
  };
  conversationHistoryRecords: ConversationHistoryRecords[];
}

export interface DefaultPrompt {
  id: string;
  name: string;
  clientType: string;
  description: string;
  langCode: string;
  promptHeader: string;
  isDefault: boolean;
  createdBy: string;
  creationTime: number;
}

export interface DefaultPromptSuccessResult {
  prompt: DefaultPrompt;
}

export interface DefaultPromptResponse {
  success: boolean;
  statusCode: number;
  successResult: DefaultPromptSuccessResult;
}

export interface ServiceWorkerBase {
  accountId: string;
  loginName: string;
  user_id: string;
  appName: string;
  keyId: string;
  appSecret: string;
  token: string;
  tokenSecret: string;
}

export interface ServiceWorkerData {
  user_id: string;
  account_id: string;
  app_key: string;
  userEnabled?: boolean;
  apiKeyEnabled?: boolean;
  id?: string;
  appName?: string;
  agentName?: string;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
}

interface SkillRoutingOutcome {
  type: string;
  skillId: number;
}

export interface SkillRoutingCondition {
  type: string;
  data: {
    include: Array<{
      type: string;
      data: {
        type: string;
        value?: string;
      };
    }>;
  };
  sdeType: string;
  field: string;
}

export interface SkillRoutingRule {
  orderId: number;
  description: string;
  conditions: SkillRoutingCondition[];
  outcomes: SkillRoutingOutcome[];
}
