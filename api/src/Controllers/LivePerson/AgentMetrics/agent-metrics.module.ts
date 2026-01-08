/**
 * Agent Metrics Module
 * NestJS module for LivePerson Agent Metrics (Operational Realtime) API
 */

import { Module } from '@nestjs/common';
import { AgentMetricsController } from './agent-metrics.controller';
import { AgentMetricsService } from './agent-metrics.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AgentMetricsController],
  providers: [AgentMetricsService],
  exports: [AgentMetricsService],
})
export class AgentMetricsModule {}
