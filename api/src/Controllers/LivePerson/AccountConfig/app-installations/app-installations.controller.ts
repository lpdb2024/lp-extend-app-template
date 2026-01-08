/**
 * App Installations Controller
 * REST API endpoints for LivePerson App Installations
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { AppInstallationsService } from './app-installations.service';
import {
  CreateAppInstallationDto,
  UpdateAppInstallationDto,
  AppInstallationsQueryDto,
  AppInstallationsResponseDto,
  AppInstallationResponseDto,
} from './app-installations.dto';

@ApiTags('Account Config - App Installations')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/app-installations')
export class AppInstallationsController {
  constructor(private readonly appInstallationsService: AppInstallationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all app installations',
    description: 'Retrieves all installed applications for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of app installations', type: AppInstallationsResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AppInstallationsQueryDto,
  ): Promise<AppInstallationsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.appInstallationsService.getAll(accountId, token, {
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
    description: 'Gets the current revision for app installations',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
    const revision = await this.appInstallationsService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':appId')
  @ApiOperation({
    summary: 'Get app installation by ID',
    description: 'Retrieves a single app installation by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'appId', description: 'App installation ID (client_id)' })
  @ApiResponse({ status: 200, description: 'The app installation', type: AppInstallationResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') authorization: string,
  ): Promise<AppInstallationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.appInstallationsService.getById(accountId, appId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create app installation',
    description: 'Creates a new app installation (OAuth client)',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'App installation created', type: AppInstallationResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateAppInstallationDto,
  ): Promise<AppInstallationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.appInstallationsService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':appId')
  @ApiOperation({
    summary: 'Update app installation',
    description: 'Updates an existing app installation by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'appId', description: 'App installation ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'App installation updated', type: AppInstallationResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateAppInstallationDto,
  ): Promise<AppInstallationResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.appInstallationsService.update(accountId, appId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':appId/enable')
  @ApiOperation({
    summary: 'Enable app installation',
    description: 'Enables an app installation',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'appId', description: 'App installation ID to enable' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  async enable(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<AppInstallationResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required');
    }

    const response = await this.appInstallationsService.enable(accountId, appId, token, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':appId/disable')
  @ApiOperation({
    summary: 'Disable app installation',
    description: 'Disables an app installation',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'appId', description: 'App installation ID to disable' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  async disable(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<AppInstallationResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required');
    }

    const response = await this.appInstallationsService.disable(accountId, appId, token, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':appId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete app installation',
    description: 'Deletes an app installation by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'appId', description: 'App installation ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'App installation deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.appInstallationsService.remove(accountId, appId, token, revision);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
