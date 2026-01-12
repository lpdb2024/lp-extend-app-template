/**
 * QA Assessment Controller
 * REST API endpoints for QA Assessment
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { QAAssessmentService } from './qa-assessment.service';
import type {
  QATopic,
  QAFramework,
  QAAssessmentRule,
  QAAssessment,
} from './qa-assessment.interfaces';

@ApiTags('QA Assessment')
@ApiBearerAuth()
@Controller('api/v2/qa/:accountId')
export class QAAssessmentController {
  constructor(private readonly qaService: QAAssessmentService) {}

  // =========================================================================
  // Topics
  // =========================================================================

  @Get('topics')
  @ApiOperation({ summary: 'Get all topics' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'List of topics' })
  async getTopics(
    @Param('accountId') accountId: string,
  ): Promise<QATopic[]> {
    return this.qaService.getTopics(accountId);
  }

  @Post('topics')
  @ApiOperation({ summary: 'Create topic' })
  async createTopic(
    @Param('accountId') accountId: string,
    @Body() topic: Partial<QATopic>,
  ): Promise<QATopic> {
    return this.qaService.createTopic(accountId, topic);
  }

  @Put('topics/:topicId')
  @ApiOperation({ summary: 'Update topic' })
  async updateTopic(
    @Param('accountId') accountId: string,
    @Param('topicId') topicId: string,
    @Body() updates: Partial<QATopic>,
  ): Promise<QATopic> {
    return this.qaService.updateTopic(accountId, topicId, updates);
  }

  @Delete('topics/:topicId')
  @ApiOperation({ summary: 'Delete topic' })
  async deleteTopic(
    @Param('accountId') accountId: string,
    @Param('topicId') topicId: string,
  ): Promise<{ success: boolean }> {
    await this.qaService.deleteTopic(accountId, topicId);
    return { success: true };
  }

  // =========================================================================
  // Frameworks
  // =========================================================================

  @Get('frameworks')
  @ApiOperation({ summary: 'Get all frameworks' })
  async getFrameworks(
    @Param('accountId') accountId: string,
  ): Promise<QAFramework[]> {
    return this.qaService.getFrameworks(accountId);
  }

  @Post('frameworks')
  @ApiOperation({ summary: 'Create framework' })
  async createFramework(
    @Param('accountId') accountId: string,
    @Body() framework: Partial<QAFramework>,
  ): Promise<QAFramework> {
    return this.qaService.createFramework(accountId, framework);
  }

  @Put('frameworks/:frameworkId')
  @ApiOperation({ summary: 'Update framework' })
  async updateFramework(
    @Param('accountId') accountId: string,
    @Param('frameworkId') frameworkId: string,
    @Body() updates: Partial<QAFramework>,
  ): Promise<QAFramework> {
    return this.qaService.updateFramework(accountId, frameworkId, updates);
  }

  @Delete('frameworks/:frameworkId')
  @ApiOperation({ summary: 'Delete framework' })
  async deleteFramework(
    @Param('accountId') accountId: string,
    @Param('frameworkId') frameworkId: string,
  ): Promise<{ success: boolean }> {
    await this.qaService.deleteFramework(accountId, frameworkId);
    return { success: true };
  }

  @Post('frameworks/:frameworkId/clone')
  @ApiOperation({ summary: 'Clone framework' })
  async cloneFramework(
    @Param('accountId') accountId: string,
    @Param('frameworkId') frameworkId: string,
    @Body() body: { newName: string },
  ): Promise<QAFramework> {
    return this.qaService.cloneFramework(accountId, frameworkId, body.newName);
  }

  // =========================================================================
  // Rules
  // =========================================================================

  @Get('rules')
  @ApiOperation({ summary: 'Get all rules' })
  async getRules(
    @Param('accountId') accountId: string,
  ): Promise<QAAssessmentRule[]> {
    return this.qaService.getRules(accountId);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create rule' })
  async createRule(
    @Param('accountId') accountId: string,
    @Body() rule: Partial<QAAssessmentRule>,
  ): Promise<QAAssessmentRule> {
    return this.qaService.createRule(accountId, rule);
  }

  @Put('rules/:ruleId')
  @ApiOperation({ summary: 'Update rule' })
  async updateRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
    @Body() updates: Partial<QAAssessmentRule>,
  ): Promise<QAAssessmentRule> {
    return this.qaService.updateRule(accountId, ruleId, updates);
  }

  @Delete('rules/:ruleId')
  @ApiOperation({ summary: 'Delete rule' })
  async deleteRule(
    @Param('accountId') accountId: string,
    @Param('ruleId') ruleId: string,
  ): Promise<{ success: boolean }> {
    await this.qaService.deleteRule(accountId, ruleId);
    return { success: true };
  }

  // =========================================================================
  // Assessments
  // =========================================================================

  @Get('assessments/queue')
  @ApiOperation({ summary: 'Get assessment queue' })
  async getAssessmentQueue(
    @Param('accountId') accountId: string,
  ): Promise<QAAssessment[]> {
    return this.qaService.getAssessmentQueue(accountId);
  }

  @Post('assessments')
  @ApiOperation({ summary: 'Start new assessment' })
  async startAssessment(
    @Param('accountId') accountId: string,
    @Body() body: { conversationId: string },
  ): Promise<QAAssessment> {
    return this.qaService.startAssessment(accountId, body.conversationId);
  }

  @Post('assessments/bulk')
  @ApiOperation({ summary: 'Add multiple conversations to assessment queue' })
  @ApiResponse({ status: 201, description: 'Assessments created' })
  async bulkAddToQueue(
    @Param('accountId') accountId: string,
    @Body() body: { conversationIds: string[] },
  ): Promise<{ created: number; failed: number; assessments: QAAssessment[] }> {

    if (!body.conversationIds || body.conversationIds.length === 0) {
      throw new BadRequestException('conversationIds array is required');
    }

    return this.qaService.bulkAddToQueue(accountId, body.conversationIds);
  }

  @Put('assessments/:assessmentId')
  @ApiOperation({ summary: 'Save assessment draft' })
  async saveAssessment(
    @Param('accountId') accountId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() updates: Partial<QAAssessment>,
  ): Promise<QAAssessment> {
    return this.qaService.saveAssessment(accountId, assessmentId, updates);
  }

  @Post('assessments/:assessmentId/submit')
  @ApiOperation({ summary: 'Submit assessment' })
  async submitAssessment(
    @Param('accountId') accountId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() assessment: QAAssessment,
  ): Promise<QAAssessment> {
    return this.qaService.submitAssessment(accountId, assessmentId, assessment);
  }

  // =========================================================================
  // AI Framework Conversion
  // =========================================================================

  @Post('frameworks/convert')
  @ApiOperation({ summary: 'Convert uploaded document to QA framework using AI' })
  @ApiResponse({ status: 200, description: 'Converted framework structure' })
  async convertFrameworkWithAI(
    @Param('accountId') accountId: string,
    @Body() body: {
      flowId: { label: string; value: string } | null;
      fileContent: string;
      fileName: string;
      fileType?: string;
    },
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

    if (!body.flowId) {
      throw new BadRequestException('flowId is required');
    }
    if (!body.fileContent) {
      throw new BadRequestException('fileContent is required');
    }
    if (!body.fileName) {
      throw new BadRequestException('fileName is required');
    }

    return this.qaService.convertFrameworkWithAI(
      accountId,
      body.flowId?.value,
      body.fileContent,
      body.fileName,
      body.fileType,
    );
  }

  // =========================================================================
  // AI Analysis
  // =========================================================================

  @Post('ai-analysis')
  @ApiOperation({ summary: 'Perform AI-powered QA analysis on a conversation' })
  @ApiResponse({ status: 200, description: 'AI analysis results with comments and scores' })
  async performAIAnalysis(
    @Param('accountId') accountId: string,
    @Body() body: {
      flowId: string;
      transcript: string;
      frameworkCriteria: string;
    },
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

    if (!body.flowId) {
      throw new BadRequestException('flowId is required');
    }
    if (!body.transcript) {
      throw new BadRequestException('transcript is required');
    }
    if (!body.frameworkCriteria) {
      throw new BadRequestException('frameworkCriteria is required');
    }

    return this.qaService.performAIAnalysis(
      accountId,
      body.flowId,
      body.transcript,
      body.frameworkCriteria,
    );
  }

  // Helper method
  private validateToken(token: string | null): void {
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
