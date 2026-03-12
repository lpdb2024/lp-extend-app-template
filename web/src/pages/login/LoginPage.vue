<template>
  <q-page class="login-page">
    <!-- Background layers -->
    <div class="bg-gradient"></div>
    <div class="bg-overlay"></div>
    <div class="bg-pattern" :class="{ ready }"></div>

    <!-- Logo -->
    <div class="logo-container">
      <q-img width="120px" src="~assets/images/lp-logo-white.png" />
      <AppTitle :title="appInfo.title" :font-size="28" class="mt-8 ml-10" />
    </div>

    <!-- Main Content -->
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title ff-space-bold">{{ appInfo.title }}</h1>
        <p class="login-subtitle">{{ appInfo.description }}</p>

        <!-- Auth method tabs (only show if both are available) -->
        <q-tabs
          v-if="showTabs"
          v-model="authTab"
          dense
          class="auth-tabs"
          active-color="white"
          indicator-color="orange"
          align="center"
          narrow-indicator
        >
          <q-tab name="agent-login" label="Agent Login" no-caps />
          <q-tab name="sso" label="SSO" no-caps />
        </q-tabs>

        <q-separator v-if="showTabs" dark class="q-mb-md" />

        <!-- Agent Login Section -->
        <div v-if="authTab === 'agent-login'" class="auth-section">
          <p class="sso-info">
            Sign in with your LivePerson agent credentials.
          </p>

          <q-input
            v-model="accountId"
            placeholder="Account ID"
            filled
            dense
            dark
            color="info"
            class="auth-input"
            @keyup.enter="focusUsername"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_business" />
            </template>
          </q-input>

          <q-input
            ref="usernameRef"
            v-model="username"
            placeholder="Username"
            filled
            dense
            dark
            color="info"
            class="auth-input"
            @keyup.enter="focusPassword"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_person" />
            </template>
          </q-input>

          <q-input
            ref="passwordRef"
            v-model="password"
            placeholder="Password"
            filled
            dense
            dark
            color="info"
            class="auth-input"
            :type="showPassword ? 'text' : 'password'"
            @keyup.enter="loginWithCredentials"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'sym_o_visibility_off' : 'sym_o_visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            class="sign-in-btn"
            unelevated
            no-caps
            :loading="agentLoginLoading"
            :disable="!accountId || !username || !password"
            @click="loginWithCredentials"
          >
            <q-icon name="sym_o_login" class="mr-8" />
            Sign In
          </q-btn>

          <p v-if="loginError" class="error-message">{{ loginError }}</p>
        </div>

        <!-- SSO Section -->
        <div v-if="authTab === 'sso'" class="auth-section">
          <p class="sso-info">
            Enter your LivePerson account ID to sign in via SSO.
          </p>

          <q-input
            v-model="accountId"
            placeholder="Enter Account ID"
            filled
            dense
            dark
            color="info"
            class="auth-input account-input"
            @keyup.enter="loginWithSSO"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_business" />
            </template>
          </q-input>

          <q-btn
            class="sign-in-btn"
            unelevated
            no-caps
            :loading="ssoLoading"
            :disable="!accountId"
            @click="loginWithSSO"
          >
            <q-icon name="sym_o_login" class="mr-8" />
            Sign in with LivePerson SSO
          </q-btn>

          <p class="sso-note">
            You'll be redirected to LivePerson's login page if not already
            authenticated.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
/**
 * LoginPage - Multi-Auth Login Page
 *
 * Supports both Agent Login (username/password) and LP SSO authentication.
 * The available auth methods are controlled by VITE_AUTH_STRATEGY:
 * - 'agent-login': Show only Agent Login
 * - 'sso': Show only SSO
 * - 'independent': Show both (tabbed)
 * - 'shell': This page should not be shown (shell handles auth)
 */
import AppTitle from 'src/components/common-ui/AppTitle.vue';
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { type QInput, Notify } from 'quasar';
import { getAppAuthInstance } from '@lpextend/client-sdk';
import { SSO_ERROR_CODES, ROUTE_NAMES } from 'src/constants';
import { delay } from 'src/utils/functions';

const router = useRouter();
const route = useRoute();
const auth = getAppAuthInstance();

const appInfo = ref({
  title: 'Extend',
  description:
    'Experimental Applications and prototypes for the LivePerson platform',
});

// Determine which auth methods to show
const authStrategy = import.meta.env.VITE_AUTH_STRATEGY || 'independent';

const showAgentLogin = computed(() =>
  ['agent-login', 'independent'].includes(authStrategy),
);
const showSSO = computed(() =>
  ['sso', 'independent'].includes(authStrategy),
);
const showTabs = computed(() => showAgentLogin.value && showSSO.value);

// Default tab based on strategy
const authTab = ref(
  authStrategy === 'sso' ? 'sso' : 'agent-login',
);

// UI State
const ready = ref(false);
const loginError = ref('');

// Agent Login state
const accountId = ref('');
const username = ref('');
const password = ref('');
const showPassword = ref(false);
const agentLoginLoading = ref(false);
const usernameRef = ref<QInput | null>(null);
const passwordRef = ref<QInput | null>(null);

