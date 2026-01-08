/**
 * Proactive Messaging Controller
 * REST API endpoints for LivePerson Proactive Messaging API
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProactiveMessagingService } from './proactive-messaging.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignQueryDto,
  CreateHandoffDto,
  UpdateHandoffDto,
  SendTestMessageDto,
  PMCampaignResponseDto,
  PMCampaignListResponseDto,
  PMHandoffResponseDto,
  PMHandoffListResponseDto,
  PMTestMessageResponseDto,
} from './proactive-messaging.dto';

@ApiTags('Proactive Messaging')
@ApiBearerAuth()
@Controller('api/v2/proactive-messaging/:accountId')
export class ProactiveMessagingController {
  constructor(private readonly proactiveMessagingService: ProactiveMessagingService) {}

  // ============================================
  // Auth Endpoints
  // ============================================

  @Post('auth/token')
  @ApiOperation({
    summary: 'Exchange OAuth code for PM session token',
    description: 'Exchanges an OAuth authorization code for a Proactive Messaging session token. This token is required for handoff API calls.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Session token obtained successfully' })
  async getPMSessionToken(
    @Param('accountId') accountId: string,
    @Body() body: { code: string },
  ): Promise<{ token: string }> {
    const token = await this.proactiveMessagingService.getPMSessionToken(
      accountId,
      body.code,
    );

    return { token };
  }

  // ============================================
  // Campaign Endpoints
  // ============================================

  @Post('campaigns')
  @ApiOperation({
    summary: 'Create a new proactive campaign',
    description: 'Creates a new proactive messaging campaign with targeting, channels, and scheduling.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully', type: PMCampaignResponseDto })
  async createCampaign(
    @Param('accountId') accountId: string,
    @Body() body: CreateCampaignDto,
  ): Promise<PMCampaignResponseDto> {
    const response = await this.proactiveMessagingService.createCampaign(
      accountId,
      body,
    );

    return { data: response.data };
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'Get all campaigns',
    description: 'Retrieves all proactive campaigns with optional filtering by status.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully', type: PMCampaignListResponseDto })
  async getCampaigns(
    @Param('accountId') accountId: string,
    @Query() query: CampaignQueryDto,
  ): Promise<PMCampaignListResponseDto> {
    const response = await this.proactiveMessagingService.getCampaigns(
      accountId,
      query,
    );

    return { data: response.data };
  }

  @Get('campaigns/:campaignId')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Retrieves a specific campaign by its ID.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully', type: PMCampaignResponseDto })
  async getCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
  ): Promise<PMCampaignResponseDto> {
    const response = await this.proactiveMessagingService.getCampaign(
      accountId,
      campaignId,
    );

    return { data: response.data };
  }

  @Put('campaigns/:campaignId')
  @ApiOperation({
    summary: 'Update a campaign',
    description: 'Updates an existing campaign with new configuration.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully', type: PMCampaignResponseDto })
  async updateCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Body() body: UpdateCampaignDto,
  ): Promise<PMCampaignResponseDto> {
    const response = await this.proactiveMessagingService.updateCampaign(
      accountId,
      campaignId,
      body,
    );

    return { data: response.data };
  }

  @Delete('campaigns/:campaignId')
  @ApiOperation({
    summary: 'Delete a campaign',
    description: 'Deletes a campaign permanently.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  async deleteCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
  ): Promise<{ success: boolean }> {
    await this.proactiveMessagingService.deleteCampaign(accountId, campaignId);

    return { success: true };
  }

  @Post('campaigns/:campaignId/activate')
  @ApiOperation({
    summary: 'Activate a campaign',
    description: 'Changes campaign status to ACTIVE and begins sending messages.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign activated successfully', type: PMCampaignResponseDto })
  async activateCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
  ): Promise<PMCampaignResponseDto> {
    const response = await this.proactiveMessagingService.activateCampaign(
      accountId,
      campaignId,
    );

    return { data: response.data };
  }

  @Post('campaigns/:campaignId/pause')
  @ApiOperation({
    summary: 'Pause a campaign',
    description: 'Changes campaign status to PAUSED and stops sending messages.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign paused successfully', type: PMCampaignResponseDto })
  async pauseCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
  ): Promise<PMCampaignResponseDto> {
    const response = await this.proactiveMessagingService.pauseCampaign(
      accountId,
      campaignId,
    );

    return { data: response.data };
  }

  @Post('campaigns/:campaignId/cancel')
  @ApiOperation({
    summary: 'Cancel a campaign',
    description: 'Changes campaign status to CANCELLED and permanently stops the campaign.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign cancelled successfully', type: PMCampaignResponseDto })
  async cancelCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
  ): Promise<PMCampaignResponseDto> {
    const response = await this.proactiveMessagingService.cancelCampaign(
      accountId,
      campaignId,
    );

    return { data: response.data };
  }

  // ============================================
  // Handoff Configuration Endpoints
  // (These use LP user OAuth token, not AppJWT)
  // ============================================

  @Post('handoffs')
  @ApiOperation({
    summary: 'Create a new handoff configuration',
    description: 'Creates a new handoff configuration for routing proactive messages.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Handoff created successfully', type: PMHandoffResponseDto })
  async createHandoff(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: CreateHandoffDto,
  ): Promise<PMHandoffResponseDto> {
    const lpToken = this.extractToken(authorization);
    const response = await this.proactiveMessagingService.createHandoff(
      accountId,
      body,
      lpToken,
    );

    return { data: response.data };
  }

  @Get('handoffs')
  @ApiOperation({
    summary: 'Get all handoff configurations',
    description: 'Retrieves all handoff configurations for the account.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Handoffs retrieved successfully', type: PMHandoffListResponseDto })
  async getHandoffs(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<PMHandoffListResponseDto> {
    const lpToken = this.extractToken(authorization);
    const response = await this.proactiveMessagingService.getHandoffs(accountId, lpToken);

    return { data: response.data };
  }

  @Get('handoffs/:handoffId')
  @ApiOperation({
    summary: 'Get handoff configuration by ID',
    description: 'Retrieves a specific handoff configuration by its ID.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'handoffId', description: 'Handoff configuration ID' })
  @ApiResponse({ status: 200, description: 'Handoff retrieved successfully', type: PMHandoffResponseDto })
  async getHandoff(
    @Param('accountId') accountId: string,
    @Param('handoffId') handoffId: string,
    @Headers('authorization') authorization: string,
  ): Promise<PMHandoffResponseDto> {
    const lpToken = this.extractToken(authorization);
    const response = await this.proactiveMessagingService.getHandoff(
      accountId,
      handoffId,
      lpToken,
    );

    return { data: response.data };
  }

  @Put('handoffs/:handoffId')
  @ApiOperation({
    summary: 'Update a handoff configuration',
    description: 'Updates an existing handoff configuration.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'handoffId', description: 'Handoff configuration ID' })
  @ApiResponse({ status: 200, description: 'Handoff updated successfully', type: PMHandoffResponseDto })
  async updateHandoff(
    @Param('accountId') accountId: string,
    @Param('handoffId') handoffId: string,
    @Headers('authorization') authorization: string,
    @Body() body: UpdateHandoffDto,
  ): Promise<PMHandoffResponseDto> {
    const lpToken = this.extractToken(authorization);
    const response = await this.proactiveMessagingService.updateHandoff(
      accountId,
      handoffId,
      body,
      lpToken,
    );

    return { data: response.data };
  }

  @Delete('handoffs/:handoffId')
  @ApiOperation({
    summary: 'Delete a handoff configuration',
    description: 'Deletes a handoff configuration permanently.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'handoffId', description: 'Handoff configuration ID' })
  @ApiResponse({ status: 200, description: 'Handoff deleted successfully' })
  async deleteHandoff(
    @Param('accountId') accountId: string,
    @Param('handoffId') handoffId: string,
    @Headers('authorization') authorization: string,
  ): Promise<{ success: boolean }> {
    const lpToken = this.extractToken(authorization);
    await this.proactiveMessagingService.deleteHandoff(accountId, handoffId, lpToken);

    return { success: true };
  }

  /**
   * Extract token from Authorization header
   */
  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new Error('Authorization header is required for handoff endpoints');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }

  // ============================================
  // Testing Endpoints
  // ============================================

  @Post('test-message')
  @ApiOperation({
    summary: 'Send a test message',
    description: 'Sends a test proactive message to validate configuration.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Test message sent successfully', type: PMTestMessageResponseDto })
  async sendTestMessage(
    @Param('accountId') accountId: string,
    @Body() body: SendTestMessageDto,
  ): Promise<PMTestMessageResponseDto> {
    const response = await this.proactiveMessagingService.sendTestMessage(
      accountId,
      body,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('campaigns/status/active')
  @ApiOperation({
    summary: 'Get active campaigns',
    description: 'Retrieves all campaigns with ACTIVE status.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Active campaigns retrieved', type: PMCampaignListResponseDto })
  async getActiveCampaigns(
    @Param('accountId') accountId: string,
  ): Promise<PMCampaignListResponseDto> {
    const response = await this.proactiveMessagingService.getActiveCampaigns(
      accountId,
    );

    return { data: response.data };
  }

  @Get('campaigns/status/scheduled')
  @ApiOperation({
    summary: 'Get scheduled campaigns',
    description: 'Retrieves all campaigns with SCHEDULED status.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Scheduled campaigns retrieved', type: PMCampaignListResponseDto })
  async getScheduledCampaigns(
    @Param('accountId') accountId: string,
  ): Promise<PMCampaignListResponseDto> {
    const response = await this.proactiveMessagingService.getScheduledCampaigns(
      accountId,
    );

    return { data: response.data };
  }

  @Get('campaigns/status/draft')
  @ApiOperation({
    summary: 'Get draft campaigns',
    description: 'Retrieves all campaigns with DRAFT status.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Draft campaigns retrieved', type: PMCampaignListResponseDto })
  async getDraftCampaigns(
    @Param('accountId') accountId: string,
  ): Promise<PMCampaignListResponseDto> {
    const response = await this.proactiveMessagingService.getDraftCampaigns(
      accountId,
    );

    return { data: response.data };
  }

  // ============================================
  // Authentication Endpoints
  // ============================================

  @Get('app-jwt')
  @ApiOperation({
    summary: 'Get proactive AppJWT',
    description: 'Retrieves an AppJWT token for proactive messaging API calls. Uses stored credentials from Firestore.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'AppJWT retrieved successfully' })
  async getAppJwt(
    @Param('accountId') accountId: string,
  ): Promise<{ access_token: string }> {
    const token = await this.proactiveMessagingService.getProactiveAppJwt(accountId);
    return { access_token: token };
  }
}
