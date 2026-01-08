<template>
  <q-layout
    view="lHh Lpr lFf"
    class="ff-inter"
    id="fullpage-layout"
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
import { ROUTE_NAMES } from "src/constants";
import { useACStore } from "src/stores/store-ac";
import { useUserStore } from "src/stores/store-user";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { onBeforeMount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import ExternalApp from "src/pages/ExternalApp.vue";
import type { AccountConfigItem, SettingGeneral } from "src/interfaces";
import { SettingProperty } from "src/constants";
import { useAppStore } from "src/stores/store-app";
import { isInShellMode, shellAuthState } from "src/services/shell-auth.service";
const { style, navRoutes } = storeToRefs(useUserStore());
const firebaseAuth = useFirebaseAuthStore();

const router = useRouter();

const appStore = useAppStore();
const ready = ref(false);
onMounted(async () => {
  await nextTick();
  ready.value = true;
});

onBeforeMount(async () => {
  // SHELL MODE: If running in LP Extend iframe, skip account checks
  // Shell provides authentication via token and account context
  if (isInShellMode.value) {
    console.log("[EmptyLayout] Running in shell mode, using shell context");

    // Use accountId from shell context
    const shellAccountId = shellAuthState.context.value?.accountId;
    if (shellAccountId) {
      useAppStore().setaccountId(shellAccountId);
      useUserStore().setaccountId(shellAccountId);
      console.log(
        "[EmptyLayout] Set accountId from shell context:",
        shellAccountId
      );
    }

    // Initialize navRoutes for shell mode
    const isDev = import.meta.env.MODE === "development";
    const allRoutes = router.getRoutes();
    navRoutes.value =
      allRoutes.filter((route) => {
        return (
          route.meta.type === "external" ||
          route.meta.isNav ||
          route.meta.active ||
          (route.meta.activeDev && isDev)
        );
      }) || [];

    // In shell mode, we trust the shell for auth - don't redirect to login
    return;
  }

  // STANDALONE MODE: Normal account/auth checks
  const isDev = import.meta.env.MODE === "development";
  const accountId = firebaseAuth.activeLpAccountId;

  // Initialize navRoutes regardless of auth state (needed to render page)
  const allRoutes = router.getRoutes();
  navRoutes.value =
    allRoutes.filter((route) => {
      return (
        route.meta.type === "external" ||
        route.meta.isNav ||
        route.meta.active ||
        (route.meta.activeDev && isDev)
      );
    }) || [];

  // If no accountId, the authGuard will handle redirects
  // Just let the page render - authGuard handles auth
  if (!accountId) {
    console.log("[EmptyLayout] No accountId set, authGuard will handle redirects");
    return;
  }

  useAppStore().setaccountId(accountId);
  useUserStore().setaccountId(accountId); // Also set in user store for store-ac.ts
  interface RouteMeta {
    title?: string;
    active?: boolean;
    type?: string;
    isNav?: boolean;
    activeDev?: boolean;
    external?: boolean;
    [key: string]: unknown;
  }

  const installApps: RouteMeta[] = [];
  for (const routeMeta of installApps || []) {
    if (
      !routeMeta.title ||
      typeof routeMeta.title !== "string" ||
      !routeMeta.active
    ) {
      continue;
    }
    console.log("routeMeta", routeMeta);
    router.addRoute(ROUTE_NAMES.APP, {
      name: routeMeta.title,
      path: `${routeMeta?.title?.toLowerCase()?.replace(/\s/g, "-")}`,
      component: ExternalApp,
      meta: {
        ...routeMeta,
        external: true,
      },
    });
  }
  // Check if user has an active LP session before making LP-specific API calls
  // Firebase auth alone is NOT enough to call LP APIs - we need LP SSO token
  const hasLpSession = firebaseAuth.hasActiveLpSession;

  // Only check legacy token if it's not expired
  // The legacy accessToken may be stale in localStorage even when session is invalid
  const userStore = useUserStore();
  const legacyToken = userStore.getToken();
  const legacyTokenExp = userStore.auth?.exp;
  const hasValidLegacyToken = !!(
    legacyToken &&
    legacyTokenExp &&
    legacyTokenExp * 1000 > Date.now()
  );

  console.info("[MainLayout] LP session check:", {
    hasLpSession,
    hasValidLegacyToken,
    legacyTokenExists: !!legacyToken,
  });

  if (!hasLpSession && !hasValidLegacyToken) {
    // User is Firebase-authenticated but doesn't have LP access
    // This is OK - they can still see the app, but LP features will be disabled
    console.info(
      "No LP session - skipping LP API calls. User can access non-LP features."
    );

    // No need to set user - the v-if condition no longer requires it
    // Firebase-authenticated users can see the app without LP session

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
    // Don't redirect to login - user is still Firebase-authenticated
    // Just continue without LP data
  }
});
</script>
