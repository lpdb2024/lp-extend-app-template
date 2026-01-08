/**
 * Goals Controller
 * REST API endpoints for LivePerson Goals
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
import { GoalsService } from './goals.service';
import {
  GoalQueryDto,
  GoalCreateDto,
  GoalUpdateDto,
  GoalResponseDto,
  GoalListResponseDto,
} from './goals.dto';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all goals',
    description: 'Retrieve all goals for an account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of goals', type: GoalListResponseDto })
  async getGoals(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GoalQueryDto,
  ): Promise<GoalListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.goalsService.getGoals(accountId, token, query);

    return { data: response.data };
  }

  @Get(':goalId')
  @ApiOperation({
    summary: 'Get goal by ID',
    description: 'Retrieve a specific goal by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiResponse({ status: 200, description: 'Goal details', type: GoalResponseDto })
  async getGoalById(
    @Param('accountId') accountId: string,
    @Param('goalId') goalId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GoalQueryDto,
  ): Promise<GoalResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.goalsService.getGoalById(
      accountId,
      goalId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a goal',
    description: 'Create a new goal',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Created goal', type: GoalResponseDto })
  async createGoal(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: GoalCreateDto,
    @Query() query: GoalQueryDto,
  ): Promise<GoalResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.goalsService.createGoal(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Put(':goalId')
  @ApiOperation({
    summary: 'Update a goal',
    description: 'Update an existing goal. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated goal', type: GoalResponseDto })
  async updateGoal(
    @Param('accountId') accountId: string,
    @Param('goalId') goalId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: GoalUpdateDto,
    @Query() query: GoalQueryDto,
  ): Promise<GoalResponseDto> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    const response = await this.goalsService.updateGoal(
      accountId,
      goalId,
      token,
      body,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':goalId')
  @ApiOperation({
    summary: 'Delete a goal',
    description: 'Delete a goal. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'goalId', description: 'Goal ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Goal deleted' })
  async deleteGoal(
    @Param('accountId') accountId: string,
    @Param('goalId') goalId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    await this.goalsService.deleteGoal(accountId, goalId, token, revision);

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
