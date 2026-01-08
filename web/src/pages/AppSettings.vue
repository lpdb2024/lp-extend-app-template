<template>
  <q-page class="ext-admin-page fc">
    <!-- Background -->
    <div class="ext-page-bg">
      <div class="ext-bg-gradient"></div>
      <svg class="ext-bg-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="adminGrid"
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
        <rect width="100%" height="100%" fill="url(#adminGrid)" />
      </svg>
    </div>

    <!-- Page wrapper -->
    <div class="ext-page-wrapper">
      <ext-page-header use-route-meta>
        <!-- category="SETTINGS"
        title="App Administration"
        caption="Manage application and account-specific settings" -->
        <template #actions>
          <div class="fr gap-10">
            <div class="fc jc-c">
              <button
                class="ext-btn ext-btn--outline"
                @click="router.push({ name: ROUTE_NAMES.INDEX })"
              >
                <q-icon name="sym_o_home" size="18px" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </template>
      </ext-page-header>

      <!-- Scrollable content container -->
      <div class="ext-scroll-container">
        <!-- Warning Banner when not connected to LP -->
        <div v-if="!isConnectedToLp" class="ext-content">
          <div class="ext-warning-banner">
            <q-icon name="sym_o_warning" size="24px" />
            <div class="ext-warning-content">
              <strong>Not Connected to LivePerson</strong>
              <p>
                Connect to a LivePerson account to manage account-specific
                settings. These settings will apply to the account you are
                currently connected to.
              </p>
            </div>
            <button class="ext-btn ext-btn--outline" @click="openConnectDialog">
              <q-icon name="sym_o_link" size="18px" />
              <span>Connect</span>
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="ext-content">
          <div class="ext-admin-tabs">
            <!-- Application Settings Tab (always first) -->
            <button
              class="ext-admin-tab"
              :class="{ active: activeTab === 'app-settings' }"
              @click="activeTab = 'app-settings'"
            >
              <q-icon name="sym_o_settings" size="20px" />
              <span>Application Settings</span>
            </button>

            <!-- Account Tabs (linked accounts) -->
            <button
              v-for="acc in linkedAccounts"
              :key="acc"
              class="ext-admin-tab"
              :class="{
                active: activeTab === acc,
                connected: acc === currentLpAccountId,
                disabled: acc !== currentLpAccountId && !isConnectedToLp,
              }"
              :disabled="acc !== currentLpAccountId && !isConnectedToLp"
              @click="switchToAccountTab(acc)"
            >
              <q-icon
                v-if="acc === defaultLpAccountId"
                name="sym_o_star"
                size="18px"
                class="text-warning"
              />
              <q-icon
                :name="
                  acc === currentLpAccountId
                    ? 'sym_o_check_circle'
                    : 'sym_o_business'
                "
                size="20px"
                :class="{ 'text-positive': acc === currentLpAccountId }"
              />
              <span>{{ acc }}</span>
              <q-chip
                v-if="acc === currentLpAccountId"
                dense
                size="sm"
                color="positive"
                text-color="white"
              >
                Active
              </q-chip>
              <q-tooltip v-if="acc !== currentLpAccountId && !isConnectedToLp">
                Connect to this account to manage its settings
              </q-tooltip>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="ext-admin-content">
            <!-- Application Settings Panel -->
            <div v-if="activeTab === 'app-settings'" class="ext-panel">
              <div class="ext-card ext-settings-card">
                <div class="ext-card-header ext-settings-header">
                  <div class="ext-header-icon">
                    <q-icon name="sym_o_cloud_sync" size="24px" />
                  </div>
                  <div class="ext-header-text">
                    <h3 class="ext-h4">GitHub Backup Settings</h3>
                    <p class="ext-body-sm ext-text-secondary">
                      Configure GitHub integration for backing up LP
                      configurations
                    </p>
                  </div>
                </div>
                <div class="ext-card-body ext-settings-body">
                  <!-- GitHub PAT -->
                  <div class="ext-form-group">
                    <div class="ext-form-row">
                      <label class="ext-label">Personal Access Token</label>
                      <div class="ext-input-group">
                        <div class="ext-input-wrapper">
                          <q-icon name="sym_o_key" class="ext-input-icon" />
                          <input
                            v-model="githubSettings.pat"
                            :type="isPwd.githubPat ? 'password' : 'text'"
                            class="ext-input"
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          />
                          <button
                            class="ext-input-action"
                            @click="isPwd.githubPat = !isPwd.githubPat"
                          >
                            <q-icon
                              :name="
                                isPwd.githubPat
                                  ? 'visibility_off'
                                  : 'visibility'
                              "
                            />
                          </button>
                        </div>
                        <p class="ext-input-hint">
                          Create a PAT with 'repo' scope at
                          <a
                            href="https://github.com/settings/tokens"
                            target="_blank"
                            >github.com/settings/tokens</a
                          >
                        </p>
                      </div>
                    </div>

                    <!-- GitHub User Info (after validation) -->
                    <div v-if="githubUser" class="ext-form-row">
                      <label class="ext-label">Connected Account</label>
                      <div class="ext-github-user">
                        <img
                          :src="githubUser.avatar_url"
                          alt=""
                          class="ext-github-avatar"
                        />
                        <div>
                          <div class="ext-h5">
                            {{ githubUser.name || githubUser.login }}
                          </div>
                          <div class="ext-body-sm ext-text-secondary">
                            @{{ githubUser.login }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Repository Selection -->
                    <div v-if="githubUser" class="ext-form-row">
                      <label class="ext-label">Repository</label>
                      <div class="ext-input-group">
                        <div class="ext-select-wrapper">
                          <q-select
                            v-model="githubSettings.repo"
                            :options="githubRepoOptions"
                            option-label="full_name"
                            option-value="full_name"
                            emit-value
                            map-options
                            filled
                            dense
                            :loading="loadingRepos"
                            placeholder="Select a repository"
                          >
                            <template v-slot:after>
                              <q-btn
                                round
                                dense
                                flat
                                icon="sym_o_add"
                                @click="showCreateRepoDialog = true"
                              >
                                <q-tooltip>Create new repository</q-tooltip>
                              </q-btn>
                            </template>
                          </q-select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="ext-form-actions">
                    <button
                      v-if="!githubUser"
                      class="ext-btn ext-btn--primary"
                      :disabled="!githubSettings.pat || validatingPat"
                      @click="validateGithubPat"
                    >
                      <q-spinner-dots v-if="validatingPat" size="18px" />
                      <q-icon v-else name="sym_o_check" size="18px" />
                      <span>Validate PAT</span>
                    </button>
                    <button
                      v-else
                      class="ext-btn ext-btn--primary"
                      @click="saveGithubSettings"
                    >
                      <q-icon name="sym_o_save" size="18px" />
                      <span>Save Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account-Specific Settings Panel -->
            <div v-else class="ext-panel">
              <div class="ext-card ext-settings-card">
                <div class="ext-card-header ext-settings-header">
                  <div class="ext-header-icon">
                    <q-icon name="sym_o_business" size="24px" />
                  </div>
                  <div class="ext-header-text">
                    <h3 class="ext-h4">Account: {{ activeTab }}</h3>
                    <p class="ext-body-sm ext-text-secondary">
                      Manage credentials and service workers for this account
                    </p>
                  </div>
                  <q-chip
                    v-if="activeTab === currentLpAccountId"
                    dense
                    color="positive"
                    text-color="white"
                    icon="sym_o_check_circle"
                    class="ext-header-badge"
                  >
                    Connected
                  </q-chip>
                </div>
                <div class="ext-card-body ext-settings-body">
                  <!-- Proactive Credentials -->
                  <div class="ext-form-group">
                    <h4 class="ext-h5 mb-15">Proactive Outbound Credentials</h4>

                    <div class="ext-form-row">
                      <label class="ext-label">Client ID</label>
                      <div class="ext-input-group">
                        <div class="ext-input-wrapper">
                          <q-icon name="sym_o_badge" class="ext-input-icon" />
                          <input
                            v-model="proactiveCredentials.client_id"
                            :type="isPwd.proactiveClient ? 'password' : 'text'"
                            class="ext-input"
                            :disabled="
                              !isConnectedToLp ||
                              activeTab !== currentLpAccountId
                            "
                            placeholder="Enter client ID"
                          />
                          <button
                            class="ext-input-action"
                            @click="
                              isPwd.proactiveClient = !isPwd.proactiveClient
                            "
                          >
                            <q-icon
                              :name="
                                isPwd.proactiveClient
                                  ? 'visibility_off'
                                  : 'visibility'
                              "
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="ext-form-row">
                      <label class="ext-label">Client Secret</label>
                      <div class="ext-input-group">
                        <div class="ext-input-wrapper">
                          <q-icon name="sym_o_key" class="ext-input-icon" />
                          <input
                            v-model="proactiveCredentials.client_secret"
                            :type="isPwd.proactiveSecret ? 'password' : 'text'"
                            class="ext-input"
                            :disabled="
                              !isConnectedToLp ||
                              activeTab !== currentLpAccountId
                            "
                            placeholder="Enter client secret"
                          />
                          <button
                            class="ext-input-action"
                            @click="
                              isPwd.proactiveSecret = !isPwd.proactiveSecret
                            "
                          >
                            <q-icon
                              :name="
                                isPwd.proactiveSecret
                                  ? 'visibility_off'
                                  : 'visibility'
                              "
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="ext-form-actions">
                      <button
                        class="ext-btn ext-btn--primary"
                        :disabled="
                          !isConnectedToLp || activeTab !== currentLpAccountId
                        "
                        @click="saveProactiveCredentials"
                      >
                        <q-icon name="sym_o_save" size="18px" />
                        <span>Save Credentials</span>
                      </button>
                    </div>
                  </div>

                  <q-separator class="q-my-lg" />

                  <!-- Service Workers -->
                  <ServiceWorkers
                    :connected="
                      isConnectedToLp && activeTab === currentLpAccountId
                    "
                  />

                  <q-separator class="q-my-lg" />

                  <!-- select default AI Studio flow: used as a proxy to invoke LLM endpoint passing our own prompts -->

                  <div class="ext-form-group">
                    <h4 class="ext-h5 mb-15">AI Studio Flow Settings</h4>
                    <p class="ext-body-sm ext-text-secondary mb-20">
                      Select a default AI Studio flow to be used as a proxy
                      endpoint for AI-powered features. This flow will be
                      invoked with custom prompts for LLM tasks.
                    </p>
                    <div class="ext-form-row">
                      <label class="ext-label">Default AI Studio Flow</label>
                      <div class="ext-input-group">
                        <SelectFlow
                          @update:model-value="
                            selectedAiStudioFlowId = $event?.id
                          "
                          outline
                          dense
                          use-text
                          :flow-id="selectedAiStudioFlowId || null"
                          :disabled="
                            !isConnectedToLp || activeTab !== currentLpAccountId
                          "
                          placeholder="Select an AI Studio flow"
                        />
                      </div>
                    </div>
                    <div class="ext-form-actions">
                      <button
                        class="ext-btn ext-btn--primary"
                        :disabled="
                          !isConnectedToLp || activeTab !== currentLpAccountId
                        "
                        @click="saveDefaultAIStudioFlow"
                      >
                        <q-icon name="sym_o_save" size="18px" />
                        <span>Save AI Studio Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Repo Dialog -->
    <q-dialog v-model="showCreateRepoDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Create New Repository</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="newRepoName"
            label="Repository Name"
            filled
            dense
            hint="e.g., lp-config-backups"
          />
          <q-toggle
            v-model="newRepoPrivate"
            label="Private repository"
            class="mt-10"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Create"
            :loading="creatingRepo"
            @click="createGithubRepo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "src/stores/store-user";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { storeToRefs } from "pinia";
import ServiceWorkers from "src/admin/ServiceWorkers.vue";
import ExtPageHeader from "src/components/common-ui/ExtPageHeader.vue";
import { useAppStore, ACCOUNT_SETTING_NAMES } from "src/stores/store-app";
import { api } from "src/boot/axios";
import { ROUTE_NAMES } from "src/constants";
import SelectFlow from "src/components/Selectors/SelectFlow.vue";

const router = useRouter();
const store = useUserStore();
const firebaseAuth = useFirebaseAuthStore();
const appStore = useAppStore();
const { proactiveCredentials } = storeToRefs(store);
const $q = useQuasar();

const isPwd = ref({
  proactiveClient: true,
  proactiveSecret: true,
  githubPat: true,
});

// Active tab state
const activeTab = ref<string>("app-settings");

// Local state for AI Studio flow selection
const selectedAiStudioFlowId = ref<string | null>(null);

// LP connection status
const isConnectedToLp = computed(() => firebaseAuth.hasActiveLpSession);
const currentLpAccountId = computed(() => firebaseAuth.currentLpAccountId);
const linkedAccounts = computed(() => firebaseAuth.linkedAccounts);
const defaultLpAccountId = computed(() => firebaseAuth.defaultAccountId);

// GitHub settings
const githubSettings = ref({
  pat: "",
  repo: "",
  branch: "main",
});
const githubUser = ref<{
  login: string;
  name: string | null;
  avatar_url: string;
} | null>(null);
const githubRepoOptions = ref<
  {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
  }[]
>([]);
const validatingPat = ref(false);
const loadingRepos = ref(false);
const showCreateRepoDialog = ref(false);
const newRepoName = ref("");
const newRepoPrivate = ref(true);
const creatingRepo = ref(false);

function openConnectDialog() {
  // Could open a dialog or redirect to account setup
  void router.push({ name: ROUTE_NAMES.ACCOUNT_SETUP });
}

async function switchToAccountTab(accountId: string) {
  if (accountId === currentLpAccountId.value || isConnectedToLp.value) {
    activeTab.value = accountId;
    // Load account settings for this account
    await loadAccountSettings(accountId);
  }
}

async function loadAccountSettings(accountId: string) {
  await appStore.getAccountSettings(accountId);
  // Update local state from loaded settings
  const flowSetting = appStore.getAccountSettingValue(
    accountId,
    ACCOUNT_SETTING_NAMES.AI_STUDIO_PROXY_FLOW
  );
  selectedAiStudioFlowId.value = flowSetting;
}

async function saveProactiveCredentials() {
  try {
    await store.setProactiveCredentials();
    $q.notify({
      type: "positive",
      message: "Credentials saved successfully",
    });
  } catch (error) {
    console.error("Error saving proactive credentials:", error);
    $q.notify({
      type: "negative",
      message: "Failed to save credentials",
    });
  }
}

async function validateGithubPat() {
  if (!githubSettings.value.pat) return;

  validatingPat.value = true;
  try {
    const accountId = currentLpAccountId.value || "default";
    const { data } = await api.post(
      `/api/v2/github/${accountId}/validate-pat`,
      {
        pat: githubSettings.value.pat,
      }
    );
    githubUser.value = data.user;
    $q.notify({
      type: "positive",
      message: `Connected to GitHub as ${data.user.login}`,
    });
    // Load repos after validation
    await loadGithubRepos();
  } catch (error: unknown) {
    console.error("Error saving proactive credentials:", error);
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined;
    $q.notify({
      type: "negative",
      message: errorMessage || "Invalid GitHub PAT",
    });
    githubUser.value = null;
  } finally {
    validatingPat.value = false;
  }
}

async function loadGithubRepos() {
  if (!githubSettings.value.pat || !githubUser.value) return;

  loadingRepos.value = true;
  try {
    const accountId = currentLpAccountId.value || "default";
    const { data } = await api.post(`/api/v2/github/${accountId}/repos`, {
      pat: githubSettings.value.pat,
    });
    githubRepoOptions.value = data.repos;
  } catch (error) {
    console.error("Error saving proactive credentials:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load repositories",
    });
  } finally {
    loadingRepos.value = false;
  }
}

