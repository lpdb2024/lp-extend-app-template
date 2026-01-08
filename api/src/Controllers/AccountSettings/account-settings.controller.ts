/**
 * Account Settings Controller
 * REST API endpoints for account-level settings (tied to LP account ID)
 * Each setting is stored as a separate document with metadata
 */

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AccountSettingsService } from './account-settings.service';
import { IsString, IsOptional } from 'class-validator';
import { AccountSettingDocument } from './account-settings.dto';

class UpsertSettingDto {
  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsString()
  value: string;
}

@ApiTags('Account Settings')
@Controller('api/v2/account-settings')
export class AccountSettingsController {
  constructor(private readonly accountSettingsService: AccountSettingsService) {}

  @Get(':accountId')
  @ApiOperation({
    summary: 'Get all account settings',
    description: 'Retrieves all settings for a specific LP account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getAccountSettings(
    @Param('accountId') accountId: string,
  ): Promise<AccountSettingDocument[]> {
    return this.accountSettingsService.getAccountSettings(accountId);
  }

  @Get(':accountId/:settingName')
  @ApiOperation({
    summary: 'Get a specific setting',
    description: 'Retrieves a specific setting by name for an account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'settingName', description: 'Setting name (e.g., aiStudioProxyFlow)' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  async getSetting(
    @Param('accountId') accountId: string,
    @Param('settingName') settingName: string,
  ): Promise<AccountSettingDocument | null> {
    return this.accountSettingsService.getSettingByName(accountId, settingName);
  }

  @Put(':accountId')
  @ApiOperation({
    summary: 'Create or update a setting',
    description: 'Creates a new setting or updates an existing one',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Setting saved successfully' })
  async upsertSetting(
    @Param('accountId') accountId: string,
    @Body() body: UpsertSettingDto,
    @Headers('x-user-id') userId: string,
  ): Promise<AccountSettingDocument> {
    return this.accountSettingsService.upsertSetting(
      accountId,
      body.name,
      body.label,
      body.value,
      userId || 'unknown',
    );
  }

  @Delete(':accountId/:settingName')
  @ApiOperation({
    summary: 'Delete a setting',
    description: 'Deletes a specific setting by name',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'settingName', description: 'Setting name to delete' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  async deleteSetting(
    @Param('accountId') accountId: string,
    @Param('settingName') settingName: string,
  ): Promise<{ success: boolean }> {
    await this.accountSettingsService.deleteSetting(accountId, settingName);
    return { success: true };
  }
}
