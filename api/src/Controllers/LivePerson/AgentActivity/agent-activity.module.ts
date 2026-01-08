/**
 * Agent Activity Module
 * NestJS module for LivePerson Agent Activity API
 */

import { Module } from '@nestjs/common';
import { AgentActivityController } from './agent-activity.controller';
import { AgentActivityService } from './agent-activity.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AgentActivityController],
  providers: [AgentActivityService],
  exports: [AgentActivityService],
})
export class AgentActivityModule {}
