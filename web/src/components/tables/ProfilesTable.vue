<template>
  <div class="w-100-p fr jc-s">
    <q-input
    filled
    label="Filter profiles"
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
      <q-td key="roleTypeId" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.roleTypeId }}
          </q-item-label>
        </q-item-section>
      </q-td>
      <q-td key="roleTypeName" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.roleTypeName }}
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

      <q-td key="permissions" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light max-width-200">
          {{ props.row?.permissions?.length > 0 ? props.row?.permissions.join(', ') : 'N/A' }}
          </q-item-label>
        </q-item-section>
      </q-td>

      <q-td key="numOfAssignedUsers" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.numOfAssignedUsers }}
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

      <q-td key="isAssignedToLPA" :props="props">
        <q-item-section>
          <q-item-label class="ff-inter-light word-wrap max-width-200">
          {{ props.row?.isAssignedToLPA }}
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
import type { IProfile } from 'src/interfaces';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import tableHeaders from './tableheaders.json'
const props = defineProps<{
  rows: IProfile[];
}>();

const $q = useQuasar();
const filterQuery = ref("");
const initialPagination = {
  sortBy: "id",
  descending: false,
  page: 1,
  rowsPerPage: 70,
};

const values = ref<IProfile[]>(props.rows);
const options = ref<IProfile[]>(props.rows);

const filter = () => {
  if (!filterQuery.value) {
    options.value = values.value;
    return options.value;
  }
  const query = filterQuery.value.toLowerCase();
  options.value = values.value.filter((item: IProfile) => {
    return JSON.stringify(item).toLowerCase().includes(query);
  });
  return options.value;
};
const columns = (tableHeaders as Record<string, QTableProps['columns']>).profiles ?? [];

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

<style lang="scss">
.permissions {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
  max-height: 100px;
}
</style>
