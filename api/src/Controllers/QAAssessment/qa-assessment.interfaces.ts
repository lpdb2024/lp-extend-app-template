/**
 * QA Assessment Interfaces
 * TypeScript interfaces for backend
 */

export interface QATopic {
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

export interface QACriteriaItem {
  id: string;
  description: string;
  weight: number;
  isCritical: boolean;
  aiDetectable: boolean;
  validationKeywords?: string[];
  failureKeywords?: string[];
}

export interface QAFramework {
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

export interface QASection {
  id: string;
  name: string;
  description: string;
  weight: number;
  order: number;
  items: QASectionItem[];
}

export interface QASectionItem {
  id: string;
  description: string;
  helpText?: string;
  examplePass?: string;
  exampleFail?: string;
  weight: number;
  type: 'binary' | 'scale_3' | 'scale_5' | 'na_allowed';
  isCritical: boolean;
  aiAssistEligible: boolean;
  validationRules?: QAValidationRule[];
}

export interface QAValidationRule {
  type: 'keyword_present' | 'keyword_absent' | 'response_time' | 'message_count';
  params: Record<string, unknown>;
}

export interface QAAssessmentRule {
  id: string;
  accountId: string;
  name: string;
  description: string;
  priority: number;
  conditions: QARuleCondition[];
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

export interface QARuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'regex';
  value: string | number | string[] | number[];
}

export type QAAttributionMode = 'last_agent' | 'selected_agent' | 'all_agents' | 'proportional';

export interface QAAssessment {
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
