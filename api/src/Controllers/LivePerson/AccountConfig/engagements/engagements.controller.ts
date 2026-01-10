/**
 * Engagements Controller
 * REST API endpoints for LivePerson Engagements
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { EngagementsService } from './engagements.service';
import {
  EngagementQueryDto,
  EngagementCreateDto,
  EngagementUpdateDto,
  EngagementResponseDto,
  EngagementListResponseDto,
} from './engagements.dto';

@ApiTags('Engagements')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/campaigns/:campaignId/engagements')
export class EngagementsController {
  constructor(private readonly engagementsService: EngagementsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all engagements for a campaign',
    description: 'Retrieve all engagements for a specific campaign',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'List of engagements' })
  async getEngagements(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Query() query: EngagementQueryDto,
    @Req() req: Request,
  ): Promise<EngagementListResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.engagementsService.getEngagements(
      accountId,
      campaignId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get(':engagementId')
  @ApiOperation({
    summary: 'Get engagement by ID',
    description: 'Retrieve a specific engagement by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiParam({ name: 'engagementId', description: 'Engagement ID' })
  @ApiResponse({ status: 200, description: 'Engagement details' })
  async getEngagementById(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Param('engagementId') engagementId: string,
    @Headers('authorization') authorization: string,
    @Query() query: EngagementQueryDto,
    @Req() req: Request,
  ): Promise<EngagementResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.engagementsService.getEngagementById(
      accountId,
      campaignId,
      engagementId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create an engagement',
    description: 'Create a new engagement for a campaign',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 201, description: 'Created engagement' })
  async createEngagement(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Body() body: EngagementCreateDto,
    @Query() query: EngagementQueryDto,
    @Req() req: Request,
  ): Promise<EngagementResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.engagementsService.createEngagement(
      accountId,
      campaignId,
      token,
      body as any,
      query,
    );

    return { data: response.data };
  }

  @Put(':engagementId')
  @ApiOperation({
    summary: 'Update an engagement',
    description: 'Update an existing engagement. Requires If-Match header with current revision.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiParam({ name: 'engagementId', description: 'Engagement ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated engagement' })
  async updateEngagement(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Param('engagementId') engagementId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: EngagementUpdateDto,
    @Query() query: EngagementQueryDto,
    @Req() req: Request,
  ): Promise<EngagementResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.engagementsService.updateEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      body as any,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':engagementId')
  @ApiOperation({
    summary: 'Delete an engagement',
    description: 'Delete an engagement. Requires If-Match header with current revision.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiParam({ name: 'engagementId', description: 'Engagement ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Engagement deleted' })
  async deleteEngagement(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Param('engagementId') engagementId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    await this.engagementsService.deleteEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      revision,
    );

    return { success: true };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Post(':engagementId/enable')
  @ApiOperation({
    summary: 'Enable an engagement',
    description: 'Enable an engagement for display',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiParam({ name: 'engagementId', description: 'Engagement ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Enabled engagement' })
  async enableEngagement(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Param('engagementId') engagementId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<EngagementResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.engagementsService.enableEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      revision,
    );

    return { data: response.data };
  }

  @Post(':engagementId/disable')
  @ApiOperation({
    summary: 'Disable an engagement',
    description: 'Disable an engagement from display',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiParam({ name: 'engagementId', description: 'Engagement ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Disabled engagement' })
  async disableEngagement(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Param('engagementId') engagementId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<EngagementResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.engagementsService.disableEngagement(
      accountId,
      campaignId,
      engagementId,
      token,
      revision,
    );

    return { data: response.data };
  }

  /**
   * Extract token from Authorization header or shell auth
   * Supports both direct Bearer auth and shell token auth (via middleware)
   */
  private extractToken(authorization: string, req?: any): string {
    // First check if shell auth provided token via middleware
    if (req?.token?.accessToken) {
      return req.token.accessToken;
    }

    // Fall back to Authorization header
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }

  private extractRevision(ifMatch: string): string {
    if (!ifMatch) {
      throw new BadRequestException('If-Match header is required for this operation');
    }
    return ifMatch;
  }
}
