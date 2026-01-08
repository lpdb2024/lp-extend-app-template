<template>
  <q-drawer
    :model-value="true"
    :mini="appStore.miniState"
    :width="280"
    :mini-width="72"
    bordered
    persistent
    show-if-above
    class="app-drawer"
  >
    <!-- Drawer Content -->
    <div class="drawer-content">
      <!-- Toggle Button (Top) -->
      <div class="drawer-section drawer-toggle-section">
        <q-btn
          flat
          round
          dense
          :icon="
            appStore.miniState ? 'sym_o_chevron_right' : 'sym_o_chevron_left'
          "
          class="toggle-btn"
          @click="toggleMiniState"
        >
          <q-tooltip
            v-if="appStore.miniState"
            anchor="center right"
            self="center left"
          >
            Expand menu
          </q-tooltip>
        </q-btn>
      </div>

      <!-- LP Account Selector -->
      <div class="drawer-section drawer-account-section">
        <div v-if="!appStore.miniState" class="account-selector">
          <q-btn
            flat
            no-caps
            class="account-btn full-width"
            @click="openAccountDialog"
          >
            <q-avatar size="32px" class="q-mr-sm">
              <q-icon
                :name="hasLpSession ? 'sym_o_domain' : 'sym_o_domain_disabled'"
                :color="hasLpSession ? 'positive' : 'grey-5'"
              />
            </q-avatar>
            <div class="account-info text-left">
              <div class="account-label text-weight-medium">
                {{ currentAccountLabel }}
              </div>
              <div class="account-status text-caption" :class="statusClass">
                {{ connectionStatus }}
              </div>
            </div>
            <q-space />
            <q-icon name="sym_o_unfold_more" size="18px" class="text-grey-6" />
          </q-btn>
        </div>
        <div v-else class="mini-account">
          <q-btn flat round size="md" @click="openAccountDialog">
            <q-avatar size="36px">
              <q-icon
                :name="hasLpSession ? 'sym_o_domain' : 'sym_o_domain_disabled'"
                :color="hasLpSession ? 'positive' : 'grey-5'"
              />
            </q-avatar>
            <q-badge v-if="!hasLpSession" color="warning" floating>!</q-badge>
            <q-tooltip anchor="center right" self="center left">
              {{ currentAccountLabel }}
            </q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Search -->
      <div
        class="drawer-section drawer-search-section"
        v-if="!appStore.miniState"
      >
        <q-input
          v-model="search"
          placeholder="Search apps..."
          filled
          dense
          clearable
          class="search-input"
        >
          <template #prepend>
            <q-icon name="sym_o_search" size="sm" />
          </template>
        </q-input>
      </div>
      <div v-else class="mini-search">
        <q-btn flat round size="md" @click="expandAndFocusSearch">
          <q-icon name="sym_o_search" />
          <q-tooltip anchor="center right" self="center left">
            Search apps
          </q-tooltip>
        </q-btn>
      </div>

      <!-- Applications List -->
      <div class="drawer-section drawer-apps-section">
        <q-list class="app-list">
          <q-item
            v-for="route in filteredRoutes"
            :key="route.path"
            :to="routePath(route.path)"
            clickable
            class="app-item"
            active-class="app-item--active"
          >
            <q-item-section side>
              <q-avatar square class="app-avatar" size="36px">
                <q-icon :name="getRouteIcon(route)" size="20px" />
              </q-avatar>
              <q-tooltip
                v-if="appStore.miniState"
                anchor="center right"
                self="center left"
              >
                {{ getRouteTitle(route) }}
              </q-tooltip>
            </q-item-section>
            <q-item-section v-if="!appStore.miniState">
              <q-item-label class="app-title">
                {{ getRouteTitle(route) }}
              </q-item-label>
              <q-item-label caption class="app-caption">
                {{ getRouteCaption(route) }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="filteredRoutes.length === 0 && !appStore.miniState"
            class="empty-state"
          >
            <q-item-section class="text-center">
              <q-icon
                name="sym_o_search_off"
                size="32px"
                color="grey-5"
                class="q-mb-sm"
              />
              <q-item-label class="text-grey-6">No apps found</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Spacer -->
      <q-space />

      <!-- Bottom Section: Profile & Settings -->
      <div class="drawer-section drawer-bottom-section">
        <!-- Dark Mode Toggle -->
        <q-item clickable @click="toggleDarkMode" class="bottom-item">
          <q-item-section side>
            <q-icon
              :name="darkMode ? 'sym_o_light_mode' : 'sym_o_dark_mode'"
              size="22px"
            />
            <q-tooltip
              v-if="appStore.miniState"
              anchor="center right"
              self="center left"
            >
              {{ darkMode ? "Light Mode" : "Dark Mode" }}
            </q-tooltip>
          </q-item-section>
          <q-item-section v-if="!appStore.miniState">
            {{ darkMode ? "Light Mode" : "Dark Mode" }}
          </q-item-section>
        </q-item>

        <!-- Settings -->
        <q-item clickable @click="goToAccountSetup" class="bottom-item">
          <q-item-section side>
            <q-icon name="sym_o_settings" size="22px" />
            <q-tooltip
              v-if="appStore.miniState"
              anchor="center right"
              self="center left"
            >
              Settings
            </q-tooltip>
          </q-item-section>
          <q-item-section v-if="!appStore.miniState"> Settings </q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <!-- User Profile -->
        <q-item clickable class="profile-item">
          <q-item-section side>
            <q-avatar size="36px" class="profile-avatar">
              <img
                v-if="firebaseAuth.user?.photoURL"
                :src="firebaseAuth.user.photoURL"
              />
              <q-icon v-else name="sym_o_person" size="20px" />
            </q-avatar>
            <q-tooltip
              v-if="appStore.miniState"
              anchor="center right"
              self="center left"
            >
              {{ firebaseAuth.userDisplayName || "User" }}
            </q-tooltip>
          </q-item-section>
          <q-item-section v-if="!appStore.miniState">
            <q-item-label class="text-weight-medium profile-name">
              {{ firebaseAuth.userDisplayName || "User" }}
            </q-item-label>
            <q-item-label caption class="profile-email">
              {{ firebaseAuth.userEmail }}
            </q-item-label>
          </q-item-section>
          <q-menu anchor="top right" self="bottom right">
            <q-list style="min-width: 180px">
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="sym_o_logout" />
                </q-item-section>
                <q-item-section>Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </div>
    </div>
  </q-drawer>

  <!-- LP Account Connection Dialog -->
  <q-dialog v-model="showAccountDialog" persistent>
    <q-card class="account-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">LivePerson Account</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator class="q-mt-sm" />

      <q-card-section>
        <!-- Current Connection Status -->
        <div v-if="hasLpSession" class="q-mb-md">
          <q-banner class="bg-positive text-white" rounded>
            <template #avatar>
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
          <template #avatar>
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Notify } from "quasar";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { useUserStore } from "src/stores/store-user";
import { useAppStore } from "src/stores/store-app";
import { ROUTE_NAMES } from "src/constants";
import type { RouteRecordRaw, RouteRecordNormalized } from "vue-router";
import type { AppRouteMeta } from "src/interfaces";

