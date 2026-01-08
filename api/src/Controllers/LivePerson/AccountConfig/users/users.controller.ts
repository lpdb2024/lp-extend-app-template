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
} from '@nestjs/common';
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
  ResetPasswordDto,
  BatchUpdateUsersDto,
  BatchUpdateUsersResponseDto,
  BatchRemoveSkillDto,
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
  @ApiResponse({ status: 200, description: 'List of users', type: UsersResponseDto })
  async getAll(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Query() query: UsersQueryDto,
  ): Promise<UsersResponseDto> {
    const token = this.extractToken(authorization);

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
  ): Promise<{ revision: string | undefined }> {
    const token = this.extractToken(authorization);
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
  @ApiResponse({ status: 200, description: 'The user', type: UserResponseDto })
  async getById(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
  ): Promise<UserResponseDto> {
    const token = this.extractToken(authorization);

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
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  async create(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: CreateUserDto | CreateUserDto[],
  ): Promise<UserResponseDto | UsersResponseDto> {
    const token = this.extractToken(authorization);

    if (Array.isArray(body)) {
      const response = await this.usersService.createMany(accountId, token, body, revision);
      return { data: response.data, revision: response.revision };
    }

    const response = await this.usersService.create(accountId, token, body, revision);
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
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  async update(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
    @Headers('if-match') revision: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for updates');
    }

    const response = await this.usersService.update(accountId, userId, token, body, revision);
    return { data: response.data, revision: response.revision };
  }

  @Post(':userId/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Resets a user\'s password',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
    @Body() body: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    const token = this.extractToken(authorization);
    await this.usersService.resetPassword(accountId, userId, token, body.newPassword);
    return { success: true };
  }

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
  ): Promise<void> {
    const token = this.extractToken(authorization);

    if (!revision) {
      throw new BadRequestException('If-Match header (revision) is required for deletes');
    }

    await this.usersService.remove(accountId, userId, token, revision);
  }

  // ============================================
  // Batch Operations
  // ============================================

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch update users',
    description: 'Update multiple users at once using LP batch API. Allows adding/removing field values in bulk.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Batch update successful', type: BatchUpdateUsersResponseDto })
  async batchUpdate(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: BatchUpdateUsersDto,
  ): Promise<BatchUpdateUsersResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.usersService.batchUpdate(accountId, token, body);

    return {
      users: response.data.users,
      success: true,
    };
  }

  @Post('batch/remove-skill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove skill from multiple users',
    description: 'Convenience endpoint to remove a skill from multiple users at once using LP batch API.',
  })
  @ApiParam({ name: 'accountId', description: 'LivePerson account ID' })
  @ApiResponse({ status: 200, description: 'Skill removed from users', type: BatchUpdateUsersResponseDto })
  async batchRemoveSkill(
    @Param('accountId') accountId: string,
    @Headers('authorization') authorization: string,
    @Body() body: BatchRemoveSkillDto,
  ): Promise<BatchUpdateUsersResponseDto> {
    const token = this.extractToken(authorization);

    const response = await this.usersService.batchRemoveSkillFromUsers(
      accountId,
      token,
      body.skillId,
      body.userIds,
    );

    return {
      users: response.data.users,
      success: true,
    };
  }

  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }
    return authorization.replace(/^Bearer\s+/i, '');
  }
}
