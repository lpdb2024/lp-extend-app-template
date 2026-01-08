/**
 * FaaS Controller
 * REST API endpoints for LivePerson Functions (FaaS)
 * - Lambdas (serverless functions)
 * - Schedules (cron-based invocations)
 * - Proxy Settings (whitelisted domains)
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
} from '@nestjs/swagger';
import { FaaSService } from './faas.service';
import {
  LambdasQueryDto,
  ProxySettingsQueryDto,
  CreateLambdaDto,
  UpdateLambdaDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateProxySettingDto,
  LambdasResponseDto,
  LambdaResponseDto,
  SchedulesResponseDto,
  ScheduleResponseDto,
  ProxySettingsResponseDto,
  ProxySettingResponseDto,
} from './faas.dto';

@ApiTags('FaaS (LivePerson Functions)')
@ApiBearerAuth()
@Controller('api/v2/faas/:accountId')
export class FaaSController {
  constructor(private readonly faasService: FaaSService) {}

  // ============================================
  // Lambdas
  // ============================================

  @Get('lambdas')
  @ApiOperation({
    summary: 'Get all lambda functions',
    description: 'Retrieves all FaaS lambda functions for the account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of lambdas', type: LambdasResponseDto })
  async getLambdas(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<LambdasResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.getLambdas(accountId, token, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data || [],
    };
  }

  @Get('lambdas/:lambdaId')
  @ApiOperation({
    summary: 'Get lambda by ID',
    description: 'Retrieves a single lambda function by its UUID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'lambdaId', description: 'Lambda UUID' })
  @ApiResponse({ status: 200, description: 'The lambda', type: LambdaResponseDto })
  async getLambdaById(
    @Param('accountId') accountId: string,
    @Param('lambdaId') lambdaId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<LambdaResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.getLambdaById(accountId, lambdaId, token, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Post('lambdas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create lambda',
    description: 'Creates a new FaaS lambda function',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Lambda created', type: LambdaResponseDto })
  async createLambda(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
    @Body() body: CreateLambdaDto,
  ): Promise<LambdaResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.createLambda(accountId, token, body, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Put('lambdas/:lambdaId')
  @ApiOperation({
    summary: 'Update lambda',
    description: 'Updates an existing lambda function',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'lambdaId', description: 'Lambda UUID to update' })
  @ApiResponse({ status: 200, description: 'Lambda updated', type: LambdaResponseDto })
  async updateLambda(
    @Param('accountId') accountId: string,
    @Param('lambdaId') lambdaId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
    @Body() body: UpdateLambdaDto,
  ): Promise<LambdaResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.updateLambda(accountId, lambdaId, token, body, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Delete('lambdas/:lambdaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete lambda',
    description: 'Deletes a lambda function by UUID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'lambdaId', description: 'Lambda UUID to delete' })
  @ApiResponse({ status: 204, description: 'Lambda deleted' })
  async deleteLambda(
    @Param('accountId') accountId: string,
    @Param('lambdaId') lambdaId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.faasService.deleteLambda(accountId, lambdaId, token, {
      userId: query.userId || userId,
      v: query.v,
    });
  }

  // ============================================
  // Schedules
  // ============================================

  @Get('schedules')
  @ApiOperation({
    summary: 'Get all schedules',
    description: 'Retrieves all FaaS schedules for the account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of schedules', type: SchedulesResponseDto })
  async getSchedules(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<SchedulesResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.getSchedules(accountId, token, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data || [],
    };
  }

  @Get('schedules/:scheduleId')
  @ApiOperation({
    summary: 'Get schedule by ID',
    description: 'Retrieves a single schedule by its UUID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule UUID' })
  @ApiResponse({ status: 200, description: 'The schedule', type: ScheduleResponseDto })
  async getScheduleById(
    @Param('accountId') accountId: string,
    @Param('scheduleId') scheduleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<ScheduleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.getScheduleById(accountId, scheduleId, token, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create schedule',
    description: 'Creates a new schedule for a lambda function',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Schedule created', type: ScheduleResponseDto })
  async createSchedule(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
    @Body() body: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.createSchedule(accountId, token, body, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Put('schedules/:scheduleId')
  @ApiOperation({
    summary: 'Update schedule',
    description: 'Updates an existing schedule',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule UUID to update' })
  @ApiResponse({ status: 200, description: 'Schedule updated', type: ScheduleResponseDto })
  async updateSchedule(
    @Param('accountId') accountId: string,
    @Param('scheduleId') scheduleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
    @Body() body: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.updateSchedule(accountId, scheduleId, token, body, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Delete('schedules/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete schedule',
    description: 'Deletes a schedule by UUID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule UUID to delete' })
  @ApiResponse({ status: 204, description: 'Schedule deleted' })
  async deleteSchedule(
    @Param('accountId') accountId: string,
    @Param('scheduleId') scheduleId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.faasService.deleteSchedule(accountId, scheduleId, token, {
      userId: query.userId || userId,
      v: query.v,
    });
  }

  // ============================================
  // Proxy Settings (Whitelisted Domains)
  // ============================================

  @Get('proxy-settings')
  @ApiOperation({
    summary: 'Get proxy settings',
    description: 'Retrieves all whitelisted domains for FaaS functions',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of proxy settings', type: ProxySettingsResponseDto })
  async getProxySettings(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: ProxySettingsQueryDto & LambdasQueryDto,
  ): Promise<ProxySettingsResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.getProxySettings(accountId, token, {
      userId: query.userId || userId,
      v: query.v,
      includeDefault: query.includeDefault,
    });

    return {
      data: response.data || [],
    };
  }

  @Post('proxy-settings')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create proxy setting',
    description: 'Whitelists a new domain for FaaS functions',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 201, description: 'Proxy setting created', type: ProxySettingResponseDto })
  async createProxySetting(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
    @Body() body: CreateProxySettingDto,
  ): Promise<ProxySettingResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.faasService.createProxySetting(accountId, token, body, {
      userId: query.userId || userId,
      v: query.v,
    });

    return {
      data: response.data,
    };
  }

  @Delete('proxy-settings/:settingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete proxy setting',
    description: 'Removes a whitelisted domain',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'settingId', description: 'Proxy setting ID to delete' })
  @ApiResponse({ status: 204, description: 'Proxy setting deleted' })
  async deleteProxySetting(
    @Param('accountId') accountId: string,
    @Param('settingId') settingId: number,
    @Headers('authorization') authorization: string,
    @Headers('user-id') userId: string,
    @Query() query: LambdasQueryDto,
  ): Promise<void> {
    const token = this.extractToken(authorization);

    await this.faasService.deleteProxySetting(accountId, settingId, token, {
      userId: query.userId || userId,
      v: query.v,
    });
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
