<script setup lang="ts">
/**
 * RichContentElement - Recursive component for rendering LivePerson JSON Pollock elements
 * Handles all element types: text, button, image, map, containers, etc.
 */
import { computed, ref } from "vue";
import type {
  RichContentElement,
  RichContentAction,
  RichContentMetadata,
  TextElement,
  ButtonElement,
  ImageElement,
  MapElement,
  SubmitButtonElement,
  CheckboxElement,
  DatePickerElement,
  VerticalContainer,
  HorizontalContainer,
  CarouselContainer,
  ListContainer,
  SectionListContainer,
  SectionContainer,
  ChecklistContainer,
  ButtonListContainer,
  TextStyle,
  ButtonStyle,
} from "./types";

const props = defineProps<{
  element: RichContentElement;
  depth?: number;
  viewOnly?: boolean;
}>();

// Date picker state
const datePickerValue = ref("");

const emit = defineEmits<{
  action: [action: RichContentAction, metadata?: RichContentMetadata[]];
}>();

const depth = computed(() => props.depth ?? 0);
const viewOnly = computed(() => props.viewOnly ?? false);

// Helper to get element type for unknown element display
const elementType = computed(() => (props.element as { type: string }).type);

// Type guards for elements
const isText = (el: RichContentElement): el is TextElement =>
  el.type === "text";
const isButton = (el: RichContentElement): el is ButtonElement =>
  el.type === "button";
const isImage = (el: RichContentElement): el is ImageElement =>
  el.type === "image";
const isMap = (el: RichContentElement): el is MapElement => el.type === "map";
const isSubmitButton = (el: RichContentElement): el is SubmitButtonElement =>
  el.type === "submitButton";
const isCheckbox = (el: RichContentElement): el is CheckboxElement =>
  el.type === "checkbox";
const isDatePicker = (el: RichContentElement): el is DatePickerElement =>
  el.type === "datePicker";
const isVertical = (el: RichContentElement): el is VerticalContainer =>
  el.type === "vertical";
const isHorizontal = (el: RichContentElement): el is HorizontalContainer =>
  el.type === "horizontal";
const isCarousel = (el: RichContentElement): el is CarouselContainer =>
  el.type === "carousel";
const isList = (el: RichContentElement): el is ListContainer =>
  el.type === "list";
const isSectionList = (el: RichContentElement): el is SectionListContainer =>
  el.type === "sectionList";
const isSection = (el: RichContentElement): el is SectionContainer =>
  el.type === "section";
const isChecklist = (el: RichContentElement): el is ChecklistContainer =>
  el.type === "checklist";
const isButtonList = (el: RichContentElement): el is ButtonListContainer =>
  el.type === "buttonList";

// Convert text style to CSS
function getTextStyle(style?: TextStyle): Record<string, string> {
  if (!style) return {};
  const css: Record<string, string> = {};

  if (style.bold) css.fontWeight = "bold";
  if (style.italic) css.fontStyle = "italic";
  if (style.color) css.color = style.color;
  if (style["background-color"])
    css.backgroundColor = style["background-color"];
  if (style.size) {
    const sizes = { small: "0.875rem", medium: "1rem", large: "1.25rem" };
    css.fontSize = sizes[style.size];
  }

  return css;
}

// Convert button style to CSS
function getButtonStyle(style?: ButtonStyle): Record<string, string> {
  if (!style) return {};
  const css: Record<string, string> = {};

  if (style["background-color"])
    css.backgroundColor = style["background-color"];
  if (style.color) css.color = style.color;
  if (style["border-color"]) css.borderColor = style["border-color"];
  if (style["border-radius"] !== undefined)
    css.borderRadius = `${style["border-radius"]}px`;

  return css;
}

// Handle click actions (no-op in viewOnly mode)
function handleClick(element: RichContentElement) {
  if (props.viewOnly) return;
  if ("click" in element && element.click?.actions) {
    for (const action of element.click.actions) {
      emit("action", action, element.click.metadata);
    }
  }
}

// Forward action events from nested elements
function onNestedAction(
  action: RichContentAction,
  metadata?: RichContentMetadata[]
) {
  emit("action", action, metadata);
}

