/**
 * Widgets Controller
 * REST API endpoints for LivePerson Widgets (UI Personalization)
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
import { WidgetsService } from './widgets.service';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  WidgetsQueryDto,
  WidgetsResponseDto,
  WidgetResponseDto,
} from './widgets.dto';

@ApiTags('Account Config - Widgets')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/widgets')
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all widgets',
    description: 'Retrieves all widgets for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of widgets', type: WidgetsResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: WidgetsQueryDto,
  ): Promise<WidgetsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.widgetsService.getAll(accountId, token, {
      select: query.select,
      return: query.return,
    });

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Get('revision')
  @ApiOperation({
    summary: 'Get current revision',
    description: 'Gets the current revision for widgets',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
    const revision = await this.widgetsService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':widgetId')
  @ApiOperation({
    summary: 'Get widget by ID',
    description: 'Retrieves a single widget by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'widgetId', description: 'Widget ID' })
  @ApiResponse({ status: 200, description: 'The widget', type: WidgetResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('widgetId') widgetId: string,
    @Headers('authorization') authorization: string,
  ): Promise<WidgetResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.widgetsService.getById(accountId, widgetId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create widget',
    description: 'Creates a new widget',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Widget created', type: WidgetResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateWidgetDto,
  ): Promise<WidgetResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.widgetsService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':widgetId')
  @ApiOperation({
    summary: 'Update widget',
    description: 'Updates an existing widget by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'widgetId', description: 'Widget ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Widget updated', type: WidgetResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('widgetId') widgetId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateWidgetDto,
  ): Promise<WidgetResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.widgetsService.update(accountId, widgetId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':widgetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete widget',
    description: 'Deletes a widget by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'widgetId', description: 'Widget ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Widget deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('widgetId') widgetId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.widgetsService.remove(accountId, widgetId, token, revision);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
