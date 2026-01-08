import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CollectionReference } from '@google-cloud/firestore';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import { cache } from 'src/utils/memCache';
import { CCApp, EncryptedApiKeyDto } from './cc-app-manager.interfaces.dto';
import { AllowAppKeyTargets } from './cc-app-manager.constants';
// import { CCAppMgt } from '../AccountConfig/account-config.service';
import { ApiKeyDto } from 'src/Controllers/AccountConfig/account-config.dto';

@Injectable()
export class CCAppMgtSevice {
  private logger: Logger = new Logger(CCAppMgtSevice.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly helperService: HelperService,
    @Inject(EncryptedApiKeyDto.collectionName)
    private apiKeyCollection: CollectionReference<EncryptedApiKeyDto>,
  ) {}

  async getApiKeyByTarget(
    accountId: string,
    target: string,
  ): Promise<any> | null {
    try {
      const key = `${target}_${accountId}`;
      const cachedApiKey = cache.get(key);
      if (cachedApiKey) {
        this.logger.log('Cache hit');
        return cachedApiKey;
      }
      const snapshot = await this.apiKeyCollection
        .where('account_id', '==', accountId)
        .where('app_target', '==', target)
        .get();
      if (snapshot.empty) {
        return null;
      }
      const apiKey = snapshot.docs[0].data() as EncryptedApiKeyDto;
      cache.add(key, apiKey, 3600);
      return apiKey;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getInstalledApplications(
    accountId: string,
    token: string,
  ): Promise<CCApp[] | void> {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'appMgmtSvcDomain',
      );
      const url = `https://${domain}/api/account/${accountId}`;
      const { data } = await firstValueFrom(
        this.httpService
          .get<CCApp[]>(url, {
            headers: {
              Authorization: token,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getInstalledApplication(
    res: any,
    accountId: string,
    Authorization: string,
    appId: string,
  ): Promise<CCApp | void> {
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      ); // 'appMgmtSvcDomain'
      // {{protocol}}://{{accountConfigReadWrite}}/api/account/{{accountId}}/configuration/app-install/installations/{{id}}?v=1.0
      const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/${appId}`;
      const response = await firstValueFrom(
        this.httpService
          .get<AxiosResponse>(url, {
            headers: { Authorization },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              throw error.response.data;
            }),
          ),
      );
      console.info(response.headers);
      const revision = response.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }

      return res.send(response.data);
    } catch (error) {
      console.error(error);
      // this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async installApplication(
    accountId: string,
    authorization: string,
    body: CCApp,
  ): Promise<CCApp | void> {
    const domain = await this.helperService.getDomain(
      accountId,
      'accountConfigReadWrite',
    ); // 'appMgmtSvcDomain'
    // const url = domain ? `https://${domain}/api/account/${accountId}` : null
    // const real url = https://{{accountConfigReadWrite}}/api/account/{{accountId}}/configuration/app-install/installations/
    const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/`;
    console.log('url', url, 'auth', authorization);
    try {
      if (!domain) {
        throw new InternalServerErrorException('Domain not found');
      }
      if (!url) {
        throw new InternalServerErrorException('Domain not found');
      }
      const { data } = await firstValueFrom(
        this.httpService
          .post<CCApp>(url, body, {
            headers: {
              authorization,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw {
                fn: 'installApplication',
                url: url,
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

  async updateApplication(
    res: any,
    accountId: string,
    authorization: string,
    body: Partial<CCApp>,
    ifMatch: string,
  ): Promise<CCApp | void> {
    const domain = await this.helperService.getDomain(
      accountId,
      'accountConfigReadWrite',
    ); // 'accountConfigReadWrite') appMgmtSvcDomain
    // https://{{accountConfigReadWrite}}/api/account/{{accountId}}/configuration/app-install/installations/{{client_id}}
    // const url1 = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/${body.id}`
    // const url2 = {{protocol}}://{{appMgmtSvcDomain}}/api/account/{{AccountId}}/configuration/app-install/installations/{{client_id}}?v=1.0
    // const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/${body.id}?v=1.0`
    const url = `https://${domain}/api/account/${accountId}/configuration/app-install/installations/${body.id}`;
    console.info('url', url, 'body', body);

    /*
    bad : "https://sy.ac.liveperson.net/api/account/31487986/configuration/app-install/installations/93f806ed-682c-4d54-88fe-b972ef0e5ff1"
    good : https://sy.ac.liveperson.net/api/account/31487986/configuration/app-install/installations/93f806ed-682c-4d54-88fe-b972ef0e5ff1
    */
    try {
      if (!domain) {
        throw new InternalServerErrorException('Domain not found');
      }
      if (!url) {
        throw new InternalServerErrorException('Domain not found');
      }
      const response = await firstValueFrom(
        this.httpService
          .post<AxiosResponse>(url, body, {
            headers: {
              authorization,
              'If-Match': ifMatch,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(error.response.data);
              // throw error.response.data
              throw {
                fn: 'updateApplication',
                url: url,
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
              };
            }),
          ),
      );
      const revision = response.headers['ac-revision'];
      if (revision) {
        res.setHeader('ac-revision', revision);
      }

      return res.send(response.data);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
