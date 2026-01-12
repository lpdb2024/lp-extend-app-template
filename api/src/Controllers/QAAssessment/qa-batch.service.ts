/**
 * QA Batch Assessment Service
 * Server-side batch job processing with Firestore persistence
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference } from '@google-cloud/firestore';
import Bottleneck from 'bottleneck';
import { Scopes } from '@lpextend/node-sdk';
import {
  QABatchJobDocument,
  QAFrameworkDocument,
  QAAssessmentDocument,
} from './qa-assessment.dto';
import type {
  QABatchJob,
  QABatchJobStatus,
  CreateBatchJobDto,
  BatchJobStatusResponse,
  QABatchAssessmentItem,
  AIAnalysisResult,
} from './qa-batch.interfaces';
import type { QAFramework } from './qa-assessment.interfaces';
import { ConversationsService } from '../LivePerson/MessagingHistory/conversations/conversations.service';
import { IConversation } from '../LivePerson/MessagingHistory/conversations/conversations.interfaces';
import { AccountSettingsService } from '../AccountSettings/account-settings.service';
import { SDKProviderService, TokenInfo } from '../LivePerson/shared/sdk-provider.service';

@Injectable()
export class QABatchService {
  /** Active job processing map to track cancellation */
  private activeJobs = new Map<string, { cancelled: boolean }>();

  /** Rate limiter for AI calls */
  private aiLimiter = new Bottleneck({
    maxConcurrent: 5,
    minTime: 200, // Minimum 200ms between requests
  });

  constructor(
    @Inject(QABatchJobDocument.collectionName)
    private batchJobsCollection: CollectionReference<QABatchJobDocument>,
    @Inject(QAFrameworkDocument.collectionName)
    private frameworksCollection: CollectionReference<QAFrameworkDocument>,
    @Inject(QAAssessmentDocument.collectionName)
    private assessmentsCollection: CollectionReference<QAAssessmentDocument>,
    private conversationsService: ConversationsService,
    private accountSettingsService: AccountSettingsService,
    private readonly sdkProvider: SDKProviderService,
  ) {}

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.AI_STUDIO]);
  }

  // =========================================================================
  // Job Management
  // =========================================================================

  /**
   * Create a new batch job
   */
  async createBatchJob(
    accountId: string,
    dto: CreateBatchJobDto,
    createdBy: string,
  ): Promise<QABatchJob> {
    const now = Date.now();
    const jobId = `batch-${now}-${Math.random().toString(36).substr(2, 9)}`;

    const job: QABatchJob = {
      id: jobId,
      accountId,
      status: 'queued',
      config: {
        name: dto.name,
        frameworkId: dto.frameworkId,
        filters: dto.filters,
        samplingRate: dto.samplingRate ?? 100,
        maxConversations: dto.maxConversations ?? 100,
        priorityOrder: dto.priorityOrder ?? 'newest_first',
        skipAlreadyAssessed: dto.skipAlreadyAssessed ?? true,
      },
      progress: {
        totalConversations: 0,
        fetchedConversations: 0,
        processedConversations: 0,
        successfulAssessments: 0,
        failedAssessments: 0,
      },
      recentResults: [],
      createdAt: now,
      updatedAt: now,
      createdBy,
    };

    await this.batchJobsCollection.doc(jobId).set(job as QABatchJobDocument);

    // Start processing in the background (don't await)
    this.processBatchJob(jobId, accountId).catch(err => {
      console.error(`Batch job ${jobId} failed:`, err);
      this.updateJobStatus(jobId, 'failed', err.message);
    });

    return job;
  }

  /**
   * Get batch job status
   */
  async getBatchJobStatus(
    accountId: string,
    jobId: string,
  ): Promise<BatchJobStatusResponse> {
    const doc = await this.batchJobsCollection.doc(jobId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Batch job ${jobId} not found`);
    }

    const job = doc.data() as QABatchJob;

    if (job.accountId !== accountId) {
      throw new NotFoundException(`Batch job ${jobId} not found`);
    }

    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      recentResults: job.recentResults,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      error: job.error,
    };
  }

  /**
   * List batch jobs for account
   */
  async listBatchJobs(
    accountId: string,
    limit = 20,
  ): Promise<BatchJobStatusResponse[]> {
    const snapshot = await this.batchJobsCollection
      .where('accountId', '==', accountId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const jobs: BatchJobStatusResponse[] = [];
    snapshot.forEach(doc => {
      const job = doc.data() as QABatchJob;
      jobs.push({
        id: job.id,
        status: job.status,
        progress: job.progress,
        recentResults: job.recentResults.slice(0, 10), // Only last 10 for list view
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt,
        error: job.error,
      });
    });

    return jobs;
  }

  /**
   * Cancel a running batch job
   */
  async cancelBatchJob(accountId: string, jobId: string): Promise<void> {
    const doc = await this.batchJobsCollection.doc(jobId).get();

    if (!doc.exists) {
      throw new NotFoundException(`Batch job ${jobId} not found`);
    }

    const job = doc.data() as QABatchJob;

    if (job.accountId !== accountId) {
      throw new NotFoundException(`Batch job ${jobId} not found`);
    }

    if (job.status !== 'processing' && job.status !== 'fetching') {
      return; // Job not running, nothing to cancel
    }

    // Signal cancellation
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      activeJob.cancelled = true;
    }

    await this.updateJobStatus(jobId, 'cancelled');
  }

  // =========================================================================
  // Job Processing
  // =========================================================================

  /**
   * Process a batch job (runs in background)
   */
  private async processBatchJob(
    jobId: string,
    accountId: string,
  ): Promise<void> {
    // Register job for cancellation tracking
    this.activeJobs.set(jobId, { cancelled: false });

    try {
      // Get job config
      const jobDoc = await this.batchJobsCollection.doc(jobId).get();
      const job = jobDoc.data() as QABatchJob;

      // Get framework
      const frameworkDoc = await this.frameworksCollection.doc(job.config.frameworkId).get();
      if (!frameworkDoc.exists) {
        throw new Error(`Framework ${job.config.frameworkId} not found`);
      }
      const framework = frameworkDoc.data() as QAFramework;

      // Phase 1: Fetch conversations
      await this.updateJobStatus(jobId, 'fetching');
      const conversations = await this.fetchConversations(jobId, accountId, job);

      if (this.isJobCancelled(jobId)) return;

      // Phase 2: Fetch transcripts
      const transcripts = await this.fetchTranscripts(jobId, accountId, conversations);

      if (this.isJobCancelled(jobId)) return;

      // Phase 3: Process AI analysis
      await this.updateJobStatus(jobId, 'processing');
      await this.processConversations(jobId, accountId, framework, transcripts);

      // Finalize
      if (!this.isJobCancelled(jobId)) {
        await this.updateJobStatus(jobId, 'completed');
      }
    } catch (error) {
      console.error(`Batch job ${jobId} error:`, error);
      await this.updateJobStatus(jobId, 'failed', error.message);
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Fetch conversations matching filters
   */
  private async fetchConversations(
    jobId: string,
    accountId: string,
    job: QABatchJob,
  ): Promise<string[]> {
    const { filters, maxConversations, samplingRate, priorityOrder } = job.config;

    // Determine sort order
    const sort = priorityOrder === 'oldest_first' ? 'start:asc' : 'start:desc';

    // Fetch conversations with pagination
    const conversationIds: string[] = [];
    let offset = 0;
    const limit = 100;
    let totalCount = 0;

    while (true) {
      if (this.isJobCancelled(jobId)) break;

      const response = await this.conversationsService.searchConversations(
        accountId,
        '',
        {
          start: {
            from: filters.dateFrom,
            to: filters.dateTo,
          },
          status: (filters.status || ['CLOSE']) as ('OPEN' | 'CLOSE')[],
          skillIds: filters.skillIds,
          agentIds: filters.agentIds,
          sort: sort as any,
          offset,
          limit,
        },
      );

      const records = (response.data as any)?.conversationHistoryRecords || [];
      totalCount = (response.data as any)?._metadata?.count || 0;

      for (const record of records) {
        if (record.info?.conversationId) {
          conversationIds.push(record.info.conversationId);
        }
      }

      // Update progress
      await this.updateJobProgress(jobId, {
        totalConversations: Math.min(
          Math.ceil(totalCount * (samplingRate / 100)),
          maxConversations,
        ),
      });

      // Check if we have enough or no more records
      if (records.length < limit || conversationIds.length >= maxConversations) {
        break;
      }

      offset += limit;
    }

    // Apply sampling and max limit
    let selectedIds = conversationIds;

    if (priorityOrder === 'random') {
      selectedIds = this.shuffleArray([...conversationIds]);
    } else if (priorityOrder === 'mcs_lowest') {
      // MCS sorting would require fetching MCS data - skip for now, use as-is
    }

    if (samplingRate < 100) {
      const sampleSize = Math.ceil(selectedIds.length * (samplingRate / 100));
      selectedIds = selectedIds.slice(0, sampleSize);
    }

    selectedIds = selectedIds.slice(0, maxConversations);

    await this.updateJobProgress(jobId, {
      totalConversations: selectedIds.length,
    });

    return selectedIds;
  }

  /**
   * Fetch transcripts for conversations
   */
  private async fetchTranscripts(
    jobId: string,
    accountId: string,
    conversationIds: string[],
  ): Promise<Map<string, IConversation>> {
    const transcripts = new Map<string, IConversation>();
    const batchSize = 100;

    for (let i = 0; i < conversationIds.length; i += batchSize) {
      if (this.isJobCancelled(jobId)) break;

      const batch = conversationIds.slice(i, i + batchSize);

      try {
        // Fetch conversations one by one (SDK getConversation takes single ID)
        const results = await this.conversationsService.getConversationsByIds(
          accountId,
          '',
          batch,
        );

        const records = results.data || [];
        for (const record of records) {
          const convRecord = record as any;
          if (convRecord.info?.conversationId) {
            transcripts.set(convRecord.info.conversationId, convRecord);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch transcript batch:`, error);
      }

      await this.updateJobProgress(jobId, {
        fetchedConversations: transcripts.size,
      });
    }

    return transcripts;
  }

  /**
   * Process conversations with AI analysis
   */
  private async processConversations(
    jobId: string,
    accountId: string,
    framework: QAFramework,
    transcripts: Map<string, IConversation>,
  ): Promise<void> {
    const passingScore = framework.passingScore || 80;

    // Build framework criteria text (reused for all conversations)
    const frameworkCriteria = this.buildFrameworkCriteriaText(framework);

    // Get flow ID from account settings
    const flowId = await this.getAIFlowId(accountId);
    if (!flowId) {
      throw new Error('No AI Studio flow configured for this account');
    }

    // Process in parallel using rate limiter
    const conversationIds = Array.from(transcripts.keys());
    let processedCount = 0;

    const processOne = async (conversationId: string): Promise<void> => {
      if (this.isJobCancelled(jobId)) return;

      const transcript = transcripts.get(conversationId);
      if (!transcript) return;

      const result = await this.processOneConversation(
        accountId,
        conversationId,
        transcript,
        framework,
        frameworkCriteria,
        flowId,
        passingScore,
      );

      processedCount++;

      // Update job progress
      await this.addResultAndUpdateProgress(jobId, result, processedCount);
    };

    // Queue all conversations through rate limiter
    const promises = conversationIds.map(convId =>
      this.aiLimiter.schedule(() => processOne(convId)),
    );

    await Promise.all(promises);
  }

  /**
   * Process a single conversation
   */
  private async processOneConversation(
    accountId: string,
    conversationId: string,
    transcript: IConversation,
    framework: QAFramework,
    frameworkCriteria: string,
    flowId: string,
    passingScore: number,
  ): Promise<QABatchAssessmentItem> {
    const result: QABatchAssessmentItem = {
      conversationId,
      status: 'completed',
      processedAt: Date.now(),
    };

    try {
      // Convert transcript to text
      const transcriptText = this.transcriptToText(transcript);
      if (!transcriptText) {
        result.status = 'failed';
        result.error = 'No analyzable messages';
        return result;
      }

      // Call AI for analysis
      const aiResult = await this.performAIAnalysis(
        accountId,
        flowId,
        transcriptText,
        frameworkCriteria,
      );

      if (!aiResult) {
        result.status = 'failed';
        result.error = 'No AI response';
        return result;
      }

      // Calculate score
      const totalScore = this.calculateScore(aiResult, framework);
      const passed = totalScore >= passingScore;

      result.score = totalScore;
      result.passed = passed;

      // Save assessment to Firestore
      const assessmentId = await this.saveAssessment(
        accountId,
        conversationId,
        framework,
        aiResult,
        totalScore,
        passed,
        transcript,
      );
      result.assessmentId = assessmentId;
    } catch (error) {
      result.status = 'failed';
      result.error = error.message || 'Processing error';
    }

    return result;
  }

  // =========================================================================
  // AI Analysis
  // =========================================================================

  /**
   * Perform AI analysis on transcript
   */
  private async performAIAnalysis(
    accountId: string,
    flowId: string,
    transcript: string,
    frameworkCriteria: string,
  ): Promise<AIAnalysisResult | null> {
    const prompt = `You are a QA specialist analyzing customer service conversations.

CONVERSATION TRANSCRIPT:
${transcript}

QA FRAMEWORK CRITERIA:
${frameworkCriteria}

Analyze this conversation against the framework criteria and respond with JSON:
{
  "comments": [
    {
      "messageIndices": [2, 5],
      "comment": "Observation about the conversation",
      "type": "positive|negative|neutral|suggestion",
      "category": "Category name",
      "confidence": 0.9
    }
  ],
  "scores": [
    {
      "sectionId": "section-id",
      "itemId": "item-id",
      "score": 1,
      "confidence": 0.9,
      "reasoning": "Brief explanation"
    }
  ],
  "summary": "One-line assessment summary",
  "overallAssessment": {
    "overallScore": 75,
    "overallConfidence": 0.85,
    "passed": true,
    "strengths": ["List of strengths"],
    "weaknesses": ["List of weaknesses"],
    "improvementAreas": ["Improvement recommendations"],
    "criticalIssues": [],
    "executiveSummary": "2-3 sentence summary"
  }
}

Scoring types:
- binary: 0 (No) or 1 (Yes)
- scale_3: 1 (Poor), 2 (Acceptable), 3 (Excellent)
- scale_5: 1 (Very Poor) to 5 (Excellent)
- na_allowed: 0-5, or null if Not Applicable

IMPORTANT: Score EVERY item in the framework. Respond ONLY with valid JSON.`;

    try {
      // Get SDK and invoke the AI Studio flow
      const sdk = await this.getSDK(accountId, '');

      const response = await sdk.aiStudio.flows.invoke(flowId, {
        input: { text: prompt },
      });

      // Parse response
      let aiContent: string;
      if (response.data?.output) {
        const output = response.data.output as Record<string, unknown>;
        aiContent = (output.text as string) || (output.content as string) || JSON.stringify(output);
      } else {
        aiContent = JSON.stringify(response.data);
      }

      // Extract JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          comments: parsed.comments || [],
          scores: parsed.scores || [],
          summary: parsed.summary || '',
          overallAssessment: parsed.overallAssessment || {
            overallScore: 0,
            overallConfidence: 0,
            passed: false,
            strengths: [],
            weaknesses: [],
            improvementAreas: [],
            criticalIssues: [],
            executiveSummary: '',
          },
        };
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    }

    return null;
  }

  // =========================================================================
  // Helper Methods
  // =========================================================================

  private isJobCancelled(jobId: string): boolean {
    return this.activeJobs.get(jobId)?.cancelled ?? false;
  }

  private async updateJobStatus(
    jobId: string,
    status: QABatchJobStatus,
    error?: string,
  ): Promise<void> {
    const updates: Partial<QABatchJob> = {
      status,
      updatedAt: Date.now(),
    };

    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      updates.completedAt = Date.now();
    }

    if (error) {
      updates.error = error;
    }

    await this.batchJobsCollection.doc(jobId).update(updates);
  }

  private async updateJobProgress(
    jobId: string,
    progress: Partial<QABatchJob['progress']>,
  ): Promise<void> {
    const doc = await this.batchJobsCollection.doc(jobId).get();
    const job = doc.data() as QABatchJob;

    await this.batchJobsCollection.doc(jobId).update({
      progress: { ...job.progress, ...progress },
      updatedAt: Date.now(),
    });
  }

  private async addResultAndUpdateProgress(
    jobId: string,
    result: QABatchAssessmentItem,
    processedCount: number,
  ): Promise<void> {
    const doc = await this.batchJobsCollection.doc(jobId).get();
    const job = doc.data() as QABatchJob;

    // Keep only last 100 results
    const recentResults = [result, ...job.recentResults].slice(0, 100);

    // Update average score
    let averageScore = job.progress.averageScore || 0;
    if (result.status === 'completed' && result.score !== undefined) {
      const successCount = job.progress.successfulAssessments + 1;
      averageScore = ((averageScore * job.progress.successfulAssessments) + result.score) / successCount;
    }

    await this.batchJobsCollection.doc(jobId).update({
      recentResults,
      progress: {
        ...job.progress,
        processedConversations: processedCount,
        successfulAssessments: result.status === 'completed'
          ? job.progress.successfulAssessments + 1
          : job.progress.successfulAssessments,
        failedAssessments: result.status === 'failed'
          ? job.progress.failedAssessments + 1
          : job.progress.failedAssessments,
        averageScore,
      },
      updatedAt: Date.now(),
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private transcriptToText(transcript: IConversation): string {
    const messages = transcript.messageRecords || [];
    const lines: string[] = [];

    for (const msg of messages) {
      if (msg.type === 'TEXT_PLAIN' || msg.type === 'PLAIN_TEXT') {
        const sender = msg.sentBy === 'Consumer' ? 'Customer' : 'Agent';
        lines.push(`[${sender}]: ${msg.messageData?.msg?.text || ''}`);
      }
    }

    return lines.join('\n');
  }

  private buildFrameworkCriteriaText(framework: QAFramework): string {
    const lines: string[] = [
      `Framework: ${framework.name}`,
      `Passing Score: ${framework.passingScore}%`,
      '',
      'Sections:',
    ];

    for (const section of framework.sections) {
      lines.push(`\n## ${section.name} (Weight: ${section.weight}%)`);
      lines.push(section.description || '');

      for (const item of section.items) {
        lines.push(`- [${section.id}/${item.id}] ${item.description} (Type: ${item.type}${item.isCritical ? ', CRITICAL' : ''})`);
      }
    }

    return lines.join('\n');
  }

  private calculateScore(aiResult: AIAnalysisResult, framework: QAFramework): number {
    const scoresMap: Record<string, Record<string, number | null>> = {};

    for (const scoreItem of aiResult.scores) {
      if (!scoresMap[scoreItem.sectionId]) {
        scoresMap[scoreItem.sectionId] = {};
      }
      scoresMap[scoreItem.sectionId][scoreItem.itemId] = scoreItem.score;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const section of framework.sections) {
      const sectionScores = scoresMap[section.id] || {};
      let sectionRawScore = 0;
      let sectionMaxScore = 0;

      for (const item of section.items) {
        const score = sectionScores[item.id];
        const maxScore = this.getMaxScoreForType(item.type);

        if (score !== null && score !== undefined) {
          sectionRawScore += score;
        }
        sectionMaxScore += maxScore;
      }

      if (sectionMaxScore > 0) {
        const sectionPercentage = (sectionRawScore / sectionMaxScore) * 100;
        totalWeightedScore += sectionPercentage * (section.weight / 100);
        totalWeight += section.weight;
      }
    }

    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  }

  private getMaxScoreForType(type: string): number {
    switch (type) {
      case 'binary': return 1;
      case 'scale_3': return 3;
      case 'scale_5': return 5;
      case 'na_allowed': return 5;
      default: return 1;
    }
  }

  private async getAIFlowId(accountId: string): Promise<string | null> {
    // Get AI Studio flow ID from account settings
    // The setting name is 'aiStudioProxyFlow' as defined in ACCOUNT_SETTING_NAMES
    const setting = await this.accountSettingsService.getSettingByName(
      accountId,
      'aiStudioProxyFlow',
    );

    if (setting?.value) {
      return setting.value;
    }

    // Fallback to environment variable
    return process.env.DEFAULT_QA_FLOW_ID || null;
  }

  private async saveAssessment(
    accountId: string,
    conversationId: string,
    framework: QAFramework,
    aiResult: AIAnalysisResult,
    totalScore: number,
    passed: boolean,
    transcript: IConversation,
  ): Promise<string> {
    const assessmentId = `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const assessment = {
      id: assessmentId,
      accountId,
      conversationId,
      ruleId: '',
      frameworkId: framework.id,
      topicIds: [],
      status: 'completed',
      conversationInfo: {
        startTime: transcript.info?.startTime,
        endTime: transcript.info?.endTime,
        skillName: transcript.info?.latestSkillName,
        agentName: transcript.info?.latestAgentFullName,
      },
      agents: transcript.agentParticipants || [],
      attributionMode: 'last_agent' as const,
      sectionScores: aiResult.scores,
      topicScores: [],
      totalScore,
      passed,
      criticalFailures: aiResult.overallAssessment.criticalIssues || [],
      aiPreScores: {},
      aiConfidence: aiResult.overallAssessment.overallConfidence,
      evaluatorId: 'system',
      evaluatorName: 'AI Batch Assessment',
      evaluatedAt: Date.now(),
      notes: aiResult.summary || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.assessmentsCollection.doc(assessmentId).set(assessment as any);

    return assessmentId;
  }
}
