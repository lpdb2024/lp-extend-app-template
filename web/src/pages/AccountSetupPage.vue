<template>
  <q-page class="ext-account-setup-page fc">
    <!-- Background -->
    <div class="ext-page-bg">
      <div class="ext-bg-gradient"></div>
      <svg class="ext-bg-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="accountSetupGrid"
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
        <rect width="100%" height="100%" fill="url(#accountSetupGrid)" />
      </svg>
    </div>

    <!-- Page wrapper for container-based scrolling -->
    <div class="ext-page-wrapper">
      <ext-page-header
        category="ACCOUNT"
        title="Account Setup"
        caption="Connect and manage your LivePerson accounts"
      >
        <template #actions>
          <div class="fr gap-10">
            <div class="fc jc-c">
              <button
                class="ext-btn ext-btn--outline"
                @click="goHome"
              >
                <q-icon name="sym_o_home" size="18px" />
                <span>Home</span>
              </button>
            </div>
            <div class="fc jc-c">
              <button
                class="ext-btn ext-btn--outline"
                @click="signOut"
              >
                <q-icon name="sym_o_logout" size="18px" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </template>
      </ext-page-header>

      <!-- Scrollable content container -->
      <div class="ext-scroll-container">
        <!-- Main Content -->
        <div class="ext-content">
          <div class="ext-setup-layout">
            <!-- Left Column: User Info & Account Input -->
            <div class="ext-setup-main">
              <!-- User Info Card -->
              <div v-if="sessionStore.preferences" class="ext-card ext-user-card">
                <div class="ext-card-header">
                  <h3 class="ext-h4">Your Profile</h3>
                </div>
                <div class="ext-card-body">
                  <div class="ext-user-info">
                    <div class="ext-avatar">
                      <img v-if="sessionStore.preferences.photoUrl" :src="sessionStore.preferences.photoUrl" alt="User avatar" />
                      <q-icon v-else name="sym_o_person" size="40px" />
                    </div>
                    <div class="ext-user-details">
                      <div class="ext-h5">{{ sessionStore.userDisplayName }}</div>
                      <div class="ext-body-sm ext-text-secondary">{{ sessionStore.userEmail }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Connect Account Card -->
              <div class="ext-card">
                <div class="ext-card-header">
                  <h3 class="ext-h4">Connect LP Account</h3>
                  <p class="ext-body-sm ext-text-secondary">
                    Enter your LivePerson account ID to link it to your profile
                  </p>
                </div>
                <div class="ext-card-body">
                  <!-- Connection Mode Tabs -->
                  <div class="ext-tab-group q-mb-md">
                    <button
                      class="ext-tab"
                      :class="{ active: connectionMode === 'link' }"
                      @click="connectionMode = 'link'"
                    >
                      <q-icon name="sym_o_link" size="18px" />
                      <span>Link Account</span>
                    </button>
                    <button
                      class="ext-tab"
                      :class="{ active: connectionMode === 'sso' }"
                      @click="connectionMode = 'sso'"
                    >
                      <q-icon name="sym_o_login" size="18px" />
                      <span>LP SSO Login</span>
                    </button>
                  </div>

                  <!-- Account ID Input -->
                  <div class="ext-input-group">
                    <label class="ext-label">Account ID</label>
                    <div class="ext-input-wrapper">
                      <q-icon name="sym_o_business" class="ext-input-icon" />
                      <input
                        v-model="accountId"
                        type="text"
                        class="ext-input"
                        :class="{ 'ext-input--error': !!error }"
                        placeholder="Enter your LP account ID"
                        @keyup.enter="handleConnect"
                      />
                    </div>
                    <p v-if="error" class="ext-input-error">{{ error }}</p>
                    <p v-else class="ext-input-hint">
                      {{ connectionMode === 'link'
                        ? 'Link your account to access features without full SSO authentication'
                        : 'SSO provides full access to LivePerson APIs and features'
                      }}
                    </p>
                  </div>

                  <!-- SSO Info Banner -->
                  <div v-if="connectionMode === 'sso'" class="ext-info-banner">
                    <q-icon name="sym_o_info" size="20px" />
                    <div class="ext-info-content">
                      <strong>LP SSO Login</strong>
                      <p>You'll be redirected to LivePerson to authenticate, then returned here with full API access.</p>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="ext-action-row">
                    <button
                      v-if="connectionMode === 'link'"
                      class="ext-btn ext-btn--primary ext-btn--lg"
                      :disabled="!accountId || isLoading"
                      @click="linkAccount"
                    >
                      <q-spinner-dots v-if="isLoading" size="18px" />
                      <q-icon v-else name="sym_o_link" size="18px" />
                      <span>{{ linkedAccounts.length > 0 ? 'Link Another Account' : 'Link Account' }}</span>
                    </button>
                    <button
                      v-else
                      class="ext-btn ext-btn--secondary ext-btn--lg"
                      :disabled="!accountId || isLoading"
                      @click="initiateLpSso"
                    >
                      <q-spinner-dots v-if="isLoading" size="18px" />
                      <q-icon v-else name="sym_o_login" size="18px" />
                      <span>Sign in with LP SSO</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Linked Accounts -->
            <div class="ext-setup-sidebar">
              <div class="ext-card">
                <div class="ext-card-header">
                  <h3 class="ext-h4">Linked Accounts</h3>
                  <div class="ext-badge" v-if="linkedAccounts.length > 0">
                    {{ linkedAccounts.length }}
                  </div>
                </div>
                <div class="ext-card-body">
                  <div v-if="linkedAccounts.length === 0" class="ext-empty-state">
                    <q-icon name="sym_o_link_off" size="48px" class="ext-text-muted" />
                    <p class="ext-body-sm ext-text-secondary">No accounts linked yet</p>
                    <p class="ext-caption ext-text-muted">
                      Link an account to get started
                    </p>
                  </div>
                  <div v-else class="ext-account-list">
                    <div
                      v-for="acc in linkedAccounts"
                      :key="acc"
                      class="ext-account-item"
                      :class="{ 'ext-account-item--default': acc === sessionStore.defaultAccountId }"
                      @click="setAsDefault(acc)"
                    >
                      <div class="ext-account-icon">
                        <q-icon
                          :name="acc === sessionStore.defaultAccountId ? 'sym_o_star' : 'sym_o_business'"
                          :class="acc === sessionStore.defaultAccountId ? 'ext-text-warning' : ''"
                          size="20px"
                        />
                      </div>
                      <div class="ext-account-info">
                        <div class="ext-account-id">{{ acc }}</div>
                        <div v-if="acc === sessionStore.defaultAccountId" class="ext-account-label">
                          Default Account
                        </div>
                      </div>
                      <button
                        class="ext-btn ext-btn--ghost ext-btn--icon"
                        @click.stop="goToAccount(acc)"
                      >
                        <q-icon name="sym_o_arrow_forward" size="18px" />
                        <q-tooltip>Go to account</q-tooltip>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Tips Card -->
              <div class="ext-card ext-tips-card">
                <div class="ext-card-header">
                  <h3 class="ext-h5">Quick Tips</h3>
                </div>
                <div class="ext-card-body">
                  <ul class="ext-tips-list">
                    <li>
                      <q-icon name="sym_o_check_circle" size="16px" class="ext-text-success" />
                      <span>Click on an account to set it as default</span>
                    </li>
                    <li>
                      <q-icon name="sym_o_check_circle" size="16px" class="ext-text-success" />
                      <span>Use SSO for full API access</span>
                    </li>
                    <li>
                      <q-icon name="sym_o_check_circle" size="16px" class="ext-text-success" />
                      <span>Link multiple accounts if needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStore } from 'src/stores/store-session'
