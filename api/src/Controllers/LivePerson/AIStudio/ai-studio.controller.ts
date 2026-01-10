import { Controller, Get, Headers, Param, Post, Body, Put, Delete, Query, Patch } from '@nestjs/common';
import { AIStudioService } from './ai-studio.service';
import { API_ROUTES, MANAGER_ROLES } from '../../../constants/constants';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VerifyToken } from 'src/auth/auth.decorators';
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

@ApiTags('AI Studio')
@ApiBearerAuth()
@Controller(API_ROUTES.AI_STUDIO())
export class AIStudioController {
  constructor(private service: AIStudioService) {}

  // ==================== Categories ====================

  @Get(':accountId/categories')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully.' })
  async getCategories(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getCategories(accountId, token);
  }

  @Post(':accountId/categories')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 200, description: 'Category created successfully.' })
  async createCategory(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: CategoryCreateDto
  ): Promise<any> {
    return this.service.createCategory(accountId, token, body);
  }

  @Put(':accountId/categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  async updateCategory(
    @Param('accountId') accountId: string,
    @Param('categoryId') categoryId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: CategoryUpdateDto
  ): Promise<any> {
    return this.service.updateCategory(accountId, token, categoryId, body);
  }

  @Delete(':accountId/categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  async deleteCategory(
    @Param('accountId') accountId: string,
    @Param('categoryId') categoryId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteCategory(accountId, token, categoryId);
  }

  // ==================== Conversations ====================

  @Get(':accountId/conversations')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully.' })
  async getConversations(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query() query: ConversationQueryDto
  ): Promise<any[]> {
    return this.service.getConversations(accountId, token, query);
  }

  @Post(':accountId/conversations')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 200, description: 'Conversation created successfully.' })
  async createConversation(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: ConversationCreateDto
  ): Promise<any> {
    return this.service.createConversation(accountId, token, body);
  }

  @Get(':accountId/conversations/export')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Export conversations' })
  @ApiResponse({ status: 200, description: 'Conversations exported successfully.' })
  async exportConversations(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query() query: ConversationQueryDto
  ): Promise<any> {
    return this.service.exportConversations(accountId, token, query);
  }

  @Post(':accountId/conversations/upload')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Upload conversations' })
  @ApiResponse({ status: 200, description: 'Conversations uploaded successfully.' })
  async uploadConversations(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: { conversations: any[] }
  ): Promise<any[]> {
    return this.service.uploadConversations(accountId, token, body.conversations);
  }

  @Get(':accountId/conversations/:convId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get a specific conversation' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully.' })
  async getConversation(
    @Param('accountId') accountId: string,
    @Param('convId') convId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getConversation(accountId, token, convId);
  }

  @Put(':accountId/conversations/:convId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully.' })
  async updateConversation(
    @Param('accountId') accountId: string,
    @Param('convId') convId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: ConversationUpdateDto
  ): Promise<any> {
    return this.service.updateConversation(accountId, token, convId, body);
  }

  @Delete(':accountId/conversations/:convId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully.' })
  async deleteConversation(
    @Param('accountId') accountId: string,
    @Param('convId') convId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteConversation(accountId, token, convId);
  }

  @Put(':accountId/conversations/:convId/attributes')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update conversation attributes' })
  @ApiResponse({ status: 200, description: 'Conversation attributes updated successfully.' })
  async updateConversationAttributes(
    @Param('accountId') accountId: string,
    @Param('convId') convId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: ConversationAttributesUpdateDto
  ): Promise<any> {
    return this.service.updateConversationAttributes(accountId, token, convId, body);
  }

  @Patch(':accountId/conversations/:convId/close')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Close a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation closed successfully.' })
  async closeConversation(
    @Param('accountId') accountId: string,
    @Param('convId') convId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.closeConversation(accountId, token, convId);
  }

  // ==================== Summary ====================

  @Post(':accountId/summary')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create a conversation summary' })
  @ApiResponse({ status: 200, description: 'Summary created successfully.' })
  async createSummary(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: SummaryCreateDto
  ): Promise<any> {
    return this.service.createSummary(accountId, token, body);
  }

  @Post(':accountId/summary/batch')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create batch summaries' })
  @ApiResponse({ status: 200, description: 'Batch summary created successfully.' })
  async createBatchSummary(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: SummaryBatchCreateDto
  ): Promise<any> {
    return this.service.createBatchSummary(accountId, token, body);
  }

  @Get(':accountId/summary/batch')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get batch summaries' })
  @ApiResponse({ status: 200, description: 'Batch summaries retrieved successfully.' })
  async getBatchSummaries(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number
  ): Promise<any[]> {
    return this.service.getBatchSummaries(accountId, token, offset, limit);
  }

  @Get(':accountId/summary/batch/:summaryId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get a specific batch summary' })
  @ApiResponse({ status: 200, description: 'Batch summary retrieved successfully.' })
  async getBatchSummary(
    @Param('accountId') accountId: string,
    @Param('summaryId') summaryId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getBatchSummary(accountId, token, summaryId);
  }

  @Delete(':accountId/summary/batch/:summaryId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete a batch summary' })
  @ApiResponse({ status: 200, description: 'Batch summary deleted successfully.' })
  async deleteBatchSummary(
    @Param('accountId') accountId: string,
    @Param('summaryId') summaryId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteBatchSummary(accountId, token, summaryId);
  }

  // ==================== Query ====================

  @Post(':accountId/query')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Generate a conversation query' })
  @ApiResponse({ status: 200, description: 'Query generated successfully.' })
  async generateQuery(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: QueryGenerateDto
  ): Promise<any> {
    return this.service.generateQuery(accountId, token, body);
  }

  // ==================== Simulations ====================

  @Get(':accountId/simulations')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get simulations' })
  @ApiResponse({ status: 200, description: 'Simulations retrieved successfully.' })
  async getSimulations(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query() query: SimulationQueryDto
  ): Promise<any[]> {
    return this.service.getSimulations(accountId, token, query);
  }

  @Post(':accountId/simulations')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create a simulation' })
  @ApiResponse({ status: 200, description: 'Simulation created successfully.' })
  async createSimulation(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: SimulationCreateDto
  ): Promise<any> {
    return this.service.createSimulation(accountId, token, body);
  }

  @Get(':accountId/simulations/:simulationId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get a specific simulation' })
  @ApiResponse({ status: 200, description: 'Simulation retrieved successfully.' })
  async getSimulation(
    @Param('accountId') accountId: string,
    @Param('simulationId') simulationId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getSimulation(accountId, token, simulationId);
  }

  @Put(':accountId/simulations/:simulationId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update a simulation' })
  @ApiResponse({ status: 200, description: 'Simulation updated successfully.' })
  async updateSimulation(
    @Param('accountId') accountId: string,
    @Param('simulationId') simulationId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: SimulationUpdateDto
  ): Promise<any> {
    return this.service.updateSimulation(accountId, token, simulationId, body);
  }

  @Delete(':accountId/simulations/:simulationId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete a simulation' })
  @ApiResponse({ status: 200, description: 'Simulation deleted successfully.' })
  async deleteSimulation(
    @Param('accountId') accountId: string,
    @Param('simulationId') simulationId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteSimulation(accountId, token, simulationId);
  }

  @Get(':accountId/simulations/:simulationId/status')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get simulation status' })
  @ApiResponse({ status: 200, description: 'Simulation status retrieved successfully.' })
  async getSimulationStatus(
    @Param('accountId') accountId: string,
    @Param('simulationId') simulationId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getSimulationStatus(accountId, token, simulationId);
  }

  @Get(':accountId/simulations/:simulationId/jobs/:jobId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get simulation job results' })
  @ApiResponse({ status: 200, description: 'Simulation job results retrieved successfully.' })
  async getSimulationJobResults(
    @Param('accountId') accountId: string,
    @Param('simulationId') simulationId: string,
    @Param('jobId') jobId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getSimulationJobResults(accountId, token, simulationId, jobId);
  }

  @Post(':accountId/simulations/:simulationId/cancel')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Cancel a simulation' })
  @ApiResponse({ status: 200, description: 'Simulation cancelled successfully.' })
  async cancelSimulation(
    @Param('accountId') accountId: string,
    @Param('simulationId') simulationId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.cancelSimulation(accountId, token, simulationId);
  }

  // ==================== Transcript Analysis ====================

  @Post(':accountId/transcript-analysis')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create transcript analysis' })
  @ApiResponse({ status: 200, description: 'Transcript analysis created successfully.' })
  async createTranscriptAnalysis(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: TranscriptAnalysisCreateDto
  ): Promise<any> {
    return this.service.createTranscriptAnalysis(accountId, token, body);
  }

  @Get(':accountId/transcript-analysis')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get transcript analyses' })
  @ApiResponse({ status: 200, description: 'Transcript analyses retrieved successfully.' })
  async getTranscriptAnalyses(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query('owner') owner?: string,
    @Query('limit') limit?: number,
    @Query('start_after_id') startAfterId?: string
  ): Promise<any[]> {
    return this.service.getTranscriptAnalyses(accountId, token, owner, limit, startAfterId);
  }

  @Get(':accountId/transcript-analysis/:analysisId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get a specific transcript analysis' })
  @ApiResponse({ status: 200, description: 'Transcript analysis retrieved successfully.' })
  async getTranscriptAnalysis(
    @Param('accountId') accountId: string,
    @Param('analysisId') analysisId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query('exclude_conversations') excludeConversations?: boolean,
    @Query('exclude_questions') excludeQuestions?: boolean
  ): Promise<any> {
    return this.service.getTranscriptAnalysis(accountId, token, analysisId, excludeConversations, excludeQuestions);
  }

  @Put(':accountId/transcript-analysis/:analysisId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update transcript analysis' })
  @ApiResponse({ status: 200, description: 'Transcript analysis updated successfully.' })
  async updateTranscriptAnalysis(
    @Param('accountId') accountId: string,
    @Param('analysisId') analysisId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: TranscriptAnalysisUpdateDto
  ): Promise<any> {
    return this.service.updateTranscriptAnalysis(accountId, token, analysisId, body);
  }

  @Delete(':accountId/transcript-analysis/:analysisId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete transcript analysis' })
  @ApiResponse({ status: 200, description: 'Transcript analysis deleted successfully.' })
  async deleteTranscriptAnalysis(
    @Param('accountId') accountId: string,
    @Param('analysisId') analysisId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteTranscriptAnalysis(accountId, token, analysisId);
  }

  // ==================== Knowledgebases ====================

  @Get(':accountId/knowledgebases')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get all knowledgebases' })
  @ApiResponse({ status: 200, description: 'Knowledgebases retrieved successfully.' })
  async getKnowledgebases(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getKnowledgebases(accountId, token);
  }

  @Get(':accountId/knowledgebases/kai')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get KAI knowledgebases for account' })
  @ApiResponse({ status: 200, description: 'KAI knowledgebases retrieved successfully.' })
  async getKaiKnowledgebases(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getKaiKnowledgebases(accountId, token);
  }

  @Get(':accountId/knowledgebases/:kbId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get a specific knowledgebase' })
  @ApiResponse({ status: 200, description: 'Knowledgebase retrieved successfully.' })
  async getKnowledgebase(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getKnowledgebase(accountId, token, kbId);
  }

  @Delete(':accountId/knowledgebases/:kbId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete a knowledgebase' })
  @ApiResponse({ status: 200, description: 'Knowledgebase deleted successfully.' })
  async deleteKnowledgebase(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteKnowledgebase(accountId, token, kbId);
  }

  @Get(':accountId/knowledgebases/:kbId/health')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Calculate knowledgebase health' })
  @ApiResponse({ status: 200, description: 'Health calculated successfully.' })
  async calculateKbHealth(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.calculateKbHealth(accountId, token, kbId);
  }

  @Get(':accountId/knowledgebases/:kbId/refresh')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Refresh knowledgebase metadata' })
  @ApiResponse({ status: 200, description: 'Metadata refreshed successfully.' })
  async refreshKbMetadata(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.refreshKbMetadata(accountId, token, kbId);
  }

  @Post(':accountId/knowledgebases/:kbId/search')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Search a knowledgebase' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully.' })
  async searchKnowledgebase(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: KnowledgebaseSearchDto
  ): Promise<any[]> {
    return this.service.searchKnowledgebase(accountId, token, kbId, body);
  }

  @Get(':accountId/knowledgebases/:kbId/items')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get knowledgebase items' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully.' })
  async getKnowledgebaseItems(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getKnowledgebaseItems(accountId, token, kbId);
  }

  @Get(':accountId/knowledgebases/:kbId/items/:sourceId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get knowledgebase items by source' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully.' })
  async getKnowledgebaseItemsBySource(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Param('sourceId') sourceId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getKnowledgebaseItemsBySource(accountId, token, kbId, sourceId);
  }

  @Post(':accountId/knowledgebases/:kbId/items/:sourceId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create knowledgebase items' })
  @ApiResponse({ status: 200, description: 'Items created successfully.' })
  async createKnowledgebaseItem(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Param('sourceId') sourceId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: KnowledgebaseTextItemDto[]
  ): Promise<any[]> {
    return this.service.createKnowledgebaseItem(accountId, token, kbId, sourceId, body);
  }

  @Put(':accountId/knowledgebases/:kbId/items/:sourceId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update knowledgebase items' })
  @ApiResponse({ status: 200, description: 'Items updated successfully.' })
  async updateKnowledgebaseItem(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Param('sourceId') sourceId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: KnowledgebaseTextItemDto[]
  ): Promise<any[]> {
    return this.service.updateKnowledgebaseItem(accountId, token, kbId, sourceId, body);
  }

  @Delete(':accountId/knowledgebases/:kbId/items/:sourceId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete knowledgebase items' })
  @ApiResponse({ status: 200, description: 'Items deleted successfully.' })
  async deleteKnowledgebaseItem(
    @Param('accountId') accountId: string,
    @Param('kbId') kbId: string,
    @Param('sourceId') sourceId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: string[]
  ): Promise<string[]> {
    return this.service.deleteKnowledgebaseItem(accountId, token, kbId, sourceId, body);
  }

  // ==================== Evaluators ====================

  @Post(':accountId/evaluators/similarity')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Evaluate similarity' })
  @ApiResponse({ status: 200, description: 'Similarity evaluated successfully.' })
  async evaluateSimilarity(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query('type') evaluationType: string,
    @Body() body: SimilarityEvaluationDto
  ): Promise<any> {
    return this.service.evaluateSimilarity(accountId, token, evaluationType, body);
  }

  @Post(':accountId/evaluators/resolution')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Evaluate resolution' })
  @ApiResponse({ status: 200, description: 'Resolution evaluated successfully.' })
  async evaluateResolution(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: ResolutionEvaluationDto
  ): Promise<any> {
    return this.service.evaluateResolution(accountId, token, body);
  }

  @Post(':accountId/evaluators/guided-routing')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Evaluate guided routing' })
  @ApiResponse({ status: 200, description: 'Guided routing evaluated successfully.' })
  async evaluateGuidedRouting(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: GuidedRoutingEvaluationDto
  ): Promise<any> {
    return this.service.evaluateGuidedRouting(accountId, token, body);
  }

  // ==================== Generators ====================

  @Get(':accountId/generators/qa/model/:modelId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Generate Q&A from model' })
  @ApiResponse({ status: 200, description: 'Q&A generated successfully.' })
  async generateQAFromModel(
    @Param('accountId') accountId: string,
    @Param('modelId') modelId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.generateQAFromModel(accountId, token, modelId);
  }

  @Get(':accountId/generators/qa/knowledgebase')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Generate Q&A from knowledgebase' })
  @ApiResponse({ status: 200, description: 'Q&A generated successfully.' })
  async generateQAFromKnowledgebase(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query('kb_id') kbIds: string[],
    @Query('generate_answers') generateAnswers?: boolean,
    @Query('use_random_sections') useRandomSections?: boolean
  ): Promise<any> {
    return this.service.generateQAFromKnowledgebase(accountId, token, kbIds, generateAnswers, useRandomSections);
  }

  @Post(':accountId/generators/qa/conversation-cloud')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Generate Q&A from conversation cloud' })
  @ApiResponse({ status: 200, description: 'Q&A generated successfully.' })
  async generateQAFromConversationCloud(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: QuestionGeneratorDto
  ): Promise<any> {
    return this.service.generateQAFromConversationCloud(accountId, token, body);
  }

  @Post(':accountId/generators/routes/kai-llm')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Generate KAI routes using LLM' })
  @ApiResponse({ status: 200, description: 'Routes generated successfully.' })
  async generateKaiRoutesLlm(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: KAIRouteGeneratorDto
  ): Promise<any> {
    return this.service.generateKaiRoutesLlm(accountId, token, body);
  }

  @Post(':accountId/generators/routes/kai')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Generate KAI routes (non-LLM)' })
  @ApiResponse({ status: 200, description: 'Routes generated successfully.' })
  async generateKaiRoutesNonLlm(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: KAIRouteGeneratorDto
  ): Promise<number> {
    return this.service.generateKaiRoutesNonLlm(accountId, token, body);
  }

  @Get(':accountId/generators/routes/kai/status')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get KAI routes generation status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully.' })
  async getKaiRoutesGenerationStatus(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Query('flow_id') flowId: string
  ): Promise<any> {
    return this.service.getKaiRoutesGenerationStatus(accountId, token, flowId);
  }

  // ==================== Prompt Library ====================

  @Get(':accountId/prompt-library')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get account prompts' })
  @ApiResponse({ status: 200, description: 'Prompts retrieved successfully.' })
  async getAccountPrompts(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getAccountPrompts(accountId, token);
  }

  @Post(':accountId/prompt-library')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create a prompt' })
  @ApiResponse({ status: 200, description: 'Prompt created successfully.' })
  async createPrompt(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: PromptLibraryCreateDto
  ): Promise<any> {
    return this.service.createPrompt(accountId, token, body);
  }

  @Put(':accountId/prompt-library/:promptId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update a prompt' })
  @ApiResponse({ status: 200, description: 'Prompt updated successfully.' })
  async updatePrompt(
    @Param('accountId') accountId: string,
    @Param('promptId') promptId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: PromptLibraryUpdateDto
  ): Promise<any> {
    return this.service.updatePrompt(accountId, token, promptId, body);
  }

  @Get(':accountId/prompt-library/providers')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get LLM providers' })
  @ApiResponse({ status: 200, description: 'Providers retrieved successfully.' })
  async getLlmProviders(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getLlmProviders(accountId, token);
  }

  @Get(':accountId/prompt-library/system')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get system prompts' })
  @ApiResponse({ status: 200, description: 'System prompts retrieved successfully.' })
  async getSystemPrompts(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any[]> {
    return this.service.getSystemPrompts(accountId, token);
  }

  // ==================== Users ====================

  @Get(':accountId/users/self')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  async getSelf(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getSelf(accountId, token);
  }

  @Get(':accountId/users')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  async getUsers(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getUsers(accountId, token);
  }

  @Get(':accountId/users/details')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Get all users with details' })
  @ApiResponse({ status: 200, description: 'Users details retrieved successfully.' })
  async getUsersDetails(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.getUsersDetails(accountId, token);
  }

  @Post(':accountId/users')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 200, description: 'User created successfully.' })
  async createUser(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: AIStudioUserCreateDto
  ): Promise<any> {
    return this.service.createUser(accountId, token, body);
  }

  @Put(':accountId/users/:userId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async updateUser(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: AIStudioUserUpdateDto
  ): Promise<any> {
    return this.service.updateUser(accountId, token, userId, body);
  }

  @Delete(':accountId/users/:userId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async deleteUser(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<string> {
    return this.service.deleteUser(accountId, token, userId);
  }

  @Put(':accountId/users/:userId/models')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Update user models' })
  @ApiResponse({ status: 200, description: 'User models updated successfully.' })
  async updateUserModels(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: AIStudioUserModelUpdateDto
  ): Promise<any> {
    return this.service.updateUserModels(accountId, token, userId, body);
  }

  @Get(':accountId/users/:userId/terms')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Agree to terms' })
  @ApiResponse({ status: 200, description: 'Terms agreed successfully.' })
  async agreeToTerms(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string
  ): Promise<any> {
    return this.service.agreeToTerms(accountId, token, userId);
  }

  // ==================== Flows (Original Methods) ====================

  @Get(':accountId/flows')
  @ApiOperation({ summary: 'Get Flows' })
  @ApiResponse({ status: 200, description: 'The flows have been successfully retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getFlows(
    @Param('accountId') accountId: string,
    @Headers('authorization') authHeader: string
  ): Promise<any> | null {
    // Extract token from Bearer or CC-Bearer header
    const token = authHeader?.replace(/^(CC-)?Bearer\s+/i, '') || '';
    console.info('Getting flows for account:', accountId);
    return this.service.listFlows(accountId, token);
  }

  @Post(':accountId/flows/response')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Invoke Flow with Response' })
  @ApiResponse({ status: 200, description: 'The flow has been successfully invoked with response.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async invokeFlowWithResponse(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: string,
    @Body() body: {
      prompt: string;
    }
  ): Promise<any> | null {
    return this.service.getFlowResponse(accountId, token, body.prompt);
  }

  @Get(':accountId/flows/:flowId')
  @ApiOperation({ summary: 'Get Flow Details' })
  @ApiResponse({ status: 200, description: 'The flow details have been successfully retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getFlow(
    @Param('accountId') accountId: string,
    @Param('flowId') flowId: string,
    @Headers('authorization') authHeader: string
  ): Promise<any> | null {
    const token = authHeader?.replace(/^(CC-)?Bearer\s+/i, '') || '';
    return this.service.getFlow(accountId, token, flowId);
  }

  @Post(':accountId/flows/:flowId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @ApiOperation({ summary: 'Invoke Flow' })
  @ApiResponse({ status: 200, description: 'The flow has been successfully invoked.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async invokeFlow(
    @Param('accountId') accountId: string,
    @Param('flowId') flowId: string,
    @Headers('authorization') token: string,
    @Body() body: any
  ): Promise<any> | null {
    return this.service.invokeFlow(accountId, token, body, flowId);
  }
}
