<template>
  <div id="message-stream">
    <div v-for="(m, mIdx) in messages"
    :key="m.id || mIdx"
    :class="m.role"
    >
      <div
      v-if="m.type === 'file'"
      class="fc file-share-bubble w-60-p ml-a"
      >
        <q-img
        :src="m.preview"
        >
          <div class="absolute-bottom text-subtitle1 text-center h-20 ta-c fc jc-c">
            {{ m.caption }}
          </div>
        </q-img>
      </div>
      <div
      v-else-if="m.type === 'cobrowse_accepted'"
      class="system-message"
      >
        {{ m.message }}
      </div>
      <div
      v-else-if="m.type === 'cobrowse_ended'"
      class="system-message"
      >
        {{ m.message }}
      </div>
      <div
      v-else-if="m.type === 'cobrowse_declined'"
      class="system-message"
      >
        cobrowse session has been declined
      </div>
      <div
      v-else-if="m.type === 'secure form request'"
      class="fc w100 p-10 secure-form-bubble"
      >
      <div class="fr jc-c">
        <div class="fr jc-c ta-c mr-5 system-message">
          {{  m.text }}
        </div>
        <div class="fc jc-c pt-2">
          <q-icon
          v-if="m.submitted"
          size="sm"
          class="m-a"
          color="positive"
          name="o_check_circle"
          ></q-icon>
          <q-icon
          v-else-if="m.expired"
          size="sm"
          class="m-a"
          color="warning"
          name="sym_o_warning"
          ></q-icon>
        </div>
      </div>
        <q-btn
        unelevated
        v-if="!m.submitted && !m.expired"
        :disable="m.submitted"
        class="secure-form-button w-fc ml-a mr-a"
        :class="m.submitted ? 'submitted' : ''"
        :label="m.submitted ? 'secure form' : 'open secure form'"
        icon="o_verified_user"
        @click="$emit('openSecureForm', m)"
        ></q-btn>
      </div>

      <div v-else-if="m.type === 'text' && m.role !== 'CONTROLLER'" class="fr">
        <q-chat-message
        :sent="m.role === 'CONSUMER'"
        :name="m.role === 'CONSUMER' ? 'you' : m.from"
        :text="santisedMessages(m.messages || [m.text].filter((t): t is string => t !== undefined))"
        text-html
        stamp-html
        :stamp="moment(m.timeLocal).fromNow()"
        >
          <template v-slot:stamp>
            <span class="fr" style="height: 16px"
            v-if="!m.type.includes('secure')"
            >

              <div>
                {{moment(m.timeLocal).fromNow()}}
              </div>
              <div class="fc jc-c h100 pt2 ml5">
                <q-icon
                class="m-a"
              :class="m.role"
              :id="m.type"
              v-if="m?.status === 'READ'"
              name="o_check_circle"
              ></q-icon>
              </div>

            </span>
          </template>
        </q-chat-message>

        <div class="fc jc-c ml-5">
          <q-btn
          flat
          :color="$q.dark.isActive ? 'info' : 'indigo'"
          v-if="m.role === 'ASSIGNED_AGENT'"
          @click="textToSpeech(m.messages || [])"
          icon="o_mic"
          ></q-btn>
        </div>
      </div>
      <div
      class="quick-reply-container fr fw mb20"
      v-if="m.quickReplies?.length > 0 && lastIndex(messages, mIdx)"
      >
        <q-chip
        clickable
        @click="action(qr.click.actions)"
        v-for="(qr, qrIdx) in m.quickReplies"
        :key="`qrIdx-${qrIdx}`"
        >
          {{qr.title}}
        </q-chip>

      </div>
    </div>
    <q-space></q-space>
      <q-chat-message
      v-if="chatState === 'COMPOSING'"
      >
        <div style="width: 80px;" class="fr jc-c">
          <q-spinner-dots
          size="md"
          />
        </div>
      </q-chat-message>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import moment from 'moment'
import { lastIndex } from 'src/utils/functions';
const emits = defineEmits(['sendMessage', 'openSlideOut', 'openSecureForm'])
import type { IAction, ClientMessage } from 'src/interfaces'
import { sanitiseMessage } from 'src/utils/functions'
import { useSpeechStore } from 'src/stores/store-text-speech'
// import { useMessagingStore } from 'src/stores/store-messaging'
// import RichContent from './rich-content.vue'
// import audioFile from './audiofile.json'

interface IChatMessage extends ClientMessage {
  messages?: string[];
  id?: string;
}

defineProps<{
  welcomeMessage: string | null
  quickReplies: string[] | null,
  stage: string | null,
  chatState: string | null | undefined,
  messages: IChatMessage[]
}>()

// const scMessage = (a: ClientMessage) => {
//   const text = a.submitted ? 'secure form has been submitted' : a.expired ? 'secure form has expired' : `${a.from} has sent you a Secure Form:`
//   return text
// }

const $q = useQuasar()

const santisedMessages = (msgs: string[]) => {
  return msgs.map(m => sanitiseMessage(m))
}


const action = (actions: IAction[]) => {
  actions.forEach(action => {
    if (action.type === 'publishText') {
      emits('sendMessage', action.text)
    }
    if (action.type === 'link') {
      if (action.target === 'slideout') {
        emits('openSlideOut', action)
        return
      }
      window.open(action.uri, '_blank')
    }
  })
}
const getStreamElement = () => {
  return document.getElementById('message-stream')
}

function playAudio(data: number[] = []) {
  // play audioFile.buffer.data as mp3
  const audio = new Audio()
  // Convert number[] to Uint8Array, then to base64 string
  const uint8Array = new Uint8Array(data)
  const base64String = btoa(String.fromCharCode(...uint8Array))
  audio.src = 'data:audio/mp3;base64,' + base64String
  audio.play().catch((error) => {
    console.error('Error playing audio:', error)
    $q.notify({
      type: 'negative',
      message: 'Error playing audio',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  })
}

const textToSpeech = async (messages: string[]) => {
  const text = messages.join('.\n')
  console.info('textToSpeech', text)
  const store = useSpeechStore()
  try {
    const voiceId = store.voice?.voiceId
    if (!voiceId) {
      $q.notify({
        type: 'negative',
        message: 'No voice selected for text to speech'
      })
      return
    }
    const audio = await store.getAudio(text, voiceId)
    if (!audio || !audio.length) {
      $q.notify({
        type: 'negative',
        message: 'No audio returned from text to speech service'
      })
      return
    }
    playAudio(audio)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error converting text to speech',
      caption: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

defineExpose({
  getStreamElement
})
</script>

<style scoped lang="scss">
.secure-form-bubble {
  border: 1px dashed $grey-5;
  border-radius: 10px;
  margin-bottom: 10px;
}
.file-share-bubble {
  border: 1px solid $grey-5;
  margin-bottom: 10px;
}
</style>
