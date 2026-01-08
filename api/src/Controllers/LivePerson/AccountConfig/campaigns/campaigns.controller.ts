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
} from '@nestjs/common';
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
  @ApiResponse({ status: 200, description: 'List of campaigns', type: CampaignListResponseDto })
  async getCampaigns(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignQueryDto,
  ): Promise<CampaignListResponseDto> {
    const token = this.extractToken(authorization);

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
  @ApiResponse({ status: 200, description: 'Campaign details', type: CampaignResponseDto })
  async getCampaignById(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Query() query: CampaignQueryDto,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization);

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
  @ApiResponse({ status: 201, description: 'Created campaign', type: CampaignResponseDto })
  async createCampaign(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CampaignCreateDto,
    @Query() query: CampaignQueryDto,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization);

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
  @ApiResponse({ status: 200, description: 'Updated campaign', type: CampaignResponseDto })
  async updateCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: CampaignUpdateDto,
    @Query() query: CampaignQueryDto,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    const response = await this.campaignsService.updateCampaign(
      accountId,
      campaignId,
      token,
      body,
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
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization);
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
  @ApiResponse({ status: 200, description: 'List of published campaigns', type: CampaignListResponseDto })
  async getPublishedCampaigns(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<CampaignListResponseDto> {
    const token = this.extractToken(authorization);

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
  @ApiResponse({ status: 200, description: 'Published campaign', type: CampaignResponseDto })
  async publishCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization);
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
  @ApiResponse({ status: 200, description: 'Unpublished campaign', type: CampaignResponseDto })
  async unpublishCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
  ): Promise<CampaignResponseDto> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    const response = await this.campaignsService.unpublishCampaign(
      accountId,
      campaignId,
      token,
      revision,
    );

    return { data: response.data };
  }

  private extractToken(authorization: string): string {
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
