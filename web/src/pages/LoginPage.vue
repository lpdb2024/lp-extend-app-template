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

        <!-- Auth Mode Toggle -->
        <div class="auth-tabs">
          <button
            class="auth-tab"
            :class="{ active: authMode === 'firebase' }"
            @click="authMode = 'firebase'"
          >
            Sign In
          </button>
          <button
            class="auth-tab"
            :class="{ active: authMode === 'lp-sso' }"
            @click="authMode = 'lp-sso'"
          >
            LP SSO
          </button>
        </div>

        <!-- Firebase Auth Section -->
        <div v-if="authMode === 'firebase'" class="auth-section">
          <!-- Google Sign In -->
          <q-btn
            class="google-btn"
            unelevated
            no-caps
            :loading="firebaseAuth.isLoading"
            @click="signInWithGoogle"
          >
            <q-icon
              name="img:https://www.google.com/favicon.ico"
              size="20px"
              class="mr-8"
            />
            Continue with Google
          </q-btn>

          <div class="divider">
            <span>or</span>
          </div>

          <!-- Email/Password Form -->
          <q-form @submit.prevent="handleEmailSignIn" class="email-form">
            <q-input
              v-model="email"
              type="email"
              placeholder="Email address"
              filled
              dense
              dark
              color="info"
              class="auth-input"
              :error="!!firebaseAuth.error && email.length > 0"
            >
              <template v-slot:prepend>
                <q-icon name="sym_o_mail" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              filled
              dense
              dark
              color="info"
              class="auth-input"
              :error="!!firebaseAuth.error && password.length > 0"
            >
              <template v-slot:prepend>
                <q-icon name="sym_o_lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="
                    showPassword ? 'sym_o_visibility_off' : 'sym_o_visibility'
                  "
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <!-- Error Message -->
            <div v-if="firebaseAuth.error" class="error-message">
              <q-icon name="sym_o_error" size="16px" />
              {{ firebaseAuth.error }}
            </div>

            <q-btn
              type="submit"
              class="sign-in-btn"
              unelevated
              no-caps
              :loading="firebaseAuth.isLoading"
              :disable="!email || !password"
            >
              {{ isSignUp ? "Create Account" : "Sign In" }}
            </q-btn>
          </q-form>

          <!-- Toggle Sign Up / Sign In -->
          <div class="auth-toggle">
            <span v-if="!isSignUp">
              Don't have an account?
              <a @click="toggleSignUp">Sign up</a>
            </span>
            <span v-else>
              Already have an account?
              <a @click="toggleSignUp">Sign in</a>
            </span>
          </div>

          <!-- Forgot Password -->
          <div v-if="!isSignUp" class="forgot-password">
            <a @click="showResetDialog = true">Forgot password?</a>
          </div>
        </div>

        <!-- LP SSO Section (Legacy) -->
        <div v-else class="auth-section">
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
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                icon="sym_o_send"
                @click="loginWithSSO"
                :loading="ssoLoading"
              />
            </template>
          </q-input>

          <p class="sso-note">
            You'll be redirected to LivePerson's login page if not already
            authenticated.
          </p>
        </div>
      </div>
    </div>

    <!-- Password Reset Dialog -->
    <q-dialog v-model="showResetDialog">
      <q-card class="reset-dialog">
        <q-card-section>
          <div class="text-h6">Reset Password</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="resetEmail"
            type="email"
            label="Email address"
            filled
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Send Reset Link"
            color="primary"
            @click="handlePasswordReset"
            :loading="firebaseAuth.isLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import AppTitle from "src/components/common-ui/AppTitle.vue";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Notify } from "quasar";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { useUserStore } from "src/stores/store-user";
import { SSO_ERROR_CODES, ROUTE_NAMES } from "src/constants";
import { delay } from "src/utils/functions";

const firebaseAuth = useFirebaseAuthStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const appInfo = ref({
  title: "Extend",
  description:
    "Experimental Applications and prototypes for the LivePerson platform",
});

// UI State
const ready = ref(false);
const authMode = ref<"firebase" | "lp-sso">("firebase");
const isSignUp = ref(false);
const showPassword = ref(false);
const showResetDialog = ref(false);

// Firebase Auth
const email = ref("");
const password = ref("");
const resetEmail = ref("");

// LP SSO Auth
const accountId = ref("");
const ssoLoading = ref(false);

// Toggle between sign in and sign up
const toggleSignUp = () => {
  isSignUp.value = !isSignUp.value;
  firebaseAuth.clearError();
};

// Sign in with Google
const signInWithGoogle = async () => {
  const credential = await firebaseAuth.signInWithGoogle();
  if (credential) {
    await handleSuccessfulAuth();
  }
};

// Handle email/password sign in or sign up
const handleEmailSignIn = async () => {
  if (isSignUp.value) {
    const credential = await firebaseAuth.createAccount(
      email.value,
      password.value
    );
    if (credential) {
      await handleSuccessfulAuth();
    }
  } else {
    const credential = await firebaseAuth.signInWithEmail(
      email.value,
      password.value
    );
    if (credential) {
      await handleSuccessfulAuth();
    }
  }
};

// Handle password reset
const handlePasswordReset = async () => {
  const success = await firebaseAuth.resetPassword(resetEmail.value);
  if (success) {
    Notify.create({
      type: "positive",
      message: "Password reset email sent",
      caption: "Check your inbox for instructions",
    });
    showResetDialog.value = false;
    resetEmail.value = "";
  }
};

