/**
 * IDP Controller
 *
 * Provides authentication endpoints for standalone (non-shell) apps.
 * These endpoints match the contract expected by @lpextend/client-sdk's
 * independent auth strategy.
 *
 * Supports two auth methods:
 * 1. Agent Login — username/password via LP Login Service API
 * 2. SSO — OAuth2 flow via LP Sentinel (requires client_id/secret)
 *
 * After successful authentication, a signed + encrypted httpOnly cookie
 * is set containing the session (CC token, CB token, userId, accountId).
 * No database required — session lives entirely in the cookie.
 *
 * All endpoints are @Public() since the user is not yet authenticated.
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { HelperService } from '../Controllers/HelperService/helper-service.service';
import { ConversationBuilderService } from '../Controllers/LivePerson/ConversationBuilder/cb.service';
import { Public } from './lpextend-auth.decorators';
import { encryptSession, decryptSession, type SessionPayload } from './session-crypto';

/** Cookie name for the encrypted session */
const SESSION_COOKIE = 'lp_session';

/** Cookie max-age matches LP token TTL (default 1 hour) */
const DEFAULT_TTL_SECONDS = 3600;

@Controller('api/v1/idp')
export class IdpController {
  private readonly cookieSecret: string;

  constructor(
    @InjectPinoLogger(IdpController.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly helperService: HelperService,
    private readonly cbService: ConversationBuilderService,
  ) {
    this.cookieSecret =
      this.configService.get<string>('COOKIE_SECRET') ||
      'lp-extend-default-secret-change-in-production';
  }

  // ─── Session Cookie Helpers ─────────────────────────────────────────

  /**
   * Set the encrypted session cookie on the response
   */
  private setSessionCookie(res: Response, payload: SessionPayload, ttlSeconds: number) {
    const encrypted = encryptSession(payload, this.cookieSecret);
    res.cookie(SESSION_COOKIE, encrypted, {
      httpOnly: true,
      signed: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ttlSeconds * 1000,
      path: '/',
    });
  }

  /**
   * Read and decrypt the session cookie from the request.
   * Returns null if missing, expired, or tampered.
   */
  private readSessionCookie(req: Request): SessionPayload | null {
    const signed = (req as unknown as Record<string, unknown>).signedCookies as Record<string, string> | undefined;
    const cookieValue = signed?.[SESSION_COOKIE];
    if (!cookieValue) return null;

    const session = decryptSession(cookieValue, this.cookieSecret);
    if (!session) return null;

    // Check expiry
    if (session.expiresAt < Date.now()) return null;

    return session;
  }

  /**
   * Clear the session cookie
   */
  private clearSessionCookie(res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  // ─── Conversation Builder Auth ──────────────────────────────────────

  /**
   * Attempt to get a CB token using the LP access token.
   * Non-blocking — returns null on failure.
   */
  private async getCbAuth(accountId: string, accessToken: string): Promise<{ cbToken: string; cbOrg: string } | null> {
    try {
      const cbAuth = await this.cbService.authenticateConversationBuilder(
        accountId,
        `Bearer ${accessToken}`,
      );
      if (cbAuth?.success && cbAuth.successResult) {
        return {
          cbToken: cbAuth.successResult.apiAccessToken,
          cbOrg: cbAuth.successResult.sessionOrganizationId,
        };
      }
    } catch (error) {
      this.logger.warn(
        { accountId, error: (error as Error).message },
        'CB auth failed (non-critical) — CB features will be unavailable',
      );
    }
    return null;
  }

  // ─── Agent Login ────────────────────────────────────────────────────

  /**
   * Agent Login — username + password
   *
   * Proxies the LP Login Service API:
   * POST https://{agentVep}/api/account/{accountId}/login?v=1.3
   *
   * On success, sets an encrypted httpOnly session cookie and returns
   * the token info (for the client-sdk to store on the frontend too).
   */
  @Public()
  @Post(':accountId/login')
  async agentLogin(
    @Param('accountId') accountId: string,
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const fn = 'agentLogin';

    if (!body.username || !body.password) {
      throw new HttpException('username and password are required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Resolve the agentVep domain via CSDS
      const domain = await this.helperService.getDomain(accountId, 'agentVep');
      if (!domain) {
        throw new HttpException(
          `Could not resolve agentVep domain for account ${accountId}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const loginUrl = `https://${domain}/api/account/${accountId}/login?v=1.3`;

      this.logger.info({ fn, accountId, loginUrl }, 'Calling LP Login Service');

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: body.username,
          password: body.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, string>;
        this.logger.error({ fn, accountId, status: response.status, errorData }, 'LP Login failed');
        throw new HttpException(
          errorData.message || `Login failed: ${response.statusText}`,
          response.status === 401 ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json() as Record<string, unknown>;
      const config = data.config as Record<string, unknown> | undefined;
      const accessToken = data.bearer as string;
      const userId = String(config?.userId ?? '');
      const loginName = (config?.loginName as string) || '';
      const ttl = parseInt(String(data.sessionTTl), 10) || DEFAULT_TTL_SECONDS;
      const isLPA = (config?.isLPA as boolean) || false;

      // Extract LP role from profiles array
      // LP Login API returns config.profiles as an array like [{ name: "Administrator" }, ...]
      const profiles = (config?.profiles as Array<{ name: string }>) || [];
      const lpRole = profiles.length > 0 ? profiles[0].name : '';

      // Check ALLOWED_LP_ROLES if configured
      const allowedRoles = this.configService.get<string>('ALLOWED_LP_ROLES');
      if (allowedRoles) {
        const roleList = allowedRoles.split(',').map((r) => r.trim()).filter(Boolean);
        if (roleList.length > 0 && !roleList.some((allowed) => profiles.some((p) => p.name === allowed))) {
          this.logger.warn(
            { fn, accountId, userId, lpRole, allowedRoles: roleList },
            'User role not in ALLOWED_LP_ROLES — access denied',
          );
          throw new HttpException(
            `Access denied. Your LP role "${lpRole}" is not authorized for this application.`,
            HttpStatus.FORBIDDEN,
          );
        }
      }

      // Attempt CB authentication (non-blocking)
      const cbAuth = await this.getCbAuth(accountId, accessToken);

      // Build session and set cookie
      const session: SessionPayload = {
        lpAccountId: accountId,
        lpUserId: userId,
        lpAccessToken: accessToken,
        isLPA,
        lpRole,
        loginName,
        cbToken: cbAuth?.cbToken,
        cbOrg: cbAuth?.cbOrg,
        expiresAt: Date.now() + ttl * 1000,
      };

      this.setSessionCookie(res, session, ttl);

      this.logger.info(
        { fn, accountId, userId, lpRole, hasCb: !!cbAuth },
        'Agent login successful — session cookie set',
      );

      // Return token info for the client-sdk (it manages its own frontend state)
      return {
        accessToken,
        expiresIn: ttl,
        decoded: {
          sub: userId,
          loginName,
          isLPA,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error({ fn, accountId, error: (error as Error).message }, 'Agent login error');
      throw new HttpException('Login failed: ' + (error as Error).message, HttpStatus.BAD_GATEWAY);
    }
  }

  // ─── SSO ────────────────────────────────────────────────────────────

  /**
   * Get SSO Login URL
   *
   * Builds the LP Sentinel OAuth2 authorize URL.
   * Requires VUE_APP_CLIENT_ID to be configured (from LP app registration).
   */
  @Public()
  @Get(':accountId/login-url')
  async getLoginUrl(
    @Param('accountId') accountId: string,
    @Query('redirect') redirect: string,
    @Query('appId') appId: string,
  ) {
    const fn = 'getLoginUrl';

    const clientId = this.configService.get<string>('VUE_APP_CLIENT_ID');
    if (!clientId) {
      throw new HttpException(
        'SSO not configured. Set VUE_APP_CLIENT_ID in your .env (from LP app registration).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    try {
      const domain = await this.helperService.getDomain(accountId, 'sentinel');
      if (!domain) {
        throw new HttpException(
          `Could not resolve sentinel domain for account ${accountId}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const authorizeUrl = new URL(`https://${domain}/sentinel/api/account/${accountId}/authorize`);
      authorizeUrl.searchParams.set('v', '1.0');
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', clientId);
      authorizeUrl.searchParams.set('redirect_uri', redirect);
      if (appId) {
        authorizeUrl.searchParams.set('state', accountId);
      }

      this.logger.info({ fn, accountId }, 'Generated SSO login URL');

      return { url: authorizeUrl.toString() };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error({ fn, accountId, error: (error as Error).message }, 'Failed to build SSO URL');
      throw new HttpException('Failed to build SSO URL', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * OAuth Token Exchange (SSO callback)
   *
   * Exchanges the authorization code for LP tokens via Sentinel.
   * Sets the session cookie on success.
   */
  @Public()
  @Post(':accountId/token')
  async exchangeToken(
    @Param('accountId') accountId: string,
    @Body() body: { code: string; redirect: string; appname?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const fn = 'exchangeToken';

    if (!body.code) {
      throw new HttpException('code is required', HttpStatus.BAD_REQUEST);
    }

    const clientId = this.configService.get<string>('VUE_APP_CLIENT_ID');
    const clientSecret = this.configService.get<string>('VUE_APP_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new HttpException(
        'SSO not configured. Set VUE_APP_CLIENT_ID and VUE_APP_CLIENT_SECRET.',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    try {
      const domain = await this.helperService.getDomain(accountId, 'sentinel');
      if (!domain) {
        throw new HttpException(
          `Could not resolve sentinel domain for account ${accountId}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const tokenUrl = `https://${domain}/sentinel/api/account/${accountId}/token?v=2.0`;

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: body.code,
          redirect_uri: body.redirect,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, string>;
        this.logger.error({ fn, accountId, status: response.status }, 'Token exchange failed');
        throw new HttpException(
          errorData.error_description || 'Token exchange failed',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const tokenData = await response.json() as Record<string, unknown>;
      const accessToken = tokenData.access_token as string;
      const ttl = (tokenData.expires_in as number) || DEFAULT_TTL_SECONDS;
      const decoded = this.decodeJwtPayload(tokenData.id_token as string);
      const userId = String(decoded?.sub ?? '');

      // Attempt CB authentication (non-blocking)
      const cbAuth = await this.getCbAuth(accountId, accessToken);

      // Build session and set cookie
      const session: SessionPayload = {
        lpAccountId: accountId,
        lpUserId: userId,
        lpAccessToken: accessToken,
        isLPA: false,
        cbToken: cbAuth?.cbToken,
        cbOrg: cbAuth?.cbOrg,
        expiresAt: Date.now() + ttl * 1000,
      };

      this.setSessionCookie(res, session, ttl);

      this.logger.info(
        { fn, accountId, userId, hasCb: !!cbAuth },
        'SSO token exchange successful — session cookie set',
      );

      // Return token info for the client-sdk
      return {
        accessToken,
        idToken: tokenData.id_token,
        expiresIn: ttl,
        expiry: Date.now() + ttl * 1000,
        decoded,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error({ fn, accountId, error: (error as Error).message }, 'Token exchange error');
      throw new HttpException('Token exchange failed', HttpStatus.BAD_GATEWAY);
    }
  }

  // ─── Session Management ─────────────────────────────────────────────

  /**
   * Get current session — returns user info if the cookie is valid.
   * The frontend calls this on page load to check login state.
   */
  @Public()
  @Get('session')
  getSession(@Req() req: Request) {
    const session = this.readSessionCookie(req);

    if (!session) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      lpAccountId: session.lpAccountId,
      lpUserId: session.lpUserId,
      isLPA: session.isLPA,
      hasCbToken: !!session.cbToken,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Logout — clear cookie and optionally revoke the LP token
   */
  @Public()
  @Post(':accountId/logout')
  async logout(
    @Param('accountId') accountId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fn = 'logout';

    // Read session to get the token for revocation
    const session = this.readSessionCookie(req);

    // Always clear the cookie
    this.clearSessionCookie(res);

    // Best-effort token revocation via Sentinel
    if (session?.lpAccessToken) {
      try {
        const domain = await this.helperService.getDomain(accountId, 'sentinel');
        if (domain) {
          const revokeUrl = `https://${domain}/sentinel/api/account/${accountId}/token/revoke?v=2.0`;
          await fetch(revokeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Bearer ${session.lpAccessToken}`,
            },
          });
          this.logger.info({ fn, accountId }, 'Token revoked');
        }
      } catch (error) {
        this.logger.warn(
          { fn, accountId, error: (error as Error).message },
          'Token revocation failed (non-critical)',
        );
      }
    }

    return { success: true };
  }

  // ─── Domain Resolution ──────────────────────────────────────────────

  /**
   * Get LP domains for an account (via CSDS)
   */
  @Public()
  @Get(':accountId/domains')
  async getDomains(@Param('accountId') accountId: string) {
    try {
      const agentVep = await this.helperService.getDomain(accountId, 'agentVep');
      const sentinel = await this.helperService.getDomain(accountId, 'sentinel');

      return {
        agentVep,
        sentinel,
        accountId,
      };
    } catch {
      throw new HttpException('Failed to resolve domains', HttpStatus.BAD_GATEWAY);
    }
  }

  // ─── Utilities ──────────────────────────────────────────────────────

  /**
   * Decode JWT payload without verification (for extracting user info from id_token)
   */
  private decodeJwtPayload(token: string | undefined): Record<string, unknown> | undefined {
    if (!token) return undefined;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return undefined;
      const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
}
