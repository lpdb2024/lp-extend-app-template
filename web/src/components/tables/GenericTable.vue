<template>
  <q-table
  ref="tableTaskStatus"
  id="skills-status"
  class="le-table ff-inter"
  :class="{'dark': $q.dark.isActive}"
  flat
  :columns="tableHeaders"
  :rows="skills"
  row-key="id"
  :pagination="initialPagination"
  >
  </q-table>
</template>
<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { useQuasar } from 'quasar';
import type { ISkillInfo } from 'src/interfaces';

defineProps<{
  skills: ISkillInfo[];
}>();

const $q = useQuasar();
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

// fallbackWhenAllAgentsAreAway
// workingHoursId
// skillOrder
// fallbackSkill
// skillTransferList
// defaultAgentSurveyId
// redistributeLoadToConnectedAgentGroups
const tableHeaders: QTableProps['columns'] = [
  { name: 'id', label: 'skill id', align: 'left', field: 'id', sortable: true, classes: 'word-wrap', style: 'max-width: 200px;' },
  { name: 'name', label: 'name', align: 'left', field: 'name', classes: 'ellipsis', style: 'max-width: 160px;' },
  { name: 'description', label: 'description', align: 'left', field: 'description', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'canTransfer', label: 'canTransfer', align: 'left', field: 'canTransfer', classes: 'word-wrap', style: 'max-width: 100px;' },
  { name: 'maxWaitTime', label: 'maxWaitTime', align: 'left', field: 'maxWaitTime', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'deleted', label: 'deleted', align: 'left', field: 'deleted' },
  { name: 'fallbackWhenAllAgentsAreAway', label: 'fallbackWhenAllAgentsAreAway', align: 'left', field: 'fallbackWhenAllAgentsAreAway', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'workingHoursId', label: 'workingHoursId', align: 'left', field: 'workingHoursId', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'lobIds', label: 'Lines of Business', align: 'left', field: 'lobIds', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'skillOrder', label: 'skillOrder', align: 'left', field: 'skillOrder', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'fallbackSkill', label: 'fallbackSkill', align: 'left', field: 'fallbackSkill', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'skillTransferList', label: 'skillTransferList', align: 'left', field: 'skillTransferList', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'defaultAgentSurveyId', label: 'defaultAgentSurveyId', align: 'left', field: 'defaultAgentSurveyId', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'redistributeLoadToConnectedAgentGroups', label: 'redistributeLoadToConnectedAgentGroups', align: 'left', field: 'redistributeLoadToConnectedAgentGroups', classes: 'word-wrap', style: 'max-width: 300px;' },
  { name: 'dateUpdated', label: 'dateUpdated', align: 'left', field: 'dateUpdated', classes: 'word-wrap', style: 'max-width: 300px;' }
]
</script>

<style scoped lang="scss">

</style>
