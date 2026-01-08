/**
 * Actual Handle Time Module
 * NestJS module for LivePerson Actual Handle Time API
 */

import { Module } from '@nestjs/common';
import { ActualHandleTimeController } from './actual-handle-time.controller';
import { ActualHandleTimeService } from './actual-handle-time.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [ActualHandleTimeController],
  providers: [ActualHandleTimeService],
  exports: [ActualHandleTimeService],
})
export class ActualHandleTimeModule {}