import { useUserStore } from 'src/stores/store-user'
import { Notify } from 'quasar'
import { ROUTE_NAMES } from 'src/constants/constants'
import ExtPageHeader from 'src/components/common-ui/ExtPageHeader.vue'

const router = useRouter()
const route = useRoute()
const sessionStore = useSessionStore()
const userStore = useUserStore()

const accountId = ref('')
const isLoading = ref(false)
const error = ref('')
const connectionMode = ref<'link' | 'sso'>('link')

const linkedAccounts = computed(() => sessionStore.linkedAccounts)

const handleConnect = () => {
  if (connectionMode.value === 'link') {
    void linkAccount()
  } else {
    void initiateLpSso()
  }
}

onMounted(() => {
  // If already authenticated with LP and has a default account, redirect
  if (sessionStore.hasActiveLpSession && sessionStore.defaultAccountId) {
    const redirect = route.query.redirect as string
    if (redirect) {
      void router.push(redirect)
    } else {
      void router.push({ name: ROUTE_NAMES.INDEX })
    }
  }
})

const linkAccount = async () => {
  if (!accountId.value) {
    error.value = 'Please enter an account ID'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    // First, get LP domains to verify the account exists
    await userStore.getlpDomains(accountId.value)

    // Link the account
    sessionStore.linkLpAccount(accountId.value)

    Notify.create({
      type: 'positive',
      message: 'Account linked successfully',
      caption: `Account ${accountId.value} has been linked`,
    })

    // Set as default if it's the first account
    if (linkedAccounts.value.length === 1 || !sessionStore.defaultAccountId) {
      sessionStore.setDefaultAccount(accountId.value)
    }

    // Redirect if there was a redirect query
    const redirect = route.query.redirect as string
    if (redirect) {
      void router.push(redirect)
    } else {
      void router.push({
        name: ROUTE_NAMES.APPS,
        params: { accountId: accountId.value },
      })
    }
  } catch (err) {
    console.error('Error linking account:', err)
    error.value = 'Failed to verify account. Please check the account ID.'
  } finally {
    isLoading.value = false
    accountId.value = ''
  }
}

