/**
 * Visitor Behaviors Module
 * NestJS module for LivePerson Visitor Behaviors API
 */

import { Module } from '@nestjs/common';
import { VisitorBehaviorsController } from './visitor-behaviors.controller';
import { VisitorBehaviorsService } from './visitor-behaviors.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [VisitorBehaviorsController],
  providers: [VisitorBehaviorsService],
  exports: [VisitorBehaviorsService],
})
export class VisitorBehaviorsModule {}
