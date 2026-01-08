/**
 * Messaging REST Module
 * NestJS module for LivePerson Messaging REST API (Connector API)
 */

import { Module } from '@nestjs/common';
import { MessagingRestController } from './messaging-rest.controller';
import { MessagingRestService } from './messaging-rest.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [MessagingRestController],
  providers: [MessagingRestService],
  exports: [MessagingRestService],
})
export class MessagingRestModule {}
