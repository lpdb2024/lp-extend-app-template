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
} from '@nestjs/common';
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
  @ApiResponse({ status: 200, description: 'List of special occasions', type: SpecialOccasionsListResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: SpecialOccasionsQueryDto,
  ): Promise<SpecialOccasionsListResponseDto> {
    const token = this.extractToken(authorization);

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
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
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
  @ApiResponse({ status: 200, description: 'The special occasion', type: SpecialOccasionResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('occasionId') occasionId: string,
    @Headers('authorization') authorization: string,
  ): Promise<SpecialOccasionResponseDto> {
    const token = this.extractToken(authorization);

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
  @ApiResponse({ status: 201, description: 'Special occasion created', type: SpecialOccasionResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateSpecialOccasionDto | CreateSpecialOccasionDto[],
  ): Promise<SpecialOccasionResponseDto | SpecialOccasionsListResponseDto> {
    const token = this.extractToken(authorization);

    if (Array.isArray(body)) {
      const response = await this.specialOccasionsService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.specialOccasionsService.create(accountId, token, body, revision);
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
  @ApiResponse({ status: 200, description: 'Special occasion updated', type: SpecialOccasionResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('occasionId') occasionId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateSpecialOccasionDto,
  ): Promise<SpecialOccasionResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.specialOccasionsService.update(accountId, occasionId, token, body, revision);
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
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.specialOccasionsService.remove(accountId, occasionId, token, revision);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
