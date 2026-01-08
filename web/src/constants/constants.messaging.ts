export enum CONNECTOR_TYPES {
  UNAUTHENTICATED = "unauth implicit",
  AUTHENTICATED = "demobuilder",
}

export enum UMS_TYPES {
  UPLOAD_TOKEN = "ms.UploadToken",
  UPLOAD_TOKEN_RESONSE = "ms.UploadTokenResponse",
  CONVERSATION_CHANGE_NOTIFICATION = "cqm.ExConversationChangeNotification",
  MESSAGING_EVENT_NOTIFICATION = "ms.MessagingEventNotification",
  GET_USER_PROFILE = "userprofile.GetUserProfileResponse",
  SUBSCRIBE_EX_CONVERSATIONS = "cqm.SubscribeExConversations",
  SUBSCRIBE_EX_CONVERSATIONS_RESPONSE = "cqm.SubscribeExConversationsResponse",
  GET_CLOCK_RESPONSE = "GetClockResponse",
  INIT_CONNECTION = "InitConnection",
  UPDATE_CONVERSATION_FIELD = "cm.UpdateConversationField",
  UPDATE_CONVERSATION_FIELD_CLOSE_CONVERSATION = "cm.UpdateConversationFieldCloseConversation",
  UPDATE_CONVERSATION_FIELD_STEP_UP_AUTHENTICATION = "cm.UpdateConversationField.StepUpAuthentication",
  SET_USER_PROFILE = "userprofile.SetUserProfile",
  REQUEST_CONVERSATION = "RequestConversation",
  REQUEST_CONVERSATION_RESPONSE = "RequestConversationResponse",
  FILE_UPLOAD_RESPONSE = "ms.GenerateURLResponse",
}

export enum RESPONSE_CODES {
  GET_CLOCK_RESPONSE = "100",
  INIT_CONNECTION = "101",
  GET_USER_PROFILE = "102",
  SUBSCRIBE_EX_CONVERSATIONS = "103",
  SUBSCRIBE_EX_CONVERSATIONS_SURVEYS = "104",
  SUBSCRIBE_MESSAGING_EVENTS = "105",
  UPDATE_CONVERSATION_FIELD_STEP_UP_AUTHENTICATION = "107",
  SET_USER_PROFILE = "108",
  UPDATE_CONVERSATION_FIELD = "500",
  UPDATE_CONVERSATION_FIELD_CLOSE_CONVERSATION = "501",
  UPDATE_CONVERSATION_FIELD_CLOSE_DIALOG = "502",
  UPLOAD_TOKEN_RESONSE = "508",
  CONVERSATION_CHANGE_NOTIFICATION = "509",
  MESSAGING_EVENT_NOTIFICATION = "510",
  REQUEST_CONVERSATION = "511",
}

export const REQUEST_TYPES = {
  GetClockResponse: "100",
  InitConnection: "101",
  "userprofile.GetUserProfile": "102",
  "cqm.SubscribeExConversations": "103",
  "cm.UpdateConversationField.StepUpAuthentication": "107",
  "userprofile.SetUserProfile": "108",
  "cm.UpdateConversationField": "500",
  "cm.UpdateConversationFieldCloseConversation": "501",
};
export enum USER_TYPES {
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
}
export enum DIALOG_TYPES {
  POST_SURVEY = "POST_SURVEY",
  OTHER = "other",
}
export enum STAGES {
  OPEN = "OPEN",
  CLOSE = "CLOSE",
  LOCKED = "LOCKED",
}
export enum CONVERSATION_STATES {
  OPEN = "OPEN",
  CLOSE = "CLOSE",
  LOCKED = "LOCKED",
}

export enum CONTENT_TYPES {
  SECURE_FORM_INVITATION = "forms/secure-invitation",
  SECURE_FORM_SUBMISSION = "forms/secure-submission",
}
export enum EVENTS_TYPES {
  CONTENT_EVENT = "ContentEvent",
  ACCEPT_STATUS = "AcceptStatusEvent",
  RICH_CONTENT = "RichContentEvent",
  CHAT_STATE = "ChatStateEvent",
}

export enum PARTICIPANT_ROLES {
  ASSIGNED_AGENT = "ASSIGNED_AGENT",
  CONSUMER = "CONSUMER",
  MANAGER = "MANAGER",
  CONTROLLER = "CONTROLLER",
}

export enum AUDIENCES {
  ALL = "ALL",
}

export enum MESSAGE_STATUSES {
  PENDING = "PENDING",
  SENT = "SENT",
  READ = "READ",
  ACCEPT = "ACCEPT",
}

export enum COBROWSE_TYPE {
  COBROWSE = "view",
  VIDEO_CALL = "VIDEO_CALL",
  VOICE_CALL = "VOICE_CALL",
}

export enum CHANNEL_TYPES {
  MAIN = "MAIN",
  POST_SURVEY = "POST_SURVEY",
  COBROWSE = "COBROWSE",
  VIDEO_CALL = "VIDEO_CALL",
  VOICE_CALL = "VOICE_CALL",
}

export enum MESSAGE_AUDIENCE {
  ALL = "ALL",
  AGENTS_AND_MANAGERS = "AGENTS_AND_MANAGERS",
}
