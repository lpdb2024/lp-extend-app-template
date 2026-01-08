/**
 * LivePerson Module Exports
 * Central export point for all LivePerson interfaces and types
 * Use these exports in Vue frontend for type safety
 */

// Shared interfaces
export * from './shared/lp-common.interfaces';
export * from './shared/lp-constants';

// AccountConfig domain interfaces - Contact Center Management
export * from './AccountConfig/agent-groups/agent-groups.interfaces';
export * from './AccountConfig/skills/skills.interfaces';
export * from './AccountConfig/users/users.interfaces';
export * from './AccountConfig/profiles/profiles.interfaces';
export * from './AccountConfig/lobs/lobs.interfaces';
export * from './AccountConfig/predefined-content/predefined-content.interfaces';
export * from './AccountConfig/automatic-messages/automatic-messages.interfaces';
export * from './AccountConfig/working-hours/working-hours.interfaces';
export * from './AccountConfig/special-occasions/special-occasions.interfaces';

// AccountConfig domain interfaces - Campaign Management
export * from './AccountConfig/campaigns/campaigns.interfaces';
export * from './AccountConfig/engagements/engagements.interfaces';
export * from './AccountConfig/goals/goals.interfaces';
export * from './AccountConfig/visitor-behaviors/visitor-behaviors.interfaces';
export * from './AccountConfig/visitor-profiles/visitor-profiles.interfaces';
export * from './AccountConfig/onsite-locations/onsite-locations.interfaces';
export * from './AccountConfig/window-configurations/window-configurations.interfaces';

// Messaging History domain interfaces
export * from './MessagingHistory/conversations/conversations.interfaces';

// Messaging Operations domain interfaces (Real-time)
export * from './MessagingOperations/messaging-operations.interfaces';

// Key Messaging Metrics domain interfaces (Reporting)
export * from './KeyMessagingMetrics/key-messaging-metrics.interfaces';

// Agent Activity domain interfaces
export * from './AgentActivity/agent-activity.interfaces';

// Actual Handle Time domain interfaces (Beta)
export * from './ActualHandleTime/actual-handle-time.interfaces';

// Net Handle Time domain interfaces (Beta) - Prefixed with NHT to avoid conflicts
export * from './NetHandleTime/net-handle-time.interfaces';

// Agent Metrics domain interfaces (Operational Realtime)
export * from './AgentMetrics/agent-metrics.interfaces';

// Message Routing domain interfaces - exclude ISkillRoutingConfig (conflicts with shared)
export {
  RoutingTaskStatus,
  RoutingPolicyType,
  PriorityLevel,
  RingType,
  IRoutingTask,
  IRoutingPolicy,
  ICreateRoutingTaskRequest,
  IUpdateRoutingTaskRequest,
  IRoutingRuleCondition,
  IRoutingRuleAction,
  IRoutingRule,
  ICreateRoutingRuleRequest,
  IUpdateRoutingRuleRequest,
  ISkillRoutingConfig as IMRSkillRoutingConfig,
  IUpdateSkillRoutingConfigRequest,
  AgentRoutingState,
  IAgentRoutingAvailability,
  IUpdateAgentRoutingStateRequest,
  IQueueEntry,
  IQueueStatus,
  TransferType,
  ITransferRequest,
  ITransferResponse,
  IRoutingTaskResponse,
  IRoutingTasksListResponse,
  IRoutingRuleResponse,
  IRoutingRulesListResponse,
  ISkillRoutingConfigResponse,
  IAgentAvailabilityResponse,
  IAgentsAvailabilityListResponse,
  IQueueStatusResponse,
  IQueuesStatusResponse,
} from './MessageRouting/message-routing.interfaces';

// Proactive Messaging domain interfaces - Prefixed with PM to avoid conflicts
export * from './ProactiveMessaging/proactive-messaging.interfaces';

