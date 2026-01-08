/**
 * Connect to Messaging Module
 * NestJS module for LivePerson Connect to Messaging (C2M) API
 */

import { Module } from '@nestjs/common';
import { ConnectToMessagingController } from './connect-to-messaging.controller';
import { ConnectToMessagingService } from './connect-to-messaging.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [ConnectToMessagingController],
  providers: [ConnectToMessagingService],
  exports: [ConnectToMessagingService],
})
export class ConnectToMessagingModule {}
