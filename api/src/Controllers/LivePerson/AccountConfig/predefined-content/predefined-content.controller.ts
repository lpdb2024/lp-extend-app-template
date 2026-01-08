/**
 * Predefined Content Controller
 * REST API endpoints for LivePerson Predefined Content (Canned Responses)
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
import { PredefinedContentService } from './predefined-content.service';
import {
  CreatePredefinedContentDto,
  UpdatePredefinedContentDto,
  PredefinedContentQueryDto,
  PredefinedContentListResponseDto,
  PredefinedContentResponseDto,
} from './predefined-content.dto';

@ApiTags('Account Config - Predefined Content')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/predefined-content')
export class PredefinedContentController {
  constructor(private readonly predefinedContentService: PredefinedContentService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all predefined content',
    description: 'Retrieves all predefined content (canned responses) for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of predefined content', type: PredefinedContentListResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: PredefinedContentQueryDto,
  ): Promise<PredefinedContentListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.predefinedContentService.getAll(accountId, token, {
      select: query.select,
      includeDeleted: query.includeDeleted,
      skillIds: query.skillIds,
      categoryIds: query.categoryIds,
      enabled: query.enabled,
    });

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Get('revision')
  @ApiOperation({
    summary: 'Get current revision',
    description: 'Gets the current revision for predefined content',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
    const revision = await this.predefinedContentService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':contentId')
  @ApiOperation({
    summary: 'Get predefined content by ID',
    description: 'Retrieves a single predefined content item by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'contentId', description: 'Predefined content ID' })
  @ApiResponse({ status: 200, description: 'The predefined content', type: PredefinedContentResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('contentId') contentId: string,
    @Headers('authorization') authorization: string,
  ): Promise<PredefinedContentResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.predefinedContentService.getById(accountId, contentId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create predefined content',
    description: 'Creates new predefined content. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Predefined content created', type: PredefinedContentResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreatePredefinedContentDto | CreatePredefinedContentDto[],
  ): Promise<PredefinedContentResponseDto | PredefinedContentListResponseDto> {
    const token = this.extractToken(authorization);

    if (Array.isArray(body)) {
      const response = await this.predefinedContentService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.predefinedContentService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':contentId')
  @ApiOperation({
    summary: 'Update predefined content',
    description: 'Updates existing predefined content by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'contentId', description: 'Predefined content ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Predefined content updated', type: PredefinedContentResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('contentId') contentId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdatePredefinedContentDto,
  ): Promise<PredefinedContentResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.predefinedContentService.update(accountId, contentId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':contentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete predefined content',
    description: 'Deletes predefined content by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'contentId', description: 'Predefined content ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Predefined content deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('contentId') contentId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.predefinedContentService.remove(accountId, contentId, token, revision);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
