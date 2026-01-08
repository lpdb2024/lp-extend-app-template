<template>
  <q-page class="ext-login-page">
    <!-- Blueprint Background -->
    <div class="ext-blueprint-bg">
      <!-- Gradient base -->
      <div class="ext-blueprint-gradient"></div>

      <!-- Grid lines -->
      <svg class="ext-blueprint-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="smallGrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(232, 73, 183, 0.03)"
              stroke-width="0.5"
            />
          </pattern>
          <pattern
            id="largeGrid"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <rect width="200" height="200" fill="url(#smallGrid)" />
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke="rgba(232, 73, 183, 0.06)"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#largeGrid)" />
      </svg>

      <!-- Schematic lines -->
      <svg
        class="ext-schematic-lines"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <!-- Horizontal accent lines -->
        <line
          x1="0"
          y1="15%"
          x2="25%"
          y2="15%"
          class="schematic-line line-pink"
        />
        <line
          x1="20%"
          y1="15%"
          x2="22%"
          y2="18%"
          class="schematic-line line-pink"
        />
        <line
          x1="22%"
          y1="18%"
          x2="35%"
          y2="18%"
          class="schematic-line line-pink"
        />

        <line
          x1="75%"
          y1="25%"
          x2="100%"
          y2="25%"
          class="schematic-line line-cyan"
        />
        <line
          x1="80%"
          y1="25%"
          x2="78%"
          y2="28%"
          class="schematic-line line-cyan"
        />

        <line
          x1="0"
          y1="70%"
          x2="15%"
          y2="70%"
          class="schematic-line line-cyan"
        />
        <line
          x1="12%"
          y1="70%"
          x2="18%"
          y2="65%"
          class="schematic-line line-cyan"
        />

        <line
          x1="85%"
          y1="80%"
          x2="100%"
          y2="80%"
          class="schematic-line line-pink"
        />
        <line
          x1="88%"
          y1="80%"
          x2="85%"
          y2="85%"
          class="schematic-line line-pink"
        />
        <line
          x1="85%"
          y1="85%"
          x2="92%"
          y2="85%"
          class="schematic-line line-pink"
        />

        <!-- Diagonal accent lines -->
        <line
          x1="90%"
          y1="0"
          x2="100%"
          y2="12%"
          class="schematic-line line-purple"
        />
        <line
          x1="0"
          y1="88%"
          x2="8%"
          y2="100%"
          class="schematic-line line-purple"
        />

        <!-- Corner brackets -->
        <path d="M 30 30 L 30 60 L 60 60" class="schematic-bracket" />
        <path
          d="M calc(100% - 30px) 30 L calc(100% - 30px) 60 L calc(100% - 60px) 60"
          class="schematic-bracket"
        />
        <path
          d="M 30 calc(100% - 30px) L 30 calc(100% - 60px) L 60 calc(100% - 60px)"
          class="schematic-bracket"
        />
        <path
          d="M calc(100% - 30px) calc(100% - 30px) L calc(100% - 30px) calc(100% - 60px) L calc(100% - 60px) calc(100% - 60px)"
          class="schematic-bracket"
        />

        <!-- Node points -->
        <circle cx="22%" cy="18%" r="3" class="schematic-node node-pink" />
        <circle cx="78%" cy="28%" r="3" class="schematic-node node-cyan" />
        <circle cx="18%" cy="65%" r="3" class="schematic-node node-cyan" />
        <circle cx="85%" cy="85%" r="3" class="schematic-node node-pink" />
      </svg>

      <!-- Floating tech labels -->
      <div class="ext-tech-labels">
        <span class="tech-label" style="top: 12%; right: 8%"
          >SYS.EXTEND.v2.4</span
        >
        <span class="tech-label" style="top: 22%; left: 5%"
          >NODE.AUTH.READY</span
        >
        <span class="tech-label" style="bottom: 18%; right: 12%"
          >CONN.SECURE</span
        >
        <span class="tech-label" style="bottom: 8%; left: 8%"
          >LP.INNOVATION.HUB</span
        >
        <span class="tech-label dim" style="top: 45%; right: 3%">0x7F3A</span>
        <span class="tech-label dim" style="top: 60%; left: 2%">0xE849</span>
      </div>

      <!-- Glow orbs -->
      <div class="ext-glow-orbs">
        <div class="glow-orb orb-pink" style="top: 20%; left: 15%"></div>
        <div class="glow-orb orb-cyan" style="top: 35%; right: 20%"></div>
        <div class="glow-orb orb-purple" style="bottom: 25%; left: 25%"></div>
        <div class="glow-orb orb-pink small" style="top: 60%; right: 10%"></div>
        <div
          class="glow-orb orb-cyan small"
          style="bottom: 15%; right: 35%"
        ></div>
      </div>

      <!-- Particle field -->
      <div class="ext-particles">
        <div
          class="particle"
          v-for="n in 20"
          :key="n"
          :style="getParticleStyle(n)"
        ></div>
      </div>
    </div>

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
import { delay } from "src/utils/functions";
import {
  isInShellMode,
  isShellAuthenticated,
  getShellToken,
} from "src/services/shell-auth.service";

