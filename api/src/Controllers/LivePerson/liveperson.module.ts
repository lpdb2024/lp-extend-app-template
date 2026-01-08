/**
 * LivePerson Root Module
 * Main module that aggregates all LivePerson domain modules
 */

import { Module } from '@nestjs/common';
import { LPSharedModule } from './shared/shared.module';
import { AccountConfigModule } from './AccountConfig/account-config.module';
import { MessagingHistoryModule } from './MessagingHistory/messaging-history.module';
import { MessagingOperationsModule } from './MessagingOperations/messaging-operations.module';
import { KeyMessagingMetricsModule } from './KeyMessagingMetrics/key-messaging-metrics.module';
import { AgentActivityModule } from './AgentActivity/agent-activity.module';
import { ActualHandleTimeModule } from './ActualHandleTime/actual-handle-time.module';
import { NetHandleTimeModule } from './NetHandleTime/net-handle-time.module';
import { AgentMetricsModule } from './AgentMetrics/agent-metrics.module';
import { MessageRoutingModule } from './MessageRouting/message-routing.module';
import { ProactiveMessagingModule } from './ProactiveMessaging/proactive-messaging.module';
import { ConnectToMessagingModule } from './ConnectToMessaging/connect-to-messaging.module';
import { ConnectorModule } from './Connector/connector.module';
import { OutboundReportingModule } from './OutboundReporting/outbound-reporting.module';
import { MessagingRestModule } from './MessagingRest/messaging-rest.module';
import { PromptsModule } from './Prompts/prompts.module';
import { ConversationOrchestratorModule } from './ConversationOrchestrator/conversation-orchestrator.module';
import { FaaSModule } from './FaaS/faas.module';

// Future imports as we build them:
// import { EngagementHistoryModule } from './EngagementHistory/engagement-history.module';
// import { LoginModule } from './Login/login.module';

@Module({
  imports: [
    LPSharedModule,
    AccountConfigModule,
    MessagingHistoryModule,
    MessagingOperationsModule,
    MessagingRestModule,
    KeyMessagingMetricsModule,
    AgentActivityModule,
    ActualHandleTimeModule,
    NetHandleTimeModule,
    AgentMetricsModule,
    MessageRoutingModule,
    ProactiveMessagingModule,
    ConnectToMessagingModule,
    ConnectorModule,
    OutboundReportingModule,
    PromptsModule,
    ConversationOrchestratorModule,
    FaaSModule,
    // Add more domain modules here as they are implemented:
    // EngagementHistoryModule,
    // LoginModule,
  ],
  exports: [
    LPSharedModule,
    AccountConfigModule,
    MessagingHistoryModule,
    MessagingOperationsModule,
    MessagingRestModule,
    KeyMessagingMetricsModule,
    AgentActivityModule,
    ActualHandleTimeModule,
    NetHandleTimeModule,
    AgentMetricsModule,
    MessageRoutingModule,
    ProactiveMessagingModule,
    ConnectToMessagingModule,
    ConnectorModule,
    OutboundReportingModule,
    PromptsModule,
    ConversationOrchestratorModule,
    FaaSModule,
    // Export all domain modules
  ],
})
export class LivePersonModule {}
