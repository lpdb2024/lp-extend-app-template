/**
 * Shell Auth Boot File
 *
 * Initializes the unified LpAppAuth SDK early in app startup.
 * This detects if the app is running in an LP Extend shell iframe
 * and configures the appropriate auth strategy (shell or independent).
 *
 * Auth strategy is determined by VITE_AUTH_STRATEGY environment variable:
 * - 'shell': Uses shell-delegated tokens (mini-apps, no LP app registration needed)
 * - 'independent': Uses own LP auth with login page (tier-1 apps)
 */

import { boot } from 'quasar/wrappers';
import { ref, computed } from 'vue';
import { getAppAuthInstance, isAuthInitialized } from 'src/composables/useAuth';
import type { AuthStrategy } from 'src/sdk';

// Also keep the legacy shell-auth service for backward compatibility
import { initShellAuth, shellAuthState, isInShellMode as legacyIsInShellMode } from 'src/services/shell-auth.service';

// Reactive state for global access
const authStrategy = ref<AuthStrategy>((import.meta.env.VITE_AUTH_STRATEGY as AuthStrategy) || 'independent');
const isInShellMode = computed(() => {
  const auth = getAppAuthInstance();
  return auth.isInShell();
});

export default boot(({ app }) => {
  // Initialize legacy shell auth for backward compatibility
  initShellAuth();

  // Get the LpAppAuth instance (will be initialized)
  const auth = getAppAuthInstance();

  // Initialize auth early
  auth.init().then((authenticated) => {
    if (authenticated) {
      console.log('[ShellAuthBoot] User is authenticated');
    } else {
      console.log('[ShellAuthBoot] User is not authenticated');
    }
  }).catch((error) => {
    console.error('[ShellAuthBoot] Auth initialization failed:', error);
  });

  // Make auth state available globally via provide/inject
  app.provide('authStrategy', authStrategy);
  app.provide('isInShellMode', isInShellMode);
  app.provide('isAuthInitialized', isAuthInitialized);

  // Also provide legacy shell auth state for backward compatibility
  app.provide('shellAuthState', shellAuthState);
  app.provide('legacyIsInShellMode', legacyIsInShellMode);

  // Log current mode
  const strategyLabel = authStrategy.value === 'shell' ? 'SHELL' : 'INDEPENDENT';
  const modeLabel = auth.isInShell() ? 'iframe' : 'standalone';
  console.log(`[ShellAuthBoot] Auth strategy: ${strategyLabel}, Context: ${modeLabel}`);
});
