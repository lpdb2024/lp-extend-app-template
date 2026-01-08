<template>
  <div id="web-msg-container"
  :style="{...windowConfig.cssProperties}"
  :class="
    `${isSubscribed ? 'isSubscribed' : 'loading'}
    ${stage === 'OPEN' ? 'conversation-open' : 'conversation-closed'}
    ${showWindow ? 'animated fadeInUp' : ''}
    ${size}
    ${slideoutURI ? 'slideout-open' : ''}
    `"
  >
    <div
    id="messaging-window"
    v-if="windowConfig"
    ref="messagingWindow"
    :class="
    `${isSubscribed ? 'isSubscribed' : 'loading'}
    ${stage === 'OPEN' ? 'conversation-open' : 'conversation-closed'}
    ${showWindow ? 'animated fadeInUp' : ''}
    ${slideoutURI ? 'slideout-open' : ''}
    `"
    class="fc"
    v-show="showWindow"
    @dragexit="isOverImageDropZone = false"
    >
      <div v-if="!closeConfirm" class="fc fg h-inherit">
        <div class="header fr pl20 pr20">
          <div class="fc jc-c mr20">
            <img
            v-if="windowConfig.top.avatar"
            @click="openKB"
            style="height: 25px; min-width: 30px;"
            :src="windowConfig.top.avatar"
            />
            <q-icon
            v-else
            name="sym_o_forum"
            ></q-icon>
          </div>
          <div class="fc jc-c ff-space">
            {{ windowConfig.top.bannerText }}
          </div>
          <q-space></q-space>
          <q-btn
          dense
          flat
          icon="more_vert"
          >
            <q-menu :style="windowConfig.cssProperties"
            :offset="[20, 0]"
            >
              <q-card class="messaging-options p10 ff-exo">
                <q-list>
                  <q-item clickable v-ripple v-close-popup
                  @click="size = 'normal'"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_minimize"></q-icon>
                    </q-item-section>
                    <q-item-section>window size: normal</q-item-section>
                  </q-item>

                  <q-item clickable v-ripple v-close-popup
                  @click="size = 'expanded'"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_expand_content"></q-icon>
                    </q-item-section>
                    <q-item-section>window: expanded</q-item-section>
                  </q-item>

                  <q-item clickable v-ripple v-close-popup
                  @click="size = 'full-container'"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_open_in_full"></q-icon>
                    </q-item-section>
                    <q-item-section>window size: full page</q-item-section>
                  </q-item>

                  <q-item clickable v-ripple v-close-popup
                  @click="size = 'maximised'"
                  >
                    <q-item-section side>
                      <q-icon name="sym_o_fullscreen"></q-icon>
                    </q-item-section>
                    <q-item-section>window size: full screen</q-item-section>
                  </q-item>

                  <q-item clickable v-ripple @click="closeConv" v-close-popup>
                    <q-item-section side>
                      <q-icon name="sym_o_cancel"></q-icon>
                    </q-item-section>
                    <q-item-section>
                      close conversation
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="store.clearHistory()" v-close-popup>
                    <q-item-section side>
                      <q-icon name="sym_o_close"></q-icon>
                    </q-item-section>
                    <q-item-section>
                      clear history
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-menu>
          </q-btn>

        </div>

        <div class="body fc sv h-100-p ff-inter-light" id="messageViewRef">
          <div
          v-if="fileDropError"
          class="msg-notify"
          >
            <q-item>
              <q-item-section side>
                <q-icon name="sym_o_warning"></q-icon>
              </q-item-section>
              <q-item-section>
                {{ fileDropError }}
              </q-item-section>
            </q-item>
          </div>
          <div v-if="!isOverImageDropZone">
            <div class="banner fr jc-c"
            v-show="!isOverImageDropZone"
            v-if="windowConfig.banner.imageUrl"
            >
              <img class="m-a" fit="contain" :src="windowConfig.banner.imageUrl ? windowConfig.banner.imageUrl : ''" />
            </div>
            <div
            class="p-20 fc fg"
            >
              <!-- <q-chat-message
              :text="[windowConfig.welcomeText]"
              text-html
              ></q-chat-message>

              <q-chip
              v-for="item in quickReplies"
              :key="item"
              clickable
              @click="$emit('sendMessage', item)"
              >
                {{ item }}
              </q-chip> -->
              <div v-if="!stage || stage !== 'OPEN'">
                <q-chat-message
                :text="[String(slide.welcomeText || windowConfig.welcomeText)]"
                text-html
                ></q-chat-message>
                <div v-if="groupMessages?.length === 0">
                  <q-chip
                  v-for="item in quickReplies"
                  :key="item"
                  clickable
                  class="quick-reply"
                  @click="sendMessage(item)"
                  >
                    {{ item }}
                  </q-chip>
                </div>
              </div>
              <ChatMessages
              v-else
              ref="chatMessagesRef"
              :welcomeMessage="slide.welcomeText || windowConfig.welcomeText"
              :quickReplies="quickReplies"
              :messages="groupMessages"
              :chatState="agentChatState"
              :stage="stage"
              @sendMessage="sendMessage"
              @openSecureForm="openSecureForm"
              @openSlideOut="openSlideOut"
              />

              <!-- @deep-link-action="deepLinkAction" -->
            </div>
          </div>
          <div v-else
          class="fc m-a h-100-p w-100-p fg drop-file jc-c"
          >
            <div class="m-a">
              <div class="fr jc-c">
                <q-icon
                size="md"
                name="sym_o_upload"> </q-icon>
              </div>
              <div>drop file to upload</div>
            </div>
          </div>
        </div>
        <q-space></q-space>
        <div class="footer fr">
          <div
          class="fc jc-c ta-c ml-a mr-a"
          v-if="isOverImageDropZone"
          :style="{
            color: windowConfig.bottom.textColor.color
          }"
          >
            drop file to upload
          </div>
          <q-input
          v-else
          borderless
          v-model="msgInput"
          @keyup.enter="sendMessage(msgInput)"
          placeholder="Type a message"
          class="fg"
          ref="messageInput"
          id="messageInput"
          >

            <template v-slot:prepend>
              <AudioListener />
              <q-icon name="sym_o_add_circle"></q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="sym_o_send"
              @click="sendMessage(msgInput)"
              ></q-icon>
            </template>
          </q-input>
        </div>
      </div>
      <div v-else-if="isSubscribed && closeConfirm && stage === 'OPEN'"
      class="fc jc-c ff-exo h-100-p br-20 m-a"
      >
        <div class="fr jc-c ta-c mb10">
          are you sure you want to close the conversation?
        </div>
        <div class="fr jc-c ta-c">
          <q-btn
          flat
          color="grey-5"
          label="no, cancel"
          @click="closeConfirm = false"
          />
          <q-btn
          flat
          label="yes, close"
          color="red"
          @click="closeConversation"
          />
        </div>
      </div>
    </div>
    <ConsumerWidget
    :key="slideoutURI"
    :slideoutURI="slideoutURI"
    :slideoutOpen="slideoutOpen"
    :windowConfig="windowConfig"
    :invitationId="invitationId"
    :size="size"
    :contentType="slideOutContentType"
    @closeSlideOut="closeSlideOut"
    />
    <!-- <q-btn
    color="grey-5"
    label="open"
    @click="openSlideOut({
      target: 'https://en.wikipedia.org/wiki/LivePerson',
      type: 'string',
      uri: 'https://en.wikipedia.org/wiki/LivePerson',
    })"
    /> -->
    <!-- <iframe width="926" height="521" src="https://www.youtube.com/embed/e7_CDuLMxkM" title="Mick Thomson (Slipknot) Guitar Rig Rundown 2025" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> -->

  </div>
  <div id="lp-btn-container"
  :style="windowConfig.cssProperties"
  v-show="!showWindow && (!stage || stage !== 'OPEN')"
  >
    <div id="back-layer"
    :class="windowConfig.engagement.useBoxShadow ? 'use-back-layer' : ''"
    :style="{
      background: String(
        windowConfig.engagement?.useBackLayer ?
        windowConfig.engagement?.backLayer?.custom :
        windowConfig.engagement?.backLayer?.color),
      color: String(windowConfig.engagement?.textColor?.color),
      borderRadius: '28px',
      padding: `${windowConfig.engagement?.borderWidth}px`
    }"
    >
      <div >
        <q-btn
        v-if="windowConfig.engagement.desktopButtonType === 'standard'"
        @click="localOpenWindow"
        class="standard"
        :class="isSubscribed ? 'isSubscribed' : 'loading'"
        id="engagement"
        dense
        flat
        :rounded="isSubscribed"
        :round="!isSubscribed"
        >
        <div class="fr inner"
        :class="isSubscribed ? '' : 'jc-c'"
        >
          <div class="fc jc-c mr10" v-if="isSubscribed && windowConfig.engagement?.useIcon">
            <q-icon name="sym_o_forum" />
          </div>
          <q-space></q-space>
          <div v-if="isSubscribed">
            <div class="fc jc-c">
              {{ windowConfig.engagement?.label }}
            </div>
            <q-space></q-space>
          </div>
          <div v-if="!isSubscribed">
            <q-spinner></q-spinner>
          </div>
        </div>
        </q-btn>
        <q-btn
        @click="localOpenWindow"
        v-if="windowConfig.engagement.desktopButtonType === 'icon only'"
        class="icon-only"
        id="engagement"
        dense
        flat
        round
        icon="sym_o_chat"
        >
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatMessages from './messages/ChatMessages.vue'
import ConsumerWidget from './ConsumerWidget.vue'
import { useDropZone } from '@vueuse/core'
import { LPMessagingStore } from 'src/stores/WindowAPIStore'
import { storeToRefs } from 'pinia'
import { onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
// defineEmits(['sendMessage'])
import {
  delay,
  extractYTVideoId
} from 'src/utils/functions'
import type {
  MessagingWindowConfig,
  ISlideOut,
  ClientMessage
} from 'src/interfaces'
import { emitter } from 'src/utils/bus'
import AudioListener from 'src/applications/ConversationTester/AudioListener.vue'
// import {
//   formatMessages
// } from 'src/utils/messaging/helpers'

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
  windowConfig: MessagingWindowConfig
  quickReplies: string[]
  slide: ISlide;
  clickToLoad?: boolean;
  isDev?: boolean;
  defaultSize: 'full-container' | 'maximised' | 'normal' | 'expanded' | undefined;
}

