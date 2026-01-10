/**
 * Users Controller
 * REST API endpoints for LivePerson Users
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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UsersQueryDto,
  UsersResponseDto,
  UserResponseDto,
} from './users.dto';

@ApiTags('Account Config - Users')
@ApiBearerAuth()
@Controller('api/v2/account-config/:accountId/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves all users for the specified account',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: UsersQueryDto,
    @Req() req: Request,
  ): Promise<UsersResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.usersService.getAll(accountId, token, {
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
    description: 'Gets the current revision for users',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  async getRevision(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization, req);
    const revision = await this.usersService.getRevision(accountId, token);
    return { revision };
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a single user by their ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The user' })
  async getById(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    const token = this.extractToken(authorization, req);

    const response = await this.usersService.getById(accountId, userId, token);

    return {
      data: response.data,
      revision: response.revision,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a new user. Can accept a single object or an array for bulk creation.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: false })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateUserDto | CreateUserDto[],
    @Req() req: Request,
  ): Promise<UserResponseDto | UsersResponseDto> {
    const token = this.extractToken(authorization, req);

    if (Array.isArray(body)) {
      const response = await this.usersService.createMany(accountId, token, body as any, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.usersService.create(accountId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  @Put(':userId')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates an existing user by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'userId', description: 'User ID to update' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.usersService.update(accountId, userId, token, body as any, revision);
    return { data: response.data, revision: response.revision };
  }

  // Note: resetPassword endpoint removed - not supported by SDK
  // TODO: Re-add if SDK adds support for password reset

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user by ID',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'userId', description: 'User ID to delete' })
  @ApiHeader({ name: 'If-Match', description: 'Revision for optimistic locking', required: true })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async remove(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Req() req: Request,
  ): Promise<void> {
    const token = this.extractToken(authorization, req);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.usersService.remove(accountId, userId, token, revision);
  }

  // Note: Batch operations removed - not yet supported by SDK
  // TODO: Re-add if SDK adds support for batch operations
  // The service has removeSkillFromUsers which can be used as an alternative

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
