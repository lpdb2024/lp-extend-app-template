<template>
  <WebWindow
  :slide="slide"
  :windowConfig="windowConfig"
  v-if="LPMessagingStore().accountId && channel === 'web' && loaded"
  :quickReplies="quickReplies"
  v-bind="clickToLoad !== undefined ? { clickToLoad } : {}"
  :default-size="defaultSize"
  />
</template>

<script setup lang="ts">
import { LPMessagingStore } from 'src/stores/WindowAPIStore'
import WebWindow from './WebWindow.vue'
import { onMounted, ref, watch } from 'vue'
import type {
  MessagingWindowConfig
} from 'src/interfaces'

interface ISlide {
  welcomeText?: string;
  channel: string;
  skill: {
    id: number | string;
    name: string;
  } | null;
  starters: string[];
}

interface Props {
  slide: ISlide;
  channel: string;
  accountId: string;
  windowConfig: MessagingWindowConfig;
  skillId: string;
  quickReplies: string[];
  clickToLoad?: boolean;
  isDev?: boolean;
  defaultSize: 'full-container' | 'maximised' | 'normal' | 'expanded' | undefined;
}

const props = defineProps<Props>()
// watch skillId
watch(() => props.skillId, (newVal) => {
  if (newVal) {
    LPMessagingStore().skillId = newVal
  }
})
const loaded = ref(false)

onMounted(async () => {
  if (!props.accountId || !props.skillId) {
    throw new Error('Missing accountId and/or skillId')
  }
  loaded.value = !!await LPMessagingStore().initState(props.accountId, props.skillId)
})

</script>

<style scoped lang="scss">

</style>
