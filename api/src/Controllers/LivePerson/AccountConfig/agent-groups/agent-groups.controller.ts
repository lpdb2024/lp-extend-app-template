/**
 * Agent Groups Controller
 * REST API endpoints for LivePerson Agent Groups
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
import { AgentGroupsService } from './agent-groups.service';
import {
  CreateAgentGroupDto,
  UpdateAgentGroupDto,
  BulkUpdateAgentGroupsDto,
  BulkDeleteAgentGroupsDto,
  AgentGroupsQueryDto,
  AgentGroupsResponseDto,
  AgentGroupResponseDto,
} from './agent-groups.dto';

@ApiTags('Account Config - Agent Groups')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/agent-groups')
export class AgentGroupsController {
  constructor(private readonly agentGroupsService: AgentGroupsService) {}

  /**
   * Get all agent groups
   */
  @Get()
  @ApiOperation({
    summary: 'Get all agent groups',
    description: 'Retrieves all agent groups for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'List of agent groups',
      })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentGroupsQueryDto,
    @Req() req: Request,
  ): Promise<AgentGroupsResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.agentGroupsService.getAll(accountId, token, {
      getUsers: query.getUsers,
      select: query.select,
      includeDeleted: query.includeDeleted,
    });

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  /**
   * Get agent group by ID
   */
  @Get(':groupId')
  @ApiOperation({
    summary: 'Get agent group by ID',
    description: 'Retrieves a single agent group by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'groupId', description: 'Agent group ID' })
  @ApiResponse({
    status: 200,
    description: 'The agent group',
      })
  @ApiResponse({ status: 404, description: 'Agent group not found' })
  async getById(
    @Param('accountId') accountId: string,
    @Param('groupId') groupId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<AgentGroupResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.agentGroupsService.getById(accountId, groupId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  /**
   * Create a new agent group
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create agent group',
    description: 'Creates a new agent group. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking (optional)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Agent group created',
      })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateAgentGroupDto | CreateAgentGroupDto[],
    @Req() req: Request,
  ): Promise<AgentGroupResponseDto | AgentGroupsResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.agentGroupsService.createMany(
        accountId,
        token,
        body,
        revision,
      );
      return {
        data: response.data,
        revision: response.revision,
      };
    }

    const response = await this.agentGroupsService.create(
      accountId,
      token,
      body,
      revision,
    );

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  /**
   * Update an agent group
   */
  @Put(':groupId')
  @ApiOperation({
    summary: 'Update agent group',
    description: 'Updates an existing agent group by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'groupId', description: 'Agent group ID to update' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking (required)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Agent group updated',
      })
  @ApiResponse({ status: 400, description: 'Invalid request or missing revision' })
  @ApiResponse({ status: 404, description: 'Agent group not found' })
  @ApiResponse({ status: 409, description: 'Revision mismatch (conflict)' })
  async update(
    @Param('accountId') accountId: string,
    @Param('groupId') groupId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateAgentGroupDto,
    @Req() req: Request,
  ): Promise<AgentGroupResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.agentGroupsService.update(
      accountId,
      groupId,
      token,
      body,
      revision,
    );

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  /**
   * Update multiple agent groups
   */
  @Put()
  @ApiOperation({
    summary: 'Update multiple agent groups',
    description: 'Updates multiple agent groups in a single request',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking (required)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Agent groups updated',
      })
  @ApiResponse({ status: 400, description: 'Invalid request or missing revision' })
  async updateMany(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: BulkUpdateAgentGroupsDto,
    @Req() req: Request,
  ): Promise<AgentGroupsResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.agentGroupsService.updateMany(
      accountId,
      token,
      body.agentGroups,
      revision,
    );

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  /**
   * Delete an agent group
   */
  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete agent group',
    description: 'Deletes an agent group by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'groupId', description: 'Agent group ID to delete' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking (required)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Agent group deleted' })
  @ApiResponse({ status: 400, description: 'Missing revision' })
  @ApiResponse({ status: 404, description: 'Agent group not found' })
  @ApiResponse({ status: 409, description: 'Revision mismatch (conflict)' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('groupId') groupId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.agentGroupsService.remove(accountId, groupId, token, revision);
  }

  /**
   * Delete multiple agent groups
   */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete multiple agent groups',
    description: 'Deletes multiple agent groups in a single request',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking (required)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Agent groups deleted' })
  @ApiResponse({ status: 400, description: 'Missing revision or invalid IDs' })
  async removeMany(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: BulkDeleteAgentGroupsDto,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.agentGroupsService.removeMany(accountId, token, body.ids, revision);
  }

  /**
   * Get current revision
   * Helper endpoint to get revision for update/delete operations
   */
  @Get('revision')
  @ApiOperation({
    summary: 'Get current revision',
    description: 'Gets the current revision for agent groups. Useful before update/delete operations.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Current revision',
    schema: { type: 'object', properties: { revision: { type: 'string' } } },
  })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.agentGroupsService.getRevision(accountId, token);
    return { revision };
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
