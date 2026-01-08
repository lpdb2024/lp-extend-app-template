<template>
  <q-page class="ext-login-page">
    <!-- Left Panel - Login Form -->
    <div class="ext-login-panel">
      <!-- Logo -->
      <div class="ext-login-logo">
        <q-img width="100px" src="~assets/images/lp-logo-white.png" />
      </div>

      <!-- Login Card -->
      <div class="ext-login-form-container">
        <div class="ext-login-card ext-card ext-card--glass">
          <!-- Header -->
          <div class="ext-login-header">
            <h1 class="ext-display-3 ext-text-gradient">{{ appInfo.title }}</h1>
            <p class="ext-body ext-text-secondary">{{ appInfo.description }}</p>
          </div>

          <!-- Auth Mode Toggle -->
          <div class="ext-auth-tabs">
            <button
              class="ext-auth-tab"
              :class="{ active: authMode === 'firebase' }"
              @click="authMode = 'firebase'"
            >
              Sign In
            </button>
            <button
              class="ext-auth-tab"
              :class="{ active: authMode === 'lp-sso' }"
              @click="authMode = 'lp-sso'"
            >
              LP SSO
            </button>
          </div>

          <!-- Firebase Auth Section -->
          <div v-if="authMode === 'firebase'" class="ext-auth-section">
            <!-- Google Sign In -->
            <button
              class="ext-btn-google"
              :disabled="firebaseAuth.isLoading"
              @click="signInWithGoogle"
            >
              <q-icon
                name="img:https://www.google.com/favicon.ico"
                size="20px"
              />
              <span>Continue with Google</span>
              <q-spinner v-if="firebaseAuth.isLoading" size="16px" />
            </button>

            <div class="ext-divider-text">
              <span>or</span>
            </div>

            <!-- Email/Password Form -->
            <q-form @submit.prevent="handleEmailSignIn" class="ext-form">
              <div class="ext-input-wrapper has-icon-left">
                <q-icon name="sym_o_mail" class="ext-input-icon" />
                <input
                  v-model="email"
                  type="email"
                  placeholder="Email address"
                  class="ext-input"
                  :class="{
                    'ext-input--error':
                      !!firebaseAuth.error && email.length > 0,
                  }"
                />
              </div>

              <div class="ext-input-wrapper has-icon-left">
                <q-icon name="sym_o_lock" class="ext-input-icon" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  class="ext-input"
                  :class="{
                    'ext-input--error':
                      !!firebaseAuth.error && password.length > 0,
                  }"
                />
                <q-icon
                  :name="
                    showPassword ? 'sym_o_visibility_off' : 'sym_o_visibility'
                  "
                  class="ext-input-toggle"
                  @click="showPassword = !showPassword"
                />
              </div>

              <!-- Error Message -->
              <div v-if="firebaseAuth.error" class="ext-error-message">
                <q-icon name="sym_o_error" size="16px" />
                {{ firebaseAuth.error }}
              </div>

              <button
                type="submit"
                class="ext-btn ext-btn--primary ext-btn--lg"
                :disabled="!email || !password || firebaseAuth.isLoading"
              >
                <span>{{ isSignUp ? "Create Account" : "Sign In" }}</span>
                <q-spinner v-if="firebaseAuth.isLoading" size="16px" />
              </button>
            </q-form>

            <!-- Toggle Sign Up / Sign In -->
            <div class="ext-auth-footer">
              <span v-if="!isSignUp" class="ext-text-secondary">
                Don't have an account?
                <a @click="toggleSignUp" class="ext-link">Sign up</a>
              </span>
              <span v-else class="ext-text-secondary">
                Already have an account?
                <a @click="toggleSignUp" class="ext-link">Sign in</a>
              </span>
            </div>

            <!-- Forgot Password -->
            <div v-if="!isSignUp" class="ext-forgot-password">
              <a @click="showResetDialog = true" class="ext-link"
                >Forgot password?</a
              >
            </div>
          </div>

          <!-- LP SSO Section -->
          <div v-else class="ext-auth-section">
            <p
              class="ext-body ext-text-secondary"
              style="text-align: center; margin-bottom: 16px"
            >
              Enter your LivePerson account ID to sign in via SSO.
            </p>

            <div class="ext-input-wrapper has-icon-left">
              <q-icon name="sym_o_business" class="ext-input-icon" />
              <input
                v-model="accountId"
                type="text"
                placeholder="Enter Account ID"
                class="ext-input"
                @keyup.enter="loginWithSSO"
              />
              <button
                class="ext-input-action"
                @click="loginWithSSO"
                :disabled="ssoLoading"
              >
                <q-icon name="sym_o_arrow_forward" v-if="!ssoLoading" />
                <q-spinner v-else size="18px" />
              </button>
            </div>

            <p
              class="ext-caption ext-text-muted"
              style="text-align: center; margin-top: 12px; font-style: italic"
            >
              You'll be redirected to LivePerson's login page if not already
              authenticated.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="ext-login-footer">
          <span class="ext-caption ext-text-muted">
            Powered by LivePerson Innovation
          </span>
        </div>
      </div>
    </div>

    <!-- Right Panel - Hero Image -->
    <div class="ext-hero-panel" :class="{ ready }">
      <div class="ext-hero-overlay"></div>
      <div class="ext-hero-content">
        <div class="ext-hero-text">
          <span class="ext-overline ext-text-info">COLLABORATION</span>
          <h2 class="ext-display-2">Where Ideas<br />Come to Life</h2>
          <p class="ext-body-lg">
            Join the LivePerson community where innovation meets collaboration.
            Together, we build the future of conversational AI.
          </p>
        </div>
        <div class="ext-hero-badge ext-badge ext-badge--gradient">
          <div class="inner bg-grey-2 br-20 text-grey-8 pl-10 pr-10">
            <q-icon name="sym_o_groups" size="16px" />
            <span>Innovation Platform</span>
          </div>
        </div>
      </div>
      <!-- Community Image Placeholder - Replace src with actual image -->
      <div class="ext-hero-image">
        <!-- The community silhouette image goes here -->
        <!-- You'll need to save the image to assets/images/extend-community.png -->
        <img
          :src="heroImageUrl"
          alt="Community collaboration"
          class="ext-hero-img"
        />
      </div>
    </div>

    <!-- Password Reset Dialog -->
    <q-dialog v-model="showResetDialog">
      <div class="ext-dialog">
        <div class="ext-dialog__header">
          <h3 class="ext-h3">Reset Password</h3>
        </div>
        <div class="ext-dialog__body">
          <div class="ext-input-wrapper">
            <label class="ext-input-label">Email address</label>
            <input
              v-model="resetEmail"
              type="email"
              placeholder="Enter your email"
              class="ext-input"
            />
          </div>
        </div>
        <div class="ext-dialog__footer">
          <button
            class="ext-btn ext-btn--ghost"
            @click="showResetDialog = false"
          >
            Cancel
          </button>
          <button
            class="ext-btn ext-btn--primary"
            @click="handlePasswordReset"
            :disabled="firebaseAuth.isLoading"
          >
            Send Reset Link
          </button>
        </div>
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Notify } from "quasar";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { useUserStore } from "src/stores/store-user";
import { SSO_ERROR_CODES, ROUTE_NAMES } from "src/constants";
import { useResetStore } from "src/services/resetPinia";
import { delay } from "src/utils/functions";

