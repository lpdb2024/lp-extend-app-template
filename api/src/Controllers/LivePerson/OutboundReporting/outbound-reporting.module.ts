/**
 * Outbound Reporting Module
 * NestJS module for LivePerson Outbound Reporting API
 */

import { Module } from '@nestjs/common';
import { OutboundReportingController } from './outbound-reporting.controller';
import { OutboundReportingService } from './outbound-reporting.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [OutboundReportingController],
  providers: [OutboundReportingService],
  exports: [OutboundReportingService],
})
export class OutboundReportingModule {}
