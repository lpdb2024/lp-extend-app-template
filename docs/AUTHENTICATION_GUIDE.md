# LP App Template - Authentication Guide

This guide explains the two authentication strategies available for LP Extend apps and how to implement them in your application.

## Overview

When building apps for LP Extend, you have two authentication options:

| Strategy | Use Case | Token Source | LP Registration |
|----------|----------|--------------|-----------------|
| **Shell** | Mini-apps, tools | LP Extend shell backend | Not required |
| **Independent** | Tier-1 apps, standalone | Your backend + LP SSO | Required |

## Quick Decision Guide

Use **Shell Strategy** if:
- Your app is a simple tool or utility
- It only needs to run inside LP Extend
- You want quick development without LP app registration
- You don't need standalone deployment

Use **Independent Strategy** if:
- Your app is complex with many features
- It needs to run standalone (outside the shell)
- You need specific LP API permissions
- It's a tier-1 enterprise application

---

## Strategy 1: Shell-Delegated Auth

### How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   LP Extend     │     │   Your App      │     │   LP APIs       │
│   Shell         │     │   (iframe)      │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  Load app iframe      │                       │
         │  ?shell=true          │                       │
         │  &accountId=123       │                       │
         │──────────────────────▶│                       │
         │                       │                       │
         │  postMessage:         │                       │
         │  REQUEST_TOKEN        │                       │
         │◀──────────────────────│                       │
         │                       │                       │
         │  postMessage:         │                       │
         │  AUTH_TOKEN           │                       │
         │──────────────────────▶│                       │
         │                       │                       │
         │                       │  API calls with token │
         │                       │──────────────────────▶│
```

### Implementation

The template already includes shell auth support via `shell-auth.service.ts`. Here's how to use it:

#### 1. Boot File (Already Configured)

```typescript
// src/boot/shellAuth.ts
import { boot } from 'quasar/wrappers';
import { initShellAuth, isInShellMode } from 'src/services/shell-auth.service';

export default boot(() => {
  initShellAuth();

  if (isInShellMode.value) {
    console.log('Running in shell mode');
  }
});
```

#### 2. Using Auth in Components

```typescript
// In any component
import { useAuth } from 'src/composables/useAuth';

const { isAuthenticated, getToken, getAuthHeaders, accountId } = useAuth();

// Check authentication
if (isAuthenticated.value) {
  // Make API call with proper headers
  const response = await fetch('/api/data', {
    headers: getAuthHeaders(),
  });
}
```

#### 3. Shell Context Detection

```typescript
import {
  isInShellMode,
  shellAuthState,
  getShellToken
} from 'src/services/shell-auth.service';

// Check if in shell
if (isInShellMode.value) {
  const context = shellAuthState.context.value;
  console.log('Account ID:', context?.accountId);
  console.log('App ID:', context?.appId);
}

// Get token
const token = getShellToken();
```

### URL Parameters

When the shell loads your app, it passes these URL parameters:

| Parameter | Description |
|-----------|-------------|
| `shell` | `"true"` when running in shell |
| `accountId` | LP account ID |
| `appId` | Your registered app ID |
| `shellApiUrl` | Shell backend URL |
| `shellOrigin` | Shell origin for postMessage |

---

## Strategy 2: Independent Auth

### How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User          │     │   Your App      │     │   LP SSO        │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  Visit /login         │                       │
         │──────────────────────▶│                       │
         │                       │                       │
         │                       │  Get SSO URL          │
         │                       │──────────────────────▶│
         │                       │◀─────────────────────│
         │                       │                       │
         │  Redirect to LP SSO   │                       │
         │◀──────────────────────│                       │
         │                       │                       │
         │  Login at LP          │                       │
         │──────────────────────────────────────────────▶│
         │                       │                       │
         │  Redirect with code   │                       │
         │◀─────────────────────────────────────────────│
         │                       │                       │
         │  /callback?code=xxx   │                       │
         │──────────────────────▶│                       │
         │                       │                       │
         │                       │  Exchange code        │
         │                       │──────────────────────▶│
         │                       │◀─────────────────────│
         │                       │                       │
         │  Authenticated!       │                       │
         │◀──────────────────────│                       │
```

### Implementation

#### 1. Login Page

Create a login page for standalone users:

