/**
 * Engagements Module
 * NestJS module for LivePerson Engagements API
 */

import { Module } from '@nestjs/common';
import { EngagementsController } from './engagements.controller';
import { EngagementsService } from './engagements.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [EngagementsController],
  providers: [EngagementsService],
  exports: [EngagementsService],
})
export class EngagementsModule {}