const props = defineProps<Props>()

const store = LPMessagingStore()
const {
  agentChatState,
  isSubscribed,
  stage,
  showWindow,
  size,
  groupMessages,
  coBrowseMetadata,
  coBrowseExpired,
  isCobrowseSession,
  messagesLoaded,
  frequentMessages
} = storeToRefs(store)

const slideoutURI = ref() // https://www.youtube.com/embed/e7_CDuLMxkM 'https://storage.googleapis.com/lp-demo-builder/app-resources/pov_legs_mobile_messaging_01.webp'
const slideoutOpen = ref(false)
const slideOutContentType = ref('')
const msgInput = ref('')

const openSlideOut = (data: ISlideOut) => {
  slideoutOpen.value = false
  slideoutURI.value = null

  slideoutOpen.value = true
  setTimeout(() => {
    console.info(data)
    const ytvid = extractYTVideoId(data.uri)
    if (ytvid) {
      data.uri = `https://www.youtube.com/embed/${ytvid}`
    }
    slideoutURI.value = data.uri
    console.info(data)
  }, 200)
}
watch(messagesLoaded, (val) => {
  if (val) {
    scrollToBottom()
  }
})

watch(coBrowseMetadata, (val) => {
  console.info('val', val)
  if (isCobrowseSession.value) {
    return
  }
  if (val && !coBrowseExpired.value) {
    console.info('coBrowseMetadata', val)
    slideOutContentType.value = 'cobrowse_request'
    openSlideOut({
      target: 'slideout',
      type: 'cobrowse_request',
      uri: 'cobrowse_request'
    })
    return
  }
  if (slideOutContentType.value === 'cobrowse_request') {
    slideOutContentType.value = ''
    closeSlideOut()
  }
}, { deep: true })

