<template>
  <q-page class="w100 h100 fc jc-c ">
    <q-img class="m-a" height="120px" width="120px" src="/images/logos/conversational-cloud.png"></q-img>
    <div v-if="isPopup" class="text-center q-mt-md text-grey-6">
      Authenticating...
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ROUTE_NAMES } from 'src/constants'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/store-user'

const route = useRoute()
const router = useRouter()
const isPopup = ref(false)

onMounted(async () => {
  const { code } = route.query
  console.info(route.query)
  const q = code as string
  if (!q) {
    return
  }

  // Check if this is a popup window (for auto-login)
  // Use localStorage since sessionStorage is not shared and may be lost after SSO redirect
  // Also check window.opener as a secondary signal
  const lpSsoPopupFlag = localStorage.getItem('lpSsoPopup')
  const isPopupWindow = lpSsoPopupFlag === 'true' || (window.opener !== null && window.opener !== window)
  isPopup.value = isPopupWindow

  const r = useUserStore().appRoute
  const accountId = useUserStore().accountId
  const x = await useUserStore().authApp(String(q), `${location.protocol}//${location.host}/callback`)

  if (x) {
    console.info(`accountId: ${accountId}, appRoute: ${r}`)

    // If this is a popup window, notify the opener (if available) and close
    if (isPopupWindow) {
      console.info('[Callback] Popup mode - auth success')
      localStorage.removeItem('lpSsoPopup')
      localStorage.removeItem('pendingLpAccountId')

      // Try to notify opener if still available
      if (window.opener) {
        console.info('[Callback] Notifying opener of success')
        window.opener.postMessage({ type: 'LP_SSO_SUCCESS', accountId }, window.location.origin)
      } else {
        console.info('[Callback] No opener available (lost after redirect)')
      }

      // Close this popup window - the main window will detect via polling
      // Small delay to ensure message is sent
      setTimeout(() => {
        window.close()
      }, 500)
      return
    }

    // Normal flow - navigate to the app
    console.info('pushing route: ', { name: ROUTE_NAMES.APP, params: { accountId } })
    if (r) {
      const ro = { name: r, params: { accountId } }
      console.info('redirecting to:')
      console.info(ro)
      await router.push({ name: r, params: { accountId } }).catch(err => {
        console.error('Error while navigating:', err)
      })
      return
    }
    router.push({ name: ROUTE_NAMES.APPS, params: { accountId } }).catch(err => {
      console.error('Error while navigating:', err)
    })
  } else {
    // Auth failed
    if (isPopupWindow) {
      console.info('[Callback] Popup mode - auth failed')
      localStorage.removeItem('lpSsoPopup')
      localStorage.removeItem('pendingLpAccountId')

      if (window.opener) {
        window.opener.postMessage({ type: 'LP_SSO_FAILURE' }, window.location.origin)
      }

      // Close popup even on failure
      setTimeout(() => {
        window.close()
      }, 500)
    }
  }
})
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
