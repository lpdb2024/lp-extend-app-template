/**
 * Messaging Interactions (History) API Interfaces
 * TypeScript interfaces for LivePerson Messaging History API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity, ILPMetadata } from '../../shared/lp-common.interfaces';

/**
 * Conversation status types
 */
export enum ConversationStatus {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  OVERDUE = 'OVERDUE',
}

/**
 * Message source types
 */
export enum MessageSource {
  APP = 'APP',
  SHARK = 'SHARK',
  WEB_HISTORY = 'WEB_HISTORY',
  SMS = 'SMS',
  FACEBOOK = 'FACEBOOK',
  WHATSAPP = 'WHATSAPP',
  APPLE_BUSINESS_CHAT = 'APPLE_BUSINESS_CHAT',
  GOOGLE_RCS = 'GOOGLE_RCS',
  LINE = 'LINE',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  CONNECTOR_API = 'CONNECTOR_API',
}

/**
 * Device types
 */
export enum DeviceType {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  MOBILE = 'MOBILE',
  NA = 'NA',
}

/**
 * Message sent by types
 */
export enum MessageSentBy {
  CONSUMER = 'Consumer',
  AGENT = 'Agent',
  SYSTEM = 'System',
}

/**
 * Participant role types
 */
export enum ParticipantRole {
  CONSUMER = 'CONSUMER',
  ASSIGNED_AGENT = 'ASSIGNED_AGENT',
  MANAGER = 'MANAGER',
  READER = 'READER',
}

/**
 * Content types that can be retrieved
 */
export type ContentToRetrieve =
  | 'campaign'
  | 'messageRecords'
  | 'agentParticipants'
  | 'agentParticipantsLeave'
  | 'agentParticipantsActive'
  | 'consumerParticipants'
  | 'transfers'
  | 'interactions'
  | 'messageScores'
  | 'messageStatuses'
  | 'conversationSurveys'
  | 'coBrowseSessions'
  | 'summary'
  | 'sdes'
  | 'unAuthSdes'
  | 'monitoring'
  | 'dialogs'
  | 'responseTime'
  | 'skillChanges'
  | 'intents'
  | 'uniqueIntents'
  | 'latestAgentSurvey'
  | 'previouslySubmittedAgentSurveys';

/**
 * Time range filter
 */
export interface ITimeRange {
  from: number;
  to: number;
}

/**
 * Numeric range filter
 */
export interface INumericRange {
  from?: number;
  to?: number;
}

/**
 * SDE search criteria
 */
export interface ISDESearch {
  sdeType: string;
  path?: string;
  value?: string | number;
}

/**
 * Conversation search request
 */
export interface IConversationSearchRequest {
  start: ITimeRange;
  end?: ITimeRange;
  status?: ConversationStatus[];
  skillIds?: number[];
  latestSkillIds?: number[];
  agentIds?: string[];
  latestAgentIds?: string[];
  agentGroupIds?: number[];
  keyword?: string;
  summary?: string;
  duration?: INumericRange;
  csat?: INumericRange;
  mcs?: INumericRange;
  alertedMcsValues?: number[];
  source?: MessageSource[];
  device?: DeviceType[];
  sdeSearch?: ISDESearch;
  contentToRetrieve?: ContentToRetrieve[];
  latestUpdateTime?: number;
  nps?: INumericRange;
  questionBrick?: string;
  invalidFreeTextAnswer?: string;
  surveyBotConversations?: boolean;
  surveyIds?: number[];
  fcr?: string;
  responseTime?: INumericRange;
  questionId?: string;
  answerText?: string;
  conversationUrn?: string;
}

/**
 * Get conversation by ID request
 */
export interface IGetConversationByIdRequest {
  conversationId?: string;
  conversationIds?: string[];
  contentToRetrieve?: ContentToRetrieve[];
}

/**
 * Get conversations by consumer ID request
 */
export interface IGetConversationsByConsumerRequest {
  consumer: string;
  status: ConversationStatus[];
  contentToRetrieve?: ContentToRetrieve[];
}

