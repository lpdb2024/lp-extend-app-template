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

        <!-- Google Auth Section -->
        <div class="auth-section">
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

          <!-- Error Message -->
          <div v-if="firebaseAuth.error" class="error-message">
            <q-icon name="sym_o_error" size="16px" />
            {{ firebaseAuth.error }}
          </div>

          <p class="auth-note">
            Sign in using your Google account to access the application.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
/**
 * LoginPageGoogleOnly - Google OAuth Only Login Page
 *
 * This login page only offers Google OAuth authentication via Firebase.
 * Use this variant for applications that want a simple, single-click sign-in
 * experience using Google accounts.
 */
import AppTitle from "src/components/common-ui/AppTitle.vue";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Notify } from "quasar";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { ROUTE_NAMES } from "src/constants";
import { delay } from "src/utils/functions";

const firebaseAuth = useFirebaseAuthStore();
const router = useRouter();
const route = useRoute();

const appInfo = ref({
  title: "Extend",
  description:
    "Experimental Applications and prototypes for the LivePerson platform",
});

// UI State
const ready = ref(false);

// Sign in with Google
const signInWithGoogle = async () => {
  const credential = await firebaseAuth.signInWithGoogle();
  if (credential) {
    await handleSuccessfulAuth();
  }
};

// Handle successful authentication
const handleSuccessfulAuth = async () => {
  Notify.create({
    type: "positive",
    message: "Signed in successfully",
    caption: `Welcome, ${firebaseAuth.userDisplayName}`,
  });

  // Fetch user profile from backend
  await firebaseAuth.fetchAppUserProfile();

  // Check if there's a redirect query
  const redirect = route.query.redirect as string;
  if (redirect) {
    void router.push(redirect);
  } else {
    // Go to index
    void router.push({ name: ROUTE_NAMES.INDEX });
  }
};

onMounted(async () => {
  // Initialize Firebase auth listener
  await firebaseAuth.initAuthListener();

  // If already authenticated with Firebase, redirect
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
      await firebaseAuth.logout();
      ready.value = true;
      return;
    }

    // Normal redirect to INDEX
    void router.push({ name: ROUTE_NAMES.INDEX });
    return;
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

// Auth section
.auth-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Google button
.google-btn {
  width: 100%;
  padding: 14px 24px;
  background: white !important;
  color: #333 !important;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 8px;

  &:hover {
    background: #f5f5f5 !important;
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

// Auth note
.auth-note {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  text-align: center;
  font-style: italic;
}
</style>
