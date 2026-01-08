/**
 * Account Properties Module
 * NestJS module for LivePerson Account Settings Properties API
 */

import { Module } from '@nestjs/common';
import { AccountPropertiesController } from './account-properties.controller';
import { AccountPropertiesService } from './account-properties.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AccountPropertiesController],
  providers: [AccountPropertiesService],
  exports: [AccountPropertiesService],
})
export class AccountPropertiesModule {}