interface Props {
  navRoutes: (RouteRecordRaw | RouteRecordNormalized)[];
}

const props = defineProps<Props>();

const router = useRouter();
const firebaseAuth = useFirebaseAuthStore();
const userStore = useUserStore();
const appStore = useAppStore();

// Drawer state
// const miniState = ref(true);

const toggleMiniState = () => {
  appStore.miniState = !appStore.miniState;
};

// Search
const search = ref("");

const filteredRoutes = computed(() => {
  if (!search.value || search.value.trim().length === 0) {
    return props.navRoutes;
  }
  const searchLower = search.value.toLowerCase().trim();
  return props.navRoutes.filter((route) => {
    const meta = route?.meta as AppRouteMeta | undefined;
    const title = (meta?.title || route.name || "").toString().toLowerCase();
    const caption = (meta?.caption || "").toString().toLowerCase();
    return title.includes(searchLower) || caption.includes(searchLower);
  });
});

const expandAndFocusSearch = () => {
  appStore.miniState = false;
};

// Route helpers
function getRouteIcon(route: RouteRecordRaw | RouteRecordNormalized): string {
  return (route?.meta as AppRouteMeta)?.icon || "sym_o_apps";
}

function getRouteTitle(route: RouteRecordRaw | RouteRecordNormalized): string {
  return ((route?.meta as AppRouteMeta)?.title || route.name || "").toString();
}

function getRouteCaption(
  route: RouteRecordRaw | RouteRecordNormalized
): string {
  return ((route?.meta as AppRouteMeta)?.caption || "").toString();
}

function routePath(path: string) {
  const route = router.resolve(path);
  const accountId = router.currentRoute.value.params.accountId as
    | string
    | undefined;
  if (accountId && route.path.includes(":accountId")) {
    return route.path.replace(":accountId", accountId);
  }
  return route.path;
}

