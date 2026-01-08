// import { RESPONSE_CODES, UMS_TYPES } from "src/constants";
// import type { NewConversationRequest } from "src/interfaces";
// import { v4 as uuidv4 } from 'uuid'

// let socketConnectRetries = 1

// export class MessagingService {
//   accountId: string | null = null;
//   services: Record<string, string | null> = {};
//   socket: WebSocket | null = null;
//   jwt: string | null = null;
//   unauthenticatedJwt: string | null = null;
//   authenticatedJwt: string | null = null;
//   conversationId: string | null = null;
//   dialogId: string | null = null;

//   private static instance: MessagingService;


//   constructor() {
//     if (MessagingService.instance) {
//       return MessagingService.instance;
//     }
//     MessagingService.instance = this;
//   }

//   public static getInstance(): MessagingService {
//     if (!MessagingService.instance) {
//       MessagingService.instance = new MessagingService();
//     }
//     return MessagingService.instance;
//   }

//   initRequest (jwt: string) {
//     return {
//       id: RESPONSE_CODES.INIT_CONNECTION,
//       kind: 'req',
//       type: 'InitConnection',
//       body: {},
//       headers: [
//         {
//           type: '.ams.headers.ConsumerAuthentication',
//           jwt
//         },
//         {
//           type: '.ams.headers.ClientProperties',
//           os: window.navigator.userAgent,
//           features: [
//             'AUTO_MESSAGES',
//             'RICH_CONTENT',
//             'CO_BROWSE',
//             'PHOTO_SHARING',
//             'QUICK_REPLIES',
//             'MULTI_DIALOG',
//             'FILE_SHARING',
//             'MARKDOWN_HYPERLINKS'
//           ],
//           appId: 'webAsync',
//           integrationVersion: '3.0.62',
//           integration: 'WEB_SDK',
//           timeZone: 'Australia/Sydney'
//         }
//       ]
//     }
//   }

//   subscribeExConversations () {
//     return {
//       kind: 'req',
//       id: RESPONSE_CODES.SUBSCRIBE_EX_CONVERSATIONS,
//       type: UMS_TYPES.SUBSCRIBE_EX_CONVERSATIONS,
//       body: {
//         stage: ['OPEN', 'CLOSE', 'LOCKED'],
//         convState: ['OPEN', 'CLOSE', 'LOCKED']
//       }
//     }
//   }

//   userProfile () {
//     return {
//       kind: 'req',
//       id: RESPONSE_CODES.GET_USER_PROFILE,
//       type: 'userprofile.GetUserProfile',
//       body: {}
//     }
//   }

//   subscribeEvents (
//   ) {
//     const { conversationId, dialogId } = this
//     return {
//       kind: 'req',
//       id: RESPONSE_CODES.SUBSCRIBE_MESSAGING_EVENTS,
//       body: {
//         fromSeq: 0,
//         conversationId,
//         dialogId
//       },
//       type: 'ms.SubscribeMessagingEvents'
//     }
//   }

//   subscribeSurveyEvents () {
//     const { conversationId, dialogId } = this
//     return {
//       kind: 'req',
//       id: RESPONSE_CODES.SUBSCRIBE_EX_CONVERSATIONS_SURVEYS,
//       type: 'cqm.SubscribeExConversations',
//       body: {
//         conversationId,
//         dialogId: dialogId || conversationId
//       }
//     }
//   }

//   closeConversation () {
//     const { conversationId } = this
//     return {
//       kind: 'req',
//       id: RESPONSE_CODES.UPDATE_CONVERSATION_FIELD_CLOSE_CONVERSATION,
//       type: 'cm.UpdateConversationField',
//       body: {
//         conversationId,
//         conversationField: {
//           field: 'Stage', conversationState: 'CLOSE'
//         }
//       }
//     }
//   }

