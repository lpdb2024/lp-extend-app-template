/**
 * Visitor Profiles Module
 * NestJS module for LivePerson Visitor Profiles API
 */

import { Module } from '@nestjs/common';
import { VisitorProfilesController } from './visitor-profiles.controller';
import { VisitorProfilesService } from './visitor-profiles.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [VisitorProfilesController],
  providers: [VisitorProfilesService],
  exports: [VisitorProfilesService],
})
export class VisitorProfilesModule {}