/**
 * Query parameters for conversation search
 */
export interface IConversationSearchQuery {
  offset?: number;
  limit?: number;
  sort?: string;
  v?: number;
  source?: string;
  rollover?: boolean;
}

/**
 * Conversation info object
 */
export interface IConversationInfo {
  conversationId: string;
  brandId: string;
  status: ConversationStatus;
  startTime: string;
  startTimeL: number;
  endTime?: string;
  endTimeL?: number;
  duration: number;
  closeReason?: string;
  closeReasonDescription?: string;
  firstConversation: boolean;
  csat?: number;
  csatRate?: number;
  mcs?: number;
  alertedMCS?: number;
  source?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  latestSkillId?: number;
  latestSkillName?: string;
  latestAgentId?: string;
  latestAgentLoginName?: string;
  latestAgentNickname?: string;
  latestAgentFullName?: string;
  latestAgentGroupId?: number;
  latestAgentGroupName?: string;
  agentDeleted?: boolean;
  latestQueueState?: string;
  isPartial?: boolean;
  sessionId?: string;
  interactionContextId?: string;
  timeZone?: string;
  features?: string[];
  language?: string;
  integration?: string;
  integrationVersion?: string;
  appId?: string;
  ipAddress?: string;
  isInteractive?: boolean;
  campaignId?: number;
  engagementId?: number;
  conversationType?: string;
  visitorId?: string;
  csds?: { uri: string }[];
}

/**
 * Campaign info
 */
export interface ICampaignInfo {
  campaignId: number;
  campaignName?: string;
  campaignEngagementId?: number;
  campaignEngagementName?: string;
  goalId?: number;
  goalName?: string;
  visitorBehaviorId?: number;
  visitorBehaviorName?: string;
  lobId?: number;
  lobName?: string;
  locationId?: number;
  locationName?: string;
  profileSystemDefault?: boolean;
  profileId?: number;
  profileName?: string;
}

/**
 * Message record
 */
export interface IMessageRecord {
  type: string;
  messageData?: IMessageData;
  messageId: string;
  seq: number;
  dialogId?: string;
  participantId: string;
  sentBy: string;
  relativeAgentId?: string;
  source: string;
  time: string;
  timeL: number;
  device?: string;
  contextData?: IContextData;
}

/**
 * Message data
 */
export interface IMessageData {
  msg?: IMessageContent;
  file?: IFileData;
  richContent?: IRichContent;
  quickReplies?: IQuickReplies;
}

/**
 * Message content
 */
export interface IMessageContent {
  text: string;
}

/**
 * File data in messages
 */
export interface IFileData {
  relativePath?: string;
  fileType?: string;
  caption?: string;
}

/**
 * Rich content (structured content)
 */
export interface IRichContent {
  type: string;
  elements?: unknown[];
}

/**
 * Quick replies
 */
export interface IQuickReplies {
  type: string;
  itemsPerRow?: number;
  replies: IQuickReply[];
}

/**
 * Quick reply item
 */
export interface IQuickReply {
  type: string;
  tooltip?: string;
  title: string;
  click?: {
    actions?: unknown[];
    metadata?: unknown[];
  };
}

/**
 * Context data for messages
 */
export interface IContextData {
  rawMetadata?: string;
  structuredMetadata?: unknown[];
}

/**
 * Agent participant
 */
export interface IAgentParticipant {
  agentId: string;
  agentLoginName?: string;
  agentNickname?: string;
  agentFullName?: string;
  agentGroupId?: number;
  agentGroupName?: string;
  permission?: string;
  role: string;
  agentPid?: string;
  userType?: string;
  userTypeName?: string;
  time: string;
  timeL: number;
  dialogId?: string;
  agentDeleted?: boolean;
}

/**
 * Consumer participant
 */
export interface IConsumerParticipant {
  participantId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  avatarURL?: string;
  time: string;
  timeL: number;
  consumerName?: string;
  dialogId?: string;
}

/**
 * Transfer record
 */
