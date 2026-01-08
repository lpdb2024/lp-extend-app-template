<template>
  <div :style="{...windowConfig.cssProperties, ...additionalStyles(windowConfig)}"
  v-if="LPMessagingStore().stage"
  >
    <div id="slideout-container"
    v-if="slideoutOpen && !slideOutFullscreen && size !== 'maximised'"
    :class="slideoutURI ? 'slideout-open' : ''">
      <div class="top fr">
        <q-btn
        flat
        color="grey-5"
        icon="close"
        @click="$emit('closeSlideOut')"
        />
        <q-space></q-space>
        <q-btn
        flat
        color="grey-5"
        icon="open_in_full"
        @click="slideOutFullscreen = true"
        />
        <q-separator vertical inset></q-separator>
      </div>
      <div id="slideout"
      :class="slideoutURI ? 'slideout-open' : ''"
      >
        <div class="content fc jc-c h-100-p">
          <div
          v-if="videoUrl"
          class="lp_cobrowse_callscreen_container h-100-p"
          ></div>
          <div
          v-if="contentType === 'cobrowse_request'"
          >
            <q-item v-if="!LPMessagingStore().isCobrowseSession">
              <q-item-section v-if="![CHANNEL_TYPES.VIDEO_CALL, CHANNEL_TYPES.VOICE_CALL].includes(coBrowseMetadata?.mode as CHANNEL_TYPES)">
                <q-item-label class="ta-c" v-if="!LPMessagingStore().coBrowseExpired">
                  you have been invited to a cobrowse session
                </q-item-label>
                <q-item-label class="ta-c" v-else>
                  cobrowse session invitation has expired
                </q-item-label>
              </q-item-section>

              <q-item-section v-else-if="coBrowseMetadata?.mode === CHANNEL_TYPES.VIDEO_CALL">
                <q-item-label class="ta-c" v-if="!LPMessagingStore().coBrowseExpired">
                  you have been invited to a video call
                </q-item-label>
                <q-item-label class="ta-c" v-else>
                  video call invitation has expired
                </q-item-label>
              </q-item-section>

              <q-item-section v-else-if="coBrowseMetadata?.mode === CHANNEL_TYPES.VOICE_CALL">
                <q-item-label class="ta-c" v-if="!LPMessagingStore().coBrowseExpired">
                  you have been invited to a voice call
                </q-item-label>
                <q-item-label class="ta-c" v-else>
                  voice call invitation has expired
                </q-item-label>
              </q-item-section>

            </q-item>
            <div class="fr jc-c" v-if="!LPMessagingStore().coBrowseExpired && !LPMessagingStore().isCobrowseSession">
              <q-btn
                unelevated
                label="accept"
                color="positive"
                @click="acceptCobrowseInvitation()"
                />
                <div class="w-10"></div>
                <q-btn
                unelevated
                label="decline"
                color="negative"
                @click="rejectCobrowseInvitation()"
                />
            </div>
          </div>
          <div id="secureFormError" v-else-if="secureFormError">
            <div class="secure_form_message w-100-p" role="alert" tabindex="-1" style="visibility: visible;">
              <div class="lp_image">
                <img src="https://lpcdn.lpsnmedia.net/le_unified_window/10.41.1-release_1638513975/resources/secure_form_icon.png" alt="" class="ml-a mr-a mb-10">
              </div>
              <div class="lp_lpview_title lp_title w-300 ml-a mr-a ta-c">The Secure Form could not be opened. <br>Please contact your agent for assistance.
              </div>
            </div>
          </div>
          <q-img
          v-else-if="slideoutURI && slideoutURIType(slideoutURI ?? '') === 'image'" :src="slideoutURI"
          width="100%"
          fit="contain"
          />
          <iframe
          v-else-if="slideoutURI"
          :src="slideoutURI"
          frameborder="0"
          ></iframe>

        </div>
      </div>
    </div>
    <q-dialog
    maximized
    fullHeight
    full-width
    v-model="slideOutFullscreen"
    id="slideout-fullscreen"
    :style="{...windowConfig.cssProperties, ...additionalStyles(windowConfig)}"
    >
      <div class="inner fc">
        <div class="top fr h-50">
          <q-btn
          flat
          color="grey-5"
          icon="close"
          @click="$emit('closeSlideOut')"
          />
          <q-space></q-space>
          <q-btn
          flat
          color="grey-5"
          icon="open_in_full"
          @click="slideOutFullscreen = slideOutFullscreen !== true"
          />
          <q-separator vertical inset></q-separator>
        </div>
        <div id="slideout"
        class="fg"
        :class="slideoutURI ? 'slideout-open' : ''"
        >
          <div class="content fc jc-c h-100-p">
            <q-img
            v-if="slideoutURI && slideoutURIType(slideoutURI) === 'image'" :src="slideoutURI"
            width="100%"
            fit="contain"
            />
            <iframe
            v-else-if="slideoutURI"
            :src="slideoutURI"
            frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import type { MessagingWindowConfig } from 'src/interfaces'
import { CHANNEL_TYPES } from 'src/constants'
import type { CSSProperties} from 'vue';
import { onMounted, ref } from 'vue'
import { receiveSecureFormMessage } from 'src/utils/messaging'
import { LPMessagingStore } from 'src/stores/WindowAPIStore'
import { storeToRefs } from 'pinia'
const { coBrowseMetadata } = storeToRefs(LPMessagingStore())
// const { coBrowseExpired, coBrowseMetadata } = storeToRefs(LPMessagingStore())
interface Props {
  slideoutOpen: boolean;
  size: string;
  slideoutURI: string | null;
  windowConfig: MessagingWindowConfig;
  invitationId?: string;
  contentType?: string;
}
const props = defineProps<Props>()
const emit = defineEmits(['closeSlideOut'])
const secureFormError = ref(false)
const slideoutURIType = (slideoutURI: string) => {
  if (!slideoutURI) return
  const type = slideoutURI.split('.').pop()
  if (!type) return
  const images = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff']
  if (images.includes(type)) {
    return 'image'
  }
  return type
}
const slideOutFullscreen = ref(false)
const additionalStyles = (config: MessagingWindowConfig) => {
  const styles: CSSProperties = {}
  const t = config.top.bg.useCustom ? config.top.bg.gradient?.stops?.[0]?.color : config.top.bg.color
  styles['--window-so-top'] = t
  return styles
}
// receiveSecureFormMessage
const videoUrl = ref(false)
const rejectCobrowseInvitation = () => {
  LPMessagingStore().rejectCobrowseInvitation()
  emit('closeSlideOut')
}
const acceptCobrowseInvitation = () => {
  const m = coBrowseMetadata.value
  if (m?.mode === 'VIDEO_CALL' || m?.mode === 'VOICE_CALL') {
    console.info(m)
    videoUrl.value = true // m?.callLink
    LPMessagingStore().acceptCobrowseInvitation()
  } else {
    LPMessagingStore().acceptCobrowseInvitation()
    emit('closeSlideOut')
  }
}

onMounted(() => {
  // add event listener to iframe
  // if (props.contentType !== 'secureForm' || !props.invitationId) return

  console.info(props.contentType, props.invitationId)

  window.addEventListener('message', (e: MessageEvent) => {
    const data = receiveSecureFormMessage(e)
    if (data) {
      const { state, token } = data
      if (state === 'submit' && props.invitationId) {
        LPMessagingStore().submitSecureForm(token, props.invitationId)
      }
    }
  })
})
</script>

<style lang="scss" scoped>

</style>
