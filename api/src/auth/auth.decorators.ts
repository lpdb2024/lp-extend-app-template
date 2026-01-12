import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from 'src/Controllers/users/users.interfaces';
import type { SentinelLpToken } from '@lpextend/node-sdk';

import { LE_USER_ROLES } from 'src/constants/constants';

// Local type definitions (previously from AccountConfig)
interface Profile {
  id: number;
  name: string;
  description?: string;
  dateUpdated?: string;
  isAssignedToLPA?: boolean;
}

// Map from Firestore short role names to LP profile names
const ROLE_NAME_MAP: Record<string, string> = {
  ADMIN: LE_USER_ROLES.ADMIN, // 'ADMIN' -> 'Administrator'
  AGENT: LE_USER_ROLES.AGENT, // 'AGENT' -> 'Agent'
  AGENT_MANAGER: LE_USER_ROLES.AGENT_MANAGER, // 'AGENT_MANAGER' -> 'Agent Manager'
  CAMPAIGN_MANAGER: LE_USER_ROLES.CAMPAIGN_MANAGER, // 'CAMPAIGN_MANAGER' -> 'Campaign Manager'
  // Also map full names to themselves for flexibility
  Administrator: LE_USER_ROLES.ADMIN,
  Agent: LE_USER_ROLES.AGENT,
  'Agent Manager': LE_USER_ROLES.AGENT_MANAGER,
  'Campaign Manager': LE_USER_ROLES.CAMPAIGN_MANAGER,
};

// Helper function to check if user has required roles
function userHasRole(user: any, roles: string[]): boolean {
  // Check LP profiles first (array of profile objects with name property)
  const hasProfileRole = roles.some((role) =>
    (user.profiles || []).some((profile: Profile) => profile.name === role),
  );
  if (hasProfileRole) return true;

  // Check Firestore roles (array of short role strings like 'ADMIN')
  // Map them to LP profile names for comparison
  const userRolesMapped = (user.roles || []).map(
    (r: string) => ROLE_NAME_MAP[r] || r,
  );
  return roles.some((role) => userRolesMapped.includes(role));
}
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

// Local collection name constants for Firestore
const APP_SETTINGS_COLLECTION = 'app-settings';
const USER_SETTINGS_COLLECTION = 'user-settings';
const SERVICE_WORKERS_COLLECTION = 'service-workers';

@Injectable()
export class AuthService {
  constructor() {}

  cookieAuth(req: any) {
    const auth = req.signedCookies['cc_auth'];
    const user = req.signedCookies['cc_user'];
    if (!auth) {
      return null;
    }
    return { auth, user };
  }

  async getAuthenticationToken(
    req: any,
    res?: any,
  ): Promise<{ token: SentinelLpToken; user: UserData }> {
    const cookieAuth = (req: any) => {
      const auth = req.signedCookies['cc_auth'];
      const user = req.signedCookies['cc_user'];
      if (!auth) {
        return null;
      }
      return { auth, user };
    };

    const bearer = req?.headers?.authorization?.replace('Bearer ', '');

    const { auth } = cookieAuth(req);
    const authToken = bearer ? bearer : auth;
    if (!authToken) {
      return res ? res.status(401).send('Unauthorized') : null;
    }

    /*
      TODO::Verify user token via LP Gatekeeper service
      below is workaround to attempt retrieving user from LP using the bearer token to confirm validity
    */

    const token = await this.getLPToken(authToken);
    if (!token) {
      return res ? res.status(401).send('Unauthorized') : null;
    }
    // User data is stored in the token from login
    const user = token.userData;
    if (!user) {
      return res ? res.status(401).send('Unauthorized') : null;
    }
    return { token, user: token.userData };
  }

  async getUser(uid: string): Promise<UserData> {
    const user = await admin.firestore().collection('users').doc(uid).get();
    return user.data() as UserData;
  }

  async getLPToken(token: string): Promise<SentinelLpToken> {
    const lpTokenInfo = await admin
      .firestore()
      .collection('lp_tokens')
      .doc(token)
      .get();
    return lpTokenInfo.data() as SentinelLpToken;
  }

  async createUser(data: any) {
    const user = await admin.auth().createUser(data);
    return user;
  }
}

export const VerifyPermissionsFireBase = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const authService = new AuthService();
    const { roles, permissions } = _data as {
      roles: string[];
      permissions: string[];
    };
    const request = ctx.switchToHttp().getRequest();
    const { token } = await authService.getAuthenticationToken(request);
    const user = await authService.getUser(token.uid);
    if (
      roles &&
      roles.length > 0 &&
      !roles.some((role) => user.roles?.includes(role))
    ) {
      return null;
    }
    if (
      permissions &&
      permissions.length > 0 &&
      !permissions.some((permission) => user.permissions?.includes(permission))
    ) {
      return null;
    }
    return user;
  },
);

