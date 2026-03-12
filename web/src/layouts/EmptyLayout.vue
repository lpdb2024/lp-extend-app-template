<template>
  <q-layout
    view="lHh Lpr lFf"
    class="ff-inter"
    id="main-layout"
    :class="{ '--mini-state': appStore.miniState }"
  >
    <q-page-container v-if="!!navRoutes && !!ready" class="ext-font-display">
      <router-view></router-view>
    </q-page-container>
    <div v-else>
      <q-spinner-dots
        class="absolute-center"
        size="5em"
        :color="style.dialogButton"
      />
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import { useUserStore } from "src/stores/store-user";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAppStore } from "src/stores/store-app";
import { getAppAuthInstance } from "@lpextend/client-sdk";
const { style, navRoutes } = storeToRefs(useUserStore());

const route = useRoute();

const appStore = useAppStore();
const ready = ref(false);
onMounted(async () => {
  await nextTick();
  ready.value = true;
});

onBeforeMount(async () => {
  const auth = getAppAuthInstance();

  // SHELL MODE: If running in LP Extend iframe, skip account checks
  // Shell provides authentication via token and account context
  if (auth.isInShell()) {
    console.log("[MainLayout] Running in shell mode, using shell context");

    // Use accountId from shell context
    const shellAccountId = auth.getAccountId();
    if (shellAccountId) {
      useAppStore().setaccountId(shellAccountId);
      useUserStore().setaccountId(shellAccountId);
      console.log(
        "[MainLayout] Set accountId from shell context:",
        shellAccountId
      );
    }

    // In shell mode, we trust the shell for auth - don't redirect to login
    return;
  }

  // Get accountId from route query params (child app loads in iframe with accountId query)
  const accountId = route.query.accountId ? String(route.query.accountId) : "";

  if (accountId) {
    useAppStore().setaccountId(accountId);
    useUserStore().setaccountId(accountId);
    console.log("[MainLayout] Set accountId from route query:", accountId);
  }

  // Check if user has an active LP session via SDK before making LP-specific API calls
  const userStore = useUserStore();
  const hasLpSession = auth.isAuthenticated();
  const sdkAccountId = auth.getAccountId();

  console.info("[EmptyLayout] LP session check:", {
    hasLpSession,
    sdkAccountId,
    strategy: auth.getStrategy(),
  });

  // Set accountId from SDK if available
  if (sdkAccountId) {
    useAppStore().setaccountId(sdkAccountId);
    userStore.setaccountId(sdkAccountId);
  }

  if (!hasLpSession) {
    // No LP session - user can still see the app, but LP features will be disabled
    console.info(
      "[EmptyLayout] No LP session - skipping LP API calls."
    );
    return;
  }

  // Validate session by calling /self (backend validates LP bearer token)
  const selfResult = await userStore.getSelf();
  if (!selfResult && hasLpSession) {
    // getSelf returned null with an active SDK session — session may have expired
    // If it was a 401, getSelf already redirects to login
    console.warn("[EmptyLayout] getSelf returned null — session may be invalid");
  }
});
</script>
