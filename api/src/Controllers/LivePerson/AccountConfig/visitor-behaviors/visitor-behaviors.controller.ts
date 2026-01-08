/**
 * Visitor Behaviors Controller
 * REST API endpoints for LivePerson Visitor Behaviors
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
import { VisitorBehaviorsService } from './visitor-behaviors.service';
import {
  VisitorBehaviorQueryDto,
  VisitorBehaviorCreateDto,
  VisitorBehaviorUpdateDto,
  VisitorBehaviorResponseDto,
  VisitorBehaviorListResponseDto,
} from './visitor-behaviors.dto';

@ApiTags('Visitor Behaviors')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/visitor-behaviors')
export class VisitorBehaviorsController {
  constructor(private readonly visitorBehaviorsService: VisitorBehaviorsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all visitor behaviors',
    description: 'Retrieve all visitor behaviors for an account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of visitor behaviors', type: VisitorBehaviorListResponseDto })
  async getVisitorBehaviors(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: VisitorBehaviorQueryDto,
  ): Promise<VisitorBehaviorListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.visitorBehaviorsService.getVisitorBehaviors(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get(':behaviorId')
  @ApiOperation({
    summary: 'Get visitor behavior by ID',
    description: 'Retrieve a specific visitor behavior',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'behaviorId', description: 'Visitor behavior ID' })
  @ApiResponse({ status: 200, description: 'Visitor behavior details', type: VisitorBehaviorResponseDto })
  async getVisitorBehaviorById(
    @Param('accountId') accountId: string,
    @Param('behaviorId') behaviorId: string,
    @Headers('authorization') authorization: string,
    @Query() query: VisitorBehaviorQueryDto,
  ): Promise<VisitorBehaviorResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.visitorBehaviorsService.getVisitorBehaviorById(
      accountId,
      behaviorId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a visitor behavior',
    description: 'Create a new visitor behavior',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Created visitor behavior', type: VisitorBehaviorResponseDto })
  async createVisitorBehavior(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: VisitorBehaviorCreateDto,
    @Query() query: VisitorBehaviorQueryDto,
  ): Promise<VisitorBehaviorResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.visitorBehaviorsService.createVisitorBehavior(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Put(':behaviorId')
  @ApiOperation({
    summary: 'Update a visitor behavior',
    description: 'Update an existing visitor behavior. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'behaviorId', description: 'Visitor behavior ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated visitor behavior', type: VisitorBehaviorResponseDto })
  async updateVisitorBehavior(
    @Param('accountId') accountId: string,
    @Param('behaviorId') behaviorId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: VisitorBehaviorUpdateDto,
    @Query() query: VisitorBehaviorQueryDto,
  ): Promise<VisitorBehaviorResponseDto> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    const response = await this.visitorBehaviorsService.updateVisitorBehavior(
      accountId,
      behaviorId,
      token,
      body,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':behaviorId')
  @ApiOperation({
    summary: 'Delete a visitor behavior',
    description: 'Delete a visitor behavior. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'behaviorId', description: 'Visitor behavior ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Visitor behavior deleted' })
  async deleteVisitorBehavior(
    @Param('accountId') accountId: string,
    @Param('behaviorId') behaviorId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    await this.visitorBehaviorsService.deleteVisitorBehavior(
      accountId,
      behaviorId,
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
