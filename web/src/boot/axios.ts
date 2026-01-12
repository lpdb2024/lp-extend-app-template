/**
 * Axios Boot File
 *
 * Configures axios instances for API communication.
 * Integrates with @lpextend/client-sdk for authentication.
 */
import { boot } from 'quasar/wrappers';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { getAppAuthInstance } from '@lpextend/client-sdk';

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
  withCredentials: true, // Send cookies with cross-origin requests (for extend_auth cookie)
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const auth = getAppAuthInstance();

    // Add auth token if available
    const token = auth.getAccessToken();
    if (token) {
      // Shell strategy uses X-Shell-Token header
      if (auth.getStrategy() === 'shell') {
        config.headers['X-Shell-Token'] = token;
      }
      // Always add Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[axios] Added auth headers');
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
      // The SDK handles token refresh automatically
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export default boot( ({ app }) => {
  const auth = getAppAuthInstance();

  // Log auth status
  console.log('[axios boot] Auth strategy:', auth.getStrategy());
  console.log('[axios boot] In shell:', auth.isInShell());
  console.log('[axios boot] Has token:', !!auth.getAccessToken());

  // Make axios available globally
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