// SSO state
const ssoLoading = ref(false);

const focusUsername = () => usernameRef.value?.focus();
const focusPassword = () => passwordRef.value?.focus();

/**
 * Agent Login — calls @lpextend/client-sdk's loginWithCredentials
 * which hits our backend IDP controller POST /api/v1/idp/:accountId/login
 */
const loginWithCredentials = async () => {
  if (!accountId.value || !username.value || !password.value) {
    Notify.create({ type: 'warning', message: 'All fields are required' });
    return;
  }

  agentLoginLoading.value = true;
  loginError.value = '';

  try {
    await auth.loginWithCredentials(
      accountId.value,
      username.value,
      password.value,
    );

    // Verify SDK session was created
    const isAuth = auth.isAuthenticated();
    console.info('[LoginPage] Post-login auth state:', {
      isAuthenticated: isAuth,
      accountId: auth.getAccountId(),
      userId: auth.getUserId(),
      strategy: auth.getStrategy(),
    });

    if (!isAuth) {
      console.error('[LoginPage] SDK session not set after loginWithCredentials!');
      loginError.value = 'Login succeeded but session was not created. Please try again.';
      return;
    }

    Notify.create({
      type: 'positive',
      message: 'Signed in successfully',
    });

    await router.push({ name: ROUTE_NAMES.INDEX });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Login failed';
    loginError.value = msg;
    Notify.create({ type: 'negative', message: msg });
  } finally {
    agentLoginLoading.value = false;
  }
};

/**
 * SSO Login — redirects to LP Sentinel OAuth
 */
const loginWithSSO = async () => {
  if (!accountId.value) {
    Notify.create({ type: 'warning', message: 'Please enter an Account ID' });
    return;
  }

  ssoLoading.value = true;

  try {
    await auth.login(accountId.value);
    // Redirects to LP SSO — page will navigate away
  } catch (error: unknown) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'SSO login failed',
    });
  } finally {
    ssoLoading.value = false;
  }
};

// Handle SSO error codes
const handleError = (errCode: string, errId?: string) => {
  const message =
    SSO_ERROR_CODES[errCode] ?? `Unknown error occurred: ${errCode}`;
  Notify.create({
    type: 'negative',
    message,
    caption: errId ? `(Debug ID: ${errId.slice(0, 8)})` : '',
  });
};

// Clear query params
const clearQueryKeys = (keys: string[]) => {
  const current = router.currentRoute.value;
  const query = { ...current.query };
  keys.forEach((key) => delete query[key]);
  return router.replace({ query });
};

onMounted(async () => {
  // Check if user is already authenticated
  if (auth.isAuthenticated()) {
    void router.push({ name: ROUTE_NAMES.INDEX });
    return;
  }

  // Handle SSO error codes in URL
  if (route.query.err_code) {
    handleError(
      String(route.query.err_code),
      route.query.errId ? String(route.query.errId) : undefined,
    );
    await clearQueryKeys(['err_code', 'errId', 'result']);
  }

  // Handle successful SSO callback
  if (route.query.result === 'true') {
    await clearQueryKeys(['result']);
    void router.push({ name: ROUTE_NAMES.INDEX });
    return;
  }

  // Pre-fill account ID from query or stored value
  if (route.query.accountId) {
    accountId.value = String(route.query.accountId);
  } else {
    const storedAccountId = auth.getAccountId();
    if (storedAccountId) {
      accountId.value = storedAccountId;
    }
  }

  await delay(500);
  ready.value = true;
});
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Background layers
.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #3863e5 0%, #8d46eb 50%, #e849b7 100%);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  z-index: 0;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(28, 31, 81, 0.7) 0%,
    rgba(28, 31, 81, 0.95) 100%
  );
  z-index: 1;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: url(https://lpcdn.lpsnmedia.net/le/apps/agent-workspace/1.51.0-release_1166406301/img/dark-theme-background.3175f99.png);
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1s ease;
  z-index: 2;

  &.ready {
    opacity: 0.3;
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// Logo
.logo-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

// Main content
.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 10;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-title {
  margin: 0 0 8px;
  font-size: 2rem;
  color: white;
  text-align: center;
}

.login-subtitle {
  margin: 0 0 24px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

// Auth tabs
.auth-tabs {
  :deep(.q-tab) {
    color: rgba(255, 255, 255, 0.6);
  }
}

// Auth section
.auth-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-input {
  :deep(.q-field__control) {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
  }

  :deep(.q-field__control:before) {
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.account-input {
  :deep(.q-field__control) {
    padding-right: 8px;
  }
}

// Sign in button
.sign-in-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff6b35, #f7931e) !important;
  color: white !important;
  font-weight: 500;
  border-radius: 8px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
  }
}

// SSO section
.sso-info {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  text-align: center;
}

.sso-note {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  text-align: center;
  font-style: italic;
}

.error-message {
  margin: 0;
  color: #ff5252;
  font-size: 0.85rem;
  text-align: center;
}
</style>