watch(isCobrowseSession, (val) => {
  if (!val) {
    closeSlideOut()
  }
})

// const messageViewRef = ref()
/*
const scrollToBottom = () => {
  const messageStream = document.getElementById('message-stream')
  if (messageStream) {
    clearTimeout(timer as ReturnType<typeof setTimeout>)
    timer = setTimeout(() => {
      const lastMessage = messageStream.lastElementChild
      if (chatState.value === 'COMPOSING') {
        const typingIndicator = document.getElementById('typing-indicator')
        if (typingIndicator) {
          typingIndicator.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        lastMessage?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300)
  }
}
*/
const chatMessagesRef = ref()
const scrollToBottom = () => {
  // const el = document.getElementById('messageViewRef')
  console.info('chatMessagesRef.value', chatMessagesRef.value)
  if (!chatMessagesRef.value) return
  const messageStream = chatMessagesRef.value.getStreamElement()
  console.info('messageStream', messageStream)
  if (messageStream) {
    const lastMessage = messageStream.lastElementChild
    lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)
  }
}
watch(groupMessages, (val) => {
  if (val.length > 0) {
    scrollToBottom()
  }
}, { deep: true })
const closeSlideOut = () => {
  slideoutURI.value = null
  setTimeout(() => {
    slideoutOpen.value = false
  }, 200)
}
const openKB = () => {
  // open slideout with URL /app/31487986/knowledge-widget?kb=5072f7853340487e9f07716c5b2cec47
  console.info('openKB')
  openSlideOut({
    target: 'slideout',
    type: 'iframe',
    uri: '/app/31487986/knowledge-widget?kb=5072f7853340487e9f07716c5b2cec47'
  })
}
// const secureFormUrl = ref('')
const invitationId = ref('')

