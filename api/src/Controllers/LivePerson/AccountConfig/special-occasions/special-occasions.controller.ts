/**
 * Special Occasions Controller
 * REST API endpoints for LivePerson Special Occasions
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
  HttpCode,
  HttpStatus,
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
import { SpecialOccasionsService } from './special-occasions.service';
import {
  CreateSpecialOccasionDto,
  UpdateSpecialOccasionDto,
  SpecialOccasionsQueryDto,
  SpecialOccasionsListResponseDto,
  SpecialOccasionResponseDto,
} from './special-occasions.dto';

@ApiTags('Account Config - Special Occasions')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/special-occasions')
export class SpecialOccasionsController {
  constructor(private readonly specialOccasionsService: SpecialOccasionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all special occasions',
    description: 'Retrieves all special occasions (holidays, etc.) for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of special occasions' })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: SpecialOccasionsQueryDto,
    @Req() req: Request,
  ): Promise<SpecialOccasionsListResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.specialOccasionsService.getAll(accountId, token, {
      select: query.select,
      includeDeleted: query.includeDeleted,
    });

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Get('revision')
  @ApiOperation({
    summary: 'Get current revision',
    description: 'Gets the current revision for special occasions',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.specialOccasionsService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':occasionId')
  @ApiOperation({
    summary: 'Get special occasion by ID',
    description: 'Retrieves a single special occasion by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'occasionId', description: 'Special occasion ID' })
  @ApiResponse({ status: 200, description: 'The special occasion' })
  async getById(
    @Param('accountId') accountId: string,
    @Param('occasionId') occasionId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<SpecialOccasionResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.specialOccasionsService.getById(accountId, occasionId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create special occasion',
    description: 'Creates a new special occasion. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Special occasion created' })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateSpecialOccasionDto | CreateSpecialOccasionDto[],
    @Req() req: Request,
  ): Promise<SpecialOccasionResponseDto | SpecialOccasionsListResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.specialOccasionsService.createMany(accountId, token, body as any, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.specialOccasionsService.create(accountId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':occasionId')
  @ApiOperation({
    summary: 'Update special occasion',
    description: 'Updates an existing special occasion by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'occasionId', description: 'Special occasion ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Special occasion updated' })
  async update(
    @Param('accountId') accountId: string,
    @Param('occasionId') occasionId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateSpecialOccasionDto,
    @Req() req: Request,
  ): Promise<SpecialOccasionResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.specialOccasionsService.update(accountId, occasionId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':occasionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete special occasion',
    description: 'Deletes a special occasion by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'occasionId', description: 'Special occasion ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Special occasion deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('occasionId') occasionId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.specialOccasionsService.remove(accountId, occasionId, token, revision);
  }

  /**
   * Extract token from Authorization header or shell auth
   * Supports both direct Bearer auth and shell token auth (via middleware)
   */
  private extractToken(authorization: string, req?: any): { accessToken: string; extendToken?: string } {
    // First check if shell auth provided token via middleware (LpExtendAuthMiddleware sets req.auth)
    if (req?.auth?.lpAccessToken) {
      return {
        accessToken: req.auth.lpAccessToken,
        extendToken: req.headers?.['x-extend-token'], // Raw ExtendJWT from header for SDK
      };
    }

    // Fall back to Authorization header
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return {
      accessToken: authorization.replace(/^Bearer\s+/i, ''),
      extendToken: req?.headers?.['x-extend-token'], // Also check header in fallback case
    };
  }
}
