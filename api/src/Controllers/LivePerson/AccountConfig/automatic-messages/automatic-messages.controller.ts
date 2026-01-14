/**
 * Automatic Messages Controller
 * REST API endpoints for LivePerson Automatic Messages
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
import { AutomaticMessagesService } from './automatic-messages.service';
import {
  CreateAutomaticMessageDto,
  UpdateAutomaticMessageDto,
  AutomaticMessagesQueryDto,
  AutomaticMessagesListResponseDto,
  AutomaticMessageResponseDto,
} from './automatic-messages.dto';

@ApiTags('Account Config - Automatic Messages')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/automatic-messages')
export class AutomaticMessagesController {
  constructor(private readonly automaticMessagesService: AutomaticMessagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all automatic messages',
    description: 'Retrieves all automatic messages for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of automatic messages' })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AutomaticMessagesQueryDto,
    @Req() req: Request,
  ): Promise<AutomaticMessagesListResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.automaticMessagesService.getAll(accountId, token, {
      select: query.select,
      includeDeleted: query.includeDeleted,
      skillId: query.skillId,
      messageEventId: query.messageEventId,
    });

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  // Note: getDefaults endpoint removed - not supported by SDK
  // TODO: Re-add if SDK adds support for default automatic messages

  @Get('revision')
  @ApiOperation({
    summary: 'Get current revision',
    description: 'Gets the current revision for automatic messages',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.automaticMessagesService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':messageId')
  @ApiOperation({
    summary: 'Get automatic message by ID',
    description: 'Retrieves a single automatic message by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'messageId', description: 'Automatic message ID' })
  @ApiResponse({ status: 200, description: 'The automatic message' })
  async getById(
    @Param('accountId') accountId: string,
    @Param('messageId') messageId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<AutomaticMessageResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.automaticMessagesService.getById(accountId, messageId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create automatic message',
    description: 'Creates a new automatic message. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Automatic message created' })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateAutomaticMessageDto | CreateAutomaticMessageDto[],
    @Req() req: Request,
  ): Promise<AutomaticMessageResponseDto | AutomaticMessagesListResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.automaticMessagesService.createMany(accountId, token, body as any, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.automaticMessagesService.create(accountId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':messageId')
  @ApiOperation({
    summary: 'Update automatic message',
    description: 'Updates an existing automatic message by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'messageId', description: 'Automatic message ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Automatic message updated' })
  async update(
    @Param('accountId') accountId: string,
    @Param('messageId') messageId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateAutomaticMessageDto,
    @Req() req: Request,
  ): Promise<AutomaticMessageResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.automaticMessagesService.update(accountId, messageId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete automatic message',
    description: 'Deletes an automatic message by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'messageId', description: 'Automatic message ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Automatic message deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('messageId') messageId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.automaticMessagesService.remove(accountId, messageId, token, revision);
  }

  /**
   * Extract token from Authorization header or shell auth
   * Supports both direct Bearer auth and shell token auth (via middleware)
   */
  private extractToken(authorization: string, req?: any): { accessToken: string; extendToken?: string } {
    // First check if shell auth provided token via middleware (LpExtendAuthMiddleware sets req.auth)
    if (req?.auth?.lpAccessToken) {
      return {
        accessToken: req.auth.lpAccessToken,
        extendToken: req.headers?.['x-extend-token'], // Raw ExtendJWT from header for SDK
      };
    }

    // Fall back to Authorization header
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return {
      accessToken: authorization.replace(/^Bearer\s+/i, ''),
      extendToken: req?.headers?.['x-extend-token'], // Also check header in fallback case
    };
  }
}
