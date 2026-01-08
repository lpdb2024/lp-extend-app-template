<template>
  <div class="w-100-p">

    <q-select
    @filter="filter"
    class="w-100-p"
    use-input
    filled
    :disable="disabled"
    :multiple="multiple"
    :dense="dense"
    :color="colorString ?  colorString : $q.dark.isActive ? 'info' : 'indigo'"
    label="Select routing skill"
    :options="skillOptions"
    v-model="model"
    option-label="name"
    hide-bottom-space
    hide-hint
    :popup-content-class="`cc-menu ${$q.dark.isActive ? 'dark' : 'light'}`"
    use-chips
    :loading="loading"
    >
      <template v-slot:selected-item="scope" v-if="multiple">
        <q-chip
        removable
        dense
        outlined
        :class="colorString ? `text-${colorString}` : $q.dark.isActive ? 'text-info' : 'text-indigo'"
        @remove="scope.removeAtIndex(scope.index)"
        :tabindex="scope.tabindex"
        class="q-ma-none"
        >
          {{ (scope.opt as ISkillInfo)?.name }}{{ showSkillId ? `| ${ (scope.opt as ISkillInfo)?.id }` : '' }}
        </q-chip>
      </template>
      <template v-slot:selected v-if="!multiple">
        <q-chip
        v-if="model"
        outlined
        :class="colorString ? `text-${colorString}` : $q.dark.isActive ? 'text-info' : 'text-indigo'"
        removable
        @remove="model = multiple ? (model as ISkillInfo[]).filter(v => v.id !== (model as ISkillInfo).id) : undefined"
        >
        {{ (model as ISkillInfo)?.name }}{{ showSkillId ? `| ${ (model as ISkillInfo)?.id }` : '' }}
        </q-chip>
      </template>

      <template v-slot:option="scope" >
        <q-item v-bind="scope.itemProps" class="skill-item">
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}{{ showSkillId ? `| ${ scope.opt.id }` : '' }}</q-item-label>
            <q-item-label v-if="scope.opt?.bots?.length > 0" class="fr">
              <div class="fc jc-c">
                <q-icon name="fas fa-robot"></q-icon>
              </div>
              <div class="fc jc-c">
                <div class="w100 h100" v-if="scope.opt?.bots?.length > 0">
                  <q-chip
                  class="bg-indigo-4 text-white"
                  v-for="b in scope.opt.bots"
                  :key="b.id"
                  >
                  {{ b.name }} {{ showSkillId ? `| ${ b.id }` : '' }}
                  </q-chip>

                </div>
                <div v-else>
                  <q-chip
                  class="bg-red-4 text-white"
                  >
                  no bot agents
                  </q-chip>
                </div>
              </div>

            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:append v-if="!loading">
        <q-icon class="pointer" name="sync" @click="store.getSkills()"/>
      </template>
      <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              <q-item-label>
                No skills found
              </q-item-label>
              <q-item-label>
                <q-btn
                :label="`create skill ${ searchTerm }`"
                icon="sym_o_add"
                no-caps
                outline
                :color="colorString ?  colorString : $q.dark.isActive ? 'info' : 'indigo'"
                rounded
                class="text-bold"
                size="sm"
                @click="createSkill()"
                >
                </q-btn>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useACStore } from 'src/stores/store-ac'
import type { ISkillInfo, ISkillRequest } from 'src/interfaces'
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const store = useACStore()
const { skills } = storeToRefs(store)
interface Props {
  loading?: boolean;
  dense?: boolean;
  disabled?: boolean;
  modelValue?: ISkillInfo | ISkillInfo[] | null | undefined;
  multiple?: boolean;
  skillId?: number | string | undefined;
  showSkillId?: boolean;
  label?: string;
  isEngagement?: boolean;
  colorString?: string;
}
const emits = defineEmits<{
  'update:modelValue': [value: ISkillInfo | ISkillInfo[] | undefined];
}>();
const props = withDefaults(defineProps<Props>(), {
  dense: false,
  modelValue: null
})
const model = computed({
  get: () => props.modelValue as ISkillInfo | ISkillInfo[] | undefined,
  set: (val: ISkillInfo | ISkillInfo[] | undefined) => {
    emits('update:modelValue', val);
  }
})
// const skills = ref<ISkillInfo[]>([])
const skillOptions = ref<ISkillInfo[]>([])
const searchTerm = ref()
const filter = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
  if (val === '') {
    searchTerm.value = null
    update(() => {
      skillOptions.value = skills.value
    })
    return
  }

  update(() => {
    searchTerm.value = val.toLowerCase().replace(/ /gmi, '_')
    const needle = val.toLowerCase()
    skillOptions.value = skills.value.filter((v: ISkillInfo) => v.name.toLowerCase().indexOf(needle) > -1 || String(v.id).indexOf(needle) > -1)
  })
}

const clear = () => {
  model.value = undefined
}

const createSkill = async () => {
  // gi-fiserve-sales
  const newSkill: ISkillRequest = {
    name: searchTerm.value,
    description: searchTerm.value,
    maxWaitTime: 0,
    skillRoutingConfiguration: [],
    defaultPostChatSurveyId: null,
    defaultOfflineSurveyId: null,
    defaultAgentSurveyId: null,
    wrapUpTime: null,
    lobIds: [],
    canTransfer: false,
    skillTransferList: [],
    slaDefaultResponseTime: null,
    slaUrgentResponseTime: null,
    slaFirstTimeResponseTime: null,
    transferToAgentMaxWaitInSeconds: null,
    workingHoursId: null,
    specialOccasionId: null,
    autoCloseInSeconds: null,
    fallbackSkill: null,
    fallbackWhenAllAgentsAreAway: false,
    agentSurveyForMsgId: null,
    agentSurveyForMsgTimeoutInMinutes: null,
    redistributeLoadToConnectedAgentGroups: false
  }
  const s = await store.createSkill(newSkill)
  if (s) {
    model.value = s
  }
}

const updateSkillById = (skillId: number | string) => {
  const existing = skills.value.find((v: { id: number | undefined }) => String(v.id) === String(skillId))
  if (existing) {
    model.value = existing
  } else {
    console.warn('Skill not found', skillId)
  }
}

onMounted(async () => {
  await store.getUsers(true)
  const response = await store.getSkills(true)
  skillOptions.value = response
  if (props.skillId) {
    const existing = skills.value.find((v: { id: number | undefined }) => String(v.id) === String(props.skillId))
    console.info('existing', existing)
    if (existing) model.value = existing
  }
})

defineExpose({
  clear,
  updateSkillById
})
</script>
