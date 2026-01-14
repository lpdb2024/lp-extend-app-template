/**
 * LP Extend Auth Middleware (v2)
 *
 * Handles authentication for child apps using the API key flow.
 * Extracts ExtendJWT from headers/cookies and verifies via shell.
 *
 * Token sources (in order of precedence):
 * 1. Authorization header: Bearer {token}
 * 2. X-LPExtend-Token header
 * 3. extend_auth cookie
 *
 * After verification, auth context is attached to request:
 * - req.auth: Full auth context (userId, accountId, lpAccessToken, etc.)
 */

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { LpExtendAuthService, LpExtendAuthContext } from './lpextend-auth.service';

// Header names
const EXTEND_TOKEN_HEADER = 'x-extend-token'; // New: from client-sdk
const EXTEND_TOKEN_HEADER_LEGACY = 'x-lpextend-token'; // Legacy
const AUTHORIZATION_HEADER = 'authorization';
const EXTEND_AUTH_COOKIE = 'extend_auth';

// Extend Express Request type
export interface LpExtendAuthRequest extends Request {
  auth?: LpExtendAuthContext;
}

@Injectable()
export class LpExtendAuthMiddleware implements NestMiddleware {
  constructor(
    @InjectPinoLogger(LpExtendAuthMiddleware.name)
    private readonly logger: PinoLogger,
    private readonly lpExtendAuthService: LpExtendAuthService,
  ) {}

  async use(req: LpExtendAuthRequest, res: Response, next: NextFunction) {
    const fn = 'LpExtendAuthMiddleware';
    const debug = process.env.LP_EXTEND_DEBUG === 'true';

    if (debug) {
      this.logger.info({
        fn,
        step: 'MIDDLEWARE_START',
        path: req.path,
        method: req.method,
        serviceEnabled: this.lpExtendAuthService.isEnabled(),
        headers: {
          'x-extend-token': req.headers['x-extend-token'] ? `[${(req.headers['x-extend-token'] as string).length} chars]` : null,
          'x-lpextend-token': req.headers['x-lpextend-token'] ? `[${(req.headers['x-lpextend-token'] as string).length} chars]` : null,
          authorization: req.headers['authorization'] ? `[${(req.headers['authorization'] as string).length} chars]` : null,
        },
        cookies: {
          extend_auth: req.cookies?.extend_auth ? `[${req.cookies.extend_auth.length} chars]` : null,
        },
      }, '🔄 [DEBUG] Middleware processing request');
    }

    // Skip if service is not enabled (will use fallback auth)
    if (!this.lpExtendAuthService.isEnabled()) {
      if (debug) {
        this.logger.warn({ fn }, '⚠️ [DEBUG] Auth service not enabled, skipping');
      }
      return next();
    }

    // Extract token from various sources
    const token = this.extractToken(req);

    if (debug) {
      this.logger.info({
        fn,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenSource: this.identifyTokenSource(req),
      }, '🔍 [DEBUG] Token extraction result');
    }

    if (!token) {
      // No token - continue without auth (controllers can handle as needed)
      if (debug) {
        this.logger.warn({ fn, path: req.path }, '⚠️ [DEBUG] No token found, continuing without auth');
      }
      return next();
    }

    try {
      // Verify token with shell
      if (debug) {
        this.logger.info({ fn }, '🔐 [DEBUG] Verifying token with shell...');
      }

      const authContext = await this.lpExtendAuthService.verifyToken(token);

      // Attach to request
      req.auth = authContext;

      this.logger.info(
        {
          fn,
          userId: authContext.lpUserId,
          accountId: authContext.lpAccountId,
          hasLpAccessToken: !!authContext.lpAccessToken,
        },
        '✅ Request authenticated successfully',
      );

      next();
    } catch (error) {
      this.logger.error(
        { fn, error: error.message, path: req.path },
        '❌ Token verification failed',
      );

      // Don't throw - let the route handle auth requirements
      // This allows public routes to work
      next();
    }
  }

  /**
   * Identify which source the token came from (for debugging)
   */
  private identifyTokenSource(req: Request): string {
    if (req.headers[EXTEND_TOKEN_HEADER]) return 'x-extend-token header';
    if (req.headers[EXTEND_TOKEN_HEADER_LEGACY]) return 'x-lpextend-token header (legacy)';
    if (req.headers[AUTHORIZATION_HEADER]) return 'authorization header';
    if ((req as any).signedCookies?.[EXTEND_AUTH_COOKIE]) return 'signed cookie';
    if (req.cookies?.[EXTEND_AUTH_COOKIE]) return 'unsigned cookie';
    return 'none';
  }

  /**
   * Extract ExtendJWT from request
   */
  private extractToken(req: Request): string | null {
    // 1. X-Extend-Token header (preferred - from client-sdk)
    const extendHeader = req.headers[EXTEND_TOKEN_HEADER];
    if (extendHeader && typeof extendHeader === 'string') {
      return extendHeader;
    }

    // 2. X-LPExtend-Token header (legacy)
    const extendHeaderLegacy = req.headers[EXTEND_TOKEN_HEADER_LEGACY];
    if (extendHeaderLegacy && typeof extendHeaderLegacy === 'string') {
      return extendHeaderLegacy;
    }

    // 3. Authorization header (Bearer token) - only if it looks like a JWT
    const authHeader = req.headers[AUTHORIZATION_HEADER];
    if (authHeader && typeof authHeader === 'string') {
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Only use if it looks like a JWT (has 3 parts)
        if (token.split('.').length === 3) {
          return token;
        }
      }
    }

    // 4. extend_auth cookie (signed or unsigned)
    const signedCookie = (req as any).signedCookies?.[EXTEND_AUTH_COOKIE];
    if (signedCookie) {
      return signedCookie;
    }

    const unsignedCookie = req.cookies?.[EXTEND_AUTH_COOKIE];
    if (unsignedCookie) {
      return unsignedCookie;
    }

    return null;
  }
}
