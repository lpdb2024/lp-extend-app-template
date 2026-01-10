import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserData } from 'src/Controllers/users/users.interfaces';
import type { SentinelLpToken } from '@lpextend/client-sdk';


@Injectable()
export class AuthService {
  async getFirebaseUser(uid: string) {
    const firebaseUser = await admin.auth().getUser(uid);
    return firebaseUser;
  }

  async getUser(uid: string): Promise<UserData> {
    const user = await admin.firestore().collection('users').doc(uid).get();
    return user.data() as UserData;
  }
  async getLPToken (token: string): Promise<SentinelLpToken> { 
    const lpTokenInfo = await admin.firestore().collection('lp_tokens').doc(token).get();
    return lpTokenInfo.data() as SentinelLpToken;
    // const lpTokenInfo = await admin.firestore().collection('tokens').where(admin.firestore.FieldPath.documentId(), '==', token).get();
  }

  async createUser(data: any) {
    const user = await admin.auth().createUser(data);
    return user;
  }
}

export const VerifyPermissionsFireBase = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    console.info('**************')
    const authService = new AuthService()
    const { roles, permissions } = _data as { roles: string[], permissions: string[] };
    const request = ctx.switchToHttp().getRequest();
    const bearer =  request.headers.authorization.replace('Bearer ', '');
    const token = await authService.getLPToken(bearer);
    console.info('##token##', token.uid)
    if (!token) {
      return null;
    }
    // const d = await admin
    //   .auth()
    //   .verifyIdToken('token');
    
    const user = await authService.getUser(token.uid);
    console.info(user)
    if (roles && roles.length > 0 && !roles.some(role => user.roles.includes(role))) {
      return null;
    }
    if (permissions && permissions.length > 0 && !permissions.some(permission => user.permissions.includes(permission))) {
      return null;
    }
    return user
  },
);

export const VerifyUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const authService = new AuthService()

    const { roles, permissions } = _data as { roles: string[], permissions: string[] };
    const request = ctx.switchToHttp().getRequest();
    const bearer =  request.headers.authorization.replace('Bearer ', '');
    const token = await authService.getLPToken(bearer);
    console.info('[VerifyUser] Token retrieved:', {
      hasToken: !!token,
      hasCbToken: !!token?.cbToken,
      hasCbOrg: !!token?.cbOrg,
      cbOrg: token?.cbOrg,
      cbTokenLength: token?.cbToken?.length,
    });
    if (!token) {
      return null;
    }
    // const d = await admin
    //   .auth()
    //   .verifyIdToken('token');


    const user: UserData = token.userData || await new AuthService().getUser(token.uid);
    console.info('[VerifyUser] Role check:', {
      requiredRoles: roles,
      userRoles: user?.roles,
      hasRequiredRole: roles && roles.length > 0 ? roles.some(role => user?.roles?.includes(role)) : 'no roles required',
    });
    if (roles && roles.length > 0 && !roles.some(role => user?.roles?.includes(role))) {
      console.warn('[VerifyUser] Role check FAILED - returning null');
      return null;
    }
    if (permissions && permissions.length > 0 && !permissions.some(permission => user?.permissions?.includes(permission))) {
      console.warn('[VerifyUser] Permission check FAILED - returning null');
      return null;
    }
    return token
  },
);

export const VerifyPermissions = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const authService = new AuthService()

    const { roles, permissions } = _data as { roles: string[], permissions: string[] };
    const request = ctx.switchToHttp().getRequest();
    const bearer =  request.headers.authorization.replace('Bearer ', '');
    const token = await authService.getLPToken(bearer);
    if (!token) {
      return null;
    }
    // const d = await admin
    //   .auth()
    //   .verifyIdToken('token');
    
    
    const user = token.userData || await new AuthService().getUser(token.uid);
    if (roles && roles.length > 0 && !roles.some(role => user.roles.includes(role))) {
      return null;
    }
    if (permissions && permissions.length > 0 && !permissions.some(permission => user.permissions.includes(permission))) {
      return null;
    }
    return user
  },
);
