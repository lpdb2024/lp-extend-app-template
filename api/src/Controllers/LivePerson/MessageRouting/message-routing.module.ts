/**
 * Message Routing Module
 * NestJS module for LivePerson Message Routing API
 */

import { Module } from '@nestjs/common';
import { MessageRoutingController } from './message-routing.controller';
import { MessageRoutingService } from './message-routing.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [MessageRoutingController],
  providers: [MessageRoutingService],
  exports: [MessageRoutingService],
})
export class MessageRoutingModule {}
