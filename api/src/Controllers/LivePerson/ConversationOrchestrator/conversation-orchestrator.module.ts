/**
 * Conversation Orchestrator Module
 * NestJS module for LivePerson Conversation Orchestrator API
 * Domain: coreAIIntent (KB Rules, Bot Rules, Agent Preferences)
 */

import { Module } from '@nestjs/common';
import { ConversationOrchestratorController } from './conversation-orchestrator.controller';
import { ConversationOrchestratorService } from './conversation-orchestrator.service';
import { HelperModule } from '../../HelperService/helper-service.module';
import { APIModule } from '../../APIService/api.module';

@Module({
  imports: [HelperModule, APIModule],
  controllers: [ConversationOrchestratorController],
  providers: [ConversationOrchestratorService],
  exports: [ConversationOrchestratorService],
})
export class ConversationOrchestratorModule {}
