/**
 * Onsite Locations Controller
 * REST API endpoints for LivePerson Onsite Locations
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
import { OnsiteLocationsService } from './onsite-locations.service';
import {
  OnsiteLocationQueryDto,
  OnsiteLocationCreateDto,
  OnsiteLocationUpdateDto,
  OnsiteLocationResponseDto,
  OnsiteLocationListResponseDto,
} from './onsite-locations.dto';

@ApiTags('Onsite Locations')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/onsite-locations')
export class OnsiteLocationsController {
  constructor(private readonly onsiteLocationsService: OnsiteLocationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all onsite locations',
    description: 'Retrieve all onsite locations (website pages) for an account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of onsite locations', type: OnsiteLocationListResponseDto })
  async getOnsiteLocations(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: OnsiteLocationQueryDto,
  ): Promise<OnsiteLocationListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.onsiteLocationsService.getOnsiteLocations(
      accountId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Get(':locationId')
  @ApiOperation({
    summary: 'Get onsite location by ID',
    description: 'Retrieve a specific onsite location',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'locationId', description: 'Onsite location ID' })
  @ApiResponse({ status: 200, description: 'Onsite location details', type: OnsiteLocationResponseDto })
  async getOnsiteLocationById(
    @Param('accountId') accountId: string,
    @Param('locationId') locationId: string,
    @Headers('authorization') authorization: string,
    @Query() query: OnsiteLocationQueryDto,
  ): Promise<OnsiteLocationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.onsiteLocationsService.getOnsiteLocationById(
      accountId,
      locationId,
      token,
      query,
    );

    return { data: response.data };
  }

  @Post()
  @ApiOperation({
    summary: 'Create an onsite location',
    description: 'Create a new onsite location',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Created onsite location', type: OnsiteLocationResponseDto })
  async createOnsiteLocation(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: OnsiteLocationCreateDto,
    @Query() query: OnsiteLocationQueryDto,
  ): Promise<OnsiteLocationResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.onsiteLocationsService.createOnsiteLocation(
      accountId,
      token,
      body,
      query,
    );

    return { data: response.data };
  }

  @Put(':locationId')
  @ApiOperation({
    summary: 'Update an onsite location',
    description: 'Update an existing onsite location. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'locationId', description: 'Onsite location ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Updated onsite location', type: OnsiteLocationResponseDto })
  async updateOnsiteLocation(
    @Param('accountId') accountId: string,
    @Param('locationId') locationId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
    @Body() body: OnsiteLocationUpdateDto,
    @Query() query: OnsiteLocationQueryDto,
  ): Promise<OnsiteLocationResponseDto> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    const response = await this.onsiteLocationsService.updateOnsiteLocation(
      accountId,
      locationId,
      token,
      body,
      revision,
      query,
    );

    return { data: response.data };
  }

  @Delete(':locationId')
  @ApiOperation({
    summary: 'Delete an onsite location',
    description: 'Delete an onsite location. Requires If-Match header.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'locationId', description: 'Onsite location ID' })
  @ApiHeader({ name: 'If-Match', description: 'Current revision number', required: true })
  @ApiResponse({ status: 200, description: 'Onsite location deleted' })
  async deleteOnsiteLocation(
    @Param('accountId') accountId: string,
    @Param('locationId') locationId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') ifMatch: string,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization);
    const revision = this.extractRevision(ifMatch);

    await this.onsiteLocationsService.deleteOnsiteLocation(
      accountId,
      locationId,
      token,
      revision,
    );

    return { success: true };
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
