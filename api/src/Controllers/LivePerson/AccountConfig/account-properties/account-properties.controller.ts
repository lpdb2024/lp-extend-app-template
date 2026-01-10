/**
 * Account Properties Controller
 * REST API endpoints for LivePerson Account Settings Properties
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
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
import { AccountPropertiesService } from './account-properties.service';
import {
  CreateAccountPropertyDto,
  UpdateAccountPropertyDto,
  AccountPropertiesResponseDto,
  AccountPropertyResponseDto,
} from './account-properties.dto';

@ApiTags('Account Properties')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/properties')
export class AccountPropertiesController {
  constructor(private readonly accountPropertiesService: AccountPropertiesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all account properties',
    description: 'Retrieves all account settings properties',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({
    status: 200,
    description: 'List of account properties',
    type: AccountPropertiesResponseDto,
  })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<AccountPropertiesResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.accountPropertiesService.getAll(accountId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Get(':propertyId')
  @ApiOperation({
    summary: 'Get account property by ID',
    description: 'Retrieves a single account property by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'propertyId', description: 'Property ID (e.g., messaging.rich.content.valid.urls)' })
  @ApiResponse({
    status: 200,
    description: 'The account property',
    type: AccountPropertyResponseDto,
  })
  async getById(
    @Param('accountId') accountId: string,
    @Param('propertyId') propertyId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<AccountPropertyResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.accountPropertiesService.getById(
      accountId,
      propertyId,
      token,
    );

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create account property',
    description: 'Creates a new account property',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking (optional for create)',
    required: false,
  })
  @ApiResponse({
    status: 201,
    description: 'Property created',
    type: AccountPropertyResponseDto,
  })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateAccountPropertyDto,
    @Req() req: Request,
  ): Promise<AccountPropertyResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.accountPropertiesService.create(
      accountId,
      token,
      body,
      revision,
    );

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Put(':propertyId')
  @ApiOperation({
    summary: 'Update account property',
    description: 'Updates an existing account property',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'propertyId', description: 'Property ID to update' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated',
    type: AccountPropertyResponseDto,
  })
  async update(
    @Param('accountId') accountId: string,
    @Param('propertyId') propertyId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateAccountPropertyDto,
    @Req() req: Request,
  ): Promise<AccountPropertyResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.accountPropertiesService.update(
      accountId,
      propertyId,
      token,
      body,
      revision,
    );

    return {
      data: response.data,
      revision: response.revision,
    };
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
}
