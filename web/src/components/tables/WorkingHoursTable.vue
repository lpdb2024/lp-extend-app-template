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

      <q-td key="default" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            {{ props.row?.default }}
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

      <q-td key="timezone" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
            <!-- {{ props.row?.events?>.(start|end)?.timeZone }} -->
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
import type { IWorkingDayProfile } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
import moment from 'moment';
const props = defineProps<{
  rows: IWorkingDayProfile[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<IWorkingDayProfile[]>(props.rows);
const options = ref<IWorkingDayProfile[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: IWorkingDayProfile) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).workingHours ?? [];

function getTimeZone(events: IWorkingDayProfile['events']): string {
  if (!events || events.length === 0) return 'N/A';
  for (const event of events) {
    if (event.start?.timeZone) {
      return event.start.timeZone;
    }
    if (event.end?.timeZone) {
      return event.end.timeZone;
    }
  }
  return 'N/A';
}
function getDay(dateTime: string | undefined): string {
  if (!dateTime) return 'N/A';
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}
function getTime (dateTime: string | undefined): string {
// return moment with format HH:mm
  if (!dateTime) return 'N/A';
  return moment(dateTime).format('HH:mm');
}
</script>

<style scoped lang="scss">

</style>
