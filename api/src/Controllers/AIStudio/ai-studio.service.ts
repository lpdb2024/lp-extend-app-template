import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import { helper } from 'src/utils/HelperService';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { createPromptlessFlow } from './promptlessFlow';
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
  FlowCreateDto,
  FlowUpdateDto,
  FlowQueryDto,
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

export const context = '[AIStudioService]';

@Injectable()
export class AIStudioService {
  private readonly serviceName = 'aistudio';

  constructor(
    @InjectPinoLogger(AIStudioService.name)
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService
  ) {
    this.logger.setContext(context);
  }

  /**
   * Get the AI Studio domain for an account
   */
  private async getDomain(accountId: string): Promise<string | null> {
    const domain = await this.helperService.getDomain(accountId, this.serviceName);
    if (!domain) {
      this.logger.error({
        message: `Domain not found for service: ${this.serviceName}`,
        accountId
      });
    }
    return domain;
  }

  /**
   * Get authorization headers for AI Studio API calls
   */
  private getHeaders(token: string): Record<string, string> {
    return {
      'Authorization': helper.insertCCBearer(token),
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make a GET request to AI Studio API
   */
  private async get<T>(
    accountId: string,
    token: string,
    path: string,
    params?: Record<string, any>,
    timeout = 10000
  ): Promise<T> {
    const domain = await this.getDomain(accountId);
    if (!domain) throw new NotFoundException('AI Studio domain not found');

    const url = `https://${domain}/api${path}`;
    const headers = this.getHeaders(token);

    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { headers, params, timeout }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error({
            message: 'AI Studio GET request failed',
            path,
            error: error.response?.data,
            accountId
          });
          throw error;
        })
      )
    );
    return data;
  }

  /**
   * Make a POST request to AI Studio API
   */
  private async post<T>(
    accountId: string,
    token: string,
    path: string,
    body?: any,
    timeout = 40000
  ): Promise<T> {
    const domain = await this.getDomain(accountId);
    if (!domain) throw new NotFoundException('AI Studio domain not found');

    const url = `https://${domain}/api${path}`;
    const headers = this.getHeaders(token);

    const { data } = await firstValueFrom(
      this.httpService.post<T>(url, body, { headers, timeout }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error({
            message: 'AI Studio POST request failed',
            path,
            error: error.response?.data,
            accountId
          });
          throw error;
        })
      )
    );
    return data;
  }

  /**
   * Make a PUT request to AI Studio API
   */
  private async put<T>(
    accountId: string,
    token: string,
    path: string,
    body?: any,
    customHeaders?: Record<string, string>,
    timeout = 10000
  ): Promise<T> {
    const domain = await this.getDomain(accountId);
    if (!domain) throw new NotFoundException('AI Studio domain not found');

    const url = `https://${domain}/api${path}`;
    const headers = { ...this.getHeaders(token), ...customHeaders };

    const { data } = await firstValueFrom(
      this.httpService.put<T>(url, body, { headers, timeout }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error({
            message: 'AI Studio PUT request failed',
            path,
            error: error.response?.data,
            accountId
          });
          throw error;
        })
      )
    );
    return data;
  }

  /**
   * Make a PATCH request to AI Studio API
   */
  private async patch<T>(
    accountId: string,
    token: string,
    path: string,
    body?: any,
    timeout = 10000
  ): Promise<T> {
    const domain = await this.getDomain(accountId);
    if (!domain) throw new NotFoundException('AI Studio domain not found');

    const url = `https://${domain}/api${path}`;
    const headers = this.getHeaders(token);

    const { data } = await firstValueFrom(
      this.httpService.patch<T>(url, body, { headers, timeout }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error({
            message: 'AI Studio PATCH request failed',
            path,
            error: error.response?.data,
            accountId
          });
          throw error;
        })
      )
    );
    return data;
  }

  /**
   * Make a DELETE request to AI Studio API
   */
  private async delete<T>(
    accountId: string,
    token: string,
    path: string,
    customHeaders?: Record<string, string>,
    timeout = 10000
  ): Promise<T> {
    const domain = await this.getDomain(accountId);
    if (!domain) throw new NotFoundException('AI Studio domain not found');

    const url = `https://${domain}/api${path}`;
    const headers = { ...this.getHeaders(token), ...customHeaders };

    const { data } = await firstValueFrom(
      this.httpService.delete<T>(url, { headers, timeout }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error({
            message: 'AI Studio DELETE request failed',
            path,
            error: error.response?.data,
            accountId
          });
          throw error;
        })
      )
    );
    return data;
  }

  // ==================== Categories ====================

  async getCategories(accountId: string, token: string): Promise<any[]> {
    return this.get(accountId, token, '/v1/categories');
  }

  async createCategory(accountId: string, token: string, body: CategoryCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/categories', body);
  }

  async updateCategory(accountId: string, token: string, categoryId: string, body: CategoryUpdateDto): Promise<any> {
    return this.put(accountId, token, `/v1/categories/${categoryId}`, body);
  }

  async deleteCategory(accountId: string, token: string, categoryId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/categories/${categoryId}`);
  }

  // ==================== Conversations ====================

  async getConversations(accountId: string, token: string, query?: ConversationQueryDto): Promise<any[]> {
    return this.get(accountId, token, '/v1/conversations', { ...query, account_id: accountId });
  }

  async createConversation(accountId: string, token: string, body: ConversationCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/conversations', body);
  }

  async getConversation(accountId: string, token: string, convId: string): Promise<any> {
    return this.get(accountId, token, `/v1/conversations/${convId}`);
  }

  async updateConversation(accountId: string, token: string, convId: string, body: ConversationUpdateDto): Promise<any> {
    return this.put(accountId, token, `/v1/conversations/${convId}`, body);
  }

  async deleteConversation(accountId: string, token: string, convId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/conversations/${convId}`);
  }

  async updateConversationAttributes(
    accountId: string,
    token: string,
    convId: string,
    body: ConversationAttributesUpdateDto
  ): Promise<any> {
    return this.put(accountId, token, `/v1/conversations/${convId}/attributes`, body);
  }

  async closeConversation(accountId: string, token: string, convId: string): Promise<string> {
    return this.patch(accountId, token, `/v1/conversations/${convId}/close`);
  }

  async exportConversations(accountId: string, token: string, query?: ConversationQueryDto): Promise<any> {
    return this.get(accountId, token, '/v1/conversations/export', { ...query, account_id: accountId });
  }

  async uploadConversations(accountId: string, token: string, conversations: any[]): Promise<any[]> {
    return this.post(accountId, token, '/v1/conversations/upload', {
      account_id: accountId,
      conversations
    });
  }

  // ==================== Summary ====================

  async createSummary(accountId: string, token: string, body: SummaryCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/summary', body);
  }

  async createBatchSummary(accountId: string, token: string, body: SummaryBatchCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/summary/batch', body);
  }

  async getBatchSummaries(accountId: string, token: string, offset = 0, limit = 10): Promise<any[]> {
    return this.get(accountId, token, '/v1/summary/batch', { offset, limit, account_id: accountId });
  }

  async getBatchSummary(accountId: string, token: string, summaryId: string): Promise<any> {
    return this.get(accountId, token, `/v1/summary/batch/${summaryId}`);
  }

  async deleteBatchSummary(accountId: string, token: string, summaryId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/summary/batch/${summaryId}`);
  }

  // ==================== Query ====================

  async generateQuery(accountId: string, token: string, body: QueryGenerateDto): Promise<any> {
    return this.post(accountId, token, '/v1/query', body);
  }

  // ==================== Simulations ====================

  async getSimulations(accountId: string, token: string, query?: SimulationQueryDto): Promise<any[]> {
    return this.get(accountId, token, '/v1/simulations', { ...query, account_id: accountId });
  }

  async createSimulation(accountId: string, token: string, body: SimulationCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/simulations', body);
  }

  async getSimulation(accountId: string, token: string, simulationId: string): Promise<any> {
    return this.get(accountId, token, `/v1/simulations/${simulationId}`);
  }

  async updateSimulation(accountId: string, token: string, simulationId: string, body: SimulationUpdateDto): Promise<any> {
    return this.put(accountId, token, `/v1/simulations/${simulationId}`, body);
  }

  async deleteSimulation(accountId: string, token: string, simulationId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/simulations/${simulationId}`);
  }

  async getSimulationStatus(accountId: string, token: string, simulationId: string): Promise<any> {
    return this.get(accountId, token, `/v1/simulations/${simulationId}/status`);
  }

  async getSimulationJobResults(accountId: string, token: string, simulationId: string, jobId: string): Promise<any> {
    return this.get(accountId, token, `/v1/simulations/${simulationId}/jobs/${jobId}`);
  }

  async cancelSimulation(accountId: string, token: string, simulationId: string): Promise<string> {
    return this.post(accountId, token, `/v1/simulations/${simulationId}/cancel`);
  }

  // ==================== Transcript Analysis ====================

  async createTranscriptAnalysis(accountId: string, token: string, body: TranscriptAnalysisCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/transcript_analysis', body);
  }

  async getTranscriptAnalyses(accountId: string, token: string, owner = 'self', limit = 10, startAfterId?: string): Promise<any[]> {
    return this.get(accountId, token, '/v1/transcript_analysis', {
      account_id: accountId,
      owner,
      limit,
      start_after_id: startAfterId
    });
  }

  async getTranscriptAnalysis(
    accountId: string,
    token: string,
    analysisId: string,
    excludeConversations = false,
    excludeQuestions = false
  ): Promise<any> {
    return this.get(accountId, token, `/v1/transcript_analysis/${analysisId}`, {
      exclude_conversations: excludeConversations,
      exclude_questions: excludeQuestions
    });
  }

  async updateTranscriptAnalysis(
    accountId: string,
    token: string,
    analysisId: string,
    body: TranscriptAnalysisUpdateDto
  ): Promise<any> {
    return this.put(accountId, token, `/v1/transcript_analysis/${analysisId}`, body);
  }

  async deleteTranscriptAnalysis(accountId: string, token: string, analysisId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/transcript_analysis/${analysisId}`);
  }

  // ==================== Knowledgebases ====================

  async getKnowledgebases(accountId: string, token: string): Promise<any[]> {
    return this.get(accountId, token, '/v1/knowledgebases');
  }

  async getKnowledgebase(accountId: string, token: string, kbId: string): Promise<any> {
    return this.get(accountId, token, `/v1/knowledgebases/${kbId}`);
  }

  async deleteKnowledgebase(accountId: string, token: string, kbId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/knowledgebases/${kbId}`);
  }

  async calculateKbHealth(accountId: string, token: string, kbId: string): Promise<any> {
    return this.get(accountId, token, `/v1/knowledgebases/${kbId}/calculate_health`);
  }

  async refreshKbMetadata(accountId: string, token: string, kbId: string): Promise<any> {
    return this.get(accountId, token, `/v1/knowledgebases/${kbId}/refresh_metadata`);
  }

  async searchKnowledgebase(accountId: string, token: string, kbId: string, body: KnowledgebaseSearchDto): Promise<any[]> {
    return this.get(accountId, token, `/v1/knowledgebases/${kbId}/search`, body);
  }

  async getKnowledgebaseItems(accountId: string, token: string, kbId: string): Promise<any[]> {
    return this.get(accountId, token, `/v1/knowledgebases/${kbId}/items`);
  }

  async getKnowledgebaseItemsBySource(accountId: string, token: string, kbId: string, sourceId: string): Promise<any[]> {
    return this.get(accountId, token, `/v1/knowledgebases/${kbId}/items/${sourceId}`);
  }

  async createKnowledgebaseItem(
    accountId: string,
    token: string,
    kbId: string,
    sourceId: string,
    items: KnowledgebaseTextItemDto[]
  ): Promise<any[]> {
    return this.post(accountId, token, `/v1/knowledgebases/${kbId}/items/${sourceId}`, items);
  }

  async updateKnowledgebaseItem(
    accountId: string,
    token: string,
    kbId: string,
    sourceId: string,
    items: KnowledgebaseTextItemDto[]
  ): Promise<any[]> {
    return this.put(accountId, token, `/v1/knowledgebases/${kbId}/items/${sourceId}`, items);
  }

  async deleteKnowledgebaseItem(accountId: string, token: string, kbId: string, sourceId: string, ids: string[]): Promise<string[]> {
    return this.delete(accountId, token, `/v1/knowledgebases/${kbId}/items/${sourceId}`);
  }

  async getKaiKnowledgebases(accountId: string, token: string): Promise<any[]> {
    return this.get(accountId, token, `/v1/knowledgebases/kai/${accountId}`);
  }

  // ==================== Evaluators ====================

  async evaluateSimilarity(
    accountId: string,
    token: string,
    evaluationType: string,
    body: SimilarityEvaluationDto
  ): Promise<any> {
    return this.post(accountId, token, `/v1/evaluators/fine_tuned_similarity?similarity_evaluation_type=${evaluationType}`, body);
  }

  async evaluateResolution(accountId: string, token: string, body: ResolutionEvaluationDto): Promise<any> {
    return this.post(accountId, token, '/v1/evaluators/resolution_classifier', body);
  }

  async evaluateGuidedRouting(accountId: string, token: string, body: GuidedRoutingEvaluationDto): Promise<any> {
    return this.post(accountId, token, '/v1/evaluators/guided_routing_flow', body);
  }

  // ==================== Generators ====================

  async generateQAFromModel(accountId: string, token: string, modelId: string): Promise<any> {
    return this.get(accountId, token, `/v1/generators/question_answer/model/${modelId}`);
  }

  async generateQAFromKnowledgebase(
    accountId: string,
    token: string,
    kbIds: string[],
    generateAnswers = true,
    useRandomSections = false
  ): Promise<any> {
    return this.get(accountId, token, '/v1/generators/question_answer/knowledgebase', {
      kb_id: kbIds,
      generate_answers: generateAnswers,
      use_random_sections: useRandomSections
    });
  }

  async generateQAFromSimulation(
    accountId: string,
    token: string,
    simulationId: string,
    batchSize: number,
    delimiter: string
  ): Promise<any> {
    return this.get(accountId, token, `/v1/generator/question_answer/simulation/${simulationId}`, {
      batch_size: batchSize,
      delimiter
    });
  }

  async generateQAFromConversationCloud(accountId: string, token: string, body: QuestionGeneratorDto): Promise<any> {
    return this.post(accountId, token, '/v1/generators/question_answer/conversation_cloud', {
      account_id: accountId,
      ...body
    });
  }

  async generateKaiRoutesLlm(accountId: string, token: string, body: KAIRouteGeneratorDto): Promise<any> {
    return this.post(accountId, token, '/v1/generators/routes/kai_llm', {
      account_id: accountId,
      ...body
    });
  }

  async generateKaiRoutesNonLlm(accountId: string, token: string, body: KAIRouteGeneratorDto): Promise<number> {
    return this.post(accountId, token, '/v1/generators/routes/kai_non_llm', {
      account_id: accountId,
      ...body
    });
  }

  async getKaiRoutesGenerationStatus(accountId: string, token: string, flowId: string): Promise<any> {
    return this.get(accountId, token, '/v1/generators/routes/kai/status', { flow_id: flowId });
  }

  // ==================== Prompt Library ====================

  async getAccountPrompts(accountId: string, token: string): Promise<any[]> {
    return this.get(accountId, token, `/v1/account/${accountId}/prompt_library`);
  }

  async createPrompt(accountId: string, token: string, body: PromptLibraryCreateDto): Promise<any> {
    return this.post(accountId, token, `/v1/account/${accountId}/prompt_library`, body);
  }

  async updatePrompt(accountId: string, token: string, promptId: string, body: PromptLibraryUpdateDto): Promise<any> {
    return this.put(accountId, token, `/v1/account/${accountId}/prompt_library/${promptId}`, body);
  }

  async getLlmProviders(accountId: string, token: string): Promise<any> {
    return this.get(accountId, token, `/v1/account/${accountId}/prompt_library/providers`);
  }

  async getSystemPrompts(accountId: string, token: string): Promise<any[]> {
    return this.get(accountId, token, '/v1/prompt_library');
  }

  // ==================== Users ====================

  async getSelf(accountId: string, token: string): Promise<any> {
    return this.get(accountId, token, '/v1/users/self');
  }

  async getUsers(accountId: string, token: string): Promise<any> {
    return this.get(accountId, token, '/v1/users');
  }

  async getUsersDetails(accountId: string, token: string): Promise<any> {
    return this.get(accountId, token, '/v1/users_details');
  }

  async createUser(accountId: string, token: string, body: AIStudioUserCreateDto): Promise<any> {
    return this.post(accountId, token, '/v1/users', body);
  }

  async updateUser(accountId: string, token: string, userId: string, body: AIStudioUserUpdateDto): Promise<any> {
    return this.put(accountId, token, `/v1/users/${userId}`, body);
  }

  async deleteUser(accountId: string, token: string, userId: string): Promise<string> {
    return this.delete(accountId, token, `/v1/users/${userId}`);
  }

  async updateUserModels(accountId: string, token: string, userId: string, body: AIStudioUserModelUpdateDto): Promise<any> {
    return this.put(accountId, token, `/v1/users/${userId}/models`, body);
  }

  async agreeToTerms(accountId: string, token: string, userId: string): Promise<any> {
    return this.get(accountId, token, `/v1/users/${userId}/terms_agree`);
  }

  // ==================== Flows (V2) ====================


  async startConversation (accountId: string, token: string, body: any): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(accountId, 'aiStudioPlatformService')
      if (!domain) {
        this.logger.error({
          message: 'Domain not found for service: aistudio',
          accountId
        })

        return null
      }
      const url = `https://${domain}/api/v1/conversations`
      const headers = {
        'Authorization': helper.insertCCBearer(token),
        'Content-Type': 'application/json'
      }
      const response = await firstValueFrom(
        this.httpService.post<any>(url, body, { headers }).pipe(
          catchError((error: AxiosError) => {
            console.error(error.response)
            this.logger.error({
              message: 'Error starting conversation',
              error: error.response.data,
              accountId
            })
            throw {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            }
          }),
        ),
      )
      return response.data
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(error)
    }
  }

  async listFlows (accountId: string, token: string): Promise<any> {
    const t = token.includes(' ') ? token.split(' ')[1] : token
      const aisToken = `CC-Bearer ${t}`
      const domain = await this.helperService.getDomain(accountId, 'aiStudioPlatformService')
        if (!domain) {
          console.error(`Domain not found for service: aistudio`)
          return null
        }
        const url = `https://${domain}/api/v2/flows?account_id=${accountId}`
        const headers = {
          'Authorization': aisToken,
          'Content-Type': 'application/json'
        }
        console.info('headers', headers)

        const { data } = await firstValueFrom(
        this.httpService.get<any>(url, {
          headers,
          timeout: 10000
        }).pipe(
          catchError((error: AxiosError) => {
              console.error('[listFlows] AI Studio API error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
              });
              throw error;
            }),
        ))

      return data

  }

  async getFlow(accountId: string, token: string, flowId: string): Promise<any> {
    const t = token.includes(' ') ? token.split(' ')[1] : token;
    const aisToken = `CC-Bearer ${t}`;
    const domain = await this.helperService.getDomain(accountId, 'aiStudioPlatformService');

    if (!domain) {
      console.error('[getFlow] Domain not found for service: aistudio');
      return null;
    }

    const url = `https://${domain}/api/v2/flows/${flowId}`;
    const headers = {
      'Authorization': aisToken,
      'Content-Type': 'application/json'
    };

    const { data } = await firstValueFrom(
      this.httpService.get<any>(url, {
        headers,
        timeout: 10000
      }).pipe(
        catchError((error: AxiosError) => {
          console.error('[getFlow] AI Studio API error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
          });
          throw error;
        }),
      )
    );

    return data;
  }

  async invokeFlow (accountId: string, token: string, body: any, flowId: string): Promise<any> {
    const fn = 'invokeFlow'
      try {
        const domain = await this.helperService.getDomain(accountId, 'aiStudioPlatformService')
          if (!domain) {
            console.error('[invokeFlow]',`Domain not found for service: aistudio`)
            return null
          }
          const url = `https://${domain}/api/v2/flows/${flowId}`
          const headers = {
            Authorization: helper.insertCCBearer(token),
            'Content-Type': 'application/json'
          }

        const { data } = await firstValueFrom(
          this.httpService.post<any>(url, body, {
            headers,
            timeout: 40000
          }).pipe(
            catchError((error: any) => {
              console.error('[invokeFlow]',error.response?.data?.errorMessage);
              this.logger.error({
                fn,
                message: 'Error invoking flow',
                error: error.response.data,
                accountId,
                body
              })
              throw error.response.data;
            })
          ))
      return data

    } catch (error) {
      throw new InternalServerErrorException(error.response)
    }
  }

  async getFlowResponse (
    accountId: string,
    token: string,
    prompt: string,
    messages: any[] = [],
    text?: string
  ): Promise<{
    text: string;
    speaker: string;
    time: number;
    id: string;
  }> {
    const fn = 'getFlowResponse'
    try {
      const domain = await this.helperService.getDomain(accountId, 'aiStudioPlatformService')
      if (!domain) {
        console.error('[getFlowResponse]',`Domain not found for service: aistudio`)
        return null
      }
      const body = createPromptlessFlow(prompt, messages, text)
      const url = `https://${domain}/api/v2/flows/response`
      const headers = {
        Authorization: helper.insertCCBearer(token),
        'Content-Type': 'application/json'
      }
      console.info('[getFlowResponse] Request Body:', body, url)
      const { data } = await firstValueFrom(
        this.httpService.post<{
          text: string;
          speaker: string;
          time: number;
          id: string;
        }[]>(url, body, {
          headers,
          timeout: 40000
        }).pipe(
          catchError((error: any) => {
            console.error('[getFlowResponse]',error.response?.data?.errorMessage);
            this.logger.error({
              fn,
              message: 'Error getting flow response',
              error: error.response.data,
              accountId,
              body
            })
            throw error.response.data;
          })
        ))

      return data[0]

    } catch (error) {
      throw new InternalServerErrorException(error.response)
    }
  }

}
