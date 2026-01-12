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
import { useACStore } from "src/stores/store-ac";
import { useUserStore } from "src/stores/store-user";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import type { AccountConfigItem, SettingGeneral } from "src/interfaces";
import { SettingProperty } from "src/constants";
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

  // Check if user has an active LP session before making LP-specific API calls
  // Use shell auth service or legacy token check
  const userStore = useUserStore();
  const legacyToken = userStore.getToken();
  const legacyTokenExp = userStore.auth?.exp;
  const hasValidLegacyToken = !!(
    legacyToken &&
    legacyTokenExp &&
    legacyTokenExp * 1000 > Date.now()
  );

  console.info("[MainLayout] LP session check:", {
    hasValidLegacyToken,
    legacyTokenExists: !!legacyToken,
  });

  if (!hasValidLegacyToken) {
    // No LP session - user can still see the app, but LP features will be disabled
    console.info(
      "No LP session - skipping LP API calls. User can access non-LP features."
    );

    // Don't try to fetch LP data, just let the app render
    // The UI should show LP features as disabled/greyed out
    return;
  }

  // Only fetch LP-specific data if we have LP access
  // Wrap in try-catch to handle auth failures gracefully
  try {
    const config = await useACStore().getAccountConfig();
    console.info("config", config);
    if (!config || (Array.isArray(config) && config.length === 0)) {
      // Config fetch failed or returned empty - likely auth issue
      console.warn(
        "Failed to fetch account config - may need to re-authenticate"
      );
      // Don't block, continue with defaults
    } else {
      const themeConfig = config.find(
        (item: { id: SettingProperty | string }) =>
          String(item.id) === String(SettingProperty.THEME)
      );
      const theme = themeConfig as unknown as AccountConfigItem<SettingGeneral>;
      console.info("theme", SettingProperty.THEME, theme);
      const themeValue = theme?.propertyValue?.value;
      const dark = themeValue === "dark";
      useUserStore().setDark(dark);
    }

    await useACStore().getApplication();
    await Promise.all([useACStore().getBrandDetails()]);
    const _user = await useUserStore().getSelf();
    if (!_user) {
      // No user found even with LP token - something is wrong
      console.warn("LP session exists but getSelf() failed");
    }
  } catch (error) {
    console.error("Error loading LP data:", error);
    // Just continue without LP data
  }
});
</script>