const setAsDefault = (accId: string) => {
  sessionStore.setDefaultAccount(accId)
  Notify.create({
    type: 'positive',
    message: 'Default account updated',
    caption: `${accId} is now your default account`,
  })
}

const goToAccount = (accId: string) => {
  void router.push({
    name: ROUTE_NAMES.APPS,
    params: { accountId: accId },
  })
}

const initiateLpSso = async () => {
  if (!accountId.value) {
    error.value = 'Please enter an account ID'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    // Get LP domains first
    await userStore.getlpDomains(accountId.value)

    // Get the sentinel URL for SSO
    const url = await userStore.getSentinelUrl(accountId.value)

    if (url) {
      // Store info for callback handling
      sessionStorage.setItem('pendingLpAccountId', accountId.value)
      sessionStorage.setItem('lpSsoFromSetup', 'true')

      // Redirect to LP SSO
      window.location.href = url
    } else {
      error.value = 'Failed to get SSO URL'
    }
  } catch (err) {
    console.error('Error initiating LP SSO:', err)
    error.value = 'Failed to initiate LP login. Please check the account ID.'
  } finally {
    isLoading.value = false
  }
}

const goHome = () => {
  void router.push({ name: ROUTE_NAMES.INDEX })
}

const signOut = async () => {
  await sessionStore.logout()
  void router.push({ name: ROUTE_NAMES.LOGIN })
}
</script>

<style scoped lang="scss">
.ext-account-setup-page {
  width: 100%;
  height: 100%;
  position: relative;
}

.ext-setup-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.ext-setup-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ext-setup-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ext-user-card {
  .ext-user-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ext-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--ext-bg-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .ext-user-details {
    flex: 1;
  }
}

.ext-tab-group {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--ext-bg-muted);
  border-radius: 8px;
}

.ext-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ext-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--ext-text-primary);
  }

  &.active {
    background: var(--ext-bg-surface);
    color: var(--ext-text-primary);
    box-shadow: var(--ext-shadow-sm);
  }
}

.ext-input-group {
  margin-bottom: 20px;
}

.ext-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ext-text-primary);
  margin-bottom: 8px;
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
}

.ext-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid var(--ext-border-default);
  border-radius: 8px;
  background: var(--ext-input-bg);
  font-size: 1rem;
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

  &--error {
    border-color: var(--ext-error);

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
}

.ext-input-hint {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--ext-text-muted);
}

.ext-input-error {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--ext-error);
}

.ext-info-banner {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(49, 204, 236, 0.1);
  border: 1px solid rgba(49, 204, 236, 0.2);
  border-radius: 8px;
  margin-bottom: 20px;

  .q-icon {
    color: var(--ext-info);
    flex-shrink: 0;
  }

  .ext-info-content {
    strong {
      display: block;
      font-size: 0.875rem;
      color: var(--ext-text-primary);
      margin-bottom: 4px;
    }

    p {
      font-size: 0.8125rem;
      color: var(--ext-text-secondary);
      margin: 0;
    }
  }
}

.ext-action-row {
  display: flex;
  justify-content: flex-end;
}

.ext-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;

  .q-icon {
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    &:first-of-type {
      margin-bottom: 4px;
    }
  }
}

.ext-account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ext-account-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--ext-bg-muted);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ext-bg-elevated);
  }

  &--default {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);

    &:hover {
      background: rgba(245, 158, 11, 0.15);
    }
  }
}

.ext-account-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ext-bg-surface);
  border-radius: 8px;
}

.ext-account-info {
  flex: 1;
  min-width: 0;
}

.ext-account-id {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ext-text-primary);
}

.ext-account-label {
  font-size: 0.75rem;
  color: var(--ext-warning);
}

.ext-tips-card {
  .ext-tips-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      font-size: 0.8125rem;
      color: var(--ext-text-secondary);

      .q-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
    }
  }
}

// Dark mode adjustments
.body--dark {
  .ext-tab-group {
    background: rgba(255, 255, 255, 0.05);
  }

  .ext-tab.active {
    background: rgba(255, 255, 255, 0.1);
  }

  .ext-account-item--default {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.3);
  }

  .ext-info-banner {
    background: rgba(49, 204, 236, 0.15);
    border-color: rgba(49, 204, 236, 0.3);
  }
}
</style>
