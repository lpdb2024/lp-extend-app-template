<template>
  <q-page class="ext-dashboard-page">
    <!-- Blueprint Background (subtle version) -->
    <div class="ext-dashboard-bg">
      <div class="ext-bg-gradient"></div>
      <svg class="ext-bg-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="dashGrid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              stroke-width="0.5"
              opacity="0.03"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dashGrid)" />
      </svg>
    </div>

    <!-- Header Section -->
    <ExtPageHeader
      title="Application Title"
      caption="blurb about the application"
      category="application category"
    >
      <template #actions>
        <div class="ext-header-search mt-a mb-a">
          <div class="ext-search-wrapper">
            <q-icon name="sym_o_search" class="ext-search-icon" />
            <input
              v-model="search"
              type="text"
              placeholder="Search applications..."
              class="ext-search-input"
            />
            <q-icon
              v-if="search"
              name="sym_o_close"
              class="ext-search-clear"
              @click="search = ''"
            />
          </div>
        </div>
      </template>
    </ExtPageHeader>

    <!-- LP Connection Banner (if not connected) -->
    <div v-if="!hasLpSession && !isLoading" class="ext-connection-banner">
      <div class="ext-banner-icon">
        <q-icon name="sym_o_link" size="24px" />
      </div>
      <div class="ext-banner-content">
        <strong>Connect to LivePerson</strong>
        <span
          >to unlock all features. Some applications require an LP account
          connection.</span
        >
      </div>
      <button class="ext-btn ext-btn--secondary" @click="showAccountSelector">
        Connect Account
      </button>
    </div>

    <!-- SDK Demo: Skills Display -->
    <div v-if="hasLpSession" class="ext-sdk-demo">
      <div class="ext-section-header">
        <div class="ext-section-icon lp">
          <q-icon name="sym_o_code" size="20px" />
        </div>
        <h2 class="ext-h2">SDK Demo: LivePerson Skills</h2>
        <q-btn
          flat
          dense
          color="primary"
          icon="sym_o_refresh"
          label="Refresh"
          :loading="skillsLoading"
          @click="fetchSkills"
        />
      </div>

      <div v-if="skillsLoading" class="ext-sdk-loading">
        <q-spinner-dots size="32px" color="primary" />
        <span>Fetching skills via SDK...</span>
      </div>

      <div v-else-if="skillsError" class="ext-sdk-error">
        <q-icon name="sym_o_error" size="24px" color="negative" />
        <span>{{ skillsError }}</span>
      </div>

      <div v-else-if="skills.length > 0" class="ext-sdk-result">
        <div class="ext-sdk-stats">
          <span class="ext-badge ext-badge--success">
            <q-icon name="sym_o_check_circle" size="14px" />
            {{ skills.length }} skills loaded via SDK
          </span>
        </div>
        <pre class="ext-sdk-json">{{ JSON.stringify(skills, null, 2) }}</pre>
      </div>

      <div v-else class="ext-sdk-empty">
        <q-icon name="sym_o_inbox" size="32px" color="grey" />
        <span>No skills found</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="ext-loading-state">
      <div class="ext-loading-spinner">
        <q-spinner-dots size="48px" color="primary" />
      </div>
      <p class="ext-body ext-text-secondary">Loading applications...</p>
    </div>

    <!-- App Categories -->
    <div v-else class="ext-app-sections">
      <!-- Built-in Apps Section -->
      <div v-if="filteredBuiltInApps.length > 0" class="ext-app-section">
        <div class="ext-section-header">
          <div class="ext-section-icon">
            <q-icon name="sym_o_build" size="20px" />
          </div>
          <h2 class="ext-h2">Platform Tools</h2>
        </div>
        <div class="ext-app-grid">
          <AppCard
            v-for="app in filteredBuiltInApps"
            :key="app.name || app.path"
            :app="app"
            :disabled="!!(app?.meta?.requiresLp && !hasLpSession)"
            :account-id="currentAccountId"
            @open="openApp"
            min-height="135"
          />
        </div>
      </div>

      <!-- LP Apps Section (requires connection) -->
      <div v-if="filteredLpApps.length > 0" class="ext-app-section">
        <div class="ext-section-header">
          <div class="ext-section-icon lp">
            <q-icon name="sym_o_chat" size="20px" />
          </div>
          <h2 class="ext-h2">LivePerson Applications</h2>
          <span v-if="!hasLpSession" class="ext-badge ext-badge--warning">
            <q-icon name="sym_o_lock" size="12px" />
            Requires Connection
          </span>
        </div>
        <div class="ext-app-grid">
          <AppCard
            v-for="app in filteredLpApps"
            :key="app.name || app.path"
            :app="app"
            :disabled="!hasLpSession"
            :account-id="currentAccountId"
            @open="openApp"
            :min-height="155"
          />
        </div>
      </div>

      <!-- External Apps Section -->
      <div v-if="filteredExternalApps.length > 0" class="ext-app-section">
        <div class="ext-section-header">
          <div class="ext-section-icon external">
            <q-icon name="sym_o_open_in_new" size="20px" />
          </div>
          <h2 class="ext-h2">External Applications</h2>
        </div>
        <div class="ext-app-grid">
          <AppCard
            v-for="app in filteredExternalApps"
            :key="app.name || app.path"
            :app="app"
            :disabled="false"
            :account-id="currentAccountId"
            @open="openApp"
            :min-height="155"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="allFilteredApps.length === 0" class="ext-empty-state">
        <div class="ext-empty-icon">
          <q-icon name="sym_o_search_off" size="64px" />
        </div>
        <h3 class="ext-h3">No applications found</h3>
        <p class="ext-body ext-text-muted">Try adjusting your search term</p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { RouteRecordNormalized } from "vue-router";
