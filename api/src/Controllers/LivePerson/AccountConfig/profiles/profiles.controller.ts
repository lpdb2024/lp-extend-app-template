/**
 * Profiles Controller
 * REST API endpoints for LivePerson Profiles
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  ProfilesQueryDto,
  ProfilesResponseDto,
  ProfileResponseDto,
} from './profiles.dto';

@ApiTags('Account Config - Profiles')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all profiles',
    description: 'Retrieves all profiles for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of profiles' })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: ProfilesQueryDto,
    @Req() req: Request,
  ): Promise<ProfilesResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.profilesService.getAll(accountId, token, {
      select: query.select,
      includeDeleted: query.includeDeleted,
    });

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Get('revision')
  @ApiOperation({
    summary: 'Get current revision',
    description: 'Gets the current revision for profiles',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.profilesService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':profileId')
  @ApiOperation({
    summary: 'Get profile by ID',
    description: 'Retrieves a single profile by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'The profile' })
  async getById(
    @Param('accountId') accountId: string,
    @Param('profileId') profileId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<ProfileResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.profilesService.getById(accountId, profileId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create profile',
    description: 'Creates a new profile. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Profile created' })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateProfileDto | CreateProfileDto[],
    @Req() req: Request,
  ): Promise<ProfileResponseDto | ProfilesResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.profilesService.createMany(accountId, token, body as any, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.profilesService.create(accountId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':profileId')
  @ApiOperation({
    summary: 'Update profile',
    description: 'Updates an existing profile by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'profileId', description: 'Profile ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async update(
    @Param('accountId') accountId: string,
    @Param('profileId') profileId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateProfileDto,
    @Req() req: Request,
  ): Promise<ProfileResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.profilesService.update(accountId, profileId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete profile',
    description: 'Deletes a profile by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'profileId', description: 'Profile ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Profile deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('profileId') profileId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.profilesService.remove(accountId, profileId, token, revision);
  }

  /**
   * Extract token from Authorization header or shell auth
   * Supports both direct Bearer auth and shell token auth (via middleware)
   */
  private extractToken(authorization: string, req?: any): string {
    // First check if shell auth provided token via middleware
    if (req?.token?.accessToken) {
      return req.token.accessToken;
    }

    // Fall back to Authorization header
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