export interface ITransferRecord {
  time: string;
  timeL: number;
  assignedAgentId?: string;
  targetSkillId?: number;
  targetSkillName?: string;
  sourceSkillId?: number;
  sourceSkillName?: string;
  sourceAgentId?: string;
  sourceAgentFullName?: string;
  sourceAgentLoginName?: string;
  sourceAgentNickname?: string;
  reason?: string;
  by?: string;
  contextData?: IContextData;
  dialogId?: string;
}

/**
 * Interaction record
 */
export interface IInteractionRecord {
  assignedAgentId: string;
  assignedAgentFullName?: string;
  assignedAgentLoginName?: string;
  assignedAgentNickname?: string;
  interactionTime: string;
  interactionTimeL: number;
  interactiveSequence?: number;
  dialogId?: string;
}

/**
 * Message score
 */
export interface IMessageScore {
  messageId: string;
  messageRawScore?: number;
  mcs?: number;
  time: string;
  timeL: number;
}

/**
 * Message status
 */
export interface IMessageStatus {
  messageId: string;
  seq: number;
  time: string;
  timeL: number;
  participantId?: string;
  participantType?: string;
  messageDeliveryStatus?: string;
}

/**
 * Survey record
 */
export interface ISurveyRecord {
  surveyType?: string;
  surveyStatus?: string;
  surveyData?: ISurveyData[];
}

/**
 * Survey data
 */
export interface ISurveyData {
  question?: string;
  answer?: string;
  questionId?: string;
}

/**
 * CoBrowse session
 */
export interface ICoBrowseSession {
  sessionId: string;
  startTime: string;
  startTimeL: number;
  endTime?: string;
  endTimeL?: number;
  interactiveTime?: string;
  interactiveTimeL?: number;
  isInteractive: boolean;
  duration: number;
  type: string;
  agentId: string;
  capabilities?: string[];
}

/**
 * SDE (Structured Data Entity)
 */
export interface ISDE {
  sdeType: string;
  serverTimeStamp: string;
  events?: ISDEEvent[];
  customerInfo?: ICustomerInfo;
  personalInfo?: IPersonalInfo;
  marketingCampaignInfo?: IMarketingCampaignInfo;
  cartStatus?: ICartStatus;
  purchase?: IPurchase;
  viewedProduct?: IViewedProduct[];
  lead?: ILead;
  serviceActivity?: IServiceActivity;
  visitorError?: IVisitorError;
}

/**
 * SDE event
 */
export interface ISDEEvent {
  sdeType: string;
  serverTimeStamp: string;
}

/**
 * Customer info SDE
 */
export interface ICustomerInfo {
  customerId?: string;
  status?: string;
  type?: string;
  balance?: number;
  socialId?: string;
  imei?: string;
  userName?: string;
  accountName?: string;
  role?: string;
  companyBranch?: string;
  companySize?: string;
  lastPaymentDate?: ISDEDate;
  registrationDate?: ISDEDate;
  storeZipCode?: string;
  storeNumber?: string;
  ctype?: string;
}

/**
 * Personal info SDE
 */
export interface IPersonalInfo {
  name?: string;
  surname?: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  gender?: string;
  age?: ISDEAge;
  contacts?: ISDEContact[];
  language?: string;
}

/**
 * SDE Date
 */
export interface ISDEDate {
  year: number;
  month: number;
  day: number;
}

/**
 * SDE Age
 */
export interface ISDEAge {
  age?: number;
  year?: number;
  month?: number;
  day?: number;
}

/**
 * SDE Contact
 */
export interface ISDEContact {
  email?: string;
  phone?: string;
  phoneType?: string;
  address?: ISDEAddress;
  preferredContactMethod?: string;
}

/**
 * SDE Address
 */
export interface ISDEAddress {
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  zipcode?: string;
}

/**
 * Marketing campaign info SDE
 */
export interface IMarketingCampaignInfo {
  originatingChannel?: number;
  affiliate?: string;
  campaignId?: string;
}

/**
 * Cart status SDE
 */
