<template>
  <div class="w100">
    <q-select
    @filter="filter"
    class="w100"
    use-input
    filled
    :multiple="props.multiple"
    :dense="dense"
    :color="$q.dark.isActive ? 'info' : 'indigo'"
    label="Select engagement"
    :options="modelOptions"
    v-model="model"
    option-label="name"
    hide-bottom-space
    hide-hint
    :popup-content-class="`cc-menu ${$q.dark.isActive ? 'dark' : 'light'}`"
    use-chips
    :loading="loading"
    >
      <template v-slot:option="scope" >
        <q-item v-bind="scope.itemProps" class="campaign-item">
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption>
              <div class="fr">
                <q-icon size="xs"  color="blue-grey-8" name="sym_o_double_arrow"></q-icon>
                {{  scope.opt.skillName }} ({{ scope.opt.skillId }})
              </div>

            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useACStore } from 'src/stores/store-ac'
import type { ICampaignEngagement } from 'src/interfaces'
import { onMounted, ref, useModel } from 'vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const store = useACStore()
interface Props {
  dense?: boolean;
  engagements: ICampaignEngagement[];
  modelValue: ICampaignEngagement | null;
  multiple?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  dense: false,
  modelValue: null
})
const model = useModel(props, 'modelValue')
const loading = ref(false)
const modelOptions = ref<ICampaignEngagement[]>([])
const filter = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
  if (val === '') {
    update(() => {
      modelOptions.value = props.engagements
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    modelOptions.value = props.engagements.filter(v => v.name.toLowerCase().indexOf(needle) > -1 || String(v.id).indexOf(needle) > -1)
  })
}

onMounted(async () => {
  await store.getUsers(true)
  modelOptions.value = props.engagements
})
</script>
