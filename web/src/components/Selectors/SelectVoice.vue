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
    :label="label || 'Select voice'"
    :options="options"
    v-model="model"
    option-label="name"
    hide-bottom-space
    hide-hint
    :popup-content-class="`cc-menu ${$q.dark.isActive ? 'dark' : 'light'}`"
    use-chips
    :loading="loading || propLoading"
    >
      <template v-slot:option="scope" >
        <q-item v-bind="scope.itemProps" class="user-item ff-exo">
          <q-item-section side>
            <span
            v-if="scope.opt.labels.accent === 'british'"
            >🇬🇧</span>
            <span
            v-else-if="scope.opt.labels.accent === 'american'"
            >🇺🇸</span>
            <span
            v-else-if="scope.opt.labels.accent === 'australian'"
            >🇦🇺</span>
            <span
            v-else
            >🌍</span>

          </q-item-section>

          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption
            :class="$q.dark.isActive ? 'text-orange' : 'text-indigo'"
            >
            {{ scope.opt.labels.accent }} |
            {{ scope.opt.labels.descriptive ? `${scope.opt.labels.descriptive} |` : '' }}
            {{ scope.opt.labels.agent ? `${scope.opt.labels.agent} |` : '' }}
            {{ scope.opt.labels.age ? `${scope.opt.labels.age} |` : '' }}
            {{ scope.opt.labels.gender ? `${scope.opt.labels.gender} |` : '' }}
            {{ scope.opt.labels.language ? `${scope.opt.labels.language} |` : '' }}
            {{ scope.opt.labels.use_case ? `${scope.opt.labels.use_case}` : '' }}
          </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:append v-if="!loading && !propLoading">
        <q-icon v-if="clearable" class="pointer" name="sym_o_cancel" @click="clear"/>
        <q-icon class="pointer" name="sync" @click="store.listVoices()"/>
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            <q-item-label>
              No voices found
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
import type { IVoice } from "src/interfaces/speech";
import { useSpeechStore } from 'src/stores/store-text-speech'
import { watch, onMounted, ref, useModel } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'

const $q = useQuasar()
const store = useSpeechStore();
const { voices } = storeToRefs(store)
interface Props {
  types?: number[];
  dense?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: IVoice | IVoice[] | null | undefined;
  multiple?: boolean;
  id?: string | number | null | undefined;
  label?: string;
  propLoading?: boolean;
  type?: number;
}
const emits = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<Props>(), {
  dense: false,
  modelValue: null
})
// const flagEmojis = ref({
//   british: '🇬🇧',
//   american: '🇺🇸',
//   australian: '🇦🇺',
// })
const model = useModel(props, 'modelValue')
watch(model, (val) => {
  store.voice = val as IVoice | null
  emits('update:modelValue', val)
})
const loading = ref(false)
const options = ref<IVoice[]>([])
const searchTerm = ref()

const filter = (val: string, update: (arg0: { (): void; (): void; }) => void) => {
  if (val === '') {
    searchTerm.value = null
    update(() => {
      options.value = voices.value
    })
    return
  }

  update(() => {
    searchTerm.value = val.toLowerCase().replace(/ /gmi, '_')
    const needle = val.toLowerCase()
    options.value = voices.value.filter(v => v.name.toLowerCase().indexOf(needle) > -1 || String(v.voiceId).indexOf(needle) > -1)
  })
}
const clear = () => {
  if (Array.isArray(model.value)) {
    model.value = []
  } else {
    model.value = null
  }
}

onMounted(async () => {
  await store.listVoices(true)
  const response = await store.listVoices(true)
  options.value = response
  if (props.id) {
    const existing = voices.value.find(v => String(v.voiceId) === String(props.id))
    console.log('existing user', existing)
    if (existing) model.value = existing
  }
})
</script>
