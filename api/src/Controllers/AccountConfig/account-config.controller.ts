import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Res,
  HttpCode,
  Query,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AccountConfigService } from './account-config.service';
import { API_ROUTES, MANAGER_ROLES, User } from '../../constants/constants';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UseGuards } from '@nestjs/common';

import {
  SkillDto,
  AccountConfigDto,
  UserDto,
  MsgIntRequest,
  ApiKeyDto,
  CampaignDto,
  Profile,
  LineOfBusiness,
  PredefinedContentDto,
  AutomaticMessage,
  SpecialOccasionDto,
  WorkingHoursDto,
  AgentGroupDto,
  ServiceWorkerData,
  ServiceWorkerDataRequest,
} from './account-config.dto';
// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
import { VerifyToken, VerifyUser } from 'src/auth/auth.decorators';
import { helper } from 'src/utils/HelperService';
import { LpToken } from '../CCIDP/cc-idp.interfaces';
import { AxiosResponse, AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

@Controller(API_ROUTES.ACCOUNT())
export class AccountConfigController {
  constructor(private service: AccountConfigService) {}

  @Get('/:accountId/config')
  async getAccountConfig(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: [] }) token: LpToken,
    @VerifyUser({ roles: [] }) user: UserDto,
  ): Promise<AccountConfigDto[]> | null {
    // Read-only config access - any authenticated user can read
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    if (!user) {
      throw new ForbiddenException('No user found');
    }
    return this.service.getAccountConfigFeatures(
      accountId,
      token.accessToken,
      user.id,
    );
  }

  @Get('/:accountId/account-config')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getAccountConfigFeatures(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<AccountConfigDto[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getAllAccountConfigFeatures(
      accountId,
      token.accessToken,
    );
  }

  @Put('/:accountId/config')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async updateAccountConfigFeature(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: AccountConfigDto,
  ): Promise<AccountConfigDto> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    console.info('body:', body);
    return this.service.updateAccountConfigFeature(
      accountId,
      token.accessToken,
      body,
    );
  }

  @Get('/:accountId/skills')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getSkills(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<SkillDto[]> | null {
    return await this.service.getSkills(res, accountId, token.accessToken);
  }

  @Get('/:accountId/skills/:id')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getSkill(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<SkillDto> | null {
    return await this.service.getSkill(res, accountId, id, token.accessToken);
  }

  @Delete('/:accountId/skills/:id')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async deleteSkill(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Headers('revision') revision: string,
    @Res() res: any,
  ): Promise<any> | null {
    return await this.service.deleteSkill(
      res,
      accountId,
      id,
      token.accessToken,
      revision,
    );
  }

  @Get('/:accountId/users')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  @HttpCode(200)
  async getUsers(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<UserDto[]> | null {
    console.info(
      'AccountConfigController.getUsers',
      'accountId:',
      accountId,
      'token:',
      token,
    );

    return this.service.getUsers(res, accountId, token.accessToken);
  }

  @Get('/:accountId/users/self')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getSelfUser(
    @VerifyUser({ roles: MANAGER_ROLES }) user: UserDto,
  ): Promise<UserDto> | null {
    return user;
  }

  @Get('/:accountId/users/:id')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getUser(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<UserDto> | null {
    return this.service.getUser(res, accountId, id, token.accessToken);
  }

  @Post('/:accountId/users')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async createUser(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: UserDto,
    @Res() res: any,
  ): Promise<UserDto> | null {
    return this.service.createUser(res, accountId, token.accessToken, body);
  }

  @Post(':accountId/messaging_interactions')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getMessagingIteractions(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: MsgIntRequest,
    @Query('firstOnly') firstOnly: boolean,
  ): Promise<any> | null {
    return this.service.getAllMessagingInteractions(
      token.accessToken,
      accountId,
      body,
      firstOnly,
    );
  }

  @Get(':accountId/brand-details')
  async getBrandDetails(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: [] }) token: LpToken,
  ): Promise<any> | null {
    // Read-only brand details - any authenticated user can read
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getBrandDetails(accountId, token.accessToken);
  }

  @Post(':accountId/brand-details')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async updateBrandDetails(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: any,
  ): Promise<any> | null {
    if (!token) {
      return null;
    }
    return token.accessToken;
  }

  @Get(':accountId/application')
  async getInstalledApplication(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: [] }) token: LpToken,
  ): Promise<{ env: string }> | null {
    // Read-only application info - any authenticated user can read
    return this.service.getInstalledApplication(accountId, token.accessToken);
  }

  @Post(':accountId/application')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async installApplication(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Body() body: { env: string },
  ): Promise<{ env: string }> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.installApplication(
      accountId,
      token.accessToken,
      body.env,
    );
  }

  @Get(':accountId/app-keys')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getApiKeys(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<ApiKeyDto[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getLEAPIKeys(res, accountId, token.accessToken);
  }

  @Get(':accountId/app_settings')
  async getAccountSettings(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @User() user: any,
  ): Promise<any> | null {
    return this.service.getAccountSettings(accountId);
  }

  // updateAccountSettings
  @Put(':accountId/app_settings')
  async updateAccountSettings(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @User() user: any,
    @Body() body: any,
  ): Promise<any> | null {
    return this.service.updateAccountSettings(accountId, body);
  }

  @Put(':accountId/app-settings-many')
  async updateAccountSettingsMany(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @User() user: any,
    @Body() body: any,
  ): Promise<any> | null {
    return this.service.updateAccountSettingsMany(accountId, body);
  }

  @Get(':accountId/campaigns')
  async getCampaigns(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<CampaignDto[]> | null {
    return this.service.getCampaigns(
      res,
      accountId,
      helper.insertBearer(token.accessToken),
    );
  }
  @Get(':accountId/campaigns/:campaignId')
  async getCampaign(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<any> | null {
    return this.service.getCampaign(
      res,
      accountId,
      campaignId,
      helper.insertBearer(token.accessToken),
    );
  }

  @Get(':accountId/campaigns/:campaignId/engagements/:engagementId')
  async getEngagement(
    @Param('accountId') accountId: string,
    @Param('campaignId') campaignId: string,
    @Param('engagementId') engagementId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<any> | null {
    return this.service.getEngagement(
      res,
      accountId,
      campaignId,
      engagementId,
      helper.insertBearer(token.accessToken),
    );
  }

  /*
  async getProfiles(
      res: any,
      accountId: string,
      token: string,
    ): Promise<Profile[]> | null {
  */
  @Get(':accountId/profiles')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getProfiles(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<Profile[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getProfiles(res, accountId, token.accessToken);
  }

  @Get(':accountId/agent-groups')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getAgentGroups(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<AgentGroupDto[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getAgentGroups(res, accountId, token.accessToken);
  }

  /*
  async getLobs(
    res: any,
    accountId: string,
    token: string,
  ): Promise<LineOfBusiness[]> | null {
  */

  @Get(':accountId/lobs')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getLobs(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<LineOfBusiness[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getLobs(res, accountId, token.accessToken);
  }

  /*
  async getPredefinedContent(
    res: any,
    accountId: string,
    token: string,
  ): Promise<PredefinedContentDto[]> | null {
  */

  @Get(':accountId/predefined-content')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getPredefinedContent(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<PredefinedContentDto[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getPredefinedContent(res, accountId, token.accessToken);
  }

  @Get(':accountId/automatic-messages-default')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getAutomaticMessagesDefault(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<AutomaticMessage[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getAutomaticMessagesDefault(
      res,
      accountId,
      token.accessToken,
    );
  }

  @Get(':accountId/automatic-messages')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getAutomaticMessages(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<AutomaticMessage[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getAutomaticMessages(res, accountId, token.accessToken);
  }

  @Get(':accountId/special-occasions')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getSpecialOccasions(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<SpecialOccasionDto[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getSpecialOccasions(res, accountId, token.accessToken);
  }

  @Get(':accountId/working-hours')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getWorkingHours(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
    @Res() res: any,
  ): Promise<WorkingHoursDto[]> | null {
    if (!token) {
      throw new ForbiddenException('No token found');
    }
    return this.service.getWorkingHours(res, accountId, token.accessToken);
  }

  @Post(':accountId/service-workers')
  async addServiceWorker(
    @Param('accountId') accountId: string,
    @VerifyUser({ roles: MANAGER_ROLES }) user: UserDto,
    @Body() body: ServiceWorkerDataRequest,
  ): Promise<ServiceWorkerData> | null {
    return this.service.addServiceWorker(accountId, user, body);
  }

  // deleteServiceWorker(accountId: string, serviceWorkerId: string, token: string): Promise<any> | null {
  @Delete(':accountId/service-workers/:id')
  async deleteServiceWorker(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<any> | null {
    return this.service.deleteServiceWorker(accountId, id, token.accessToken);
  }

  @Get(':accountId/service-workers')
  async getServiceWorkers(
    @Param('accountId') accountId: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<ServiceWorkerData[]> | null {
    return this.service.getServiceWorkers(accountId, token.accessToken);
  }

  @Get(':accountId/service-workers/:id')
  async getServiceWorker(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @VerifyToken({ roles: MANAGER_ROLES }) token: LpToken,
  ): Promise<ServiceWorkerData> | null {
    return this.service.getServiceWorker(accountId, id, token.accessToken);
  }
}
