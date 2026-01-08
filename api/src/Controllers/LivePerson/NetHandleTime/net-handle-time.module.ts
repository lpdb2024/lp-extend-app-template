/**
 * Net Handle Time Module
 * NestJS module for LivePerson Net Handle Time API
 */

import { Module } from '@nestjs/common';
import { NetHandleTimeController } from './net-handle-time.controller';
import { NetHandleTimeService } from './net-handle-time.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [NetHandleTimeController],
  providers: [NetHandleTimeService],
  exports: [NetHandleTimeService],
})
export class NetHandleTimeModule {}
