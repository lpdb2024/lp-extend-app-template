<template>
  <q-tooltip class="cc-menu lp-tooltip"
  :anchor="anchor || 'top left'"
  :self="self || 'bottom middle'"
  :offset="offset || [0, 0]"
  :class="maxWidth ? `w-${maxWidth}` : ''"
  >
    <template v-slot:default>
      <q-item align="left"
      class="w-100-p fr"
      >
        <q-item-section side v-if="icon && !$slots.side">
          <q-icon :name="icon" :size="iconSize || 'sm'"
          :color="iconColor || $q.dark.isActive ? 'info' : 'deep-orange'"
          />
        </q-item-section>
        <q-item-section v-if="$slots.side" side>
          <slot name="side" />
        </q-item-section>
        <q-item-section class="fg">
          <q-item-label v-if="title" class="ff-space-bold title">
            <span v-if="titleIcon">
              <q-icon :name="titleIcon" :size="iconSize || 'sm'"
              :color="iconColor || $q.dark.isActive ? 'info' : 'deep-orange'" />
            </span>
            <span>
              {{ title }}
            </span>
          </q-item-label>
          <q-item-section v-if="$slots.description" class="fg w-100-p">
            <slot name="description" class="fg w-100-p"
            style="width: 100%"
            />
          </q-item-section>
          <q-item-label caption v-if="!$slots.description && description" class="ff-inter-light w-100-p">
            {{ description }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-tooltip>
</template>

<script setup lang="ts">
import type { QTooltipProps} from 'quasar';
import { useQuasar } from 'quasar'
const $q = useQuasar()
interface Props {
  titleIcon?: string
  iconSize?: string
  maxWidth?: string
  iconColor?: string
  icon?: string
  title?: string
  description?: string
  anchor?: QTooltipProps['anchor']
  self?: QTooltipProps['self']
  offset?: QTooltipProps['offset']
}
defineProps<Props>()
</script>

<style lang="scss">
.lp-tooltip {
  .title {
    font-size: 0.9rem;
  }
}
</style>
