/**
 * Account Features Module
 * NestJS module for LivePerson Account Config Feature Grants API
 */

import { Module } from '@nestjs/common';
import { AccountFeaturesController } from './account-features.controller';
import { AccountFeaturesService } from './account-features.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AccountFeaturesController],
  providers: [AccountFeaturesService],
  exports: [AccountFeaturesService],
})
export class AccountFeaturesModule {}
