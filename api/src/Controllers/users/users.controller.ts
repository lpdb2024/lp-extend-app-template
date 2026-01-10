import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  VerifyToken,
  VerifyUser,
  VerifyPermissions,
} from 'src/auth/auth.decorators';
import { API_ROUTES, MANAGER_ROLES } from '../../constants/constants';
import { UserData, UsersDocument } from './users.interfaces';
import { ERROR_RESPONSES } from '../../constants/constants';
import { ICredentials, KVPObject } from 'src/interfaces/interfaces';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserDto } from '../LivePerson/ConversationalCloud/conversation-cloud.dto';

@Controller(API_ROUTES.USERS())
export class UsersController {
  constructor(private service: UsersService) {}

  @Get('/:accountId')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getUsers(
    @VerifyPermissions({ roles: ['OWNER', 'ADMIN'] }) user: UserData,
    @Param('accountId') accountId: string,
  ): Promise<UserData[]> | null {
    if (!user) {
      throw new HttpException(
        ERROR_RESPONSES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.service.getUsers(accountId);
  }

  @Get('/:accountId/self')
  async getSelf(
    @VerifyUser({ roles: [] }) user: UserDto,
  ): Promise<UserDto> | null {
    // Return user without LP role check - any authenticated user can get their own info
    return user;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getUser(
    @VerifyPermissions({ roles: ['OWNER', 'ADMIN'] }) user: UserData,
    @Param() params: any,
  ): Promise<UserData> | null {
    if (!user) {
      throw new HttpException(
        ERROR_RESPONSES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.service.getUser(params.id);
  }

  @Get('/:accountId/credentials')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getCredentials(
    @VerifyPermissions({ roles: ['OWNER', 'ADMIN'] }) user: UserData,
    @Param('accountId') accountId: string,
  ): Promise<ICredentials> | null {
    if (!user) {
      throw new HttpException(
        ERROR_RESPONSES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.service.getCredentials(accountId);
  }

  @Post('/:accountId/credentials')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async setCredentials(
    @VerifyPermissions({ roles: ['OWNER', 'ADMIN'] }) user: UserData,
    @Param('accountId') accountId: string,
    @Body() body: any,
  ): Promise<ICredentials> {
    if (!user) {
      throw new HttpException(
        ERROR_RESPONSES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.service.setCredentials(accountId, body);
  }
}