// Connect to Messaging domain interfaces (IVR/Voice to Messaging) - with aliases
export {
  ChannelType as C2MChannelType,
  ConversationState as C2MConversationState,
  ParticipantRole as C2MParticipantRole,
  ICampaignInfo as IC2MCampaignInfo,
  IConsumerParticipant as IC2MConsumerParticipant,
  IStructuredContentElement as IC2MStructuredContentElement,
  IConversationContext as IC2MConversationContext,
  ISkillRouting as IC2MSkillRouting,
  IConsumerAuth as IC2MConsumerAuth,
  ICreateConversationRequest as IC2MCreateConversationRequest,
  ISendMessageRequest as IC2MSendMessageRequest,
  ICloseConversationRequest as IC2MCloseConversationRequest,
  ITransferConversationRequest as IC2MTransferConversationRequest,
  IConversationDetails as IC2MConversationDetails,
  IMessageDetails as IC2MMessageDetails,
  ICreateConversationResponse as IC2MCreateConversationResponse,
  ISendMessageResponse as IC2MSendMessageResponse,
  ICloseConversationResponse as IC2MCloseConversationResponse,
  ITransferConversationResponse as IC2MTransferConversationResponse,
  IGetConversationResponse as IC2MGetConversationResponse,
  ICapabilityInfo as IC2MCapabilityInfo,
  IGetCapabilitiesResponse as IC2MGetCapabilitiesResponse,
} from './ConnectToMessaging/connect-to-messaging.interfaces';

// Connector API interfaces (Third-party messaging connectors)
export * from './Connector/connector.interfaces';

// Outbound Reporting domain interfaces - with aliases
export {
  OutboundCampaignStatus,
  OutboundMessageStatus,
  CampaignType as OutboundCampaignType,
  MessageChannel,
  SortOrder as OutboundSortOrder,
  IOutboundReportingLink,
  IOutboundTimeframe,
  ICampaignMetrics,
  ICampaignSummary,
  IMessageDelivery,
  ICampaignPerformance,
  IAgentOutboundActivity,
  ISkillOutboundMetrics,
  IOutboundPagination,
  ICampaignListResponse as IOutboundCampaignListResponse,
  ICampaignDetailsResponse as IOutboundCampaignDetailsResponse,
  IMessageDeliveriesResponse,
  ICampaignPerformanceResponse,
  IAgentOutboundActivityResponse,
  ISkillOutboundMetricsResponse,
  ICampaignListQuery as IOutboundCampaignListQuery,
  ICampaignDetailsQuery as IOutboundCampaignDetailsQuery,
  IMessageDeliveriesQuery,
  ICampaignPerformanceQuery,
  IAgentOutboundActivityQuery,
  ISkillOutboundMetricsQuery,
} from './OutboundReporting/outbound-reporting.interfaces';

// Messaging REST API domain interfaces - with aliases for conflicts
export {
  MessageContentType,
  MessageEventType,
  ChatState,
  AcceptStatus,
  ConversationState as MRConversationState,
  CloseReason,
  ParticipantRole as MRParticipantRole,
  IMessageContent,
  ITextMessageContent,
  IStructuredContentMessage,
  IQuickReply as IMRQuickReply,
  IReply,
  IClickAction,
  IAction,
  IActionMetadata,
  IEvent,
  IContentEvent,
  IRichContentEvent,
  IAcceptStatusEvent,
  IChatStateEvent,
  IConsumerInfo,
  IPersonalInfo,
  IAge,
  IContact,
  IAddress,
  IParticipant,
  IConversationContext as IMRConversationContext,
  ISetConversationField,
  ITransferSkillRequest,
  IConversationStateRequest,
  ICreateConversationRequest as IMRCreateConversationRequest,
  ISendMessageRequest as IMRSendMessageRequest,
  ICloseConversationRequest as IMRCloseConversationRequest,
  IUpdateConversationFieldRequest,
  ISubscribeMessagingEventsRequest,
  IUnsubscribeMessagingEventsRequest,
  IGetConsumerProfileRequest,
  IMessagingResponse,
  ICreateConversationResponse as IMRCreateConversationResponse,
  IGetConversationResponse as IMRGetConversationResponse,
  IDialog,
  IParticipantDetail,
  IConsumerProfileResponse,
  IMessagingEventNotification,
  IConversationChange,
  ISendMessageResponse as IMRSendMessageResponse,
  IMessagingErrorResponse,
  IWebSocketParams,
  IWebSocketMessage,
  IGetConversationsQuery,
  IGetConversationQuery,
} from './MessagingRest/messaging-rest.interfaces';

// Future exports as modules are built:
// export * from './EngagementHistory/engagement-history.interfaces';
// export * from './Login/login.interfaces';
// export * from './ConversationalAI/conversation-builder/conversation-builder.interfaces';
// export * from './ConversationalAI/intent-manager/intent-manager.interfaces';
// export * from './ConversationalAI/knowledge-ai/knowledge-ai.interfaces';