async function createGithubRepo() {
  if (!newRepoName.value || !githubSettings.value.pat) return;

  creatingRepo.value = true;
  try {
    const accountId = currentLpAccountId.value || "default";
    const { data } = await api.post(
      `/api/v2/github/${accountId}/repos/create`,
      {
        pat: githubSettings.value.pat,
        name: newRepoName.value,
        isPrivate: newRepoPrivate.value,
      }
    );
    $q.notify({
      type: "positive",
      message: `Repository ${data.repo.full_name} created`,
    });
    // Reload repos and select the new one
    await loadGithubRepos();
    githubSettings.value.repo = data.repo.full_name;
    showCreateRepoDialog.value = false;
    newRepoName.value = "";
  } catch (error: unknown) {
    console.error("Error saving proactive credentials:", error);
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined;
    $q.notify({
      type: "negative",
      message: errorMessage || "Failed to create repository",
    });
  } finally {
    creatingRepo.value = false;
  }
}

async function saveGithubSettings() {
  try {
    // Save to app store (will be stored in Firestore)
    await appStore.setGithubSettings({
      pat: githubSettings.value.pat,
      repo: githubSettings.value.repo,
      branch: githubSettings.value.branch,
    });
    $q.notify({
      type: "positive",
      message: "GitHub settings saved",
    });
  } catch (error) {
    console.error("Error saving proactive credentials:", error);
    $q.notify({
      type: "negative",
      message: "Failed to save GitHub settings",
    });
  }
}

