/**
 * AI Studio Service
 * Business logic for LivePerson AI Studio APIs using SDK
 * Uses CC-Bearer authentication mode (handled automatically by SDK)
 */

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Scopes } from '@lpextend/node-sdk';
import type {
  AIStudioCategory,
  AIStudioConversation,
  AIStudioSimulation,
  AIStudioSummary,
  Knowledgebase,
  AIStudioFlow,
  AIStudioUser,
  Prompt,
  TranscriptAnalysis,
} from '@lpextend/node-sdk';
import { SDKProviderService, TokenInfo } from '../shared/sdk-provider.service';
import {
  CategoryCreateDto,
  CategoryUpdateDto,
  ConversationCreateDto,
  ConversationUpdateDto,
  ConversationQueryDto,
  ConversationAttributesUpdateDto,
  SummaryCreateDto,
  SummaryBatchCreateDto,
  QueryGenerateDto,
  SimulationCreateDto,
  SimulationUpdateDto,
  SimulationQueryDto,
  TranscriptAnalysisCreateDto,
  TranscriptAnalysisUpdateDto,
  KnowledgebaseSearchDto,
  KnowledgebaseTextItemDto,
  FlowInvokeDto,
  SimilarityEvaluationDto,
  ResolutionEvaluationDto,
  GuidedRoutingEvaluationDto,
  QuestionGeneratorDto,
  KAIRouteGeneratorDto,
  PromptLibraryCreateDto,
  PromptLibraryUpdateDto,
  AIStudioUserCreateDto,
  AIStudioUserUpdateDto,
  AIStudioUserModelUpdateDto,
} from './ai-studio.dto';
import { createPromptlessFlow } from './promptlessFlow';

export const context = '[AIStudioService]';

