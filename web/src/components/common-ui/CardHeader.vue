<template>
  <div class="fc w-100-p">
    <q-bar
      class="w-100-p db-bar text-bold ff-inter h-32"
      :class="{
        'text-indigo-2 bg-lp-widget-blue-2': $q.dark.isActive,
        'lp-theme-text': !$q.dark.isActive,
        'h-60': !dense,
      }"
      style="border-bottom-left-radius: 0px; border-bottom-right-radius: 0px"
    >
      <slot name="icon" />
      <q-icon
        :name="icon || 'far fa-hand-pointer'"
        v-if="!hideIcon && !$slots.icon"
      />

      <slot name="title" />
      <div v-if="!$slots.title || (!hideTitle && title)">{{ title }}</div>
      <q-space />
      <q-btn
        dense
        flat
        icon="sym_o_save"
        v-close-popup
        v-if="save"
        @click="$emit('save')"
        :class="{ 'text-white': !!dark }"
      >
        <q-tooltip>save</q-tooltip>
      </q-btn>
      <q-btn
        v-if="useMaximize"
        dense
        flat
        icon="minimize"
        @click="$emit('maximizedToggle', false)"
        :disable="!maximized"
      >
        <q-tooltip v-if="useMaximize && maximized" class="bg-white text-primary"
          >Minimize</q-tooltip
        >
      </q-btn>
      <q-btn
        dense
        flat
        icon="crop_square"
        @click="$emit('maximizedToggle', true)"
        :disable="maximized"
        v-if="useMaximize"
      >
        <q-tooltip
          v-if="useMaximize && !maximized"
          class="bg-white text-primary"
          >Maximize</q-tooltip
        >
      </q-btn>
      <q-btn
        dense
        flat
        icon="close"
        v-close-popup
        v-if="!hideClose"
        :class="{ 'text-white': !!dark }"
        @click="$emit('close')"
      >
        <q-tooltip>Close</q-tooltip>
      </q-btn>
    </q-bar>
    <div class="lp-ribbon relative w-100-p h-2"></div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
const $q = useQuasar();
interface Props {
  useMaximize?: boolean | undefined;
  maximized?: boolean | undefined;
  dense?: boolean | null | undefined;
  dark?: boolean | null | undefined;
  hideClose?: boolean | null | undefined;
  title?: string;
  hideTitle?: boolean | null | undefined;
  hideIcon?: boolean | null | undefined;
  save?: boolean | null | undefined;
  icon?: string | null | undefined;
  fit?: boolean | null | undefined;
}
defineEmits(["save", "close", "maximizedToggle"]);
withDefaults(defineProps<Props>(), {
  hideClose: false,
  title: "menu",
  icon: "sym_o_info",
});
</script>

<style lang="scss">
.db-bar {
  width: inherit;
  // color: $indigo;
  // ~assets/dark-theme_barBanner.png
  // background-image: url('assets/light-theme_barBanner.png');
  // background-image: url('assets/dark-theme_barBanner.png');
  // reverse the image horizontally
  background-position: right;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  // &.q-bar--dark {
  //   background-image: url('assets/dark-theme_barBanner.png');
  // }
  // before
  // #fe6807 #fd650d #fe5139
  // background: linear-gradient(90deg, #f9a11e, #f9a11e 0%, #fd650d 50%, #fe5139 100%);
  // &.q-bar--dark {
  // blue linear gradient
  // background: linear-gradient(90deg, #3a62e5, #3a62e5 0%, #3863e5 50%, #8d46eb, #e849b7 100%);
  // }

  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  position: relative;

  // &:before {
  //   content: '';
  //   position: absolute;
  //   // background-image: url('assets/dark-theme_barBanner.png');
  //   background-position: right;
  //   background-repeat: no-repeat;
  //   background-size: 100% 100%;
  //   top: 0;
  //   left: 0;
  //   width: inherit;
  //   height: inherit;
  //   // #fe6807 #fd650d #fe5139
  // backdrop-filter: blur(5px);
  // -webkit-backdrop-filter: blur(5px);
  //   // background-color: rgba(0, 0, 0, 0.5);
  // }
}
</style>
