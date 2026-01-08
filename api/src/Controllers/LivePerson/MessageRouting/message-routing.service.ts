/**
 * Message Routing Service
 * Business logic for LivePerson Message Routing API
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../APIService/api-service';
import { LPDomainService } from '../shared/lp-domain.service';
import { LPBaseService } from '../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
  LP_API_PATHS,
} from '../shared/lp-constants';
import { ILPResponse } from '../shared/lp-common.interfaces';
import {
  IRoutingTask,
  IRoutingTasksListResponse,
  ICreateRoutingTaskRequest,
  IUpdateRoutingTaskRequest,
  IRoutingRule,
  IRoutingRulesListResponse,
  ICreateRoutingRuleRequest,
  IUpdateRoutingRuleRequest,
  ISkillRoutingConfig,
  IUpdateSkillRoutingConfigRequest,
  IAgentRoutingAvailability,
  IAgentsAvailabilityListResponse,
  IUpdateAgentRoutingStateRequest,
  IQueueStatus,
  IQueuesStatusResponse,
  ITransferRequest,
  ITransferResponse,
  RoutingTaskStatus,
  AgentRoutingState,
} from './message-routing.interfaces';

@Injectable()
export class MessageRoutingService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ASYNC_MESSAGING;
  protected readonly defaultApiVersion = '1.0';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(MessageRoutingService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(MessageRoutingService.name);
  }

  // ============================================
  // Routing Tasks
  // ============================================

  /**
   * Create a new routing task
   * Routes a conversation to a specific skill or agent
   */
  async createRoutingTask(
    accountId: string,
    token: string,
    request: ICreateRoutingTaskRequest,
  ): Promise<ILPResponse<IRoutingTask>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TASKS(accountId);

    this.logger.info(
      { accountId, conversationId: request.conversationId },
      'Creating routing task',
    );

    return this.post<IRoutingTask>(accountId, path, request, token);
  }

  /**
   * Get a routing task by ID
   * Retrieves details of a specific routing task
   */
  async getRoutingTask(
    accountId: string,
    token: string,
    taskId: string,
  ): Promise<ILPResponse<IRoutingTask>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TASK_BY_ID(accountId, taskId);

    this.logger.info({ accountId, taskId }, 'Getting routing task');

    return this.get<IRoutingTask>(accountId, path, token);
  }

  /**
   * Get all routing tasks
   * Retrieves a list of routing tasks with optional filters
   */
  async getRoutingTasks(
    accountId: string,
    token: string,
    query?: {
      status?: RoutingTaskStatus;
      skillId?: number;
      agentId?: string;
      offset?: number;
      limit?: number;
    },
  ): Promise<ILPResponse<IRoutingTasksListResponse>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TASKS(accountId);

    const additionalParams: Record<string, string> = {};
    if (query?.status) additionalParams.status = query.status;
    if (query?.skillId) additionalParams.skillId = String(query.skillId);
    if (query?.agentId) additionalParams.agentId = query.agentId;
    if (query?.offset !== undefined) additionalParams.offset = String(query.offset);
    if (query?.limit !== undefined) additionalParams.limit = String(query.limit);

    this.logger.info({ accountId, query }, 'Getting routing tasks');

    return this.get<IRoutingTasksListResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Update a routing task
   * Updates status, assignment, or metadata of a routing task
   */
  async updateRoutingTask(
    accountId: string,
    token: string,
    taskId: string,
    request: IUpdateRoutingTaskRequest,
  ): Promise<ILPResponse<IRoutingTask>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TASK_BY_ID(accountId, taskId);

    this.logger.info({ accountId, taskId }, 'Updating routing task');

    return this.put<IRoutingTask>(accountId, path, request, token);
  }

  /**
   * Cancel a routing task
   * Cancels a pending or routing task
   */
  async cancelRoutingTask(
    accountId: string,
    token: string,
    taskId: string,
  ): Promise<ILPResponse<IRoutingTask>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TASK_CANCEL(accountId, taskId);

    this.logger.info({ accountId, taskId }, 'Cancelling routing task');

    return this.post<IRoutingTask>(accountId, path, {}, token);
  }

  // ============================================
  // Routing Rules
  // ============================================

  /**
   * Create a new routing rule
   * Creates a rule that automatically routes conversations based on conditions
   */
  async createRoutingRule(
    accountId: string,
    token: string,
    request: ICreateRoutingRuleRequest,
  ): Promise<ILPResponse<IRoutingRule>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.RULES(accountId);

    this.logger.info({ accountId, ruleName: request.name }, 'Creating routing rule');

    return this.post<IRoutingRule>(accountId, path, request, token);
  }

  /**
   * Get a routing rule by ID
   * Retrieves details of a specific routing rule
   */
  async getRoutingRule(
    accountId: string,
    token: string,
    ruleId: string,
  ): Promise<ILPResponse<IRoutingRule>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.RULE_BY_ID(accountId, ruleId);

    this.logger.info({ accountId, ruleId }, 'Getting routing rule');

    return this.get<IRoutingRule>(accountId, path, token);
  }

  /**
   * Get all routing rules
   * Retrieves a list of all routing rules for the account
   */
  async getRoutingRules(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<IRoutingRulesListResponse>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.RULES(accountId);

    this.logger.info({ accountId }, 'Getting routing rules');

    return this.get<IRoutingRulesListResponse>(accountId, path, token);
  }

  /**
   * Update a routing rule
   * Updates an existing routing rule
   */
  async updateRoutingRule(
    accountId: string,
    token: string,
    ruleId: string,
    request: IUpdateRoutingRuleRequest,
  ): Promise<ILPResponse<IRoutingRule>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.RULE_BY_ID(accountId, ruleId);

    this.logger.info({ accountId, ruleId }, 'Updating routing rule');

    return this.put<IRoutingRule>(accountId, path, request, token);
  }

  /**
   * Delete a routing rule
   * Deletes a routing rule
   */
  async deleteRoutingRule(
    accountId: string,
    token: string,
    ruleId: string,
  ): Promise<ILPResponse<void>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.RULE_BY_ID(accountId, ruleId);

    this.logger.info({ accountId, ruleId }, 'Deleting routing rule');

    return this.delete<void>(accountId, path, token);
  }

  // ============================================
  // Skill Routing Configuration
  // ============================================

  /**
   * Get skill routing configuration
   * Retrieves routing configuration for a specific skill
   */
  async getSkillRoutingConfig(
    accountId: string,
    token: string,
    skillId: number,
  ): Promise<ILPResponse<ISkillRoutingConfig>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.SKILL_CONFIG(accountId, skillId);

    this.logger.info({ accountId, skillId }, 'Getting skill routing config');

    return this.get<ISkillRoutingConfig>(accountId, path, token);
  }

  /**
   * Update skill routing configuration
   * Updates routing configuration for a specific skill
   */
  async updateSkillRoutingConfig(
    accountId: string,
    token: string,
    skillId: number,
    request: IUpdateSkillRoutingConfigRequest,
  ): Promise<ILPResponse<ISkillRoutingConfig>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.SKILL_CONFIG(accountId, skillId);

    this.logger.info({ accountId, skillId }, 'Updating skill routing config');

    return this.put<ISkillRoutingConfig>(accountId, path, request, token);
  }

  // ============================================
  // Agent Routing & Availability
  // ============================================

  /**
   * Get agent routing availability
   * Retrieves current routing state and availability for an agent
   */
  async getAgentAvailability(
    accountId: string,
    token: string,
    agentId: string,
  ): Promise<ILPResponse<IAgentRoutingAvailability>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.AGENT_AVAILABILITY(accountId, agentId);

    this.logger.info({ accountId, agentId }, 'Getting agent availability');

    return this.get<IAgentRoutingAvailability>(accountId, path, token);
  }

  /**
   * Get all agents availability
   * Retrieves routing availability for all agents with optional filters
   */
  async getAgentsAvailability(
    accountId: string,
    token: string,
    query?: {
      skillId?: number;
      state?: AgentRoutingState;
      availableOnly?: boolean;
    },
  ): Promise<ILPResponse<IAgentsAvailabilityListResponse>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.AGENTS_AVAILABILITY(accountId);

    const additionalParams: Record<string, string> = {};
    if (query?.skillId) additionalParams.skillId = String(query.skillId);
    if (query?.state) additionalParams.state = query.state;
    if (query?.availableOnly) additionalParams.availableOnly = String(query.availableOnly);

    this.logger.info({ accountId, query }, 'Getting agents availability');

    return this.get<IAgentsAvailabilityListResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Update agent routing state
   * Updates an agent's routing state and capacity
   */
  async updateAgentRoutingState(
    accountId: string,
    token: string,
    agentId: string,
    request: IUpdateAgentRoutingStateRequest,
  ): Promise<ILPResponse<IAgentRoutingAvailability>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.AGENT_AVAILABILITY(accountId, agentId);

    this.logger.info({ accountId, agentId, state: request.state }, 'Updating agent routing state');

    return this.put<IAgentRoutingAvailability>(accountId, path, request, token);
  }

  // ============================================
  // Queue Management
  // ============================================

  /**
   * Get queue status for a skill
   * Retrieves current queue status for a specific skill
   */
  async getQueueStatus(
    accountId: string,
    token: string,
    skillId: number,
    query?: {
      includeEntries?: boolean;
      maxEntries?: number;
    },
  ): Promise<ILPResponse<IQueueStatus>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.QUEUE_STATUS(accountId, skillId);

    const additionalParams: Record<string, string> = {};
    if (query?.includeEntries) additionalParams.includeEntries = String(query.includeEntries);
    if (query?.maxEntries) additionalParams.maxEntries = String(query.maxEntries);

    this.logger.info({ accountId, skillId }, 'Getting queue status');

    return this.get<IQueueStatus>(accountId, path, token, {
      additionalParams,
    });
  }

  /**
   * Get queue status for multiple skills
   * Retrieves current queue status for multiple skills
   */
  async getQueuesStatus(
    accountId: string,
    token: string,
    query?: {
      skillIds?: string;
      includeEntries?: boolean;
    },
  ): Promise<ILPResponse<IQueuesStatusResponse>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.QUEUES_STATUS(accountId);

    const additionalParams: Record<string, string> = {};
    if (query?.skillIds) additionalParams.skillIds = query.skillIds;
    if (query?.includeEntries) additionalParams.includeEntries = String(query.includeEntries);

    this.logger.info({ accountId, query }, 'Getting queues status');

    return this.get<IQueuesStatusResponse>(accountId, path, token, {
      additionalParams,
    });
  }

  // ============================================
  // Conversation Transfer
  // ============================================

  /**
   * Transfer a conversation
   * Transfers a conversation to a different skill or agent
   */
  async transferConversation(
    accountId: string,
    token: string,
    request: ITransferRequest,
  ): Promise<ILPResponse<ITransferResponse>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TRANSFER(accountId);

    this.logger.info(
      { accountId, conversationId: request.conversationId, type: request.type },
      'Transferring conversation',
    );

    return this.post<ITransferResponse>(accountId, path, request, token);
  }

  /**
   * Get transfer status
   * Retrieves the status of a transfer request
   */
  async getTransferStatus(
    accountId: string,
    token: string,
    transferId: string,
  ): Promise<ILPResponse<ITransferResponse>> {
    const path = LP_API_PATHS.MESSAGE_ROUTING.TRANSFER_BY_ID(accountId, transferId);

    this.logger.info({ accountId, transferId }, 'Getting transfer status');

    return this.get<ITransferResponse>(accountId, path, token);
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Route conversation to skill
   * Simplified method to route a conversation to a skill
   */
  async routeToSkill(
    accountId: string,
    token: string,
    conversationId: string,
    skillId: number,
    priority?: string,
  ): Promise<ILPResponse<IRoutingTask>> {
    return this.createRoutingTask(accountId, token, {
      conversationId,
      policy: {
        type: 'SKILL' as any,
        targetId: skillId,
        priority: priority as any,
      },
    });
  }

  /**
   * Route conversation to agent
   * Simplified method to route a conversation to a specific agent
   */
  async routeToAgent(
    accountId: string,
    token: string,
    conversationId: string,
    agentId: string,
    priority?: string,
  ): Promise<ILPResponse<IRoutingTask>> {
    return this.createRoutingTask(accountId, token, {
      conversationId,
      policy: {
        type: 'AGENT' as any,
        targetId: agentId,
        priority: priority as any,
      },
    });
  }

  /**
   * Get available agents for skill
   * Returns agents that are online and have capacity for a given skill
   */
  async getAvailableAgentsForSkill(
    accountId: string,
    token: string,
    skillId: number,
  ): Promise<ILPResponse<IAgentsAvailabilityListResponse>> {
    return this.getAgentsAvailability(accountId, token, {
      skillId,
      state: AgentRoutingState.ONLINE,
      availableOnly: true,
    });
  }

  /**
   * Get all queue summary
   * Returns queue status for all skills
   */
  async getAllQueuesSummary(
    accountId: string,
    token: string,
  ): Promise<ILPResponse<IQueuesStatusResponse>> {
    return this.getQueuesStatus(accountId, token, {
      skillIds: 'all',
      includeEntries: false,
    });
  }
}