// Dark mode
const darkMode = computed({
  get: () => userStore.dark,
  set: (value) => userStore.setDark(value),
});

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
};

// LP Account
const showAccountDialog = ref(false);
const accountIdInput = ref("");
const isConnecting = ref(false);

const hasLpSession = computed(() => firebaseAuth.hasActiveLpSession);
const currentLpAccountId = computed(() => firebaseAuth.currentLpAccountId);
const linkedAccounts = computed(() => firebaseAuth.linkedAccounts);

const currentAccountLabel = computed(() => {
  if (currentLpAccountId.value) {
    return `Acc ${currentLpAccountId.value}`;
  }
  return "Connect Account";
});

const connectionStatus = computed(() => {
  if (hasLpSession.value) return "Connected";
  if (currentLpAccountId.value) return "Not authenticated";
  return "No account";
});

const statusClass = computed(() => {
  if (hasLpSession.value) return "text-positive";
  if (currentLpAccountId.value) return "text-warning";
  return "text-grey-6";
});

const openAccountDialog = () => {
  if (currentLpAccountId.value && !accountIdInput.value) {
    accountIdInput.value = currentLpAccountId.value;
  }
  showAccountDialog.value = true;
};

const connectToAccount = async () => {
  if (!accountIdInput.value) return;

  isConnecting.value = true;
  try {
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

// Navigation
const goToAccountSetup = () => {
  void router.push({ name: ROUTE_NAMES.ACCOUNT_SETUP });
};

const handleLogout = async () => {
  await firebaseAuth.logout();
  void router.push({ name: ROUTE_NAMES.LOGIN });
};
</script>

<style scoped lang="scss">
// Color variables - Light mode
$light-bg: #f8f9fc;
$light-bg-hover: #f0f2f8;
$light-border: rgba(0, 0, 0, 0.08);
$light-text: #1a1a2e;
$light-text-secondary: #64748b;
$light-accent: #3863e5;
$light-accent-secondary: #8d46eb;

// Color variables - Dark mode
$dark-bg: #16112d;
$dark-bg-secondary: #1e1a3a;
$dark-bg-hover: #252145;
$dark-border: rgba(232, 73, 183, 0.15);
$dark-text: #f1f5f9;
$dark-text-secondary: #94a3b8;
$dark-accent: #e849b7;
$dark-accent-secondary: #31ccec;

.app-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 30%, #f0f4ff 100%);
  transition: all 0.3s ease;
  border-right: 1px solid rgba($light-accent, 0.1);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
        ellipse at 0% 0%,
        rgba($light-accent, 0.08) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 100% 100%,
        rgba($light-accent-secondary, 0.06) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 50% 50%,
        rgba(255, 255, 255, 0.8) 0%,
        transparent 70%
      );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba($light-accent, 0.2) 0%,
      rgba($light-accent-secondary, 0.15) 50%,
      rgba($light-accent, 0.1) 100%
    );
    pointer-events: none;
  }

  :deep(.q-drawer__content) {
    overflow: hidden;
  }
}

.body--dark .app-drawer {
  background: linear-gradient(180deg, $dark-bg 0%, darken($dark-bg, 2%) 100%);
  border-right: 1px solid rgba($dark-accent, 0.1);

  &::before {
    background: radial-gradient(
        ellipse at 20% 80%,
        rgba($dark-accent, 0.08) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 20%,
        rgba($dark-accent-secondary, 0.06) 0%,
        transparent 50%
      );
  }

  &::after {
    background: linear-gradient(
      180deg,
      rgba($dark-accent, 0.3) 0%,
      rgba($dark-accent-secondary, 0.2) 50%,
      rgba($dark-accent, 0.15) 100%
    );
  }
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

// Toggle Section
.drawer-toggle-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}

.toggle-btn {
  color: $light-text-secondary;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: $light-text;
  }

  .body--dark & {
    color: $dark-text-secondary;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: $dark-text;
    }
  }
}

// Account Section
.drawer-account-section {
  margin-bottom: 8px;
}

