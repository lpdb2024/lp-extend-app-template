/**
 * Account Settings Module
 * Module for account-level settings management
 */

import { Module } from '@nestjs/common';
import { AccountSettingsController } from './account-settings.controller';
import { AccountSettingsService } from './account-settings.service';

@Module({
  controllers: [AccountSettingsController],
  providers: [AccountSettingsService],
  exports: [AccountSettingsService],
})
export class AccountSettingsModule {}