// Handle successful authentication
const handleSuccessfulAuth = async () => {
  Notify.create({
    type: "positive",
    message: "Signed in successfully",
    caption: `Welcome, ${firebaseAuth.userDisplayName}`,
  });

  // Fetch user profile from backend to get defaultAccountId and linked accounts
  const appUser = await firebaseAuth.fetchAppUserProfile();

  if (appUser?.defaultAccountId) {
    // User has a default LP account - attempt popup SSO
    Notify.create({
      type: "info",
      message: "Connecting to LP account...",
      caption: `Account: ${appUser.defaultAccountId}`,
      icon: "sym_o_link",
      timeout: 2000,
    });

    // Reset auto-login state to allow a fresh attempt
    firebaseAuth.resetAutoLoginState();

    // Use popup-based SSO (attemptAutoLpLogin handles all the logic)
    const lpLoginSuccess = await firebaseAuth.attemptAutoLpLogin(appUser.defaultAccountId);

    if (lpLoginSuccess) {
      Notify.create({
        type: "positive",
        message: "LP account connected",
        caption: `Connected to account ${appUser.defaultAccountId}`,
        icon: "sym_o_link",
      });
    } else {
      Notify.create({
        type: "info",
        message: "LP account not connected",
        caption: "Sign in via LP SSO to access LivePerson features",
        icon: "sym_o_link_off",
      });
    }
  } else {
    // No LP account linked yet
    Notify.create({
      type: "info",
      message: "No LP account configured",
      caption: "Link an LP account to access LivePerson features",
      icon: "sym_o_link_off",
    });
  }

  // Check if there's a redirect query
  const redirect = route.query.redirect as string;
  if (redirect) {
    void router.push(redirect);
  } else {
    // Go to index - auth guard will handle routing appropriately
    void router.push({ name: ROUTE_NAMES.INDEX });
  }
};


// LP SSO Login (legacy flow)
const loginWithSSO = async () => {
  if (!accountId.value) {
    Notify.create({
      type: "warning",
      message: "Please enter an Account ID",
    });
    return;
  }

  ssoLoading.value = true;

  try {
    const redirect = await userStore.getSentinelUrl(accountId.value);
    if (redirect) {
      window.open(String(redirect), "_self");
    }
  } finally {
    ssoLoading.value = false;
  }
};

// Handle SSO error codes
const handleError = (errCode: string, errId?: string) => {
  const message =
    SSO_ERROR_CODES[errCode] ?? `Unknown error occurred: ${errCode}`;
  Notify.create({
    type: "negative",
    message,
    caption: errId ? `(Debug ID: ${errId.slice(0, 8)})` : "",
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
  // Check if we were redirected here due to an error (prevent infinite loop)
  const hasLoginError = sessionStorage.getItem("loginRedirectError");
  if (hasLoginError) {
    sessionStorage.removeItem("loginRedirectError");
    Notify.create({
      type: "warning",
      message: "Session expired or access denied",
      caption: "Please sign in again",
      timeout: 5000,
    });
    // Don't redirect, let user re-login
    ready.value = true;
    return;
  }

  // Initialize Firebase auth listener FIRST before any resets
  await firebaseAuth.initAuthListener();

  // If already authenticated with Firebase, try to redirect
  // But if we came from a failed redirect (query param), don't loop
  if (firebaseAuth.isAuthenticated) {
    const fromFailedRedirect = route.query.authFailed === "true";
    if (fromFailedRedirect) {
      // Clear the flag and show message
      await router.replace({ query: {} });
      Notify.create({
        type: "warning",
        message: "Unable to access application",
        caption: "Your session may have expired. Please sign in again.",
        timeout: 5000,
      });
      // Logout to clear stale state
      await firebaseAuth.logout();
      ready.value = true;
      return;
    }

    // Normal redirect to INDEX
    void router.push({ name: ROUTE_NAMES.INDEX });
    return;
  }

  // NOTE: Do NOT reset stores here - this was causing LP session to be lost on page refresh
  // Stores should only be reset on explicit logout, not when landing on login page
  // The persisted lpSession needs to survive page refreshes

  // Handle SSO error codes in URL
  if (route.query.err_code) {
    handleError(
      String(route.query.err_code),
      route.query.errId ? String(route.query.errId) : undefined
    );
    await clearQueryKeys(["err_code", "errId", "result"]);
  }

  // Handle successful SSO callback
  if (route.query.result === "true") {
    await clearQueryKeys(["result"]);
    // SSO success - the old flow would call authApp here
    // For now, switch to LP SSO mode
    authMode.value = "lp-sso";
  }

  // Pre-fill account ID from query
  if (route.query.accountId) {
    accountId.value = String(route.query.accountId);
    authMode.value = "lp-sso";
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
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.auth-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: white;
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
}

// Auth section
.auth-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Google button
.google-btn {
  width: 100%;
  padding: 12px 24px;
  background: white !important;
  color: #333 !important;
  font-weight: 500;
  border-radius: 8px;

  &:hover {
    background: #f5f5f5 !important;
  }
}

// Divider
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }
}

// Form
.email-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

// Error message
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 82, 82, 0.15);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 8px;
  color: #ff8a80;
  font-size: 0.85rem;
}

// Sign in button
.sign-in-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3863e5, #8d46eb) !important;
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

// Auth toggle & forgot password
.auth-toggle,
.forgot-password {
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);

  a {
    color: #68b6d5;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
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

// Reset dialog
.reset-dialog {
  min-width: 320px;
}
</style>
