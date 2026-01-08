/**
 * User Settings Controller
 * REST API endpoints for user-level settings (not tied to LP account)
 * These settings are tied to the Firebase user ID
 */

import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';
import { IsString, IsOptional, IsObject } from 'class-validator';

class GithubSettingsDto {
  @IsString()
  pat: string;

  @IsString()
  repo: string;

  @IsString()
  @IsOptional()
  branch?: string;
}

class UpdateUserSettingsDto {
  @IsObject()
  @IsOptional()
  github?: GithubSettingsDto;
}

@ApiTags('User Settings')
@Controller('api/v2/user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get(':userId')
  @ApiOperation({
    summary: 'Get user settings',
    description: 'Retrieves settings for a specific user (identified by Firebase UID)',
  })
  @ApiParam({ name: 'userId', description: 'Firebase user ID (UID)' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getUserSettings(
    @Param('userId') userId: string,
  ): Promise<any> {
    return this.userSettingsService.getUserSettings(userId);
  }

  @Put(':userId')
  @ApiOperation({
    summary: 'Update user settings',
    description: 'Updates settings for a specific user. Performs atomic merge.',
  })
  @ApiParam({ name: 'userId', description: 'Firebase user ID (UID)' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateUserSettings(
    @Param('userId') userId: string,
    @Body() body: UpdateUserSettingsDto,
  ): Promise<any> {
    return this.userSettingsService.updateUserSettings(userId, body);
  }

  @Get(':userId/github')
  @ApiOperation({
    summary: 'Get GitHub settings',
    description: 'Retrieves GitHub-specific settings for a user',
  })
  @ApiParam({ name: 'userId', description: 'Firebase user ID (UID)' })
  @ApiResponse({ status: 200, description: 'GitHub settings retrieved' })
  async getGithubSettings(
    @Param('userId') userId: string,
  ): Promise<GithubSettingsDto | null> {
    const settings = await this.userSettingsService.getUserSettings(userId);
    return settings?.github || null;
  }

  @Put(':userId/github')
  @ApiOperation({
    summary: 'Update GitHub settings',
    description: 'Updates GitHub-specific settings for a user',
  })
  @ApiParam({ name: 'userId', description: 'Firebase user ID (UID)' })
  @ApiResponse({ status: 200, description: 'GitHub settings updated' })
  async updateGithubSettings(
    @Param('userId') userId: string,
    @Body() body: GithubSettingsDto,
  ): Promise<any> {
    return this.userSettingsService.updateUserSettings(userId, { github: body });
  }
}
