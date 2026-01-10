/**
 * LOBs Controller
 * REST API endpoints for LivePerson LOBs (Lines of Business)
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
import { LobsService } from './lobs.service';
import {
  CreateLobDto,
  UpdateLobDto,
  LobsQueryDto,
  LobsResponseDto,
  LobResponseDto,
} from './lobs.dto';

@ApiTags('Account Config - LOBs')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/lobs')
export class LobsController {
  constructor(private readonly lobsService: LobsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all LOBs',
    description: 'Retrieves all Lines of Business for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of LOBs', type: LobsResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: LobsQueryDto,
    @Req() req: Request,
  ): Promise<LobsResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.lobsService.getAll(accountId, token, {
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
    description: 'Gets the current revision for LOBs',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.lobsService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':lobId')
  @ApiOperation({
    summary: 'Get LOB by ID',
    description: 'Retrieves a single LOB by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'lobId', description: 'LOB ID' })
  @ApiResponse({ status: 200, description: 'The LOB', type: LobResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('lobId') lobId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<LobResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.lobsService.getById(accountId, lobId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create LOB',
    description: 'Creates a new LOB. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'LOB created', type: LobResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateLobDto | CreateLobDto[],
    @Req() req: Request,
  ): Promise<LobResponseDto | LobsResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.lobsService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.lobsService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':lobId')
  @ApiOperation({
    summary: 'Update LOB',
    description: 'Updates an existing LOB by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'lobId', description: 'LOB ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'LOB updated', type: LobResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('lobId') lobId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateLobDto,
    @Req() req: Request,
  ): Promise<LobResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.lobsService.update(accountId, lobId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':lobId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete LOB',
    description: 'Deletes a LOB by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'lobId', description: 'LOB ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'LOB deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('lobId') lobId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.lobsService.remove(accountId, lobId, token, revision);
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
