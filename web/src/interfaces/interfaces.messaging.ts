import type { CSSProperties } from "vue";
import type {
  STAGES,
  CONVERSATION_STATES,
  CONTENT_TYPES,
} from "src/constants/constants.messaging";
import type {
  ICampaign,
  ICampaignEngagement,
  ICampaignInfo,
} from "./interfaces.campaigns";

export interface SignupTokenResponse {
  consumer_token: string;
  ext_consumer_id: string;
  lp_consumer_id: string;
}

export interface UnauthTokenResponse {
  token: string;
}

export interface IAuth {
  access_token: string | null;
  token_type: string | null;
  refresh_token: string | null;
  id_token: string | null;
  expires_in: number | null;
  decoded: object | null;
  expiresIn: number | null;
}

export interface IAction {
  type: string;
  text?: string;
  target?: string;
  uri?: string;
}

export interface ICBAuth {
  chatBotPlatformUser: object | null;
  apiAccessToken: string | null;
  apiAccessPermToken: string | null;
  config: object | null;
  sessionOrganizationId: string | null;
  leAccountId: string | null;
  cbRegion: string | null;
  enabledFeatures: string[] | null;
  siteSettings: string[] | null;
  leUserId: string | null;
  privileges: number[] | null;
  isElevatedLpa: boolean | null;
}

export interface Domain {
  service: string;
  account: string;
  baseURI: string;
}

export interface ccHeaders {
  authorization: string;
  organizationid: string | null;
  apiAccessToken: string | null;
  domain: string;
  [key: string]: string | null;
}

interface LinearGradientCoords<T> {
  x0: T;
  y0: T;
  x1: T;
  y1: T;
  x2?: T;
  y2?: T;
}

export interface ColorStop {
  color: string;
  position: number;
}

export interface Gradient {
  type: string;
  direction: number | string;
  stops: { color: string; position: number }[];
  colorStops?: ColorStop[];
  coords?: Partial<LinearGradientCoords<number>>;
  radialPosition?: string;
  radialShape?: string;
  radialExtent?: string;
  radialSize?: string;
}

export interface ColorConfig {
  useCustom: boolean;
  color: string;
  custom: string;
  gradient?: Gradient;
}
export interface WindowConfig {
  width: number;
  height: number;
  top: number;
  bottom: number;
  useShadow: boolean;
  boxShadow: {
    h: number;
    v: number;
    blur: number;
    spread: number;
    color: string;
  };
  borderRadius: number[];
}
export interface TopConfig {
  bg: ColorConfig;
  text: ColorConfig;
  bannerText: string;
  avatar: string | null;
}
export interface BannerConfig {
  imageUrl: string;
  bgColor: ColorConfig;
  height: number;
  padding: number[];
}
interface AgentMessagesConfig {
  bgColor: ColorConfig;
  textColor: ColorConfig;
  avatar: string | null;
}

interface CustomerMessagesConfig {
  bgColor: ColorConfig;
  textColor: ColorConfig;
}

export interface BodyConfig {
  bgColor: ColorConfig;
  textColor: ColorConfig;
  agentMessages: AgentMessagesConfig;
  customerMessages: CustomerMessagesConfig;
}

interface CardsConfig {
  buttonType: string;
  padding: number;
  borderRadius: number;
  bgColor: ColorConfig;
  textColor: ColorConfig;
  buttonBgColor: ColorConfig;
  buttonTextColor: ColorConfig;
}

interface ButtonsConfig {
  buttonType: string;
  bgColor: ColorConfig;
  textColor: ColorConfig;
}

export interface ContentConfig {
  cards: CardsConfig;
  buttons: ButtonsConfig;
}

export interface BottomConfig {
  bgColor: ColorConfig;
  textColor: ColorConfig;
}

export interface MobileAppConfig {
  icon: string;
  pages: string[];
}

export interface KnowledgeAIConfig {
  useKAI: boolean;
  KAIID: string | null;
}

export interface BoxShadow {
  h: number;
  v: number;
  blur: number;
  spread: number;
  color: string;
}
export type TypeBoxShadow = "h" | "v" | "blur" | "spread" | "color";