const firebaseAuth = useFirebaseAuthStore();
const userStore = useUserStore();
const resetStore = useResetStore();
const router = useRouter();
const route = useRoute();

const appInfo = ref({
  title: "eXtend",
  description: "Innovation platform for the LivePerson ecosystem",
});

// Hero image - update this path when you save the community image
const heroImageUrl = computed(() => {
  // Default placeholder - replace with actual image path
  // return new URL('../assets/images/extend-community.png', import.meta.url).href;
  return "/extend-community-2.png";
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

  const appUser = await firebaseAuth.fetchAppUserProfile();

  if (appUser?.defaultAccountId) {
    await attemptSilentLpLogin(appUser.defaultAccountId);
  } else {
    Notify.create({
      type: "info",
      message: "No LP account loaded",
      caption: "Link an LP account to access LivePerson features",
      icon: "sym_o_link_off",
    });
  }

  const redirect = route.query.redirect as string;
  if (redirect) {
    void router.push(redirect);
  } else {
    void router.push({ name: ROUTE_NAMES.INDEX });
  }
};

// Attempt silent LP SSO login
const attemptSilentLpLogin = async (lpAccountId: string) => {
  try {
    await userStore.getlpDomains(lpAccountId);
    const sentinelUrl = await userStore.getSentinelUrl(lpAccountId);

    if (sentinelUrl) {
      sessionStorage.setItem("pendingLpAccountId", lpAccountId);
      sessionStorage.setItem("silentLpSso", "true");

      const success = attemptSilentSsoViaIframe(sentinelUrl, lpAccountId);

      if (success) {
        Notify.create({
          type: "positive",
          message: "LP account connected",
          caption: `Connected to account ${lpAccountId}`,
          icon: "sym_o_link",
        });
      } else {
        Notify.create({
          type: "info",
          message: "No LP account loaded",
          caption: "Sign in via LP SSO to access LivePerson features",
          icon: "sym_o_link_off",
        });
      }
    }
  } catch (error) {
    console.error("Silent LP SSO failed:", error);
    Notify.create({
      type: "info",
      message: "No LP account loaded",
      caption: "Sign in via LP SSO to access LivePerson features",
      icon: "sym_o_link_off",
    });
  }
};

const attemptSilentSsoViaIframe = (
  sentinelUrl: string,
  accountId: string
): boolean => {
  console.debug("Silent SSO not yet implemented for:", accountId, sentinelUrl);
  return false;
};

// LP SSO Login
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
  const hasLoginError = sessionStorage.getItem("loginRedirectError");
  if (hasLoginError) {
    sessionStorage.removeItem("loginRedirectError");
    Notify.create({
      type: "warning",
      message: "Session expired or access denied",
      caption: "Please sign in again",
      timeout: 5000,
    });
    ready.value = true;
    return;
  }

  await firebaseAuth.initAuthListener();

  if (firebaseAuth.isAuthenticated) {
    const fromFailedRedirect = route.query.authFailed === "true";
    if (fromFailedRedirect) {
      await router.replace({ query: {} });
      Notify.create({
        type: "warning",
        message: "Unable to access application",
        caption: "Your session may have expired. Please sign in again.",
        timeout: 5000,
      });
      await firebaseAuth.logout();
      ready.value = true;
      return;
    }

    void router.push({ name: ROUTE_NAMES.INDEX });
    return;
  }

  if (resetStore && typeof resetStore.all === "function") {
    resetStore.all();
    await firebaseAuth.initAuthListener();
  }

  if (route.query.err_code) {
    handleError(
      String(route.query.err_code),
      route.query.errId ? String(route.query.errId) : undefined
    );
    await clearQueryKeys(["err_code", "errId", "result"]);
  }

  if (route.query.result === "true") {
    await clearQueryKeys(["result"]);
    authMode.value = "lp-sso";
  }

  if (route.query.accountId) {
    accountId.value = String(route.query.accountId);
    authMode.value = "lp-sso";
  }

  await delay(500);
  ready.value = true;
});
</script>

