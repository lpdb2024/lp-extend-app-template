import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import {
  VerifyToken,
  VerifyUser,
  VerifyPermissions,
} from 'src/auth/auth.decorators';
import { LpExtendAuth } from 'src/auth/lpextend-auth.decorators';
import type { LpExtendAuthContext } from 'src/auth/lpextend-auth.service';
import { API_ROUTES, MANAGER_ROLES } from '../../constants/constants';
import { UserData, UsersDocument } from './users.interfaces';
import { ERROR_RESPONSES } from '../../constants/constants';
import { ICredentials, KVPObject } from 'src/interfaces/interfaces';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserDto } from '../LivePerson/ConversationalCloud/conversation-cloud.dto';
import { LPDomainService } from '../LivePerson/shared/lp-domain.service';
import { APIService } from '../APIService/api-service';
import { LP_SERVICE_DOMAINS, LP_API_PATHS, LP_API_VERSIONS } from '../LivePerson/shared/lp-constants';

@Controller(API_ROUTES.USERS())
export class UsersController {
  constructor(
    private service: UsersService,
    private domainService: LPDomainService,
    private apiService: APIService,
  ) {}

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
    @LpExtendAuth() auth: LpExtendAuthContext,
    @Param('accountId') accountId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!auth || !auth.lpAccessToken) {
      res.clearCookie('lp_session');
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // Validate LP bearer token by calling LP's Users API
    try {
      const domain = await this.domainService.getDomain(
        accountId,
        LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_READ,
      );

      if (!domain) {
        throw new Error('Could not resolve accountConfigReadOnly domain');
      }

      const userPath = LP_API_PATHS.USERS.BY_ID(accountId, auth.lpUserId);
      const url = `https://${domain}${userPath}?v=${LP_API_VERSIONS.USERS}`;

      const { data: lpUser } = await this.apiService.get<any>(url, {
        headers: {
          Authorization: `Bearer ${auth.lpAccessToken}`,
          Accept: 'application/json',
        },
      });

      // Token is valid — return fresh user data from LP
      const roles: string[] = [];
      if (lpUser.memberOf?.roleTypeId) {
        const roleMap: Record<number, string> = {
          1: 'AGENT', 2: 'AGENT_MANAGER', 3: 'CAMPAIGN_MANAGER', 4: 'ADMIN', 5: 'LPA',
        };
        roles.push(roleMap[lpUser.memberOf.roleTypeId] || 'AGENT');
      }
      if (lpUser.permissionGroups) {
        lpUser.permissionGroups.forEach((pg: any) => {
          if (pg.roleTypeId) {
            const roleMap: Record<number, string> = {
              1: 'AGENT', 2: 'AGENT_MANAGER', 3: 'CAMPAIGN_MANAGER', 4: 'ADMIN', 5: 'LPA',
            };
            const role = roleMap[pg.roleTypeId];
            if (role && !roles.includes(role)) roles.push(role);
          }
        });
      }

      return {
        accountId: auth.lpAccountId,
        displayName: lpUser.fullName || lpUser.loginName || auth.loginName || auth.lpUserId,
        email: lpUser.email || '',
        roles: roles.length > 0 ? roles : (auth.lpRole ? [auth.lpRole] : []),
        permissions: lpUser.permissionGroups || [],
        isLPA: auth.isLPA,
        lpUserId: auth.lpUserId,
        lpAccountId: auth.lpAccountId,
        hasCbToken: !!auth.cbToken,
      };
    } catch (error) {
      const status = error?.response?.status || error?.status;

      // If LP returns 401/403, the token is invalid — clear session
      if (status === 401 || status === 403) {
        res.clearCookie('lp_session');
        throw new HttpException('LP session expired', HttpStatus.UNAUTHORIZED);
      }

      // For other errors (network, 500), return session data as fallback
      return {
        accountId: auth.lpAccountId,
        displayName: auth.loginName || auth.lpUserId,
        email: '',
        roles: auth.lpRole ? [auth.lpRole] : [],
        permissions: [],
        isLPA: auth.isLPA,
        lpUserId: auth.lpUserId,
        lpAccountId: auth.lpAccountId,
        hasCbToken: !!auth.cbToken,
      };
    }
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
