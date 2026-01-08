<template>
  <q-item :dense="dense">
    <q-item-section side
    :class="propWidth ? `w-${propWidth}` : 'w-100'"
    >
      <q-item-label class="ff-inter-light">
        {{ property }}
      </q-item-label>
    </q-item-section>
    <q-item-section>
      <q-item-label class="ff-inter-light fg fc jc-c ta-l" caption
      :class="valueColor ? valueColor : ''"
      >
        {{ value }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
interface Props {
  propWidth?: string;
  property: string;
  dense?: boolean;
  value: string | number | boolean | null | undefined;
  valueColor?: string;
}
defineProps<Props>();
</script>

<style scoped>

</style>
