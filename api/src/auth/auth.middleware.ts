import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import type { SentinelLpToken, SentinelAppUser } from '@lpextend/node-sdk';
import { helper } from 'src/utils/HelperService';
import {
  ShellTokenService,
  ShellTokenPayload,
} from './shell-token.service';
import {
  ExtendJWTService,
  ExtendJWTPayload,
  EXTEND_AUTH_COOKIE,
} from './extend-jwt.service';
import { initializeSDK, Scopes } from '@lpextend/node-sdk';

// Collection name constants
const LP_TOKEN_COLLECTION = 'lp-tokens';
const APP_USERS_COLLECTION = 'app-users';

const { ctx } = helper;
const context = 'AUTH_MIDDLEWARE';

/**
 * Response from shell LP token endpoint
 */
interface ShellSentinelLpTokenResponse {
  accessToken: string;
  expiresAt: number;
  accountId: string;
  userId: string;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
    loginName?: string;
    profileIds?: number[];
    skillIds?: number[];
  };
}

// Cache for LP tokens retrieved from shell (keyed by accountId:userId)
const lpTokenCache = new Map<string, { token: ShellSentinelLpTokenResponse; expiresAt: number }>();

interface CustomRequest extends Request {
  token?: any;
  user?: any;
  firebaseUid?: string;
  shellToken?: ShellTokenPayload;
  isShellAuth?: boolean;
  lpAccessToken?: string;
  extendToken?: string; // Raw extend_auth cookie for SDK initialization
}

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  private shellTokenService: ShellTokenService;
  private extendJWTService: ExtendJWTService;
  private shellBaseUrl: string;
  private appId: string;

  constructor(private configService: ConfigService) {
    this.shellTokenService = new ShellTokenService();
    this.extendJWTService = new ExtendJWTService(configService);
    this.shellBaseUrl = this.configService.get<string>('SHELL_BASE_URL') || 'http://localhost:3001';
    this.appId = this.configService.get<string>('APP_ID') || 'lp-extend-template';
  }

  cookieAuth(req: any) {
    const auth = req.signedCookies['cc_auth'];
    const user = req.signedCookies['cc_user'];
    if (!auth) {
      return null;
    }
    return { auth, user };
  }

  bearerAuth(req: any) {
    const bearer = req?.headers?.authorization?.replace('CC-Bearer ', '');
    if (!bearer) {
      return null;
    }
    return bearer;
  }

  async getLPToken(token: string): Promise<SentinelLpToken> {
    const lpTokenInfo = await admin
      .firestore()
      .collection('lp_tokens')
      .doc(token)
      .get();
    return lpTokenInfo.data() as SentinelLpToken;
  }

  /**
   * Verify Firebase ID token and get user from Firestore
   * Returns user data if valid, null otherwise
   */
  async verifyFirebaseToken(idToken: string, accountId?: string): Promise<{
    token: Partial<SentinelLpToken>;
    user: SentinelAppUser;
    accessToken: string;
    firebaseUid: string;
  } | null> {
    const fn = 'verifyFirebaseToken';
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;

      // Get user from Firestore
      const userCollection = admin.firestore().collection(APP_USERS_COLLECTION);
      const userDoc = await userCollection.doc(firebaseUid).get();

      if (!userDoc.exists) {
        console.info(...ctx(context, fn, { firebaseUid, error: 'Firebase user not found in Firestore' }));
        return null;
      }

      const user = userDoc.data() as SentinelAppUser;

      // Use the accountId from URL params, or fallback to user's default
      const effectiveAccountId = accountId || user.defaultAccountId || user.accountId;

      // Create a synthetic token object for compatibility
      const syntheticToken: Partial<SentinelLpToken> = {
        uid: firebaseUid,
        accountId: effectiveAccountId,
        id: firebaseUid,
      };

      return {
        token: syntheticToken,
        user,
        accessToken: idToken,
        firebaseUid,
      };
    } catch (error) {
      console.error(...ctx(context, fn, { error: 'Firebase token verification failed' }));
      return null;
    }
  }

  async doCCAuth(
    token: string,
    accountId: string,
  ): Promise<{
    accessToken: string;
    token: { accountId: string };
    user: null;
  } | null> {
    try {
      // Use SDK directly to validate the token by fetching users
      const sdk = await initializeSDK({
        appId: this.appId,
        accountId,
        accessToken: token,
        shellBaseUrl: this.shellBaseUrl,
        scopes: [Scopes.USERS],
        debug: this.configService.get<string>('NODE_ENV') !== 'production',
      });
      await sdk.users.getAll();
      // if user is able to retrieve users, then token is valid...
      return {
        accessToken: token,
        token: {
          accountId,
        },
        user: null,
      };
    } catch (error) {
      console.error(
        ...ctx(
          context,
          'doCCAuth',
          {
            accountId,
            error: 'unauthorised: no access token provided or token invalid',
          },
          accountId,
        ),
      );
      return null;
    }
  }

  async getAuthenticationToken(
    req: any,
  ): Promise<{ token: any; user: SentinelAppUser; accessToken: string; firebaseUid?: string }> {
    const fn = 'getAuthenticationToken';
    const response = {
      token: null,
      user: null,
      accessToken: null,
      firebaseUid: null,
    };

    const bearer = req?.headers?.authorization?.replace('Bearer ', '');
    const isCCAuth = req?.headers?.authorization?.includes('CC-Bearer ');
    if (isCCAuth) {
      const ccAuthResult = await this.doCCAuth(
        req?.headers?.authorization?.replace('CC-Bearer ', ''),
        req?.params?.accountId,
      );
      return ccAuthResult || response;
    }
    const { auth } = this.cookieAuth(req) || { auth: null, user: null };
    const authToken = bearer ? bearer : auth;
    const authType = bearer ? 'bearer' : 'cookie';
    let accountId = req?.params?.accountId;
    if (!authToken) {
      console.error(...ctx(context, fn, accountId, 'No auth token found'));
      return response;
    }

    // Try Firebase token verification first (for Firebase-authenticated users)
    const firebaseAuth = await this.verifyFirebaseToken(authToken, accountId);
    if (firebaseAuth) {
      console.info(...ctx(context, fn, { accountId, method: 'Firebase ID token' }));
      return firebaseAuth;
    }

    // Fallback to LP token lookup (for LP SSO-authenticated users)
    const token = await this.getLPToken(authToken);
    console.info(...ctx(context, fn, {
      accountId,
      authToken: authToken?.substring(0, 20) + '...',
      tokenFound: !!token,
      hasCbToken: !!token?.cbToken,
      hasCbOrg: !!token?.cbOrg,
      cbOrg: token?.cbOrg,
    }));
    accountId = accountId || token?.accountId;

    const uid = token?.uid || token?.id;
    if (!uid) {
      console.info(...ctx(context, fn, { accountId, error: 'No valid LP token or Firebase token found', tokenKeys: token ? Object.keys(token) : null }));
      return response;
    }
    console.info(...ctx(context, fn, { uid, accountId, lookingUpUser: true }));

    try {
      // const ccuser = await this.accountConfigService.getOneUser(
      const userCollection = admin
        .firestore()
        .collection(APP_USERS_COLLECTION);
      //   accountId,
      //   uid,
      //   authToken,
      // );
      // const storedUser = await this.dbService.getUser(decoded.sub);
      console.info(...ctx(context, fn, { uid, collectionName: APP_USERS_COLLECTION, lookingUpUserDoc: true }));
      const ccuser = await userCollection.doc(uid).get();
      if (!ccuser.exists) {
        console.error(
          ...ctx(
            context,
            fn,
            {
              accountId,
              uid,
              error: 'no conversation Cloud user found in Firestore',
            },
            accountId,
          ),
        );
        return response;
      }
      console.info(...ctx(context, fn, { uid, userFound: true }));
      return {
        token,
        user: ccuser.data() as SentinelAppUser,
        accessToken: authType === 'bearer' ? authToken : token.access_token,
      };
    } catch (error) {
      console.error(
        ...ctx(
          context,
          fn,
          {
            accountId,
            error: 'no conversation Cloud user found',
          },
          accountId,
        ),
      );
      return response;
    }
  }

  /**
   * Check for X-Shell-Token header (used when running inside LP Extend shell)
   */
  async verifyShellToken(req: CustomRequest): Promise<{
    valid: boolean;
    payload?: ShellTokenPayload;
    error?: string;
  }> {
    const shellToken = req.headers['x-shell-token'] as string;
    console.info('[PreAuthMiddleware] Checking shell token:', {
      hasShellToken: !!shellToken,
      tokenPreview: shellToken ? shellToken.substring(0, 50) + '...' : null,
    });
    if (!shellToken) {
      return { valid: false, error: 'No shell token' };
    }

    const result = this.shellTokenService.verifyToken(shellToken);
    console.info('[PreAuthMiddleware] Shell token verification result:', {
      valid: result.valid,
      error: result.error,
      hasPayload: !!result.payload,
    });
    if (result.valid) {
      console.info('[PreAuthMiddleware] Shell token verified:', {
        appId: result.payload?.appId,
        accountId: result.payload?.accountId,
        userId: result.payload?.sub,
        scopes: result.payload?.scopes,
      });
    }
    return result;
  }

  /**
   * Check for extend_auth cookie (set by LP Extend Shell)
   * This cookie contains an encrypted JWT with LP access token
   */
  verifyExtendAuthCookie(req: CustomRequest): ExtendJWTPayload | null {
    const fn = 'verifyExtendAuthCookie';

    // Check for the extend_auth cookie (can be signed or unsigned depending on shell config)
    const extendAuthCookie =
      req.signedCookies?.[EXTEND_AUTH_COOKIE] ||
      req.cookies?.[EXTEND_AUTH_COOKIE];

    console.info(...ctx(context, fn, {
      hasExtendAuthCookie: !!extendAuthCookie,
      cookiePreview: extendAuthCookie ? extendAuthCookie.substring(0, 50) + '...' : null,
    }));

    if (!extendAuthCookie) {
      return null;
    }

    const payload = this.extendJWTService.verifyExtendJWT(extendAuthCookie);
    if (payload) {
      console.info(...ctx(context, fn, {
        verified: true,
        userId: payload.lpUserId,
        accountId: payload.lpAccountId,
        hasAccessToken: !!payload.lpAccessToken,
      }));
    }

    return payload;
  }

  /**
   * Fetch LP token from shell backend
   * Uses cache to avoid repeated requests
   */
  async fetchSentinelLpTokenFromShell(
    shellToken: string,
    accountId: string,
    userId: string,
  ): Promise<ShellSentinelLpTokenResponse | null> {
    const fn = 'fetchSentinelLpTokenFromShell';
    const cacheKey = `${accountId}:${userId}`;

    // Check cache first
    const cached = lpTokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + 60000) {
      // Token valid for at least 1 more minute
      console.info(...ctx(context, fn, { accountId, userId, cached: true }));
      return cached.token;
    }

    try {
      const response = await fetch(
        `${this.shellBaseUrl}/api/v1/shell/token/${accountId}/lp-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shell-Token': shellToken,
          },
          body: JSON.stringify({
            appId: this.appId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(...ctx(context, fn, {
          accountId,
          userId,
          status: response.status,
          error: errorData.message || 'Failed to fetch LP token from shell',
        }));
        return null;
      }

      const tokenData: ShellSentinelLpTokenResponse = await response.json();

      // Only cache if we got a valid accessToken
      if (tokenData.accessToken) {
        lpTokenCache.set(cacheKey, {
          token: tokenData,
          expiresAt: tokenData.expiresAt,
        });
      } else {
        console.warn(...ctx(context, fn, {
          accountId,
          userId,
          warning: 'Shell returned LP token without accessToken - not caching',
          tokenKeys: Object.keys(tokenData),
        }));
      }

      console.info(...ctx(context, fn, {
        accountId,
        userId,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        hasAccessToken: !!tokenData.accessToken,
      }));

      return tokenData;
    } catch (error) {
      console.error(...ctx(context, fn, {
        accountId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      return null;
    }
  }

  async use(req: CustomRequest, res: Response, next: () => void) {
    const isRoot = req.path === '/';

    // Check for shell token first (when running inside LP Extend shell)
    const shellResult = await this.verifyShellToken(req);
    if (shellResult.valid && shellResult.payload) {
      console.info('[PreAuthMiddleware] Using shell authentication');
      req.shellToken = shellResult.payload;
      req.isShellAuth = true;

      // Fetch the LP token from the shell for API calls
      const rawShellToken = req.headers['x-shell-token'] as string;
      const lpTokenData = await this.fetchSentinelLpTokenFromShell(
        rawShellToken,
        shellResult.payload.accountId,
        shellResult.payload.sub,
      );

      if (lpTokenData) {
        console.info('[PreAuthMiddleware] LP token data received:', {
          hasAccessToken: !!lpTokenData.accessToken,
          accessTokenPreview: lpTokenData.accessToken ? lpTokenData.accessToken.substring(0, 30) + '...' : null,
          expiresAt: lpTokenData.expiresAt,
          accountId: lpTokenData.accountId,
          userId: lpTokenData.userId,
        });
        req.lpAccessToken = lpTokenData.accessToken;
        // Create a token object with LP access token for API calls
        // Note: Set both access_token and accessToken for compatibility
        req.token = {
          uid: shellResult.payload.sub,
          accountId: shellResult.payload.accountId,
          id: shellResult.payload.sub,
          appId: shellResult.payload.appId,
          scopes: shellResult.payload.scopes,
          access_token: lpTokenData.accessToken,
          accessToken: lpTokenData.accessToken,
        };
        // Include user info if returned from shell
        if (lpTokenData.user) {
          req.user = lpTokenData.user;
        }
      } else {
        // Fallback: create synthetic token without LP access token
        // API calls requiring LP token will fail, but app can still function
        console.warn('[PreAuthMiddleware] Could not fetch LP token from shell');
        req.token = {
          uid: shellResult.payload.sub,
          accountId: shellResult.payload.accountId,
          id: shellResult.payload.sub,
          appId: shellResult.payload.appId,
          scopes: shellResult.payload.scopes,
        };
      }

      req.firebaseUid = shellResult.payload.sub;
      return next();
    }

    // Check for extend_auth cookie (set by LP Extend Shell for direct browser access)
    const rawExtendCookie =
      req.signedCookies?.[EXTEND_AUTH_COOKIE] ||
      req.cookies?.[EXTEND_AUTH_COOKIE];
    const extendAuthPayload = this.verifyExtendAuthCookie(req);
    if (extendAuthPayload) {
      console.info('[PreAuthMiddleware] Using extend_auth cookie authentication');
      req.isShellAuth = true;
      req.lpAccessToken = extendAuthPayload.lpAccessToken;
      req.extendToken = rawExtendCookie; // Pass raw cookie for SDK initialization
      req.token = {
        uid: extendAuthPayload.lpUserId,
        accountId: extendAuthPayload.lpAccountId,
        id: extendAuthPayload.lpUserId,
        access_token: extendAuthPayload.lpAccessToken,
        accessToken: extendAuthPayload.lpAccessToken,
        isLPA: extendAuthPayload.isLPA,
        cbToken: extendAuthPayload.cbToken,
        cbOrg: extendAuthPayload.cbOrg,
      };
      req.firebaseUid = extendAuthPayload.lpUserId;
      return next();
    }

    // Fall back to standard authentication (Bearer token)
    const { token, user, accessToken, firebaseUid } = await this.getAuthenticationToken(req);
    console.info('[PreAuthMiddleware] Auth result:', {
      path: req.path,
      hasToken: !!token,
      hasUser: !!user,
      hasAccessToken: !!accessToken,
      firebaseUid,
      tokenAccountId: token?.accountId,
    });
    if (isRoot && token?.accountId) {
      res.redirect('/' + token.accountId);
      return;
    } else if (isRoot && !token?.accountId) {
      return res.redirect('/login');
    }

    try {
      if (!token && !user) {
        console.info('[PreAuthMiddleware] Returning 401 - no token and no user');
        if (!res.headersSent) return res.status(401).send('Unauthorized');
        return;
      }
      req.user = user;
      req.token = token;
      if (firebaseUid) {
        req.firebaseUid = firebaseUid;
      }
    } catch (error) {
      if (error.message.includes('token has expired')) {
        if (!res.headersSent) return res.status(401).send(error.message);
      } else {
        if (!res.headersSent) return res.status(500).send(error.message);
      }
      return;
    }
    next();
  }
}