import { useRouter } from "vue-router";
import { useAuth } from "src/composables/useAuth";
import { ROUTE_NAMES } from "src/constants";
import AppCard from "src/components/AppCard.vue";
import { getApplications } from "src/utils/common";
import { APP_TYPES } from "src/router/routes";
import ExtPageHeader from "src/components/common-ui/ExtPageHeader.vue";
import { initSDK, getSDK, isSDKInitialized } from "src/services/LPExtendSDKService";
import type { LPSkill } from "@lpextend/client-sdk";

// type AppDefinition = ReturnType<typeof getApplications>[number];

const router = useRouter();
const { isAuthenticated, accountId, isInShellMode } = useAuth();

// SDK Demo: Skills data
const skills = ref<LPSkill[]>([]);
const skillsLoading = ref(false);
const skillsError = ref<string | null>(null);

const search = ref("");
const isLoading = ref(true);

// In shell mode, we're always "connected" via the shell token
// In standalone mode, check if authenticated
const hasLpSession = computed(() => {
  if (isInShellMode.value) return true;
  return isAuthenticated.value;
});
const currentAccountId = computed(() => accountId.value);

const allApps = getApplications();

// Categorized apps
const builtInApps = computed(() => allApps.filter((a) => a?.meta.isNav));
const lpApps = computed(() =>
  allApps.filter((a) => a.meta.appType === APP_TYPES.LP)
);
const externalApps = computed(() =>
  allApps.filter((a) => a.meta.appType === APP_TYPES.EXTERNAL)
);

// Filtered apps based on search
const filterApps = (apps: RouteRecordNormalized[]) => {
  if (!search.value?.trim()) return apps;
  const term = search.value.toLowerCase().trim();
  return apps.filter((app) => {
    const title = (app.meta.title as string) || "";
    const description = (app.meta.description as string) || "";
    return (
      title.toLowerCase().includes(term) ||
      description.toLowerCase().includes(term)
    );
  });
};

const filteredBuiltInApps = computed(() => filterApps(builtInApps.value));
const filteredLpApps = computed(() => filterApps(lpApps.value));
const filteredExternalApps = computed(() => filterApps(externalApps.value));
const allFilteredApps = computed(() => [
  ...filteredBuiltInApps.value,
  ...filteredLpApps.value,
  ...filteredExternalApps.value,
]);

