/**
 * Messaging Operations Module
 * NestJS module for LivePerson Messaging Operations (Real-time) API
 */

import { Module } from '@nestjs/common';
import { MessagingOperationsController } from './messaging-operations.controller';
import { MessagingOperationsService } from './messaging-operations.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [MessagingOperationsController],
  providers: [MessagingOperationsService],
  exports: [MessagingOperationsService],
})
export class MessagingOperationsModule {}
