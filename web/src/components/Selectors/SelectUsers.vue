<template>
  <div class="w100">
    <q-select
    @filter="filter"
    class="w100 ff-exo"
    use-input
    filled
    :disable="disabled || loading || propLoading"
    :multiple="multiple"
    :dense="dense"
    :color="$q.dark.isActive ? 'info' : 'indigo'"
    :label="label || 'Select routing user'"
    :options="userOptions"
    v-model="model"
    option-label="fullName"
    hide-bottom-space
    hide-hint
    :popup-content-class="`cc-menu ${$q.dark.isActive ? 'dark' : 'light'}`"
    use-chips
    :loading="loading || propLoading"
    >
      <template v-slot:option="scope" >
        <q-item v-bind="scope.itemProps" class="user-item ff-exo">
          <q-item-section side>
            <q-icon
            size="xs"
            v-if="scope.opt.userTypeId === 1"
            name="fas fa-user"
            ></q-icon>
            <q-icon
            size="xs"
            v-else-if="scope.opt.userTypeId === 2"
            name="fas fa-robot"
            ></q-icon>

          </q-item-section>

          <q-item-section>
            <q-item-label>{{ scope.opt.fullName }}</q-item-label>
            <q-item-label caption
            :class="$q.dark.isActive ? 'text-orange' : 'text-indigo'"
            >{{ scope.opt.nickname }} | {{ scope.opt.id }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:append v-if="!loading && !propLoading">
        <q-icon v-if="clearable" class="pointer" name="sym_o_cancel" @click="clear"/>
        <q-icon class="pointer" name="sync" @click="store.getUsers()"/>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            <q-item-label>
              No users found
            </q-item-label>
            <!-- <q-item-label>
              <q-btn
              :label="`create user ${ searchTerm }`"
              icon="sym_o_add"
              no-caps
              outline
              color="blue-14"
              rounded
              class="text-bold"
              size="sm"
              @click="createuser()"
              >
              </q-btn>
            </q-item-label> -->
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useACStore } from 'src/stores/store-ac'
import type { CCUser } from 'src/interfaces'
import { watch, onMounted, ref, useModel } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const store = useACStore()
const { users } = storeToRefs(store)
interface Props {
  types?: number[];
  dense?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: CCUser | CCUser[] | null | undefined;
  multiple?: boolean;
  userId?: string | number | null | undefined;
  label?: string;
  propLoading?: boolean;
  type?: number;
}
const emits = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<Props>(), {
  dense: false,
  modelValue: null
})
const model = useModel(props, 'modelValue')
watch(model, (val) => {
  emits('update:modelValue', val)
})
const loading = ref(false)
const userOptions = ref<CCUser[]>([])
const searchTerm = ref()
const filter = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
  const filteredUsers = props.type ? users.value.filter(v => props.type === v.userTypeId) : users.value
  if (val === '') {
    searchTerm.value = null
    update(() => {
      userOptions.value = filteredUsers
    })
    return
  }

  update(() => {
    searchTerm.value = val.toLowerCase().replace(/ /gmi, '_')
    const needle = val.toLowerCase()
    userOptions.value = filteredUsers.filter(v => v.fullName.toLowerCase().indexOf(needle) > -1 || String(v.id).indexOf(needle) > -1)
  })
}
const clear = () => {
  if (Array.isArray(model.value)) {
    model.value = []
  } else {
    model.value = null
  }
}

// const createuser = async () => {
//   const newuser: IuserRequest = {
//     name: searchTerm.value,
//     description: searchTerm.value,
//     maxWaitTime: 0,
//     userRoutingConfiguration: [],
//     defaultPostChatSurveyId: null,
//     defaultOfflineSurveyId: null,
//     defaultAgentSurveyId: null,
//     wrapUpTime: null,
//     lobIds: [],
//     canTransfer: false,
//     userTransferList: [],
//     slaDefaultResponseTime: null,
//     slaUrgentResponseTime: null,
//     slaFirstTimeResponseTime: null,
//     transferToAgentMaxWaitInSeconds: null,
//     workingHoursId: null,
//     specialOccasionId: null,
//     autoCloseInSeconds: null,
//     fallbackuser: null,
//     fallbackWhenAllAgentsAreAway: false,
//     agentSurveyForMsgId: null,
//     agentSurveyForMsgTimeoutInMinutes: null,
//     redistributeLoadToConnectedAgentGroups: false
//   }
//   const s = await store.createuser(newuser)
//   model.value = s
// }
onMounted(async () => {
  await store.getUsers(true)
  const response = await store.getUsers(true)
  userOptions.value = response
  if (props.userId) {
    const existing = users.value.find(v => String(v.id) === String(props.userId))
    console.log('existing user', existing)
    if (existing) model.value = existing
  }
  if (props.type) {
    const f = userOptions.value.filter(v => props.type === v.userTypeId)
    userOptions.value = f
    console.log('filtered', f)
  }
})
</script>
