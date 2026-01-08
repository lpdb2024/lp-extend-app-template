export interface KVPObject {
  [key: string]: string | number | boolean | null | undefined
}

export interface ICredentials {
  account_id: string;
  [key: string]: any
}

export interface KVPObjectString {
  [key: string]: string
}

export interface IUser {
  favorite_models: string[];
  is_cc_user: boolean;
  account_ids: string[];
  is_lpa: boolean;
  created_at: number;
  display_name: string;
  created_by: string;
  uid: string;
  consumer_jwt: null;
  updated_by: string;
  assigned_models: string[];
  photo_url: string;
  email: string;
  terms_agreed: boolean;
  account_id: string;
  updated_at: number;
  permissions: string[];
  roles: string[];
}

interface Participant {
  id: string;
  role: string;
}

interface ParticipantDetails extends Participant {
  state: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  agentPhoto?: string;
  agentType?: string;
}

interface MetaData {
  sessionState: string;
  dialogId: string;
  mode: string;
  notificationKey: string;
}

interface Dialog {
  dialogId: string;
  participants: string[];
  participantsDetails: Participant[];
  dialogType: string;
  channelType: string;
  metaData: MetaData;
  state: string;
  creationTs: number;
  endTs?: number;
  metaDataLastUpdateTs?: number;
  closedBy?: string;
  closedCause?: string;
}

interface TTR {
  ttrType: string;
  value: number;
}
interface ConversationHandlerDetails {
  accountId: string;
  skillId: string;
}
interface ConversationDetails {
  skillId: string;
  participants: Participant[];
  dialogs: Dialog[];
  brandId: string;
  state: string;
  stage: string;
  closeReason: string;
  startTs: number;
  endTs: number;
  metaDataLastUpdateTs: number;
  ttr: TTR;
  conversationHandlerDetails: ConversationHandlerDetails;
}
interface Result {
  convId: string;
  effectiveTTR: number;
  conversationDetails: ConversationDetails;
}
interface Change {
  type: string;
  result: Result;
}
interface Body {
  sentTs: number;
  changes: Change[];
}
export interface ExChangeEvent {
  kind: string;
  body: {
    sentTs: number;
    changes: Change[];
  };
  type: string;
}

export interface GoogleImageSearchResult {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    mime: string;
    fileFormat: string;
    image: {
      contextLink: string;
      height: number;
      width: number;
      byteSize: number;
      thumbnailLink: string;
      thumbnailHeight: number;
      thumbnailWidth: number;
    }
  }