export const VerifyToken = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const { roles } = _data as {
      roles: LE_USER_ROLES[];
      permissions: string[];
    };
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const token = request.token;
    if (!token) {
      return null;
    }
    if (!user) {
      return null;
    }
    if (roles && roles.length > 0 && !userHasRole(user, roles)) {
      return null;
    }
    return token;
  },
);

export const VerifyUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const { roles } = _data as {
      roles: LE_USER_ROLES[];
      permissions: string[];
    };
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const token = request.token;
    if (!token) {
      return null;
    }
    if (!user) {
      return null;
    }
    if (roles && roles.length > 0 && !userHasRole(user, roles)) {
      return null;
    }
    return user;
  },
);

/**
 * Decorator to verify Firebase ID token and extract the user UID
 * Used for routes that require Firebase authentication
 */
export const VerifyFirebaseToken = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request?.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.replace('Bearer ', '');

    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken.uid;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      return null;
    }
  },
);

/**
 * Auth result returned by dual-auth decorator
 */
export interface DualAuthResult {
  type: 'firebase' | 'lp_sso';
  firebaseUid?: string;
  lpToken?: SentinelLpToken;
  user?: any;
  accountId?: string;
  isLPA?: boolean;
}

/**
 * Decorator that accepts EITHER Firebase token OR LP Bearer token
 * Returns a DualAuthResult object with auth type and relevant data
 *
 * Priority:
 * 1. Check if request already has token/user from PreAuthMiddleware
 * 2. Try Firebase ID token verification
 * 3. Try LP token lookup
 */
export const VerifyDualAuth = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<DualAuthResult | null> => {
    const request = ctx.switchToHttp().getRequest();

    // If PreAuthMiddleware already authenticated, use that
    if (request.token && request.user) {
      const isFirebase = request.firebaseUid != null;
      return {
        type: isFirebase ? 'firebase' : 'lp_sso',
        firebaseUid: request.firebaseUid,
        lpToken: request.token,
        user: request.user,
        accountId: request.token?.accountId || request.params?.accountId,
        isLPA: request.user?.isLPA || false,
      };
    }

    const authHeader = request?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const accountId = request?.params?.accountId;

    // Try Firebase token first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;

      // Get user from Firestore
      const userDoc = await admin.firestore()
        .collection('cc_users')
        .doc(firebaseUid)
        .get();

      const user = userDoc.exists ? userDoc.data() : null;

      return {
        type: 'firebase',
        firebaseUid,
        user,
        accountId: accountId || user?.defaultAccountId,
        isLPA: user?.isLPA || false,
      };
    } catch {
      // Firebase verification failed, try LP token
    }

    // Try LP token lookup
    try {
      const lpTokenDoc = await admin.firestore()
        .collection('lp_tokens')
        .doc(token)
        .get();

      if (lpTokenDoc.exists) {
        const lpToken = lpTokenDoc.data() as SentinelLpToken;
        return {
          type: 'lp_sso',
          lpToken,
          user: lpToken.userData,
          accountId: lpToken.accountId || accountId,
          isLPA: lpToken.userData?.isLPA || false,
        };
      }
    } catch (error) {
      console.error('LP token lookup failed:', error);
    }

    return null;
  },
);

/**
 * Decorator specifically for LP-only routes
 * Requires a valid LP token (not Firebase)
 * Returns the LP token object
 */
export const VerifyLPToken = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<SentinelLpToken | null> => {
    const request = ctx.switchToHttp().getRequest();

    // If PreAuthMiddleware set token and it's LP (no firebaseUid)
    if (request.token && !request.firebaseUid) {
      return request.token;
    }

    const authHeader = request?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const lpTokenDoc = await admin.firestore()
        .collection('lp_tokens')
        .doc(token)
        .get();

      if (lpTokenDoc.exists) {
        return lpTokenDoc.data() as SentinelLpToken;
      }
    } catch (error) {
      console.error('LP token lookup failed:', error);
    }

    return null;
  },
);

export const VerifyPermissions = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const authService = new AuthService();

    const { roles, permissions } = _data as {
      roles: string[];
      permissions: string[];
    };
    const request = ctx.switchToHttp().getRequest();
    const bearer = request?.headers?.authorization?.replace('Bearer ', '');
    const token = await authService.getLPToken(bearer);

    if (!token) {
      return null;
    }

    console.info(['VerifyPermissions', 'token', token]);
    const user = request.user || token.userData;
    console.info('user', user);
    if (
      roles &&
      roles.length > 0 &&
      !roles.some((role) => user.roles?.includes(role))
    ) {
      return null;
    }
    if (
      permissions &&
      permissions.length > 0 &&
      !permissions.some((permission) => user.permissions?.includes(permission))
    ) {
      return null;
    }
    return user;
  },
);