const openSecureForm = (a: ClientMessage) => {
  console.info(a)
  slideOutContentType.value = 'secureForm'
  invitationId.value = a.invitationId ?? ''
  if (!a.url || !a.invitationId) {
    console.error('Invalid secure form data', a)
    return
  }
  openSlideOut({
    target: 'slideout',
    type: 'secureForm',
    uri: a.url,
    invitationId: a.invitationId
  })
  // this.secureFormUrl = a.url
  // this.invitationId = a.invitationId
  // this.widgetOpen = true
  // setTimeout(() => {
  //   this.widgetShow = true
  // }, 200)
}

const closeConversation = () => {
  closeConfirm.value = false
  if (stage.value === 'OPEN') {
    store.closeConversation(false)
  }
}

const closeConfirm = ref(false)
// const calcInput = () => {
//   const str: string = String(props.windowConfig.cssProperties['--window-bottom'])
//   if (!str) return '44px'
//   // a =  "50px",
//   const b = str.replace('px', '')
//   return `${parseInt(b) - 16}px`
// }
const closeConv = () => {
  if (stage.value === 'OPEN') {
    closeConfirm.value = true
  } else {
    store.showWindow = false
    store.conversationId = null
    store.clearConvCache()
  }
}

function localFileToDataImage (file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = (e) => {
      const errorMsg = (e && typeof e === 'object' && 'message' in e)
        ? (e as unknown as Error).message
        : (e && typeof e === 'object' && 'type' in e)
          ? (e as ProgressEvent).type
          : String(e)
      reject(new Error(errorMsg))
    }
    reader.readAsDataURL(file)
  })
}
// function HTMLImageElementToDataImage (img: HTMLImageElement): string {
//   const canvas = document.createElement('canvas')
//   canvas.width = img.width
//   canvas.height = img.height
//   const ctx = canvas.getContext('2d')
//   ctx?.drawImage(img, 0, 0)
//   return canvas.toDataURL('image/jpeg')
// }
const imagePreview = ref()
async function createThumbnail (imgBase64: string): Promise<string | null> {
  const width = 150
  const img = new Image()
  img.src = imgBase64
  img.onload = () => {
    const oc = document.createElement('canvas'), octx = oc.getContext('2d')
    oc.width = img.width
    oc.height = img.height
    if (!octx) {
      console.error('Failed to get 2D context for canvas')
      return null
    }
    octx.drawImage(img, 0, 0)
    while (oc.width * 0.5 > width) {
      oc.width *= 0.5
      oc.height *= 0.5
      octx.drawImage(oc, 0, 0, oc.width, oc.height)
    }
    oc.width = width
    oc.height = oc.width * img.height / img.width
    octx.drawImage(img, 0, 0, oc.width, oc.height)
    const thumb = oc.toDataURL('image/png')
    imagePreview.value = thumb
    console.log(thumb)
    return thumb
  }
  img.onerror = (error) => {
    console.log(error)
  }
  // convert to base64 images string
  await delay(100)
  return imagePreview.value
}
const messagingWindow = useTemplateRef<HTMLElement>('messagingWindow')
const imageFilesData = shallowRef<{ name: string, size: number, type: string, lastModified: number }[]>([])
const fileDropError = ref()
async function onImageDrop (files: File[] | null) {
  imageFilesData.value = []
  if (files) {
    imageFilesData.value = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }))
    const f = imageFilesData.value[0]
    console.info('imageFilesData', f)
    if (!f) {
      fileDropError.value = 'No file found for upload.'
      setTimeout(() => {
        fileDropError.value = null
      }, 2000)
      return
    }
    const fileSize = f.size / 1024 / 1024

    if (fileSize > 3) {
      console.error('file size is too large')
      fileDropError.value = 'file size is too large, cannot exceed 3MB'
      // TODO: show error message
      setTimeout(() => {
        fileDropError.value = null
      }, 2000)
      return
    }
    const formData = new FormData()
    if (files[0]) {
      formData.append('files', files[0])
      const dataImage: string = await localFileToDataImage(files[0])
      await createThumbnail(dataImage)
      console.info('imagePreview', imagePreview.value)
      // const a = 1
      // if (a === 1) return
      store.requestFileUpload(formData, files[0], dataImage, imagePreview.value)
    }
  }
  console.info('imageFilesData', imageFilesData.value)
}

