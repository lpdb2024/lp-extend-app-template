import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import {
  AppSettingsDTO,
  UserSettingsDTO,
  SkillDto,
  AccountConfigDto,
  UserDto,
  MsgIntRequest,
  AppInstallDto,
  ApiKeyDto,
  ApplicationSettingsDto,
  CampaignDto,
  CampaignDetailedDto,
  Profile,
  LineOfBusiness,
  PredefinedContentDto,
  AutomaticMessage,
  WorkingHoursDto,
  SpecialOccasionDto,
  AgentGroupDto,
  GoalDto,
  VisitorProfileDto,
  ServiceWorkerData,
  ServiceWorkerDataRequest,
} from './account-config.dto';
import { helper } from 'src/utils/HelperService';
import {
  APP_SETTING_NAMES,
  getApplicationConfig,
} from 'src/constants/constants';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { accountCache } from 'src/utils/memCache';
import { CollectionReference } from '@google-cloud/firestore';
import { DBService } from 'src/firestore/firestore.service';
import { APIService } from '../APIService/api-service';
import { uuid } from 'short-uuid';

const { ctx } = helper;
@Injectable()
export class AccountConfigService implements OnModuleInit {
  constructor(
    @InjectPinoLogger(AccountConfigService.name)
    private readonly logger: PinoLogger,
    private readonly helperService: HelperService,
    private readonly configService: ConfigService,
    private readonly apiService: APIService,
    @Inject(AppSettingsDTO.collectionName)
    private appSettingsCollection: CollectionReference<AppSettingsDTO>,
    @Inject(UserSettingsDTO.collectionName)
    private userSettingsCollection: CollectionReference<UserSettingsDTO>,
    @Inject(ServiceWorkerData.collectionName)
    private serviceWorksCollection: CollectionReference<ServiceWorkerData>,
  ) {
    this.logger.setContext(AccountConfigService.name);
  }

  async getAllAccountConfigFeatures(
    accountId: string,
    token: string,
  ): Promise<AccountConfigDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      let url = `https://${domain}/api/account/${accountId}/configuration/setting/properties?v=3.0&source=ccui`;
      const Authorization = `Bearer ${token.replace('Bearer ', '')}`;

      const { data } = await this.apiService.get<AccountConfigDto[]>(url, {
        headers: {
          Authorization,
        },
      });
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAccountConfigFeatures(
    accountId: string,
    token: string,
    userid?: string,
  ): Promise<AccountConfigDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      let url = `https://${domain}/api/account/${accountId}/configuration/setting/properties?groups=loginSession&context_cascading=false&v=3.0&source=ccui`;
      if (userid) {
        url += `&context_type=USER&context_id=${userid}`;
      }
      console.info(`getAccountConfigFeatures: ${url}`);
      const Authorization = `Bearer ${token.replace('Bearer ', '')}`;

      const { data } = await this.apiService.get<AccountConfigDto[]>(url, {
        headers: {
          Authorization,
        },
      });
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAccountConfigFeature(
    accountId: string,
    token: string,
    featureId: string,
  ): Promise<{
    data: AccountConfigDto;
    revision: string | undefined;
  }> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/setting/properties/${featureId}?v=3.0&source=ccui`;
      const Authorization = `Bearer ${token.replace('Bearer ', '')}`;

      const { data, headers } = await this.apiService.get<AccountConfigDto>(
        url,
        {
          headers: {
            Authorization,
          },
        },
      );
      const revision = headers['ac-revision'];

      return {
        revision,
        data,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateAccountConfigFeature(
    accountId: string,
    token: string,
    body: AccountConfigDto,
  ): Promise<AccountConfigDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );

      const { revision } = await this.getAccountConfigFeature(
        accountId,
        token,
        body.id,
      );
      if (!revision) {
        throw new NotFoundException(
          `Feature with id ${body.id} not found in account ${accountId}`,
        );
      }

      console.info(`updateAccountConfigFeature: ${JSON.stringify(body)}`);
      const url = `https://${domain}/api/account/${accountId}/configuration/setting/properties/${body.id}?v=3.0&source=ccui`;
      const Authorization = `Bearer ${token.replace('Bearer ', '')}`;

