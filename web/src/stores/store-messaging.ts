// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { defineStore } from 'pinia'
// import { jwtDecode } from 'jwt-decode'
// import ApiService from 'src/services/ApiService'
// import AuthService from 'src/services/AuthService'
// import ErrorService from 'src/services/ErrorService'
// import { LocalStorageCache } from 'src/services/StorageCache'
// import { AuthenticationProperties as auth0 } from 'vue-auth0-plugin'
// // import { Notify } from 'quasar'
// interface FrequentObject {
//   [key: string]: number;
// }
// import {
//   MESSAGE_STATUSES,
//   AUDIENCES,
//   PARTICPANT_ROLES,
//   ACTION_KEYS_MESSAGING,
//   MESSAGING_ROUTES,
//   CONNECTOR_TYPES,
//   authenticationErrors,
//   // REQUEST_TYPES,
//   USER_TYPES,
//   DIALOG_TYPES,
//   CONVERSATION_STATES,
//   RESPONSE_CODES,
//   UMS_TYPES,
//   CONTENT_TYPES,
//   EVENTS_TYPES,
//   STAGES
// } from 'src/constants'

// import type {
//   KVPObject,
//   Connector,
//   Isession,
//   UnauthTokenResponse,
//   Change,
//   MessagingEvent,
//   ContentEvent,
//   ClientMessage,
//   ConversationParticipants,
//   Dialog,
//   SecureFormMessage,
//   AcceptStatusEvent,
//   CobrowseMetadata,
//   MessagingEventNotification,
//   CTConfig
// } from 'src/interfaces';
// import {
//   ISkill,
//   ICampaign,
//   ICampaignInfo,
//   ICampaignEngagement,
//   Domain,
//   COBROWSE_TYPE
// } from 'src/interfaces'
// import { parse } from 'src/functions/common'
// import { nextTick } from 'vue'
// import * as MSG from 'src/utils/messaging/helpers'
// import { AxiosError } from 'axios'
// import shortUUID, { uuid } from 'short-uuid'

// let socketConnectRetries = 1
// const cache = new LocalStorageCache('UMS_CACHE')

// const UMS = new MSG.UMS()
// interface IMessagingState {
//   frequentMessages: FrequentObject;
//   testingConfig: CTConfig;
//   scriptingIndex: number;
//   scriptRunning: boolean;
//   scriptCD: number;
//   file: File | null;
//   formData: FormData | null;
//   dataImage: string | null;
//   imagePreview: string | null;
//   secureFormTimeout: number; // TODO: get from AC
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   cobrowseMeta: any;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   offerCobrowse: any;
//   isCobrowseSession: boolean;
//   cobrowseMode: string;
//   agentChatState: string | null;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   users: any[];
//   agentId: string | null;
//   openDialog: Change | null;
//   stage: string | null;
//   showWindow: boolean;
//   size: string;
//   loaded: boolean;
//   readState: string;
//   isGroupMessages: boolean;
//   UMSConnected: boolean;
//   subscribedConversations: boolean;
//   subscribed: KVPObject;
//   clock: ReturnType<typeof setInterval> | null
//   nextMessageTimer : ReturnType<typeof setInterval> | null
//   socket: WebSocket | null;
//   siteId?: string | null;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   agent: any;
//   firstMessage?: string | null;
//   connectors: Connector[] | null;
//   conversationId: string | null;
//   messagesLoaded: boolean;
//   lastConversationId: string | null;
//   consumer: {
//     id?: string;
//     firstName?: string;
//     lastName?: string;
//     email?: string;
//     phone?: string;
//     avatar?: string;
//   } | null;
//   LP_EXT_JWT: string | null;
//   LP_EXT_JWT_AUTH: string | null;
//   LP_INT_JWT_AUTH: string | null;
//   LP_INT_JWT: string | null;
//   useAnonymous: boolean;
//   conversationParticipantId: string | null;
//   consumerId: string | null;
//   isSubscribed: boolean;
//   dialog: Dialog | null;
//   participants: ConversationParticipants;
//   messages: ClientMessage[];
//   USER_TYPE: string | null;
//   services: KVPObject;
//   sessionId: string | null;
//   visitorId: string | null;
//   skillId: string | null;
//   secureForms: KVPObject;
//   secureFormCache: KVPObject;
//   coBrowseExpired: boolean;
//   coBrowseMetadata: CobrowseMetadata | null;
// }

// export const useMessagingStore = defineStore('messaging', {
//   state: (): IMessagingState => ({
//     scriptingIndex: 0,
//     frequentMessages: {},
//     testingConfig: {
//       delay: 0,
//       scripting: [],
//       scriptTimer: 3000,
//       slide: {
//         channel: 'web',
//         skill: {
//           id: -1,
//           name: 'General'
//         },
//         starters: ['get started']
//       },
//       campaign: null,
//       campaignInfo: null,
//       engagement: null
//     },
//     file: null,
//     scriptRunning: false,
//     scriptCD: 3000,
//     formData: null,
//     dataImage: null,
//     imagePreview: null,
//     secureFormCache: {},
//     coBrowseExpired: false,
//     coBrowseMetadata: null,
//     isCobrowseSession: false,
//     secureFormTimeout: 60000,
//     cobrowseMode: null,
//     offerCobrowse: false,
//     cobrowseMeta: null,
//     agentChatState: null,
//     agentId: null,
//     users: [],
//     openDialog: null,
//     stage: null,
//     showWindow: false,
//     size: 'standard',
//     loaded: false,
//     readState: 'pending',
//     isGroupMessages: true,
//     UMSConnected: false,
//     subscribedConversations: false,
//     subscribed: {},
//     clock: null,
//     nextMessageTimer: null,
//     siteId: null,
//     socket: null,
//     agent: null,
//     firstMessage: null,
//     connectors: null,
//     conversationId: null,
//     messagesLoaded: false,
//     lastConversationId: null,
//     consumer: null,
//     LP_EXT_JWT: null,
//     LP_EXT_JWT_AUTH: null,
//     LP_INT_JWT_AUTH: null,
//     LP_INT_JWT: null,
//     useAnonymous: false,
//     conversationParticipantId: null,
//     consumerId: null,
//     isSubscribed: false,
//     messages: [],
//     dialog: null,
//     participants: {},
//     USER_TYPE: null,
//     services: {},
//     sessionId: null,
//     visitorId: null,
//     skillId: null,
//     secureForms: {}
//   }),
//   getters: {
//     groupMessages (state) {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const array: any[] = []
//       if (!state.isGroupMessages) {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         state.messages.forEach((m: any) => {
//           m.messages = [MSG.nToBr(m.message)]
//         })
//         return state.messages
//       }
//       console.info('grouping messages')

