/**
 * Authentication Guard Boot File
 * Handles route protection using Firebase authentication (primary) or LP SSO (fallback)
 *
 * IMPORTANT: Firebase login does NOT grant LP account access automatically.
 * Users must either:
 * - Complete LP SSO to get an active LP session, OR
 * - Have LP open in another tab (shared session)
 *
 * Auth Flow (Standalone Mode):
 * 1. Firebase Login → Load user profile from backend
 * 2. If no defaultAccountId → Redirect to account-setup page
 * 3. If has defaultAccountId → Allow navigation to LP routes (LP calls may still fail without LP session)
 * 4. Fallback to LP SSO for legacy users
 *
 * Auth Flow (Shell Mode - running in LP Extend iframe):
 * 1. Shell provides auth token via PostMessage
 * 2. Token is validated and used for API calls
 * 3. No login page needed - shell handles auth
 */

import { boot } from "quasar/wrappers";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { useUserStore } from "src/stores/store-user";
import { Notify } from "quasar";
import { isInShellMode, isShellAuthenticated, getShellToken } from "src/services/shell-auth.service";

import {
  ROUTE_NAMES,
  ROUTE_TITLES,
  TITLE_SUFFIX,
} from "src/constants/constants";

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
 * Check if LP token is expired (legacy SSO flow)
 */
function isLpTokenExpired(): boolean {
  const exp = useUserStore().auth?.expiresAt;
  if (!exp) return true;
  const now = new Date().getTime();
  if (logging) console.info("LP token exp:", exp, "now:", now);
  return now > exp;
}

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
  // ROUTE_NAMES.ADMINISTRATION,
  ROUTE_NAMES.CONV_CLOUD_CONFIG,
  // Add other LP-specific routes here
];