      const { data } = await this.apiService.put<AccountConfigDto>(url, body, {
        headers: {
          Authorization,
          'If-Match': revision, // Use the revision to ensure we are updating the latest version
        },
      });
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getSkills(
    res: any,
    accountId: string,
    token: string,
  ): Promise<SkillDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/skills?v=2.0&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });

      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      console.info(data.data);
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getSkill(
    res: any,
    accountId: string,
    skillId: string,
    token: string,
  ): Promise<SkillDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/skills/${skillId}?v=2.0&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async createSkill(
    res: any,
    accountId: string,
    token: string,
    body: SkillDto,
  ): Promise<SkillDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/skills?v=2.0`;
      const data = await this.apiService.post<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteSkill(
    res: any,
    accountId: string,
    skillId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/skills/${skillId}?v=2.0`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
          'If-Match': revision,
        },
      });
      const acRevision = data.headers['ac-revision'];
      if (acRevision) {
        res.setHeader('ac-revision', acRevision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getUsers(
    res: any,
    accountId: string,
    token: string,
  ): Promise<UserDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users?v=6.0&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });

      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAllUsers(
    accountId: string,
    token: string,
  ): Promise<UserDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users?v=6.0&select=$all`;
      const data = await this.apiService.get<UserDto[]>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });

      return data.data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getUser(
    res: any,
    accountId: string,
    userId: string,
    token: string,
  ): Promise<UserDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users/${userId}?v=6.0&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getOneUser(
    accountId: string,
    userId: string,
    token: string,
  ): Promise<UserDto | null> {
    try {
      const Authorization = `Bearer ${token.replace('Bearer ', '')}`;
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users/${userId}?v=6.0`;
      const data = await this.apiService.get<UserDto>(url, {
        headers: {
          Authorization,
        },
      });

      return data.data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async createUser(
    res: any,
    accountId: string,
    token: string,
    body: UserDto,
  ): Promise<UserDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users?v=5.0`;
      const data = await this.apiService.post<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteUser(
    res: any,
    accountId: string,
    userId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users/${userId}?v=5.0`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
          'If-Match': revision,
        },
      });
      const acRevision = data.headers['ac-revision'];
      if (acRevision) {
        res.setHeader('ac-revision', acRevision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getMessagingIteractions(
    authorization: string,
    accountId: string,
    requestInfo: MsgIntRequest,
    offset: number,
  ): Promise<any> {
    try {
      const domain = await this.helperService.getDomain(accountId, 'msgHist');
      if (!domain) {
        this.logger.error(`Domain not found for account ${accountId}`);
        throw new NotFoundException('Domain not found for account');
      }

      if (!requestInfo.latestAgentIds) {
        delete requestInfo.latestAgentIds;
      }
      if (!requestInfo.skillIds) {
        delete requestInfo.skillIds;
      }
      if (
        !requestInfo.latestConversationQueueState ||
        requestInfo.latestConversationQueueState.includes('ALL')
      ) {
        delete requestInfo.latestConversationQueueState;
      }
      if (!requestInfo.status) {
        delete requestInfo.status;
      }
      if (!requestInfo.end) {
        delete requestInfo.end;
      }
      if (!requestInfo.start) {
        requestInfo.start = {
          from: Date.now() - 86400000,
          to: Date.now(),
        };
      }

      const url = `https://${domain}/messaging_history/api/account/${accountId}/conversations/search?limit=100&offset=${offset}`;
      const headers = {
        authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        source: 'lp_sltk',
      };
      const data = await this.apiService.post<any>(url, requestInfo, {
        headers: headers,
      });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllMessagingInteractions(
    authorization: string,
    accountId: string,
    requestInfo: MsgIntRequest,
    firstOnly: boolean,
  ): Promise<any> {
    try {
      const conversationHistoryRecords = [];
      let offset = 0;
      let count = 0;
      let metadata = null;
      while (true) {
        const response = await this.getMessagingIteractions(
          authorization,
          accountId,
          requestInfo,
          offset,
        );
        const conversationHistoryRecordsResponse =
          response.conversationHistoryRecords;
        metadata = response._metadata;
        conversationHistoryRecords.push(...conversationHistoryRecordsResponse);
        count = response._metadata.count;
        if (firstOnly && count > 200) {
          break;
        }
        if (count <= offset) {
          break;
        }
        offset += 100;
      }
      return {
        conversationHistoryRecords,
        _metadata: metadata,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBrandDetails(accountId: string, token: string): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'mcfeature');
      const url = `https://${domain}/api/brandDetails/${accountId}?source=ccuiMc`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return data.data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateBrandDetails(
    accountId: string,
    token: string,
    body: any,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'mcfeature');
      const url = `https://${domain}/api/brandDetails/${accountId}?source=ccuiMc&__d=70406`;
      const data = await this.apiService.put<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return data.data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getInstalledApplication(
    accountId: string,
    token: string,
  ): Promise<{ env: string }> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const appId = process.env.VUE_APP_CLIENT_ID;
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/${appId}`;
      const { data } = await this.apiService.get<AppInstallDto>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const envtype = data?.capabilities?.webhooks?.[
        'ms.MessagingEventNotification.ContentEvent'
      ]?.endpoint?.includes('ngrok')
        ? 'dev'
        : 'prod';

      return {
        env: envtype,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAppRevision(
    accountId: string,
    token: string,
  ): Promise<string | void> {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/?v=1`;
      const { data } = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      return revision;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async installApplication(
    accountId: string,
    token: string,
    env: string,
  ): Promise<any> {
    try {
      const match = await this.getAppRevision(accountId, token);
      const body = getApplicationConfig(env || 'prod', accountId);
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: helper.insertBearer(token),
        'If-Match': String(match),
      };
      const { data } = await this.apiService.post<AppInstallDto>(url, body, {
        headers,
      });
      const envtype = data?.capabilities?.webhooks?.[
        'ms.MessagingEventNotification.ContentEvent'
      ]?.endpoint?.includes('ngrok')
        ? 'dev'
        : 'prod';

      return {
        env: envtype,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async enableWebhooks(accountId: string, token: string): Promise<any> {
    const fn = 'enableWebhooks';
    try {
      const env = this.configService.get<string>('WEBHOOK_ENV');
      const match = await this.getAppRevision(accountId, token);
      const body = getApplicationConfig(env || 'prod', accountId);

      // console.info('enableWebhooks', JSON.stringify(body))
      this.logger.info({
        fn,
        level: 'info',
        message: `Enabling webhooks for environment ${env}`,
        accountId,
        body,
      });
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: helper.insertBearer(token),
        'If-Match': String(match), // this is the revision of the app install
      };
      await this.apiService.post<AppInstallDto>(url, body, {
        headers,
      });
      return {
        success: true,
        message: 'Webhooks enabled successfully',
      };
    } catch (error) {
      this.logger.error({
        fn,
        level: 'error',
        message: 'Error enabling webhooks',
        error: error.response.data,
        accountId,
      });
      throw new InternalServerErrorException(error);
    }
  }

  async getWebhooks(accountId: string, token: string): Promise<any> {
    const fn = 'getWebhooks';
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const appId = process.env.VUE_APP_CLIENT_ID;
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/${appId}`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: helper.insertBearer(token),
      };
      const { data } = await this.apiService.get<AppInstallDto>(url, {
        headers,
      });
      const webhooks = data?.capabilities?.webhooks || {};
      return webhooks;
    } catch (error) {
      this.logger.error({
        fn,
        level: 'error',
        message: 'Error fetching webhooks',
        error: error.response.data,
        accountId,
      });
      throw new InternalServerErrorException(error);
    }
  }

  async disableWebhooks(accountId: string, token: string): Promise<any> {
    const fn = 'disableWebhooks';
    try {
      const match = await this.getAppRevision(accountId, token);
      const body = getApplicationConfig(null, accountId);
      if ('capabilities' in body) {
        delete body.capabilities;
      }
      this.logger.info({
        fn,
        level: 'info',
        message: `Disabling webhooks for environment: ${process.env.WEBHOOK_ENV}`,
        accountId,
      });
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: helper.insertBearer(token),
        'If-Match': String(match),
      };
      await this.apiService.post<AppInstallDto>(url, body, {
        headers,
      });
      return {
        success: true,
        message: 'Webhooks disabled successfully',
      };
    } catch (error) {
      this.logger.error({
        fn,
        level: 'error',
        message: 'Error disabling webhooks',
        error: error,
        accountId,
      });
      // throw new InternalServerErrorException(error);
    }
  }

  /**
   * TODO: Currently just extracing token from active task.
   * This should be refactored to use an account specific token via a service worker
   */

  async getAppKey(
    accountId: string,
    keyId: string,
    token: string,
  ): Promise<ApiKeyDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'appKeyManagement',
      );
      const url = `https://${domain}/app-key-manager/api/account/${accountId}/keys/${keyId}?v=1.0`;
      const { data } = await this.apiService.get<ApiKeyDto>(url, {
        headers: {
          Authorization: token,
        },
      });
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getLEAPIKeys(
    res: any,
    accountId: string,
    token: string,
  ): Promise<ApiKeyDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'appKeyManagement',
      );
      const url = `https://${domain}/app-key-manager/api/account/${accountId}/keys?v=1.0`;
      const { data } = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: helper.insertBearer(token),
        },
      });

      return res.send(data);
    } catch (error) {
      this.logger.error({
        message: 'Error fetching API keys',
        error: error.response?.data || error,
        accountId,
      });
      throw new InternalServerErrorException(error);
    }
  }

  async userAPILogin(user: UserDto, appKey: ApiKeyDto, accountId: string) {
    const domain = await this.helperService.getDomain(accountId, 'agentVep');
    const url = `https://${domain}/api/account/${accountId}/login?v=1.3`;

    const loginPayload = {
      username: user.loginName,
      appKey: appKey.keyId,
      secret: appKey.appSecret,
      accessToken: appKey.token,
      accessTokenSecret: appKey.tokenSecret,
    };

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const { data } = await this.apiService.post<any>(url, loginPayload, {
      headers: headers,
    });
    return data;
  }

  async getAccountSettings(accountId: string): Promise<any> | null {
    try {
      const settings = await this.appSettingsCollection.doc(accountId).get();
      if (!settings.exists) {
        return null;
      }
      return settings.data();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateAccountSettings(
    accountId: string,
    settings: AppSettingsDTO,
  ): Promise<AppSettingsDTO> | null {
    try {
      await this.appSettingsCollection
        .doc(accountId)
        .set(settings, { merge: true });
      return settings;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateAccountSettingsMany(
    accountId: string,
    settings: AppSettingsDTO,
  ): Promise<AppSettingsDTO> | null {
    try {
      const docRef = this.appSettingsCollection.doc(accountId);
      const doc = await docRef.get();
      const existingData = doc.exists ? (doc.data() as AppSettingsDTO) : {};
      const updatedData = { ...existingData, ...settings };
      await docRef.set(updatedData, { merge: true });
      return updatedData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // =============================================================================
  // User Settings (user-level, tied to Firebase UID)
  // =============================================================================

  async getUserSettings(userId: string): Promise<UserSettingsDTO | null> {
    try {
      const settings = await this.userSettingsCollection.doc(userId).get();
      if (!settings.exists) {
        return null;
      }
      return settings.data() as UserSettingsDTO;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettingsDTO>,
  ): Promise<UserSettingsDTO> {
    try {
      const docRef = this.userSettingsCollection.doc(userId);
      const doc = await docRef.get();
      const existingData = doc.exists ? (doc.data() as UserSettingsDTO) : {};
      const updatedData = { ...existingData, ...settings };
      await docRef.set(updatedData, { merge: true });
      return updatedData as UserSettingsDTO;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // async setServiceWorkers (): Promise<void> {
  //   this.logger.info({
  //     message: 'Setting service workers for all accounts',
  //     service: AccountConfigService.name,
  //     function: 'setServiceWorkers'
  //   });
  //   const applicationSettingsList = await this.dbService.getApplicationSettingsAll();
  //   for (const accountSettings of applicationSettingsList) {
  //     const { accountId, settings } = accountSettings;

  //     const setting = settings.find(s => s.name === APP_SETTING_NAMES.SERVICE_WORKER);
  //     const {
  //       appKey,
  //       user,
  //     } = setting?.value || {};
  //     if (!appKey || !user) {
  //       this.logger.warn({
  //         message: `Service worker not set for account ${accountId}`,
  //         accountId,
  //         setting: APP_SETTING_NAMES.SERVICE_WORKER
  //       });
  //       continue;
  //     }
  //     const loginResponse = await this.userAPILogin(
  //       user,
  //       appKey,
  //       accountId
  //     );
  //     this.logger.info({
  //       message: `Service worker set for account ${accountId}`,
  //       accountId,
  //       setting: APP_SETTING_NAMES.SERVICE_WORKER,
  //       userId: user.loginName,
  //       appKeyId: appKey.keyId,
  //     });

  //     const { bearer } = loginResponse;
  //     if (!bearer) {
  //       this.logger.error({
  //         message: `Was unable to log in user ${user.loginName} for account ${accountId}`,
  //         accountId
  //       });
  //     }

  //     // accountCache(accountId).setServiceWorker(bearer);

  //   }
  // }

  async getCampaigns(
    res: any,
    accountId: string,
    Authorization: string,
  ): Promise<CampaignDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-campaigns/campaigns?v=3.4&fields=id&fields=name&fields=description&fields=startDate&fields=expirationDate&fields=goalId&fields=lobId&fields=status&fields=isDeleted&fields=priority&fields=engagementIds&fields=weight&fields=timeZone&fields=startDateTimeZoneOffset&fields=expirationDateTimeZoneOffset&fields=startTimeInMinutes&fields=expirationTimeInMinutes&fields=type&Accept=json`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(Authorization),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getCampaign(
    res: any,
    accountId: string,
    campaignId: string,
    token: string,
  ): Promise<CampaignDetailedDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-campaigns/campaigns/${campaignId}?v=3.4`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getEngagement(
    res: any,
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-campaigns/campaigns/${campaignId}/engagements/${engagementId}?v=3.4`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteEngagement(
    res: any,
    accountId: string,
    campaignId: string,
    engagementId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-campaigns/campaigns/${campaignId}/engagements/${engagementId}?v=3.4`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
          'If-Match': revision,
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // https://sy.ac.liveperson.net/api/account/31487986/configuration/le-users/profiles?v=4.0&source=ccuiUmProfiles&select=$all&_=1751838535089&__d=73235
  // PROFILES

  async getProfiles(
    res: any,
    accountId: string,
    token: string,
  ): Promise<Profile[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/profiles?v=4.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(
    res: any,
    accountId: string,
    profileId: string,
    token: string,
  ): Promise<Profile> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/profiles/${profileId}?v=4.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      // const data = await firstValueFrom(
      //   this.httpService
      //     .get<AxiosResponse>(url, {
      //       headers: {
      //         Authorization: helper.insertBearer(token),
      //       },
      //     })
      //     .pipe(
      //       catchError((error: AxiosError) => {
      //         this.logger.error(error.response.data);
      //         throw {
      //           status: error.response.status,
      //           statusText: error.response.statusText,
      //           data: error.response.data,
      //         };
      //       }),
      //     ),
      // );
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateProfile(
    res: any,
    accountId: string,
    profileId: string,
    token: string,
    body: Profile,
  ): Promise<Profile> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/profiles/${profileId}?v=4.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.put<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteProfile(
    res: any,
    accountId: string,
    profileId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/profiles/${profileId}?v=4.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
          'If-Match': revision,
        },
      });
      const acRevision = data.headers['ac-revision'];
      if (acRevision) {
        res.setHeader('ac-revision', acRevision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // GET
  // https://sy.ac.liveperson.net/api/account/31487986/configuration/le-users/lobs?v=2.0&_=1751838535174&__d=40467
  // class: LineOfBusiness
  async getLobs(
    res: any,
    accountId: string,
    token: string,
  ): Promise<LineOfBusiness[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/lobs?v=2.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getLob(
    res: any,
    accountId: string,
    lobId: string,
    token: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/lobs/${lobId}?v=2.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateLob(
    res: any,
    accountId: string,
    lobId: string,
    token: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/lobs/${lobId}?v=2.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.put<AxiosResponse>(
        url,
        {},
        {
          headers: {
            Authorization: helper.insertBearer(token),
          },
        },
      );
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteLob(
    res: any,
    accountId: string,
    lobId: string,
    token: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/lobs/${lobId}?v=2.0&source=ccuiUmProfiles&select=$all`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      const revision = data.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // PredefinedContentDto
  // ttps://sy.ac.liveperson.net/api/account/31487986/configuration/engagement-window/canned-responses?v=2.0&lang=en-US,en-US&select=id,enabled,skillIds,categoriesIds,templateId,data(lang,title),hotkey,lobIds&_=1751859467966&__d=16172

  async getPredefinedContent(
    res: any,
    accountId: string,
    token: string,
  ): Promise<PredefinedContentDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses?v=2.0&lang=en-US,en-US&select=id,enabled,skillIds,categoriesIds,templateId,data(lang,title),hotkey,lobIds`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getPredefinedContentById(
    res: any,
    accountId: string,
    contentId: string,
    token: string,
  ): Promise<PredefinedContentDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${contentId}?v=2.0&lang=en-US,en-US&select=id,enabled,skillIds,categoriesIds,templateId,data(lang,title),hotkey,lobIds`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updatePredefinedContent(
    res: any,
    accountId: string,
    contentId: string,
    token: string,
    body: PredefinedContentDto,
  ): Promise<PredefinedContentDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${contentId}?v=2.0&lang=en-US,en-US&select=id,enabled,skillIds,categoriesIds,templateId,data(lang,title),hotkey,lobIds`;
      const data = await this.apiService.put<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      // const data = await firstValueFrom(
      //   this.httpService
      //     .put<AxiosResponse>(url, body, {
      //       headers: {
      //         Authorization: helper.insertBearer(token),
      //       },
      //     })
      //     .pipe(
      //       catchError((error: AxiosError) => {
      //         this.logger.error(error.response.data);
      //         throw {
      //           status: error.response.status,
      //           statusText: error.response.statusText,
      //           data: error.response.data,
      //         };
      //       }),
      //     ),
      // );
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deletePredefinedContent(
    res: any,
    accountId: string,
    contentId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${contentId}?v=2.0&lang=en-US,en-US&select=id,enabled,skillIds,categoriesIds,templateId,data(lang,title),hotkey,lobIds`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
          'If-Match': revision,
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAutomaticMessagesDefault(
    res: any,
    accountId: string,
    token: string,
  ): Promise<AutomaticMessage[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/default/configuration/engagement-window/unified-auto-messages-defaults?v=2.0`;
      const { data } = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAutomaticMessages(
    res: any,
    accountId: string,
    token: string,
  ): Promise<AutomaticMessage[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages?v=2.0&lang=en-US&view=FILTER_PER_SKILL`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAutomaticMessage(
    res: any,
    accountId: string,
    messageId: string,
    token: string,
  ): Promise<AutomaticMessage> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      // https://sy.ac.liveperson.net/api/account/default/configuration/engagement-window/unified-auto-messages-defaults?v=2.0&_=1751859467987&__d=37765
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}?v=2.0`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateAutomaticMessage(
    res: any,
    accountId: string,
    messageId: string,
    token: string,
    body: any,
  ): Promise<AutomaticMessage> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}?v=2.0`;
      const data = await this.apiService.put<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async createAutomaticMessage(
    res: any,
    accountId: string,
    token: string,
    body: any,
  ): Promise<AutomaticMessage> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages?v=2.0`;
      const data = await this.apiService.post<AxiosResponse>(url, body, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteAutomaticMessage(
    res: any,
    accountId: string,
    messageId: string,
    token: string,
    revision: string,
  ): Promise<AutomaticMessage> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}?v=2.0`;
      const data = await this.apiService.delete<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
          'If-Match': revision,
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /*
  agent groups
  GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/le-users/agentGroups?v=2.0&source=ccuiUm&select=$all&getUsers=true&_=1751875854997&__d=7644
  */

  async getAgentGroups(
    res: any,
    accountId: string,
    token: string,
  ): Promise<AgentGroupDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/agentGroups?v=2.0&source=ccuiUm&select=$all&getUsers=true`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /*
  GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/ac-common/workinghours?v=1.0&_=1751859468033&__d=26475
  */

  async getWorkingHours(
    res: any,
    accountId: string,
    token: string,
  ): Promise<WorkingHoursDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/ac-common/workinghours?v=1.0`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /*
  GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/ac-common/specialoccasion?v=1.0&_=1751859468034&__d=75624

  // TODO:: GET messaging.manual.shifts.management
  */
  async getSpecialOccasions(
    res: any,
    accountId: string,
    token: string,
  ): Promise<SpecialOccasionDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/ac-common/specialoccasion?v=1.0`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /*
GOALS
url: https://sy.ac.liveperson.net/api/account/31487986/configuration/le-goals/goals?v=3.0&select=$summaryDeleted&_=1751859468209&__d=18803
*/

  async getGoals(
    res: any,
    accountId: string,
    token: string,
  ): Promise<GoalDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-goals/goals?v=3.0&select=$summaryDeleted`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /*
visitor-profiles
https://sy.ac.liveperson.net/api/account/31487986/configuration/le-targeting/visitor-profiles?v=2.0&_=1751859468321&__d=13218
*/

  async getVisitorProfiles(
    res: any,
    accountId: string,
    token: string,
  ): Promise<VisitorProfileDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-targeting/visitor-profiles?v=2.0`;
      const data = await this.apiService.get<AxiosResponse>(url, {
        headers: {
          Authorization: helper.insertBearer(token),
        },
      });
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /*
STATUS REASONS
https://sy.ac.liveperson.net/api/account/31487986/configuration/le-agents/status-reasons?v=2.0&include_deleted=true&_=1751875854940&__d=81297
*/

  // async getStatusReasons(
  //   res: any,
  //   accountId: string,
  //   token: string,
  // ): Promise<StatusReason[]> | null {
  //   try {
  //     const domain = await this.helperService.getDomain(
  //       accountId,
  //       'accountConfigReadWrite',
  //     );
  //     const url = `https://${domain}/api/account/${accountId}/configuration/le-agents/status-reasons?v=2.0&include_deleted=true`;
  //     const data = await this.apiService.get<AxiosResponse>(url, {
  //       headers: {
  //         Authorization: helper.insertBearer(token),
  //       },
  //     });
  //     return res.send(data.data);
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  /*
POST SURVEYS
https://sy.ac.liveperson.net/api/account/31487986/configuration/ac-common/post_surveys?v=2.0&select=id,flow(name)&_=1751875854941&__d=12656

*/

  /*
AGENT SURVEYS
GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/ac-common/agent_surveys?v=2.0&select=id,name,enabled,isDefault&_=1751875854942&__d=15389
*/

  /*
CATEGORIES
GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/le-categories/categories?v=2.0&select=$all&return=active&_=1751875854943&__d=66119
*/

  /*
SECURE FORMS
GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/engagement-window/secure-forms?source=ccuiOAWGetSecureForms&NC=true&__d=57927
*/

  /*
VISITOR BEHAVIOURS
GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/le-targeting/visitor-behaviors?v=2.0&_=1751875854952&__d=88090
*/

  /*
onsite locations
ET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/le-targeting/onsite-locations?v=3.0&_=1751875854953&__d=87212
*/

  /*
window configs
GET
	https://sy.ac.liveperson.net/api/account/31487986/configuration/engagement-window/window-confs?v=2.0&_=1751875854954&__d=87878
*/

  /*
ext msg connectors 
https://sy.ac.liveperson.net/api/account/31487986/configuration/le-connectors/extmsgconnectors?v=4.0&select=$all&_=1751875854956&__d=47935
*/

  /*
zones 
GET
	https://cdn.lpsnmedia.net/api/account/5288836/configuration/le-campaigns/zones?fields=id&fields=zoneValue
*/

  /*
widgets
GET
	https://z3.acr.liveperson.net/api/account/31487986/configuration/le-ui-personalization/widgets?v=2.0&select=$all&source=ccuiNAWGetWidgets&__d=97935
*/

  /*
onsite locations
POST
	https://sy.ac.liveperson.net/api/account/31487986/configuration/metadata/dependees/le-targeting/onsite-locations/query?v=2.0&__d=11481
 */
  setServiceWorker(token: string): void {
    // this.token = token;
  }

  async addServiceWorker(
    accountId: string,
    user: UserDto,
    body: ServiceWorkerDataRequest,
  ): Promise<ServiceWorkerData> | null {
    // add to this.serviceWorksCollection
    try {
      const request = {
        ...body,
        id: body.id || uuid(),
        created_at: Date.now(),
        updated_at: Date.now(),
        created_by: String(user.id),
        updated_by: String(user.id),
      };

      console.info('Adding service worker:', request);

      await this.serviceWorksCollection.doc(request.id).set(request);
      return request;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteServiceWorker(
    accountId: string,
    serviceWorkerId: string,
    token: string,
  ): Promise<any> | null {
    try {
      await this.serviceWorksCollection.doc(serviceWorkerId).delete();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getServiceWorkers(
    accountId: string,
    token: string,
  ): Promise<ServiceWorkerData[]> | null {
    try {
      const snapshot = await this.serviceWorksCollection
        .where('account_id', '==', accountId)
        .get();
      const serviceWorkers = snapshot.docs.map(
        (doc) => doc.data() as ServiceWorkerData,
      );
      return serviceWorkers;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getServiceWorker(
    accountId: string,
    serviceWorkerId: string,
    token: string,
  ): Promise<ServiceWorkerData> | null {
    try {
      const snapshot = await this.serviceWorksCollection
        .doc(serviceWorkerId)
        .get();
      const serviceWorker = snapshot.data() as ServiceWorkerData;
      return serviceWorker;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async onModuleInit() {
    // this.setServiceWorkers()
  }
}
