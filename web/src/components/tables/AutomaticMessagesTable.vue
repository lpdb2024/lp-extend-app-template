<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="Filter Automatic Messages"
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
      <q-td key="enabled" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ returnStatus(props.row) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="id" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ humaniseText(props.row?.id) }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="contexts" :props="props">
        <q-item-label class="ff-inter-light word-wrap max-width-200">
          <div>
            <q-chip
            size="sm"
            outline
            v-for="context in getContexts(props.row).slice(0, 3)"
            :key="context.skillId"
            >
              {{ useACStore().skillIdToName(context.skillId) }}
            </q-chip>
            <q-chip
            size="sm"
            v-if="getContexts(props.row).length > 3"
            class="q-ml-xs"
            :label="`+ ${getContexts(props.row).length - 3} more`"
            outline
            :color="colors.tableChipColor"
            />
          </div>
        </q-item-label>
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
import type { AutomaticMessage } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
import { humaniseText } from 'src/utils/functions';
import { useACStore } from 'src/stores/store-ac';
const props = defineProps<{
  rows: AutomaticMessage[];
  custom: AutomaticMessage[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<AutomaticMessage[]>(props.rows);
const options = ref<AutomaticMessage[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: AutomaticMessage) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).automaticMessages ?? [];

function returnStatus(row: AutomaticMessage): string {
  const modification = props.custom.find((item) => item.id === row.id);
  if (modification?.id.toLowerCase().includes('join')) console.log('modification', modification);
  if (!modification) {
    return 'Active'
  }
  if (modification?.contexts?.SKILL?.length > 0) {
    const allEnabled = modification.contexts.SKILL.every((skill) => skill.enabled);
    const someEnabled = modification.contexts.SKILL.some((skill) => skill.enabled);
    if (allEnabled) {
      return 'Active';
    }
    if (someEnabled) {
      return 'Multiple';
    }
    return 'Inactive';
  }
  return modification?.enabled ? 'Active' : 'Inactive';

}

function getContexts(row: AutomaticMessage): { skillId: number; enabled: boolean }[] {
  const modification = props.custom.find((item) => item.id === row.id);
  if (!modification) {
    return []
  }

  return modification.contexts?.SKILL || [];
}
</script>

<style scoped lang="scss">

</style>