<style scoped lang="scss">
@import "../css/extend-theme.scss";

.ext-login-page {
  display: flex;
  min-height: 100vh;
  background: var(--ext-bg-base);
}

// =============================================================================
// Left Panel - Login Form
// =============================================================================
.ext-login-panel {
  flex: 0 0 480px;
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: var(--ext-bg-base);
  position: relative;
  z-index: 2;

  @media (max-width: 1024px) {
    flex: 1;
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
}

.ext-login-logo {
  margin-bottom: 24px;

  :deep(img) {
    filter: brightness(0) invert(0.3);
  }
}

.body--dark .ext-login-logo {
  :deep(img) {
    filter: brightness(1);
  }
}

.ext-login-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.ext-login-card {
  padding: 32px;
}

.ext-login-header {
  text-align: center;
  margin-bottom: 28px;

  h1 {
    margin: 0 0 8px;
  }

  p {
    margin: 0;
  }
}

// =============================================================================
// Auth Tabs
// =============================================================================
.ext-auth-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--ext-bg-muted);
  border-radius: $ext-radius-md;
  margin-bottom: 24px;
}

.ext-auth-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--ext-text-secondary);
  font-size: $ext-body-sm;
  font-weight: 500;
  border-radius: $ext-radius-sm;
  cursor: pointer;
  transition: all $ext-duration-fast $ext-ease-out;

  &:hover {
    color: var(--ext-text-primary);
  }

  &.active {
    background: var(--ext-bg-surface);
    color: var(--ext-text-primary);
    box-shadow: var(--ext-shadow-sm);
  }
}