//   closeDialog () {
//     const { conversationId, dialogId } = this
//     if (!conversationId || !dialogId) {
//       throw new Error('Conversation ID and Dialog ID must be set before closing a dialog.');
//     }
//     return {
//       kind: 'req',
//       id: RESPONSE_CODES.UPDATE_CONVERSATION_FIELD_CLOSE_DIALOG,
//       type: 'cm.UpdateConversationField',
//       body: {
//         conversationId,
//         conversationField: {
//           field: 'DialogChange',
//           type: 'UPDATE',
//           dialog: { dialogId, state: 'CLOSE', closedCause: 'Closed by consumer' }
//         }
//       }
//     }
//   }

//   sendMessage (conversationId: string, dialogId: string, message: string) {
//     return {
//       kind: 'req',
//       id: `consumer_${uuidv4()}`,
//       type: 'ms.PublishEvent',
//       body: {
//         conversationId,
//         dialogId,
//         event: {
//           type: 'ContentEvent',
//           contentType: 'text/plain',
//           message
//         }
//       }
//     }
//   }

//   createConversation (
//     skillId: string,
//     visitorId: string,
//     sessionId: string,
//     campaignId?: string,
//     engagementId?: string
//   ): NewConversationRequest {
//     const config: NewConversationRequest = {
//       kind: 'req',
//       id: RESPONSE_CODES.REQUEST_CONVERSATION,
//       type: 'cm.ConsumerRequestConversation',
//       body: {
//         skillId,
//         channelType: 'MESSAGING',
//         ttrDefName: null,
//         conversationContext: {
//           visitorId,
//           sessionId,
//           interactionContextId: '1',
//           type: 'SharkContext',
//           lang: 'en-US'
//         }
//       }
//     }
//     if (campaignId && engagementId) {
//       config.body.campaignInfo = { campaignId, engagementId }
//     }
//     return config
//   }

//   async getConnectors (useCache?: boolean) {
//     try {
//       if (useCache && this.connectors) {
//         return this.connectors
//       }
//       const actionKey = ACTION_KEYS_MESSAGING.GET_CONNECTORS
//       if (!this.siteId) {
//         throw new Error('No siteId found')
//       }
//       const { data } = await ApiService.get<Connector[]>(MESSAGING_ROUTES.CONNECTORS(this.siteId), actionKey)
//       this.connectors = data
//       return data
//     } catch (error) {
//       throw ErrorService.handleRequestError(error)
//     }
//   },

//   async connectToUMS () {
//     const { accountId } = this
//     if (!accountId) { throw new Error('No accountId found') }
//     await this.getConnectors()
//     const jwt = await this.getConversationJwt()
//     if (!jwt) { throw new Error('No jwt found') }
//     const domain: string | null = this.services.asyncMessagingEnt ? String(this.services.asyncMessagingEnt) : null
//     if (!domain) { throw new Error('No domain found') }
//     const getClock = this.getClock
//     const sendToSocket = this.sendToSocket
//     const processResponse = this.processResponse
//     const connect = this.connectToUMS
//     const socket = new WebSocket(MESSAGING_ROUTES.UMS(domain, accountId))
//     this.socket = socket
//     if (!socket) {
//       throw new Error('No socket found')
//     }
//     try {
//       if (socket) {
//         console.info('socket already exists')
//         socket.onopen = function () {
//           getClock()
//           sendToSocket(UMS.initRequest(jwt))
//         }
//         socket.onmessage = function (event) {
//           processResponse(event)
//         }
//         socket.onerror = function () {
//           // console.warn(event)
//           if (socketConnectRetries > 0) {
//             socketConnectRetries--
//             setTimeout(() => {
//               connect()
//             }, 2000)
//           }
//         }
//         socket.onclose = (r) => {
//           // console.log(r)
//           // console.log(r.reason)
//           if (r.reason.includes('nection timed out')) {
//             if (socketConnectRetries > 0) {
//               // console.info('trying again to open socket')
//               socketConnectRetries--
//               connect()
//             }
//           } else if (r.reason.includes('ntity token is invalid')) {
//             connect()
//             throw new Error('JWT token is invalid')
//           }
//         }
//         return true
//       }
//     } catch (error) {

//     }
//   }
// }

// const messagingService = new MessagingService();
// export default messagingService;
