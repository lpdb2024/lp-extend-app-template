/**
 * Agent Groups Module
 * NestJS module for Agent Groups API
 */

import { Module } from '@nestjs/common';
import { AgentGroupsController } from './agent-groups.controller';
import { AgentGroupsService } from './agent-groups.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AgentGroupsController],
  providers: [AgentGroupsService],
  exports: [AgentGroupsService],
})
export class AgentGroupsModule {}
