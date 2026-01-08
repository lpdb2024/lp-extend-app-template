<template>
  <div class="fc">
    <span
      class="fw600 mb-10"
      id="start"
      :class="$q.dark.isActive ? 'text-info' : 'text-indigo'"
    >
      Service Workers
    </span>
    <div class="fr">
      <q-btn
        size="sm"
        label="add service worker"
        icon="sym_o_add"
        class="q-mb-md"
        :class="$q.dark.isActive ? 'text-white' : 'n-blue'"
        no-caps
        flat
        :loading="loading"
      >
        <q-menu>
          <q-card class="">
            <CardHeader title="Add Service Worker" />
            <q-card-section>
              <!-- <SelectCCAppKey v-model="selectedAppKey" class="mb-5"/> -->
              <SelectUsers
                v-model="selectedUser"
                label="select user agent"
                :type="2"
              />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn label="cancel" flat />
              <q-btn label="add" color="primary" @click="addServiceWorker" />
            </q-card-actions>
          </q-card>
        </q-menu>
      </q-btn>
    </div>
    <q-table
      ref="swTable"
      id="service-workers-table"
      class="workers-table ff-exo"
      :class="{ dark: $q.dark.isActive }"
      flat
      :loading="loading"
      :rows="serviceWorkers"
      :columns="SWHheaders"
      row-key="id"
      no-data-label="I didn't find anything for you"
      no-results-label="The filter didn't uncover any results"
      :hide-bottom="serviceWorkers.length > 0"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="enabled" :props="props">
            <q-icon
              :name="
                props.row?.userEnabled && props.row?.apiKeyEnabled
                  ? 'sym_o_check_circle'
                  : 'sym_o_cancel'
              "
              size="sm"
              :color="
                props.row?.userEnabled && props.row?.apiKeyEnabled
                  ? 'green'
                  : 'red'
              "
            ></q-icon>
            <ToolTip
              :title="
                props.row?.userEnabled && props.row?.apiKeyEnabled
                  ? 'Worker is enabled'
                  : 'Worker is disabled'
              "
              :anchor="'top left'"
              :self="'bottom middle'"
              :offset="[0, 10]"
              :maxWidth="'w-200'"
              :icon="
                props.row?.userEnabled && props.row?.apiKeyEnabled
                  ? 'sym_o_check_circle'
                  : 'sym_o_cancel'
              "
              :iconSize="'md'"
              :iconColor="
                props.row?.userEnabled && props.row?.apiKeyEnabled
                  ? 'green'
                  : 'red'
              "
              :description="
                props.row?.userEnabled && props.row?.apiKeyEnabled
                  ? 'Worker is enabled for user and API key'
                  : 'Worker is disabled for user and API key'
              "
            >
              <template v-slot:description>
                <q-item dense>
                  <q-item-section side class="w-100">
                    <q-item-label title> User: </q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>
                      {{ props.row?.userEnabled ? "enabled" : "disabled" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item dense>
                  <q-item-section side class="w-100">
                    <q-item-label title> API key: </q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>
                      {{ props.row?.apiKeyEnabled ? "enabled" : "disabled" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </ToolTip>
          </q-td>

          <q-td key="appName" :props="props">
            <q-item-label>
              {{ acStore.appKeyName(props.row.appName) }}
            </q-item-label>
          </q-td>
          <q-td key="id" :props="props">
            <q-item-label>
              {{ props.row.id }}
            </q-item-label>
          </q-td>

          <q-td key="isEnabled" :props="props">
            <q-icon
              :name="
                props.row.userEnabled ? 'sym_o_check_circle' : 'sym_o_cancel'
              "
              size="sm"
              :color="props.row.userEnabled ? 'green' : 'red'"
            ></q-icon>
          </q-td>

          <q-td key="loginName" :props="props">
            {{ props.row.agentName }}
          </q-td>

          <q-td key="userId" :props="props">
            {{ props.row.user_id }}
          </q-td>

          <q-td key="select" :props="props">
            <q-btn
              icon="sym_o_more_vert"
              flat
              :color="$q.dark.isActive ? 'white' : 'blue'"
            >
              <q-menu>
                <q-card class="ff-exo w-300">
                  <CardHeader title="edit worker" />
                  <q-card-section>
                    <q-list>
                      <q-item clickable>
                        <q-item-section side>
                          <q-avatar>
                            <q-icon name="sym_o_delete" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label> remove worker </q-item-label>
                        </q-item-section>
                        <q-menu>
                          <q-card class="ff-exo">
                            <q-card-section>
                              <q-item>
                                <q-item-section side>
                                  <q-avatar>
                                    <q-icon name="sym_o_warning" />
                                  </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>
                                    Are you sure you want to remove this worker?
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn flat label="cancel" />
                              <q-btn
                                flat
                                color="negative"
                                label="remove"
                                @click="removeServiceWorker(props.row.id)"
                              />
                            </q-card-actions>
                          </q-card>
                        </q-menu>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </q-menu>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:no-data="{}">
        <div class="full-width row flex-center q-gutter-sm" v-if="!connected">
          <q-icon size="2em" name="sym_o_cloud_off" />
          <span> not connected to LivePerson </span>
        </div>
        <div class="full-width row flex-center q-gutter-sm" v-else>
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span> no service workers found </span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import SelectUsers from "src/components/Selectors/SelectUsers.vue";
import { useACStore } from "src/stores/store-ac";
import type { CCUser, ServiceWorkerData } from "src/interfaces";
import { SWHheaders } from "src/constants";

defineOptions({ name: "ServiceWorkers" });

const properties = defineProps<{
  connected: boolean;
}>();

const acStore = useACStore();

const { serviceWorkers } = storeToRefs(acStore);
const $q = useQuasar();
const loading = ref(false);
const selectedUser = ref<CCUser | null>(null);

async function removeServiceWorker(id: string) {
  loading.value = true;
  if (!id) {
    return;
  }
  const done = await acStore.removeServiceWorker(id);
  console.info(done);
  loading.value = false;
}
async function addServiceWorker() {
  console.info("addServiceWorker");

  loading.value = true;

  if (!acStore.accountId) {
    console.error("No accountId found in store");
    loading.value = false;
    return;
  }

  if (!selectedUser.value) {
    return;
  }

  const serviceWorkerBase: ServiceWorkerData = {
    account_id: acStore.accountId,
    user_id: String(selectedUser.value.id),
    app_key: selectedUser.value.allowedAppKeys,
  };
  console.info(serviceWorkerBase);
  const done = await acStore.addServiceWorker(serviceWorkerBase);
  console.info(done);
  loading.value = false;
}
onMounted(async () => {
  if (!properties.connected) {
    return;
  }
  loading.value = true;
  await acStore.getUsers(true);
  await acStore.getConvCloudAppKeys(true);
  await acStore.getServiceWorkers();
  loading.value = false;
});
</script>

<style lang="scss">
.workers-table {
  border-radius: 10px;
  background-color: #fff;
  max-height: calc(100vh - 220px);
  // box-shadow: 0 0rem 1rem 1rem #f0f0f0;
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: var(--table-header);
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }
  thead tr:first-child th {
    top: 0;
  }
  &.q-table--loading thead tr:last-child th {
    top: 48px;
  }
  tbody {
    scroll-margin-top: 48px;
  }
  &.dark {
    background: transparent !important;
    box-shadow: 0 0rem 1rem 1rem #323c6623;
    thead tr {
      background: #464765 !important;
    }
    .q-table,
    tbody {
      background: transparent !important;
    }
    .q-tr {
      background-color: rgba($color: #1b1d4d, $alpha: 0.6);
    }
  }
}
</style>
