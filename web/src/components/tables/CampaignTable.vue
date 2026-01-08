<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="Filter Working Hours"
    v-model="filterQuery"
    class="w-300 mb-10"
    :debounce="200"
    @update:model-value="filter"
    :dark="$q.dark.isActive"
    :color="colors.tableChipColor"
    ></q-input>
  </div>
  <q-table
  ref="tableTaskStatus"
  id="skills-status"
  class="le-table ff-inter"
  :class="{'dark': $q.dark.isActive}"
  flat
  :rows="options"
  :columns="columns"
  row-key="id"
  :pagination="initialPagination"
  >
  <template v-slot:body="props">
    <q-tr :props="props"
    >
      <q-td key="id" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.id }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="name" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.name }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="description" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.description }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="engagementIds" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ displayArray(props.row?.engagementIds) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="startDate" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.startDate }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="expirationDate" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.expirationDate }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="goalId" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.goalId }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="status" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.status }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="isDeleted" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.isDeleted }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="weight" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.weight }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="priority" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.priority }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="timeZone" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.timeZone }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="type" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.type }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <!-- <q-td key="timezone" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ getTimeZone(props.row?.events) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="events" :props="props">
        <q-item-section>
          <span
          v-for="(event, index) in props.row?.events"
          :key="`event-${index}`"
          class="fr"
          >
            <q-item-label class="ff-inter-light mr-4 mb-a mt-a" caption
            :class="`text-${colors.mono}`"
            >
            {{ getDay(event.start?.dateTime) }}:
            </q-item-label>

            <q-item-label class="ff-inter-light mb-a mt-a" caption
            :class="`text-${colors.tableChipColor}`"
            >
            {{ getTime(event.start?.dateTime) }}
            </q-item-label>
            <q-item-label class="mr-2 ml-2">-</q-item-label>
            <q-item-label class="ff-inter-light mb-a mt-a" caption
            :class="`text-${colors.tableChipColor}`"
            >
            {{ getTime(event.start?.dateTime) }}
            </q-item-label>

          </span>
        </q-item-section>
      </q-td> -->

    </q-tr>
  </template>
  </q-table>
</template>
<script setup lang="ts">
import { useAppStore } from 'src/stores/store-app';
const appStore = useAppStore();
const { colors } = storeToRefs(appStore);
import { useQuasar } from 'quasar';
import type { QTableProps } from 'quasar';
import type { ICampaign } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
import { displayArray } from 'src/utils/functions';
// import moment from 'moment';
const props = defineProps<{
  rows: ICampaign[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<ICampaign[]>(props.rows);
const options = ref<ICampaign[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: ICampaign) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).campaigns ?? [];

</script>

<style scoped lang="scss">

</style>