async function loadGithubSettings() {
  const settings = await appStore.getGithubSettings();
  if (settings) {
    githubSettings.value = {
      pat: settings.pat || "",
      repo: settings.repo || "",
      branch: settings.branch || "main",
    };
    // If we have a PAT, validate it to get user info
    if (settings.pat) {
      await validateGithubPat();
    }
  }
}

async function saveDefaultAIStudioFlow() {
  if (!activeTab.value || activeTab.value === "app-settings") {
    return;
  }

  try {
    if (selectedAiStudioFlowId.value) {
      await appStore.saveAccountSetting(
        activeTab.value,
        ACCOUNT_SETTING_NAMES.AI_STUDIO_PROXY_FLOW,
        "AI Studio Proxy Flow",
        selectedAiStudioFlowId.value
      );
    } else {
      await appStore.deleteAccountSetting(
        activeTab.value,
        ACCOUNT_SETTING_NAMES.AI_STUDIO_PROXY_FLOW
      );
    }
    $q.notify({
      type: "positive",
      message: "AI Studio flow settings saved successfully",
    });
  } catch (error) {
    $q.notify({
      type: "negative",
      message:
        (error as Error)?.message || "Failed to save AI Studio flow settings",
    });
  }
}

onMounted(async () => {
  // If connected, load settings for default/current account
  if (isConnectedToLp.value && currentLpAccountId.value) {
    // Switch to and load the default account tab
    activeTab.value = currentLpAccountId.value;
    await store.getProactiveCredentials();
    await loadAccountSettings(currentLpAccountId.value);
  }

  // Load GitHub settings
  await loadGithubSettings();
});
</script>

