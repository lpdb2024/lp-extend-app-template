<template>
  <div class="ext-field-container">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.ext-field-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #eeeff1;
  padding: 12px 16px;
}
.body--dark .ext-field-container {
  // styles for dark mode if needed
}
</style>