//       /* group text messages only for same participant */
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       state.messages.forEach((m: any, i) => {
//         const lIdx: number | null = MSG.lastIndex(array) || null
//         const last = lIdx && array.length > 0 ? array[lIdx] : null
//         const msa = state.messages.length
//         const isLastMessage = i === msa - 1
//         const lastMessage = state.messages[msa - 1]
//         // const lastMessageQuickReplies = lastMessage?.quickReplies || []
//         m.messages = []
//         // m.quickReplies = []
//         if (m.type !== 'text') {
//           array.push(m)
//           return
//         }
//         if (!last) {
//           console.info(m)
//           m.messages = [MSG.nToBr(m.message)]
//           array.push(m)
//           return
//         }
//         if (i === 0) {
//           m.messages = [MSG.nToBr(m.message)]
//           // m.quickReplies = lastMessageQuickReplies
//           array.push(m)
//           return
//         }

//         if (
//           i > 0 &&
//           last.originatorId === m.originatorId &&
//           last.type === 'text' &&
//           m.type === 'text'
//         ) {
//           last.messages.push(MSG.nToBr(m.message))
//           // m.quickReplies = lastMessageQuickReplies
//         } else {
//           m.messages = [MSG.nToBr(m.message)]
//           // m.quickReplies = lastMessageQuickReplies
//           array.push(m)
//         }
//         if (isLastMessage) {
//           // ensure last message contains the quick replies
//           // m.quickReplies = lastMessageQuickReplies
//           console.info(lastMessage)
//         }
//       })
//       return array
//     }
//   },
//   actions: {
//     hydrateFromLocalStore () {
//       const tokens = ['LP_EXT_JWT']
//       tokens.forEach((token) => {
//         const t = localStorage.getItem(token)
//         if (t) this[token as keyof IMessagingState] = t
//       })
//       const sf = localStorage.getItem('secureForms')
//       this.secureForms = sf ? JSON.parse(sf) : {}
//     },
//     removeFrequentMessage (message: string) {
//     },
//     runScript () {
//       this.scriptCD = Number(this.testingConfig.scriptTimer)
//       this.scriptingIndex = 0
//       this.scriptRunning = true
//       this.sendMessage(this.testingConfig.scripting[0])
//       this.scriptingIndex = 1
//     },
//     awaitNextScriptMessage (source: string) {
//       const reset = () => {
//         // clearInterval(nextMessageTimer)
//         this.scriptCD = Number(this.testingConfig.scriptTimer)
//       }
//       if (!this.scriptRunning) return
//       console.info('SCRIPTING nextScriptMessage', source)
//       const sendMessage = this.sendMessage
//       // const nextMessageTimer = this.nextMessageTimer
//       const message = this.testingConfig.scripting[this.scriptingIndex]
//       console.info('SCRIPTING nextScriptMessage', message)

//       reset()
//       const scriptCD = this.scriptCD

//       if (!this.scriptRunning) return

//       if (!message) {
//         this.scriptingIndex = -1
//         this.scriptRunning = false
//         clearInterval(this.nextMessageTimer)
//         reset()
//         return
//       }

//       const _sendMessage = (index: number) => {
//         if (index > this.scriptingIndex) return
//         const m = this.testingConfig.scripting[index]
//         if (!m) return
//         sendMessage(m)
//         this.scriptingIndex += 1
//       }
//       // clearInterval(this.nextMessageTimer)

//       // const decrement = () => { this.scriptCD -= 100 }
//       // const getCD = () => { return this.scriptCD }
//       console.warn('SCRIPTING scriptCD', scriptCD)
//       let sent = false
//       const nextMessageTimer = setInterval(() => {
//         if (this.scriptCD <= 0) {
//           console.info('SCRIPTING timer is 0')
//           if (!sent) {
//             console.info('SCRIPTING sending message', message)
//             _sendMessage(this.scriptingIndex)
//             sent = true
//           }
//           clearInterval(nextMessageTimer)
//         }
//         this.scriptCD -= 100
//       }, 100)
//     },
//     setAgent () {
//       const agent = this?.participants?.ASSIGNED_AGENT || null
//       const r = Math.floor(Math.random() * 6) + 1
//       const randomAvatar = `https://storage.googleapis.com/lp-solutions-toolkit/app-resources/bot-0${r}.png`
//       this.agent = {
//         name: agent?.nickname ?? 'Agent',
//         avatar: agent?.pictureUrl ?? randomAvatar
//       }
//     },
//     clearConvCache () {
//       cache.remove('conversationId')
//       window.localStorage.removeItem('conversationId')
//       window.sessionStorage.removeItem('conversationId')
//     },
//     async getlpDomains (siteId: string) {
//       try {
//         if (!siteId) { throw new Error('No siteId found') }
//         const actionKey = ACTION_KEYS_MESSAGING.GET_DOMAINS
//         const url = MESSAGING_ROUTES.DOMAINS(siteId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const { data } = await ApiService.get<any>(url, actionKey)
//         const services = MSG.formatServices(data)
//         this.$patch({
//           services
//         })
//         return services
//       } catch (error) {
//         throw ErrorService.handleRequestError(error)
//       }
//     },
//     async initState (siteId: string, skillId: string) {
//       this.hydrateFromLocalStore()
//       this.siteId = siteId
//       this.skillId = skillId
//       this.conversationId = null
//       await this.getlpDomains(siteId)
//       await nextTick()
//       this.consumer = {
//         id: cache.get('consumerId'),
//         firstName: cache.get('firstName'),
//         lastName: cache.get('lastName'),
//         email: cache.get('email'),
//         phone: cache.get('phone'),
//         avatar: cache.get('avatar')
//       }
//       this.useAnonymous = cache.get('useAnonymous')
//       const consumerId = cache.get('consumerId')
//       // const conversationId = localStorage.getItem('conversationId')
//       // if (conversationId) {
//       //   console.warn('conversationId found in cache, ', conversationId)
//       //   this.conversationId = conversationId
//       //   const conversationParticipantId = cache.get('CONSUMER_ID' + conversationId)
//       //   if (conversationParticipantId) this.conversationParticipantId = conversationParticipantId
//       // }
//       if (consumerId) this.consumerId = consumerId
//       MSG.runLPTag({
//         siteId,
//         sections: []
//       })
//       const session = await this.confirmLPSession()
//       this.sessionId = session?.sessionId
//       this.visitorId = session?.visitorId
//       return true
//     },
//     async getConnectors (useCache?: boolean) {
//       try {
//         if (useCache && this.connectors) {
//           return this.connectors
//         }
//         const actionKey = ACTION_KEYS_MESSAGING.GET_CONNECTORS
//         if (!this.siteId) {
//           throw new Error('No siteId found')
//         }
//         const { data } = await ApiService.get<Connector[]>(MESSAGING_ROUTES.CONNECTORS(this.siteId), actionKey)
//         this.connectors = data
//         return data
//       } catch (error) {
//         throw ErrorService.handleRequestError(error)
//       }
//     },

//     async getUnauthToken (reset?: boolean): Promise<string | null> {
//       try {
//         const cached = this.LP_EXT_JWT || localStorage.getItem('LP_EXT_JWT')
//         if (!reset && cached) { return cached }
//         localStorage.removeItem('LP_EXT_JWT')
//         const actionKey = ACTION_KEYS_MESSAGING.GET_UNAUTH_TOKEN
//         if (!this.siteId) {
//           throw new Error('No accountId found')
//         }
//         const url = MESSAGING_ROUTES.CONSUMER_JWT(this.siteId)
//         const { data } = await ApiService.get<UnauthTokenResponse>(url, actionKey)

//         if (data) {
//           this.LP_EXT_JWT = data.token
//           localStorage.setItem('LP_EXT_JWT', String(data.token))
//         }

//         return data.token
//       } catch (error) {
//         throw ErrorService.handleRequestError(error)
//       }
//     },

//     async getUnauthTokenJWS (reset?: boolean): Promise<string | null> {
//       try {
//         const cached = this.LP_EXT_JWT || localStorage.getItem('LP_EXT_JWT')
//         if (!reset && cached) { return cached }
//         localStorage.removeItem('LP_EXT_JWT')
//         const actionKey = ACTION_KEYS_MESSAGING.GET_UNAUTH_TOKEN
//         if (!this.siteId) {
//           throw new Error('No accountId found')
//         }
//         const url = MESSAGING_ROUTES.CONSUMER_JWS(this.siteId)
//         const { data } = await ApiService.get<UnauthTokenResponse>(url, actionKey)

//         if (data) {
//           this.LP_EXT_JWT = data.token
//           localStorage.setItem('LP_EXT_JWT', String(data.token))
//         }

//         return data.token
//       } catch (error) {
//         throw ErrorService.handleRequestError(error)
//       }
//     },
//     async authoriseToken (jwt: string) {
//       try {
//         if (!this.siteId) {
//           throw new Error('No accountId found')
//         }
//         const actionKey = ACTION_KEYS_MESSAGING.AUTHORIZE_JWT
//         const url = MESSAGING_ROUTES.AUTHORIZE(this.siteId)
//         const { data } = await ApiService.post<{ token: string; }>(url, { id_token: jwt }, actionKey)
//         return data.token
//       } catch (error) {
//         throw ErrorService.handleRequestError(error)
//       }
//     },
//     async exchangeUnauthToken (connectorId: string, idToken: string) {
//       try {
//         const { siteId } = this
//         if (!siteId) {
//           console.warn('no siteId found')
//           return
//         }

//         const actionKey = ACTION_KEYS_MESSAGING.AUTHORIZE_JWT
//         const url = MESSAGING_ROUTES.CONNECTORS_BY_ID(siteId, connectorId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const { data } = await ApiService.post<any>(url, {
//           id_token: idToken
//         }, actionKey)
//         // console.info(data)
//         return data.token
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (error: any) {
//         if (error?.response?.data?.internalErrorCode) {
//           const code = authenticationErrors[error.response.data.internalErrorCode]
//           console.error({
//             reason: code || 'UNKNOWN',
//             ...error.response.data
//           })
//           return
//         }
//         console.error(error.response.data)
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async sendToSocket (p: any) {
//       const payload = JSON.stringify(p)
//       if (!this.socket) {
//         // this.connect({ payload })
//       } else {
//         console.info('sending to socket', payload)
//         this.socket.send(payload)
//       }
//     },
//     async getClock () {
//       this.sendToSocket({ kind: 'req', id: 100, type: 'GetClock' })
//       const send = this.sendToSocket
//       function runClock () {
//         send({ kind: 'req', id: 100, type: 'GetClock' })
//       }
//       this.clock = setInterval(runClock, 60000)
//     },
//     setConversationId (conversationId: string | null) {
//       this.conversationId = conversationId
//       this.conversationParticipantId = this.participants?.CONSUMER?.id
//       cache.add('consumer_id', `${this.consumerId}`, 86400 * 365)
//       cache.add('CONSUMER_ID' + conversationId, `${this.consumerId}`, 86400 * 365)
//       cache.add('conversationId', conversationId, 86400 * 30)
//       if (conversationId) {
//         localStorage.setItem('conversationId', conversationId)
//         localStorage.setItem('CONSUMER_ID' + conversationId, `${this.consumerId}`)
//       } else {
//         localStorage.removeItem('conversationId')
//         localStorage.removeItem('CONSUMER_ID' + conversationId)
//       }
//       this.setAgent()
//     },
//     async returnAuthJWT () {
//       try {
//         return (await auth0.getIdTokenClaims()).__raw
//       } catch (error) {
//         return null
//       }
//     },
//     async getInternalTokenAuth (): Promise<string | null> {
//       try {
//         const LP_EXT_JWT_AUTH = await this.returnAuthJWT()
//         this.LP_EXT_JWT_AUTH = LP_EXT_JWT_AUTH
//         const connectors: Connector[] = await this.getConnectors(true)
//         const authConnectorId = connectors.find((x: Connector) => x.name === 'DEMOBUILDER').id
//         console.warn('LP_EXT_JWT_AUTH', LP_EXT_JWT_AUTH)
//         if (!LP_EXT_JWT_AUTH) {
//           console.error('No LP_EXT_JWT_AUTH found')
//           return null
//         }
//         const LP_INT_JWT_AUTH = await this.exchangeUnauthToken(String(authConnectorId), LP_EXT_JWT_AUTH)
//         this.LP_INT_JWT_AUTH = LP_INT_JWT_AUTH
//         return LP_INT_JWT_AUTH
//       } catch (error) {
//         return null
//       }
//     },
//     async getConversationJwt () {
//       const LP_EXT_JWT_AUTH = await this.getInternalTokenAuth()
//       const lpExtJwt = await (localStorage.getItem('LP_EXT_JWT') || this.getUnauthToken())
//       console.info('lpExtJwt', lpExtJwt)
//       this.LP_EXT_JWT = lpExtJwt
//       const conversationParticipantId = localStorage.getItem('CONSUMER_ID' + this.conversationId)
//       if (conversationParticipantId) {
//         this.conversationParticipantId = conversationParticipantId
//       }

//       const lpInternalJWT = await this.authoriseToken(lpExtJwt)
//       const unauthConnector = this.connectors?.find((c: Connector) => c.name === CONNECTOR_TYPES.UNAUTHENTICATED)
//       if (!unauthConnector) {
//         console.error('No unauth connector found')
//         throw new Error('No unauth connector found')
//       }
//       console.warn('lpInternalJWT', lpInternalJWT)
//       const lpIntJwt = await this.exchangeUnauthToken(String(unauthConnector.id), lpInternalJWT)
//       this.LP_INT_JWT = lpIntJwt
//       if (LP_EXT_JWT_AUTH) {
//         const CONSUMER_CONVERSATION = localStorage.getItem(`CONSUMER_CONVERSATION_${this.consumerId}`)
//         if (CONSUMER_CONVERSATION) {
//           // step up
//           return
//         }
//         return LP_EXT_JWT_AUTH
//       }
//       return lpIntJwt
//     },
//     async subscribeToConversations () {
//       if (this.subscribedConversations) return
//       this.subscribedConversations = true
//       this.sendToSocket(UMS.subscribeExConversations())
//     },
//     getUserProfile () {
//       this.sendToSocket(UMS.userProfile())
//     },
//     setStage (stage: string | null) {
//       this.stage = stage
//       if (stage === null) {
//         this.dialog = null
//         this.lastConversationId = `${this.conversationId}`
//         this.conversationId = null
//         this.participants = {}
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async getUsers (): Promise<any> {
//       if (this.users.length > 0) return this.users
//       try {
//         const { siteId } = this
//         if (!siteId) { throw new Error('No siteId found') }
//         const actionKey = ACTION_KEYS_MESSAGING.GET_USERS
//         const url = MESSAGING_ROUTES.USERS(this.siteId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const { data } = await ApiService.get<any>(url, actionKey)
//         this.users = data
//         return data
//       } catch (error) {
//         return []
//       }
//     },
//     async getUserById (id: string) {
//       console.info('getting user by id', id)
//       try {
//         const users = await this.getUsers() || []
//         return users.find((x: { pid: string }) => x.pid === id)
//       } catch (error) {
//         return null
//       }
//     },

//     async processContentEvent (change: MessagingEvent) {
//       console.info('mark_07', (change.event as ContentEvent))
//       if ((change.event as ContentEvent)?.contentType === 'forms/secure-submission') {
//         // TODO:
//         // this.postSubmissionMessage(change)
//       }
//       // const { isAuth } = this.UMS
//       const {
//         messageAudience,
//         originatorMetadata
//       } = change
//       console.info(originatorMetadata.role)

//       const isAgent = originatorMetadata.role === PARTICPANT_ROLES.ASSIGNED_AGENT
//       if (isAgent) {
//         this.agentId = originatorMetadata.id
//         this.awaitNextScriptMessage('processContentEvent')
//       }
//       console.info('isAgent', isAgent)
//       const agent = isAgent ? await this.getUserById(originatorMetadata.id) : null
//       if (originatorMetadata.role === 'CONSUMER') {
//         this.consumerId = originatorMetadata.id
//       }

//       if (messageAudience !== AUDIENCES.ALL) return
//       const from = agent ? agent.nickname : change.originatorMetadata.role
//       this.readState = 'pending'
//       console.info('mark_01', change)
//       // forms/secure-invitation

//       const payload = UMS.threadMessage(change, isAgent, from)

//       this.$patch({ messages: [...this.messages, payload] })
//       return true
//     },
//     setMessages (messages: ClientMessage[]) {
//       this.messageLength = messages.length
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       messages.forEach((m: any) => {
//         if (m?.message?.includes('#md#')) {
//           m.message = MSG.mdToLink(m.message)
//         }

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         if (!this.messages.find((x: any) => x.uid === m.uid)) {
//           if (this.showWindow && !this.windowMinimsed) {
//             if (m.status !== MESSAGE_STATUSES.READ) {
//               this.sendReadReceipt(m.dialogId, m.sequence)
//             }
//           } else if (m.status !== MESSAGE_STATUSES.ACCEPT) {
//             // t.lpm.sendAcceptReceipt(m.dialogId, m.sequence)
//           }

//           this.messages.push(m)
//         }
//       })
//       this.messagesLoaded = true
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async processRichContentEvent (change: any) {
//       const { conversationId } = this
//       const {
//         dialogId,
//         messageAudience,
//         originatorMetadata,
//         serverTimestamp,
//         originatorId,
//         sequence
//       } = change

//       if (messageAudience !== AUDIENCES.ALL) return
//       const isAgent = originatorMetadata.role === PARTICPANT_ROLES.ASSIGNED_AGENT
//       if (isAgent) {
//         this.agentId = originatorMetadata.id
//         this.awaitNextScriptMessage('processRichContentEvent')
//       }
//       const agent = isAgent ? await this.getUserById(originatorMetadata.id) : null
//       // console.info(agent)
//       if (originatorMetadata.role === PARTICPANT_ROLES.ASSIGNED_AGENT) {
//         this.agentId = originatorMetadata.id
//       }
//       if (originatorMetadata.role === PARTICPANT_ROLES.CONSUMER) {
//         // this.setConsumerId(originatorMetadata.id)
//         cache.add('consumerId', originatorMetadata.id, 86400)
//         this.consumerId = originatorMetadata.id
//       }

//       const from = agent ? agent.nickname : change.originatorMetadata.role

//       const { content } = change.event

//       this.messages.push({
//         metadata: change.metadata,
//         serverTimestamp,
//         timeLocal: serverTimestamp,
//         uid: sequence + '-' + dialogId,
//         originatorId,
//         role: originatorMetadata.role,
//         conversationId,
//         dialogId,
//         status: 'SENT',
//         content,
//         sequence,
//         from,
//         quickReplies: change?.event?.quickReplies?.replies || [],
//         type: content.type,
//         isReplies: false
//       })
//       this.setMessages(this.messages)
//       // this.emit('messages', this.messages)
//     },
//     async postSubmissionMessage (change: MessagingEvent) {
//       // const t = this
//       console.log(change)
//       // The following Secure Form has been submitted
//       const { conversationId } = this
//       const { invitationId } = (change.event as ContentEvent).message as SecureFormMessage
//       const clientMessage = this.messages.find((m: ClientMessage) => m.invitationId === invitationId)
//       console.info('mark_03', clientMessage)
//       const invitation = this.secureForms[invitationId]
//       const title = clientMessage?.title || invitation?.event?.message?.title
//       const message = title ? `You have submitted secure form: ${title}` : 'You have submitted a secure form'

//       console.info('mark_02', title, clientMessage)
//       if (clientMessage) {
//         clientMessage.text = message
//         clientMessage.submitted = true
//         this.messages = [...this.messages]
//         return
//       }
//       // const a = 1
//       // if (a === 1) return
//       const { isAuth } = this
//       const {
//         dialogId,
//         messageAudience,
//         originatorMetadata,
//         sequence: sequenceList,
//         serverTimestamp,
//         originatorId,
//         sequence
//       } = change

//       const isAgent = originatorMetadata.role === 'ASSIGNED_AGENT'
//       if (isAgent) {
//         this.agentId = originatorMetadata.id
//         this.awaitNextScriptMessage('postSubmissionMessage')
//       }
//       const agent = isAgent ? await this.getUserById(originatorMetadata.id) : null
//       if (originatorMetadata.role === 'CONSUMER') {
//         console.info('this.consumerId', this.consumerId, originatorMetadata.id)
//         // this.consumerId[isAuth ? 'AUTH' : 'UNAUTH'] = originatorMetadata.id
//         this.consumerId = originatorMetadata.id
//       }
//       // t.sendAcceptReceipt(dialog, dialogId /* sequenceList */)

//       if (messageAudience !== 'ALL') return
//       const from = agent ? agent.nickname : change.originatorMetadata.role
//       const replies = []
//       const isReplies = false
//       // if (LPM.hasOwnProperty.call(change.event, 'quickReplies')) {
//       //   replies = change.event.quickReplies.replies
//       //   isReplies = true
//       // }

//       // if (debugLogs) console.info(change)
//       this.readState = 'pending'

//       // this.sendToSocket({
//       //   serverTimestamp,
//       //   uid: sequence + '-' + dialogId,
//       //   originatorId,
//       //   role: originatorMetadata.role,
//       //   conversationId,
//       //   dialogId,
//       //   status: 'SENT',
//       //   title,
//       //   invitationId,
//       //   message,
//       //   sequence,
//       //   from,
//       //   type: 'secure form submitted',
//       //   isReplies: false
//       // })
//     },

//     async processEvents (changes: MessagingEvent[]) {
//       const postSubmissionMessage = this.postSubmissionMessage
//       const generateUploadToken = this.generateUploadToken
//       const setSecureForm = this.setSecureForm

//       console.info('processEvents', changes)
//       for (const index in changes) {
//         // const isLast = Number(index) === Number(lastIndex)
//         const change = changes[index]
//         // const messageCount = count of all changes where = change.event.type == 'RichContentEvent' or change.event.type == 'ContentEvent'

//         const contentEvent = change.event as ContentEvent
//         const statusEvent = change?.event as AcceptStatusEvent

//         switch (change.event.type) {
//           case EVENTS_TYPES.CONTENT_EVENT:

//             if ((contentEvent.contentType) === CONTENT_TYPES.SECURE_FORM_INVITATION) {
//               // 1. check secureFormTimeout
//               // 2. check if secureForm is already submitted
//               // 3. check if secureForm is already expired
//               // secureFormTimeout: 60000
//               console.error('mark_09 invitation change event', contentEvent.contentType)
//               generateUploadToken(change)
//               const invitationId = (contentEvent.message as SecureFormMessage).invitationId
//               if (invitationId) {
//                 console.info('mark_10', invitationId)
//                 setSecureForm(invitationId, change)
//               }
//             } else if ([
//               // CONTENT_TYPES.SECURE_FORM_INVITATION,
//               CONTENT_TYPES.SECURE_FORM_SUBMISSION
//             ].includes((contentEvent).contentType)) {
//               console.info('mark_08', change)
//               if ((contentEvent.message as SecureFormMessage)?.submissionId) {
//               // TODO:
//                 postSubmissionMessage(change)
//                 const invitationId = (contentEvent.message as SecureFormMessage).invitationId
//                 this.updateSecureFormCache(invitationId, change)
//               } else {
//               // TODO:
//               // console.info(`isLast: ${isLast}, length: ${changes.length - 1}, index: ${index}`)
//                 // generateUploadToken(change)
//               }
//             } else {
//               await this.processContentEvent(change)
//             }

//             break
//           case EVENTS_TYPES.ACCEPT_STATUS:
//             // TODO:
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             (statusEvent)?.sequenceList.forEach((m: any) => {
//               const messageIndex = this.messages.findIndex((x: { sequence: string | number }) => x.sequence === m)
//               if (messageIndex >= 0) {
//                 this.messages[messageIndex].status = (statusEvent).status
//               }
//             })
//             // TODO:
//             // await this.setAcceptEvent(change)
//             break
//           case EVENTS_TYPES.RICH_CONTENT:
//             this.processRichContentEvent(change)
//             break
//           case EVENTS_TYPES.CHAT_STATE:
//             if (this.dialog?.dialogType !== 'POST_SURVEY') {
//               if (change.originatorMetadata.role === 'ASSIGNED_AGENT') {
//                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                 this.agentChatState = (change?.event as any).chatState
//               }
//             } else {
//               this.agentChatState = null
//             }
//             this.chatState = this.agentChatState
//             break

//           default:
//             break
//         }
//         if (Number(index) >= changes.length - 1) {
//           setTimeout(async () => {
//             this.isSubscribed = true
//             if (this.conversationId) {
//               this.showWindow = true
//             }
//             // console.info('stepUpState', this.stepUpState)
//             // if (this.stepUpState === 'pending') {
//             //   this.stepUpConversation()
//             // }
//             // const authCheck = await this.stepUpCheck()
//             // if (authCheck) {
//             //   this.stepUpConversation()
//             // }
//           }, 100)
//         }
//       }
//     },
//     subscribeToDialog (UNAUTH_CONVERSATIONID: string | null) {
//       const conversationId = UNAUTH_CONVERSATIONID || this.conversationId
//       if ((!conversationId || !this.dialog) && !UNAUTH_CONVERSATIONID) return
//       const dialogId = this.dialog?.dialogId || conversationId || UNAUTH_CONVERSATIONID
//       if (this.subscribed[dialogId]) return
//       this.subscribed[dialogId] = true
//       this.sendToSocket(UMS.subscribeEvents(conversationId, dialogId))
//       if (this.dialog?.dialogType === 'POST_SURVEY') {
//         this.sendToSocket(UMS.subscribeSurveyEvents(conversationId, this.dialog?.dialogId))
//       }
//     },
//     setConsumerProfile () {
//       // console.info('set consumer profile')
//       const firstname = cache.get('firstName')
//       const lastname = cache.get('lastName')
//       if (!firstname || !lastname) return
//       const profile = {
//         kind: 'req',
//         id: '108,',
//         type: 'userprofile.SetUserProfile',
//         body: {
//           authenticatedData: {
//             lp_sdes: [
//               {
//                 type: 'personal',
//                 personal: {
//                   firstname,
//                   lastname
//                 }
//               }
//             ]
//           }
//         }
//       }
//       this.sendToSocket(profile)
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     async uploadFile (body: any) {
//       const file = this.file
//       const formData = this.formData
//       if (!file || !formData) {
//         throw new Error('No file found')
//       }
//       if (!body) {
//         throw new Error('no request body found')
//       }
//       const { relativePath, queryParams } = body

//       const { temp_url_sig: sig, temp_url_expires: exp } = queryParams
//       if (!sig || !exp) {
//         throw new Error('No signature or expiry found')
//       }
//       const domain: string | null = this.services.swift ? String(this.services.swift) : null
//       if (!domain) {
//         throw new Error('No swift domain found')
//       }
//       const uploadUrl = `https://${domain}${relativePath}?temp_url_sig=${sig}&temp_url_expires=${exp}`
//       // PUT file to swift
//       console.info('uploading file to swift', uploadUrl)

//       try {
//         if (!this.siteId) {
//           throw new Error('No accountId found')
//         }
//         const actionKey = ACTION_KEYS_MESSAGING.UPLOAD_FILE
//         const url = MESSAGING_ROUTES.UPLOAD_FILE(this.siteId)
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const { data } = await ApiService.put<any>(url, formData, actionKey, {
//           'Content-Type': 'multipart/form-data',
//           sig,
//           exp,
//           size: file.size,
//           relativepath: relativePath,
//           domain
//         })
//         // publishUpload (caption: string, relativePath: string, fileType: string, preview: string) {
//         // const size = file.size
//         const type = file.type.split('/')[1].toUpperCase()
//         const dialog = this.dialog
//         this.sendToSocket(UMS.publishUpload(file.name,
//           relativePath,
//           type,
//           this.imagePreview,
//           dialog?.dialogId || this.conversationId,
//           this.conversationId
//         ))
//         return data
//       } catch (error) {
//         throw ErrorService.handleRequestError(error)
//       }
//     },
//     processResponse (event: { data: string }) {
//       const { sendMessage, getUserProfile, subscribeToConversations, setConsumerProfile } = this
//       const generateSecureFormURL = this.generateSecureFormURL
//       const publishCoBrowseInvite = this.publishCoBrowseInvite
//       const publishCobrowseClose = this.publishCobrowseClose
//       const cobrowseMetadata = this.coBrowseMetadata
//       const uploadFile = this.uploadFile
//       const data = JSON.parse(event.data)
//       const { type, body, code, reqId } = data
//       // eslint-disable-next-line @typescript-eslint/no-this-alias
//       const ctx = this
//       // TODO:: call action based on type
//       // if (reqId?.includes('consumer_')) {
//       //   this.msgReceivedTrigger = Math.random()
//       // }

//       // if (isSecureFormRequest(reqId)) {
//       //   const invitationId = reqId.replace(/secure-form-submit-/gmi, '')
//       //   this.setSecureForm(this, invitationId, {
//       //     submitted: true,
//       //     submitSuccess: code === 200
//       //   })
//       // }

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       if (body.changes && body.changes.find((x: any) => !!x.event) && this.messagesCount === 0) {
//         this.messagesCount = MSG.getMessageCount(body.changes)
//       }
//       console.info('RESPONSE_CODES.INIT_CONNECTION', RESPONSE_CODES.INIT_CONNECTION)
//       switch (reqId) {
//         case RESPONSE_CODES.GET_CLOCK_RESPONSE:
//           // console.info('clock response')
//           break
//         case RESPONSE_CODES.INIT_CONNECTION:
//           if (code === 200) {
//             getUserProfile()
//           }
//           break
//         case RESPONSE_CODES.GET_USER_PROFILE:
//           // console.info('user profile')
//           if (code === 200) {
//             this.consumerId = body.userId
//             const CONSUMER_CONVERSATION = localStorage.getItem(`CONSUMER_CONVERSATION_${this.consumerId}`)
//             if (CONSUMER_CONVERSATION) {
//               // subscribe to conversation
//             } else {
//               subscribeToConversations()
//             }
//           }
//           break
//         case RESPONSE_CODES.SUBSCRIBE_EX_CONVERSATIONS:
//           // console.info('subscribed to conversations')
//           // console.info(body)
//           break
//         case RESPONSE_CODES.UPDATE_CONVERSATION_FIELD_STEP_UP_AUTHENTICATION:
//           // console.info('step up auth')
//           break
//           // UpdateConversationField
//         case RESPONSE_CODES.UPDATE_CONVERSATION_FIELD_CLOSE_CONVERSATION:
//           break
//         case RESPONSE_CODES.SUBSCRIBE_MESSAGING_EVENTS:
//           break
//         case RESPONSE_CODES.UPDATE_CONVERSATION_FIELD:
//           // console.info('update conversation field')
//           this.messages = []
//           this.stage = null
//           // this.triggerNextConversation = Math.random()
//           if (this.dialog?.dialogType === 'POST_SURVEY') {
//             // this.resetState()
//           }
//           break
//         case RESPONSE_CODES.REQUEST_CONVERSATION:
//           if (code === 200) {
//             if (!this.useAnonymous) setConsumerProfile()
//             localStorage.removeItem('secureForms')
//             setTimeout(function () {
//               if (ctx.firstMessage) {
//                 sendMessage(ctx.firstMessage)
//                 ctx.firstMessage = null
//               }
//             }, 1000)
//           }
//           break
//         default:
//           break
//       }

//       const OPEN: Change = MSG.findOpenStageDialog(body)
//       this.openDialog = OPEN
//       switch (type) {
//         case UMS_TYPES.UPLOAD_TOKEN_RESONSE:
//           generateSecureFormURL(body.token, reqId)
//           break
//         case UMS_TYPES.CONVERSATION_CHANGE_NOTIFICATION:
//           if (!OPEN) {
//             /* subscribed but no existing conversations */
//             this.messages = []
//             this.setConversationId(null)
//             this.isSubscribed = true
//             setTimeout(() => {
//               this.isSubscribed = true
//               this.messages = []
//               this.stage = null
//               // this.resetState()
//             }, 100)
//           }
//           if (this.stepUpState === 'pending') {
//             this.stepUpConversation()
//           }
//           // body.changes.forEach((change: Change) => {
//           //   if (change?.result?.convId && change?.result?.conversationDetails?.stage === STAGES.CLOSE) {
//           //     cache.remove(`consumer_id_${change.result.convId}`)
//           //     const storeConvid = cache.get('conversationId')
//           //     if (storeConvid === change.result.convId) {
//           //       cache.remove('conversationId')
//           //     }
//           //   }
//           // })
//           if (OPEN) {
//             this.isSubscribed = true
//             if (this.conversationId) {
//               this.showWindow = true
//             }
//             const conversationId = OPEN.result.convId || this.conversationId
//             if (conversationId !== this.conversationId) this.messages = []
//             console.info('setConversationId', conversationId)
//             this.setConversationId(conversationId)
//             if (this.USER_TYPE === USER_TYPES.UNAUTHENTICATED) {
//               // this.UNAUTH_CONVERSATIONID = conversationId
//               // localStorage.setItem('UNAUTH_CONVERSATIONID', conversationId)
//             }
//             // this.emit('event', {
//             //   type: 'conversationId',
//             //   conversationId
//             // })
//             // UMS.conversationId = conversationId
//             this.lastConversationId = conversationId
//             localStorage.setItem('lastConversationId', conversationId)

//             const { conversationDetails: CD } = OPEN.result
//             this.setStage(CD.stage)
//             /* find open dialog for conversation (!== other === conversation dialog) */
//             const openDialog = CD.dialogs.find(
//               (d: {
//                 state: string; dialogType: string
//               }) => d.state === CONVERSATION_STATES.OPEN &&
//               d.dialogType !== DIALOG_TYPES.OTHER)
//             this.dialog = openDialog

//             if (this.dialog) {
//               this.subscribeToDialog(conversationId)
//             }
//             const coBrowseDialog = MSG.cobrowseDialog(CD.dialogs)
//             console.info('coBrowseDialog', !!coBrowseDialog, !!cobrowseMetadata, this.coBrowseMetadata)
//             if (coBrowseDialog) {
//               publishCoBrowseInvite(data, coBrowseDialog)
//             } else if (cobrowseMetadata) {
//               publishCobrowseClose()
//             }

//             // if (!CD.dialogs.find((x: { channelType: string; state: string }) => x.channelType === 'COBROWSE' && x.state === 'OPEN')) {
//             //   // TODO: COBROWSE
//             //   publishCobrowseClose()
//             // }
//             // this.otherDialog = otherDialog

//             CD.participants.forEach((participant: {
//               id: string; role: string | number
//             }) => {
//               const USER = this.users.find((user: { pid: string }) => user.pid === participant.id) || {}
//               this.participants[participant.role] = { ...participant, ...USER }
//             })

//             try {
//               if (!this.subscribed[this.dialog.dialogType]) this.subscribeToDialog(conversationId)
//             } catch (error) {
//             }
//           }
//           break
//         case UMS_TYPES.MESSAGING_EVENT_NOTIFICATION:
//           if (!body.changes || body.changes.length === 0) {
//             this.isSubscribed = true
//             if (this?.dialog?.dialogType === 'POST_SURVEY') {
//               // this.endConversation()
//             }
//           } else {
//             this.isSubscribed = true
//             this.processEvents(body.changes)
//           }
//           break
//         case UMS_TYPES.FILE_UPLOAD_RESPONSE:
//           console.info('file upload response', body)
//           /*
//           {
//           "kind": "resp",
//           "reqId": "1",
//           "code": 200,
//           "body": {
//           "relativePath": "",
//           "queryParams": {
//           "temp_url_sig": "12345",
//           "temp_url_expires": "1234"
//           }
//           },
//           "type": "ms.GenerateURLResponse"
//           }
//           */
//           // extract relativePath, temp_url_sig, temp_url_expires
//           uploadFile(body)
//           break
//         default:
//           break
//       }
//     },
//     async connectToUMS () {
//       if (this.UMSConnected) {
//         return
//       }
//       const { siteId } = this
//       if (!siteId) { throw new Error('No siteId found') }
//       await this.getConnectors()
//       const jwt = await this.getConversationJwt()
//       if (!jwt) { throw new Error('No jwt found') }
//       const domain: string | null = this.services.asyncMessagingEnt ? String(this.services.asyncMessagingEnt) : null
//       if (!domain) { throw new Error('No domain found') }
//       const getClock = this.getClock
//       const sendToSocket = this.sendToSocket
//       const processResponse = this.processResponse
//       const connect = this.connectToUMS
//       const socket = new WebSocket(MESSAGING_ROUTES.UMS(domain, siteId))
//       this.socket = socket
//       if (!socket) {
//         throw new Error('No socket found')
//       }
//       try {
//         if (socket) {
//           console.info('socket already exists')
//           socket.onopen = function () {
//             getClock()
//             sendToSocket(UMS.initRequest(jwt))
//           }
//           socket.onmessage = function (event) {
//             processResponse(event)
//           }
//           socket.onerror = function () {
//             // console.warn(event)
//             if (socketConnectRetries > 0) {
//               socketConnectRetries--
//               setTimeout(() => {
//                 connect()
//               }, 2000)
//             }
//           }
//           socket.onclose = (r) => {
//             // console.log(r)
//             // console.log(r.reason)
//             if (r.reason.includes('nection timed out')) {
//               if (socketConnectRetries > 0) {
//                 // console.info('trying again to open socket')
//                 socketConnectRetries--
//                 connect()
//               }
//             } else if (r.reason.includes('ntity token is invalid')) {
//               connect()
//               throw new Error('JWT token is invalid')
//             }
//           }
//           return true
//         }
//       } catch (error) {

//       }
//     },
//     sendMessage (message: string) {
//       const {
//         dialog,
//         conversationId,
//         stage,
//         socket
//       } = this
//       const { sendToSocket, requestConversation } = this
//       const dialogId = dialog?.dialogId || conversationId
//       if (!message || !socket) {
//         throw new Error('No message or socket found')
//       }
//       if (stage === STAGES.OPEN && dialog) {
//         const timer = 0
//         setTimeout(() => {
//           sendToSocket(UMS.sendMessage(conversationId, dialogId, message))
//         }, timer)
//       } else {
//         this.firstMessage = message
//         console.info('requesting conversation')
//         requestConversation()
//       }
//     },
//     async requestConversation () {
//       const session = await this.confirmLPSession()
//       const { visitorId, sessionId } = session
//       this.sessionId = sessionId
//       this.visitorId = visitorId
//       const skillId = this?.skill?.id || this.skillId
//       const campaignId = this?.campaign?.id
//       const engagementId = this?.engagement?.id
//       if (!skillId || !sessionId || !visitorId || !this.socket) {
//         throw new Error('missing attributes to start new conversation')
//       }

//       const config = UMS.newConversation(skillId, visitorId, sessionId, campaignId, engagementId)
//       this.sendToSocket(config)
//     },
//     async confirmLPSession (): Promise<Isession> {
//       console.info('confirming session')
//       if (this.sessionId && this.visitorId) {
//         return {
//           sessionId: this.sessionId,
//           visitorId: this.visitorId
//         }
//       } else {
//         const session: Isession | null = await MSG.getLPSession()
//         return session || { visitorId: null, sessionId: null }
//       }
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     closeConversation (closeStage?: any) {
//       console.info('close conversation')
//       const { conversationId, stage } = this
//       const dialogId = this.dialog?.dialogId || conversationId
//       this.isSubscribed = false
//       // this.UMS.stepUpMessageSent = false
//       this.messages = []
//       if (closeStage && stage === 'OPEN') {
//         try {
//           this.sendToSocket(UMS.closeConversation(conversationId))
//           this.conversationId = null
//           // this.resetState()
//           this.setStage(null)
//           setTimeout(() => {
//             this.setStage('CLOSE')
//             // this.closeConnection()
//           }, 100)
//         } catch (error) {
//           // this.setState(true)
//         }
//       } else {
//         try {
//           this.sendToSocket(UMS.closeDialog(conversationId, dialogId))
//         } catch (error) {
//           // this.setState()
//         }
//       }
//     },
//     async clearHistory () {
//       this.closeConversation()
//       setTimeout(() => {
//         this.getUnauthToken()
//       }, 1000)
//       // clear all records from local storage that start with 'CONSUMER_ID' or 'consumer_id'
//       // const keys = Object.keys(localStorage)
//       // keys.forEach((key: string) => {
//       //   if (key.startsWith('CONSUMER_ID') || key.startsWith('consumer_id')) {
//       //     localStorage.removeItem(key)
//       //   }
//       // })
//     },
//     /* FILE SHARING FUNCTIONS */
//     async generateUploadToken  (change: MessagingEvent) {
//       const {
//         dialogId,
//         messageAudience
//       } = change
//       const { formId, invitationId, title } = (change.event as ContentEvent).message as SecureFormMessage
//       /* use stored invitation details if already set */
//       const invitation = this.secureForms[invitationId]
//       if (invitation?.url) {
//         this.postSecureFormMesage(invitationId)
//         return
//       }
//       /* set invitation detail in state */
//       this.setSecureForm(invitationId, change)
//       this.updateSecureFormCache(invitationId, change)
//       // this.secureForms[invitationId] = change
//       // secureFormUploadToken (formId: string, invitationId: string, dialogId: string) {
//       this.sendToSocket(UMS.secureFormUploadToken(formId, invitationId, dialogId))
//       // if (messageAudience !== 'ALL') return
//     },
//     async postSecureFormMesage (id: string | number) {
//       console.info('postSecureFormMesage')
//       const change = this.secureForms[id]
//       if (!change) {
//         console.info(id, this.secureForms)
//         console.error('cannot find secure form data')
//         return
//       }
//       const {
//         conversationId,
//         dialogId,
//         messageAudience,
//         originatorMetadata,
//         serverTimestamp,
//         originatorId,
//         sequence,
//         url
//         // submitted
//       } = change

//       console.info(change)

//       const { formId, invitationId, title } = change.event.message
//       console.info('mark_05', formId, invitationId, title)
//       const isAgent = originatorMetadata.role === 'ASSIGNED_AGENT'
//       if (isAgent) {
//         this.agentId = originatorMetadata.id
//         this.awaitNextScriptMessage('postSecureFormMesage')
//       }
//       const agent = isAgent ? await this.getUserById(originatorMetadata.id) : null
//       if (originatorMetadata.role === 'ASSIGNED_AGENT') {
//         // TODO:: something...
//       }

//       const from = agent ? agent.nickname : originatorMetadata.role
//       const expired = serverTimestamp + this.secureFormTimeout < Date.now()
//       const cached = this.secureFormCache[invitationId] = this.secureFormCache[invitationId] || {}
//       const submitted = !!cached.submissionId
//       console.info(`submitted: ${submitted}`)

//       const foundChange = this.messages.find((x: ClientMessage) => x.invitationId === invitationId)
//       // const foundChange = this.secureForms[invitationId]
//       console.info('mark_06', invitationId, foundChange, this.messages)
//       if (foundChange) {
//         console.info('mark_07', 'foundChange')
//         const message = title ? `:You have submitted secure form: ${title}` : 'You have submitted a secure form'
//         const text = submitted ? message : expired ? 'secure form has expired' : `${from} has sent you a Secure Form:`
//         // update existing message
//         foundChange.submitted = submitted
//         foundChange.expired = expired
//         foundChange.text = text
//         this.$patch({ messages: this.messages })
//         return
//       }

//       // const title = clientMessage?.title || invitation?.event?.message?.title
//       const message = title ? `You have submitted secure form: ${title}` : 'You have submitted a secure form'
//       const text = submitted ? message : expired ? `secure form "${title}" has expired` : `${from} has sent you a Secure Form:`
//       const payload = {
//         serverTimestamp,
//         uid: sequence + '-' + dialogId,
//         expired: serverTimestamp + this.secureFormTimeout < Date.now(),
//         originatorId,
//         role: originatorMetadata.role,
//         conversationId,
//         dialogId,
//         status: 'SENT',
//         title,
//         invitationId,
//         submitted,
//         text,
//         url,
//         sequence,
//         from,
//         type: 'secure form request',
//         isReplies: false
//       }
//       this.$patch({ messages: [...this.messages, payload] })
//       // this.emit('messages', this.messages)
//     },
//     updateSecureFormCache (invitationId: string, change: MessagingEvent) {
//       const contentEvent = change.event as ContentEvent
//       const message = contentEvent.message as SecureFormMessage
//       this.secureFormCache[invitationId] = this.secureFormCache[invitationId] || {}
//       this.secureFormCache[invitationId].formId = message.formId
//       this.secureFormCache[invitationId].title = message.title
//       this.secureFormCache[invitationId].submissionId = message.submissionId
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     setSecureForm (invitationId: string, params: any) {
//       console.info('setSecureForm')
//       const sf = localStorage.getItem('secureForms')
//       const secureForms = sf ? JSON.parse(sf) : {}
//       secureForms[invitationId] = secureForms[invitationId] || {}
//       Object.keys(params).forEach(p => {
//         secureForms[invitationId][p] = params[p]
//       })
//       this.secureForms = secureForms
//       localStorage.setItem('secureForms', JSON.stringify(secureForms))
//     },
//     async generateSecureFormURL (a: { readOtk: string; writeOtk: string }, invitationId: string) {
//       console.info('generateSecureFormURL')
//       // const { secureForminvitationId: invitationId } = this
//       const invitation = this.secureForms[invitationId]
//       if (invitation?.url) {
//         this.postSecureFormMesage(invitationId)
//         return
//       }
//       const { readOtk: secureFormReadOtk, writeOtk: secureFormWriteOtk } = a
//       const url = MSG.generateSecureFormURL(invitationId, secureFormWriteOtk, secureFormReadOtk)
//       console.warn('secure form url', url, invitationId, secureFormWriteOtk, secureFormReadOtk)

//       // this.secureFormURL = url
//       this.setSecureForm(invitationId, { url })
//       // this.secureForms[invitationId].url = url
//       this.postSecureFormMesage(invitationId)
//     },
//     submitSecureForm (submissionId: string, invitationId: string) {
//       const { conversationId, dialog } = this
//       const { dialogId } = dialog
//       this.sendToSocket(
//         UMS.secureFormSubmit(dialogId, conversationId, submissionId, invitationId)
//       )
//       const idx = this.messages.findIndex((x: ClientMessage) => x.invitationId === invitationId)
//       if (idx >= 0) {
//         this.messages[idx].submitted = true
//       }
//     },
//     requestFileUpload (body: FormData, file: File, dataImage: string, imagePreview: string) {
//       this.formData = body
//       this.file = file
//       this.dataImage = dataImage
//       this.imagePreview = imagePreview
//       const size = file.size
//       const type = file.type.split('/')[1].toUpperCase()
//       this.sendToSocket(UMS.requestFileUpload(size, type))
//     },
//     /* CO_BROWSE FUNCTIONS */
//     async publishCobrowseClose () {
//       const mode = this.coBrowseMetadata.mode // COBROWSE, VIDEO_CALL, VOICE_CALL
//       const m = mode === COBROWSE_TYPE.VIDEO_CALL ? 'video call' : COBROWSE_TYPE.VOICE_CALL ? 'voice call' : 'cobrowse session'
//       this.messages.push({
//         serverTimestamp: Date.now(),
//         timeLocal: Date.now(),
//         uid: shortUUID(),
//         status: 'SENT',
//         type: 'cobrowse_ended',
//         message: `your ${m} has ended`
//       })
//       console.info('closing co browse')
//       this.cobrowseOfferBy = null
//       this.offerCobrowse = false
//       this.metadata = null
//       this.coBrowseMetadata = null
//       this.coBrowseExpired = false
//       this.isCobrowseSession = false
//       this.cobrowseMode = null
//     },
//     async publishCoBrowseInvite (event: MessagingEventNotification, dialog: Dialog) {
//       const cobrowseMetadata = dialog.metaData as CobrowseMetadata
//       this.coBrowseMetadata = cobrowseMetadata

//       const { conversationId } = this
//       const {
//         sentTs: serverTimestamp
//       } = event.body

//       const expired = Number((cobrowseMetadata.expires * 1000).toFixed(0)) < Date.now()
//       console.info('expired', expired, cobrowseMetadata.expires, Date.now())
//       this.coBrowseExpired = expired

//       // export const publishCobrowseOffered = (serviceId: string, p: any, sessionId: string, visitorId: string, mode: string,
//       // const isVideo = cobrowseMetadata.mode === COBROWSE_TYPE.VIDEO_CALL
//       // const isVoice = cobrowseMetadata.mode === COBROWSE_TYPE.VOICE_CALL
//       const assignedAgent = this.participants[PARTICPANT_ROLES.ASSIGNED_AGENT]
//       MSG.publishCobrowseOffered(cobrowseMetadata.serviceId, assignedAgent?.id, this.sessionId, this.visitorId, cobrowseMetadata.mode)

//       this.messages.push({
//         serverTimestamp,
//         timeLocal: serverTimestamp,
//         uid: shortUUID(),
//         conversationId,
//         dialogId: dialog.dialogId,
//         status: 'SENT',
//         type: 'cobrowse_request',
//         expired,
//         cobrowseMetadata
//       })
//       this.setMessages(this.messages)
//       // this.emit('messages', this.messages)
//     },
//     async acceptCobrowseInvitation  () {
//       const { coBrowseMetadata: cm } = this
//       const { serviceId } = cm
//       const { visitorId: svid, sessionId: ssid } = this
//       const { participants: p } = this
//       // export const publishCobrowseAccept = (serviceId: string, p: any, ssid: string, svid: string) => {
//       MSG.publishCobrowseAccept(serviceId, p, ssid, svid)
//       this.isCobrowseSession = true
//       console.warn(this.cobrowseMode)
//       if (this.cobrowseMode !== 'VIDEO_CALL' && this.cobrowseMode !== 'VOICE_CALL') {
//         this.offerCobrowse = false
//         this.cobrowseMeta = null
//         console.info(this.cobrowseMode)
//         // this.emit('event', {
//         //   type: 'clearCobrowse'
//         // })
//       }

//       const mode = this.coBrowseMetadata.mode // COBROWSE, VIDEO_CALL, VOICE_CALL      //
//       const m = mode === COBROWSE_TYPE.VIDEO_CALL ? 'video call' : COBROWSE_TYPE.VOICE_CALL ? 'voice call' : 'cobrowse session'
//       this.messages.push({
//         serverTimestamp: Date.now(),
//         timeLocal: Date.now(),
//         uid: shortUUID(),
//         status: 'SENT',
//         type: 'cobrowse_accepted',
//         message: `you have accepted a ${m}`
//       })
//       this.setMessages(this.messages)
//     },
//     async rejectCobrowseInvitation () {
//       const { cobrowseMeta: cm } = this
//       const { serviceId } = cm
//       const { visitorId: svid, sessionId: ssid } = this.session
//       const { participants: p } = this
//       MSG.publishCobrowseReject(serviceId, p, ssid, svid)
//       this.offerCobrowse = false
//       this.cobrowseMeta = null
//       // this.emit('event', {
//       //   type: 'clearCobrowse'
//       // })
//       this.messages.push({
//         serverTimestamp: Date.now(),
//         timeLocal: Date.now(),
//         uid: shortUUID(),
//         status: 'SENT',
//         type: 'cobrowse_declined'
//       })
//       this.setMessages(this.messages)
//     }
//     /* AUTH AND STEP UP */
//   }
// })