export interface ICartStatus {
  total?: number;
  currency?: string;
  numItems?: number;
  products?: IProduct[];
}

/**
 * Product in cart
 */
export interface IProduct {
  name?: string;
  category?: string;
  sku?: string;
  price?: number;
  quantity?: number;
}

/**
 * Purchase SDE
 */
export interface IPurchase {
  total?: number;
  currency?: string;
  orderId?: string;
  cart?: ICartStatus;
}

/**
 * Viewed product SDE
 */
export interface IViewedProduct {
  name?: string;
  category?: string;
  sku?: string;
  price?: number;
  currency?: string;
}

/**
 * Lead SDE
 */
export interface ILead {
  topic?: string;
  value?: number;
  currency?: string;
  leadId?: string;
}

/**
 * Service activity SDE
 */
export interface IServiceActivity {
  topic?: string;
  status?: number;
  category?: string;
  serviceId?: string;
}

/**
 * Visitor error SDE
 */
export interface IVisitorError {
  contextId?: string;
  message?: string;
  code?: string;
  level?: number;
  resolved?: boolean;
}

/**
 * Dialog record
 */
export interface IDialogRecord {
  dialogId: string;
  status: string;
  dialogType?: string;
  dialogChannelType?: string;
  startTime: string;
  startTimeL: number;
  endTime?: string;
  endTimeL?: number;
  closeReason?: string;
  closeReasonDescription?: string;
  skillId?: number;
  skillName?: string;
  metaData?: IDialogMetaData;
}

/**
 * Dialog metadata
 */
export interface IDialogMetaData {
  appInstallId?: string;
  channel?: string;
  deviceModel?: string;
  deviceOs?: string;
  externalConversationId?: string;
}

/**
 * Intent record
 */
export interface IIntentRecord {
  id?: string;
  name: string;
  confidence: number;
  confidenceFormatted?: string;
  messageId?: string;
  time?: string;
  timeL?: number;
}

/**
 * Response time record
 */
export interface IResponseTimeRecord {
  latestEffectiveResponseTime?: number;
  configuredResponseTime?: number;
}

/**
 * Skill change record
 */
export interface ISkillChangeRecord {
  time: string;
  timeL: number;
  previousSkillId?: number;
  previousSkillName?: string;
  currentSkillId?: number;
  currentSkillName?: string;
  reason?: string;
}

/**
 * Summary record
 */
export interface ISummaryRecord {
  text?: string;
  lastUpdatedTime?: number;
}

/**
 * Monitoring record with geo and device info
 */
export interface IMonitoringRecord {
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
  isp?: string;
  org?: string;
  device?: string;
  ipAddress?: string;
  browser?: string;
  operatingSystem?: string;
  language?: string;
  timezone?: string;
  conversationStartPage?: string;
  conversationStartPageTitle?: string;
}

/**
 * Full conversation record
 */
export interface IConversation {
  info: IConversationInfo;
  campaign?: ICampaignInfo;
  messageRecords?: IMessageRecord[];
  agentParticipants?: IAgentParticipant[];
  consumerParticipants?: IConsumerParticipant[];
  transfers?: ITransferRecord[];
  interactions?: IInteractionRecord[];
  messageScores?: IMessageScore[];
  messageStatuses?: IMessageStatus[];
  conversationSurveys?: ISurveyRecord[];
  coBrowseSessions?: ICoBrowseSession[];
  sdes?: ISDE[];
  unAuthSdes?: ISDE[];
  dialogs?: IDialogRecord[];
  intents?: IIntentRecord[];
  uniqueIntents?: IIntentRecord[];
  responseTime?: IResponseTimeRecord;
  skillChanges?: ISkillChangeRecord[];
  summary?: ISummaryRecord;
  monitoring?: IMonitoringRecord;
}

/**
 * Conversation search response
 */
export interface IConversationSearchResponse {
  _metadata: ILPMetadata;
  conversationHistoryRecords: IConversation[];
}

/**
 * Single conversation response
 */
export interface IConversationResponse {
  conversationHistoryRecords: IConversation[];
}