```vue
<!-- src/pages/login/LoginPage.vue -->
<template>
  <q-page class="login-page">
    <div class="login-card">
      <h1>Sign In</h1>

      <q-input
        v-model="accountId"
        label="Account ID"
        :disable="loading"
      />

      <q-btn
        label="Sign in with LP SSO"
        color="primary"
        :loading="loading"
        @click="handleSsoLogin"
      />

      <q-separator />

      <div class="direct-login">
        <q-input v-model="username" label="Username" />
        <q-input v-model="password" label="Password" type="password" />
        <q-btn
          label="Direct Login"
          :loading="loading"
          @click="handleDirectLogin"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFirebaseAuthStore } from 'src/stores/store-firebase-auth';

const router = useRouter();
const authStore = useFirebaseAuthStore();

const accountId = ref('');
const username = ref('');
const password = ref('');
const loading = ref(false);

onMounted(() => {
  // Pre-fill from URL params (shell context)
  const params = new URLSearchParams(window.location.search);
  accountId.value = params.get('accountId') || '';
});

async function handleSsoLogin() {
  if (!accountId.value) return;

  loading.value = true;
  try {
    await authStore.initiateSSO(accountId.value);
    // Redirects to LP SSO
  } catch (error) {
    console.error('SSO login failed:', error);
  } finally {
    loading.value = false;
  }
}

async function handleDirectLogin() {
  if (!accountId.value || !username.value || !password.value) return;

  loading.value = true;
  try {
    await authStore.loginWithCredentials(
      accountId.value,
      username.value,
      password.value
    );
    router.push('/');
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
}
</script>
```

#### 2. Callback Page

Handle the OAuth callback:

```vue
<!-- src/pages/login/CallbackPage.vue -->
<template>
  <q-page class="callback-page">
    <q-spinner v-if="loading" size="lg" />
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <q-btn label="Back to Login" to="/login" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFirebaseAuthStore } from 'src/stores/store-firebase-auth';

const router = useRouter();
const route = useRoute();
const authStore = useFirebaseAuthStore();

const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const code = route.query.code as string;
    const state = route.query.state as string; // accountId

    if (!code) {
      throw new Error('No authorization code received');
    }

    await authStore.handleCallback(code, state);
    router.push('/');
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
});
</script>
```

#### 3. Auth Store Methods

Add these methods to your auth store:

```typescript
// src/stores/store-firebase-auth.ts
import { defineStore } from 'pinia';
import ApiService from 'src/services/ApiService';

export const useFirebaseAuthStore = defineStore('firebaseAuth', {
  state: () => ({
    lpSession: null as LpSession | null,
    currentLpAccountId: null as string | null,
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.lpSession && !this.isLpTokenExpired;
    },

    isLpTokenExpired(): boolean {
      if (!this.lpSession) return true;
      return Date.now() > this.lpSession.expiry;
    },
  },

  actions: {
    async initiateSSO(accountId: string) {
      const { data } = await ApiService.get(
        `/api/v1/idp/${accountId}/login-url`
      );
      window.location.href = data.url;
    },

    async handleCallback(code: string, accountId: string) {
      const { data } = await ApiService.post(
        `/api/v1/idp/${accountId}/token`,
        { code, redirect: window.location.origin + '/callback' }
      );

      this.lpSession = {
        accessToken: data.accessToken,
        expiry: data.expiry,
        accountId,
      };
      this.currentLpAccountId = accountId;

      // Persist to localStorage
      localStorage.setItem('lp_session', JSON.stringify(this.lpSession));
    },

    async loginWithCredentials(
      accountId: string,
      username: string,
      password: string
    ) {
      const { data } = await ApiService.post(
        `/api/v1/idp/${accountId}/login`,
        { username, password }
      );

      this.lpSession = {
        accessToken: data.accessToken,
        expiry: data.expiry,
        accountId,
      };
      this.currentLpAccountId = accountId;

      localStorage.setItem('lp_session', JSON.stringify(this.lpSession));
    },

    async logout() {
      if (this.lpSession && this.currentLpAccountId) {
        try {
          await ApiService.post(
            `/api/v1/idp/${this.currentLpAccountId}/logout`,
            {},
            { headers: { Authorization: `Bearer ${this.lpSession.accessToken}` } }
          );
        } catch {
          // Ignore logout errors
        }
      }

      this.lpSession = null;
      this.currentLpAccountId = null;
      localStorage.removeItem('lp_session');
    },

    loadFromStorage() {
      const stored = localStorage.getItem('lp_session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          if (session.expiry > Date.now()) {
            this.lpSession = session;
            this.currentLpAccountId = session.accountId;
          } else {
            localStorage.removeItem('lp_session');
          }
        } catch {
          localStorage.removeItem('lp_session');
        }
      }
    },
  },
});
```

---

## Unified Auth Composable

The template provides a unified `useAuth` composable that works with both strategies:

```typescript
// src/composables/useAuth.ts
import { computed } from 'vue';
import { useFirebaseAuthStore } from 'src/stores/store-firebase-auth';
import {
  isInShellMode,
  isShellAuthenticated,
  getShellToken,
  shellAuthState,
} from 'src/services/shell-auth.service';

export function useAuth() {
  const firebaseAuth = useFirebaseAuthStore();

  // Works for both shell and standalone
  const isAuthenticated = computed(() => {
    if (isInShellMode.value) {
      return isShellAuthenticated.value;
    }
    return firebaseAuth.isAuthenticated;
  });

  // Get token from appropriate source
  const getToken = (): string | null => {
    if (isInShellMode.value) {
      return getShellToken();
    }
    return firebaseAuth.lpSession?.accessToken || null;
  };

  // Get headers for API calls
  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    if (!token) return {};

    if (isInShellMode.value) {
      return { 'X-Shell-Token': token };
    }
    return { Authorization: `Bearer ${token}` };
  };

  const accountId = computed(() => {
    if (isInShellMode.value) {
      return shellAuthState.context.value?.accountId || null;
    }
    return firebaseAuth.currentLpAccountId;
  });

  return {
    isAuthenticated,
    isInShellMode,
    accountId,
    getToken,
    getAuthHeaders,
  };
}
```

---

## Route Guards

Protect routes based on authentication:

```typescript
// src/router/index.ts
import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from 'src/composables/useAuth';

export default route(function () {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
          { path: '', component: () => import('pages/IndexPage.vue') },
        ],
        meta: { requiresAuth: true },
      },
      {
        path: '/login',
        component: () => import('pages/login/LoginPage.vue'),
        meta: { public: true },
      },
      {
        path: '/callback',
        component: () => import('pages/login/CallbackPage.vue'),
        meta: { public: true },
      },
    ],
  });

  router.beforeEach((to, from, next) => {
    const { isAuthenticated, isInShellMode } = useAuth();

    // Public routes - allow access
    if (to.meta.public) {
      next();
      return;
    }

    // Shell mode - auth handled by shell
    if (isInShellMode.value) {
      // Shell will provide token, allow navigation
      next();
      return;
    }

    // Standalone mode - check auth
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }

    next();
  });

  return router;
});
```

---

## Backend Requirements

For independent auth strategy, your backend needs these endpoints:

### GET `/api/v1/idp/:accountId/login-url`

Returns the LP SSO login URL.

```typescript
// Response
{
  "url": "https://sentinel.liveperson.net/sentinel/api/account/123/authorize?..."
}
```

### POST `/api/v1/idp/:accountId/token`

Exchanges auth code for tokens.

```typescript
// Request
{
  "code": "auth_code_from_callback",
  "redirect": "https://your-app.com/callback"
}

// Response
{
  "accessToken": "lp_access_token",
  "idToken": "lp_id_token",
  "expiry": 1704067200000,
  "expiresIn": 14400
}
```

### POST `/api/v1/idp/:accountId/login`

Direct login with username/password.

```typescript
// Request
{
  "username": "user@example.com",
  "password": "password123"
}

// Response (same as token endpoint)
```

### POST `/api/v1/idp/:accountId/logout`

Revokes the LP token.

---

## Environment Configuration

### Shell Strategy

```bash
# .env
VITE_AUTH_STRATEGY=shell
VITE_SHELL_ORIGIN=https://shell.lp-extend.com
```

### Independent Strategy

```bash
# .env
VITE_AUTH_STRATEGY=independent
VITE_API_BASE_URL=https://api.your-app.com

# Backend
VUE_APP_CLIENT_ID=your_lp_client_id
VUE_APP_CLIENT_SECRET=your_lp_client_secret
```

---

## Switching Strategies

To switch your app from shell to independent (or vice versa):

1. **Update environment variables** - Change `VITE_AUTH_STRATEGY`
2. **For independent**: Ensure backend endpoints are implemented
3. **For shell**: Ensure shell passes required URL parameters
4. **Test both flows** - Login, token refresh, logout

The `useAuth` composable abstracts the differences, so your components don't need to change.

---

## Troubleshooting

### "Not authenticated" in shell mode

1. Check URL has `shell=true` and `accountId` parameters
2. Verify shell origin matches `VITE_SHELL_ORIGIN`
3. Check browser console for postMessage errors
4. Ensure shell is sending AUTH_TOKEN messages

### OAuth callback fails

1. Verify redirect URI is registered with LP
2. Check backend `/token` endpoint returns correct format
3. Ensure CORS allows your callback domain

### Token expires immediately

1. Check server clock is synchronized
2. Verify `expiry` is in milliseconds (not seconds)
3. Check `expiresIn` is being converted correctly

### Shell token not received

1. Check shell loads app with correct parameters
2. Verify APP_READY message is sent to shell
3. Check shell origin in postMessage calls
