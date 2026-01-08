import {
  ValidationPipe,
  UsePipes,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Headers,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
// import { EncryptedApiKeyDto } from './cc-app-manager.interfaces.dto';
import { CCAppMgtSevice } from './cc-app-manager.service';
import { CCApp } from './cc-app-manager.interfaces.dto';
import { API_ROUTES, User } from '../../constants/constants';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosResponse } from 'axios';

@Controller(API_ROUTES.CC_APP())
export class CCAppMgtController {
  constructor(private service: CCAppMgtSevice) {}

  @Get(':accountId')
  async getInstallApplications(
    @Param('accountId') accountId: string,
    @Headers('authorization') token: string,
    @User() user: any,
  ): Promise<CCApp[] | void> {
    return this.service.getInstalledApplications(accountId, token);
  }

  @Get(':accountId/:appId')
  async getInstallApplication(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') token: string,
    @Res() res: any,
  ): Promise<CCApp | void> {
    return this.service.getInstalledApplication(res, accountId, token, appId);
  }

  // async installApplication(accountId: string, token: string, body: CCApp): Promise<CCApp | void> {
  @Post(':accountId')
  async installApplication(
    @Param('accountId') accountId: string,
    @Headers('authorization') token: string,
    @Body() body: CCApp,
  ): Promise<CCApp | void> {
    return this.service.installApplication(accountId, token, body);
  }

  // async updateApplication(accountId: string, authorization: string, body: Partial<CCApp>): Promise<CCApp | void> {
  @Put(':accountId/:appId')
  async updateApplication(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string,
    @Headers('authorization') token: string,
    @Headers('ac-revision') revision: string,
    @Body() body: Partial<CCApp>,
    @Res() res: any,
  ): Promise<CCApp | void> {
    return this.service.updateApplication(
      res,
      accountId,
      token,
      body,
      revision,
    );
  }
}
