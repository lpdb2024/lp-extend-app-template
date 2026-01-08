/**
 * Window Configurations Controller
 * REST API endpoints for LivePerson Window Configurations
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
import { WindowConfigurationsService } from './window-configurations.service';
import {
  WindowConfigurationQueryDto,
  WindowConfigurationCreateDto,
  WindowConfigurationUpdateDto,
  WindowConfigurationResponseDto,
  WindowConfigurationListResponseDto,
} from './window-configurations.dto';

@ApiTags('Window Configurations')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/window-configurations')
export class WindowConfigurationsController {
  constructor(private readonly windowConfigurationsService: WindowConfigurationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all window configurations',
    description: 'Retrieve all window configurations for an account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of window configurations', type: WindowConfigurationListResponseDto })
  async getWindowConfigurations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: WindowConfigurationQueryDto,
  ): Promise<WindowConfigurationListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.windowConfigurationsService.getWindowConfigurations(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get(':windowId')
  @ApiOperation({
    summary: 'Get window configuration by ID',
    description: 'Retrieve a specific window configuration',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'windowId', description: 'Window configuration ID' })
  @ApiResponse({ status: 200, description: 'Window configuration details', type: WindowConfigurationResponseDto })
  async getWindowConfigurationById(
    @Param('accountId') accountId: string,
    @Param('windowId') windowId: string,
    @Headers('authorization') authorization: string,
    @Query() query: WindowConfigurationQueryDto,
  ): Promise<WindowConfigurationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.windowConfigurationsService.getWindowConfigurationById(
      accountId,
      windowId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a window configuration',
    description: 'Create a new window configuration',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Created window configuration', type: WindowConfigurationResponseDto })
  async createWindowConfiguration(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: WindowConfigurationCreateDto,
    @Query() query: WindowConfigurationQueryDto,
  ): Promise<WindowConfigurationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.windowConfigurationsService.createWindowConfiguration(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Put(':windowId')
  @ApiOperation({
    summary: 'Update a window configuration',
    description: 'Update an existing window configuration. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'windowId', description: 'Window configuration ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated window configuration', type: WindowConfigurationResponseDto })
  async updateWindowConfiguration(
    @Param('accountId') accountId: string,
    @Param('windowId') windowId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: WindowConfigurationUpdateDto,
    @Query() query: WindowConfigurationQueryDto,
  ): Promise<WindowConfigurationResponseDto> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    const response = await this.windowConfigurationsService.updateWindowConfiguration(
      accountId,
      windowId,
      token,
      body,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':windowId')
  @ApiOperation({
    summary: 'Delete a window configuration',
    description: 'Delete a window configuration. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'windowId', description: 'Window configuration ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Window configuration deleted' })
  async deleteWindowConfiguration(
    @Param('accountId') accountId: string,
    @Param('windowId') windowId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    await this.windowConfigurationsService.deleteWindowConfiguration(
      accountId,
      windowId,
      token,
      revision,
    );

    return { success: true };
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }

  private extractRevision(ifMatch: string): string {
    if (!ifMatch) {
      throw new BadRequestException('If-Match header is required for this operation');
    }
    return ifMatch;
  }
}
