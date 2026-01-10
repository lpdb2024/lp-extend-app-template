/**
 * Axios Boot File
 *
 * Configures axios instances for API communication.
 * Integrates with shell authentication when running inside LP Extend shell.
 */
import { boot } from 'quasar/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import {
  initShellAuth,
  getShellToken,
  isInShellMode,
  shellAuthState,
} from '../services/shell-auth.service';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Create API instance
const api = axios.create({
  baseURL: '/',
  timeout: 30000,
});

// Request interceptor - add shell token if in shell mode
api.interceptors.request.use(
  (config) => {
    // Check if running in shell mode and we have a valid token
    if (isInShellMode.value) {
      const shellToken = getShellToken();
      if (shellToken) {
        // Add shell token header for backend authentication
        config.headers['X-Shell-Token'] = shellToken;
        console.log('[axios] Added X-Shell-Token header');
      } else {
        console.warn('[axios] In shell mode but no valid token available');
      }
    }

    return config;
  },
  (error: Error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn('[axios] Unauthorized - token may have expired');

      // If in shell mode, try to refresh the token
      if (isInShellMode.value) {
        console.info('[axios] Requesting new shell token...');
        // The shell-auth service handles token refresh automatically
        // For now, just log the error
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export default boot(async ({ app }) => {
  // Initialize shell auth detection early and wait for token
  await initShellAuth();

  // Log shell mode status
  console.log('[axios boot] Shell mode:', isInShellMode.value);
  if (isInShellMode.value) {
    console.log('[axios boot] Shell context:', shellAuthState.context.value);
    console.log('[axios boot] Has shell token:', !!getShellToken());
  }

  // Make axios available globally
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
