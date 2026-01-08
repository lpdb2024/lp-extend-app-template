import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { LpToken } from 'src/Controllers/CCIDP/cc-idp.interfaces';
import { AccountConfigService } from 'src/Controllers/AccountConfig/account-config.service';
import { UserDto } from 'src/Controllers/AccountConfig/account-config.dto';
import { helper } from 'src/utils/HelperService';
import { AppUserDto } from 'src/Controllers/CCIDP/cc-idp.dto';
import {
  ShellTokenService,
  ShellTokenPayload,
} from './shell-token.service';
const { ctx } = helper;
const context = 'AUTH_MIDDLEWARE';
interface CustomRequest extends Request {
  token?: any;
  user?: any;
  firebaseUid?: string;
  shellToken?: ShellTokenPayload;
  isShellAuth?: boolean;
}

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  private shellTokenService: ShellTokenService;

  constructor(private accountConfigService: AccountConfigService) {
    this.shellTokenService = new ShellTokenService();
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

  async getLPToken(token: string): Promise<LpToken> {
    const lpTokenInfo = await admin
      .firestore()
      .collection('lp_tokens')
      .doc(token)
      .get();
    return lpTokenInfo.data() as LpToken;
  }

  /**
   * Verify Firebase ID token and get user from Firestore
   * Returns user data if valid, null otherwise
   */
  async verifyFirebaseToken(idToken: string, accountId?: string): Promise<{
    token: Partial<LpToken>;
    user: AppUserDto;
    accessToken: string;
    firebaseUid: string;
  } | null> {
    const fn = 'verifyFirebaseToken';
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const firebaseUid = decodedToken.uid;

      // Get user from Firestore
      const userCollection = admin.firestore().collection(AppUserDto.collectionName);
      const userDoc = await userCollection.doc(firebaseUid).get();

      if (!userDoc.exists) {
        console.info(...ctx(context, fn, { firebaseUid, error: 'Firebase user not found in Firestore' }));
        return null;
      }

      const user = userDoc.data() as AppUserDto;

      // Use the accountId from URL params, or fallback to user's default
      const effectiveAccountId = accountId || user.defaultAccountId || user.accountId;

      // Create a synthetic token object for compatibility
      const syntheticToken: Partial<LpToken> = {
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
      await this.accountConfigService.getAllUsers(accountId, token);
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
  ): Promise<{ token: any; user: AppUserDto; accessToken: string; firebaseUid?: string }> {
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
        .collection(AppUserDto.collectionName);
      //   accountId,
      //   uid,
      //   authToken,
      // );
      // const storedUser = await this.dbService.getUser(decoded.sub);
      console.info(...ctx(context, fn, { uid, collectionName: AppUserDto.collectionName, lookingUpUserDoc: true }));
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
        user: ccuser.data() as AppUserDto,
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
    if (!shellToken) {
      return { valid: false, error: 'No shell token' };
    }

    const result = this.shellTokenService.verifyToken(shellToken);
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

  async use(req: CustomRequest, res: Response, next: () => void) {
    const isRoot = req.path === '/';

    // Check for shell token first (when running inside LP Extend shell)
    const shellResult = await this.verifyShellToken(req);
    if (shellResult.valid && shellResult.payload) {
      console.info('[PreAuthMiddleware] Using shell authentication');
      req.shellToken = shellResult.payload;
      req.isShellAuth = true;
      // Create a synthetic token object for compatibility with existing code
      req.token = {
        uid: shellResult.payload.sub,
        accountId: shellResult.payload.accountId,
        id: shellResult.payload.sub,
        appId: shellResult.payload.appId,
        scopes: shellResult.payload.scopes,
      };
      // User info will need to be fetched separately if needed
      req.firebaseUid = shellResult.payload.sub;
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
