/**
 * LP Extend SDK Service
 *
 * Provides access to LivePerson APIs via the @lp-extend/client-sdk.
 * The SDK makes HTTP calls to the shell backend which handles auth and scope enforcement.
 *
 * @example
 * ```typescript
 * import { getSDK, initSDK } from 'src/services/LPExtendSDKService';
 *
 * // Initialize once (async)
 * await initSDK({ accessToken: lpToken });
 *
 * // Then use throughout app
 * const sdk = getSDK();
 * const { data: skills } = await sdk.skills.getAll();
 * ```
 */

import { initializeSDK, LPExtendSDK } from '@lpextend/client-sdk'
import type { LPExtendSDKConfig } from '@lpextend/client-sdk'
import { useUserStore } from 'src/stores/store-user'

// Re-export types and classes for convenience
export { initializeSDK, LPExtendSDK }
export type { LPExtendSDKConfig }

// Singleton SDK instance
let sdkInstance: LPExtendSDK | null = null
let initPromise: Promise<LPExtendSDK> | null = null

/**
 * SDK Service configuration
 */
export interface SDKServiceConfig {
  /** App ID for registration */
  appId?: string
  /** Account ID */
  accountId?: string
  /** LP Access token (required for new SDK) */
  accessToken?: string
  /** Shell backend base URL (auto-detected if not provided) */
  shellBaseUrl?: string
  /** Enable debug logging */
  debug?: boolean
  /** Scopes to request */
  scopes?: string[]
}

/**
 * Default scopes for the SDK
 * These map to lpApiAccess fields in app registration
 */
const DEFAULT_SCOPES = [
  'skills',
  'users',
  'agentGroups',
]

/**
 * Initialize the SDK (async)
 *
 * Must be called before using getSDK(). This validates app registration
 * with the shell backend and returns granted scopes.
 *
 * @param config - Configuration with accessToken required
 * @returns Promise resolving to SDK instance
 *
 * @example
 * ```typescript
 * const sdk = await initSDK({
 *   accessToken: userStore.accessToken,
 *   scopes: ['skills', 'users'],
 * });
 *
 * // Check what scopes were granted
 * console.log('Granted:', sdk.grantedScopes);
 * ```
 */
export async function initSDK(config: SDKServiceConfig = {}): Promise<LPExtendSDK> {
  // Return existing instance if available
  if (sdkInstance) {
    return sdkInstance
  }

  // Return pending init if in progress
  if (initPromise) {
    return initPromise
  }

  const userStore = useUserStore()

  // Get URL params (shell passes context via URL)
  const urlParams = new URLSearchParams(window.location.search)

  const accountId =
    config.accountId ||
    userStore.accountId ||
    urlParams.get('accountId') ||
    sessionStorage.getItem('accountId') ||
    ''

  // Get access token from multiple sources:
  // 1. Explicit config
  // 2. User store
  // 3. URL params (shellToken from parent shell)
  // 4. Session storage
  const accessToken =
    config.accessToken ||
    userStore.accessToken ||
    urlParams.get('shellToken') ||
    sessionStorage.getItem('lp_access_token') ||
    ''

  if (!accountId) {
    throw new Error('Account ID is required. Set it in config or ensure user is authenticated.')
  }

  if (!accessToken) {
    throw new Error('Access token is required. Pass it in config or ensure user is authenticated.')
  }

  // Get shell base URL from URL params or config
  const shellBaseUrl =
    config.shellBaseUrl ||
    urlParams.get('shellOrigin') ||
    (window.parent !== window ? document.referrer : undefined)

  // Build config - use type assertion since we're bridging old/new SDK
  const sdkConfig = {
    appId: config.appId || urlParams.get('appId') || 'lp-extend-app',
    accountId,
    accessToken,
    shellBaseUrl,
    debug: config.debug ?? import.meta.env.DEV,
    scopes: config.scopes || DEFAULT_SCOPES,
  } as LPExtendSDKConfig & { accessToken: string; shellBaseUrl?: string }

  // Start initialization - initializeSDK is now async
  initPromise = Promise.resolve(initializeSDK(sdkConfig as LPExtendSDKConfig))

  try {
    sdkInstance = await initPromise
    // Log granted scopes if available (new SDK)
    const grantedScopes = (sdkInstance as unknown as { grantedScopes?: string[] }).grantedScopes
    if (grantedScopes) {
      console.log('[LPExtendSDKService] SDK initialized, granted scopes:', grantedScopes)
    } else {
      console.log('[LPExtendSDKService] SDK initialized')
    }
    return sdkInstance
  } catch (error) {
    initPromise = null
    throw error
  }
}

/**
 * Get the SDK instance (must call initSDK first)
 *
 * @returns The SDK instance
 * @throws Error if SDK not initialized
 *
 * @example
 * ```typescript
 * const sdk = getSDK();
 * const skills = await sdk.skills.getAll();
 * ```
 */
export function getSDK(): LPExtendSDK {
  if (!sdkInstance) {
    throw new Error('SDK not initialized. Call initSDK() first.')
  }
  return sdkInstance
}

/**
 * Check if SDK is initialized
 */
export function isSDKInitialized(): boolean {
  return sdkInstance !== null
}

/**
 * Reset the SDK instance (useful when account changes or logout)
 */
export function resetSDK(): void {
  sdkInstance = null
  initPromise = null
}

/**
 * Get current account ID
 */
export function getAccountId(): string | null {
  if (sdkInstance) {
    return sdkInstance.accountId
  }
  const userStore = useUserStore()
  return userStore.accountId || sessionStorage.getItem('accountId')
}

/**
 * Check if SDK has a specific scope
 */
export function hasScope(scope: string): boolean {
  if (!sdkInstance) {
    return false
  }
  // Use type assertion for new SDK method
  const sdk = sdkInstance as unknown as { hasScope?: (scope: string) => boolean }
  if (typeof sdk.hasScope === 'function') {
    return sdk.hasScope(scope)
  }
  return true // Fallback for old SDK
}
