<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="FilterQuery Skills"
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
  row-key="id"
  :pagination="initialPagination"
  >
  </q-table>
</template>
<script setup lang="ts">
// import type { QTableProps } from 'quasar';
import { useAppStore } from 'src/stores/store-app';
const appStore = useAppStore();
const { colors } = storeToRefs(appStore);
import { useQuasar } from 'quasar';
import type { ISkillInfo } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
// import tableHeaders from './tableheaders.json'
const props = defineProps<{
  rows: ISkillInfo[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<ISkillInfo[]>(props.rows);
const options = ref<ISkillInfo[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: ISkillInfo) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
// const columns = (tableHeaders as Record<string, QTableProps['columns']>).skills ?? [];
</script>

<style scoped lang="scss">

</style>