const firebaseAuth = useFirebaseAuthStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const appInfo = ref({
  title: "eXtend",
  description: "Innovation platform for the LivePerson ecosystem",
});

// Generate random particle positions
const getParticleStyle = (index: number) => {
  const seed = index * 7919; // Prime for pseudo-random
  const top = (seed * 13) % 100;
  const left = (seed * 17) % 100;
  const size = 1 + ((seed * 3) % 3);
  const delay = (seed * 11) % 8;
  const duration = 3 + ((seed * 5) % 5);
  const opacity = 0.2 + (seed % 5) / 10;

  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: opacity,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};

// Hero image - update this path when you save the community image
const heroImageUrl = computed(() => {
  // Default placeholder - replace with actual image path
  // return new URL('../assets/images/extend-community.png', import.meta.url).href;
  return "/energy-01.png";
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
  // SHELL MODE: If running in LP Extend iframe, wait for shell token and redirect
  if (isInShellMode.value) {
    console.log(
      "[LoginPage] Running in shell mode, waiting for authentication..."
    );

    // If already authenticated via shell, redirect immediately
    if (isShellAuthenticated.value && getShellToken()) {
      console.log(
        "[LoginPage] Shell already authenticated, redirecting to index"
      );
      void router.push({ name: ROUTE_NAMES.INDEX });
      return;
    }

    // Wait for shell token with retries (token is being fetched via PostMessage)
    const maxWaitTime = 8000; // 8 seconds max
    const checkInterval = 200; // Check every 200ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      await delay(checkInterval);

      if (isShellAuthenticated.value && getShellToken()) {
        console.log("[LoginPage] Shell token received, redirecting to index");
        void router.push({ name: ROUTE_NAMES.INDEX });
        return;
      }
    }

    // Shell auth failed after waiting - show error message
    console.warn("[LoginPage] Shell authentication timed out");
    Notify.create({
      type: "warning",
      message: "Shell Authentication Pending",
      caption: "Waiting for authentication from LP Extend shell",
      timeout: 5000,
      position: "top",
    });
    ready.value = true;
    return;
  }

  // STANDALONE MODE: Normal login flow
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

  // NOTE: Do NOT reset stores here - this was causing LP session to be lost on page refresh
  // Stores should only be reset on explicit logout, not when landing on login page
  // The persisted lpSession needs to survive page refreshes

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

// =============================================================================
// Blueprint Background Colors
// =============================================================================
$blueprint-base: #16112d;
$blueprint-dark: #0e0a1f;
$blueprint-pink: #e849b7;
$blueprint-cyan: #31ccec;
$blueprint-purple: #8d46eb;

.ext-login-page {
  display: flex;
  min-height: 100vh;
  background: $blueprint-base;
  position: relative;
  overflow: hidden;
}

// =============================================================================
// Blueprint Background System
// =============================================================================
.ext-blueprint-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.ext-blueprint-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse at 20% 80%,
      rgba($blueprint-pink, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 20%,
      rgba($blueprint-cyan, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      rgba($blueprint-purple, 0.04) 0%,
      transparent 60%
    ),
    linear-gradient(
      180deg,
      $blueprint-dark 0%,
      $blueprint-base 30%,
      $blueprint-base 70%,
      darken($blueprint-base, 3%) 100%
    );
}

.ext-blueprint-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}

