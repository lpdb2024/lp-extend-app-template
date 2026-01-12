/**
 * QA Batch Assessment Controller
 * REST API endpoints for batch job management
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { QABatchService } from './qa-batch.service';
import type {
  CreateBatchJobDto,
  BatchJobStatusResponse,
  QABatchJob,
} from './qa-batch.interfaces';

@ApiTags('QA Batch Assessment')
@ApiBearerAuth()
@Controller('api/v2/qa/:accountId/batch-jobs')
export class QABatchController {
  constructor(private readonly batchService: QABatchService) {}

  /**
   * Create a new batch job
   */
  @Post()
  @ApiOperation({ summary: 'Create a new batch assessment job' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiResponse({ status: 201, description: 'Batch job created' })
  async createBatchJob(
    @Param('accountId') accountId: string,
    @Headers('x-user-name') userName: string,
    @Body() dto: CreateBatchJobDto,
  ): Promise<QABatchJob> {
    if (!dto.frameworkId) {
      throw new BadRequestException('frameworkId is required');
    }

    if (!dto.filters?.dateFrom || !dto.filters?.dateTo) {
      throw new BadRequestException('filters.dateFrom and filters.dateTo are required');
    }

    return this.batchService.createBatchJob(
      accountId,
      dto,
      userName || 'unknown',
    );
  }

  /**
   * Get batch job status
   */
  @Get(':jobId')
  @ApiOperation({ summary: 'Get batch job status and progress' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiParam({ name: 'jobId', description: 'Batch job ID' })
  @ApiResponse({ status: 200, description: 'Batch job status' })
  @ApiResponse({ status: 404, description: 'Batch job not found' })
  async getBatchJobStatus(
    @Param('accountId') accountId: string,
    @Param('jobId') jobId: string,
  ): Promise<BatchJobStatusResponse> {
    return this.batchService.getBatchJobStatus(accountId, jobId);
  }

  /**
   * List batch jobs for account
   */
  @Get()
  @ApiOperation({ summary: 'List recent batch jobs' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max jobs to return' })
  @ApiResponse({ status: 200, description: 'List of batch jobs' })
  async listBatchJobs(
    @Param('accountId') accountId: string,
    @Query('limit') limit?: string,
  ): Promise<BatchJobStatusResponse[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.batchService.listBatchJobs(accountId, parsedLimit);
  }

  /**
   * Cancel a running batch job
   */
  @Delete(':jobId')
  @ApiOperation({ summary: 'Cancel a running batch job' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiParam({ name: 'jobId', description: 'Batch job ID' })
  @ApiResponse({ status: 200, description: 'Batch job cancelled' })
  @ApiResponse({ status: 404, description: 'Batch job not found' })
  async cancelBatchJob(
    @Param('accountId') accountId: string,
    @Param('jobId') jobId: string,
  ): Promise<{ success: boolean }> {
    await this.batchService.cancelBatchJob(accountId, jobId);
    return { success: true };
  }
}
