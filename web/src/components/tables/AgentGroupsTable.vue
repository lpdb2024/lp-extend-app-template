<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="Filter Agent Groups"
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

      <q-td key="members" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ displayArray(props.row?.members) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="managers" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ displayArray(props.row?.managers) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="dateUpdated" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.dateUpdated }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="isEnabled" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.isEnabled }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="deleted" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.deleted }}
          </q-item-label>
        </q-item-section>
      </q-td>

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
import type { AgentGroup } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
import { displayArray } from 'src/utils/functions';
// import moment from 'moment';
const props = defineProps<{
  rows: AgentGroup[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<AgentGroup[]>(props.rows);
const options = ref<AgentGroup[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: AgentGroup) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).agentGroups ?? [];

</script>

<style scoped lang="scss">

</style>
