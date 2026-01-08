<template>
  <q-btn-group class="ext-toggle-btn-group w-fc">
    <div v-if="leftLabel && rightLabel">
      <q-btn
        class="left"
        :class="[
          'ext-toggle-btn',
          !active ? 'ext-toggle-btn--active' : '',
          btnWidth ? `w-${btnWidth}` : '',
        ]"
        @click="active = false"
        no-caps
      >
        <span>{{ leftLabel || "OFF" }}</span>
        <ToolTip>
          Disable to skip event-based checks and rely solely on success criteria
          defined elsewhere
        </ToolTip>
      </q-btn>
      <q-btn
        class="w-70 right"
        :class="[
          'ext-toggle-btn',
          active ? 'ext-toggle-btn--active' : '',
          btnWidth ? `w-${btnWidth}` : '',
        ]"
        @click="active = true"
        no-caps
      >
        <span>{{ rightLabel || "ON" }}</span>
      </q-btn>
    </div>
    <div v-else-if="options && options.length > 0" class="fr">
      <q-btn
        v-for="(option, index) in options"
        :key="index"
        :class="[
          'ext-toggle-btn',
          model === option.value ? 'ext-toggle-btn--active' : '',
          btnWidth ? `w-${btnWidth}` : '',
        ]"
        @click="model = option.value"
        no-caps
      >
        <span>{{ option.label }}</span>
      </q-btn>
    </div>
  </q-btn-group>
</template>

<script setup lang="ts">
defineProps<{
  leftLabel?: string;
  rightLabel?: string;
  color?: string;
  btnWidth?: string | number;
  options?: Array<{ label: string; value: string | number | boolean }>;
}>();

const active = defineModel<boolean>('active');
const model = defineModel<string | number | boolean>();
</script>

<style lang="scss">
/* AI Toggle Button Group */
.ext-toggle-btn-group {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: rgba(248, 250, 252, 0.5);
}

.ext-toggle-btn {
  background: transparent;
  color: #64748b;
  border: none;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.ext-toggle-btn-group {
  background: #d6dae6;
  color: #666;
  .ext-toggle-btn--active {
    color: #fcfcfd;
    background: #6c7189;
  }

  .ext-toggle-btn--active {
    background: linear-gradient(135deg, #22c55e, #16a34a) !important;
    color: white;
  }
}

.body--dark {
  .ext-toggle-btn-group {
    background: #292b5f;
    color: #8d96bb;

    .left.ext-toggle-btn--active {
      color: #1d2553;
      background: #a7acbe !important;
    }
    .right.ext-toggle-btn--active {
      background: linear-gradient(135deg, #22c55e, #16a34a) !important;
      color: white;
    }
  }
}
</style>
