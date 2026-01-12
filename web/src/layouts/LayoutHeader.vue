<template>
  <q-header :class="{ dark: $q.dark.isActive }">
    <div class="lp-ribbon-alt top vw-100 h-5 z-4"></div>
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        :color="color('white', 'indigo-7')"
        icon="sym_o_menu"
        aria-label="Menu"
        @click="$emit('toggleLeftDrawer')"
      />
      <q-toolbar-title>
        <div class="fr f-rem-1-4 h-40">
          <q-img src="~assets/images/LivePerson_logo.webp" id="lp-logo" />
          <div class="fr w-fc" :class="dark ? 'text-white' : 'lp-theme-text'">
            <span
              class="fw900 ff-space-bold f-rem-1-0 mt-20 ml-10 lp-grad-text-dark-orange"
            >
              {{ APP_NAME }}
            </span>
          </div>
          <div class="ml-10 mr-10 fc jc-c f-rem-1" v-if="route?.meta?.title">
            <q-icon
              name="sym_o_double_arrow"
              :class="$q.dark.isActive ? 'lp-grad-text-dark' : 'lp-grad-text'"
            />
          </div>
          <div
            v-if="route?.meta?.title"
            class="fc jc-c f-rem-0-8"
            :class="dark ? 'text-grey-4' : 'text-grey-8'"
          >
            {{ route?.meta?.title }}
          </div>
        </div>
      </q-toolbar-title>
      <q-space></q-space>
      <!-- LP Account Selector -->
      <div
        v-if="sessionStore.isAuthenticated"
        class="lp-account-section q-mr-md"
      >
        <q-btn
          flat
          no-caps
          :label="currentAccountLabel"
          :icon="hasLpSession ? 'business' : 'business_center'"
          :color="hasLpSession ? 'positive' : 'grey-7'"
          class="account-btn"
          @click="openAccountDialog"
        >
          <q-badge v-if="!hasLpSession" color="warning" floating>!</q-badge>
          <q-tooltip>{{ connectionTooltip }}</q-tooltip>
        </q-btn>
      </div>

      <!-- Dark Mode Toggle -->
      <q-btn
        flat
        round
        :icon="darkMode ? 'sym_o_light_mode' : 'sym_o_dark_mode'"
        class="dark-mode-toggle q-mr-sm"
        @click="toggleDarkMode"
      >
        <q-tooltip>{{ darkMode ? "Light Mode" : "Dark Mode" }}</q-tooltip>
      </q-btn>

      <!-- User Menu -->
      <q-btn v-if="sessionStore.isAuthenticated" flat round>
        <q-avatar size="36px">
          <img
            v-if="sessionStore.preferences.photoUrl"
            :src="sessionStore.preferences.photoUrl"
          />
          <q-icon v-else name="person" />
        </q-avatar>
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ sessionStore.userDisplayName }}
                </q-item-label>
                <q-item-label caption>{{
                  sessionStore.userEmail
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <!-- Dark Mode Toggle in Menu -->
            <q-item clickable @click="toggleDarkMode">
              <q-item-section avatar>
                <q-icon
                  :name="darkMode ? 'sym_o_light_mode' : 'sym_o_dark_mode'"
                />
              </q-item-section>
              <q-item-section>{{
                darkMode ? "Light Mode" : "Dark Mode"
              }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="goToAccountSetup">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Account Settings</q-item-section>
            </q-item>
            <q-item clickable @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Sign Out</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <!-- <div class="fc jc-c">
        <q-toggle
        v-model="darkMode"
        checked-icon="sym_o_dark_mode"
        :color="darkMode ? 'info' : 'amber'"
        keep-color
        unchecked-icon="sym_o_light_mode"
        />
      </div>
      <q-btn round>
        <q-avatar v-if="user">
          <q-img :src="user?.pictureUrl" v-if="user?.pictureUrl" error-src="~assets/images/user-account.png" />
          <q-img src="~assets/images/user-account.png" v-else/>
          <q-menu class="ff-exo menu-glass" :style="style">
            <q-card
            class="card-glass"
            :class="{'dark': !!dark }"
            style="width: 300px"
            :style="style"
            >
              <CardHeader
              :title="useUserStore().user?.fullName || 'User Account'"
              icon="account_circle"
              ></CardHeader>
              <q-card-section>
                <q-list>
                  v-if="hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN])"
                  <q-item

                  clickable
                  @click="router.push({ name: ROUTE_NAMES.ADMINISTRATION })"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_security"></q-icon>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Administration</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable
                  class="select-menu"
                  @click="logout"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_logout"></q-icon>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Logout</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                  class="select-menu"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_dark_mode"></q-icon>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Dark mode</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-toggle
                      v-model="darkMode"
                      checked-icon="sym_o_dark_mode"
                      :color="darkMode ? 'info' : 'amber'"
                      keep-color
                      unchecked-icon="sym_o_light_mode"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-menu>
        </q-avatar>
      </q-btn> -->
    </q-toolbar>
  </q-header>
  !-- LP Account Connection Dialog -->
  <q-dialog v-model="showAccountDialog" persistent>
    <q-card style="min-width: 400px; max-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">LivePerson Account</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <!-- Current Connection Status -->
        <div v-if="hasLpSession" class="q-mb-md">
          <q-banner class="bg-positive text-white" rounded>
            <template v-slot:avatar>
              <q-icon name="check_circle" />
            </template>
            Connected to account {{ currentLpAccountId }}
          </q-banner>
        </div>

        <!-- Account ID Input -->
        <q-input
          v-model="accountIdInput"
          filled
          label="LivePerson Account ID"
          hint="Enter your LP account ID"
          class="q-mb-md"
          @keyup.enter="connectToAccount"
        >
          <template #prepend>
            <q-icon name="business" />
          </template>
        </q-input>

        <!-- SSO Info Banner -->
        <q-banner
          class="bg-blue-1 q-mb-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="info" color="primary" />
          </template>
          SSO login grants full access to LP features and APIs.
        </q-banner>

        <!-- Linked Accounts -->
        <div v-if="linkedAccounts.length > 0" class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">Your Linked Accounts</div>
          <q-list bordered separator class="rounded-borders">
            <q-item
              v-for="acc in linkedAccounts"
              :key="acc"
              clickable
              @click="quickConnect(acc)"
            >
              <q-item-section avatar>
                <q-icon
                  :name="
                    acc === currentLpAccountId
                      ? 'radio_button_checked'
                      : 'radio_button_unchecked'
                  "
                  :color="acc === currentLpAccountId ? 'primary' : 'grey'"
                />
              </q-item-section>
              <q-item-section>{{ acc }}</q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="arrow_forward"
                  @click.stop="navigateToAccount(acc)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          unelevated
          label="Connect with SSO"
          color="primary"
          :loading="isConnecting"
          :disable="!accountIdInput"
          @click="connectToAccount"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ROUTE_NAMES, /* ROLES, */ APP_NAME } from "src/constants";
import { ref, onMounted, watch, computed } from "vue";
import { useSessionStore } from "src/stores/store-session";
import { useAppStore } from "src/stores/store-app";
import { useUserStore } from "src/stores/store-user";
import { storeToRefs } from "pinia";
import { Notify, Dark, useQuasar } from "quasar";
import { color } from "src/utils/common";
defineEmits(["toggleLeftDrawer"]);
const val = ref("Hello from template.vue");
import { useRoute, useRouter } from "vue-router";

const sessionStore = useSessionStore();
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const { dark } = storeToRefs(useAppStore());
// const { style, user /* hasRole */ } = storeToRefs(useUserStore());

const userStore = useUserStore();

const darkMode = computed({
  get: () => useUserStore().dark,
  set: (value) => useUserStore().setDark(value),
});

// Dark mode
// const darkMode = computed({
//   get: () => userStore.dark,
//   set: (value) => userStore.setDark(value),
// });
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
};

// const logout = async () => {
//   try {
//     await useUserStore().logout();
//     await router.push({ name: "login" });
//   } catch (e) {
//     console.error(e);
//   }
// };

const handleLogout = async () => {
  await sessionStore.logout();
  void router.push({ name: ROUTE_NAMES.LOGIN });
};

const routeInfo = ref();
const loadRoute = () => {
  routeInfo.value = route;
};
watch(route, () => {
  loadRoute();
});
// const goTohome = async () => {
//   await router.push({ name: ROUTE_NAMES.APP })
// }

const showAccountDialog = ref(false);
const accountIdInput = ref("");
const isConnecting = ref(false);

const hasLpSession = computed(() => sessionStore.hasActiveLpSession);
const currentLpAccountId = computed(() => sessionStore.currentLpAccountId);
const linkedAccounts = computed(() => sessionStore.linkedAccounts);
const hasExpiredSession = computed(
  () => !hasLpSession.value && !!sessionStore.activeLpAccountId
);

const openAccountDialog = () => {
  // Pre-populate with current account ID if available
  if (currentLpAccountId.value && !accountIdInput.value) {
    accountIdInput.value = currentLpAccountId.value;
  }
  showAccountDialog.value = true;
};

const connectToAccount = async () => {
  if (!accountIdInput.value) return;

  isConnecting.value = true;
  try {
    // Get LP domains to verify account
    await userStore.getlpDomains(accountIdInput.value, true);

    // Initiate LP SSO
    const url = await userStore.getSentinelUrl(accountIdInput.value);
    if (url) {
      sessionStorage.setItem("pendingLpAccountId", accountIdInput.value);
      window.location.href = url;
    } else {
      throw new Error("Failed to get SSO URL");
    }
  } catch (error) {
    console.error("Error connecting:", error);
    Notify.create({
      type: "negative",
      message: "Failed to connect to account",
      caption: "Please verify the account ID",
    });
  } finally {
    isConnecting.value = false;
  }
};

const quickConnect = (accountId: string) => {
  accountIdInput.value = accountId;
};

const navigateToAccount = (accountId: string) => {
  showAccountDialog.value = false;
  void router.push({
    name: ROUTE_NAMES.APPS,
    params: { accountId },
  });
};

const goToAccountSetup = () => {
  void router.push({ name: ROUTE_NAMES.ACCOUNT_SETUP });
};

const currentAccountLabel = computed(() => {
  if (currentLpAccountId.value) {
    return `Account: ${currentLpAccountId.value}`;
  }
  return "Connect LP Account";
});

const connectionTooltip = computed(() => {
  if (hasLpSession.value) return "Connected to LP";
  if (hasExpiredSession.value) return "Session expired - click to reconnect";
  if (currentLpAccountId.value) return "Click to connect to LP";
  return "Not connected to LivePerson";
});

onMounted(() => {
  console.log(val, route);
  if (useAppStore().dark) {
    Dark.set(true);
  }
  loadRoute();
});
</script>

<style scoped lang="scss">
// .q-header {
//   background-color: #e4e5ec;
//   &.dark {
//     background-color: #33355d;
//   }
// }
.app-ico {
  height: 30px;
}
#app-ico-avatar {
  height: 30px;
  width: 30px;
}
#lp-logo {
  height: 10px;
  width: 63px;
  margin-top: 0px;
  margin-left: 10px;
}
.q-header {
  height: 50px;
}
</style>
