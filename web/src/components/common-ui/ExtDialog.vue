<template>
  <q-dialog
    ref="dialogRef"
    :persistent="persistent ?? false"
    :maximized="isMaximized"
    :full-width="fullWidth ?? false"
    :full-height="fullHeight ?? false"
    :position="position ?? 'standard'"
    :transition-show="transitionShow ?? 'scale'"
    :transition-hide="transitionHide ?? 'scale'"
    :no-backdrop-dismiss="noBackdropDismiss ?? false"
    :no-esc-dismiss="noEscDismiss ?? false"
    @hide="onDialogHide"
  >
    <q-card
      class="ext-dialog-card"
      :class="cardClass"
      :style="cardStyle"
    >
      <CardHeader
        :title="title ?? 'Dialog'"
        :icon="icon ?? 'sym_o_info'"
        :hide-close="hideClose ?? false"
        :hide-icon="hideIcon ?? false"
        :hide-title="hideTitle ?? false"
        :dense="denseHeader ?? false"
        :dark="dark ?? false"
        :save="showSave ?? false"
        :use-maximize="useMaximize ?? false"
        :maximized="isMaximized"
        @close="onCancel"
        @save="onSave"
        @maximized-toggle="onMaximizedToggle"
      />

      <!-- Message content (for simple dialogs) -->
      <q-card-section v-if="message" class="ext-dialog-content" :class="contentClass">
        <div v-html="message" />
      </q-card-section>

      <!-- Slot content (for template usage) -->
      <q-card-section v-else-if="$slots.default" class="ext-dialog-content" :class="contentClass">
        <slot />
      </q-card-section>

      <!-- Dialog Actions -->
      <q-card-actions v-if="hasActionsSlot || shouldShowDefaultActions" :align="actionsAlign ?? 'right'" class="ext-dialog-actions">
        <!-- Custom slot content if provided -->
        <template v-if="hasActionsSlot">
          <slot name="actions" />
        </template>
        <!-- Default buttons -->
        <template v-else>
          <q-btn
            v-if="showCancelBtn"
            flat
            :label="cancelLabel ?? 'Cancel'"
            :color="cancelColor ?? 'grey'"
            @click="onCancel"
          />
          <q-btn
            v-if="showConfirmBtn"
            :flat="confirmFlat ?? false"
            :unelevated="!(confirmFlat ?? false)"
            :label="confirmLabel ?? 'Confirm'"
            :color="confirmColor ?? 'primary'"
            :loading="confirmLoading ?? false"
            :disable="confirmDisabled ?? false"
            @click="onConfirm"
          />
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, useSlots, computed } from "vue";
import { useDialogPluginComponent } from "quasar";
import CardHeader from "./CardHeader.vue";

const slots = useSlots();

// Check if the actions slot has actual content
const hasActionsSlot = computed(() => {
  return !!slots.actions && slots.actions().length > 0;
});

interface Props {
  // Content
  title?: string;
  message?: string;
  icon?: string;

  // Dialog behavior
  persistent?: boolean;
  maximized?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  position?: "standard" | "top" | "right" | "bottom" | "left";
  transitionShow?: string;
  transitionHide?: string;
  noBackdropDismiss?: boolean;
  noEscDismiss?: boolean;

  // CardHeader props
  hideClose?: boolean;
  hideIcon?: boolean;
  hideTitle?: boolean;
  denseHeader?: boolean;
  dark?: boolean;
  showSave?: boolean;
  useMaximize?: boolean;

  // Card styling
  cardClass?: string | string[] | Record<string, boolean>;
  cardStyle?: string | Record<string, string>;
  contentClass?: string | string[] | Record<string, boolean>;

  // Default actions
  showDefaultActions?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
  cancelLabel?: string;
  cancelColor?: string;
  confirmLabel?: string;
  confirmColor?: string;
  confirmFlat?: boolean;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  actionsAlign?: "left" | "center" | "right" | "between" | "around" | "evenly";
}

const props = defineProps<Props>();

// Computed to check if we should show actions
const shouldShowDefaultActions = computed(() => {
  return props.showDefaultActions === true;
});

// Show cancel/confirm buttons: default to true (show)
// Vue 3 coerces unset boolean props to false, so we can't distinguish
// "not passed" from "passed as false". We default to showing both buttons.
// To hide a button, users should use a custom actions slot instead.
const showCancelBtn = computed(() => true);
const showConfirmBtn = computed(() => true);

// REQUIRED - must define emits with useDialogPluginComponent.emits
defineEmits([
  ...useDialogPluginComponent.emits,
]);

// Quasar Dialog Plugin integration
// This provides dialogRef, onDialogHide, onDialogOK, onDialogCancel
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const isMaximized = ref(false);

const onSave = () => {
  onDialogOK({ action: "save" });
};

const onCancel = () => {
  onDialogCancel();
};

const onConfirm = () => {
  onDialogOK({ action: "confirm" });
};

const onMaximizedToggle = (value: boolean) => {
  isMaximized.value = value;
};
</script>

<style scoped lang="scss">
.ext-dialog-card {
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  .body--dark & {
    background: var(--ext-surface, #1e1e2e);
  }
}

.ext-dialog-content {
  flex: 1;
  overflow: auto;
}

.ext-dialog-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 12px 16px;

  .body--dark & {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
