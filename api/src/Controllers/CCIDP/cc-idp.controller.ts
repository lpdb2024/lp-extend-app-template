import { Controller, Get, Headers, Param, Post, Body } from '@nestjs/common';
import { CCIdpService } from './cc-idp.service'
import { API_ROUTES } from '../../constants/constants';

import {
  AppAuthRequest
} from './cc-idp.dto'
import { VerifyToken } from 'src/auth/auth.decorators';

@Controller(API_ROUTES.IDP())
export class CCIdpController {
  constructor(private service: CCIdpService) {}

  @Get(':accountId/domains')
  async getDomains(
    @Param('accountId') accountId: string
  ): Promise<any[]> | null {
    return this.service.getDomains(accountId);
  }

  @Post('/:accountId/token')
  async getToken(
    @Param('accountId') accountId: string,
    @Body() body: AppAuthRequest,
  ): Promise<any> | null {
    return this.service.getToken(accountId, body);
  }

  @Post('/:accountId/idp/logout')
  async logOut(
    @Param('accountId') accountId: string,
    @VerifyToken() token: string
  ): Promise<any> | null {
    return this.service.logOut(accountId, token);
  }

  @Get('/:accountId/login-url')
  async getLoginUrl(
    @Param('accountId') accountId: string,
    @Headers('referer') referer: string,
    @Headers('host') host: string
  ): Promise<{ url: string; }> | null {
    return this.service.getLoginUrl(accountId, referer, host);
  }

  @Get('/:accountId/authenticate-cb')
  async authenticateConversationBuilder(
    @Param('accountId') accountId: string,
    @Headers('authorization') token: string,
  ): Promise<any> | null {
    return this.service.authenticateConversationBuilder(accountId, token);  
  }

}
