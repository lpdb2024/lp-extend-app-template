/**
 * Profiles Module
 * NestJS module for Profiles API
 */

import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
