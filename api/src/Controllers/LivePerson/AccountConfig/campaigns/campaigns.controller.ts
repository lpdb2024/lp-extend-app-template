/**
 * Campaigns Controller
 * REST API endpoints for LivePerson Campaigns
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
import { CampaignsService } from './campaigns.service';
import {
  CampaignQueryDto,
  CampaignCreateDto,
  CampaignUpdateDto,
  CampaignResponseDto,
  CampaignListResponseDto,
} from './campaigns.dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all campaigns',
    description: 'Retrieve all campaigns for an account with optional filtering',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of campaigns' })
  async getCampaigns(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignQueryDto,
    @Req() req: Request,
  ): Promise<CampaignListResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.campaignsService.getCampaigns(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get(':campaignId')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Retrieve a specific campaign by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  async getCampaignById(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignQueryDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.campaignsService.getCampaignById(
      accountId,
      campaignId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a campaign',
    description: 'Create a new campaign (initially unpublished)',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Created campaign' })
  async createCampaign(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CampaignCreateDto,
    @Query() query: CampaignQueryDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.campaignsService.createCampaign(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Put(':campaignId')
  @ApiOperation({
    summary: 'Update a campaign',
    description: 'Update an existing campaign. Requires If-Match header with current revision.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated campaign' })
  async updateCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: CampaignUpdateDto,
    @Query() query: CampaignQueryDto,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.campaignsService.updateCampaign(
      accountId,
      campaignId,
      token,
      body as any,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':campaignId')
  @ApiOperation({
    summary: 'Delete a campaign',
    description: 'Delete a campaign. Requires If-Match header with current revision.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  async deleteCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    await this.campaignsService.deleteCampaign(
      accountId,
      campaignId,
      token,
      revision,
    );

    return { success: true };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('status/published')
  @ApiOperation({
    summary: 'Get published campaigns',
    description: 'Get all campaigns with status=published',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of published campaigns' })
  async getPublishedCampaigns(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<CampaignListResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.campaignsService.getPublishedCampaigns(
      accountId,
      token,
    );

    return { data: response.data };
  }

  @Post(':campaignId/publish')
  @ApiOperation({
    summary: 'Publish a campaign',
    description: 'Set campaign status to published',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Published campaign' })
  async publishCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.campaignsService.publishCampaign(
      accountId,
      campaignId,
      token,
      revision,
    );

    return { data: response.data };
  }

  @Post(':campaignId/unpublish')
  @ApiOperation({
    summary: 'Unpublish a campaign',
    description: 'Set campaign status to unpublished',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Unpublished campaign' })
  async unpublishCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.campaignsService.unpublishCampaign(
      accountId,
      campaignId,
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