export default boot(({ router }) => {
  router.beforeEach(async (to, from) => {
    const firebaseAuth = useFirebaseAuthStore();
    const userStore = useUserStore();

    // Set page title
    const title = ROUTE_TITLES[to.name as ROUTE_NAMES];
    const pageTitle = title ? `${TITLE_SUFFIX} | ${title}` : TITLE_SUFFIX;
    document.title = pageTitle;
    if (logging) console.info("AuthGuard - Title:", pageTitle, "Route:", to.name);

    // Track when leaving login page
    if (from.name === ROUTE_NAMES.LOGIN && to.name !== ROUTE_NAMES.LOGIN) {
      userStore.onLoginPage = false;
    }

    // Handle protected routes
    if (to.meta.requiresAuth) {
      // SHELL MODE: If running in LP Extend iframe, use shell auth
      if (isInShellMode.value) {
        if (logging) console.info("AuthGuard - Running in SHELL mode");

        // Check if shell has provided a valid token
        if (isShellAuthenticated.value && getShellToken()) {
          if (logging) console.info("AuthGuard - Shell authenticated, allowing access");
          return true;
        }

        // Shell mode but no token yet - wait for token with retries
        // The shell token generation is async via PostMessage and backend API call
        if (logging) console.info("AuthGuard - Shell mode but no token yet, waiting...");

        // Wait for shell token with exponential backoff (total ~5 seconds max)
        const maxRetries = 10;
        const baseDelay = 200; // Start with 200ms

        for (let i = 0; i < maxRetries; i++) {
          await new Promise((resolve) => setTimeout(resolve, baseDelay + (i * 100)));

          if (isShellAuthenticated.value && getShellToken()) {
            if (logging) console.info(`AuthGuard - Shell token received after ${i + 1} attempts`);
            return true;
          }
        }

        // Still no token - shell has auth issues, but don't block in shell mode
        // Instead, return true and let the app handle showing appropriate UI
        // This prevents showing the login page in shell mode
        if (logging) console.info("AuthGuard - Shell auth still pending, allowing navigation (shell will handle auth UI)");

        // In shell mode, we trust the shell to handle auth - don't redirect to login
        // The shell should eventually provide a token or show its own error
        return true;
      }

      // STANDALONE MODE: Use Firebase/LP SSO auth
      // Initialize Firebase auth listener if still loading
      if (firebaseAuth.isLoading) {
        await firebaseAuth.initAuthListener();
      }

      // Check Firebase authentication first (primary auth method)
      const isFirebaseAuth = firebaseAuth.isAuthenticated && firebaseAuth.user;

      if (isFirebaseAuth) {
        if (logging) console.info("AuthGuard - Firebase authenticated");

        // Fetch app user profile if not already loaded
        if (!firebaseAuth.appUser) {
          await firebaseAuth.fetchAppUserProfile();
        }

        const defaultAccountId = firebaseAuth.defaultAccountId;
        const routeAccountId = to.params.accountId as string;
        const requiresLpAccount = LP_ACCOUNT_REQUIRED_ROUTES.includes(to.name as string);
        const hasActiveLpSession = firebaseAuth.hasActiveLpSession;

        if (logging) {
          console.info("AuthGuard - defaultAccountId:", defaultAccountId);
          console.info("AuthGuard - routeAccountId:", routeAccountId);
          console.info("AuthGuard - requiresLpAccount:", requiresLpAccount);
          console.info("AuthGuard - hasActiveLpSession:", hasActiveLpSession);
        }

        // Going to index (home page) - allow access
        // The home page shows all available apps and handles LP connection status itself
        if (to.name === ROUTE_NAMES.INDEX) {
          if (logging) console.info("AuthGuard - Allowing access to home page");
          return true;
        }

        // Redirect from APP base route (landing page) to home
        // Users should start from the home page and select apps from there
        if (to.name === ROUTE_NAMES.APPS) {
          if (logging) console.info("AuthGuard - Redirecting from APPS landing to home", to);
          return { name: ROUTE_NAMES.INDEX };
        }

        // Route requires LP account but user doesn't have one set
        if (requiresLpAccount && !defaultAccountId && to.name !== ROUTE_NAMES.ACCOUNT_SETUP) {
          if (logging) console.info("AuthGuard - No default account, redirecting to account-setup");
          return { name: ROUTE_NAMES.ACCOUNT_SETUP, query: { redirect: to.fullPath } };
        }

        // Route has accountId param but doesn't match user's accounts
        if (routeAccountId && firebaseAuth.appUser) {
          const linkedAccounts = firebaseAuth.linkedAccounts;
          if (linkedAccounts.length > 0 && !linkedAccounts.includes(routeAccountId)) {
            if (logging) console.info("AuthGuard - Account not linked:", routeAccountId);
            // User is trying to access an account they don't have linked
            // For now, allow it (they may need to complete LP SSO for this account)
          }
        }

        // Route requires accountId but none provided - use default
        if (requiresLpAccount && !routeAccountId && defaultAccountId) {
          if (logging) console.info("AuthGuard - Adding defaultAccountId to route");
          // Set account ID in user store for API calls
          userStore.setaccountId(defaultAccountId);
          return {
            ...to,
            params: { ...to.params, accountId: defaultAccountId },
          };
        }

        // If route has accountId, ensure user store is updated
        if (routeAccountId) {
          userStore.setaccountId(routeAccountId);
        } else if (defaultAccountId) {
          userStore.setaccountId(defaultAccountId);
        }

        // Check if route requires active LP connection (SSO session)
        const requiresLpConnection = to.meta.requiresLpConnection as boolean;
        if (requiresLpConnection && !hasActiveLpSession) {
          if (logging) console.info("AuthGuard - Route requires LP connection but no active session");

          // Show notification to user
          Notify.create({
            type: "warning",
            message: "LP Connection Required",
            caption: "Please connect to LivePerson to access this feature",
            timeout: 4000,
            position: "top",
            actions: [
              { label: "Connect", color: "white", handler: () => {
                // User can use the header button to connect
              }},
            ],
          });

          // Redirect to index page
          return { name: ROUTE_NAMES.INDEX };
        }

        // Firebase authenticated - allow access
        if (logging) console.info("AuthGuard - Firebase auth valid for:", to.name);
        return true;
      }

      // Fallback: Check legacy LP SSO authentication
      const isLpExpired = isLpTokenExpired();
      const accountId = userStore.accountId;

      if (isLpExpired) {
        if (logging) console.info("AuthGuard - No valid auth, redirecting to login");
        // Redirect to login with the original destination as redirect param
        const redirectPath = to.fullPath === "/" ? undefined : to.fullPath;
        return loginRoute(accountId, redirectPath);
      }

      // LP SSO auth - verify user exists
      const user = await userStore.getSelf();
      if (!user) {
        if (logging) console.info("AuthGuard - LP user not found, redirecting to login");
        const redirectPath = to.fullPath === "/" ? undefined : to.fullPath;
        return loginRoute(accountId, redirectPath);
      }

      if (logging) console.info("AuthGuard - LP SSO auth valid for:", to.name);
    }

    // Non-protected route or auth valid - allow navigation
    return true;
  });
});