// =============================================================================
// Auth Section
// =============================================================================
.ext-auth-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ext-btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  background: var(--ext-bg-surface);
  border: 1px solid var(--ext-border-default);
  border-radius: $ext-radius-md;
  font-size: $ext-body-sm;
  font-weight: 500;
  color: var(--ext-text-primary);
  cursor: pointer;
  transition: all $ext-duration-fast $ext-ease-out;

  &:hover:not(:disabled) {
    background: var(--ext-bg-muted);
    border-color: var(--ext-border-strong);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.ext-divider-text {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--ext-text-muted);
  font-size: $ext-body-sm;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--ext-border-default);
  }
}

.ext-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ext-input-wrapper {
  position: relative;

  &.has-icon-left .ext-input {
    padding-left: 44px;
  }

  .ext-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ext-text-muted);
    font-size: 20px;
  }

  .ext-input-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ext-text-muted);
    cursor: pointer;
    font-size: 20px;
    transition: color $ext-duration-fast $ext-ease-out;

    &:hover {
      color: var(--ext-text-secondary);
    }
  }

  .ext-input-action {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ext-gradient-nebula);
    border: none;
    border-radius: $ext-radius-sm;
    color: white;
    cursor: pointer;
    transition: all $ext-duration-fast $ext-ease-out;

    &:hover:not(:disabled) {
      transform: translateY(-50%) scale(1.05);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.ext-error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: $ext-radius-md;
  color: var(--ext-error);
  font-size: $ext-body-sm;
}

.ext-auth-footer,
.ext-forgot-password {
  text-align: center;
  font-size: $ext-body-sm;
}

.ext-link {
  color: var(--ext-text-link);
  cursor: pointer;
  text-decoration: none;
  transition: color $ext-duration-fast $ext-ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.ext-login-footer {
  margin-top: 32px;
  text-align: center;
}

// =============================================================================
// Right Panel - Hero Image
// =============================================================================
.ext-hero-panel {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $ext-cosmic-900 0%, $ext-cosmic-800 100%);
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.8s $ext-ease-out;

  &.ready {
    opacity: 1;
  }

  @media (max-width: 1024px) {
    display: none;
  }
}

.ext-hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse at 30% 70%,
      rgba(141, 70, 235, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 30%,
      rgba(65, 105, 232, 0.1) 0%,
      transparent 50%
    );
  z-index: 1;
}

.ext-hero-content {
  position: relative;
  z-index: 3;
  padding: 48px;
  max-width: 500px;
  text-align: left;

  position: absolute;
  left: 48px;
  bottom: 80px;
}

.ext-hero-text {
  margin-bottom: 24px;

  .ext-overline {
    display: block;
    margin-bottom: 12px;
  }

  h2 {
    color: white;
    margin: 0 0 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.ext-hero-badge.inner {
  gap: 8px;
}

.ext-hero-image {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.ext-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.1;
  mix-blend-mode: luminosity;
}

// =============================================================================
// Dark Mode Adjustments
// =============================================================================
.body--dark {
  .ext-login-panel {
    background: $ext-cosmic-950;
  }

  .ext-login-card {
    background: var(--ext-bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ext-border-default);
  }

  .ext-auth-tabs {
    background: rgba(18, 24, 74, 0.5);
  }

  .ext-auth-tab.active {
    background: var(--ext-bg-elevated);
  }

  .ext-btn-google {
    background: var(--ext-bg-elevated);
    border-color: var(--ext-border-default);

    &:hover:not(:disabled) {
      background: var(--ext-bg-muted);
    }
  }

  .ext-hero-img {
    mix-blend-mode: normal;
    opacity: 0.9;
  }
}

// =============================================================================
// Dialog Override
// =============================================================================
.ext-dialog {
  min-width: 400px;
}
</style>