<style scoped lang="scss">
.ext-admin-page {
  width: 100%;
  height: 100%;
  position: relative;
}

.ext-warning-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  margin-bottom: 24px;

  > .q-icon {
    color: var(--ext-warning);
    flex-shrink: 0;
  }

  .ext-warning-content {
    flex: 1;

    strong {
      display: block;
      color: var(--ext-text-primary);
      margin-bottom: 4px;
    }

    p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--ext-text-secondary);
    }
  }
}

.ext-admin-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background: var(--ext-bg-surface);
  border-radius: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  box-shadow: var(--ext-shadow-sm);
}

.ext-admin-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--ext-border-default);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ext-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover:not(.disabled) {
    background: var(--ext-bg-muted);
    color: var(--ext-text-primary);
  }

  &.active {
    background: var(--ext-bg-muted);
    border-color: transparent;
    color: var(--ext-text-primary);
    box-shadow: var(--ext-shadow-sm);
  }

  &.connected {
    border-color: rgba(16, 185, 129, 0.3);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ext-admin-content {
  min-height: 400px;
}

// Settings Card Styles
.ext-settings-card {
  overflow: hidden;
}

.ext-settings-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px !important;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05) 0%,
    rgba(139, 92, 246, 0.05) 100%
  );
  border-bottom: 1px solid var(--ext-border-subtle);
}

