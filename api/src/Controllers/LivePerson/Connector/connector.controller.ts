/**
 * Connector Controller
 * REST API endpoints for LivePerson Connector API
 *
 * The Connector API allows brands to configure third-party messaging connectors
 * for channels like SMS, WhatsApp, Facebook Messenger, Instagram, etc.
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
import { ConnectorService } from './connector.service';
import {
  CreateConnectorDto,
  UpdateConnectorDto,
  ConnectorsQueryDto,
  ConnectorsResponseDto,
  ConnectorResponseDto,
} from './connector.dto';

@ApiTags('Connector API')
@ApiBearerAuth()
@Controller('api/v2/connector/:accountId')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all connectors',
    description: 'Retrieves all third-party messaging connectors for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of connectors', type: ConnectorsResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: ConnectorsQueryDto,
  ): Promise<ConnectorsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectorService.getAll(accountId, token, {
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
    description: 'Gets the current revision for connectors',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
    const revision = await this.connectorService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':connectorId')
  @ApiOperation({
    summary: 'Get connector by ID',
    description: 'Retrieves a single connector by its ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'connectorId', description: 'Connector ID' })
  @ApiResponse({ status: 200, description: 'The connector', type: ConnectorResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('connectorId') connectorId: string,
    @Headers('authorization') authorization: string,
  ): Promise<ConnectorResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.connectorService.getById(accountId, connectorId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create connector',
    description: 'Creates a new connector. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'Connector created', type: ConnectorResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateConnectorDto | CreateConnectorDto[],
  ): Promise<ConnectorResponseDto | ConnectorsResponseDto> {
    const token = this.extractToken(authorization);

    if (Array.isArray(body)) {
      const response = await this.connectorService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.connectorService.create(accountId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':connectorId')
  @ApiOperation({
    summary: 'Update connector',
    description: 'Updates an existing connector by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'connectorId', description: 'Connector ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Connector updated', type: ConnectorResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('connectorId') connectorId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateConnectorDto,
  ): Promise<ConnectorResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.connectorService.update(
      accountId,
      connectorId,
      token,
      body,
      revision,
    );
    return { data: response.data, revision: response.revision };
  }

  @Post(':connectorId/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enable connector',
    description: 'Enables a connector by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'connectorId', description: 'Connector ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Connector enabled', type: ConnectorResponseDto })
  async enable(
    @Param('accountId') accountId: string,
    @Param('connectorId') connectorId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<ConnectorResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required');
    }

    const response = await this.connectorService.enable(
      accountId,
      connectorId,
      token,
      revision,
    );
    return { data: response.data, revision: response.revision };
  }

  @Post(':connectorId/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disable connector',
    description: 'Disables a connector by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'connectorId', description: 'Connector ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'Connector disabled', type: ConnectorResponseDto })
  async disable(
    @Param('accountId') accountId: string,
    @Param('connectorId') connectorId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<ConnectorResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required');
    }

    const response = await this.connectorService.disable(
      accountId,
      connectorId,
      token,
      revision,
    );
    return { data: response.data, revision: response.revision };
  }

  @Delete(':connectorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete connector',
    description: 'Deletes a connector by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'connectorId', description: 'Connector ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'Connector deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('connectorId') connectorId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.connectorService.remove(accountId, connectorId, token, revision);
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
