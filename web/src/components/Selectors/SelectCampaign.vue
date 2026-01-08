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
    label="Select campaign"
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
              {{ scope.opt.engagementIds.length }} {{ scope.opt.engagementIds.length > 1 ? 'engagements' : 'engagement' }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:append v-if="!loading">
        <q-icon class="pointer" name="sync" @click="store.getCampaigns()"/>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useACStore } from 'src/stores/store-ac'
import type { ICampaign } from 'src/interfaces'
import { onMounted, ref, useModel } from 'vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const store = useACStore()
interface Props {
  dense?: boolean;
  modelValue: ICampaign | null;
  multiple?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  dense: false,
  modelValue: null
})
const model = useModel(props, 'modelValue')
const loading = ref(false)
const campaigns = ref<ICampaign[]>([])
const modelOptions = ref<ICampaign[]>([])
const filter = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
  if (val === '') {
    update(() => {
      modelOptions.value = campaigns.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    modelOptions.value = campaigns.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1 || String(v.id).indexOf(needle) > -1)
  })
}

onMounted(async () => {
  await store.getUsers(true)
  const response = await store.getCampaigns(true)
  modelOptions.value = response
  campaigns.value = response
})
</script>
