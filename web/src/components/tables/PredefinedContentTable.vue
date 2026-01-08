<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="Filter Predefined Content"
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
      <q-td key="data" :props="props">
        <q-item-section>
          <div
          v-for="(value, key) in props.row?.data"
            :key="key"
          >
            <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ value?.title }}
            </q-item-label>
            <q-item-label class="ff-inter-light word-wrap max-width-200" caption
            :class="`text-${colors.tableChipColor}`"
            >
            {{ value?.lang }}
            </q-item-label>
          </div>
        </q-item-section>
      </q-td>
      <q-td key="enabled" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.enabled }}
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
      <q-td key="hotkey" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200"
          v-if="props.row?.hotkey"
          >

          <q-chip
          size="sm"
          outline
          square
          :color="colors.tableChipColor"
          >
          {{ props.row?.hotkey?.prefix }} + {{ props.row?.hotkey?.suffix }}
          </q-chip>
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
      <q-td key="categoriesIds" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ displayArray(props.row?.categoriesIds) }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="skillIds" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ displayArray(props.row?.skillIds) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="lobIds" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ displayArray(props.row?.lobIds) }}
          </q-item-label>
        </q-item-section>
      </q-td>
    </q-tr>
  </template>
  </q-table>
</template>
<script setup lang="ts">
// import type { QTableProps } from 'quasar';
import { useAppStore } from 'src/stores/store-app';
const appStore = useAppStore();
const { colors } = storeToRefs(appStore);
import { useQuasar } from 'quasar';
import type { QTableProps } from 'quasar';
import type { PredefinedContent } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
import { displayArray } from 'src/utils/functions';
const props = defineProps<{
  rows: PredefinedContent[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<PredefinedContent[]>(props.rows);
const options = ref<PredefinedContent[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: PredefinedContent) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).predefinedContent ?? [];

</script>

<style scoped lang="scss">

</style>
