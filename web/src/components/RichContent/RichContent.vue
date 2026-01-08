<script setup lang="ts">
/**
 * RichContent - Main component for rendering LivePerson JSON Pollock structured content
 *
 * Usage:
 *   <RichContent :content="jsonPollockData" @action="handleAction" />
 *
 * The content prop accepts a RichContentMessage object which is the root
 * structure of LivePerson's structured content format.
 */
import { computed } from "vue";
import RichContentElement from "./RichContentElement.vue";
import type {
  RichContentMessage,
  RichContentAction,
  RichContentMetadata,
  QuickReply,
} from "./types";

const props = withDefaults(
  defineProps<{
    content: RichContentMessage;
    showQuickReplies?: boolean;
    maxWidth?: string;
    viewOnly?: boolean;
  }>(),
  {
    showQuickReplies: true,
    maxWidth: "400px",
    viewOnly: false,
  }
);

const emit = defineEmits<{
  action: [action: RichContentAction, metadata?: RichContentMetadata[]];
  quickReply: [reply: QuickReply];
}>();

// Container classes based on root type and properties
const containerClasses = computed(() => {
  const classes: string[] = ["rc-root", `rc-root--${props.content.type}`];

  if (props.content.border) {
    classes.push(`rc-root--${props.content.border}`);
  }

  return classes;
});

// Container styles
const containerStyles = computed(() => {
  const styles: Record<string, string> = {
    maxWidth: props.maxWidth,
  };

  if (props.content.padding !== undefined) {
    styles.padding = `${props.content.padding}px`;
  }

  return styles;
});

// Handle element actions
function onAction(action: RichContentAction, metadata?: RichContentMetadata[]) {
  emit("action", action, metadata);
}

// Handle quick reply click (no-op in viewOnly mode)
function onQuickReply(reply: QuickReply) {
  if (props.viewOnly) return;
  emit("quickReply", reply);

  // Also emit the actions from the quick reply
  if (reply.click?.actions) {
    for (const action of reply.click.actions) {
      emit("action", action, reply.click.metadata);
    }
  }
}

// Get horizontal widths for root horizontal layout
const horizontalWidths = computed(() => {
  if (props.content.type !== "horizontal") return [];
  if (
    props.content.percentages &&
    props.content.percentages.length === props.content.elements.length
  ) {
    return props.content.percentages.map((p) => `${p}%`);
  }
  const width = 100 / props.content.elements.length;
  return props.content.elements.map(() => `${width}%`);
});
</script>

<template>
  <div class="rich-content" :style="containerStyles">
    <!-- Main content area -->
    <div :class="containerClasses">
      <!-- Vertical Layout -->
      <template v-if="content.type === 'vertical'">
        <RichContentElement
          v-for="(element, idx) in content.elements"
          :key="idx"
          :element="element"
          :depth="0"
          :view-only="!!viewOnly"
          @action="onAction"
        />
      </template>

      <!-- Horizontal Layout -->
      <template v-else-if="content.type === 'horizontal'">
        <div class="rc-root__horizontal">
          <div
            v-for="(element, idx) in content.elements"
            :key="idx"
            class="rc-root__horizontal-item"
            :style="{ width: horizontalWidths[idx] }"
          >
            <RichContentElement
              :element="element"
              :depth="0"
              :view-only="!!viewOnly"
              @action="onAction"
            />
          </div>
        </div>
      </template>

      <!-- Carousel Layout -->
      <template v-else-if="content.type === 'carousel'">
        <div class="rc-root__carousel-scroll">
          <div
            class="rc-root__carousel-track"
            :style="{ gap: `${content.padding || 8}px` }"
          >
            <div
              v-for="(element, idx) in content.elements"
              :key="idx"
              class="rc-root__carousel-item"
            >
              <RichContentElement
                :element="element"
                :depth="0"
                :view-only="!!viewOnly"
                @action="onAction"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Quick Replies -->
    <div
      v-if="showQuickReplies && content.quickReplies?.length"
      class="rc-quick-replies"
    >
      <q-chip
        v-for="(reply, idx) in content.quickReplies"
        :key="idx"
        class="rc-quick-reply"
        :clickable="!viewOnly"
        :title="reply.tooltip"
        @click="onQuickReply(reply)"
      >
        {{ reply.title }}
      </q-chip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rich-content {
  width: 100%;

  // Standalone buttons (not in cards) use gradient
  :deep(.rc-button),
  :deep(.rc-submit-button) {
    // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    background: rgba($color: #ffffff, $alpha: 0.2);
    color: #ffffff;
    border: none !important;
    width: 100%;
  }

  // Buttons inside cards use white background
  :deep(.rc-vertical--border),
  :deep(.rc-vertical--shadow),
  :deep(.rc-carousel__item) {
    .rc-button,
    .rc-submit-button {
      background: white;
      color: #333;
      border: 1px solid #e0e0e0;
    }
  }
}

.rc-root {
  border-radius: 12px;
  padding: 0;

  &--vertical {
    display: flex;
    flex-direction: column;
    gap: 8px;
    // background: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 12px;
    .rc-button {
      background: white !important;
      color: #333 !important;
    }
  }

  &--carousel {
    padding: 0;
  }

  &--border {
    border: 1px solid var(--q-grey-4);
    padding: 12px;
    background: white;
  }

  &--borderLess {
    border: none;
    background: transparent;
  }

  &--dropShadow {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    padding: 12px;
    background: white;
  }

  &__horizontal {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  &__horizontal-item {
    flex-shrink: 0;
    min-width: 0;
  }

  &__carousel-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
  }

  &__carousel-track {
    display: flex;
    flex-direction: row;
    padding: 8px 4px;
    width: max-content;
  }

  &__carousel-item {
    flex-shrink: 0;
    min-width: 200px;
    max-width: 280px;
    // background: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 12px;
  }
}

.rc-quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 0 4px;
}

.rc-quick-reply {
  font-size: 0.875rem;
}
</style>
