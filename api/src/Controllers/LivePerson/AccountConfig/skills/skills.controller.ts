/**
 * Skills Controller
 * REST API endpoints for LivePerson Skills
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
import { SkillsService } from './skills.service';
import {
  CreateSkillDto,
  UpdateSkillDto,
  SkillsQueryDto,
  SkillsResponseDto,
  SkillResponseDto,
  SmartDeleteSkillDto,
  SmartDeleteResponseDto,
  SkillDependenciesDto,
} from './skills.dto';

@ApiTags('Account Config - Skills')
@ApiBearerAuth()
@Controller('api/v1/account-config/:accountId/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all skills',
    description: 'Retrieves all skills for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of skills' })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: SkillsQueryDto,
    @Req() req: Request,
  ): Promise<SkillsResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.skillsService.getAll(accountId, token, {
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
    description: 'Gets the current revision for skills',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.skillsService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':skillId')
  @ApiOperation({
    summary: 'Get skill by ID',
    description: 'Retrieves a single skill by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'The skill' })
  async getById(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<SkillResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.skillsService.getById(accountId, skillId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create skill',
    description: 'Creates a new skill. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Skill created' })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateSkillDto | CreateSkillDto[],
    @Req() req: Request,
  ): Promise<SkillResponseDto | SkillsResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.skillsService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.skillsService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':skillId')
  @ApiOperation({
    summary: 'Update skill',
    description: 'Updates an existing skill by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Skill updated' })
  async update(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateSkillDto,
    @Req() req: Request,
  ): Promise<SkillResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.skillsService.update(accountId, skillId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete skill',
    description: 'Deletes a skill by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Skill deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.skillsService.remove(accountId, skillId, token, revision);
  }

  @Get(':skillId/dependencies')
  @ApiOperation({
    summary: 'Check skill dependencies',
    description: 'Returns all entities that depend on this skill (users, etc.)',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID to check' })
  @ApiResponse({ status: 200, description: 'Skill dependencies', type: SkillDependenciesDto })
  async checkDependencies(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<SkillDependenciesDto> {
    const token = this.extractToken(authorization, req);
    return this.skillsService.checkDependencies(accountId, Number(skillId), token);
  }

  @Post(':skillId/smart-delete')
  @ApiOperation({
    summary: 'Smart delete skill',
    description: 'Delete a skill with automatic dependency management. Mode=check returns dependencies, mode=force removes dependencies and deletes.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID to delete' })
  @ApiResponse({ status: 200, description: 'Smart delete result', type: SmartDeleteResponseDto })
  async smartDelete(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Body() body: SmartDeleteSkillDto,
    @Req() req: Request,
  ): Promise<SmartDeleteResponseDto> {
    const token = this.extractToken(authorization, req);
    return this.skillsService.smartDelete(accountId, Number(skillId), token, body.mode);
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
