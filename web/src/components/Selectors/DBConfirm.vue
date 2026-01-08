<template>
  <q-menu :context-menu="contextMenu"
  :target="target"
  >
    <q-card class="ff-inter cc-menu">
      <CardHeader :title="title || 'confirm'"></CardHeader>
      <q-card-section>
        <div class="fr jc-c">
          {{ message || 'Are you sure?' }}
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn size="sm" color="grey" label="Cancel" flat v-close-popup />
        <q-btn size="sm" label="Confirm" color="negative" v-close-popup @click="$emit('confirm')" />
      </q-card-actions>
    </q-card>
  </q-menu>
</template>

<script setup lang="ts">
defineEmits(['confirm'])
interface props {
  target?: string,
  contextMenu?: boolean,
  title: string,
  message: string
}
defineProps<props>()
</script>

<style scoped lang="scss">

</style>
