/**
 * LP Extend Auth Guard (v2)
 *
 * Guards routes that require authentication.
 * Works with the LpExtendAuthMiddleware.
 *
 * Features:
 * - Respects @Public() decorator for public routes
 * - Respects @RequiresApi() decorator for API access checks
 * - Throws UnauthorizedException if auth is required but missing
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { LpExtendAuthRequest } from './lpextend-auth.middleware';
import { IS_PUBLIC_KEY, REQUIRED_APIS_KEY } from './lpextend-auth.decorators';

@Injectable()
export class LpExtendAuthGuard implements CanActivate {
  constructor(
    @InjectPinoLogger(LpExtendAuthGuard.name)
    private readonly logger: PinoLogger,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const debug = process.env.LP_EXTEND_DEBUG === 'true';
    const request = context.switchToHttp().getRequest<LpExtendAuthRequest>();

    if (debug) {
      this.logger.info({
        step: 'GUARD_CHECK',
        path: request.path,
        method: request.method,
        hasAuth: !!request.auth,
        headers: {
          'x-extend-token': request.headers['x-extend-token'] ? `[${(request.headers['x-extend-token'] as string).length} chars]` : null,
          authorization: request.headers['authorization'] ? `Bearer [${(request.headers['authorization'] as string).length - 7} chars]` : null,
        },
      }, '🛡️ [DEBUG] Guard checking request');
    }

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      if (debug) {
        this.logger.info({ path: request.path }, '✅ [DEBUG] Route is public, allowing');
      }
      return true;
    }

    // Get the auth context
    const auth = request.auth;

    if (debug) {
      this.logger.info({
        hasAuth: !!auth,
        authDetails: auth ? {
          lpUserId: auth.lpUserId,
          lpAccountId: auth.lpAccountId,
          isLPA: auth.isLPA,
          hasLpAccessToken: !!auth.lpAccessToken,
          allowedApis: auth.allowedApis,
          expiresAt: auth.expiresAt,
          expiresIn: auth.expiresAt ? `${Math.round((auth.expiresAt - Date.now()) / 1000)}s` : null,
        } : null,
      }, '📦 [DEBUG] Auth context');
    }

    // Check if authenticated
    if (!auth || !auth.lpUserId) {
      this.logger.error({
        path: request.path,
        hasAuth: !!auth,
        hasXExtendToken: !!request.headers['x-extend-token'],
        hasAuthorization: !!request.headers['authorization'],
      }, '❌ Request rejected - no auth context. Make sure X-Extend-Token header is being sent.');
      throw new UnauthorizedException('Authentication required');
    }

    // Check if auth has expired
    if (auth.expiresAt < Date.now()) {
      this.logger.error({
        path: request.path,
        userId: auth.lpUserId,
        expiresAt: new Date(auth.expiresAt).toISOString(),
        expiredAgo: `${Math.round((Date.now() - auth.expiresAt) / 1000)}s`,
      }, '❌ Request rejected - auth expired');
      throw new UnauthorizedException('Session has expired');
    }

    // Check required APIs
    const requiredApis = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_APIS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredApis && requiredApis.length > 0) {
      const missingApis = requiredApis.filter(
        (api) => !auth.allowedApis.includes(api),
      );

      if (missingApis.length > 0) {
        this.logger.warn(
          {
            path: request.path,
            userId: auth.lpUserId,
            requiredApis,
            missingApis,
            allowedApis: auth.allowedApis,
          },
          '❌ Request rejected - missing API access',
        );
        throw new ForbiddenException(
          `This app does not have access to: ${missingApis.join(', ')}`,
        );
      }
    }

    if (debug) {
      this.logger.info({
        path: request.path,
        userId: auth.lpUserId,
        accountId: auth.lpAccountId,
      }, '✅ [DEBUG] Guard passed - request authorized');
    }

    return true;
  }
}
