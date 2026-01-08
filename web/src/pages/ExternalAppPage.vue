<template>
  <q-page class="external-app-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <q-spinner-dots size="3em" color="primary" />
      <p>Loading {{ appConfig?.title || 'application' }}...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <q-icon name="error_outline" size="64px" color="negative" />
      <h3>Failed to load application</h3>
      <p>{{ error }}</p>
      <q-btn color="primary" label="Go Back" @click="goBack" />
    </div>

    <!-- App Not Found -->
    <div v-else-if="!appConfig" class="error-state">
      <q-icon name="sym_o_search_off" size="64px" color="grey-5" />
      <h3>Application not found</h3>
      <p>The requested application could not be found.</p>
      <q-btn color="primary" label="Go Home" @click="goHome" />
    </div>

    <!-- Iframe Container -->
    <div v-else class="iframe-container">
      <iframe
        ref="iframeRef"
        :src="iframeSrc"
        :title="appConfig.title"
        frameborder="0"
        allow="clipboard-read; clipboard-write"
        @load="onIframeLoad"
        @error="onIframeError"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebaseAuthStore } from 'src/stores/store-firebase-auth'
import { ROUTE_NAMES } from 'src/constants'

interface ExternalAppConfig {
  name: string
  title: string
  url: string
  allowedOrigins?: string[]
  shareAuth?: boolean
  requiresLp?: boolean
}

// Registry of external applications - can be extended or fetched from backend
const externalAppsRegistry: Record<string, ExternalAppConfig> = {
  // Example external apps - these would be configured per deployment
  // 'app-name': {
  //   name: 'app-name',
  //   title: 'App Title',
  //   url: 'https://example.com/app',
  //   shareAuth: true,
  //   requiresLp: false,
  // },
}

const route = useRoute()
const router = useRouter()
const firebaseAuth = useFirebaseAuthStore()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const authSent = ref(false)

const appName = computed(() => route.params.appName as string)
const accountId = computed(() => route.params.accountId as string)

// Get app config from registry or route query params
const appConfig = computed((): ExternalAppConfig | null => {
  // First check registry
  const registeredApp = externalAppsRegistry[appName.value]
  if (registeredApp) {
    return registeredApp
  }

  // Allow dynamic external apps via query params (for development/testing)
  const queryUrl = route.query.url as string
  const queryTitle = route.query.title as string
  if (queryUrl) {
    return {
      name: appName.value,
      title: queryTitle || appName.value,
      url: queryUrl,
      shareAuth: route.query.shareAuth === 'true',
      requiresLp: route.query.requiresLp === 'true',
    }
  }

  return null
})

const iframeSrc = computed(() => {
  if (!appConfig.value) return ''

  // Build URL with account context
  const url = new URL(appConfig.value.url)
  if (accountId.value) {
    url.searchParams.set('accountId', accountId.value)
  }

  return url.toString()
})

// Handle postMessage communication with iframe
const handleMessage = (event: MessageEvent) => {
  if (!appConfig.value) return

  // Verify origin if configured
  const allowedOrigins = appConfig.value.allowedOrigins || []
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin)) {
    console.warn('Message from unauthorized origin:', event.origin)
    return
  }

  const { type, payload } = event.data || {}

  switch (type) {
    case 'EXTEND_AUTH_REQUEST':
      // External app is requesting authentication data
      void sendAuthToIframe()
      break

    case 'EXTEND_NAVIGATE':
      // External app wants to navigate within Extend
      if (payload?.path) {
        void router.push(payload.path as string)
      }
      break

    case 'EXTEND_READY':
      // External app signals it's ready to receive auth
      if (appConfig.value.shareAuth && !authSent.value) {
        void sendAuthToIframe()
      }
      break

    default:
      // Unknown message type - could be from the iframe app itself
      break
  }
}

const sendAuthToIframe = async () => {
  if (!iframeRef.value?.contentWindow || !appConfig.value?.shareAuth) return

  // Get fresh Firebase token
  const firebaseToken = await firebaseAuth.getIdToken()

  const authData = {
    type: 'EXTEND_AUTH_DATA',
    payload: {
      // Firebase auth
      firebaseToken: firebaseToken || null,
      firebaseUser: firebaseAuth.user ? {
        uid: firebaseAuth.user.uid,
        email: firebaseAuth.user.email,
        displayName: firebaseAuth.user.displayName,
        photoURL: firebaseAuth.user.photoURL,
      } : null,

      // LP session info
      hasLpSession: firebaseAuth.hasActiveLpSession,
      lpAccountId: firebaseAuth.currentLpAccountId,
      lpToken: firebaseAuth.lpAccessToken || null,

      // Account context
      accountId: accountId.value,
    }
  }

  // Get the target origin from the iframe src
  try {
    const targetOrigin = new URL(iframeSrc.value).origin
    iframeRef.value.contentWindow.postMessage(authData, targetOrigin)
    authSent.value = true
  } catch (e) {
    console.error('Failed to send auth to iframe:', e)
  }
}

const onIframeLoad = () => {
  isLoading.value = false
  error.value = null

  // Send auth data after iframe loads if shareAuth is enabled
  if (appConfig.value?.shareAuth) {
    // Small delay to ensure iframe is ready
    setTimeout(() => {
      void sendAuthToIframe()
    }, 500)
  }
}

const onIframeError = () => {
  isLoading.value = false
  error.value = 'Failed to load the external application. Please try again.'
}

const goBack = () => {
  router.back()
}

const goHome = () => {
  void router.push({ name: ROUTE_NAMES.INDEX })
}

// Watch for auth changes and notify iframe
watch(() => firebaseAuth.hasActiveLpSession, () => {
  if (appConfig.value?.shareAuth && authSent.value) {
    void sendAuthToIframe()
  }
})

onMounted(() => {
  window.addEventListener('message', handleMessage)

  // Check if app requires LP and user is not connected
  if (appConfig.value?.requiresLp && !firebaseAuth.hasActiveLpSession) {
    error.value = 'This application requires a LivePerson connection. Please connect your LP account first.'
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped lang="scss">
.external-app-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;

  p {
    color: #666;
    font-size: 1rem;
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;

  h3 {
    margin: 16px 0 8px;
    font-size: 1.25rem;
  }

  p {
    margin: 0 0 24px;
    color: #666;
    max-width: 400px;
  }
}

.iframe-container {
  flex: 1;
  display: flex;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