// SDK Demo: Fetch skills from LivePerson
const fetchSkills = async () => {
  skillsLoading.value = true;
  skillsError.value = null;

  try {
    // Initialize SDK if not already done
    // initSDK will get token from URL params (shellToken) or other sources
    if (!isSDKInitialized()) {
      await initSDK();
    }

    const sdk = getSDK();
    const response = await sdk.skills.getAll();
    skills.value = response.data || [];
    console.log("[SDK Demo] Fetched skills:", skills.value);
  } catch (error) {
    console.error("[SDK Demo] Error fetching skills:", error);
    skillsError.value = error instanceof Error ? error.message : "Failed to fetch skills";
  } finally {
    skillsLoading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;

  try {
    // In shell mode, auth is handled by shell - no additional profile fetch needed
    // In standalone mode, the auth composable handles initialization
    // Just wait a moment for auth to initialize
    await new Promise((resolve) => setTimeout(resolve, 100));

    // SDK Demo: Automatically fetch skills if connected
    if (hasLpSession.value && accountId.value) {
      await fetchSkills();
    }
  } finally {
    isLoading.value = false;
  }
});

const showAccountSelector = () => {
  void router.push({ name: ROUTE_NAMES.ACCOUNT_SETUP });
};

const openApp = (app: RouteRecordNormalized) => {
  if (app.meta.requiresLp && !hasLpSession.value) {
    showAccountSelector();
    return;
  }

  const accountId = currentAccountId.value;

  // Handle external apps
  if (app.meta.appType === APP_TYPES.EXTERNAL && app.meta.externalUrl) {
    if (app.meta.openInNewTab) {
      // Open in new tab without iframe
      const url =
        typeof app.meta.externalUrl === "string" ? app.meta.externalUrl : "";
      if (url) window.open(url, "_blank");
    } else if (accountId) {
      // Open in iframe via external app route
      void router.push({
        name: ROUTE_NAMES.EXTERNAL_APP,
        params: {
          accountId,
          appName: String(app.name),
        },
        query: {
          url:
            typeof app.meta?.externalUrl === "string"
              ? app.meta.externalUrl
              : "",
          title: typeof app.meta?.title === "string" ? app.meta.title : "",
          shareAuth: app.meta?.shareAuth ? "true" : "false",
          requiresLp: app.meta?.requiresLp ? "true" : "false",
        },
      });
    } else {
      showAccountSelector();
    }
    return;
  }

  // Handle built-in and LP apps
  if (accountId) {
    console.log("Navigating to app:", app, "for account:", accountId);
    const path = app.path.replace(":accountId", accountId);
    void router.push(path);
  } else {
    showAccountSelector();
  }
};
</script>

<style scoped lang="scss">
// Theme colors
$cosmic-950: #070820;
$cosmic-900: #0c1035;
$cosmic-800: #12184a;
$cosmic-700: #1c2464;
$cosmic-600: #283380;
$cosmic-500: #3548a0;
$cosmic-400: #5068c0;
$cosmic-300: #7890d8;
$cosmic-200: #a8b8e8;
$cosmic-100: #d8e0f5;
$cosmic-50: #f0f4fb;

$nebula-blue: #4169e8;
$nebula-purple: #8d46eb;
$nebula-pink: #e849b7;
$nebula-orange: #ff8c42;

// Page layout
.ext-dashboard-page {
  position: relative;
  min-height: 100vh;
  padding: 10px 24px 48px;
  background: $cosmic-50;
  overflow-x: hidden;
}

// Background elements
.ext-dashboard-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.ext-bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse at top right,
      rgba($nebula-purple, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at bottom left,
      rgba($nebula-blue, 0.05) 0%,
      transparent 50%
    );
}

.ext-bg-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: $cosmic-600;
}

// Header section
.ext-dashboard-header {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 0 32px;
}

.ext-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 24px;
}

