/**
 * Conversations Module
 * NestJS module for Messaging History Conversations API
 */

import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