.account-btn {
  padding: 10px 14px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba($light-accent, 0.05) 0%,
    rgba($light-accent-secondary, 0.03) 100%
  );
  border: 1px solid rgba($light-accent, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba($light-accent, 0.08) 0%,
      rgba($light-accent-secondary, 0.05) 100%
    );
    box-shadow: 0 2px 8px rgba($light-accent, 0.1);
  }

  .body--dark & {
    background: linear-gradient(
      135deg,
      rgba($dark-accent, 0.08) 0%,
      rgba($dark-accent-secondary, 0.05) 100%
    );
    border: 1px solid rgba($dark-accent, 0.15);

    &:hover {
      background: linear-gradient(
        135deg,
        rgba($dark-accent, 0.12) 0%,
        rgba($dark-accent-secondary, 0.08) 100%
      );
      box-shadow: 0 2px 8px rgba($dark-accent, 0.15);
    }
  }
}

.account-info {
  min-width: 120px;
  flex: 1;
  // overflow: hidden;
}

.account-label {
  font-size: 0.9rem;
  // white-space: nowrap;
  // overflow: hidden;
  // text-overflow: ellipsis;
  color: $light-text;

  .body--dark & {
    color: $dark-text;
  }
}

.account-status {
  font-size: 0.75rem;
}

.mini-account,
.mini-search {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

// Search
.drawer-search-section {
  margin-bottom: 12px;
}

.search-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      rgba($light-accent, 0.03) 0%,
      rgba(255, 255, 255, 0.8) 100%
    );
    border: 1px solid rgba($light-accent, 0.08);
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba($light-accent, 0.15);
      box-shadow: 0 2px 8px rgba($light-accent, 0.06);
    }
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: rgba($light-accent, 0.3);
    box-shadow: 0 2px 12px rgba($light-accent, 0.1);
  }

  .body--dark & {
    :deep(.q-field__control) {
      background: linear-gradient(
        135deg,
        rgba($dark-accent, 0.05) 0%,
        rgba($dark-accent-secondary, 0.03) 100%
      );
      border: 1px solid rgba($dark-accent, 0.1);

      &:hover {
        border-color: rgba($dark-accent, 0.2);
        box-shadow: 0 2px 8px rgba($dark-accent, 0.08);
      }
    }

    :deep(.q-field--focused .q-field__control) {
      border-color: rgba($dark-accent, 0.4);
      box-shadow: 0 2px 12px rgba($dark-accent, 0.15);
    }
  }
}

