/**
 * Account Features Controller
 * REST API endpoints for LivePerson Account Config Feature Grants
 */

import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Headers,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { AccountFeaturesService } from './account-features.service';
import {
  UpdateFeaturesDto,
  AccountFeaturesResponseDto,
} from './account-features.dto';

@ApiTags('Account Features')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/features')
export class AccountFeaturesController {
  constructor(private readonly accountFeaturesService: AccountFeaturesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all account features',
    description: 'Retrieves all account config feature grants',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiQuery({
    name: 'excludeLegacy',
    required: false,
    description: 'Exclude legacy features (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of account features',
    type: AccountFeaturesResponseDto,
  })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query('excludeLegacy') excludeLegacy?: string,
    @Req() req?: Request,
  ): Promise<AccountFeaturesResponseDto> {
    const token = this.extractToken(authorization, req);
    const exclude = excludeLegacy !== 'false';

    const response = await this.accountFeaturesService.getAll(accountId, token, exclude);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Put()
  @ApiOperation({
    summary: 'Update account features',
    description: 'Updates account features (batch update)',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({
    name: 'If-Match',
    description: 'Revision for optimistic locking',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Features updated',
    type: AccountFeaturesResponseDto,
  })
  async update(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateFeaturesDto,
    @Req() req: Request,
  ): Promise<AccountFeaturesResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.accountFeaturesService.update(
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
