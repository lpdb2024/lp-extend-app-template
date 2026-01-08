<template>
  <div class="fc">

    <div class="fr fw jc-c ff-inter-light">
      <q-chip
      v-for="v in views"
      :key="v.path"
      size="sm"
      :color="view !== v.path ? colors.inactiveChipColor : colors.tableChipColor"
      outline
      square
      clickable
      @click="view = v.path"
      >
        {{ v.label }}
      </q-chip>
    </div>

    <div class="inner" v-if="view === views[0]?.path">
      <SimpleItem
      v-for="(key, index) in Object.keys(conversation?.info || {})" :key="`i-${index}`"
      :property="key"
      dense
      :value="`${(conversation as ConversationHistoryRecords)?.info[key as keyof ConversationHistoryRecords['info']]}`"
      propWidth="w-200"
      />
    </div>

    <div class="inner" v-if="view === views[1]?.path">
      <SimpleItem
      v-for="(key, index) in Object.keys(conversation?.campaign || {})" :key="`c-${index}`"
      :property="key"
      dense
      :value="`${(conversation as ConversationHistoryRecords)?.campaign[key as keyof ConversationHistoryRecords['campaign']]}`"
      propWidth="w-200"
      />
    </div>

    <div class="inner" v-if="view === views[2]?.path">
      <TranscriptMessages
      v-if="(conversation as ConversationHistoryRecords)?.messageRecords?.length"
      :messages="conversation?.messageRecords || []"
      :conversation-id="props.conversationId"
      :class="`w-fc h-100 ${view === views[2]?.path ? 'mb-20' : ''}`"
      :key="`transcript-${props.conversationId}`"
      :dense="true"
      />

    </div>

    <div class="inner" v-if="view === views[3]?.path">
      <q-item
      v-for="agent of conversation?.agentParticipants || []"
      :key="`agent-${agent.agentId}`"
      class="ct-widget mb-10"
      >
      <q-item-section side class="w-140">
        {{ agent.permission }}
      </q-item-section>
      <q-item-section clas="ff-inter-light">
        <q-item-label class="fr" caption>
          <span class="mr-5 w-80">
            fullname:
          </span>
          <span caption
          :class="colors.infoText"
          class="text-bold"
          >
            {{ agent.agentFullName }}
          </span>
        </q-item-label>

        <q-item-label class="fr" caption>
          <span class="mr-5 w-80">
            nickname:
          </span>
          <span caption
          :class="colors.infoText"
          class="text-bold"
          >
            {{ agent.agentNickname }}
          </span>
        </q-item-label>

        <q-item-label class="fr" caption>
          <span class="mr-5 w-80">
            group:
          </span>
          <span caption
          :class="colors.infoText"
          class="text-bold"
          >
            {{ agent.agentGroupName }}
          </span>
        </q-item-label>

        <q-item-label class="fr" caption>
          <span class="mr-5 w-80">
            user type:
          </span>
          <span caption
          :class="colors.infoText"
          class="text-bold"
          >
            {{ agent.userTypeName }}
          </span>
        </q-item-label>
      </q-item-section>
      </q-item>
    </div>

    <div class="inner" v-if="view === views[4]?.path">
      <q-item
      v-for="(event, index) in formattedSDEs || []" :key="`s-${index}`"
      :property="event"
      class="ct-widget mb-10"
      >
      <q-item-section>
        <q-item-label class="text-bold max-width-120 ff-space mb-10" title overline
        :class="colors.infoText"
        >
          {{index}}
        </q-item-label>
        <SimpleItem
        v-for="(key, index) in Object.keys(event || {})" :key="`sde-${index}`"
        :property="key"
        dense
        :value="event[key as keyof typeof event] || ''"
        propWidth="w-200"
        />
      </q-item-section>
      </q-item>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { ConversationHistoryRecords,  SDEEvent, SDEType } from 'src/interfaces';
import { useConvCloudStore } from 'src/stores/store-conv-cloud';
import { useAppStore } from 'src/stores/store-app';
import { storeToRefs } from 'pinia';
const appStore = useAppStore();
const { colors } = storeToRefs(appStore);
import { computed, onMounted, ref } from 'vue';
import SimpleItem from './common-ui/SimpleItem.vue';
import TranscriptMessages from './TranscriptMessages.vue';
const convCloudStore = useConvCloudStore();
const props = defineProps<{
  conversationId: string | undefined | null;
}>();

const conversation = ref<ConversationHistoryRecords | null>(null);
enum ConversationView {
  Info = 'info',
  Campaign = 'campaign',
  MessageRecords = 'messageRecords',
  AgentParticipants = 'agentParticipants',
  Sdes = 'sdes'
}
const views = ref([
  { path: ConversationView.Info, label: 'Info' },
  { path: ConversationView.Campaign, label: 'Campaign' },
  { path: ConversationView.MessageRecords, label: 'Messages' },
  { path: ConversationView.AgentParticipants, label: 'Agent Participants' },
  { path: ConversationView.Sdes, label: 'SDES' }
])
const view = ref(views.value[0]?.path ?? '');
const refresh = async () => {
  if (!props.conversationId) {
    console.warn('No conversation ID provided for refresh.');
    return;
  }
  try {
    const fetchedConversation = await convCloudStore.getConversationById(props.conversationId);
    if (fetchedConversation) {
      conversation.value = fetchedConversation;
      console.log('Conversation refreshed successfully:', conversation.value);
    } else {
      console.warn('No conversation found during refresh.');
    }
  } catch (error) {
    console.error('Error refreshing conversation:', error);
  }
}

onMounted(async () => {
  try {
    if (!props.conversationId) {
      console.warn('No conversation ID provided.');
      return;
    }
    const conversation = await convCloudStore.getConversationById(props.conversationId);
    if (conversation) {
      console.log('Conversation fetched successfully:', conversation);
    } else {
      console.warn('No conversation found.');
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
  }
});

const SDES = ref<Record<string, SDEType | Record<string, unknown>>>({
});

const sdeKeys = {
  PERSONAL_INFO: 'personalInfo',
  CUSTOMER_INFO: 'customerInfo'
}

function getSDE(events: SDEEvent[] | undefined | null): Record<string, SDEType | Record<string, unknown>> | null {
  console.info('getSDE', JSON.stringify(events, null, 2));
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.warn('No SDES events found or invalid format.');
    return null;
  }
  for (const event of events) {
    const pathKey = sdeKeys[event.sdeType as keyof typeof sdeKeys];
    if (!pathKey) continue;
    const sdeObj = event[pathKey as keyof SDEEvent];
    if (sdeObj && typeof sdeObj === 'object' && pathKey in sdeObj) {
      SDES.value[pathKey] = (sdeObj as Record<string, unknown>)[pathKey] as SDEType | Record<string, unknown> || {} as Record<string, unknown>;
    } else {
      SDES.value[pathKey] = {} as Record<string, unknown>;
    }
  }
  console.info('SDES', SDES);
  return SDES.value;
}
const formattedSDEs = computed(() => {
  return getSDE(conversation.value?.sdes?.events);
});
defineExpose({
  refresh,
});
</script>

<style scoped>

</style>
