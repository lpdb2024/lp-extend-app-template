/**
 * Net Handle Time Controller
 * REST API endpoints for LivePerson Net Handle Time API
 *
 * Service Domain: agentActivityDomain
 * Status: Beta - subject to adjustments
 * Data Availability: Up to 24 hours from segment close
 */

import {
  Controller,
  Get,
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
} from '@nestjs/swagger';
import { NetHandleTimeService } from './net-handle-time.service';
import {
  AgentSegmentsQueryDto,
  BreakdownFilesQueryDto,
  BreakdownFileQueryDto,
  NHTAgentSegmentsResponseDto,
  NHTBreakdownFilesResponseDto,
  NHTBreakdownFileResponseDto,
} from './net-handle-time.dto';

@ApiTags('Net Handle Time (Beta)')
@ApiBearerAuth()
@Controller('api/v2/net-handle-time/:accountId')
export class NetHandleTimeController {
  constructor(private readonly nhtService: NetHandleTimeService) {}

  @Get('segments')
  @ApiOperation({
    summary: 'Get agent segments',
    description:
      'Retrieve segment-level net handle time data. ' +
      'Beta API - subject to adjustments. ' +
      'Data available up to 24 hours from segment close.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'Agent segments data',
    type: NHTAgentSegmentsResponseDto,
  })
  async getAgentSegments(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: AgentSegmentsQueryDto,
  ): Promise<NHTAgentSegmentsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateTimeRange(query.from, query.to, query.fromMillis, query.toMillis);

    const response = await this.nhtService.getAgentSegments(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('breakdown/files')
  @ApiOperation({
    summary: 'Get breakdown files list',
    description:
      'List available NHU (Net Handle Unit) breakdown file resources. ' +
      'Use these file paths with the breakdown file endpoint.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'List of breakdown files',
    type: NHTBreakdownFilesResponseDto,
  })
  async getBreakdownFilesList(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: BreakdownFilesQueryDto,
  ): Promise<NHTBreakdownFilesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.nhtService.getBreakdownFilesList(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get('breakdown/file')
  @ApiOperation({
    summary: 'Get breakdown file',
    description:
      'Download specific NHU breakdown file containing detailed net handle unit records.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'NHU breakdown records',
    type: NHTBreakdownFileResponseDto,
  })
  async getBreakdownFile(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: BreakdownFileQueryDto,
  ): Promise<NHTBreakdownFileResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.nhtService.getBreakdownFile(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  // ============================================
  // Convenience Endpoints
  // ============================================

  @Get('agent/:agentId')
  @ApiOperation({
    summary: 'Get net handle time for agent',
    description: 'Convenience endpoint to get net handle time segments for a specific agent',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'agentId', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: 'Agent segments', type: NHTAgentSegmentsResponseDto })
  async getAgentNetHandleTime(
    @Param('accountId') accountId: string,
    @Param('agentId') agentId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<NHTAgentSegmentsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateRequiredParams(source, from, to);

    const response = await this.nhtService.getAgentNetHandleTime(
      accountId,
      token,
      source,
      agentId,
      from,
      to,
    );

    return { data: response.data };
  }

  @Get('skill/:skillId')
  @ApiOperation({
    summary: 'Get net handle time for skill',
    description: 'Convenience endpoint to get net handle time segments for a specific skill',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill segments', type: NHTAgentSegmentsResponseDto })
  async getSkillNetHandleTime(
    @Param('accountId') accountId: string,
    @Param('skillId') skillId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<NHTAgentSegmentsResponseDto> {
    const token = this.extractToken(authorization);
    this.validateRequiredParams(source, from, to);

    const response = await this.nhtService.getSkillNetHandleTime(
      accountId,
      token,
      source,
      skillId,
      from,
      to,
    );

    return { data: response.data };
  }

  @Get('conversation/:conversationId')
  @ApiOperation({
    summary: 'Get net handle time for conversation',
    description: 'Convenience endpoint to get net handle time segments for a specific conversation',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Conversation segments', type: NHTAgentSegmentsResponseDto })
  async getConversationNetHandleTime(
    @Param('accountId') accountId: string,
    @Param('conversationId') conversationId: string,
    @Headers('authorization') authorization: string,
    @Query('source') source: string,
  ): Promise<NHTAgentSegmentsResponseDto> {
    const token = this.extractToken(authorization);

    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }

    const response = await this.nhtService.getConversationNetHandleTime(
      accountId,
      token,
      source,
      conversationId,
    );

    return { data: response.data };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace('Bearer ', '');
  }

  private validateRequiredParams(source: string, from: string, to: string): void {
    if (!source) {
      throw new BadRequestException('source query parameter is required');
    }
    if (!from || !to) {
      throw new BadRequestException('from and to query parameters are required');
    }
  }

  private validateTimeRange(
    from?: string,
    to?: string,
    fromMillis?: number,
    toMillis?: number,
  ): void {
    // Max 1 week span
    const maxSpanMs = 7 * 24 * 60 * 60 * 1000;

    let fromTime: number | undefined;
    let toTime: number | undefined;

    if (fromMillis !== undefined) {
      fromTime = fromMillis;
    } else if (from) {
      fromTime = new Date(from).getTime();
    }

    if (toMillis !== undefined) {
      toTime = toMillis;
    } else if (to) {
      toTime = new Date(to).getTime();
    }

    if (fromTime && toTime) {
      if (fromTime >= toTime) {
        throw new BadRequestException('from must be before to');
      }

      if (toTime - fromTime > maxSpanMs) {
        throw new BadRequestException('Time range cannot exceed 1 week');
      }
    }
  }
}
