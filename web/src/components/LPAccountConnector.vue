<template>
  <q-card class="lp-account-connector">
    <q-card-section class="bg-primary text-white">
      <div class="text-h6">
        <q-icon name="business" class="q-mr-sm" />
        LivePerson Account
      </div>
      <div class="text-caption">Connect to access LP features</div>
    </q-card-section>

    <q-card-section>
      <!-- Current LP Session Status -->
      <div v-if="hasActiveLpSession" class="q-mb-md">
        <q-banner class="bg-positive text-white" rounded>
          <template v-slot:avatar>
            <q-icon name="check_circle" />
          </template>
          <div>
            Connected to account <strong>{{ activeLpAccountId }}</strong>
            <span v-if="isLpaSession" class="q-ml-sm">
              <q-badge color="warning" label="LPA" />
            </span>
          </div>
          <template v-slot:action>
            <q-btn flat label="Disconnect" @click="disconnectLp" />
          </template>
        </q-banner>
      </div>

      <div v-else class="q-mb-md">
        <q-banner class="bg-grey-3" rounded>
          <template v-slot:avatar>
            <q-icon name="link_off" color="grey" />
          </template>
          <div class="text-grey-8">Not connected to any LP account</div>
        </q-banner>
      </div>

      <!-- Connect New Account -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Connect LP Account</div>
        <div class="row q-gutter-sm">
          <q-input
            v-model="accountIdInput"
            outlined
            dense
            label="LP Account ID"
            placeholder="e.g., 12345678"
            class="col"
            @keyup.enter="initiateLogin"
          />
          <q-btn
            color="primary"
            label="Connect via SSO"
            :loading="isLoading"
            :disable="!accountIdInput"
            @click="initiateLogin"
          />
        </div>
      </div>

      <!-- Saved/Linked Accounts -->
      <div v-if="linkedAccounts.length > 0" class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Linked Accounts</div>
        <q-list bordered separator class="rounded-borders">
          <q-item
            v-for="accountId in linkedAccounts"
            :key="accountId"
            clickable
            @click="quickConnect(accountId)"
          >
            <q-item-section avatar>
              <q-icon
                :name="
                  accountId === activeLpAccountId
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked'
                "
                :color="accountId === activeLpAccountId ? 'positive' : 'grey'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ accountId }}</q-item-label>
              <q-item-label caption>
                <span v-if="lpConnections[accountId]?.lastAccess">
                  Last accessed:
                  {{ formatDate(lpConnections[accountId].lastAccess) }}
                </span>
                <span v-if="lpConnections[accountId]?.isLPA" class="q-ml-sm">
                  <q-badge color="warning" label="LPA" />
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  v-if="accountId !== defaultAccountId"
                  flat
                  dense
                  size="sm"
                  icon="star_outline"
                  @click.stop="setAsDefault(accountId)"
                >
                  <q-tooltip>Set as default</q-tooltip>
                </q-btn>
                <q-icon v-else name="star" color="amber">
                  <q-tooltip>Default account</q-tooltip>
                </q-icon>
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="login"
                  color="primary"
                  @click.stop="quickConnect(accountId)"
                >
                  <q-tooltip>Connect</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- LP Feature Status -->
      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">LP Features</div>
        <div class="row q-gutter-sm">
          <q-chip
            v-for="feature in lpFeatures"
            :key="feature.name"
            :color="hasActiveLpSession ? 'positive' : 'grey-4'"
            :text-color="hasActiveLpSession ? 'white' : 'grey-7'"
            :icon="feature.icon"
          >
            {{ feature.name }}
          </q-chip>
        </div>
        <div v-if="!hasActiveLpSession" class="text-caption text-grey q-mt-sm">
          Connect to an LP account to unlock these features
        </div>
      </div>
    </q-card-section>

    <!-- Error display -->
    <q-card-section v-if="error" class="q-pt-none">
      <q-banner class="bg-negative text-white" rounded>
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Dismiss" @click="clearError" />
        </template>
      </q-banner>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useFirebaseAuthStore } from "src/stores/store-firebase-auth";
import { useUserStore } from "src/stores/store-user";
import { storeToRefs } from "pinia";

const firebaseAuth = useFirebaseAuthStore();
const userStore = useUserStore();

const {
  hasActiveLpSession,
  activeLpAccountId,
  isLpaSession,
  linkedAccounts,
  defaultAccountId,
  lpConnections,
  error,
} = storeToRefs(firebaseAuth);

const accountIdInput = ref("");
const isLoading = ref(false);

// LP Features that require authentication
const lpFeatures = [
  { name: "Conversation Manager", icon: "forum" },
  { name: "Conversation Tester", icon: "science" },
  { name: "Site Settings", icon: "settings" },
  { name: "Bot Debug", icon: "bug_report" },
  { name: "Account Snapshots", icon: "backup" },
];

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString();
};

const initiateLogin = async () => {
  if (!accountIdInput.value) return;

  isLoading.value = true;
  try {
    // Get LP domains first
    await userStore.getlpDomains(accountIdInput.value);

    // Get the sentinel URL and redirect
    const url = await userStore.getSentinelUrl(accountIdInput.value);
    if (url) {
      // Store the account ID we're trying to connect to
      sessionStorage.setItem("pendingLpAccountId", accountIdInput.value);
      window.location.href = url;
    }
  } catch (err) {
    console.error("Error initiating LP login:", err);
    firebaseAuth.error = "Failed to initiate LP login";
  } finally {
    isLoading.value = false;
  }
};

const quickConnect = async (accountId: string) => {
  accountIdInput.value = accountId;
  await initiateLogin();
};

const disconnectLp = () => {
  firebaseAuth.clearLpSession();
};

const setAsDefault = async (accountId: string) => {
  await firebaseAuth.setDefaultAccount(accountId);
};

const clearError = () => {
  firebaseAuth.clearError();
};
</script>

<style scoped lang="scss">
.lp-account-connector {
  max-width: 500px;
}
</style>
