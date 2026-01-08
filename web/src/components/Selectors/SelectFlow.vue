<template>
  <div
    class="ais-flow-selector-container"
    :class="width ? `w-${width}` : 'w-100-p'"
  >
    <q-select
      :square="square"
      @filter="filter"
      class="ais-flow-select"
      use-input
      :filled="!outline"
      :outlined="outline"
      :disable="disabled || loading"
      :loading="loading"
      :multiple="multiple"
      :dense="dense"
      :color="$q.dark.isActive ? 'info' : 'indigo-12'"
      label="Select AI Studio flow"
      :options="flowOptions"
      v-model="model"
      option-label="display_name"
      hide-bottom-space
      hide-hint
      :popup-content-class="`ais-flow-dropdown card-glass br-0 ${
        $q.dark.isActive ? 'dark' : 'light'
      }`"
      :use-chips="!useText"
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_account_tree" class="selector-icon" />
      </template>
      <template v-slot:selected-item="scope" v-if="multiple">
        <q-chip
          dense
          :removable="!loading"
          :disable="disabled"
          :loading="loading"
          :class="colorString ? `text-${colorString}` : 'ais-flow-chip'"
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          class="ais-flow-selected-chip"
        >
          <q-avatar size="18px" class="chip-avatar">
            <q-icon name="sym_o_account_tree" size="xs" />
          </q-avatar>
          <span class="chip-text"
            >{{ (scope.opt as AIStudioFlow)?.display_name
            }}{{
              showFlowId ? ` • ${(scope.opt as AIStudioFlow)?.id}` : ""
            }}</span
          >
        </q-chip>
      </template>
      <template v-slot:selected v-if="!multiple">
        <q-chip
          v-if="model && !Array.isArray(model) && !useText"
          :class="colorString ? `text-${colorString}` : 'ais-flow-chip'"
          :removable="!loading"
          :disable="disabled"
          :loading="loading"
          @remove="model = undefined"
          class="ais-flow-selected-chip single"
        >
          <q-avatar size="18px" class="chip-avatar">
            <q-icon name="sym_o_account_tree" size="xs" />
          </q-avatar>
          <span class="chip-text">
            {{ model?.display_name }}{{ showFlowId ? ` • ${model?.id}` : "" }}
          </span>
        </q-chip>

        <q-item
          v-if="model && !Array.isArray(model) && useText"
          class="br-10 single"
          :class="colorString ? `text-${colorString}` : 'users-chip'"
          :removable="!loading"
          :disable="disabled"
          :loading="loading"
        >
          <q-item-section>
            <q-item-label>
              {{ model?.display_name }}
            </q-item-label>
            <q-item-label v-if="showFlowId" caption>
              <small class="text-grey-6">{{ model?.id }}</small>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="sym_o_clear"
              @click="model = undefined"
              class="action-btn"
            >
              <q-tooltip>Clear selection</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          class="ais-flow-option-item"
          :class="width ? `w-${width}` : 'w-300'"
        >
          <q-item-section side>
            <q-avatar
              size="sm"
              class="ais-flow-avatar"
              :style="`background: linear-gradient(135deg, #8d46eb 0%, #3863e5 100%)`"
            >
              <q-icon name="sym_o_account_tree" color="white" size="xs" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="ais-flow-option-name">{{
              scope.opt?.display_name
            }}</q-item-label>
            <q-item-label
              v-if="scope.opt?.description"
              caption
              class="ais-flow-option-description"
              >{{ scope.opt.description }}</q-item-label
            >
            <q-item-label caption class="ais-flow-option-id"
              >Flow ID: {{ scope.opt.id }}</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <q-chip size="xs" outline color="primary" class="flow-chip">
              AI Flow
            </q-chip>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:append v-if="!loading">
        <div class="selector-actions">
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="sym_o_refresh"
            @click="store.getFlows()"
            class="action-btn"
          >
            <q-tooltip>Refresh flows</q-tooltip>
          </q-btn>
        </div>
      </template>
      <template v-slot:no-option>
        <div class="no-options-container">
          <q-item class="no-results-item">
            <q-item-section class="text-center">
              <q-icon name="sym_o_account_tree_off" size="md" color="grey-5" />
              <q-item-label class="no-results-text"
                >No AI flows found</q-item-label
              >
              <q-item-label caption
                >Try a different search term or refresh</q-item-label
              >
            </q-item-section>
          </q-item>
        </div>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { onMounted, ref, watch } from "vue";

// import { APP_PERMISSIONS } from "src/constants";
import type { AIStudioFlow } from "src/stores/store-aistudio";
import { useAIStudioStore } from "src/stores/store-aistudio";
// import { hasPermission } from "src/utils/functions";

const $q = useQuasar();
const store = useAIStudioStore();
const { flows } = storeToRefs(store);

interface Properties {
  useText?: boolean;
  square?: boolean;
  loading?: boolean;
  dense?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  flowId?: string | null | undefined;
  showFlowId?: boolean;
  label?: string;
  isEngagement?: boolean;
  colorString?: string;
  width?: string;
  displayId?: boolean;
  outline?: boolean;
}
const emits = defineEmits(["update:modelValue"]);

const properties = withDefaults(defineProps<Properties>(), {
  dense: false,
});

const model = defineModel<AIStudioFlow | AIStudioFlow[] | undefined | null>();

watch(
  () => model.value,
  (value: AIStudioFlow | AIStudioFlow[] | undefined | null) => {
    if (value) {
      emits("update:modelValue", value);
    }
  }
);

// const flows = ref<AIStudioFlow[]>([])
const flowOptions = ref<AIStudioFlow[]>([]);
const searchTerm = ref();

const filter = (
  value: string,
  update: (argument0: { (): void; (): void }) => void
) => {
  if (value === "") {
    searchTerm.value = null;

    update(() => {
      flowOptions.value = (flows.value as unknown as AIStudioFlow[]) || [];
    });

    return;
  }

  update(() => {
    searchTerm.value = value.toLowerCase().replace(/ /gim, "_");
    const needle = value.toLowerCase() || "";

    flowOptions.value =
      (flows.value as unknown as AIStudioFlow[])?.filter((v: AIStudioFlow) => {
        const displayName = v.display_name?.toLowerCase() || "";
        const description = v.description?.toLowerCase() || "";

        return (
          displayName?.indexOf(needle) > -1 ||
          description?.indexOf(needle) > -1 ||
          String(v.id).indexOf(needle) > -1
        );
      }) || [];
  });
};

const clear = () => {
  model.value = undefined;
};

onMounted(async () => {
  const response = await store.getFlows(true);

  flowOptions.value = response;

  if (properties.flowId && flows.value) {
    const existing = (flows.value as unknown as AIStudioFlow[]).find(
      (v: AIStudioFlow) => String(v?.id) === String(properties.flowId)
    );

    if (existing) {
      model.value = existing;
    }
  }
});

defineExpose({
  clear,
});
</script>

<style scoped lang="scss">
.ais-flow-selector-container {
  margin-bottom: 1.25rem;
}

.ais-flow-select {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.ais-flow-select:hover {
  background: rgba(255, 255, 255, 0.04);
}

.selector-icon {
  color: #8d46eb;
  transition: color 0.3s ease;
}

.ais-flow-dropdown {
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ais-flow-option-item {
  padding: 16px;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  // background: $ccai-blue-1;
}

.ais-flow-option-item:hover {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.1) 0%,
    rgba(56, 99, 229, 0.1) 100%
  );
}

.ais-flow-avatar {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(141, 70, 235, 0.3);
}

.ais-flow-option-name {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.ais-flow-option-description {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-bottom: 2px;
  line-height: 1.3;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ais-flow-option-id {
  font-size: 0.7rem;
  opacity: 0.6;
}

.flow-chip {
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
}

.selector-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.action-btn {
  color: #8d46eb;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: #3863e5;
  background: rgba(141, 70, 235, 0.1);
}

.no-options-container {
  padding: 16px;
}

.no-results-item {
  padding: 40px 20px;
  text-align: center;
}

.no-results-text {
  font-weight: 500;
  margin-top: 12px;
  margin-bottom: 4px;
}

.ais-flow-selected-chip {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.15) 0%,
    rgba(56, 99, 229, 0.15) 100%
  );
  border: 1px solid rgba(141, 70, 235, 0.3);
  color: #8d46eb;
  border-radius: 8px;
  padding: 4px 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ais-flow-selected-chip:hover {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.25) 0%,
    rgba(56, 99, 229, 0.25) 100%
  );
  border-color: rgba(141, 70, 235, 0.4);
}

.ais-flow-chip {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.15) 0%,
    rgba(56, 99, 229, 0.15) 100%
  );
  border: 1px solid rgba(141, 70, 235, 0.3);
  color: #8d46eb;
}

.chip-text {
  font-weight: 500;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dark mode adjustments */
.body--dark .ais-flow-select {
  background: rgba(255, 255, 255, 0.05);
}

.body--dark .ais-flow-select:hover {
  background: rgba(255, 255, 255, 0.08);
}

.body--dark .ais-flow-dropdown {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .ais-flow-option-item {
  border-color: rgba(255, 255, 255, 0.05);
}

.body--dark .ais-flow-option-item:hover {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.15) 0%,
    rgba(56, 99, 229, 0.15) 100%
  );
}

.body--dark .ais-flow-selected-chip {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.2) 0%,
    rgba(56, 99, 229, 0.2) 100%
  );
  color: #c794ff;
}

.body--dark .ais-flow-selected-chip:hover {
  background: linear-gradient(
    135deg,
    rgba(141, 70, 235, 0.3) 0%,
    rgba(56, 99, 229, 0.3) 100%
  );
}
</style>