.ext-header-text {
  flex: 1;
  min-width: 280px;
}

.ext-overline {
  display: block;
  font-family: "Sohne Breit", "Inter", sans-serif;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $nebula-purple;
  margin-bottom: 8px;
}

.ext-display-3 {
  font-family: "Sohne Breit", "Inter", sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 8px;
}

.ext-text-gradient {
  background: linear-gradient(
    135deg,
    $nebula-blue,
    $nebula-purple,
    $nebula-pink
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ext-body {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.ext-text-secondary {
  color: $cosmic-400;
}

.ext-text-muted {
  color: $cosmic-300;
}

// Search
.ext-header-search {
  flex: 0 0 auto;
  width: 320px;
}

.ext-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.ext-search-icon {
  position: absolute;
  left: 16px;
  color: $cosmic-400;
  font-size: 20px;
  pointer-events: none;
}

.ext-search-input {
  width: 100%;
  padding: 12px 44px;
  font-size: 0.875rem;
  font-family: "Inter", sans-serif;
  color: $cosmic-900;
  background: white;
  border: 1px solid $cosmic-100;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: $cosmic-300;
  }

  &:hover {
    border-color: $cosmic-200;
  }

  &:focus {
    border-color: $nebula-purple;
    box-shadow: 0 0 0 3px rgba($nebula-purple, 0.1);
  }
}

.ext-search-clear {
  position: absolute;
  right: 12px;
  padding: 4px;
  color: $cosmic-400;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    color: $cosmic-600;
    background: $cosmic-100;
  }
}

// Connection banner
.ext-connection-banner {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto 24px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(
    135deg,
    rgba($nebula-blue, 0.08) 0%,
    rgba($nebula-purple, 0.08) 100%
  );
  border: 1px solid rgba($nebula-purple, 0.2);
  border-radius: 12px;
}

.ext-banner-icon {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $nebula-blue, $nebula-purple);
  border-radius: 10px;
  color: white;
}

.ext-banner-content {
  flex: 1;
  font-size: 0.875rem;
  color: $cosmic-600;

  strong {
    color: $cosmic-900;
    font-weight: 600;
  }
}

// Buttons
.ext-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: "Inter", sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &--primary {
    background: linear-gradient(135deg, $nebula-blue, $nebula-purple);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba($nebula-purple, 0.3);
    }
  }

  &--secondary {
    background: white;
    color: $nebula-purple;
    border: 1px solid rgba($nebula-purple, 0.3);

    &:hover {
      background: rgba($nebula-purple, 0.05);
      border-color: $nebula-purple;
    }
  }
}

// SDK Demo section
.ext-sdk-demo {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto 24px;
  padding: 20px 24px;
  background: white;
  border: 1px solid $cosmic-100;
  border-radius: 12px;
}

.ext-sdk-loading,
.ext-sdk-error,
.ext-sdk-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  color: $cosmic-600;
}

