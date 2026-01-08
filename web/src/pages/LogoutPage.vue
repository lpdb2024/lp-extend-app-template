<template>
  <q-page class="w100 h100 fc jc-c ">
    <q-img class="m-a" height="120px" width="120px" src="/images/logos/conversational-cloud.png"></q-img>
    redirectUrl{{redirectUrl}}
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
// import { ROUTE_NAMES } from 'src/constants/constants'
import { useRoute } from 'vue-router'
// import { useUserStore } from 'stores/store-user'
const route = useRoute()
// const router = useRouter()
const redirectUrl = ref('')
onMounted(() => {
  console.info('href', window.location.href)
  const redirect = localStorage.getItem(route.query.r as string)
  // get after r= in url
  console.info(route.query)
  // const redirect = localStorage.getItem('redirectUrl')
  redirectUrl.value = redirect || ''
  console.info('redirect', redirect)
  if (redirect) {
    localStorage.removeItem('redirectUrl')
    if (redirect) {
      const newWindow = window.open(redirect, '_self');
      if (newWindow) {
        newWindow.close();
      }
    }
  }
  // if (redirect) {
  //   localStorage.removeItem('redirectUrl')
  //   window
  //     .open(redirect, '_self')
  //     .close()
  // }
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
