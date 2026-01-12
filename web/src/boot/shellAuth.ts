/**
 * Shell Auth Boot File
 *
 * Initializes the @lpextend/client-sdk early in app startup.
 * This detects if the app is running in an LP Extend shell iframe
 * and configures the appropriate auth strategy (shell or independent).
 *
 * Auth strategy is determined by VITE_AUTH_STRATEGY environment variable:
 * - 'shell': Uses shell-delegated tokens (mini-apps, no LP app registration needed)
 * - 'independent': Uses own LP auth with login page (tier-1 apps)
 */

import { boot } from 'quasar/wrappers';
import { ref, computed } from 'vue';
import {
  getAppAuthInstance,
  initAppAuth,
  isAppAuthInitialized,
  type AuthStrategy,
} from '@lpextend/client-sdk';

// Reactive state for global access
const authStrategy = ref<AuthStrategy>((import.meta.env.VITE_AUTH_STRATEGY as AuthStrategy) || 'independent');
const isInShellMode = computed(() => {
  const auth = getAppAuthInstance();
  return auth.isInShell();
});

export default boot(({ app }) => {
  const bootStart = Date.now();
  console.log('[ShellAuthBoot] Starting auth init...', bootStart);

  // Get the LpAppAuth instance (will be initialized)
  const auth = getAppAuthInstance();

  // Initialize auth early - this sets isInitialized when complete
  void initAppAuth().then((authenticated: boolean) => {
    const elapsed = Date.now() - bootStart;
    if (authenticated) {
      console.log(`[ShellAuthBoot] User is authenticated (${elapsed}ms)`);
    } else {
      console.log(`[ShellAuthBoot] User is not authenticated (${elapsed}ms)`);
    }
  }).catch((error: Error) => {
    const elapsed = Date.now() - bootStart;
    console.error(`[ShellAuthBoot] Auth initialization failed (${elapsed}ms):`, error);
  });

  // Make auth state available globally via provide/inject
  app.provide('authStrategy', authStrategy);
  app.provide('isInShellMode', isInShellMode);
  app.provide('isAuthInitialized', isAppAuthInitialized);
  app.provide('appAuth', auth);

  // Log current mode
  const strategyLabel = authStrategy.value === 'shell' ? 'SHELL' : 'INDEPENDENT';
  const modeLabel = auth.isInShell() ? 'iframe' : 'standalone';
  console.log(`[ShellAuthBoot] Auth strategy: ${strategyLabel}, Context: ${modeLabel}`);
});
