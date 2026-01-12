/**
 * QA Batch Assessment Interfaces
 * Types for server-side batch job processing
 */

/**
 * Batch job status
 */
export type QABatchJobStatus =
  | 'queued'
  | 'fetching'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Conversation search filters for batch job
 */
export interface QABatchJobFilters {
  dateFrom: number;
  dateTo: number;
  status?: string[];
  skillIds?: number[];
  agentIds?: string[];
}

/**
 * Batch job configuration
 */
export interface QABatchJobConfig {
  name: string;
  frameworkId: string;
  filters: QABatchJobFilters;
  samplingRate: number;
  maxConversations: number;
  priorityOrder: 'newest_first' | 'oldest_first' | 'random' | 'mcs_lowest';
  skipAlreadyAssessed: boolean;
}

/**
 * Batch job progress tracking
 */
export interface QABatchJobProgress {
  totalConversations: number;
  fetchedConversations: number;
  processedConversations: number;
  successfulAssessments: number;
  failedAssessments: number;
  averageScore?: number;
  currentConversationId?: string;
}

/**
 * Individual batch assessment result
 */
export interface QABatchAssessmentItem {
  conversationId: string;
  status: 'completed' | 'failed' | 'skipped';
  score?: number;
  passed?: boolean;
  error?: string;
  processedAt: number;
  assessmentId?: string;
}

/**
 * Main batch job entity
 */
export interface QABatchJob {
  id: string;
  accountId: string;
  status: QABatchJobStatus;
  config: QABatchJobConfig;
  progress: QABatchJobProgress;
  /** Last 100 results for activity log */
  recentResults: QABatchAssessmentItem[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  createdBy: string;
  error?: string;
}

/**
 * DTO for creating a batch job
 */
export interface CreateBatchJobDto {
  name: string;
  frameworkId: string;
  filters: QABatchJobFilters;
  samplingRate?: number;
  maxConversations?: number;
  priorityOrder?: 'newest_first' | 'oldest_first' | 'random' | 'mcs_lowest';
  skipAlreadyAssessed?: boolean;
}

/**
 * Response for batch job status
 */
export interface BatchJobStatusResponse {
  id: string;
  status: QABatchJobStatus;
  progress: QABatchJobProgress;
  recentResults: QABatchAssessmentItem[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  error?: string;
}

/**
 * AI Analysis result from QA Assessment
 */
export interface AIAnalysisResult {
  comments: AIComment[];
  scores: AIScore[];
  summary: string;
  overallAssessment: AIOverallAssessment;
}

export interface AIComment {
  messageIndex?: number;
  messageIndices?: number[];
  comment: string;
  type: 'positive' | 'negative' | 'neutral' | 'suggestion';
  category: string;
  confidence: number;
}

export interface AIScore {
  sectionId: string;
  itemId: string;
  score: number | null;
  confidence: number;
  reasoning?: string;
}

export interface AIOverallAssessment {
  overallScore: number;
  overallConfidence: number;
  passed: boolean;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  criticalIssues: string[];
  executiveSummary: string;
}