// Apps Section
.drawer-apps-section {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 -12px;
  padding: 0 12px;

  min-height: calc(100vh - 350px);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  .body--dark & {
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.app-list {
  padding: 0;
}

.app-item {
  border-radius: 12px;
  margin-bottom: 4px;
  padding: 8px 12px;
  min-height: 48px;
  transition: all 0.2s ease;

  // Reset any Quasar default label backgrounds
  :deep(.q-item__label) {
    background: transparent !important;
  }

  &:hover {
    background: linear-gradient(
      90deg,
      rgba($light-accent, 0.06) 0%,
      rgba($light-accent-secondary, 0.04) 100%
    );
    box-shadow: 0 2px 8px rgba($light-accent, 0.08);
  }

  &.app-item--active {
    background: linear-gradient(
      90deg,
      rgba($light-accent, 0.12) 0%,
      rgba($light-accent-secondary, 0.08) 100%
    );
    box-shadow: 0 2px 12px rgba($light-accent, 0.15);

    .app-avatar {
      background: linear-gradient(
        135deg,
        $light-accent,
        $light-accent-secondary
      );
      box-shadow: 0 4px 12px rgba($light-accent, 0.3);
    }
  }

  .body--dark & {
    color: $dark-text;

    :deep(.q-item__label) {
      color: $dark-text;
      background: transparent !important;
    }

    :deep(.q-item__label--caption) {
      color: $dark-text-secondary;
    }

    &:hover {
      background: linear-gradient(
        90deg,
        rgba($dark-accent, 0.08) 0%,
        rgba($dark-accent-secondary, 0.06) 100%
      );
      box-shadow: 0 2px 8px rgba($dark-accent, 0.1);

      .app-avatar {
        // Hover: sunken well with subtle lift
        box-shadow:
          inset 2px 2px 5px rgba(0, 0, 0, 0.6),
          inset 1px 1px 2px rgba(0, 0, 0, 0.4),
          inset -2px -2px 4px rgba(60, 55, 90, 0.35),
          0 0 8px rgba($dark-accent, 0.12);
        color: rgba(140, 130, 170, 0.9);

        :deep(.q-icon) {
          opacity: 0.95;
        }
      }
    }

    &.app-item--active {
      background: linear-gradient(
        90deg,
        rgba($dark-accent, 0.15) 0%,
        rgba($dark-accent-secondary, 0.1) 100%
      );
      box-shadow: 0 2px 12px rgba($dark-accent, 0.2);

      .app-avatar {
        // Active: deeper sunken well with accent glow
        box-shadow:
          inset 3px 3px 7px rgba(0, 0, 0, 0.7),
          inset 1px 1px 3px rgba(0, 0, 0, 0.5),
          inset -2px -2px 4px rgba(70, 60, 100, 0.3),
          0 0 12px rgba($dark-accent, 0.2);
        color: rgba($dark-accent, 0.85);

        :deep(.q-icon) {
          opacity: 1;
          text-shadow:
            -1px -1px 0 rgba($dark-accent, 0.3),
            1px 1px 2px rgba(0, 0, 0, 0.7),
            0 0 8px rgba($dark-accent, 0.4);
        }
      }
    }
  }
}

.app-avatar {
  border-radius: 8px;
  background: linear-gradient(135deg, #64748b, #475569);
  color: white;
  transition: all 0.2s ease;

  // Dark mode: Neumorphic sunken well with chiseled icon
  .body--dark & {
    // Background matches drawer - no contrast, appears as same surface
    background: $dark-bg;
    border: none;

    // Sunken well effect: dark shadows on top-left (depth), subtle light on bottom-right (reflected light from well edges)
    box-shadow:
      // Primary depth - dark shadow from top-left
      inset 3px 3px 6px rgba(0, 0, 0, 0.7),
      // Secondary depth - softer spread
      inset 1px 1px 3px rgba(0, 0, 0, 0.5),
      // Bottom-right highlight - light catching the inner edge of the well
      inset -2px -2px 4px rgba(50, 45, 80, 0.4),
      // Subtle ambient occlusion around edges
      inset 0 0 2px rgba(0, 0, 0, 0.3);

    // Icon color - muted to blend with the sunken container
    color: rgba(120, 110, 150, 0.85);

    // Chiseled icon: appears carved INTO the sunken surface
    :deep(.q-icon) {
      // Dark shadow on bottom-right (icon is recessed, shadow falls away from light)
      // Light highlight on top-left (edge catching light)
      text-shadow:
        -1px -1px 0 rgba(70, 60, 100, 0.5),
        1px 1px 2px rgba(0, 0, 0, 0.8);
      opacity: 0.9;
    }
  }
}

.app-title {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
  color: $light-text;
  background: transparent !important;

  .body--dark & {
    color: $dark-text;
  }
}

.app-caption {
  font-size: 0.75rem;
  color: $light-text-secondary;
  background: transparent !important;

  .body--dark & {
    color: $dark-text-secondary;
  }
}

.empty-state {
  padding: 24px 16px;
  flex-direction: column;
}

// Bottom Section
.drawer-bottom-section {
  border-top: 1px solid $light-border;
  padding-top: 8px;
  margin-top: 8px;

  .body--dark & {
    border-top-color: $dark-border;
  }
}

.bottom-item {
  border-radius: 10px;
  min-height: 40px;
  padding: 8px 12px;
  color: $light-text-secondary;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(
      90deg,
      rgba($light-accent, 0.05) 0%,
      rgba($light-accent-secondary, 0.03) 100%
    );
    color: $light-text;
  }

  .body--dark & {
    color: $dark-text-secondary;

    &:hover {
      background: linear-gradient(
        90deg,
        rgba($dark-accent, 0.08) 0%,
        rgba($dark-accent-secondary, 0.05) 100%
      );
      color: $dark-text;
    }
  }
}

.profile-item {
  border-radius: 10px;
  padding: 8px 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .body--dark & {
    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  }
}

.profile-avatar {
  background: linear-gradient(135deg, $light-accent, $light-accent-secondary);
  color: white;
  box-shadow: 0 4px 12px rgba($light-accent, 0.25);
  transition: all 0.2s ease;

  .body--dark & {
    background: linear-gradient(135deg, $dark-accent, $dark-accent-secondary);
    box-shadow: 0 4px 12px rgba($dark-accent, 0.3);
  }
}

.profile-name {
  font-size: 0.875rem;
  color: $light-text;

  .body--dark & {
    color: $dark-text;
  }
}

.profile-email {
  font-size: 0.75rem;
  color: $light-text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;

  .body--dark & {
    color: $dark-text-secondary;
  }
}

// Dialog
.account-dialog {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
}

// Transitions
.drawer-section {
  transition: all 0.3s ease;
}
</style>
