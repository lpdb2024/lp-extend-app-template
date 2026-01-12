<template>
  <q-layout view="hHh Lpr lFf" class="ff-inter layout-home">
    <!-- Header -->
    <q-header class="home-header bg-transparent">
      <q-toolbar class="home-toolbar">
        <!-- Logo/Brand -->
        <div class="brand-section">
          <q-avatar size="36px" class="brand-logo">
            <img src="/x-01.png" alt="Extend" />
          </q-avatar>
          <span class="brand-name ff-space-bold">Extend</span>
        </div>

        <q-space />

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
          <q-tooltip>{{ darkMode ? 'Light Mode' : 'Dark Mode' }}</q-tooltip>
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
                  <q-icon :name="darkMode ? 'sym_o_light_mode' : 'sym_o_dark_mode'" />
                </q-item-section>
                <q-item-section>{{ darkMode ? 'Light Mode' : 'Dark Mode' }}</q-item-section>
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
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- LP Account Connection Dialog -->
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
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "src/stores/store-session";
import { useUserStore } from "src/stores/store-user";
import { ROUTE_NAMES } from "src/constants";
import { Notify } from "quasar";

const router = useRouter();
const sessionStore = useSessionStore();
const userStore = useUserStore();

// Dark mode
const darkMode = computed({
  get: () => userStore.dark,
  set: (value) => userStore.setDark(value),
});
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
};

const showAccountDialog = ref(false);
const accountIdInput = ref("");
const isConnecting = ref(false);

const hasLpSession = computed(() => sessionStore.hasActiveLpSession);
const currentLpAccountId = computed(() => sessionStore.currentLpAccountId);
const linkedAccounts = computed(() => sessionStore.linkedAccounts);
const hasExpiredSession = computed(() => !hasLpSession.value && !!sessionStore.activeLpAccountId);

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
  // Initialize session from SDK if authenticated
  if (sessionStore.isAuthenticated) {
    sessionStore.initFromSdk();
  }
});

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

const handleLogout = async () => {
  await sessionStore.logout();
  void router.push({ name: ROUTE_NAMES.LOGIN });
};
</script>

<style scoped lang="scss">
.layout-home {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  min-height: 100vh;
}

.home-header {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.home-toolbar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 8px 24px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-name {
  font-size: 1.25rem;
  color: #333;
}

.account-btn {
  border-radius: 8px;
}

.body--dark {
  .layout-home {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .home-header {
    background: rgba(30, 30, 46, 0.9) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .brand-name {
    color: #fff;
  }
}
</style>
