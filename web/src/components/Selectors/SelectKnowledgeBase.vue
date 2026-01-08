<template>
  <div class="w100">
    <q-select
      @filter="filter"
      class="w100"
      use-input
      filled
      :disable="disabled || loading"
      :multiple="multiple"
      :dense="dense"
      :color="$q.dark.isActive ? 'info' : 'indigo'"
      :label="label || 'Select Knowledge Base'"
      :options="options"
      v-model="model"
      option-label="name"
      hide-bottom-space
      hide-hint
      :popup-content-class="`cc-menu ${$q.dark.isActive ? 'dark' : 'light'}`"
      use-chips
      :loading="loading"
    >
      <template #selected-item="scope" v-if="multiple">
        <q-chip
          removable
          dense
          outlined
          :class="$q.dark.isActive ? 'text-info' : 'text-indigo'"
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          class="q-ma-none"
        >
          {{ (scope.opt as KnowledgeBase)?.name }}
          <template v-if="showId"> | {{ (scope.opt as KnowledgeBase)?.id }}</template>
        </q-chip>
      </template>

      <template #selected v-if="!multiple">
        <q-chip
          v-if="model"
          outlined
          :class="$q.dark.isActive ? 'text-info' : 'text-indigo'"
          removable
          @remove="clear"
        >
          {{ (model as KnowledgeBase)?.name }}
          <template v-if="showId"> | {{ (model as KnowledgeBase)?.id }}</template>
        </q-chip>
      </template>

      <template #option="scope">
        <q-item v-bind="scope.itemProps" class="kb-item">
          <q-item-section avatar>
            <q-avatar
              :color="scope.opt.status === 'ACTIVE' ? 'green-2' : 'grey-4'"
              :text-color="scope.opt.status === 'ACTIVE' ? 'green' : 'grey'"
              size="32px"
            >
              <q-icon name="sym_o_library_books" size="18px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label
              caption
              :class="$q.dark.isActive ? 'text-orange' : 'text-indigo'"
            >
              {{ scope.opt.language || scope.opt.langCode }}
              <template v-if="scope.opt.type"> | {{ scope.opt.type }}</template>
              <template v-if="scope.opt.publicKB"> | Public</template>
              <template v-if="showId"> | ID: {{ scope.opt.id }}</template>
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="scope.opt.status">
            <q-badge
              :color="scope.opt.status === 'ACTIVE' ? 'green' : 'grey'"
              :label="scope.opt.status"
            />
          </q-item-section>
        </q-item>
      </template>

      <template #append v-if="!loading">
        <q-icon
          v-if="clearable && model"
          class="pointer q-mr-xs"
          name="sym_o_cancel"
          @click.stop="clear"
        />
        <q-icon class="pointer" name="sync" @click.stop="refresh" />
      </template>

      <template #no-option>
        <q-item>
          <q-item-section class="text-grey">
            <q-item-label>No knowledge bases found</q-item-label>
            <q-item-label caption>
              Make sure you have knowledge bases configured in Conversation Builder
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useConvBuilderStore } from 'src/stores/store-conv-builder';
import type { KnowledgeBase } from 'src/interfaces';
import { watch, onMounted, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const store = useConvBuilderStore();
const { knowledgeBases } = storeToRefs(store);

interface Props {
  dense?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: KnowledgeBase | KnowledgeBase[] | null | undefined;
  multiple?: boolean;
  kbId?: string | null | undefined;
  showId?: boolean;
  label?: string;
  activeOnly?: boolean;
}

const emits = defineEmits<{
  'update:modelValue': [value: KnowledgeBase | KnowledgeBase[] | undefined];
}>();

const props = withDefaults(defineProps<Props>(), {
  dense: false,
  clearable: true,
  modelValue: null,
  activeOnly: false,
  showId: false,
});

const model = computed({
  get: () => props.modelValue as KnowledgeBase | KnowledgeBase[] | undefined,
  set: (val: KnowledgeBase | KnowledgeBase[] | undefined) => {
    emits('update:modelValue', val);
  },
});

const loading = ref(false);
const options = ref<KnowledgeBase[]>([]);
const searchTerm = ref<string | null>(null);

// Filter knowledge bases based on activeOnly prop
const filteredKnowledgeBases = computed(() => {
  if (props.activeOnly) {
    return knowledgeBases.value.filter(kb => kb.status === 'ACTIVE');
  }
  return knowledgeBases.value;
});

const filter = (val: string, update: (fn: () => void) => void) => {
  if (val === '') {
    searchTerm.value = null;
    update(() => {
      options.value = filteredKnowledgeBases.value;
    });
    return;
  }

  update(() => {
    searchTerm.value = val.toLowerCase();
    const needle = val.toLowerCase();
    options.value = filteredKnowledgeBases.value.filter(
      (kb) =>
        kb.name.toLowerCase().includes(needle) ||
        kb.id.toLowerCase().includes(needle) ||
        (kb.language && kb.language.toLowerCase().includes(needle))
    );
  });
};

const clear = () => {
  if (props.multiple) {
    model.value = [];
  } else {
    model.value = undefined;
  }
};

const refresh = async () => {
  loading.value = true;
  try {
    await store.getKnowledgeBases();
    options.value = filteredKnowledgeBases.value;
  } finally {
    loading.value = false;
  }
};

// Watch for changes in the knowledge bases list
watch(filteredKnowledgeBases, (newKbs) => {
  if (!searchTerm.value) {
    options.value = newKbs;
  }
});

onMounted(async () => {
  loading.value = true;
  try {
    // Use cached data if available, otherwise fetch
    if (knowledgeBases.value.length === 0) {
      await store.getKnowledgeBases();
    }
    options.value = filteredKnowledgeBases.value;

    // If a kbId prop was provided, pre-select the knowledge base
    if (props.kbId) {
      const existing = knowledgeBases.value.find(
        (kb) => kb.id === props.kbId
      );
      if (existing) {
        model.value = existing;
      }
    }
  } finally {
    loading.value = false;
  }
});

defineExpose({
  clear,
  refresh,
});
</script>

<style lang="scss" scoped>
.kb-item {
  min-height: 56px;
}
</style>
