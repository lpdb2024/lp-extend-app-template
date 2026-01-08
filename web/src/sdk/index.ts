/**
 * LP App Template SDK
 *
 * This module provides authentication tools for child apps:
 *
 * 1. LpAppAuth (Recommended) - Unified auth supporting both strategies
 *    - 'shell' strategy: Uses shell-delegated tokens (no LP app registration needed)
 *    - 'independent' strategy: App manages own LP auth (has login page)
 *    - Same API for both strategies - switch via config
 *
 * 2. LpAuth - Standalone LP authentication (lower-level)
 *    - For independent auth strategy
 *    - Handles SSO and direct login
 *    - Each app manages its own LP session
 *
 * 3. ShellClient - For shell-delegated tokens (lower-level)
 *    - For shell auth strategy
 *    - Requests scoped tokens from shell backend
 *    - More restrictive permissions than full LP token
 */

// Primary: Unified App Auth (supports both shell and independent strategies)
export {
  LpAppAuth,
  useLpAppAuth,
  createLpAppAuthFromEnv,
  type LpAppAuthConfig,
  type AppSession,
  type AuthStrategy,
} from './lp-app-auth';

// Standalone LP Authentication (for independent strategy)
export {
  LpAuth,
  useLpAuth,
  createLpAuthFromEnv,
  type LpAuthConfig,
  type LpSession,
  type LpAuthResponse,
  type ShellContext,
} from './lp-auth';

// Shell Client (for shell strategy)
export {
  ShellClient,
  useShellClient,
  createShellClientFromEnv,
  type ShellClientConfig,
  type TokenResponse,
  type TokenVerifyResponse,
} from './shell-client';