.ext-schematic-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  .schematic-line {
    stroke-width: 1;
    fill: none;

    &.line-pink {
      stroke: rgba($blueprint-pink, 0.25);
    }

    &.line-cyan {
      stroke: rgba($blueprint-cyan, 0.2);
    }

    &.line-purple {
      stroke: rgba($blueprint-purple, 0.15);
    }
  }

  .schematic-bracket {
    stroke: rgba($blueprint-pink, 0.15);
    stroke-width: 1;
    fill: none;
  }

  .schematic-node {
    &.node-pink {
      fill: rgba($blueprint-pink, 0.6);
    }

    &.node-cyan {
      fill: rgba($blueprint-cyan, 0.5);
    }
  }
}

.ext-tech-labels {
  position: absolute;
  inset: 0;

  .tech-label {
    position: absolute;
    font-family: "Fira Code", "Monaco", monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba($blueprint-pink, 0.35);
    white-space: nowrap;

    &.dim {
      color: rgba($blueprint-cyan, 0.2);
      font-size: 8px;
    }
  }
}

.ext-glow-orbs {
  position: absolute;
  inset: 0;

  .glow-orb {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: orb-pulse 8s ease-in-out infinite;

    &.small {
      width: 100px;
      height: 100px;
      filter: blur(50px);
      opacity: 0.2;
    }

    &.orb-pink {
      background: $blueprint-pink;
      animation-delay: 0s;
    }

    &.orb-cyan {
      background: $blueprint-cyan;
      animation-delay: 2s;
    }

    &.orb-purple {
      background: $blueprint-purple;
      animation-delay: 4s;
    }
  }
}

@keyframes orb-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.4;
  }
}

.ext-particles {
  position: absolute;
  inset: 0;

  .particle {
    position: absolute;
    background: white;
    border-radius: 50%;
    animation: particle-float linear infinite;
  }
}

@keyframes particle-float {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity, 0.3);
  }
  90% {
    opacity: var(--particle-opacity, 0.3);
  }
  100% {
    transform: translateY(-30px) scale(0.5);
    opacity: 0;
  }
}

