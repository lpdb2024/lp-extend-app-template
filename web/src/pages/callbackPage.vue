<template>
  <q-page class="w100 h100 fc jc-c ">
    <q-img class="m-a" height="120px" width="120px" src="/images/logos/conversational-cloud.png"></q-img>
    <div v-if="isPopup" class="text-center q-mt-md text-grey-6">
      Authenticating...
    </div>
    <div v-if="errorMsg" class="text-center q-mt-md text-negative">
      {{ errorMsg }}
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ROUTE_NAMES } from 'src/constants'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/store-user'
import { useAppStore } from 'src/stores/store-app'
import { getAppAuthInstance } from '@lpextend/client-sdk'

const router = useRouter()
const isPopup = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const auth = getAppAuthInstance()

  // Check if this is a popup window (for auto-login)
  const lpSsoPopupFlag = localStorage.getItem('lpSsoPopup')
  const isPopupWindow = lpSsoPopupFlag === 'true' || (window.opener !== null && window.opener !== window)
  isPopup.value = isPopupWindow

  const userStore = useUserStore()
  const appRoute = userStore.appRoute

  try {
    // Use SDK's handleCallback() — reads code/state from URL params,
    // exchanges code for tokens, and creates an SDK session
    console.info('[Callback] Calling auth.handleCallback()...')
    await auth.handleCallback()

    const isAuthenticated = auth.isAuthenticated()
    const accountId = auth.getAccountId()
    console.info('[Callback] Post-handleCallback auth state:', {
      isAuthenticated,
      accountId,
      userId: auth.getUserId(),
      strategy: auth.getStrategy(),
      session: auth.getSession(),
    })

    if (!isAuthenticated) {
      console.error('[Callback] handleCallback completed but session not created')
      errorMsg.value = 'Authentication failed — session was not created.'
      handlePopupFailure(isPopupWindow)
      return
    }

    // Sync accountId to stores
    if (accountId) {
      useAppStore().setaccountId(accountId)
      userStore.setaccountId(accountId)
    }

    // Fetch user info
    try {
      await userStore.getSelf()
    } catch (err) {
      console.warn('[Callback] getSelf failed:', err)
    }

    // If this is a popup window, notify the opener and close
    if (isPopupWindow) {
      console.info('[Callback] Popup mode - auth success')
      localStorage.removeItem('lpSsoPopup')
      localStorage.removeItem('pendingLpAccountId')

      if (window.opener) {
        console.info('[Callback] Notifying opener of success')
        window.opener.postMessage({ type: 'LP_SSO_SUCCESS', accountId }, window.location.origin)
      }

      setTimeout(() => {
        window.close()
      }, 500)
      return
    }

    // Normal flow - navigate to the app
    if (appRoute) {
      console.info('[Callback] Redirecting to appRoute:', appRoute)
      await router.push({ name: appRoute, params: { accountId: accountId || '' } }).catch(err => {
        console.error('[Callback] Navigation error:', err)
      })
      return
    }
    await router.push({ name: ROUTE_NAMES.INDEX }).catch(err => {
      console.error('[Callback] Navigation error:', err)
    })
  } catch (error) {
    console.error('[Callback] handleCallback failed:', error)
    errorMsg.value = 'Authentication failed. Please try again.'
    handlePopupFailure(isPopupWindow)

    // In non-popup mode, redirect to login after a delay
    if (!isPopupWindow) {
      setTimeout(() => {
        router.push({ name: ROUTE_NAMES.LOGIN }).catch(() => {})
      }, 3000)
    }
  }
})

function handlePopupFailure(isPopupWindow: boolean) {
  if (!isPopupWindow) return
  console.info('[Callback] Popup mode - auth failed')
  localStorage.removeItem('lpSsoPopup')
  localStorage.removeItem('pendingLpAccountId')

  if (window.opener) {
    window.opener.postMessage({ type: 'LP_SSO_FAILURE' }, window.location.origin)
  }

  setTimeout(() => {
    window.close()
  }, 500)
}
</script>

<style lang="scss" scoped>

.q-page {
  .q-img{
  animation: rotation 6s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
}

</style>
