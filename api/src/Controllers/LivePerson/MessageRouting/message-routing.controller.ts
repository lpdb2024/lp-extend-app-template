/**
 * Message Routing Controller
 * REST API endpoints for LivePerson Message Routing API
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
} from '@nestjs/swagger';
import { MessageRoutingService } from './message-routing.service';
import {
  CreateRoutingTaskDto,
  UpdateRoutingTaskDto,
  GetRoutingTasksQueryDto,
  CreateRoutingRuleDto,
  UpdateRoutingRuleDto,
  UpdateSkillRoutingConfigDto,
  UpdateAgentRoutingStateDto,
  GetAgentsAvailabilityQueryDto,
  GetQueueStatusQueryDto,
  GetQueuesStatusQueryDto,
  TransferConversationDto,
  RoutingTaskResponseDto,
  RoutingTasksListResponseDto,
  RoutingRuleResponseDto,
  RoutingRulesListResponseDto,
  SkillRoutingConfigResponseDto,
  AgentAvailabilityResponseDto,
  AgentsAvailabilityListResponseDto,
  QueueStatusResponseDto,
  QueuesStatusResponseDto,
  TransferResponseDto,
} from './message-routing.dto';

@ApiTags('Message Routing')
@ApiBearerAuth()
@Controller('api/v2/message-routing/:accountId')
export class MessageRoutingController {
  constructor(private readonly messageRoutingService: MessageRoutingService) {}

  // ============================================
  // Routing Tasks Endpoints
  // ============================================

  @Post('tasks')
  @ApiOperation({
    summary: 'Create routing task',
    description: 'Creates a new routing task to route a conversation to a specific skill or agent.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Routing task created', type: RoutingTaskResponseDto })
  async createRoutingTask(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CreateRoutingTaskDto,
  ): Promise<RoutingTaskResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.createRoutingTask(
      accountId,
      token,
      body,
    );

    return { task: response.data };
  }

  @Get('tasks')
  @ApiOperation({
    summary: 'Get routing tasks',
    description: 'Retrieves a list of routing tasks with optional filters.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Routing tasks list', type: RoutingTasksListResponseDto })
  async getRoutingTasks(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GetRoutingTasksQueryDto,
  ): Promise<RoutingTasksListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getRoutingTasks(
      accountId,
      token,
      query,
    );

    return response.data;
  }

  @Get('tasks/:taskId')
  @ApiOperation({
    summary: 'Get routing task',
    description: 'Retrieves details of a specific routing task.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'taskId', description: 'Routing task ID' })
  @ApiResponse({ status: 200, description: 'Routing task details', type: RoutingTaskResponseDto })
  async getRoutingTask(
    @Param('accountId') accountId: string,
    @Param('taskId') taskId: string,
    @Headers('authorization') authorization: string,
  ): Promise<RoutingTaskResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getRoutingTask(
      accountId,
      token,
      taskId,
    );

    return { task: response.data };
  }

  @Put('tasks/:taskId')
  @ApiOperation({
    summary: 'Update routing task',
    description: 'Updates status, assignment, or metadata of a routing task.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'taskId', description: 'Routing task ID' })
  @ApiResponse({ status: 200, description: 'Routing task updated', type: RoutingTaskResponseDto })
  async updateRoutingTask(
    @Param('accountId') accountId: string,
    @Param('taskId') taskId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdateRoutingTaskDto,
  ): Promise<RoutingTaskResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.updateRoutingTask(
      accountId,
      token,
      taskId,
      body,
    );

    return { task: response.data };
  }

  @Post('tasks/:taskId/cancel')
  @ApiOperation({
    summary: 'Cancel routing task',
    description: 'Cancels a pending or routing task.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'taskId', description: 'Routing task ID' })
  @ApiResponse({ status: 200, description: 'Routing task cancelled', type: RoutingTaskResponseDto })
  async cancelRoutingTask(
    @Param('accountId') accountId: string,
    @Param('taskId') taskId: string,
    @Headers('authorization') authorization: string,
  ): Promise<RoutingTaskResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.cancelRoutingTask(
      accountId,
      token,
      taskId,
    );

    return { task: response.data };
  }

  // ============================================
  // Routing Rules Endpoints
  // ============================================

  @Post('rules')
  @ApiOperation({
    summary: 'Create routing rule',
    description: 'Creates a rule that automatically routes conversations based on conditions.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Routing rule created', type: RoutingRuleResponseDto })
  async createRoutingRule(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CreateRoutingRuleDto,
  ): Promise<RoutingRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.createRoutingRule(
      accountId,
      token,
      body,
    );

    return { rule: response.data };
  }

  @Get('rules')
  @ApiOperation({
    summary: 'Get routing rules',
    description: 'Retrieves a list of all routing rules for the account.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Routing rules list', type: RoutingRulesListResponseDto })
  async getRoutingRules(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<RoutingRulesListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getRoutingRules(accountId, token);

    return response.data;
  }

  @Get('rules/:ruleId')
  @ApiOperation({
    summary: 'Get routing rule',
    description: 'Retrieves details of a specific routing rule.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'Routing rule ID' })
  @ApiResponse({ status: 200, description: 'Routing rule details', type: RoutingRuleResponseDto })
  async getRoutingRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
  ): Promise<RoutingRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getRoutingRule(
      accountId,
      token,
      ruleId,
    );

    return { rule: response.data };
  }

  @Put('rules/:ruleId')
  @ApiOperation({
    summary: 'Update routing rule',
    description: 'Updates an existing routing rule.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'Routing rule ID' })
  @ApiResponse({ status: 200, description: 'Routing rule updated', type: RoutingRuleResponseDto })
  async updateRoutingRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdateRoutingRuleDto,
  ): Promise<RoutingRuleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.updateRoutingRule(
      accountId,
      token,
      ruleId,
      body,
    );

    return { rule: response.data };
  }

  @Delete('rules/:ruleId')
  @ApiOperation({
    summary: 'Delete routing rule',
    description: 'Deletes a routing rule.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'ruleId', description: 'Routing rule ID' })
  @ApiResponse({ status: 204, description: 'Routing rule deleted' })
  async deleteRoutingRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Headers('authorization') authorization: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.messageRoutingService.deleteRoutingRule(accountId, token, ruleId);
  }

  // ============================================
  // Skill Routing Configuration Endpoints
  // ============================================

  @Get('skills/:skillId/config')
  @ApiOperation({
    summary: 'Get skill routing configuration',
    description: 'Retrieves routing configuration for a specific skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill routing config', type: SkillRoutingConfigResponseDto })
  async getSkillRoutingConfig(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
  ): Promise<SkillRoutingConfigResponseDto> {
    const token = this.extractToken(authorization);
    const skillIdNum = parseInt(skillId, 10);

    const response = await this.messageRoutingService.getSkillRoutingConfig(
      accountId,
      token,
      skillIdNum,
    );

    return { config: response.data };
  }

  @Put('skills/:skillId/config')
  @ApiOperation({
    summary: 'Update skill routing configuration',
    description: 'Updates routing configuration for a specific skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill routing config updated', type: SkillRoutingConfigResponseDto })
  async updateSkillRoutingConfig(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdateSkillRoutingConfigDto,
  ): Promise<SkillRoutingConfigResponseDto> {
    const token = this.extractToken(authorization);
    const skillIdNum = parseInt(skillId, 10);

    const response = await this.messageRoutingService.updateSkillRoutingConfig(
      accountId,
      token,
      skillIdNum,
      body,
    );

    return { config: response.data };
  }

  // ============================================
  // Agent Availability Endpoints
  // ============================================

  @Get('agents/:agentId/availability')
  @ApiOperation({
    summary: 'Get agent availability',
    description: 'Retrieves current routing state and availability for an agent.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent availability', type: AgentAvailabilityResponseDto })
  async getAgentAvailability(
    @Param('accountId') accountId: string,
    @Param('agentId') agentId: string,
    @Headers('authorization') authorization: string,
  ): Promise<AgentAvailabilityResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getAgentAvailability(
      accountId,
      token,
      agentId,
    );

    return { availability: response.data };
  }

  @Get('agents/availability')
  @ApiOperation({
    summary: 'Get all agents availability',
    description: 'Retrieves routing availability for all agents with optional filters.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Agents availability list', type: AgentsAvailabilityListResponseDto })
  async getAgentsAvailability(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GetAgentsAvailabilityQueryDto,
  ): Promise<AgentsAvailabilityListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getAgentsAvailability(
      accountId,
      token,
      query,
    );

    return response.data;
  }

  @Put('agents/:agentId/availability')
  @ApiOperation({
    summary: 'Update agent routing state',
    description: "Updates an agent's routing state and capacity.",
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent routing state updated', type: AgentAvailabilityResponseDto })
  async updateAgentRoutingState(
    @Param('accountId') accountId: string,
    @Param('agentId') agentId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdateAgentRoutingStateDto,
  ): Promise<AgentAvailabilityResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.updateAgentRoutingState(
      accountId,
      token,
      agentId,
      body,
    );

    return { availability: response.data };
  }

  // ============================================
  // Queue Management Endpoints
  // ============================================

  @Get('queues/:skillId')
  @ApiOperation({
    summary: 'Get queue status',
    description: 'Retrieves current queue status for a specific skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Queue status', type: QueueStatusResponseDto })
  async getQueueStatus(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GetQueueStatusQueryDto,
  ): Promise<QueueStatusResponseDto> {
    const token = this.extractToken(authorization);
    const skillIdNum = parseInt(skillId, 10);

    const response = await this.messageRoutingService.getQueueStatus(
      accountId,
      token,
      skillIdNum,
      query,
    );

    return { queue: response.data };
  }

  @Get('queues')
  @ApiOperation({
    summary: 'Get queues status',
    description: 'Retrieves current queue status for multiple skills.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Queues status', type: QueuesStatusResponseDto })
  async getQueuesStatus(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: GetQueuesStatusQueryDto,
  ): Promise<QueuesStatusResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getQueuesStatus(
      accountId,
      token,
      query,
    );

    return response.data;
  }

  // ============================================
  // Transfer Endpoints
  // ============================================

  @Post('transfer')
  @ApiOperation({
    summary: 'Transfer conversation',
    description: 'Transfers a conversation to a different skill or agent.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Transfer initiated', type: TransferResponseDto })
  async transferConversation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: TransferConversationDto,
  ): Promise<TransferResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.transferConversation(
      accountId,
      token,
      body,
    );

    return { transfer: response.data };
  }

  @Get('transfer/:transferId')
  @ApiOperation({
    summary: 'Get transfer status',
    description: 'Retrieves the status of a transfer request.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'transferId', description: 'Transfer ID' })
  @ApiResponse({ status: 200, description: 'Transfer status', type: TransferResponseDto })
  async getTransferStatus(
    @Param('accountId') accountId: string,
    @Param('transferId') transferId: string,
    @Headers('authorization') authorization: string,
  ): Promise<TransferResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getTransferStatus(
      accountId,
      token,
      transferId,
    );

    return { transfer: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Post('route-to-skill')
  @ApiOperation({
    summary: 'Route to skill',
    description: 'Simplified endpoint to route a conversation to a skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Conversation routed', type: RoutingTaskResponseDto })
  async routeToSkill(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { conversationId: string; skillId: number; priority?: string },
  ): Promise<RoutingTaskResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.routeToSkill(
      accountId,
      token,
      body.conversationId,
      body.skillId,
      body.priority,
    );

    return { task: response.data };
  }

  @Post('route-to-agent')
  @ApiOperation({
    summary: 'Route to agent',
    description: 'Simplified endpoint to route a conversation to a specific agent.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Conversation routed', type: RoutingTaskResponseDto })
  async routeToAgent(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: { conversationId: string; agentId: string; priority?: string },
  ): Promise<RoutingTaskResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.routeToAgent(
      accountId,
      token,
      body.conversationId,
      body.agentId,
      body.priority,
    );

    return { task: response.data };
  }

  @Get('skills/:skillId/available-agents')
  @ApiOperation({
    summary: 'Get available agents for skill',
    description: 'Returns agents that are online and have capacity for a given skill.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Available agents', type: AgentsAvailabilityListResponseDto })
  async getAvailableAgentsForSkill(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
  ): Promise<AgentsAvailabilityListResponseDto> {
    const token = this.extractToken(authorization);
    const skillIdNum = parseInt(skillId, 10);

    const response = await this.messageRoutingService.getAvailableAgentsForSkill(
      accountId,
      token,
      skillIdNum,
    );

    return response.data;
  }

  @Get('queues/summary')
  @ApiOperation({
    summary: 'Get all queues summary',
    description: 'Returns queue status for all skills.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'All queues summary', type: QueuesStatusResponseDto })
  async getAllQueuesSummary(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<QueuesStatusResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.messageRoutingService.getAllQueuesSummary(accountId, token);

    return response.data;
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