// =============================================================================
// Left Panel - Login Form
// =============================================================================
.ext-login-panel {
  flex: 0 0 480px;
  display: flex;
  flex-direction: column;
  padding: 32px;
  background: transparent;
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
    filter: brightness(1); // Always white on dark bg
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
  background: rgba($blueprint-base, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba($blueprint-pink, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.ext-login-header {
  text-align: center;
  margin-bottom: 28px;

  h1 {
    margin: 0 0 8px;
    color: white;
  }

  p {
    margin: 0;
    color: rgba(white, 0.6);
  }
}

// =============================================================================
// Auth Tabs
// =============================================================================
.ext-auth-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(white, 0.05);
  border-radius: $ext-radius-md;
  margin-bottom: 24px;
}

.ext-auth-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: rgba(white, 0.5);
  font-size: $ext-body-sm;
  font-weight: 500;
  border-radius: $ext-radius-sm;
  cursor: pointer;
  transition: all $ext-duration-fast $ext-ease-out;

  &:hover {
    color: rgba(white, 0.8);
  }

  &.active {
    background: rgba(white, 0.1);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
  background: rgba(white, 0.95);
  border: 1px solid rgba(white, 0.2);
  border-radius: $ext-radius-md;
  font-size: $ext-body-sm;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all $ext-duration-fast $ext-ease-out;

  &:hover:not(:disabled) {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  color: rgba(white, 0.4);
  font-size: $ext-body-sm;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(white, 0.15);
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

  .ext-input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(white, 0.08);
    border: 1px solid rgba(white, 0.12);
    border-radius: $ext-radius-md;
    color: white;
    font-size: $ext-body;
    transition: all $ext-duration-fast $ext-ease-out;

    &::placeholder {
      color: rgba(white, 0.4);
    }

    &:focus {
      outline: none;
      border-color: $blueprint-pink;
      background: rgba(white, 0.1);
      box-shadow: 0 0 0 3px rgba($blueprint-pink, 0.15);
    }

    &.ext-input--error {
      border-color: rgba(239, 68, 68, 0.6);
    }
  }

  .ext-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(white, 0.4);
    font-size: 20px;
  }

  .ext-input-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(white, 0.4);
    cursor: pointer;
    font-size: 20px;
    transition: color $ext-duration-fast $ext-ease-out;

    &:hover {
      color: rgba(white, 0.7);
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
    background: linear-gradient(135deg, $blueprint-pink, $blueprint-purple);
    border: none;
    border-radius: $ext-radius-sm;
    color: white;
    cursor: pointer;
    transition: all $ext-duration-fast $ext-ease-out;

    &:hover:not(:disabled) {
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 4px 12px rgba($blueprint-pink, 0.4);
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
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: $ext-radius-md;
  color: #ff8a8a;
  font-size: $ext-body-sm;
}

.ext-auth-footer,
.ext-forgot-password {
  text-align: center;
  font-size: $ext-body-sm;
  color: rgba(white, 0.6);
}

.ext-link {
  color: $blueprint-cyan;
  cursor: pointer;
  text-decoration: none;
  transition: color $ext-duration-fast $ext-ease-out;

  &:hover {
    text-decoration: underline;
    color: lighten($blueprint-cyan, 10%);
  }
}

.ext-login-footer {
  margin-top: 32px;
  text-align: center;
  color: rgba(white, 0.4);
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
  background: transparent; // Uses blueprint bg
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
      rgba($blueprint-pink, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 30%,
      rgba($blueprint-cyan, 0.08) 0%,
      transparent 50%
    );
  z-index: 1;
}

.ext-hero-content {
  position: absolute;
  left: 48px;
  bottom: 80px;
  z-index: 3;
  padding: 48px;
  max-width: 500px;
  text-align: left;
}

.ext-hero-text {
  margin-bottom: 24px;

  .ext-overline {
    display: block;
    margin-bottom: 12px;
    color: $blueprint-cyan;
  }

  h2 {
    color: white;
    margin: 0 0 16px;
    font-family: "Sohne Breit", system-ui, sans-serif;
    font-weight: 700;
  }

  p {
    color: rgba(white, 0.6);
    margin: 0;
  }
}

.ext-hero-badge {
  display: inline-flex;
  padding: 3px;
  background: linear-gradient(135deg, $blueprint-pink, $blueprint-purple);
  border-radius: 20px;

  .inner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: rgba($blueprint-base, 0.9);
    border-radius: 17px;
    color: white;
    font-size: 12px;
    font-weight: 500;
  }
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
  opacity: 0.05;
  mix-blend-mode: screen;
}

// =============================================================================
// Primary Button Override
// =============================================================================
.ext-btn--primary {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, $blueprint-pink, $blueprint-purple);
  border: none;
  border-radius: $ext-radius-md;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all $ext-duration-fast $ext-ease-out;

  &:hover:not(:disabled) {
    box-shadow: 0 4px 20px rgba($blueprint-pink, 0.4);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// =============================================================================
// Dialog Override
// =============================================================================
.ext-dialog {
  min-width: 400px;
  background: rgba($blueprint-base, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba($blueprint-pink, 0.2);
  border-radius: $ext-radius-xl;
  color: white;

  .ext-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(white, 0.1);

    h3 {
      margin: 0;
      color: white;
    }
  }

  .ext-dialog__body {
    padding: 24px;

    .ext-input-label {
      color: rgba(white, 0.7);
      margin-bottom: 8px;
      display: block;
      font-size: 14px;
    }
  }

  .ext-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(white, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .ext-btn--ghost {
    padding: 10px 20px;
    background: transparent;
    border: 1px solid rgba(white, 0.2);
    border-radius: $ext-radius-md;
    color: rgba(white, 0.7);
    cursor: pointer;
    transition: all $ext-duration-fast $ext-ease-out;

    &:hover {
      background: rgba(white, 0.1);
      color: white;
    }
  }
}
</style>
