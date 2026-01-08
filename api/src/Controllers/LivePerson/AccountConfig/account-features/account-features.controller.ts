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
} from '@nestjs/common';
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
  ): Promise<AccountFeaturesResponseDto> {
    const token = this.extractToken(authorization);
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
  ): Promise<AccountFeaturesResponseDto> {
    const token = this.extractToken(authorization);

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

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
