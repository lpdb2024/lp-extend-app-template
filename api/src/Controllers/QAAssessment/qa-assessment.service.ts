/**
 * QA Assessment Service
 * Business logic and Firestore integration for QA Assessment
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CollectionReference } from '@google-cloud/firestore';
import * as AdmZip from 'adm-zip';
import { Scopes } from '@lpextend/node-sdk';
import {
  QATopicDocument,
  QAFrameworkDocument,
  QARuleDocument,
  QAAssessmentDocument,
} from './qa-assessment.dto';
import type {
  QATopic,
  QAFramework,
  QAAssessmentRule,
  QAAssessment,
} from './qa-assessment.interfaces';
import { ConversationsService } from '../LivePerson/MessagingHistory/conversations/conversations.service';
import { HelperService } from '../HelperService/helper-service.service';
import { SDKProviderService, TokenInfo } from '../LivePerson/shared/sdk-provider.service';

@Injectable()
export class QAAssessmentService {
  constructor(
    @Inject(QATopicDocument.collectionName)
    private topicsCollection: CollectionReference<QATopicDocument>,
    @Inject(QAFrameworkDocument.collectionName)
    private frameworksCollection: CollectionReference<QAFrameworkDocument>,
    @Inject(QARuleDocument.collectionName)
    private rulesCollection: CollectionReference<QARuleDocument>,
    @Inject(QAAssessmentDocument.collectionName)
    private assessmentsCollection: CollectionReference<QAAssessmentDocument>,
    private conversationsService: ConversationsService,
    private helperService: HelperService,
    private readonly sdkProvider: SDKProviderService,
  ) {}

  /**
   * Get SDK instance via shared provider
   */
  private async getSDK(accountId: string, token: TokenInfo | string) {
    return this.sdkProvider.getSDK(accountId, token, [Scopes.AI_STUDIO]);
  }

  // =========================================================================
  // Topics
  // =========================================================================

  async getTopics(accountId: string): Promise<QATopic[]> {
    const snapshot = await this.topicsCollection
      .where('accountId', '==', accountId)
      .get();

    const topics: QATopic[] = [];
    snapshot.forEach((doc) => {
      topics.push({ id: doc.id, ...doc.data() } as QATopic);
    });

    return topics;
  }

  async createTopic(
    accountId: string, topic: Partial<QATopic>,
  ): Promise<QATopic> {
    const newTopic: QATopic = {
      ...topic,
      id: '',
      accountId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    } as QATopic;

    const docRef = await this.topicsCollection.add(newTopic as QATopicDocument);
    newTopic.id = docRef.id;
    await docRef.update({ id: docRef.id });

    return newTopic;
  }

  async updateTopic(
    accountId: string, topicId: string,
    updates: Partial<QATopic>,
  ): Promise<QATopic> {
    const topicRef = this.topicsCollection.doc(topicId);
    const doc = await topicRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Topic ${topicId} not found`);
    }

    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
      version: (doc.data()?.version || 0) + 1,
    };

    await topicRef.update(updatedData);

    const updated = await topicRef.get();
    return { id: updated.id, ...updated.data() } as QATopic;
  }

  async deleteTopic(accountId: string, topicId: string): Promise<void> {
    const topicRef = this.topicsCollection.doc(topicId);
    await topicRef.delete();
  }

  // =========================================================================
  // Frameworks
  // =========================================================================

  async getFrameworks(accountId: string): Promise<QAFramework[]> {
    const snapshot = await this.frameworksCollection
      .where('accountId', '==', accountId)
      .get();

    const frameworks: QAFramework[] = [];
    snapshot.forEach((doc) => {
      frameworks.push({ id: doc.id, ...doc.data() } as QAFramework);
    });

    return frameworks;
  }

  async createFramework(
    accountId: string, framework: Partial<QAFramework>,
  ): Promise<QAFramework> {
    const newFramework: QAFramework = {
      ...framework,
      id: '',
      accountId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    } as QAFramework;

    const docRef = await this.frameworksCollection.add(newFramework as QAFrameworkDocument);
    newFramework.id = docRef.id;
    await docRef.update({ id: docRef.id });

    return newFramework;
  }

  async updateFramework(
    accountId: string, frameworkId: string,
    updates: Partial<QAFramework>,
  ): Promise<QAFramework> {
    const frameworkRef = this.frameworksCollection.doc(frameworkId);
    const doc = await frameworkRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
      version: (doc.data()?.version || 0) + 1,
    };

    await frameworkRef.update(updatedData);

    const updated = await frameworkRef.get();
    return { id: updated.id, ...updated.data() } as QAFramework;
  }

  async deleteFramework(accountId: string, frameworkId: string): Promise<void> {
    const frameworkRef = this.frameworksCollection.doc(frameworkId);
    await frameworkRef.delete();
  }

  async cloneFramework(
    accountId: string, frameworkId: string,
    newName: string,
  ): Promise<QAFramework> {
    const frameworkRef = this.frameworksCollection.doc(frameworkId);
    const doc = await frameworkRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    const original = doc.data() as QAFramework;
    const cloned: QAFramework = {
      ...original,
      id: '',
      name: newName,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const docRef = await this.frameworksCollection.add(cloned as QAFrameworkDocument);
    cloned.id = docRef.id;
    await docRef.update({ id: docRef.id });

    return cloned;
  }

  // =========================================================================
  // Rules
  // =========================================================================

  async getRules(accountId: string): Promise<QAAssessmentRule[]> {
    const snapshot = await this.rulesCollection
      .where('accountId', '==', accountId)
      .orderBy('priority')
      .get();

    const rules: QAAssessmentRule[] = [];
    snapshot.forEach((doc) => {
      rules.push({ id: doc.id, ...doc.data() } as QAAssessmentRule);
    });

    return rules;
  }

  async createRule(
    accountId: string, rule: Partial<QAAssessmentRule>,
  ): Promise<QAAssessmentRule> {
    const newRule: QAAssessmentRule = {
      ...rule,
      id: '',
      accountId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as QAAssessmentRule;

    const docRef = await this.rulesCollection.add(newRule as QARuleDocument);
    newRule.id = docRef.id;
    await docRef.update({ id: docRef.id });

    return newRule;
  }

  async updateRule(
    accountId: string, ruleId: string,
    updates: Partial<QAAssessmentRule>,
  ): Promise<QAAssessmentRule> {
    const ruleRef = this.rulesCollection.doc(ruleId);
    const doc = await ruleRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Rule ${ruleId} not found`);
    }

    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await ruleRef.update(updatedData);

    const updated = await ruleRef.get();
    return { id: updated.id, ...updated.data() } as QAAssessmentRule;
  }

  async deleteRule(accountId: string, ruleId: string): Promise<void> {
    const ruleRef = this.rulesCollection.doc(ruleId);
    await ruleRef.delete();
  }

  // =========================================================================
  // Assessments
  // =========================================================================

  async getAssessmentQueue(accountId: string): Promise<QAAssessment[]> {
    const snapshot = await this.assessmentsCollection
      .where('accountId', '==', accountId)
      .where('status', 'in', ['pending', 'in_progress'])
      .get();

    const assessments: QAAssessment[] = [];
    snapshot.forEach((doc) => {
      assessments.push({ id: doc.id, ...doc.data() } as QAAssessment);
    });

    return assessments;
  }

  async startAssessment(
    accountId: string, conversationId: string,
  ): Promise<QAAssessment> {
    // Fetch conversation info from LivePerson
    let conversationInfo: Record<string, unknown> = {};
    try {
      const response = await this.conversationsService.getConversationById(
        accountId,
        '',
        conversationId,
      );

      // SDK returns MessagingConversation directly
      const conversation = response.data as any;
      if (conversation?.info) {
        const info = conversation.info;
        // Build conversationInfo, excluding undefined values (Firestore doesn't allow them)
        conversationInfo = {
          startTime: info.startTimeL ?? 0,
          endTime: info.endTimeL ?? 0,
          duration: info.duration ?? 0,
          skillId: info.latestSkillId ?? 0,
          skillName: info.latestSkillName ?? '',
          channel: info.source ?? '',
          customerName: '',
          agentName: info.latestAgentFullName ?? info.latestAgentNickname ?? '',
          agentId: info.latestAgentId ?? '',
        };
        // Only add optional fields if they have values
        if (info.csat !== undefined && info.csat !== null) {
          conversationInfo.csat = info.csat;
        }
        if (info.mcs !== undefined && info.mcs !== null) {
          conversationInfo.mcs = info.mcs;
        }
      }
    } catch (error) {
      // Log but continue - conversation info is optional
      console.warn(`Failed to fetch conversation info for ${conversationId}:`, error);
    }

    // Create stub assessment
    const newAssessment: QAAssessment = {
      id: '',
      accountId,
      conversationId,
      ruleId: '',
      frameworkId: '',
      topicIds: [],
      status: 'in_progress',
      conversationInfo,
      agents: [],
      attributionMode: 'last_agent',
      sectionScores: [],
      topicScores: [],
      totalScore: 0,
      passed: false,
      criticalFailures: [],
      evaluatorId: '',
      evaluatorName: '',
      evaluatedAt: 0,
      notes: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await this.assessmentsCollection.add(newAssessment as QAAssessmentDocument);
    newAssessment.id = docRef.id;
    await docRef.update({ id: docRef.id });

    return newAssessment;
  }

  /**
   * Bulk add conversations to the assessment queue
   * Uses batch writes for efficiency
   */
  async bulkAddToQueue(
    accountId: string, conversationIds: string[],
  ): Promise<{ created: number; failed: number; assessments: QAAssessment[] }> {
    const assessments: QAAssessment[] = [];
    let created = 0;
    let failed = 0;

    // Process in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    const batches: string[][] = [];

    for (let i = 0; i < conversationIds.length; i += batchSize) {
      batches.push(conversationIds.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      // Create assessment documents in a single batch write
      const firestoreBatch = this.assessmentsCollection.firestore.batch();
      const batchAssessments: QAAssessment[] = [];

      for (const conversationId of batch) {
        try {
          const docRef = this.assessmentsCollection.doc();
          const newAssessment: QAAssessment = {
            id: docRef.id,
            accountId,
            conversationId,
            ruleId: '',
            frameworkId: '',
            topicIds: [],
            status: 'in_progress',
            conversationInfo: {
              startTime: Date.now(),
              endTime: 0,
              duration: 0,
              skillId: 0,
              skillName: '',
              channel: '',
              customerName: '',
              agentName: '',
              agentId: '',
            },
            agents: [],
            attributionMode: 'last_agent',
            sectionScores: [],
            topicScores: [],
            totalScore: 0,
            passed: false,
            criticalFailures: [],
            evaluatorId: '',
            evaluatorName: '',
            evaluatedAt: 0,
            notes: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          firestoreBatch.set(docRef, newAssessment as QAAssessmentDocument);
          batchAssessments.push(newAssessment);
        } catch (error) {
          console.warn(`Failed to prepare assessment for ${conversationId}:`, error);
          failed++;
        }
      }

      // Commit the batch
      try {
        await firestoreBatch.commit();
        assessments.push(...batchAssessments);
        created += batchAssessments.length;
      } catch (error) {
        console.error('Batch commit failed:', error);
        failed += batchAssessments.length;
      }
    }

    return { created, failed, assessments };
  }

  async saveAssessment(
    accountId: string, assessmentId: string,
    updates: Partial<QAAssessment>,
  ): Promise<QAAssessment> {
    const assessmentRef = this.assessmentsCollection.doc(assessmentId);

    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await assessmentRef.update(updatedData);

    const updated = await assessmentRef.get();
    return { id: updated.id, ...updated.data() } as QAAssessment;
  }

  async submitAssessment(
    accountId: string, assessmentId: string,
    assessment: QAAssessment,
  ): Promise<QAAssessment> {
    const assessmentRef = this.assessmentsCollection.doc(assessmentId);

    const submittedData = {
      ...assessment,
      status: 'completed',
      evaluatedAt: Date.now(),
      updatedAt: Date.now(),
    };

    await assessmentRef.update(submittedData);

    const updated = await assessmentRef.get();
    return { id: updated.id, ...updated.data() } as QAAssessment;
  }

  // =========================================================================
  // AI Framework Conversion
  // =========================================================================

  /**
   * Extract text from base64 encoded document
   * Supports PDF and DOCX formats
   */
  private extractTextFromDocument(fileContent: string, fileName: string): string {
    const buffer = Buffer.from(fileContent, 'base64');
    const extension = fileName.toLowerCase().split('.').pop();

    try {
      if (extension === 'pdf') {
        // PDF text extraction - basic approach
        // For production, consider installing pdf-parse: npm install pdf-parse
        const pdfText = this.extractTextFromPdfBasic(buffer);
        if (pdfText) {
          return pdfText;
        }
        return `[PDF Document]\n\nFile: ${fileName}\n\nNote: PDF text extraction requires the pdf-parse package. Please convert to DOCX for better results, or install pdf-parse.`;
      } else if (extension === 'docx') {
        // DOCX text extraction using adm-zip
        return this.extractTextFromDocxBasic(buffer);
      } else if (extension === 'doc') {
        // Old .doc format - limited support
        return `[DOC Document]\n\nFile: ${fileName}\n\nNote: Old .doc format has limited support. Please convert to .docx for better results.`;
      } else {
        // Try to decode as plain text
        return buffer.toString('utf-8');
      }
    } catch (error) {
      console.error('Error extracting text from document:', error);
      return `[Document extraction failed for ${fileName}]`;
    }
  }

  /**
   * Basic PDF text extraction
   * Attempts to extract text from PDF without external dependencies
   */
  private extractTextFromPdfBasic(buffer: Buffer): string | null {
    try {
      // Convert buffer to string and look for text streams
      const content = buffer.toString('latin1');

      // Find text between BT (begin text) and ET (end text) markers
      const textMatches: string[] = [];
      const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
      let match: RegExpExecArray | null;

      while ((match = streamRegex.exec(content)) !== null) {
        const streamContent = match[1];
        // Look for text showing operators: Tj, TJ, ', "
        const textRegex = /\(([^)]*)\)\s*Tj|\[([^\]]*)\]\s*TJ/g;
        let textMatch: RegExpExecArray | null;
        while ((textMatch = textRegex.exec(streamContent)) !== null) {
          const text = textMatch[1] || textMatch[2];
          if (text) {
            // Clean up the text
            const cleaned = text
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\(|\)/g, ' ');
            textMatches.push(cleaned);
          }
        }
      }

      if (textMatches.length > 0) {
        return textMatches.join(' ').replace(/\s+/g, ' ').trim();
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Basic DOCX text extraction without mammoth
   * Extracts text from document.xml inside the DOCX archive
   */
  private extractTextFromDocxBasic(buffer: Buffer): string {
    try {
      const zip = new AdmZip(buffer);
      const documentXml = zip.getEntry('word/document.xml');

      if (!documentXml) {
        return '[DOCX Document - Unable to find document.xml]';
      }

      const xmlContent = documentXml.getData().toString('utf-8');

      // Extract text from <w:t> tags
      const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (!textMatches) {
        return '[DOCX Document - No text content found]';
      }

      // Clean up and join text
      const text = textMatches
        .map((match: string) => {
          const textMatch = match.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
          return textMatch ? textMatch[1] : '';
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      return text;
    } catch (error) {
      console.error('Basic DOCX extraction failed:', error);
      return '[DOCX Document - Extraction failed]';
    }
  }

  /**
   * Convert an uploaded document to a QA framework using AI
   * @param accountId The LP account ID
   * @param flowId The AI Studio flow ID to use
   * @param fileContent The base64 encoded file content
   * @param fileName The original file name
   * @param fileType Optional file type hint
   * @returns Parsed framework structure ready for use
   */
  async convertFrameworkWithAI(
    accountId: string, flowId: string,
    fileContent: string,
    fileName: string,
    _fileType?: string, // Reserved for future use
  ): Promise<{
    name: string;
    description: string;
    sections: Array<{
      id: string;
      name: string;
      description: string;
      weight: number;
      order: number;
      items: Array<{
        id: string;
        description: string;
        helpText?: string;
        weight: number;
        type: 'binary' | 'scale_3' | 'scale_5' | 'na_allowed';
        isCritical: boolean;
        aiAssistEligible: boolean;
      }>;
    }>;
    passingScore: number;
  }> {
    // Extract plain text from the document
    const documentText = this.extractTextFromDocument(fileContent, fileName);

    // Build the prompt for AI framework conversion
    const prompt = `You are an expert QA framework analyst. Your task is to analyze the provided QA framework document and convert it into a structured scoring framework.

## Document Information:
- File Name: ${fileName}

## Document Content:
${documentText}

## Instructions:
1. Analyze the document to identify the QA framework structure
2. Extract all sections/categories of evaluation criteria
3. For each section, identify individual scoring items
4. Determine appropriate scoring types and weights
5. Identify any items marked as critical/auto-fail

## Output Requirements:
Return a JSON object with the following structure:

{
  "name": "Framework name extracted from document or a suggested name",
  "description": "Brief description of the framework's purpose",
  "passingScore": 80,
  "sections": [
    {
      "id": "section_1",
      "name": "Section Name",
      "description": "What this section evaluates",
      "weight": 20,
      "order": 0,
      "items": [
        {
          "id": "item_1_1",
          "description": "Criteria description",
          "helpText": "Additional guidance for evaluators",
          "weight": 3,
          "type": "scale_3",
          "isCritical": false,
          "aiAssistEligible": true
        }
      ]
    }
  ]
}

## Scoring Types:
- "binary": Yes/No (0 or 1)
- "scale_3": 1-3 scale (Poor/Acceptable/Excellent)
- "scale_5": 1-5 scale (detailed gradation)
- "na_allowed": Allows N/A option

## Weight Guidelines:
- Section weights should total 100%
- Item weights represent points within their section
- Assign higher weights to more important criteria

## Critical Items:
- Mark items as "isCritical": true if they are auto-fail criteria
- These are typically compliance, safety, or severe customer impact items

IMPORTANT:
- Ensure all section weights add up to exactly 100
- Generate unique IDs for sections (section_1, section_2, etc.) and items (item_1_1, item_1_2, etc.)
- If the document structure is unclear, make reasonable interpretations based on common QA frameworks
- Respond ONLY with valid JSON`;

    // Get SDK and invoke the AI Studio flow
    const sdk = await this.getSDK(accountId, '');

    const response = await sdk.aiStudio.flows.invoke(flowId, {
      input: { text: prompt },
    });

    // Parse the response
    let aiContent: string;
    if (response.data?.output) {
      const output = response.data.output as Record<string, unknown>;
      aiContent = (output.text as string) || (output.content as string) || JSON.stringify(output);
    } else {
      aiContent = JSON.stringify(response.data);
    }

    // Default result structure
    const defaultResult = {
      name: `Imported Framework: ${fileName}`,
      description: 'Automatically imported QA framework',
      passingScore: 80,
      sections: [],
    };

    // Parse the JSON response from AI
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and normalize the structure
        const result = {
          name: parsed.name || defaultResult.name,
          description: parsed.description || defaultResult.description,
          passingScore: parsed.passingScore || 80,
          sections: (parsed.sections || []).map((section: any, sectionIdx: number) => ({
            id: section.id || `section_${Date.now()}_${sectionIdx}`,
            name: section.name || `Section ${sectionIdx + 1}`,
            description: section.description || '',
            weight: section.weight || 0,
            order: section.order ?? sectionIdx,
            items: (section.items || []).map((item: any, itemIdx: number) => ({
              id: item.id || `item_${Date.now()}_${sectionIdx}_${itemIdx}`,
              description: item.description || `Item ${itemIdx + 1}`,
              helpText: item.helpText || '',
              weight: item.weight || 1,
              type: ['binary', 'scale_3', 'scale_5', 'na_allowed'].includes(item.type) ? item.type : 'scale_3',
              isCritical: Boolean(item.isCritical),
              aiAssistEligible: item.aiAssistEligible !== false,
            })),
          })),
        };

        // Validate section weights add up to 100
        const totalWeight = result.sections.reduce((sum: number, s: { weight: number }) => sum + s.weight, 0);
        if (totalWeight !== 100 && result.sections.length > 0) {
          // Normalize weights to 100
          const factor = 100 / totalWeight;
          result.sections.forEach((section: { weight: number }) => {
            section.weight = Math.round(section.weight * factor);
          });
          // Adjust last section to ensure exactly 100
          const newTotal = result.sections.reduce((sum: number, s: { weight: number }) => sum + s.weight, 0);
          if (newTotal !== 100 && result.sections.length > 0) {
            result.sections[result.sections.length - 1].weight += (100 - newTotal);
          }
        }

        return result;
      }
    } catch (parseError) {
      console.error('Failed to parse AI response for framework conversion:', parseError);
    }

    // Return default if parsing fails
    return defaultResult;
  }

  // =========================================================================
  // AI Analysis
  // =========================================================================

  /**
   * Perform AI-powered QA assessment analysis
   * @param accountId The LP account ID
   * @param flowId The AI Studio flow ID to use
   * @param transcript The conversation transcript text
   * @param frameworkCriteria The framework criteria text
   * @returns Parsed AI analysis with comments, scores, and summary
   */
  async performAIAnalysis(
    accountId: string, flowId: string,
    transcript: string,
    frameworkCriteria: string,
  ): Promise<{
    comments: Array<{
      messageIndex?: number;
      messageIndices?: number[];
      comment: string;
      type: 'positive' | 'negative' | 'neutral' | 'suggestion';
      category?: string;
      confidence?: number;
    }>;
    scores: Array<{
      sectionId: string;
      itemId: string;
      score: number;
      confidence?: number;
      reasoning?: string;
    }>;
    summary: string;
    overallAssessment: {
      overallScore: number;
      overallConfidence: number;
      passed: boolean;
      strengths: string[];
      weaknesses: string[];
      improvementAreas: string[];
      criticalIssues: string[];
      executiveSummary: string;
    };
  }> {
    // Build the prompt for AI analysis
    const prompt = `You are a senior QA analyst evaluating a customer service conversation. Provide a comprehensive assessment against the quality framework criteria.

## Conversation Transcript:
${transcript}

## Quality Framework Criteria:
${frameworkCriteria}

## Instructions:
1. Focus on HIGH-IMPACT observations that meaningfully affect the assessment score
2. DO NOT comment on every message - only provide comments where there is something significant to note
3. Group related observations together - if a pattern appears across multiple messages, create ONE comment with multiple messageIndices
4. **IMPORTANT: Provide a suggested score for EVERY item in the framework** - use the sectionId/itemId from the criteria
5. Explain HOW each observation impacts the overall assessment score
6. For items marked [CRITICAL], if they are not met (score 0 for binary, or below threshold for scales), this is a critical failure

## Comment Guidelines:
- Aim for 5-10 high-quality comments, not 20+ granular ones
- Use messageIndices (array) when a comment relates to multiple messages (e.g., repeated behavior patterns)
- Use messageIndex (single number) only for observations specific to one message
- Each comment should provide actionable insight for quality improvement
- Connect comments to framework criteria where applicable

CRITICAL: For messageIndex and messageIndices, use ONLY the [Message X] numbers from the transcript (0, 1, 2, 3, etc.).
These are array indices, NOT the 'seq' field or 'msg:XX' part of message IDs. Example: [Message 5] means use index 5.

## Score ALL Framework Items:
You MUST provide a score entry for EVERY item in EVERY section of the framework. Use the exact sectionId and itemId provided in the criteria.
For each item, provide:
- The suggested score based on the conversation evidence
- Your confidence level (0.0-1.0)
- Brief reasoning explaining your score decision

Return your analysis as JSON in the following format:

{
  "comments": [
    {
      "messageIndices": [2, 5, 8],
      "comment": "Agent repeated the same unhelpful response 3 times, indicating reliance on canned responses without adapting to customer needs. This pattern significantly impacted the Communication score.",
      "type": "negative",
      "category": "Communication",
      "confidence": 0.95
    },
    {
      "messageIndex": 12,
      "comment": "Single message observation here",
      "type": "positive|negative|neutral|suggestion",
      "category": "Category name",
      "confidence": 0.9
    }
  ],
  "scores": [
    {
      "sectionId": "section-id-from-criteria",
      "itemId": "item-id-from-criteria",
      "score": 1,
      "confidence": 0.9,
      "reasoning": "Brief explanation of why this score was given"
    }
  ],
  "summary": "One-line assessment summary",
  "overallAssessment": {
    "overallScore": 75,
    "overallConfidence": 0.85,
    "passed": true,
    "strengths": ["List of key strengths demonstrated"],
    "weaknesses": ["List of weaknesses identified"],
    "improvementAreas": ["Specific actionable improvement recommendations"],
    "criticalIssues": ["Any critical failures or major concerns - empty if none"],
    "executiveSummary": "2-3 sentence summary suitable for management review"
  }
}

Scoring types (use appropriate values based on item type):
- binary: 0 (No/Not Met) or 1 (Yes/Met)
- scale_3: 1 (Poor), 2 (Acceptable), or 3 (Excellent)
- scale_5: 1 (Very Poor) to 5 (Excellent)
- na_allowed: 0-5, or null if Not Applicable

IMPORTANT:
- Prefer messageIndices (array) over messageIndex when observations span multiple messages
- You MUST score EVERY item in the framework - do not skip any items
- Be specific, actionable, and explain score impact
- Focus on quality over quantity for comments
- Respond ONLY with valid JSON`;

    // Get SDK and invoke the AI Studio flow
    const sdk = await this.getSDK(accountId, '');

    const response = await sdk.aiStudio.flows.invoke(flowId, {
      input: { text: prompt },
    });

    // Parse the response
    let aiContent: string;
    if (response.data?.output) {
      const output = response.data.output as Record<string, unknown>;
      aiContent = (output.text as string) || (output.content as string) || JSON.stringify(output);
    } else {
      aiContent = JSON.stringify(response.data);
    }

    // Default overall assessment for fallback
    const defaultOverallAssessment = {
      overallScore: 0,
      overallConfidence: 0,
      passed: false,
      strengths: [],
      weaknesses: [],
      improvementAreas: [],
      criticalIssues: [],
      executiveSummary: 'Assessment could not be completed.',
    };

    // Parse the JSON response from AI
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];

        // Try to parse directly first
        try {
          const parsed = JSON.parse(jsonStr);
          return {
            comments: parsed.comments || [],
            scores: parsed.scores || [],
            summary: parsed.summary || '',
            overallAssessment: parsed.overallAssessment || defaultOverallAssessment,
          };
        } catch (initialParseError) {
          // If parsing fails, try to repair truncated JSON
          console.warn('Initial JSON parse failed, attempting repair...');

          // Count unclosed brackets and braces
          let openBraces = 0;
          let openBrackets = 0;
          let inString = false;
          let escapeNext = false;

          for (const char of jsonStr) {
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            if (char === '"') {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '{') openBraces++;
              else if (char === '}') openBraces--;
              else if (char === '[') openBrackets++;
              else if (char === ']') openBrackets--;
            }
          }

          // Close any unclosed structures
          // First, if we're mid-string, close it
          if (inString) {
            jsonStr += '"';
          }

          // Remove trailing incomplete tokens (commas, colons, partial values)
          jsonStr = jsonStr.replace(/,\s*$/, ''); // Remove trailing comma
          jsonStr = jsonStr.replace(/:\s*$/, ': null'); // Complete hanging colon with null
          jsonStr = jsonStr.replace(/"\s*:\s*"[^"]*$/, '": ""'); // Complete truncated string value

          // Close brackets and braces
          jsonStr += ']'.repeat(Math.max(0, openBrackets));
          jsonStr += '}'.repeat(Math.max(0, openBraces));

          // Try parsing repaired JSON
          try {
            const parsed = JSON.parse(jsonStr);
            console.log('Successfully parsed repaired JSON');
            return {
              comments: parsed.comments || [],
              scores: parsed.scores || [],
              summary: parsed.summary || '',
              overallAssessment: parsed.overallAssessment || defaultOverallAssessment,
            };
          } catch (repairError) {
            // Try one more fix: remove the last incomplete array/object element
            console.warn('Repair attempt 1 failed, trying to remove last incomplete element...');
            try {
              // Find and remove the last incomplete element before closing
              let repairedJson = jsonStr
                .replace(/,\s*[\]}]+$/, match => match.replace(',', '')) // Remove comma before closing
                .replace(/\{[^{}]*$/, '') // Remove incomplete object at end
                .replace(/\[[^\[\]]*$/, ''); // Remove incomplete array at end

              // Re-count and close
              openBraces = 0;
              openBrackets = 0;
              inString = false;
              escapeNext = false;
              for (const char of repairedJson) {
                if (escapeNext) { escapeNext = false; continue; }
                if (char === '\\') { escapeNext = true; continue; }
                if (char === '"') { inString = !inString; continue; }
                if (!inString) {
                  if (char === '{') openBraces++;
                  else if (char === '}') openBraces--;
                  else if (char === '[') openBrackets++;
                  else if (char === ']') openBrackets--;
                }
              }
              repairedJson += ']'.repeat(Math.max(0, openBrackets));
              repairedJson += '}'.repeat(Math.max(0, openBraces));

              const parsed = JSON.parse(repairedJson);
              console.log('Successfully parsed after removing incomplete elements');
              return {
                comments: parsed.comments || [],
                scores: parsed.scores || [],
                summary: parsed.summary || '',
                overallAssessment: parsed.overallAssessment || defaultOverallAssessment,
              };
            } catch (finalError) {
              console.error('All JSON repair attempts failed');
              throw initialParseError;
            }
          }
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
    }

    // Return empty result if parsing fails
    return {
      comments: [{
        messageIndex: 0,
        comment: `AI provided analysis but response could not be parsed: ${aiContent.substring(0, 200)}...`,
        type: 'neutral',
        category: 'AI Analysis',
        confidence: 0.5,
      }],
      scores: [],
      summary: 'Analysis complete but structured response could not be parsed.',
      overallAssessment: defaultOverallAssessment,
    };
  }
}