.ext-sdk-error {
  color: #dc2626;
  background: rgba(#dc2626, 0.05);
  border-radius: 8px;
}

.ext-sdk-result {
  margin-top: 16px;
}

.ext-sdk-stats {
  margin-bottom: 12px;
}

.ext-sdk-json {
  background: $cosmic-950;
  color: #a5f3fc;
  padding: 16px;
  border-radius: 8px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.75rem;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

// Loading state
.ext-loading-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.ext-loading-spinner {
  margin-bottom: 16px;
}

// App sections
.ext-app-sections {
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.ext-app-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ext-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ext-section-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $cosmic-100, $cosmic-50);
  border-radius: 10px;
  color: $cosmic-600;

  &.lp {
    background: linear-gradient(
      135deg,
      rgba($nebula-purple, 0.15),
      rgba($nebula-pink, 0.1)
    );
    color: $nebula-purple;
  }

  &.external {
    background: linear-gradient(
      135deg,
      rgba($nebula-orange, 0.15),
      rgba($nebula-pink, 0.1)
    );
    color: $nebula-orange;
  }
}

.ext-h2 {
  font-family: "Sohne Breit", "Inter", sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: $cosmic-900;
  margin: 0;
}

.ext-h3 {
  font-family: "Sohne Breit", "Inter", sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: $cosmic-900;
  margin: 0;
}

// Badges
.ext-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;

  &--warning {
    background: rgba(#f59e0b, 0.1);
    color: #d97706;
  }

  &--success {
    background: rgba(#10b981, 0.1);
    color: #059669;
  }

  &--info {
    background: rgba($nebula-blue, 0.1);
    color: $nebula-blue;
  }
}

// App grid
.ext-app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.ext-empty-icon {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $cosmic-100, $cosmic-50);
  border-radius: 24px;
  color: $cosmic-300;
  margin-bottom: 24px;
}

// ========================================
// Dark theme overrides
// ========================================
.body--dark {
  .ext-dashboard-page {
    background: $cosmic-900;
  }

  .ext-bg-gradient {
    background: radial-gradient(
        ellipse at top right,
        rgba($nebula-purple, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at bottom left,
        rgba($nebula-blue, 0.1) 0%,
        transparent 50%
      );
  }

  .ext-bg-grid {
    color: $cosmic-400;
    opacity: 0.5;
  }

  .ext-overline {
    color: $nebula-pink;
  }

  .ext-text-secondary {
    color: $cosmic-300;
  }

  .ext-text-muted {
    color: $cosmic-400;
  }

  .ext-search-input {
    background: rgba($cosmic-800, 0.8);
    border-color: $cosmic-700;
    color: white;

    &::placeholder {
      color: $cosmic-400;
    }

    &:hover {
      border-color: $cosmic-600;
    }

    &:focus {
      border-color: $nebula-purple;
      box-shadow: 0 0 0 3px rgba($nebula-purple, 0.2);
    }
  }

  .ext-search-icon,
  .ext-search-clear {
    color: $cosmic-400;
  }

  .ext-search-clear:hover {
    color: white;
    background: $cosmic-700;
  }

  .ext-connection-banner {
    background: linear-gradient(
      135deg,
      rgba($nebula-blue, 0.1) 0%,
      rgba($nebula-purple, 0.1) 100%
    );
    border-color: rgba($nebula-purple, 0.3);
  }

  .ext-banner-content {
    color: $cosmic-300;

    strong {
      color: white;
    }
  }

  .ext-btn--secondary {
    background: rgba($cosmic-800, 0.8);
    color: $nebula-pink;
    border-color: rgba($nebula-purple, 0.4);

    &:hover {
      background: rgba($nebula-purple, 0.15);
      border-color: $nebula-purple;
    }
  }

  .ext-section-icon {
    background: rgba($cosmic-700, 0.5);
    color: $cosmic-300;

    &.lp {
      background: rgba($nebula-purple, 0.2);
      color: $nebula-pink;
    }

    &.external {
      background: rgba($nebula-orange, 0.2);
      color: $nebula-orange;
    }
  }

  .ext-h2,
  .ext-h3 {
    color: white;
  }

  .ext-badge--warning {
    background: rgba(#fbbf24, 0.15);
    color: #fbbf24;
  }

  .ext-empty-icon {
    background: rgba($cosmic-700, 0.5);
    color: $cosmic-400;
  }

  .ext-sdk-demo {
    background: rgba($cosmic-800, 0.8);
    border-color: $cosmic-700;
  }

  .ext-sdk-loading,
  .ext-sdk-empty {
    color: $cosmic-300;
  }

  .ext-sdk-json {
    background: $cosmic-950;
    border: 1px solid $cosmic-700;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .ext-dashboard-header {
    padding: 32px 0 24px;
  }

  .ext-header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .ext-header-search {
    width: 100%;
  }

  .ext-display-3 {
    font-size: 2rem;
  }

  .ext-connection-banner {
    flex-direction: column;
    text-align: center;
  }

  .ext-app-grid {
    grid-template-columns: 1fr;
  }
}
</style>
