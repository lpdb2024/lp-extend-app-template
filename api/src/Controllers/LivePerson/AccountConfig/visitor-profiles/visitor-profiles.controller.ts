/**
 * Visitor Profiles Controller
 * REST API endpoints for LivePerson Visitor Profiles (Audiences)
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
import { VisitorProfilesService } from './visitor-profiles.service';
import {
  VisitorProfileQueryDto,
  VisitorProfileCreateDto,
  VisitorProfileUpdateDto,
  VisitorProfileResponseDto,
  VisitorProfileListResponseDto,
} from './visitor-profiles.dto';

@ApiTags('Visitor Profiles')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/visitor-profiles')
export class VisitorProfilesController {
  constructor(private readonly visitorProfilesService: VisitorProfilesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all visitor profiles',
    description: 'Retrieve all visitor profiles (audiences) for an account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of visitor profiles', type: VisitorProfileListResponseDto })
  async getVisitorProfiles(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: VisitorProfileQueryDto,
    @Req() req: Request,
  ): Promise<VisitorProfileListResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.visitorProfilesService.getVisitorProfiles(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get(':profileId')
  @ApiOperation({
    summary: 'Get visitor profile by ID',
    description: 'Retrieve a specific visitor profile',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'profileId', description: 'Visitor profile ID' })
  @ApiResponse({ status: 200, description: 'Visitor profile details', type: VisitorProfileResponseDto })
  async getVisitorProfileById(
    @Param('accountId') accountId: string,
    @Param('profileId') profileId: string,
    @Headers('authorization') authorization: string,
    @Query() query: VisitorProfileQueryDto,
    @Req() req: Request,
  ): Promise<VisitorProfileResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.visitorProfilesService.getVisitorProfileById(
      accountId,
      profileId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a visitor profile',
    description: 'Create a new visitor profile (audience)',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Created visitor profile', type: VisitorProfileResponseDto })
  async createVisitorProfile(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: VisitorProfileCreateDto,
    @Query() query: VisitorProfileQueryDto,
    @Req() req: Request,
  ): Promise<VisitorProfileResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.visitorProfilesService.createVisitorProfile(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Put(':profileId')
  @ApiOperation({
    summary: 'Update a visitor profile',
    description: 'Update an existing visitor profile. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'profileId', description: 'Visitor profile ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated visitor profile', type: VisitorProfileResponseDto })
  async updateVisitorProfile(
    @Param('accountId') accountId: string,
    @Param('profileId') profileId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: VisitorProfileUpdateDto,
    @Query() query: VisitorProfileQueryDto,
    @Req() req: Request,
  ): Promise<VisitorProfileResponseDto> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    const response = await this.visitorProfilesService.updateVisitorProfile(
      accountId,
      profileId,
      token,
      body,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':profileId')
  @ApiOperation({
    summary: 'Delete a visitor profile',
    description: 'Delete a visitor profile. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'profileId', description: 'Visitor profile ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Visitor profile deleted' })
  async deleteVisitorProfile(
    @Param('accountId') accountId: string,
    @Param('profileId') profileId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Req() req: Request,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization, req);
    const revision = this.extractRevision(ifMatch);

    await this.visitorProfilesService.deleteVisitorProfile(
      accountId,
      profileId,
      token,
      revision,
    );

    return { success: true };
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
