/**
 * Working Hours Controller
 * REST API endpoints for LivePerson Working Hours (Workdays)
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
import { WorkingHoursService } from './working-hours.service';
import {
  CreateWorkingHoursDto,
  UpdateWorkingHoursDto,
  WorkingHoursQueryDto,
  WorkingHoursListResponseDto,
  WorkingHoursResponseDto,
} from './working-hours.dto';

@ApiTags('Account Config - Working Hours')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/working-hours')
export class WorkingHoursController {
  constructor(private readonly workingHoursService: WorkingHoursService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all working hours',
    description: 'Retrieves all working hours configurations for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of working hours', type: WorkingHoursListResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: WorkingHoursQueryDto,
  ): Promise<WorkingHoursListResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.workingHoursService.getAll(accountId, token, {
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
    description: 'Gets the current revision for working hours',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
    const revision = await this.workingHoursService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':workingHoursId')
  @ApiOperation({
    summary: 'Get working hours by ID',
    description: 'Retrieves a single working hours configuration by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'workingHoursId', description: 'Working hours ID' })
  @ApiResponse({ status: 200, description: 'The working hours', type: WorkingHoursResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('workingHoursId') workingHoursId: string,
    @Headers('authorization') authorization: string,
  ): Promise<WorkingHoursResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.workingHoursService.getById(accountId, workingHoursId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create working hours',
    description: 'Creates new working hours. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Working hours created', type: WorkingHoursResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateWorkingHoursDto | CreateWorkingHoursDto[],
  ): Promise<WorkingHoursResponseDto | WorkingHoursListResponseDto> {
    const token = this.extractToken(authorization);

    if (Array.isArray(body)) {
      const response = await this.workingHoursService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.workingHoursService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':workingHoursId')
  @ApiOperation({
    summary: 'Update working hours',
    description: 'Updates existing working hours by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'workingHoursId', description: 'Working hours ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Working hours updated', type: WorkingHoursResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('workingHoursId') workingHoursId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateWorkingHoursDto,
  ): Promise<WorkingHoursResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.workingHoursService.update(accountId, workingHoursId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Delete(':workingHoursId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete working hours',
    description: 'Deletes working hours by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'workingHoursId', description: 'Working hours ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Working hours deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('workingHoursId') workingHoursId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.workingHoursService.remove(accountId, workingHoursId, token, revision);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
