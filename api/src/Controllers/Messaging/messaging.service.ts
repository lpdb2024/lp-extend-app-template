import {
  Injectable,
  Inject,
  Logger,
  forwardRef,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import { ConnectorDto } from './messaging.interfaces.dto';
import { ConnectorAPIService } from '../ConnectorAPI/connector-api.service';
import { authenticationErrors } from '../../constants/constants';
import { CCAppMgtSevice } from '../CCAppManagement/cc-app-manager.service';
import { cache } from 'src/utils/memCache';
import { helper as JS } from 'src/utils/HelperService';
const { oAuth1Header } = JS;
@Injectable()
export class MessagingService {
  private logger: Logger = new Logger(MessagingService.name);

  constructor(
    private readonly connectorService: ConnectorAPIService,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService,
    @Inject(forwardRef(() => CCAppMgtSevice))
    private readonly appManagerService: CCAppMgtSevice,
  ) {}

  async authoriseAnonomousJWT(
    accountId: string,
    body: any,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'idp');
      const url = `https://${domain}/api/account/${accountId}/anonymous/authorize`;
      const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
      const { data } = await firstValueFrom(
        this.httpService.post(url, body, { headers }).pipe(
          catchError((error: AxiosError) => {
            console.info(error.response.data);
            this.logger.error(error.response);
            throw error.response.data;
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // async getUsers(accountId: string): Promise<any> | null {
  //   const apiKey = await this.appManagerService.getApiKeyByTarget(accountId, 'LP_MESSAGING')
  //   if (!apiKey) {
  //     throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
  //   }
  //   try {
  //     const domain = await this.helperService.getDomain(accountId, 'accountConfigReadWrite')
  //     const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users?v=2.0&select=$all`
  //     const headers = {
  //       ...oAuth1Header(JSON.parse(apiKey.encrypted_key), {
  //         url,
  //         method: 'GET',
  //       }),
  //       'Content-Type': 'application/json; charset=UTF-8'
  //     }
  //     const { data } = await firstValueFrom(
  //       this.httpService.get(url, { headers }).pipe(
  //         catchError((error: AxiosError) => {
  //           this.logger.error(error.response.data);
  //           throw 'An error happened!';
  //         }),
  //       ),
  //     );

  //     return data
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  async getDomains(accountId: string): Promise<any> | null {
    return await this.helperService.getDomains(accountId);
  }

  async getAnonomousJWT(accountId: string): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'idp');
      const url = `https://${domain}/api/account/${accountId}/anonymous/authorize`;
      const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
      const { data } = await firstValueFrom(
        this.httpService.post(url, null, { headers }).pipe(
          catchError((error: AxiosError) => {
            console.info(error.response.data);
            this.logger.error(error.response);
            throw error.response.data;
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getConnectors(accountId: string): Promise<ConnectorDto[]> | null {
    try {
      // const domain = await this.helperService.getDomain(accountId, 'accountConfigReadWrite')
      const url = `https://accdn.lpsnmedia.net/api/account/${accountId}/configuration/le-connectors/all-connectors`;
      const { data } = await firstValueFrom(
        this.httpService.get<ConnectorDto[]>(url).pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw error.response.data;
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async authenticateJWT(
    accountId: string,
    connectorId: string,
    body: any,
  ): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'idp');
      const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
      const url = `https://${domain}/api/account/${accountId}/app/${connectorId}/authenticate?v=3.0`;
      const { data } = await firstValueFrom(
        this.httpService.post(url, body, { headers }).pipe(
          catchError((error: AxiosError) => {
            const internalErrorCode = (error.response.data as any)
              .internalErrorCode;
            const errorCode = authenticationErrors[internalErrorCode];
            console.error(error.response.data, errorCode);
            throw error.response.data;
          }),
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getAnonymousToken1(accountId: string): Promise<any> | null {
    try {
      const appJwt = await this.connectorService.getAppJwt(accountId);
      if (!appJwt) {
        this.logger.error(`Error getting app jwt`);
        throw new InternalServerErrorException(`Error getting app jwt`);
      }
      const consumerJWS = await this.connectorService.getConsumerJWS(
        accountId,
        appJwt,
        null,
      );

      if (!consumerJWS) {
        this.logger.error(`Error getting consumer jwt`);
        throw new InternalServerErrorException(`Error getting consumer jwt`);
      }

      return consumerJWS;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    // try {
    //   const domain = await this.helperService.getDomain(accountId, 'idp')
    //   if (!domain) {
    //     throw new InternalServerErrorException('Domain not found');
    //   }
    //   const headers = {"Content-Type": "application/json; charset=UTF-8"}
    //   const url = `https://${domain}/api/account/${accountId}/anonymous/authorize`
    //   const data = await firstValueFrom(
    //     this.httpService.get(url, { headers })
    //   );

    //   return data;
    // } catch (error) {
    //   this.logger.error(error);
    //   throw new InternalServerErrorException(error);
    // }
  }

  async getAnonymousToken(accountId: string): Promise<any> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'idp');
      if (!domain) {
        throw new InternalServerErrorException('Domain not found');
      }
      const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
      const url = `https://${domain}/api/account/${accountId}/anonymous/authorize`;
      const data = await firstValueFrom(this.httpService.get(url, { headers }));

      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  // async getSkills(accountId: string): Promise<any> | null {
  //   try {
  //     const apiKey = await this.appManagerService.getApiKeyByTarget(accountId, 'LP_MESSAGING')
  //     const decryptedApiKey = await this.helperService.decrypt(apiKey.encrypted_key)

  //     if (!apiKey) {
  //       throw new InternalServerErrorException('API Key not found');
  //     }
  //     const domain = await this.helperService.getDomain(accountId, 'accountConfigReadWrite')
  //     const url = `https://${domain}/api/account/${accountId}/configuration/le-users/skills?v=2.0&select=$all`
  //     const headers = {
  //       Authorization: oAuth1Header(JSON.parse(decryptedApiKey), {
  //         url,
  //         method: 'GET',
  //       }),
  //       'Content-Type': 'application/json; charset=UTF-8'
  //     }
  //     const { data } = await firstValueFrom(
  //       this.httpService.get(url, { headers }).pipe(
  //         catchError((error: AxiosError) => {
  //           this.logger.error(error.response.data);
  //           throw 'An error happened!';
  //         }),
  //       ),
  //     );

  //     return data
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  async uploadFile(
    accountId: string,
    size: string,
    sig: string,
    exp: string,
    relativePath: string,
    file: Express.Multer.File,
  ): Promise<any> {
    const domain = await this.helperService.getDomain(accountId, 'swift');
    const url = `https://${domain}${relativePath}?temp_url_sig=${sig}&temp_url_expires=${exp}`;
    console.info(url, accountId, sig, exp, relativePath);
    console.info('************');
    console.info(file);
    console.info(file);
    if (!file) {
      throw new HttpException('no file found', HttpStatus.UNAUTHORIZED);
    }
    if (!domain || !url || !accountId || !sig || !exp || !relativePath) {
      throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    }
    // put, uploadfile as binary
    // const headers = {
    //   'Content-Type': file.mimetype,
    //   'Content-Length': file.size,
    // }
    const response = await firstValueFrom(
      this.httpService.put(url, file.buffer, {}).pipe(
        catchError((error: AxiosError) => {
          console.info(error.response.data);
          console.error(error.response);
          throw error.response.data;
        }),
      ),
    );
    console.info(response);
    return response.data;
  }

  async getUsers(accountId: string): Promise<any> | null {
    const apiKey = await this.appManagerService.getApiKeyByTarget(
      accountId,
      'LP_MESSAGING',
    );
    if (!apiKey) {
      throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
    }
    console.info('apiKey', JSON.parse(apiKey.encrypted_key));
    try {
      const domain = await this.helperService.getDomain(
        accountId,
        'accountConfigReadWrite',
      );
      const url = `https://${domain}/api/account/${accountId}/configuration/le-users/users?v=2.0&select=$all`;
      const headers = {
        ...oAuth1Header(JSON.parse(apiKey.encrypted_key), {
          url,
          method: 'GET',
        }),
        'Content-Type': 'application/json; charset=UTF-8',
      };
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers }).pipe(
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
}
