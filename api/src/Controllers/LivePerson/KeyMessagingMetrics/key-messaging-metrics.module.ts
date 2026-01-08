/**
 * Key Messaging Metrics Module
 * NestJS module for LivePerson Key Messaging Metrics API
 */

import { Module } from '@nestjs/common';
import { KeyMessagingMetricsController } from './key-messaging-metrics.controller';
import { KeyMessagingMetricsService } from './key-messaging-metrics.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [KeyMessagingMetricsController],
  providers: [KeyMessagingMetricsService],
  exports: [KeyMessagingMetricsService],
})
export class KeyMessagingMetricsModule {}