export interface EngagementConfig {
  useIcon: boolean;
  label: string;
  mobileButtonType: string;
  desktopButtonType: string;
  width: number;
  useWidth: boolean;
  useBackLayer: boolean;
  borderWidth: number;
  useBoxShadow: boolean;
  boxShadow: BoxShadow;
  background: ColorConfig;
  backLayer: ColorConfig;
  textColor: ColorConfig;
}

export interface MessagingWindowConfig {
  name: string;
  accountId: string;
  id?: string;
  welcomeText: string;
  backgroundColor: ColorConfig;
  window: WindowConfig;
  bodyBgColor: ColorConfig;
  systemTextColor: ColorConfig;
  top: TopConfig;
  banner: BannerConfig;
  body: BodyConfig;
  content: ContentConfig;
  bottom: BottomConfig;
  mobileApp: MobileAppConfig;
  knowledegeAI: KnowledgeAIConfig;
  faqs: string[];
  update: {
    label: string;
    image: string;
  };
  engagement: EngagementConfig;
  cssProperties: CSSProperties;
}

export interface Isession {
  sessionId: string | null;
  visitorId: string | null;
}

export interface ISlideOut {
  target: string;
  type: string;
  uri: string;
  invitationId?: string;
}

export interface NewConversationRequest {
  kind: string;
  id: string;
  type: string;
  body: {
    skillId: string;
    channelType: string;
    ttrDefName: null;
    conversationContext: {
      visitorId: string;
      sessionId: string;
      interactionContextId: string;
      type: string;
      lang: string;
    };
    campaignInfo?: {
      campaignId: string;
      engagementId: string;
    };
  };
}

export interface Participant {
  id: string;
  role: string;
}
export interface ParticipantDetails extends Participant {
  state: string;
  agentId?: string;
}

export interface CobrowseMetadata {
  serviceId: string;
  expires: number;
  sessionState: string;
  dialogId: string;
  mode: string;
  notificationKey: string;
  callLink: string;
}

export interface Dialog {
  metaData?: CobrowseMetadata;
  dialogId: string;
  participantsDetails: ParticipantDetails[];
  dialogType: string;
  channelType: string;
  state: string;
  creationTs: number;
  metaDataLastUpdateTs: number;
}
export interface ConversationDetails {
  skillId: string;
  participants: Participant[];
  dialogs: Dialog[];
  brandId: string;
  state: CONVERSATION_STATES;
  stage: STAGES;
  startTs: number;
  metaDataLastUpdateTs: number;
  ttr: {
    ttrType: string;
    value: number;
  };
  conversationHandlerDetails: {
    accountId: string;
    skillId: string;
  };
}
export interface Result {
  convId: string;
  effectiveTTR: number;
  conversationDetails: ConversationDetails;
}
export interface Change {
  type: string;
  result: Result;
}
export interface NotificationBody {
  subscriptionId: string;
  sentTs: number;
  changes: Change[];
}
export interface ChangeNotification {
  kind: string;
  body: NotificationBody;
  type: string;
}

