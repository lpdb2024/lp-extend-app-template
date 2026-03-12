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
import { Dark } from 'quasar';
import { ref, computed } from 'vue';
import {
  getAppAuthInstance,
  initAppAuth,
  isAppAuthInitialized,
  onThemeChange,
  type AuthStrategy,
} from '@lpextend/client-sdk';
import { useAppStore } from 'src/stores/store-app';

// Reactive state for global access
const authStrategy = ref<AuthStrategy>((import.meta.env.VITE_AUTH_STRATEGY as AuthStrategy) || 'independent');
const isInShellMode = computed(() => {
  const auth = getAppAuthInstance();
  return auth.isInShell();
});

export default boot(async ({ app }) => {
  const bootStart = Date.now();
  console.log('[ShellAuthBoot] Starting auth init...', bootStart);

  // Get the LpAppAuth instance (will be initialized)
  const auth = getAppAuthInstance();

  // Initialize auth and wait for completion — this ensures lpAuth is ready
  // before any component (e.g. LoginPage) tries to call loginWithCredentials
  try {
    const authenticated = await initAppAuth();
    const elapsed = Date.now() - bootStart;
    if (authenticated) {
      console.log(`[ShellAuthBoot] User is authenticated (${elapsed}ms)`);
    } else {
      console.log(`[ShellAuthBoot] User is not authenticated (${elapsed}ms)`);
    }
  } catch (error) {
    const elapsed = Date.now() - bootStart;
    console.error(`[ShellAuthBoot] Auth initialization failed (${elapsed}ms):`, error);
  }

  // Make auth state available globally via provide/inject
  app.provide('authStrategy', authStrategy);
  app.provide('isInShellMode', isInShellMode);
  app.provide('isAuthInitialized', isAppAuthInitialized);
  app.provide('appAuth', auth);

  // Log current mode
  const strategyLabel = authStrategy.value === 'shell' ? 'SHELL' : 'INDEPENDENT';
  const modeLabel = auth.isInShell() ? 'iframe' : 'standalone';
  console.log(`[ShellAuthBoot] Auth strategy: ${strategyLabel}, Context: ${modeLabel}`);

  // Listen for theme changes from shell
  onThemeChange((dark: boolean) => {
    console.log(`[ShellAuthBoot] Theme changed from shell: dark=${dark}`);
    Dark.set(dark);
    useAppStore().setDark(dark);
  });
});
