/**
 * Automatic Messages Module
 * NestJS module for Automatic Messages API
 */

import { Module } from '@nestjs/common';
import { AutomaticMessagesController } from './automatic-messages.controller';
import { AutomaticMessagesService } from './automatic-messages.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AutomaticMessagesController],
  providers: [AutomaticMessagesService],
  exports: [AutomaticMessagesService],
})
export class AutomaticMessagesModule {}