@Injectable()
export class AIStudioService {
  constructor(
    @InjectPinoLogger(AIStudioService.name)
    private readonly logger: PinoLogger,
    private readonly sdkProvider: SDKProviderService,
  ) {
    this.logger.setContext(context);
  }

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.AI_STUDIO]);
  }

  // ==================== Categories ====================

  async getCategories(accountId: string, token: TokenInfo | string): Promise<AIStudioCategory[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio categories via SDK');
    const response = await sdk.aiStudio.categories.getAll();
    return response.data;
  }

  async createCategory(accountId: string, token: TokenInfo | string, body: CategoryCreateDto): Promise<AIStudioCategory> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio category via SDK');
    const response = await sdk.aiStudio.categories.create(body as any);
    return response.data;
  }

  async updateCategory(accountId: string, token: TokenInfo | string, categoryId: string, body: CategoryUpdateDto): Promise<AIStudioCategory> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, categoryId }, 'Updating AI Studio category via SDK');
    const response = await sdk.aiStudio.categories.update(categoryId, body as any);
    return response.data;
  }

  async deleteCategory(accountId: string, token: TokenInfo | string, categoryId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, categoryId }, 'Deleting AI Studio category via SDK');
    await sdk.aiStudio.categories.delete(categoryId);
    return 'success';
  }

  // ==================== Conversations ====================

  async getConversations(accountId: string, token: TokenInfo | string, query?: ConversationQueryDto): Promise<AIStudioConversation[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio conversations via SDK');
    const response = await sdk.aiStudio.conversations.getAll(query as any);
    return response.data;
  }

  async createConversation(accountId: string, token: TokenInfo | string, body: ConversationCreateDto): Promise<AIStudioConversation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio conversation via SDK');
    const response = await sdk.aiStudio.conversations.create(body as any);
    return response.data;
  }

  async getConversation(accountId: string, token: TokenInfo | string, convId: string): Promise<AIStudioConversation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, convId }, 'Getting AI Studio conversation via SDK');
    const response = await sdk.aiStudio.conversations.getById(convId);
    return response.data;
  }

  async updateConversation(accountId: string, token: TokenInfo | string, convId: string, body: ConversationUpdateDto): Promise<AIStudioConversation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, convId }, 'Updating AI Studio conversation via SDK');
    const response = await sdk.aiStudio.conversations.update(convId, body as any);
    return response.data;
  }

  async deleteConversation(accountId: string, token: TokenInfo | string, convId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, convId }, 'Deleting AI Studio conversation via SDK');
    await sdk.aiStudio.conversations.delete(convId);
    return 'success';
  }

  async updateConversationAttributes(
    accountId: string,
    token: TokenInfo | string,
    convId: string,
    body: ConversationAttributesUpdateDto
  ): Promise<AIStudioConversation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, convId }, 'Updating AI Studio conversation attributes via SDK');
    const response = await sdk.aiStudio.conversations.updateAttributes(convId, body as any);
    return response.data;
  }

  async closeConversation(accountId: string, token: TokenInfo | string, convId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, convId }, 'Closing AI Studio conversation via SDK');
    await sdk.aiStudio.conversations.close(convId);
    return 'success';
  }

  async exportConversations(accountId: string, token: TokenInfo | string, query?: ConversationQueryDto): Promise<AIStudioConversation[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Exporting AI Studio conversations via SDK');
    const response = await sdk.aiStudio.conversations.export(query as any);
    return response.data;
  }

  async uploadConversations(accountId: string, token: TokenInfo | string, conversations: any[]): Promise<AIStudioConversation[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, count: conversations.length }, 'Uploading AI Studio conversations via SDK');
    const response = await sdk.aiStudio.conversations.upload(conversations as any);
    return response.data;
  }

  // ==================== Summary ====================

  async createSummary(accountId: string, token: TokenInfo | string, body: SummaryCreateDto): Promise<AIStudioSummary> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio summary via SDK');
    const response = await sdk.aiStudio.summary.create(body as any);
    return response.data;
  }

  async createBatchSummary(accountId: string, token: TokenInfo | string, body: SummaryBatchCreateDto): Promise<AIStudioSummary> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio batch summary via SDK');
    const response = await sdk.aiStudio.summary.createBatch(body as any);
    return response.data;
  }

  async getBatchSummaries(accountId: string, token: TokenInfo | string, offset = 0, limit = 10): Promise<AIStudioSummary[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, offset, limit }, 'Getting AI Studio batch summaries via SDK');
    const response = await sdk.aiStudio.summary.getBatch(offset, limit);
    return response.data;
  }

  async getBatchSummary(accountId: string, token: TokenInfo | string, summaryId: string): Promise<AIStudioSummary> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, summaryId }, 'Getting AI Studio batch summary via SDK');
    const response = await sdk.aiStudio.summary.getBatchById(summaryId);
    return response.data;
  }

  async deleteBatchSummary(accountId: string, token: TokenInfo | string, summaryId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, summaryId }, 'Deleting AI Studio batch summary via SDK');
    await sdk.aiStudio.summary.deleteBatch(summaryId);
    return 'success';
  }

  // ==================== Query ====================

  async generateQuery(accountId: string, token: TokenInfo | string, body: QueryGenerateDto): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Generating AI Studio query via SDK');
    const response = await sdk.aiStudio.query.generate(body as any);
    return response.data;
  }

  // ==================== Simulations ====================

  async getSimulations(accountId: string, token: TokenInfo | string, query?: SimulationQueryDto): Promise<AIStudioSimulation[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio simulations via SDK');
    const response = await sdk.aiStudio.simulations.getAll(query as any);
    return response.data;
  }

  async createSimulation(accountId: string, token: TokenInfo | string, body: SimulationCreateDto): Promise<AIStudioSimulation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio simulation via SDK');
    const response = await sdk.aiStudio.simulations.create(body as any);
    return response.data;
  }

  async getSimulation(accountId: string, token: TokenInfo | string, simulationId: string): Promise<AIStudioSimulation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, simulationId }, 'Getting AI Studio simulation via SDK');
    const response = await sdk.aiStudio.simulations.getById(simulationId);
    return response.data;
  }

  async updateSimulation(accountId: string, token: TokenInfo | string, simulationId: string, body: SimulationUpdateDto): Promise<AIStudioSimulation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, simulationId }, 'Updating AI Studio simulation via SDK');
    const response = await sdk.aiStudio.simulations.update(simulationId, body as any);
    return response.data;
  }

  async deleteSimulation(accountId: string, token: TokenInfo | string, simulationId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, simulationId }, 'Deleting AI Studio simulation via SDK');
    await sdk.aiStudio.simulations.delete(simulationId);
    return 'success';
  }

  async getSimulationStatus(accountId: string, token: TokenInfo | string, simulationId: string): Promise<AIStudioSimulation> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, simulationId }, 'Getting AI Studio simulation status via SDK');
    const response = await sdk.aiStudio.simulations.getStatus(simulationId);
    return response.data;
  }

  async getSimulationJobResults(accountId: string, token: TokenInfo | string, simulationId: string, jobId: string): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, simulationId, jobId }, 'Getting AI Studio simulation job results via SDK');
    const response = await sdk.aiStudio.simulations.getJobResults(simulationId, jobId);
    return response.data;
  }

  async cancelSimulation(accountId: string, token: TokenInfo | string, simulationId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, simulationId }, 'Canceling AI Studio simulation via SDK');
    await sdk.aiStudio.simulations.cancel(simulationId);
    return 'success';
  }

  // ==================== Transcript Analysis ====================

  async createTranscriptAnalysis(accountId: string, token: TokenInfo | string, body: TranscriptAnalysisCreateDto): Promise<TranscriptAnalysis> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio transcript analysis via SDK');
    const response = await sdk.aiStudio.transcriptAnalysis.create(body as any);
    return response.data;
  }

  async getTranscriptAnalyses(accountId: string, token: TokenInfo | string, owner = 'self', limit = 10, startAfterId?: string): Promise<TranscriptAnalysis[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, owner, limit }, 'Getting AI Studio transcript analyses via SDK');
    const response = await sdk.aiStudio.transcriptAnalysis.getAll(owner, limit, startAfterId);
    return response.data;
  }

  async getTranscriptAnalysis(
    accountId: string,
    token: TokenInfo | string,
    analysisId: string,
    excludeConversations = false,
    excludeQuestions = false
  ): Promise<TranscriptAnalysis> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, analysisId }, 'Getting AI Studio transcript analysis via SDK');
    const response = await sdk.aiStudio.transcriptAnalysis.getById(analysisId, excludeConversations, excludeQuestions);
    return response.data;
  }

  async updateTranscriptAnalysis(
    accountId: string,
    token: TokenInfo | string,
    analysisId: string,
    body: TranscriptAnalysisUpdateDto
  ): Promise<TranscriptAnalysis> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, analysisId }, 'Updating AI Studio transcript analysis via SDK');
    const response = await sdk.aiStudio.transcriptAnalysis.update(analysisId, body as any);
    return response.data;
  }

  async deleteTranscriptAnalysis(accountId: string, token: TokenInfo | string, analysisId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, analysisId }, 'Deleting AI Studio transcript analysis via SDK');
    await sdk.aiStudio.transcriptAnalysis.delete(analysisId);
    return 'success';
  }

  // ==================== Knowledgebases ====================

  async getKnowledgebases(accountId: string, token: TokenInfo | string): Promise<Knowledgebase[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio knowledgebases via SDK');
    const response = await sdk.aiStudio.knowledgebases.getAll();
    return response.data;
  }

  async getKnowledgebase(accountId: string, token: TokenInfo | string, kbId: string): Promise<Knowledgebase> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId }, 'Getting AI Studio knowledgebase via SDK');
    const response = await sdk.aiStudio.knowledgebases.getById(kbId);
    return response.data;
  }

  async deleteKnowledgebase(accountId: string, token: TokenInfo | string, kbId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId }, 'Deleting AI Studio knowledgebase via SDK');
    await sdk.aiStudio.knowledgebases.delete(kbId);
    return 'success';
  }

  async calculateKbHealth(accountId: string, token: TokenInfo | string, kbId: string): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId }, 'Calculating AI Studio knowledgebase health via SDK');
    const response = await sdk.aiStudio.knowledgebases.getHealth(kbId);
    return response.data;
  }

  async refreshKbMetadata(accountId: string, token: TokenInfo | string, kbId: string): Promise<Knowledgebase> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId }, 'Refreshing AI Studio knowledgebase metadata via SDK');
    const response = await sdk.aiStudio.knowledgebases.refresh(kbId);
    return response.data;
  }

  async searchKnowledgebase(accountId: string, token: TokenInfo | string, kbId: string, body: KnowledgebaseSearchDto): Promise<any[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId }, 'Searching AI Studio knowledgebase via SDK');
    const response = await sdk.aiStudio.knowledgebases.search(kbId, body as any);
    return response.data;
  }

  async getKnowledgebaseItems(accountId: string, token: TokenInfo | string, kbId: string): Promise<any[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId }, 'Getting AI Studio knowledgebase items via SDK');
    const response = await sdk.aiStudio.knowledgebases.getItems(kbId);
    return response.data;
  }

  async getKnowledgebaseItemsBySource(accountId: string, token: TokenInfo | string, kbId: string, sourceId: string): Promise<any[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId, sourceId }, 'Getting AI Studio knowledgebase items by source via SDK');
    const response = await sdk.aiStudio.knowledgebases.getItemsBySource(kbId, sourceId);
    return response.data;
  }

  async createKnowledgebaseItem(
    accountId: string,
    token: TokenInfo | string,
    kbId: string,
    sourceId: string,
    items: KnowledgebaseTextItemDto[]
  ): Promise<any[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId, sourceId }, 'Creating AI Studio knowledgebase items via SDK');
    const response = await sdk.aiStudio.knowledgebases.createItems(kbId, sourceId, items as any);
    return response.data;
  }

  async updateKnowledgebaseItem(
    accountId: string,
    token: TokenInfo | string,
    kbId: string,
    sourceId: string,
    items: KnowledgebaseTextItemDto[]
  ): Promise<any[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId, sourceId }, 'Updating AI Studio knowledgebase items via SDK');
    const response = await sdk.aiStudio.knowledgebases.updateItems(kbId, sourceId, items as any);
    return response.data;
  }

  async deleteKnowledgebaseItem(accountId: string, token: TokenInfo | string, kbId: string, sourceId: string, ids: string[]): Promise<string[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbId, sourceId }, 'Deleting AI Studio knowledgebase items via SDK');
    const response = await sdk.aiStudio.knowledgebases.deleteItems(kbId, sourceId, ids);
    return response.data;
  }

  async getKaiKnowledgebases(accountId: string, token: TokenInfo | string): Promise<Knowledgebase[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio KAI knowledgebases via SDK');
    const response = await sdk.aiStudio.knowledgebases.getKai();
    return response.data;
  }

  // ==================== Evaluators ====================

  async evaluateSimilarity(
    accountId: string,
    token: TokenInfo | string,
    evaluationType: string,
    body: SimilarityEvaluationDto
  ): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, evaluationType }, 'Evaluating similarity via SDK');
    const response = await sdk.aiStudio.evaluators.similarity(evaluationType, body as any);
    return response.data;
  }

  async evaluateResolution(accountId: string, token: TokenInfo | string, body: ResolutionEvaluationDto): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Evaluating resolution via SDK');
    const response = await sdk.aiStudio.evaluators.resolution(body as any);
    return response.data;
  }

  async evaluateGuidedRouting(accountId: string, token: TokenInfo | string, body: GuidedRoutingEvaluationDto): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Evaluating guided routing via SDK');
    const response = await sdk.aiStudio.evaluators.guidedRouting(body as any);
    return response.data;
  }

  // ==================== Generators ====================

  async generateQAFromModel(accountId: string, token: TokenInfo | string, modelId: string): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, modelId }, 'Generating QA from model via SDK');
    const response = await sdk.aiStudio.generators.qaFromModel(modelId);
    return response.data;
  }

  async generateQAFromKnowledgebase(
    accountId: string,
    token: TokenInfo | string,
    kbIds: string[],
    generateAnswers = true,
    useRandomSections = false
  ): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, kbIds }, 'Generating QA from knowledgebase via SDK');
    const response = await sdk.aiStudio.generators.qaFromKnowledgebase(kbIds, generateAnswers, useRandomSections);
    return response.data;
  }

  async generateQAFromConversationCloud(accountId: string, token: TokenInfo | string, body: QuestionGeneratorDto): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Generating QA from conversation cloud via SDK');
    const response = await sdk.aiStudio.generators.qaFromConversationCloud(body as any);
    return response.data;
  }

  async generateKaiRoutesLlm(accountId: string, token: TokenInfo | string, body: KAIRouteGeneratorDto): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Generating KAI routes (LLM) via SDK');
    const response = await sdk.aiStudio.generators.kaiRoutesLlm(body as any);
    return response.data;
  }

  async generateKaiRoutesNonLlm(accountId: string, token: TokenInfo | string, body: KAIRouteGeneratorDto): Promise<number> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Generating KAI routes (non-LLM) via SDK');
    const response = await sdk.aiStudio.generators.kaiRoutes(body as any);
    return response.data;
  }

  async getKaiRoutesGenerationStatus(accountId: string, token: TokenInfo | string, flowId: string): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, flowId }, 'Getting KAI routes generation status via SDK');
    const response = await sdk.aiStudio.generators.kaiRoutesStatus(flowId);
    return response.data;
  }

  // ==================== Prompt Library ====================

  async getAccountPrompts(accountId: string, token: TokenInfo | string): Promise<Prompt[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio account prompts via SDK');
    const response = await sdk.aiStudio.promptLibrary.getAll();
    return response.data;
  }

  async createPrompt(accountId: string, token: TokenInfo | string, body: PromptLibraryCreateDto): Promise<Prompt> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio prompt via SDK');
    const response = await sdk.aiStudio.promptLibrary.create(body as any);
    return response.data;
  }

  async updatePrompt(accountId: string, token: TokenInfo | string, promptId: string, body: PromptLibraryUpdateDto): Promise<Prompt> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, promptId }, 'Updating AI Studio prompt via SDK');
    const response = await sdk.aiStudio.promptLibrary.update(promptId, body as any);
    return response.data;
  }

  async getLlmProviders(accountId: string, token: TokenInfo | string): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio LLM providers via SDK');
    const response = await sdk.aiStudio.promptLibrary.getProviders();
    return response.data;
  }

  async getSystemPrompts(accountId: string, token: TokenInfo | string): Promise<Prompt[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio system prompts via SDK');
    const response = await sdk.aiStudio.promptLibrary.getSystemPrompts();
    return response.data;
  }

  // ==================== Users ====================

  async getSelf(accountId: string, token: TokenInfo | string): Promise<AIStudioUser> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio self via SDK');
    const response = await sdk.aiStudio.users.getSelf();
    return response.data;
  }

  async getUsers(accountId: string, token: TokenInfo | string): Promise<AIStudioUser[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio users via SDK');
    const response = await sdk.aiStudio.users.getAll();
    return response.data;
  }

  async getUsersDetails(accountId: string, token: TokenInfo | string): Promise<AIStudioUser[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio users details via SDK');
    const response = await sdk.aiStudio.users.getDetails();
    return response.data;
  }

  async createUser(accountId: string, token: TokenInfo | string, body: AIStudioUserCreateDto): Promise<AIStudioUser> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Creating AI Studio user via SDK');
    const response = await sdk.aiStudio.users.create(body as any);
    return response.data;
  }

  async updateUser(accountId: string, token: TokenInfo | string, userId: string, body: AIStudioUserUpdateDto): Promise<AIStudioUser> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, userId }, 'Updating AI Studio user via SDK');
    const response = await sdk.aiStudio.users.update(userId, body as any);
    return response.data;
  }

  async deleteUser(accountId: string, token: TokenInfo | string, userId: string): Promise<string> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, userId }, 'Deleting AI Studio user via SDK');
    await sdk.aiStudio.users.delete(userId);
    return 'success';
  }

  async updateUserModels(accountId: string, token: TokenInfo | string, userId: string, body: AIStudioUserModelUpdateDto): Promise<AIStudioUser> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, userId }, 'Updating AI Studio user models via SDK');
    const response = await sdk.aiStudio.users.updateModels(userId, body as any);
    return response.data;
  }

  async agreeToTerms(accountId: string, token: TokenInfo | string, userId: string): Promise<AIStudioUser> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, userId }, 'Agreeing to AI Studio terms via SDK');
    const response = await sdk.aiStudio.users.agreeToTerms(userId);
    return response.data;
  }

  // ==================== Flows (V2) ====================

  async startConversation(accountId: string, token: TokenInfo | string, body: any): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Starting AI Studio conversation via SDK');

    try {
      // This maps to the aiStudio conversations API
      const response = await sdk.aiStudio.conversations.create(body as any);
      return response.data;
    } catch (error) {
      this.logger.error({
        message: 'Error starting conversation',
        error: error.message,
        accountId
      });
      throw new InternalServerErrorException(error);
    }
  }

  async listFlows(accountId: string, token: TokenInfo | string): Promise<AIStudioFlow[]> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Listing AI Studio flows via SDK');
    const response = await sdk.aiStudio.flows.getAll();
    return response.data;
  }

  async getFlow(accountId: string, token: TokenInfo | string, flowId: string): Promise<AIStudioFlow> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, flowId }, 'Getting AI Studio flow via SDK');
    const response = await sdk.aiStudio.flows.getById(flowId);
    return response.data;
  }

  async invokeFlow(accountId: string, token: TokenInfo | string, body: any, flowId: string): Promise<any> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId, flowId }, 'Invoking AI Studio flow via SDK');

    try {
      const response = await sdk.aiStudio.flows.invoke(flowId, body);
      return response.data;
    } catch (error) {
      this.logger.error({
        message: 'Error invoking flow',
        error: error.message,
        accountId,
        flowId
      });
      throw new InternalServerErrorException(error);
    }
  }

  async getFlowResponse(
    accountId: string,
    token: TokenInfo | string,
    prompt: string,
    messages: any[] = [],
    text?: string
  ): Promise<{
    text: string;
    speaker: string;
    time: number;
    id: string;
  }> {
    const sdk = await this.getSDK(accountId, token);
    this.logger.info({ accountId }, 'Getting AI Studio flow response via SDK');

    try {
      const response = await sdk.aiStudio.flows.invokeWithResponse(
        prompt,
        messages.map(m => ({ text: m.text || '', speaker: m.speaker || '' })),
        text
      );

      // Return first response item
      const data = response.data as any;
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      return data;
    } catch (error) {
      this.logger.error({
        message: 'Error getting flow response',
        error: error.message,
        accountId
      });
      throw new InternalServerErrorException(error);
    }
  }

  // Legacy method aliases for backward compatibility
  async generateQAFromSimulation(
    accountId: string,
    token: TokenInfo | string,
    simulationId: string,
    batchSize: number,
    delimiter: string
  ): Promise<any> {
    // This endpoint may not be in SDK yet, log warning
    this.logger.warn({ accountId, simulationId }, 'generateQAFromSimulation may not be fully supported via SDK');
    const sdk = await this.getSDK(accountId, token);
    // Try using the qaFromModel as a fallback or implement direct HTTP call if needed
    return null;
  }
}
