/**
 * Proactive Messaging Module
 * NestJS module for LivePerson Proactive Messaging API
 * Domain: proactive (computed from region)
 */

import { Module } from '@nestjs/common';
import { ProactiveMessagingController } from './proactive-messaging.controller';
import { ProactiveMessagingService } from './proactive-messaging.service';
import { HelperModule } from '../../HelperService/helper-service.module';
import { APIModule } from '../../APIService/api.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [HelperModule, APIModule, UsersModule],
  controllers: [ProactiveMessagingController],
  providers: [ProactiveMessagingService],
  exports: [ProactiveMessagingService],
})
export class ProactiveMessagingModule {}
