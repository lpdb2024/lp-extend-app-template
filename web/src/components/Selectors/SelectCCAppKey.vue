<template>
  <div class="w100">
    <q-select
    @filter="filter"
    class="w100 ff-exo"
    use-input
    :style="{ width: props.width }"
    filled
    :disable="disabled"
    :multiple="multiple"
    :dense="dense"
    :color="$q.dark.isActive ? 'info' : 'indigo'"
    :label="label || 'Select App key'"
    :options="keyOptions"
    v-model="model"
    option-label="appName"
    hide-bottom-space
    hide-hint
    :popup-content-class="`cc-menu ${$q.dark.isActive ? 'dark' : 'light'}`"
    :loading="loading"
    :clearable="clearable"
    >
      <template v-slot:option="scope" >
        <q-item v-bind="scope.itemProps" class="key-item ff-exo"
        :style="{ width: props.width }"
        :disable="!scope.opt.enabled"
        >
          <q-item-section>
            <q-item-label>{{ scope.opt.appName }}|{{ scope.opt.enabled }}</q-item-label>
            <q-item-label caption
            :class="$q.dark.isActive ? 'text-orange' : 'text-indigo'"
            >{{ scope.opt.appDescription || 'n/a' }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:append v-if="!loading">
        <q-icon class="pointer" name="sync" @click="store.getConvCloudAppKeys()"/>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useACStore } from 'src/stores/store-ac'
import type { ConvCloudAppKeyBasic } from 'src/interfaces'
import { watch, onMounted, ref, useModel } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
const $q = useQuasar()
const store = useACStore()
const { keys } = storeToRefs(store)

interface Props {
  width?: string;
  dense?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: ConvCloudAppKeyBasic | null | undefined;
  multiple?: boolean;
  keyId?: string | null | undefined;
  label?: string;
}
const emits = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<Props>(), {
  dense: false,
  modelValue: null
})
const model = useModel(props, 'modelValue')
watch(model, (val) => {
  if (val) {
    emits('update:modelValue', val)
  }
})
const loading = ref(false)
const keyOptions = ref<ConvCloudAppKeyBasic[]>([])
const searchTerm = ref()
const filter = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
  if (val === '') {
    searchTerm.value = null
    update(() => {
      keyOptions.value = keys.value
    })
    return
  }

  update(() => {
    searchTerm.value = val.toLowerCase().replace(/ /gmi, '_')
    const needle = val.toLowerCase()
    keyOptions.value = keys.value.filter(v => v.appName.toLowerCase().indexOf(needle) > -1 || String(v.keyId).indexOf(needle) > -1)
  })
}

onMounted(async () => {
  await store.getUsers(true)
  const response = await store.getConvCloudAppKeys(true)
  if (response) keyOptions.value = response
  if (props.keyId) {
    const existing = keys.value.find(v => v.keyId === props.keyId)
    if (existing) model.value = existing
  }
})
</script>
