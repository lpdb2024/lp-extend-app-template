<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="Filter Users"
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
      <q-td key="userTypeId" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.userTypeId === 1 ? 'HUMAN' : 'BOT' }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="id" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.id }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="profileIds" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.profileIds?.length > 0 ? props.row?.profileIds.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="permissionGroups" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.permissionGroups?.length > 0 ? props.row?.permissionGroups.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="skills" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.skills?.length > 0 ? props.row?.skills.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="dateCreated" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.dateCreated }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="maxChats" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.maxChats }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="skillIds" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.skillIds?.length === 0 ?
           'N/A' :
           props.row?.skillIds?.length > 3 ?
           props.row?.skillIds.slice(0, 3).join(', ') + ` + ${props.row?.skillIds.length - 3} more` :
          props.row?.skillIds.join(', ') }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="loginName" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.loginName }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="nickname" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.nickname }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="fullName" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.fullName }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="memberOf" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.memberOf?.length > 0 ? props.row?.memberOf.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="email" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.email }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="lobs" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.lobs?.length > 0 ? props.row?.lobs.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="managerOf" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200"
          v-for="manager in props.row?.managerOf"
          :key="manager">
          {{ manager?.agentGroupId }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="pictureUrl" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          <q-avatar v-if="props.row?.pictureUrl">
            <q-img :src="props.row?.pictureUrl" alt="User Picture" class="max-width-100"
            error-src="~assets/images/ftfile-broken-lg.png"
            />
          </q-avatar>
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="profiles" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.profiles?.length > 0 ? props.row?.profiles.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="employeeId" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.employeeId }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="managedAgentGroups" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.managedAgentGroups?.length > 0 ? props.row?.managedAgentGroups.join(', ') : 'N/A' }}
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
      <q-td key="deleted" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.deleted }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="isEnabled" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.isEnabled ? 'Yes' : 'No' }}
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
import type { CCUser } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
const props = defineProps<{
  rows: CCUser[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 20,
};

const values = ref<CCUser[]>(props.rows);
const options = ref<CCUser[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: CCUser) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).users ?? [];

/*
colum order for table:::
[
    {
      "name": "userTypeId",
      "label": "userTypeId",
      "align": "left",
      "field": "userTypeId",
      "classes": "ellipsis",
      "style": "max-width: 160px;"
    },
    {
      "name": "id",
      "label": "id",
      "align": "left",
      "field": "id",
      "sortable": true,
      "classes": "word-wrap",
      "style": "max-width: 200px;"
    },

    {
      "name": "profileIds",
      "label": "profileIds",
      "align": "left",
      "field": "profileIds",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "permissionGroups",
      "label": "permissionGroups",
      "align": "left",
      "field": "permissionGroups",
      "classes": "word-wrap",
      "style": "max-width: 100px;"
    },
    {
      "name": "skills",
      "label": "skills",
      "align": "left",
      "field": "skills",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "dateCreated",
      "label": "dateCreated",
      "align": "left",
      "field": "dateCreated"
    },
    {
      "name": "maxChats",
      "label": "maxChats",
      "align": "left",
      "field": "maxChats",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "skillIds",
      "label": "skillIds",
      "align": "left",
      "field": "skillIds",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "loginName",
      "label": "Login Name",
      "align": "left",
      "field": "loginName",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "nickname",
      "label": "Nickname",
      "align": "left",
      "field": "nickname",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "fullName",
      "label": "Full Name",
      "align": "left",
      "field": "fullName",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "memberOf",
      "label": "memberOf",
      "align": "left",
      "field": "memberOf",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "email",
      "label": "email",
      "align": "left",
      "field": "email",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "lobs",
      "label": "lobs",
      "align": "left",
      "field": "lobs",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "managerOf",
      "label": "managerOf",
      "align": "left",
      "field": "managerOf",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "pictureUrl",
      "label": "pictureUrl",
      "align": "left",
      "field": "pictureUrl",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "profiles",
      "label": "profiles",
      "align": "left",
      "field": "profiles",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },

    {
      "name": "employeeId",
      "label": "employeeId",
      "align": "left",
      "field": "employeeId",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "managedAgentGroups",
      "label": "managedAgentGroups",
      "align": "left",
      "field": "managedAgentGroups",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "dateUpdated",
      "label": "dateUpdated",
      "align": "left",
      "field": "dateUpdated",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "deleted",
      "label": "deleted",
      "align": "left",
      "field": "deleted",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    },
    {
      "name": "isEnabled",
      "label": "isEnabled",
      "align": "left",
      "field": "isEnabled",
      "classes": "word-wrap",
      "style": "max-width: 300px;"
    }
  ]
*/
</script>

<style scoped lang="scss">

</style>
