/**
 * Messaging History Module
 * Aggregates all Messaging History (Interactions) API modules
 * Domain: msgHist
 */

import { Module } from '@nestjs/common';
import { ConversationsModule } from './conversations/conversations.module';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [
    LPSharedModule,
    ConversationsModule,
  ],
  exports: [
    ConversationsModule,
  ],
})
export class MessagingHistoryModule {}
