/**
 * QA Assessment Module
 * NestJS module for QA Assessment application
 */

import { Module } from '@nestjs/common';
import { QAAssessmentController } from './qa-assessment.controller';
import { QAAssessmentService } from './qa-assessment.service';
import { QABatchController } from './qa-batch.controller';
import { QABatchService } from './qa-batch.service';
import { ConversationsModule } from '../LivePerson/MessagingHistory/conversations/conversations.module';
import { AccountSettingsModule } from '../AccountSettings/account-settings.module';
import { HelperModule } from '../HelperService/helper-service.module';

@Module({
  controllers: [QAAssessmentController, QABatchController],
  providers: [QAAssessmentService, QABatchService],
  exports: [QAAssessmentService, QABatchService],
  imports: [ConversationsModule, AccountSettingsModule, HelperModule],
})
export class QAAssessmentModule {}
