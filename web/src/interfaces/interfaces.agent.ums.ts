interface participantsDetail {
  id: string;
  role: string;
  state: string;
}
interface dialog {
  dialogId: string;
  participantsDetails: participantsDetail[];
  dialogType: string;
  channelType: string;
  metaData: {
    appInstallId: string;
  };
  state: string;
  creationTs: number;
  endTs: number;
  metaDataLastUpdateTs: number;
  closedBy: string;
}
interface conversationDetails {
  convId: string;
  skillId: string;
  participants: {
    CONSUMER: string[];
    MANAGER: string[];
    CONTROLLER: string[];
    READER: string[];
  };
  participantsPId: {
    CONSUMER: string[];
    MANAGER: string[];
    CONTROLLER: string[];
    READER: string[];
  };
  dialogs: dialog[];
  brandId: string;
  state: string;
  stage: string;
  closeReason: string;
  startTs: number;
  endTs: number;
  metaDataLastUpdateTs: number;
  firstConversation: boolean;
  csatRate: number;
  ttr: { ttrType: string; value: number };
  delay: { type: string; tillWhen: number };
  note: string;
  context: {
    type: string;
    lang: string;
    clientProperties: {
      type: string;
      appId: string;
      ipAddress: string;
      deviceFamily: string;
      os: string;
      osVersion: string;
      integrationVersion?: string; // optional property
      browser?: string; // optional property
      browserVersion?: string; // optional property
      timeZone?: string; // optional property
      features?: string[]; // optional property
    };
    interactionContextId?: string; // optional property
  };
  conversationHandlerDetails?: {
    accountId?: string; // optional property
    skillId?: string; // optional property
  };
}
interface lastContentEventNotification {
  sequence: number;
  originatorClientProperties: {
    type: string;
    ipAddress: string;
  };
  originatorId: string;
  originatorPId: string;
  originatorMetadata: {
    id: string;
    role: string;
    clientProperties: {
      type: string;
      ipAddress: string;
    };
  };
  serverTimestamp: number;
  event: {
    type: string;
    message: string;
    contentType: string;
  };
  dialogId: string;
}
interface numberOfUnreadMessages {
  [key: string]: number;
}

interface result {
  convId: string;
  effectiveTTR: number;
  conversationDetails: conversationDetails;
  lastContentEventNotification: lastContentEventNotification;
  numberOfunreadMessages: numberOfUnreadMessages;
  lastUpdateTime: number;
}
export interface ExConversationChange {
  type: string;
  result: result;
}
export interface ExConversationChangeNotificationBody {
  subscriptionId: string;
  sentTs: number;
  changes: ExConversationChange[];
}
export interface ExConversationChangeNotification {
  kind: string;
  body: ExConversationChangeNotificationBody;
  type: string;
}

export interface BrandProfile {
  brandId: string;
  name: string;
  description: string;
  category: string;
  dateJoined: number;
  lastUpdated: number;
  logoImg: string;
  backgroundImg: string;
  SkillIds: string[];
  defaultTTRs: {
    CUSTOM: number;
    NORMAL: number;
    PRIORITIZED: number;
    URGENT: number;
  };
  delay: {
    tillWhen: number;
  };
  websiteUrl: string;
}

export interface AgentUMSMessage {
  sequence: number;
  originatorClientProperties: {
    type: string;
    ipAddress: string;
    integrationVersion: string;
  };
  originatorId: string;
  originatorPId: string;
  originatorMetadata: {
    id: string;
    role: string;
    clientProperties: {
      type: string;
      ipAddress: string;
      integrationVersion: string;
    };
  };
  serverTimestamp: number;
  event: {
    type: string;
    message: string;
    contentType: string;
  };
  dialogId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any[];
  messageAudience: string;
}

export interface AgentStats {
  active: number;
  pending: number;
  unassigned: number;
  overdue: number;
  soonToOverdue: number;
}
