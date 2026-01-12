/**
 * Authentication Guard Boot File
 *
 * Handles route protection using the @lpextend/client-sdk.
 * The SDK handles both shell mode (iframe) and independent mode (standalone).
 *
 * Auth Flow:
 * 1. SDK initializes and detects context (shell vs standalone)
 * 2. Shell mode: Uses ExtendJWT or shell tokens from parent
 * 3. Independent mode: Uses LP SSO OAuth flow
 * 4. Auth guard checks SDK authentication state before allowing navigation
 */

import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';
import { getAppAuthInstance, isAppAuthInitialized } from '@lpextend/client-sdk';
import { useUserStore } from 'src/stores/store-user';
import {
  ROUTE_NAMES,
  ROUTE_TITLES,
  TITLE_SUFFIX,
} from 'src/constants/constants';

const logging = true; // Enable for debugging

/**
 * Generate login route with optional redirect
 */
const loginRoute = (
  accountId?: string | null,
  redirect?: string | null
) => {
  const r: { name: string; query: Record<string, string> } = {
    name: ROUTE_NAMES.LOGIN,
    query: {},
  };
  if (accountId) {
    r.query.accountId = accountId;
  }
  if (redirect) {
    r.query.redirect = redirect;
  }
  return r;
};

/**
 * Routes that require an LP account to be set
 */
const LP_ACCOUNT_REQUIRED_ROUTES: string[] = [
  ROUTE_NAMES.APP,
  ROUTE_NAMES.CONVERSATION_MANAGER,
  ROUTE_NAMES.CONVERSATION_TESTER,
  ROUTE_NAMES.CONVERSATION_DEBUGGER,
  ROUTE_NAMES.BACKUP_DEPLOY,
  ROUTE_NAMES.SITE_SETTINGS,
  ROUTE_NAMES.CONV_CLOUD_CONFIG,
];

/**
 * Wait for SDK auth to be initialized with timeout
 */
async function waitForAuthInit(maxWaitMs = 5000): Promise<boolean> {
  const startTime = Date.now();
  const checkInterval = 100;

  while (!isAppAuthInitialized() && (Date.now() - startTime) < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  return isAppAuthInitialized();
}

export default boot(({ router }) => {
  router.beforeEach(async (to, from) => {
    const auth = getAppAuthInstance();
    const userStore = useUserStore();

    // Set page title
    const title = ROUTE_TITLES[to.name as ROUTE_NAMES];
    const pageTitle = title ? `${TITLE_SUFFIX} | ${title}` : TITLE_SUFFIX;
    document.title = pageTitle;
    if (logging) console.info('[AuthGuard] Title:', pageTitle, 'Route:', to.name);

    // Track when leaving login page
    if (from.name === ROUTE_NAMES.LOGIN && to.name !== ROUTE_NAMES.LOGIN) {
      userStore.onLoginPage = false;
    }

    // Handle protected routes
    if (to.meta.requiresAuth) {
      // Wait for SDK to initialize
      if (!isAppAuthInitialized()) {
        if (logging) console.info('[AuthGuard] Waiting for SDK to initialize...');
        const initialized = await waitForAuthInit();
        if (!initialized) {
          console.warn('[AuthGuard] SDK init timeout, proceeding with check');
        }
      }

      const isInShell = auth.isInShell();
      const isAuthenticated = auth.isAuthenticated();
      const strategy = auth.getStrategy();

      if (logging) {
        console.info('[AuthGuard] Auth state:', {
          strategy,
          isInShell,
          isAuthenticated,
          accountId: auth.getAccountId(),
        });
      }

      // SHELL MODE: Trust the shell for auth
      if (isInShell) {
        if (logging) console.info('[AuthGuard] Running in SHELL mode');

        if (isAuthenticated) {
          if (logging) console.info('[AuthGuard] Shell authenticated, allowing access');
          // Update user store with account ID from shell
          const shellAccountId = auth.getAccountId();
          if (shellAccountId) {
            userStore.setaccountId(shellAccountId);
          }
          return true;
        }

        // Shell mode but not authenticated yet - wait for token
        if (logging) console.info('[AuthGuard] Shell mode, waiting for authentication...');

        // Wait for shell auth with faster polling (50ms intervals, max 3 seconds)
        const maxWaitMs = 3000;
        const pollInterval = 50;
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitMs) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval));

          if (auth.isAuthenticated()) {
            const elapsed = Date.now() - startTime;
            if (logging) console.info(`[AuthGuard] Shell authenticated after ${elapsed}ms`);
            const shellAccountId = auth.getAccountId();
            if (shellAccountId) {
              userStore.setaccountId(shellAccountId);
            }
            return true;
          }
        }

        // Still not authenticated - in shell mode, let the shell handle auth UI
        if (logging) console.info('[AuthGuard] Shell auth pending, allowing navigation');
        return true;
      }

      // STANDALONE/INDEPENDENT MODE: Check SDK authentication
      if (isAuthenticated) {
        if (logging) console.info('[AuthGuard] SDK authenticated');

        const accountId = auth.getAccountId();
        const routeAccountId = to.params.accountId as string;
        const requiresLpAccount = LP_ACCOUNT_REQUIRED_ROUTES.includes(to.name as string);

        if (logging) {
          console.info('[AuthGuard] accountId:', accountId);
          console.info('[AuthGuard] routeAccountId:', routeAccountId);
          console.info('[AuthGuard] requiresLpAccount:', requiresLpAccount);
        }

        // Going to index (home page) - allow access
        if (to.name === ROUTE_NAMES.INDEX) {
          if (logging) console.info('[AuthGuard] Allowing access to home page');
          return true;
        }

        // Redirect from APP base route to home
        if (to.name === ROUTE_NAMES.APPS) {
          if (logging) console.info('[AuthGuard] Redirecting from APPS to home');
          return { name: ROUTE_NAMES.INDEX };
        }

        // Route requires LP account but none set
        if (requiresLpAccount && !accountId && to.name !== ROUTE_NAMES.ACCOUNT_SETUP) {
          if (logging) console.info('[AuthGuard] No account, redirecting to account-setup');
          return { name: ROUTE_NAMES.ACCOUNT_SETUP, query: { redirect: to.fullPath } };
        }

        // Route requires accountId but none provided - use current
        if (requiresLpAccount && !routeAccountId && accountId) {
          if (logging) console.info('[AuthGuard] Adding accountId to route');
          userStore.setaccountId(accountId);
          return {
            ...to,
            params: { ...to.params, accountId },
          };
        }

        // Update user store with account ID
        if (routeAccountId) {
          userStore.setaccountId(routeAccountId);
        } else if (accountId) {
          userStore.setaccountId(accountId);
        }

        // Check if route requires active LP connection
        const requiresLpConnection = to.meta.requiresLpConnection as boolean;
        if (requiresLpConnection && !auth.getAccessToken()) {
          if (logging) console.info('[AuthGuard] Route requires LP connection but no token');

          Notify.create({
            type: 'warning',
            message: 'LP Connection Required',
            caption: 'Please connect to LivePerson to access this feature',
            timeout: 4000,
            position: 'top',
          });

          return { name: ROUTE_NAMES.INDEX };
        }

        if (logging) console.info('[AuthGuard] Auth valid, allowing access');
        return true;
      }

      // Not authenticated - redirect to login
      if (logging) console.info('[AuthGuard] Not authenticated, redirecting to login');
      const redirectPath = to.fullPath === '/' ? undefined : to.fullPath;
      return loginRoute(auth.getAccountId(), redirectPath);
    }

    // Non-protected route - allow navigation
    return true;
  });
});
