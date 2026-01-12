import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as lpm from 'lp-messaging-sdk';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { HelperService } from '../../HelperService/helper-service.service';
import {
  SkillDto,
  AccountConfigDto,
  UserDto,
  PredefinedContentDto,
  CampaignDto,
  CampaignDetailedDto,
  ApiKeyDto,
  AppInstallDto,
  MsgIntRequest,
  PromptResponseDto,
  PromptDto,
  Connection,
} from './conversation-cloud.dto';
import { helper } from 'src/utils/HelperService';
import {
  ConversationHistoryRecord,
  ConversationHistoryResponse,
} from './conversation-cloud.interfaces';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

const ctx = helper.ctx;
const context = 'ConversationCloudService';

@Injectable()
export class ConversationCloudService {
  constructor(
    @InjectPinoLogger(ConversationCloudService.name)
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService,
  ) {}

  async getPrompts(accountId: string, token: string): Promise<PromptDto[]> {
    const fn = 'getPrompts';
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'promptlibrary',
      );
      if (!domain) {
        const e = helper.ctx(
          context,
          fn,
          'Domain not found for service: promptlibrary',
          accountId,
        );
        console.error(e);
        throw new NotFoundException(e);
      }
      const url = `https://${domain}/v2/accounts/${accountId}/prompts?source=convsim`;
      const headers = {
        Authorization: helper.insertBearer(token),
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      };
      const response = await firstValueFrom(
        this.httpService.get<PromptResponseDto>(url, { headers }).pipe(
          catchError((error: AxiosError) => {
            const e = ctx(context, fn, String(error.response.data), accountId);
            console.error(e);
            throw e;
          }),
        ),
      );
      return response.data.successResult.prompts;
    } catch (error) {
      const e = ctx(context, fn, String(error), accountId);
      console.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async getAccountConfigFeatures(
    accountId: string,
    token: string,
    user: any,
  ): Promise<AccountConfigDto[]> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      let url = `https://${domain}/api/account/${accountId}/configuration/setting/properties?groups=loginSession&context_cascading=false&v=3.0&source=ccui`;
      if (user?.uid) {
        url += `&context_type=USER&context_id=${user.uid}`;
      }
      const Authorization = `Bearer ${token.replace('Bearer ', '')}`;

      const { data } = await firstValueFrom(
        this.httpService
          .get<AccountConfigDto[]>(url, {
            headers: {
              Authorization,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const data = await firstValueFrom(
        this.httpService
          .post<AxiosResponse>(url, body, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const data = await firstValueFrom(
        this.httpService
          .delete<AxiosResponse>(url, {
            headers: {
              Authorization: token,
              'If-Match': revision,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users?v=5.0&select=$all`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users/${userId}?v=5.0&select=$all`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users/${userId}?v=5.0`;
      const data = await firstValueFrom(
        this.httpService
          .get<UserDto>(url, {
            headers: {
              Authorization,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw error.response.data;
            }),
          ),
      );
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
      const data = await firstValueFrom(
        this.httpService
          .post<AxiosResponse>(url, body, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const data = await firstValueFrom(
        this.httpService
          .delete<AxiosResponse>(url, {
            headers: {
              Authorization: token,
              'If-Match': revision,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses?select=$all&v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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

  async getPredefinedContentItem(
    res: any,
    accountId: string,
    itemId: string,
    token: string,
  ): Promise<PredefinedContentDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${itemId}?select=$all&v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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

  async getPredefinedContentById(
    res: any,
    accountId: string,
    token: string,
    id: string,
  ): Promise<PredefinedContentDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${id}?v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
      return res.send(data.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updatePredefinedContent(
    res: any,
    accountId: string,
    itemId: string,
    token: string,
    body: PredefinedContentDto,
    revision: string,
  ): Promise<PredefinedContentDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${itemId}?v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .put<AxiosResponse>(url, body, {
            headers: {
              Authorization: token,
              'If-Match': revision,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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

  async deletePredefinedContent(
    res: any,
    accountId: string,
    itemId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses/${itemId}?v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .delete<AxiosResponse>(url, {
            headers: {
              Authorization: token,
              'If-Match': revision,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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

  async createPredefinedContent(
    res: any,
    accountId: string,
    token: string,
    body: PredefinedContentDto,
  ): Promise<PredefinedContentDto> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/canned-responses?v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .post<AxiosResponse>(url, body, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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

  async getAutomaticMessages(
    res: any,
    accountId: string,
    token: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages?v=2.0&view=FILTER_PER_SKILL`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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

  async getAutomaticMessage(
    res: any,
    accountId: string,
    messageId: string,
    token: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}?v=2.0&view=BY_CONTEXT`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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

  async deleteAutomaticMessage(
    res: any,
    accountId: string,
    messageId: string,
    token: string,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}?v=2.0`;
      const data = await firstValueFrom(
        this.httpService
          .delete<AxiosResponse>(url, {
            headers: {
              Authorization: token,
              'If-Match': revision,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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

  async updateAutomaticMessage(
    res: any,
    accountId: string,
    messageId: string,
    token: string,
    body: any,
    revision: string,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/engagement-window/unified-auto-messages/${messageId}?v=2.0`;
      const data = await firstValueFrom(
        this.httpService
          .put<AxiosResponse>(url, body, {
            headers: {
              Authorization: token,
              'If-Match': revision,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
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
      const { data } = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
      return res.send(data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getLEAPIKey(
    res: any | null,
    accountId: string,
    keyId: string,
    token: string,
  ): Promise<AxiosResponse> | null {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'appKeyManagement',
      );
      const url = `https://${domain}/app-key-manager/api/account/${accountId}/keys/${keyId}?v=1.0`;
      const data = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
      if (res) {
        return res.send(data.data);
      }
      return data.data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getKeyInternal(
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
      const { data } = await firstValueFrom(
        this.httpService
          .get<ApiKeyDto>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getInstalledApplications(
    res: any | null,
    accountId: string,
    token: string,
  ): Promise<AppInstallDto[] | void> {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations`;
      const data = await firstValueFrom(
        this.httpService
          .get<AppInstallDto[]>(url, {
            headers: { Authorization: token },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
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
      const data = await firstValueFrom(
        this.httpService
          .get<AppInstallDto[]>(url, {
            headers: { Authorization: token },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                fn: 'getAppRevision',
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
      const revision = data.headers['ac-revision'];
      //
      return revision;
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
      // this is a nodejs function, do not use any python functions
      // const requestInfo = requestInfo.modelDump() modelDump is not a function

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
      const { data } = await firstValueFrom(
        this.httpService
          .post<any>(url, requestInfo, {
            headers: headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );
      return data;
    } catch (error) {
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
      throw error;
    }
  }

  /**
   * Deploy bot to handle conversation actions
   *
   * NOTE: Service worker configuration must be provided in the request body.
   * Service workers are app-specific (stored in Firestore) and not part of the SDK.
   * The caller is responsible for retrieving service worker config before calling this method.
   *
   * @param token - LP auth token
   * @param accountId - LP account ID
   * @param body - Request body containing conversations, action, and serviceWorkerConfig
   */
  async deployBot(token: string, accountId: string, body: any): Promise<any> {
    interface AuthData {
      username: string;
      appKey: string;
      secret: string;
      accessToken: string;
      accessTokenSecret: string;
    }

    interface ProcessedFailed {
      processed: string[];
      failed: string[];
    }

    try {
      const { conversations, action, serviceWorkerConfig } = body;

      // Service worker config must be provided by the caller (from app's Firestore)
      if (!serviceWorkerConfig || serviceWorkerConfig.length === 0) {
        throw new Error('Service Worker configuration not provided. Please pass serviceWorkerConfig in the request body.');
      }
      const { user_id } = serviceWorkerConfig[0];
      if (!user_id) {
        throw new Error('User ID not found in service worker configuration');
      }
      const user = await this.getOneUser(accountId, user_id, token);
      console.info('user', user);
      if (!user) {
        throw new Error('User not found');
      }
      const { allowedAppKeys } = user;
      if (!allowedAppKeys || allowedAppKeys.length === 0) {
        throw new Error('App Key not found');
      }
      const apiKey = (await this.getKeyInternal(
        accountId,
        allowedAppKeys,
        token,
      )) as ApiKeyDto;

      console.info(
        `##processing actions for account ${accountId}, total conversations: ${conversations.length}`,
      );
      const authData: AuthData = {
        username: user.loginName,
        appKey: allowedAppKeys,
        secret: apiKey.appSecret,
        accessToken: apiKey.token,
        accessTokenSecret: apiKey.tokenSecret,
      };

      const processed = [];
      const failed = [];
      let responseSent = false;
      let connectionClosed = false;

      const isCompleted = (connection: Connection) => {
        const completed =
          processed.length + failed.length === conversations.length;
        if (completed) {
          if (!connectionClosed && connection && connection.open) {
            connectionClosed = true;
            connection.close();
          }
          if (responseSent) {
            return true;
          }
          responseSent = true;
          return { processed, failed };
        }
        return false;
      };

      const startingProps = {
        appId: 'NEXUS_AGENT',
        accountId,
        userType: lpm.UserType.BRAND,
        authData,
        defaultSubscriptionQuery: { state: ['OPEN'], dialogTypes: ['MAIN'] },
      };

      const connection = lpm.createConnection(startingProps);

      console.info(
        `processing actions for account ${accountId}, total conversations: ${conversations.length}`,
      );

      connection.on('conversation', async (conversation: any) => {
        try {
          const included = conversations.includes(conversation.conversationId);
          const isJoined = conversation.openDialog.participants.some(
            (participant) =>
              participant?.agentId &&
              participant?.agentId.includes(String(user.pid)),
          );
          if (!included) return;
          if (conversation.stage !== 'OPEN') {
            console.info(
              `conversation ${conversation.conversationId} is already closed`,
            );
            processed.push(conversation.conversationId);
            if (isCompleted(connection)) return;
          }
          (await isJoined)
            ? conversation.join(lpm.ParticipantRole.MANAGER)
            : void 0;
          if (action?.name === 'close_conversation') {
            await conversation.close();
          }
          if (action?.name === 'transfer' && !!action.skillId) {
            console.info(
              `attempting to transfer conversation ${conversation.conversationId} to skill ${action.skillId}`,
            );
            const transferred = await conversation.transfer({
              skillId: String(action.skillId),
            });
            console.info(transferred);
          }

          await conversation.leave();
          processed.push(conversation.conversationId);
          if (isCompleted(connection)) return;
        } catch (error) {
          failed.push(conversation.conversationId);
          if (isCompleted(connection)) return;
          console.error(error);
          // throw error
        }
      });

      console.info('awaiting open', await connection.open());
      setTimeout(() => {
        if (isCompleted(connection)) return;
      }, 20000);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // return this.service.getOneMessagingInteraction(helper.insertBearer(token), accountId, conversationId);
  async getOneMessagingInteraction(
    authorization: string,
    accountId: string,
    conversationId: string,
  ): Promise<any> {
    try {
      const body = {
        conversationId: conversationId,
      };
      const domain = await this.helperService.getDomain(accountId, 'msgHist');
      if (!domain) {
        this.logger.error(`Domain not found for account ${accountId}`);
        throw new NotFoundException('Domain not found for account');
      }
      const url = `https://${domain}/messaging_history/api/account/${accountId}/conversations/conversation/search`;
      const headers = {
        authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        source: 'lp_sltk',
      };
      const { data } = await firstValueFrom(
        this.httpService
          .post<any>(url, body, {
            headers: headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );
      return data;
    } catch (error) {}
  }

  async getConversationsByIds(
    token: string,
    accountId: string,
    conversationIds: string[],
    requestId?: string,
  ): Promise<ConversationHistoryRecord[]> {
    try {
      const fn = 'getConversationsByIds';
      if (!conversationIds || conversationIds.length === 0) {
        this.logger.error({
          fn: 'getConversationsByIds',
          accountId,
          message: 'No conversation IDs provided',
          requestId: requestId || 'N/A',
        });
        throw new BadRequestException(
          helper.ctx(context, fn, 'No conversation IDs provided', requestId),
        );
      }
      const body = {
        conversationIds,
        contentToRetrieve: [
          'messageRecords',
          'transfers',
          'interactions',
          'messageScores',
          'conversationSurveys',
          'summary',
          'sdes',
          'unAuthSdes',
          'monitoring',
          'responseTime',
        ],
      };
      const domain = await this.helperService.getDomain(accountId, 'msgHist');
      if (!domain) {
        this.logger.error(`Domain not found for account ${accountId}`);
        throw new NotFoundException('Domain not found for account');
      }
      const url = `https://${domain}/messaging_history/api/account/${accountId}/conversations/conversation/search?limit=100&offset=0`;
      const headers = {
        authorization: helper.insertBearer(token),
        Accept: 'application/json',
        'Content-Type': 'application/json',
        source: 'CONV_SIM',
      };
      const { data } = await firstValueFrom(
        this.httpService
          .post<ConversationHistoryResponse>(url, body, {
            headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      return data?.conversationHistoryRecords || [];
    } catch (error) {
      throw error;
    }
  }

  async getConversationById(
    token: string,
    accountId: string,
    conversationId: string[],
    requestId?: string,
  ): Promise<ConversationHistoryRecord[]> {
    try {
      const fn = 'getConversationsById';
      if (!conversationId) {
        this.logger.error({
          fn: 'getConversationsById',
          accountId,
          message: 'No conversation ID provided',
          requestId: requestId || 'N/A',
        });
        throw new BadRequestException(
          helper.ctx(context, fn, 'No conversation ID provided', requestId),
        );
      }
      const body = {
        conversationId,
      };
      const domain = await this.helperService.getDomain(accountId, 'msgHist');
      if (!domain) {
        this.logger.error(`Domain not found for account ${accountId}`);
        throw new NotFoundException('Domain not found for account');
      }
      const url = `https://${domain}/messaging_history/api/account/${accountId}/conversations/conversation/search`;
      const headers = {
        authorization: helper.insertBearer(token),
        Accept: 'application/json',
        'Content-Type': 'application/json',
        source: 'CONV_SIM',
      };
      const { data } = await firstValueFrom(
        this.httpService
          .post<ConversationHistoryResponse>(url, body, {
            headers: headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw error;
            }),
          ),
      );

      return data?.conversationHistoryRecords || [];
    } catch (error) {
      console.error(error);
      return null;
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

    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(url, loginPayload, {
          headers: headers,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    return data;
  }

  async messagingHistoryProxyOneConversation(
    accountId: string,
    conversationId: string,
    authorization: string,
  ) {
    const body = {
      conversationId,
      contentToRetrieve: [
        'campaign',
        'messageRecords',
        'agentParticipants',
        'consumerParticipants',
        'sdes',
        'monitoring',
        'unAuthSdes',
        'pageView',
        'transfers',
        'interactions',
        'messageScores',
      ],
      cappingConfiguration:
        'ConversationSummaryEvent:1:desc,CartStatusEvent:1:desc,ServiceActivityEvent:1:desc,CustomerInfoEvent:1:desc,MarketingCampaignInfoEvent:1:desc,PersonalInfoEvent:1:desc,PurchaseEvent:10:desc,ViewedProductEvent:50:desc,VisitorErrorEvent:10:desc,LeadEvent:10:desc,SearchContentEvent:30:desc',
    };

    const domain = await this.helperService.getDomain(
      accountId,
      'socialMsgHistDomain',
    );
    const url = `https://${domain}/messaging_history/api/account/${accountId}/conversations/conversation/search?v=2&source=ccuiNAWConsInfoSubscr&offset=0&limit=50&NC=true`;
    const headers = {
      'Content-Type': 'application/json',
      authorization,
      Accept: 'application/json',
    };
    const { data } = await firstValueFrom(
      this.httpService
        .post<any>(url, body, {
          headers: headers,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    return data;
  }

  async getAgentStats(
    authorization: string,
    accountId: string,
    agentId: string,
  ) {
    const domain = await this.helperService.getDomain(accountId, 'coda');
    const url = `https://${domain}/api/messaging/rest/reporting/brands/${accountId}/agents/${agentId}/msgstatistics?v=1`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization,
    };
    const { data } = await firstValueFrom(
      this.httpService
        .get<any>(url, {
          headers: headers,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    return data;
  }
}
