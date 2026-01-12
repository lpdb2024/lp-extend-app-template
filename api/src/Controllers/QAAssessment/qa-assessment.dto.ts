/**
 * QA Assessment DTOs
 * Data Transfer Objects for Firestore collections
 */

import type {
  QATopic,
  QAFramework,
  QAAssessmentRule,
  QAAssessment,
  QACriteriaItem,
  QASection,
  QAAttributionMode,
} from './qa-assessment.interfaces';
import type {
  QABatchJob,
  QABatchJobConfig,
  QABatchJobProgress,
  QABatchJobStatus,
  QABatchAssessmentItem,
} from './qa-batch.interfaces';

/**
 * QA Topic Document
 */
export class QATopicDocument implements QATopic {
  static collectionName = 'qa_topics';

  id: string;
  accountId: string;
  name: string;
  description: string;
  keywords: string[];
  intents?: string[];
  category: string;
  requiredCriteria: QACriteriaItem[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  version: number;
}

/**
 * QA Framework Document
 */
export class QAFrameworkDocument implements QAFramework {
  static collectionName = 'qa_frameworks';

  id: string;
  accountId: string;
  name: string;
  description: string;
  type: 'quality_framework' | 'targeted_criteria';
  version: number;
  sections: QASection[];
  passingScore: number;
  criticalItems: string[];
  applicableTopics?: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

/**
 * QA Assessment Rule Document
 */
export class QARuleDocument implements QAAssessmentRule {
  static collectionName = 'qa_rules';

  id: string;
  accountId: string;
  name: string;
  description: string;
  priority: number;
  conditions: { id: string; field: string; operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'regex'; value: string | number | string[] | number[]; }[];
  conditionLogic: 'AND' | 'OR';
  frameworkId: string;
  topicIds: string[];
  attributionMode: QAAttributionMode;
  samplingRate: number;
  isActive: boolean;
  isFallback: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

/**
 * QA Assessment Document
 */
export class QAAssessmentDocument implements QAAssessment {
  static collectionName = 'qa_assessments';

  id: string;
  accountId: string;
  conversationId: string;
  ruleId: string;
  frameworkId: string;
  topicIds: string[];
  status: string;
  conversationInfo: Record<string, unknown>;
  agents: unknown[];
  attributionMode: QAAttributionMode;
  selectedAgentId?: string;
  sectionScores: unknown[];
  topicScores: unknown[];
  totalScore: number;
  passed: boolean;
  criticalFailures: string[];
  aiPreScores?: Record<string, number>;
  aiConfidence?: number;
  evaluatorId: string;
  evaluatorName: string;
  evaluatedAt: number;
  notes: string;
  disputeStatus?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * QA Batch Job Document
 */
export class QABatchJobDocument implements QABatchJob {
  static collectionName = 'qa_batch_jobs';

  id: string;
  accountId: string;
  status: QABatchJobStatus;
  config: QABatchJobConfig;
  progress: QABatchJobProgress;
  recentResults: QABatchAssessmentItem[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  createdBy: string;
  error?: string;
}