.ext-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.ext-header-text {
  flex: 1;

  h3 {
    margin: 0 0 4px 0;
  }

  p {
    margin: 0;
  }
}

.ext-header-badge {
  flex-shrink: 0;
  margin-left: auto;
}

.ext-settings-body {
  padding: 24px !important;
}

.ext-form-group {
  margin-bottom: 24px;
}

.ext-form-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.ext-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ext-text-primary);
  padding-top: 10px;
}

.ext-input-group {
  flex: 1;
}

.ext-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.ext-input-icon {
  position: absolute;
  left: 12px;
  color: var(--ext-text-muted);
  z-index: 1;
}

.ext-input {
  width: 100%;
  padding: 10px 40px 10px 44px;
  border: 1px solid var(--ext-border-default);
  border-radius: 8px;
  background: var(--ext-input-bg);
  font-size: 0.875rem;
  color: var(--ext-text-primary);
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--ext-text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--ext-border-focus);
    box-shadow: 0 0 0 3px rgba(65, 105, 232, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--ext-bg-muted);
  }
}

.ext-input-action {
  position: absolute;
  right: 8px;
  padding: 4px;
  background: none;
  border: none;
  color: var(--ext-text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--ext-text-primary);
    background: var(--ext-bg-muted);
  }
}

.ext-input-hint {
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--ext-text-muted);

  a {
    color: var(--ext-text-link);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.ext-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--ext-border-subtle);
}

.ext-github-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--ext-bg-muted);
  border-radius: 8px;
}

.ext-github-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.ext-select-wrapper {
  :deep(.q-field) {
    .q-field__control {
      background: var(--ext-input-bg);
    }
  }
}

// Dark mode
.body--dark {
  .ext-warning-banner {
    background: rgba(245, 158, 11, 0.15);
  }

  .ext-admin-tabs {
    background: rgba(255, 255, 255, 0.05);
  }

  .ext-admin-tab {
    border-color: rgba(255, 255, 255, 0.1);

    &.active {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .ext-settings-header {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.1) 0%,
      rgba(139, 92, 246, 0.1) 100%
    );
    border-bottom-color: var(--ext-border-default);
  }

  .ext-settings-body {
    background: var(--ext-bg-surface);
  }
}
</style>