const { isOverDropZone: isOverImageDropZone } = useDropZone(
  messagingWindow, {
    dataTypes: [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/gif',
      'image/svg',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ],
    onDrop: (files: File[] | null) => { void onImageDrop(files) }
  })

const connect = async () => {
  if (LPMessagingStore().UMSConnected || !props.clickToLoad) {
    return
  }
  await LPMessagingStore().connectToUMS()
  store.showWindow = true
}

interface FrequentObject {
  [key: string]: number;
}

function loadFrequent () {
  const f: FrequentObject = {}
  const freq = JSON.parse(localStorage.getItem('freq') || '{}')
  Object.keys(freq).forEach((key) => {
    f[key] = Number(freq[key])
  })
  frequentMessages.value = f
}

const sendMessage = (a: string) => {
  if (!a || a === '') return
  if (props.isDev) {
    frequentMessages.value[a] = (frequentMessages.value[a] || 0) + 1
    localStorage.setItem('freq', JSON.stringify(frequentMessages.value))
    console.info('frequent', frequentMessages.value)
  }
  console.info('sending message', a)
  store.sendMessage(a)
  msgInput.value = ''
  emitter.emit('sendMessage', a)
}

const localOpenWindow = () => {
  if (props.clickToLoad) {
    store.showWindow = true
    void connect()
    return
  }
  store.showWindow = true
}

defineExpose({
  connect
})

onMounted(async () => {
  loadFrequent()
  await LPMessagingStore().connectToUMS()
  if (LPMessagingStore().messagesLoaded) {
    scrollToBottom()
  }
  if (props.defaultSize) {
    store.size = props.defaultSize
  }
})
</script>

<style lang="scss">
#lp-btn-container {
  position: absolute;
  right: 40px;
  bottom: 20px;
  #engagement {
    z-index: 1;
    background: var(--lp-btn-bgColor);
    color: var(--lp-btn-textColor);
    *span {
      border-radius: 28px !important;
      background: var(--lp-btn-bgColor) !important;
    }
    .inner {
      border-radius: 28px;
      padding: 2px 20px;
      background: var(--lp-btn-bgColor);
    }
    .q-btn__content, .q-focus-helper, *span {
      border-radius: 28px !important;
    }
    &.icon-only {
      padding: 12px;
    }
    width: var(--lp-btn-width);
    transition: width 0.2s ease-in-out;
    .q-btn, .inner {
      width: var(--lp-btn-width);
      transition: width 0.2s ease-in-out;
    }
    &.loading {
      width: 40px;
      transition: width 0.2s ease-in-out;
      .q-btn, .inner {
        width: 40px;
        transition: width 0.2s ease-in-out;
      }
    }
  }
}
.msg-notify {
  position: absolute;
  width: var(--window-width);
  background-color: $dark;
  height: 50px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
</style>