// Get Google Maps static image URL
function getMapImageUrl(la: number, lo: number): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${la},${lo}&zoom=15&size=300x200&markers=color:red%7C${la},${lo}`;
}

// Compute horizontal element widths based on percentages
function getHorizontalWidths(container: HorizontalContainer): string[] {
  if (
    container.percentages &&
    container.percentages.length === container.elements.length
  ) {
    return container.percentages.map((p) => `${p}%`);
  }
  // Equal distribution if no percentages specified
  const width = 100 / container.elements.length;
  return container.elements.map(() => `${width}%`);
}
</script>

<template>
  <div
    class="rc-element"
    :class="`rc-element--${element.type}`"
    :data-depth="depth"
  >
    <!-- Text Element -->
    <div
      v-if="isText(element)"
      class="rc-text"
      :style="getTextStyle(element.style)"
    >
      {{ element.text }}
    </div>

    <!-- Button Element -->
    <q-btn
      v-else-if="isButton(element)"
      class="rc-button"
      :label="element.title"
      :style="getButtonStyle(element.style)"
      :title="element.tooltip"
      dense
      no-caps
      unelevated
      @click="handleClick(element)"
    />

    <!-- Submit Button Element -->
    <q-btn
      v-else-if="isSubmitButton(element)"
      class="rc-submit-button"
      :label="element.title"
      :style="getButtonStyle(element.style)"
      :title="element.tooltip"
      :disable="element.disabled"
      dense
      unelevated
      no-caps
      @click="handleClick(element)"
    />

    <!-- Image Element -->
    <div
      v-else-if="isImage(element)"
      class="rc-image"
      @click="handleClick(element)"
    >
      <img
        :src="element.url"
        :alt="element.alt || element.caption || 'Image'"
      />
      <div v-if="element.caption" class="rc-image__caption">
        {{ element.caption }}
      </div>
    </div>

    <!-- Map Element -->
    <div
      v-else-if="isMap(element)"
      class="rc-map"
      @click="handleClick(element)"
    >
      <img
        :src="getMapImageUrl(element.la, element.lo)"
        :alt="element.alt || 'Map location'"
        class="rc-map__image"
      />
      <div class="rc-map__coords">
        {{ element.la.toFixed(4) }}, {{ element.lo.toFixed(4) }}
      </div>
    </div>

    <!-- Checkbox Element -->
    <q-checkbox
      v-else-if="isCheckbox(element)"
      class="rc-checkbox"
      :model-value="element.checked || false"
      :label="element.text"
      :class="{ 'rc-checkbox--bordered': element.borderLine }"
      :style="element.borderColor ? { borderColor: element.borderColor } : {}"
      @click="handleClick(element)"
    />

    <!-- Date Picker Element -->
    <q-input
      v-else-if="isDatePicker(element)"
      v-model="datePickerValue"
      class="rc-datepicker"
      type="date"
      dense
      outlined
    >
      <template #prepend>
        <q-icon name="event" />
      </template>
    </q-input>

    <!-- Vertical Container -->
    <div
      v-else-if="isVertical(element)"
      class="rc-vertical"
      :class="{
        'rc-vertical--border': element.border === 'border',
        'rc-vertical--shadow': element.border === 'dropShadow',
      }"
    >
      <RichContentElement
        v-for="(child, idx) in element.elements"
        :key="idx"
        :element="child"
        :depth="depth + 1"
        :view-only="viewOnly"
        @action="onNestedAction"
      />
    </div>

    <!-- Horizontal Container -->
    <div v-else-if="isHorizontal(element)" class="rc-horizontal">
      <div
        v-for="(child, idx) in element.elements"
        :key="idx"
        class="rc-horizontal__item"
        :style="{ width: getHorizontalWidths(element)[idx] }"
      >
        <RichContentElement
          :element="child"
          :depth="depth + 1"
          :view-only="viewOnly"
          @action="onNestedAction"
        />
      </div>
    </div>

    <!-- Carousel Container -->
    <div v-else-if="isCarousel(element)" class="rc-carousel">
      <div class="rc-carousel__scroll">
        <div
          class="rc-carousel__track"
          :style="{ gap: `${element.padding || 8}px` }"
        >
          <div
            v-for="(child, idx) in element.elements"
            :key="idx"
            class="rc-carousel__item"
          >
            <RichContentElement
              :element="child"
              :depth="depth + 1"
              :view-only="viewOnly"
              @action="onNestedAction"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- List Container -->
    <div v-else-if="isList(element)" class="rc-list">
      <div
        v-for="(child, idx) in element.elements"
        :key="idx"
        class="rc-list__item"
      >
        <RichContentElement
          :element="child"
          :depth="depth + 1"
          :view-only="viewOnly"
          @action="onNestedAction"
        />
      </div>
    </div>

    <!-- Section List Container -->
    <div v-else-if="isSectionList(element)" class="rc-section-list">
      <RichContentElement
        v-for="(child, idx) in element.elements"
        :key="idx"
        :element="child"
        :depth="depth + 1"
        :view-only="viewOnly"
        @action="onNestedAction"
      />
    </div>

    <!-- Section Container -->
    <div v-else-if="isSection(element)" class="rc-section">
      <RichContentElement
        v-for="(child, idx) in element.elements"
        :key="idx"
        :element="child"
        :depth="depth + 1"
        :view-only="viewOnly"
        @action="onNestedAction"
      />
    </div>

    <!-- Checklist Container -->
    <div v-else-if="isChecklist(element)" class="rc-checklist">
      <RichContentElement
        v-for="(child, idx) in element.elements"
        :key="idx"
        :element="child"
        :depth="depth + 1"
        :view-only="viewOnly"
        @action="onNestedAction"
      />
    </div>

    <!-- Button List Container -->
    <div v-else-if="isButtonList(element)" class="rc-button-list">
      <RichContentElement
        v-for="(child, idx) in element.elements"
        :key="idx"
        :element="child"
        :depth="depth + 1"
        :view-only="viewOnly"
        @action="onNestedAction"
      />
    </div>

    <!-- Unknown Element Type -->
    <div v-else class="rc-unknown">
      <q-icon name="help_outline" size="sm" />
      <span>Unknown element: {{ elementType }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rc-element {
  width: 100%;
  color: white;
}

.rc-text {
  padding: 4px 0;
  line-height: 1.4;
  word-wrap: break-word;
}

.rc-button {
  margin: 4px 0;
}

.rc-submit-button {
  margin: 8px 0;
  width: 100%;
}

.rc-image {
  cursor: pointer;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }

  &__caption {
    font-size: 0.875rem;
    color: var(--q-grey-7);
    margin-top: 4px;
  }
}

.rc-map {
  cursor: pointer;

  &__image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }

  &__coords {
    font-size: 0.75rem;
    color: var(--q-grey-6);
    margin-top: 4px;
  }
}

.rc-checkbox {
  &--bordered {
    border: 1px solid var(--q-grey-4);
    border-radius: 4px;
    padding: 8px;
  }
}

.rc-datepicker {
  max-width: 200px;
}

.rc-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &--border {
    border: 1px solid var(--q-grey-4);
    border-radius: 8px;
    padding: 12px;
  }

  &--shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 12px;
  }
}

.rc-horizontal {
  display: flex;
  flex-direction: row;
  gap: 8px;

  &__item {
    flex-shrink: 0;
    min-width: 0;
  }
}

.rc-carousel {
  &__scroll {
    height: auto;
    max-height: 400px;
  }

  &__track {
    display: flex;
    flex-direction: row;
    padding: 8px 0;
  }

  &__item {
    flex-shrink: 0;
    min-width: 200px;
    max-width: 280px;
  }
}

.rc-list {
  display: flex;
  flex-direction: column;

  &__item {
    border-bottom: 1px solid var(--q-grey-3);
    padding: 8px 0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.rc-section-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rc-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.rc-checklist {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.rc-button-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.rc-unknown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--q-warning);
  font-size: 0.875rem;
  padding: 8px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
}
</style>
