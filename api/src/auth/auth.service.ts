import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { firstValueFrom, catchError } from 'rxjs';
import type {
  SentinelAuthRequest,
  SentinelTokenExchange,
  SentinelAppUser,
  SentinelLpToken,
  CBAuthInfo,
  LPUser,
} from '@lpextend/client-sdk';
import { initializeSDK, Scopes } from '@lpextend/client-sdk';
import { HelperService } from 'src/Controllers/HelperService/helper-service.service';
import { cache } from 'src/utils/memCache';
import { CollectionReference } from '@google-cloud/firestore';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// Collection name constants
const LP_TOKEN_COLLECTION = 'lp-tokens';
const APP_USERS_COLLECTION = 'app-users';

@Injectable()
export class AuthService {
  private shellBaseUrl: string;
  private appId: string;

  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private helperService: HelperService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(LP_TOKEN_COLLECTION)
    private tokenCollection: CollectionReference<SentinelLpToken>,
    @Inject(APP_USERS_COLLECTION)
    private userCollection: CollectionReference<SentinelAppUser>,
  ) {
    this.shellBaseUrl = this.configService.get<string>('SHELL_BASE_URL') || 'http://localhost:3001';
    this.appId = this.configService.get<string>('APP_ID') || 'lp-extend-template';
  }

  /**
   * Get LP user via SDK
   */
  private async getLPUser(accountId: string, userId: string, accessToken: string): Promise<LPUser | null> {
    try {
      const sdk = await initializeSDK({
        appId: this.appId,
        accountId,
        accessToken,
        shellBaseUrl: this.shellBaseUrl,
        scopes: [Scopes.USERS],
        debug: this.configService.get<string>('NODE_ENV') !== 'production',
      });
      const { data } = await sdk.users.getById(userId);
      return data;
    } catch (error) {
      this.logger.error({ accountId, userId, error: error?.message }, 'Failed to get LP user via SDK');
      return null;
    }
  }

  async getToken(
    accountId: string,
    body: SentinelAuthRequest,
  ): Promise<SentinelTokenExchange> | null {
    try {
      const domain = await this.helperService.getDomain(accountId, 'sentinel');
      const url = `https://${domain}/sentinel/api/account/${accountId}/token?v=2.0`;
      const auth_string = `client_id=${process.env.VUE_APP_CLIENT_ID}&client_secret=${process.env.VUE_APP_CLIENT_SECRET}&grant_type=authorization_code&code=${body.code}&redirect_uri=${body.redirect}`;

      const { data } = await firstValueFrom(
        this.httpService
          .post<SentinelTokenExchange>(url, auth_string, {
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
      const decoded = jwtDecode(data.id_token);
      const token = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        id_token: data.id_token,
        expires_in: data.expires_in,
        expiry: '',
        timestamp: '',
        id: data.access_token,
        accountId,
        uid: decoded.sub,
        token: data.id_token,
        cbToken: null,
        cbOrg: null,
        userData: null,
      };

      const exp = new Date(Date.now() + data.expires_in * 1000);
      token.expiry = `${exp.getDate()}-${exp.getMonth() + 1}-${exp.getFullYear()} ${exp.getHours()}:${exp.getMinutes()}`;
      const now = new Date();
      token.timestamp = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;

      const userData = await this.userCollection.doc(decoded.sub).get();
      if (userData.exists) {
        token.userData = userData.data();
      }

      const snapshot = await this.tokenCollection
        .where('uid', '==', decoded.sub)
        .get();
      snapshot.forEach(async (doc) => {
        await doc.ref.delete();
      });

      cache.add(data.access_token, token, data.expires_in);
      const ccUser = await this.getLPUser(accountId, decoded.sub, data.access_token);
      if (!ccUser) {
        this.logger.warn(
          `Conversation Cloud User not found for user: ${decoded.sub}`,
        );
        return null;
      }
      const appUserDoc = await this.userCollection.doc(decoded.sub).get();
      if (!appUserDoc.exists) {
        const user: Partial<SentinelAppUser> = {
          roles: ['ADMIN'],
          id: decoded.sub,
          email: ccUser.email || '',
          accountId: accountId,
          createdAt: Date.now(),
          createdBy: decoded.sub,
          displayName: ccUser.fullName || ccUser.loginName || '',
          isLPA: false,
          photoUrl: (ccUser as any).pictureUrl || '',
          permissions: [],
          termsAgreed: false,
          updatedAt: Date.now(),
          updatedBy: decoded.sub,
          installedApps: ['CORE'],
          appPermissions: [],
        };
        await this.userCollection.doc(decoded.sub).set(user as any);
      }
      // Authenticate with Conversation Builder
      try {
        this.logger.info({ accountId }, 'Starting CB authentication...');
        const cbAuth = await this.authenticateConversationBuilder(
          accountId,
          data.access_token,
        );
        this.logger.info(
          {
            accountId,
            cbAuthSuccess: cbAuth?.success,
            hasSuccessResult: !!cbAuth?.successResult,
            cbToken: cbAuth?.successResult?.apiAccessToken ? 'present' : 'missing',
            cbOrg: cbAuth?.successResult?.sessionOrganizationId,
          },
          'CB auth response received',
        );
        if (cbAuth?.success && cbAuth.successResult) {
          token.cbToken = cbAuth.successResult.apiAccessToken;
          token.cbOrg = cbAuth.successResult.sessionOrganizationId;
          this.logger.info(
            {
              accountId,
              cbOrg: token.cbOrg,
              cbTokenLength: token.cbToken?.length,
              cbTokenFirst20: token.cbToken?.substring(0, 20),
              apiAccessTokenLength: cbAuth.successResult.apiAccessToken?.length,
              apiAccessPermTokenLength: cbAuth.successResult.apiAccessPermToken?.length,
              successResultKeys: Object.keys(cbAuth.successResult),
            },
            'CB authentication successful - token populated',
          );
        } else {
          this.logger.warn(
            { accountId, cbAuth },
            'CB authentication returned unsuccessful response',
          );
        }
      } catch (cbError) {
        // CB auth failure should not block LP auth - log and continue
        this.logger.error(
          {
            accountId,
            error: cbError?.message,
            status: cbError?.response?.status,
            data: cbError?.response?.data,
          },
          'CB authentication failed - continuing without CB token',
        );
      }

      token.id = data.access_token;
      this.logger.info(
        {
          accountId,
          tokenHasCbToken: !!token.cbToken,
          tokenHasCbOrg: !!token.cbOrg,
        },
        'Storing token to Firestore',
      );
      await this.tokenCollection.doc(data.access_token).set(token);

      // Return enhanced data with cbToken and cbOrg
      const response = {
        ...data,
        cbToken: token.cbToken,
        cbOrg: token.cbOrg,
      };
      this.logger.info(
        {
          accountId,
          responseHasCbToken: !!response.cbToken,
          responseHasCbOrg: !!response.cbOrg,
        },
        'Returning auth response',
      );
      return response;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async authenticateUser(req: any, res: any): Promise<void> {
    const code = req.query.code;
    const state = req.query.state;
    const protocol = process.env.PROTOCOL || 'http';
    const redirect = `${protocol}://${req.get('host')}/callback`;
    const route =
      protocol === 'http'
        ? 'http://localhost:8080/app/'
        : 'https://conversation-simulator-660885157216.australia-southeast1.run.app/app/';
    // const port = req.get('host').split(':')[1] || 80
    // const isLocal = (redirect.includes('localhost') || req.protocol === 'http') && port === '8080'
    const authenticated = await this.getToken(state, {
      code,
      redirect,
      appname: 'Conversational Simulator',
    });
    // if (isLocal) {
    if (authenticated) {
      res.cookie('cc_auth', authenticated.access_token, { signed: true });
      res.cookie('cc_user', authenticated.id_token, { signed: true });
      // res.redirect(`http://localhost:8080/app/${state}`);
      res.redirect(`${route}${state}`);
    } else {
      // res.redirect('http://localhost:8080/login?error=authentication_failed');
      res.redirect(`${route}login?error=authentication_failed`);
    }
    // } else {
    //   return res.json(authenticated);

    // }
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
      throw new InternalServerErrorException(error);
    } finally {
      return null;
    }
  }

  /**
   * Authenticate with Conversation Builder using LP token
   * Gets CB API token and organization ID for CB API calls
   */
  private async authenticateConversationBuilder(
    accountId: string,
    accessToken: string,
  ): Promise<CBAuthInfo | null> {
    this.logger.info({ accountId }, 'CB auth: Getting cbLeIntegrations domain');
    const domain = await this.helperService.getDomain(
      accountId,
      'cbLeIntegrations',
    );
    if (!domain) {
      this.logger.error(
        { accountId },
        'CB auth: cbLeIntegrations domain not found!',
      );
      return null;
    }

    const url = `https://${domain}/sso/authenticate?source=ccui`;
    this.logger.info(
      { accountId, domain, url, tokenLength: accessToken?.length },
      'CB auth: Making SSO authenticate request',
    );

    const { data } = await firstValueFrom(
      this.httpService
        .get<CBAuthInfo>(url, {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(
              {
                accountId,
                url,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
              },
              'CB auth: SSO authenticate request FAILED',
            );
            throw error;
          }),
        ),
    );

    this.logger.info(
      {
        accountId,
        success: data?.success,
        message: data?.message,
        hasApiToken: !!data?.successResult?.apiAccessToken,
        orgId: data?.successResult?.sessionOrganizationId,
      },
      'CB auth: SSO authenticate response received',
    );

    return data;
  }

  /**
   * Get user by Firebase UID
   * Returns user profile with defaultAccountId and linkedAccountIds
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<SentinelAppUser | null> {
    if (!firebaseUid) {
      return null;
    }
    const userDoc = await this.userCollection.doc(firebaseUid).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data() as SentinelAppUser;
  }

  /**
   * Set the user's default LP account
   */
  async setDefaultAccount(firebaseUid: string, accountId: string): Promise<{ success: boolean; defaultAccountId: string }> {
    if (!firebaseUid || !accountId) {
      throw new InternalServerErrorException('Missing firebaseUid or accountId');
    }

    const userDoc = await this.userCollection.doc(firebaseUid).get();
    if (!userDoc.exists) {
      throw new InternalServerErrorException('User not found');
    }

    const user = userDoc.data() as SentinelAppUser;
    const linkedAccounts = user.linkedAccountIds || [user.accountId];

    // Verify the account is in user's linked accounts
    if (!linkedAccounts.includes(accountId)) {
      throw new InternalServerErrorException('Account not linked to user');
    }

    await this.userCollection.doc(firebaseUid).update({
      defaultAccountId: accountId,
      updatedAt: Date.now(),
    });

    return { success: true, defaultAccountId: accountId };
  }

  /**
   * Link a new LP account to the user
   * This just adds the accountId to linkedAccountIds - actual LP auth happens separately
   */
  async linkLpAccount(firebaseUid: string, accountId: string): Promise<{ success: boolean; linkedAccountIds: string[] }> {
    if (!firebaseUid || !accountId) {
      throw new InternalServerErrorException('Missing firebaseUid or accountId');
    }

    const userDoc = await this.userCollection.doc(firebaseUid).get();
    if (!userDoc.exists) {
      // Create new user document for Firebase-only users
      const newUser: Partial<SentinelAppUser> = {
        id: firebaseUid,
        accountId: accountId,
        defaultAccountId: accountId,
        linkedAccountIds: [accountId],
        roles: ['USER'],
        permissions: [],
        installedApps: ['CORE'],
        appPermissions: [],
        createdAt: Date.now(),
        createdBy: firebaseUid,
        updatedAt: Date.now(),
        updatedBy: firebaseUid,
      };
      await this.userCollection.doc(firebaseUid).set(newUser as SentinelAppUser);
      return { success: true, linkedAccountIds: [accountId] };
    }

    const user = userDoc.data() as SentinelAppUser;
    const linkedAccounts = user.linkedAccountIds || [user.accountId];

    if (!linkedAccounts.includes(accountId)) {
      linkedAccounts.push(accountId);
      await this.userCollection.doc(firebaseUid).update({
        linkedAccountIds: linkedAccounts,
        updatedAt: Date.now(),
      });
    }

    return { success: true, linkedAccountIds: linkedAccounts };
  }
}
