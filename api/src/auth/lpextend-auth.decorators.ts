/**
 * LP Extend Auth Decorators (v2)
 *
 * Decorators for accessing auth context in controllers.
 * Use with the LpExtendAuthMiddleware.
 */

import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { LpExtendAuthRequest } from './lpextend-auth.middleware';
import { LpExtendAuthContext } from './lpextend-auth.service';

/**
 * Get the full auth context from the request
 *
 * @example
 * @Get('profile')
 * getProfile(@LpExtendAuth() auth: LpExtendAuthContext) {
 *   return { userId: auth.lpUserId };
 * }
 */
export const LpExtendAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): LpExtendAuthContext | undefined => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth;
  },
);

/**
 * Get the LP User ID from the auth context
 *
 * @example
 * @Get('profile')
 * getProfile(@LpUserId() userId: string) {
 *   return { userId };
 * }
 */
export const LpUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.lpUserId;
  },
);

/**
 * Get the LP Account ID from the auth context
 *
 * @example
 * @Get('account')
 * getAccount(@LpAccountId() accountId: string) {
 *   return { accountId };
 * }
 */
export const LpAccountId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.lpAccountId;
  },
);

/**
 * Get the LP Access Token from the auth context
 * Use this to make authenticated LP API calls
 *
 * @example
 * @Get('skills')
 * async getSkills(@LpAccessToken() token: string, @LpAccountId() accountId: string) {
 *   return this.lpApi.getSkills(accountId, token);
 * }
 */
export const LpAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.lpAccessToken;
  },
);

/**
 * Get the CB (Conversation Builder) token from the auth context
 *
 * @example
 * @Get('bots')
 * async getBots(@CbToken() cbToken: string, @CbOrg() cbOrg: string) {
 *   return this.cbApi.getBots(cbOrg, cbToken);
 * }
 */
export const CbToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.cbToken;
  },
);

/**
 * Get the CB Organization ID from the auth context
 */
export const CbOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.cbOrg;
  },
);

/**
 * Check if the user is an LPA (LivePerson Administrator)
 */
export const IsLPA = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.isLPA || false;
  },
);

/**
 * Get the list of allowed LP APIs for this app
 */
export const AllowedApis = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest<LpExtendAuthRequest>();
    return request.auth?.allowedApis || [];
  },
);

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (no auth required)
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Metadata key for required APIs
 */
export const REQUIRED_APIS_KEY = 'requiredApis';

/**
 * Require specific LP API access for a route
 * The guard will check if the app has access to these APIs
 *
 * @example
 * @RequiresApi('skills', 'users')
 * @Get('agent-skills')
 * getAgentSkills() {
 *   // Only accessible if app has both 'skills' and 'users' API access
 * }
 */
export const RequiresApi = (...apis: string[]) =>
  SetMetadata(REQUIRED_APIS_KEY, apis);
