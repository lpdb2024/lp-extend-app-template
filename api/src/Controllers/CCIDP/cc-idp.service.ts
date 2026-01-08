import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import {
  Injectable,
  Inject,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { HelperService } from '../HelperService/helper-service.service';
import { accountCache } from 'src/utils/memCache';
import { jwtDecode } from 'jwt-decode';
import {
  AppAuthRequest,
  Token,
  CCUserDto,
  AppUserDto,
  AppExchangeToken,
} from './cc-idp.dto';
import { CollectionReference } from '@google-cloud/firestore';
import { LpToken } from './cc-idp.interfaces';
import { AccountConfigService } from 'src/Controllers/AccountConfig/account-config.service';
import { ConfigService } from '@nestjs/config';
import { DBService } from 'src/firestore/firestore.service';
import { CORE_PERMISSIONS } from 'src/constants/constants';
import { refreshToken } from 'firebase-admin/app';
import { CBAuthInfoDto } from '../ConversationBuilderOld/cb.dto';
@Injectable()
export class CCIdpService {
  constructor(
    @InjectPinoLogger(CCIdpService.name)
    private readonly logger: PinoLogger,
    private configService: ConfigService = new ConfigService(),
    @Inject(LpToken.collectionName)
    private tokenCollection: CollectionReference<LpToken>,
    private readonly httpService: HttpService,
    private readonly helperService: HelperService,
    @Inject(CCUserDto.collectionName)
    private userCollection: CollectionReference<AppUserDto>,
    private readonly accountConfigService: AccountConfigService,
    private readonly dbService: DBService,
  ) {}

  async authenticateConversationBuilder(
    site_id: string,
    authorization: string,
  ): Promise<CBAuthInfoDto | null> {
    try {
      const domain = await this.helperService.getDomain(site_id, 'cbLeIntegrations');
      const bearer = authorization
        .replace('Bearer ', '')
        .replace('bearer ', '');
      if (!domain) {
        this.logger.error(`Domain not found for account ${site_id}`);
        throw new InternalServerErrorException(
          `Domain not found for account ${site_id}`,
        );
      }

      const headers = {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearer}`,
        Connection: 'keep-alive',
      };
      const url = `https://${domain}/sso/authenticate?source=ccui`;
      const { data } = await firstValueFrom(
        this.httpService
          .get<CBAuthInfoDto>(url, {
            headers: headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw error;
            }),
          ),
      );
      if (!data) {
        this.logger.error(`Failed to authenticate user`);
        throw new InternalServerErrorException(`Failed to authenticate user`);
      }

      return data;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getToken(
    accountId: string,
    body: AppAuthRequest,
  ): Promise<Token> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'sentinel');
      const clientId = this.configService.get<string>('VUE_APP_CLIENT_ID');
      const clientSecret = this.configService.get<string>(
        'VUE_APP_CLIENT_SECRET',
      );
      if (!clientId || !clientSecret) {
        this.logger.error('Client ID or Client Secret not found');
        throw new ForbiddenException('Client ID or Client Secret not found');
      }
      const url = `https://${domain}/sentinel/api/account/${accountId}/token?v=2.0`;
      const auth_string = `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${body.code}&redirect_uri=${body.redirect}`;

      const { data } = await firstValueFrom(
        this.httpService
          .post<AppExchangeToken>(url, auth_string, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error('[GET_TOKEN_ERROR] data', error);
              console.error(clientId, clientSecret, body.code, body.redirect);
              throw error.response.data;
            }),
          ),
      );

      const decoded = jwtDecode(data.id_token);
      const validtyPeriod = 4; // hours
      const expiry = new Date(Date.now() + validtyPeriod * 60 * 60 * 1000);
      const exp = new Date(Date.now() + data.expires_in * 1000);

      const cbAuth = await this.authenticateConversationBuilder(
        accountId,
        data.access_token,
      );
      if (!cbAuth) {
        this.logger.error(
          `Failed to authenticate user for account ${accountId}`,
        );
      }

      const token: Token = {
        id: data.access_token,
        idToken: data.id_token,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        uid: decoded.sub,
        cbToken: cbAuth?.successResult?.apiAccessToken || '',
        cbOrg: cbAuth?.successResult?.sessionOrganizationId || '',
        expiresIn: data.expires_in / 3600,
        expiry: Math.min(exp.getTime(), expiry.getTime()),
        accountId: accountId,
      };

      const snapshot = await this.tokenCollection
        .where('uid', '==', decoded.sub)
        .get();
      snapshot.forEach(async (doc) => {
        await doc.ref.delete();
      });
      accountCache(accountId).add(data.access_token, token, data.expires_in);

      // Try to get user from LP - may fail for LPA users
      let ccUser = null;
      let isLPA = false;
      try {
        ccUser = await this.accountConfigService.getOneUser(
          accountId,
          decoded.sub,
          data.access_token,
        );
      } catch (error) {
        // LPA users won't have a user record in the account
        // Check if user can access the account (if they got a token, they can)
        this.logger.info(`User ${decoded.sub} not found in account ${accountId} - may be LPA user`);
        isLPA = true;
      }

      const storedUser = await this.dbService.getUser(decoded.sub);
      if (!storedUser) {
        // New user - create with this account as default
        // Build user object with all required fields and proper defaults
        const user: AppUserDto = {
          // Required UserDto fields with defaults
          id: decoded.sub,
          deleted: ccUser?.deleted ?? false,
          loginName: ccUser?.loginName || (decoded as any).email || '',
          fullName: ccUser?.fullName || ccUser?.nickname || (decoded as any).email || 'User',
          nickname: ccUser?.nickname || '',
          passwordSh: '',
          isEnabled: ccUser?.isEnabled ?? true,
          maxChats: ccUser?.maxChats ?? 0,
          email: ccUser?.email || (decoded as any).email || '',
          pictureUrl: ccUser?.pictureUrl || '',
          disabledManually: ccUser?.disabledManually ?? false,
          skillIds: ccUser?.skillIds || [],
          profiles: ccUser?.profiles || [],
          profileIds: ccUser?.profileIds || [],
          lobIds: ccUser?.lobIds || [],
          changePwdNextLogin: ccUser?.changePwdNextLogin ?? false,
          memberOf: ccUser?.memberOf || null,
          managerOf: ccUser?.managerOf || [],
          permissionGroups: ccUser?.permissionGroups || [],
          description: ccUser?.description || '',
          mobileNumber: ccUser?.mobileNumber || '',
          employeeId: ccUser?.employeeId || '',
          maxAsyncChats: ccUser?.maxAsyncChats ?? 0,
          backgndImgUri: ccUser?.backgndImgUri || '',
          pnCertName: ccUser?.pnCertName || '',
          dateUpdated: ccUser?.dateUpdated || new Date().toISOString(),
          lastPwdChangeDate: ccUser?.lastPwdChangeDate || '',
          isApiUser: ccUser?.isApiUser ?? false,
          userTypeId: ccUser?.userTypeId ?? 0,
          // AppUserDto specific fields
          roles: isLPA ? ['USER', 'LPA'] : ['USER'],
          accountId,
          defaultAccountId: accountId,
          linkedAccountIds: [accountId],
          createdAt: Date.now(),
          createdBy: decoded.sub,
          displayName: ccUser?.nickname || ccUser?.fullName || ccUser?.email || (decoded as any).email || 'LPA User',
          isLPA,
          photoUrl: ccUser?.pictureUrl || '',
          permissions: [],
          termsAgreed: false,
          updatedAt: Date.now(),
          updatedBy: decoded.sub,
          installedApps: ['CORE'],
          appPermissions: CORE_PERMISSIONS,
        };
        this.logger.info(`Creating new user: ${user.displayName}, isLPA: ${isLPA}`);
        const userSaved = await this.dbService.setUser(decoded.sub, user);
        if (!userSaved) {
          throw new InternalServerErrorException('Failed to save user data');
        }
      } else {
        // Existing user - add this account to linked accounts if not already present
        // Build linkedAccounts safely, filtering out any undefined values
        let linkedAccounts: string[] = [];
        if (storedUser.linkedAccountIds && Array.isArray(storedUser.linkedAccountIds)) {
          linkedAccounts = storedUser.linkedAccountIds.filter(id => id !== undefined && id !== null);
        }
        if (linkedAccounts.length === 0 && storedUser.accountId) {
          linkedAccounts = [storedUser.accountId];
        }

        const updates: Partial<AppUserDto> = {
          updatedAt: Date.now(),
        };

        if (!linkedAccounts.includes(accountId)) {
          linkedAccounts.push(accountId);
          updates.linkedAccountIds = linkedAccounts;
        }

        // Ensure accountId is set if missing
        if (!storedUser.accountId) {
          updates.accountId = accountId;
        }

        // Ensure defaultAccountId is set if missing
        if (!storedUser.defaultAccountId) {
          updates.defaultAccountId = accountId;
        }

        // Update LPA status if changed
        if (isLPA && !storedUser.isLPA) {
          updates.isLPA = true;
          updates.roles = [...(storedUser.roles || []), 'LPA'].filter((v, i, a) => a.indexOf(v) === i);
        }

        await this.dbService.setUser(decoded.sub, {
          ...storedUser,
          ...updates,
        });
      }

      await this.dbService.setToken(data.access_token, token);
      return token;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async logOut(accountId: string, token: string) {
    try {
      const domain = await this.helperService.getDomain(accountId, 'sentinel');
      const url = `https://${domain}/sentinel/api/account/${accountId}/token/revoke?v1.0`;
      const auth_string = `client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&token=${token}`;
      const { data } = await firstValueFrom(
        this.httpService
          .post<AxiosResponse>(url, auth_string, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .pipe(
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

  async getLoginUrl(
    site_id: string,
    referer: string,
    host: string,
  ): Promise<{ url: string }> | null {
    try {
      const client_id = process.env.VUE_APP_CLIENT_ID;
      // Extract just the origin from referer to avoid double slashes or path issues
      let origin: string;

      this.logger.info(`getLoginUrl - referer: "${referer}", host: "${host}"`);

      if (referer) {
        try {
          const refererUrl = new URL(referer);
          origin = refererUrl.origin;
        } catch {
          // Invalid referer URL, fall through to host-based logic
          origin = null;
        }
      }

      if (!origin) {
        // Fallback: construct from host header
        // Host header is typically "localhost:3000" without protocol
        // Use http for localhost, https otherwise
        const isLocalhost = host && (host.startsWith('localhost') || host.startsWith('127.0.0.1'));
        const protocol = isLocalhost ? 'http' : 'https';
        origin = `${protocol}://${host}`;
      }

      // Ensure no trailing slash
      origin = origin.replace(/\/$/, '');

      const redirect = `${origin}/callback`;
      this.logger.info(`getLoginUrl - constructed redirect: "${redirect}"`);

      const domain = await this.helperService.getDomain(site_id, 'sentinel');
      const url = `https://${domain}/sentinel/api/account/${site_id}/authorize?v=1.0&response_type=code&redirect_uri=${redirect}&client_id=${client_id}&state=${site_id}`;
      return { url };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getDomains(accountId: string): Promise<any> | null {
    return await this.helperService.getDomains(accountId);
  }
}