export interface MetaDataItem {
  type: string;
  botMsgId: string;
  botInteractionId: string;
  botId: string;
  botProvider: string;
  botProviderType: string;
  botType: string;
  matchType: string;
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

export interface SecureFormMessage {
  formId: string;
  invitationId: string;
  title: string;
  submissionId?: string;
}
export interface FileUploadMessage {
  caption: string;
  relativePath: string;
  fileType: string;
  preview: string;
}

export interface ContentEvent {
  type: string;
  message: string | SecureFormMessage | FileUploadMessage;
  contentType: CONTENT_TYPES;
  quickReplies?: QuickReplies;
  submissionId?: string;
  invitationId?: string;
  conversationId?: string;
}
export interface AcceptStatusEvent {
  type: string;
  status: string;
  sequenceList: number[];
}

export interface MessagingEvent {
  sequence: number;
  originatorId: string;
  originatorMetadata: Participant;
  serverTimestamp: number;
  event: ContentEvent | AcceptStatusEvent;
  dialogId: string;
  metadata?: MetaDataItem[];
  messageAudience: string;
}

export interface MessagingEventNotification {
  kind: string;
  body: {
    subscriptionId: string;
    sentTs: number;
    changes: MessagingEvent[];
  };
  type: string;
}

export interface ClientMessage {
  conversationId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  metadata?: MetaDataItem[];
  invitationId?: string;
  uid: string;
  serverTimestamp: number;
  timeLocal: number;
  originatorId: string;
  dialogId: string;
  isAgent: boolean;
  agentId: string;
  status: string;
  message: string;
  sequence: number;
  from: string;
  role: string;
  type: string;
  quickReplies: QuickReply[];
  isReplies: boolean;
  url?: string;
  isSecureForm?: boolean;
  submitted?: boolean;
  expired?: boolean;
  caption?: string;
  relativePath?: string;
  fileType?: string;
  preview?: string;
  title?: string;
  text?: string;
}

export interface ConversationParticipants {
  READER?: Participant;
  ASSIGNED_AGENT?: Participant;
  MANAGER?: Participant;
  CONTROLLER?: Participant;
  CONSUMER?: Participant;
}
/*
const participants = { READER: { id: '27fc5936-9ba8-52f9-a562-806baa8d14f8', role: 'READER' }, ASSIGNED_AGENT: { id: '2a4765f2-4cbf-5a36-85c7-e2dc8a4894fb', role: 'ASSIGNED_AGENT' }, MANAGER: { id: 'a1588d60-6ab1-5dc1-ab61-1086b48be681', role: 'MANAGER' }, CONTROLLER: { id: '7d68fb8f-547c-548f-bc5d-2ff0df08651f', role: 'CONTROLLER' }, CONSUMER: { id: '24b9a23cd7cf083b475a4a561f60b4f6f5fc4e210b4510c8769151f31c25b9d4', role: 'CONSUMER' } }
*/

export interface CTConfig {
  delay: number;
  scripting: string[];
  scriptTimer: number;
  slide: {
    channel: string;
    skill: {
      id: number;
      name: string;
    };
    starters: string[];
  };
  campaign: ICampaign | null;
  campaignInfo: ICampaignInfo | null;
  engagement: ICampaignEngagement | null;
  voiceId?: string | null;
}

export interface Date {
  year: number;
  month: number;
  day: number;
}

export interface CartUpdateSDE {
  type: string;
  total: number;
  currency: string;
  numItems: number;
  products: {
    product: {
      name: string;
      category: string;
      sku: string;
      price: number;
    };
    quantity: number;
  }[];
}

export interface transactionSDE {
  type: string;
  total: number;
  currency: string;
  orderId: string;
  cart: {
    products: {
      product: {
        name: string;
        category: string;
        sku: string;
        price: number;
      };
      quantity: number;
    }[];
  };
}

export interface ViewedProductSDE {
  type: string;
  currency: string;
  products: {
    product: {
      name: string;
      category: string;
      sku: string;
      price: number;
    };
  }[];
}

export interface LeadSDE {
  type: string;
  lead: {
    topic: string;
    value: number;
    currency: string;
    leadId: string;
  };
}

export interface ServiceActivitySDE {
  type: string;
  service: {
    topic: string;
    status: number;
    category: string;
    serviceId: string;
  };
}

export interface VisitorErrorSDE {
  type: string;
  error: {
    message: string;
    code: string;
  };
}

export interface SearchedContentSDE {
  type: string;
  keywords: string[];
}

export interface CustomerInfoSDE {
  type: string;
  info: {
    cstatus?: string;
    ctype?: string;
    customerId?: string;
    balance?: number;
    currency?: string;
    socialId?: string;
    imei?: string;
    userName?: string;
    companySize?: number;
    companyBranch?: string;
    accountName?: string;
    role?: string;
    lastPaymentDate?: Date;
    registrationDate?: Date;
    storeNumber?: string;
    storeZipCode?: string;
  };
}

export interface PersonalInfoSDE {
  type: string;
  personal: {
    firstname: string;
    lastname: string;
    age: {
      age: number;
      year: number;
      month: number;
      day: number;
    };
    contacts: {
      email: string;
      phone: string;
      preferred: string;
      address: {
        zipcode: string;
      };
    }[];
    gender: string;
    language: string;
    company: string;
  };
}

export interface MarketingSourceSDE {
  type: string;
  info: {
    channel: string;
    affiliate: string;
    campaignId: string;
  };
}
