<template>
  <!-- Header -->
  <div>
    <div
      v-if="!useRouteMeta"
      ref="headerEl"
      class="ext-page-header fr w-100-p"
      :class="{ 'ext-page-header--collapsed': isCollapsed }"
    >
      <div class="ext-header-content">
        <div class="ext-header-text">
          <div class="fr ext-overline">
            <img
              src="/logos/cog-smooth-trans.png"
              alt=""
              style="width: 20px; height: 20px; margin-right: 8px"
            />
            <span class="mt-a mb-a">{{ category }}</span>
          </div>
          <h1 class="ext-display-3 ext-text-gradient">{{ title }}</h1>
          <p class="ext-body ext-text-secondary">
            {{ caption }}
          </p>
        </div>
      </div>
      <q-space></q-space>
      <slot name="actions">
        <div class="ext-header-actions fc jc-c"></div>
      </slot>
      <q-btn flat round icon="sym_o_help" class="q-ml-sm" @click="openHelp">
        <q-tooltip>Help & Documentation</q-tooltip>
      </q-btn>
    </div>
    <div
      v-else
      ref="headerEl"
      class="ext-page-header fr w-100-p"
      :class="{ 'ext-page-header--collapsed': isCollapsed }"
    >
      <div class="ext-header-content">
        <div class="ext-header-text">
          <div class="fr ext-overline">
            <img
              src="/logos/cog-smooth-trans.png"
              alt=""
              style="width: 20px; height: 20px; margin-right: 8px"
            />
            <div class="mt-a mb-a category-card fr gap-10">
              <div
                class="fc jc-c category-colour br-10 w-10 h-10"
                :style="{
                  backgroundColor: (route?.meta?.colour as string) || '#CCCCCC',
                  border: '1px solid #000000'
                }"
              ></div>
              <div class="fc jc-c">
                {{ route?.meta?.category }}
              </div>
            </div>
          </div>
          <h1 class="ext-display-3 ext-text-gradient">
            {{ route?.meta?.title }}
          </h1>
          <p class="ext-body ext-text-secondary">
            {{ route?.meta?.caption }}
          </p>
        </div>
      </div>
      <q-space></q-space>
      <slot name="actions">
        <div class="ext-header-actions fc jc-c"></div>
      </slot>
      <q-btn flat round icon="sym_o_help" class="q-ml-sm" @click="openHelp">
        <q-tooltip>Help & Documentation</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useUserGuideStore } from "src/stores/store-user-guide";

defineProps<{
  category?: string;
  title?: string;
  caption?: string;
  useRouteMeta?: boolean;
}>();

const userGuideStore = useUserGuideStore();

const openHelp = () => {
  userGuideStore.openHelpDrawer();
};

const headerEl = ref<HTMLElement | null>(null);
const isCollapsed = ref(false);
const scrollThreshold = 80; // Pixels scrolled before collapsing
let lastScrollY = 0;
let scrollContainer: Element | null = null;

const handleScroll = () => {
  if (!scrollContainer) return;

  const currentScrollY = scrollContainer.scrollTop;
  const scrollingDown = currentScrollY > lastScrollY;
  const scrollingUp = currentScrollY < lastScrollY;

  // Collapse when scrolling down past threshold
  if (scrollingDown && currentScrollY > scrollThreshold) {
    isCollapsed.value = true;
  }
  // Expand when scrolling up OR when near top
  else if (scrollingUp || currentScrollY <= scrollThreshold) {
    isCollapsed.value = false;
  }

  lastScrollY = currentScrollY;
};

const route = useRoute();

const findScrollContainer = (element: HTMLElement | null): Element | null => {
  if (!element) return null;

  // Look for sibling scroll container (ext-scroll-container)
  const parent = element.parentElement;
  if (parent) {
    const scrollContainer = parent.querySelector(".ext-scroll-container");
    if (scrollContainer) {
      return scrollContainer;
    }
  }

  // Fallback: look for any scrollable parent
  let current = element.parentElement;
  while (current) {
    const style = getComputedStyle(current);
    const overflowY = style.overflowY;

    if (overflowY === "auto" || overflowY === "scroll") {
      return current;
    }

    // Check for common scroll container classes
    if (
      current.classList.contains("ext-scroll-container") ||
      current.classList.contains("scroll")
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
};

onMounted(() => {
  // Find the scroll container (sibling or parent)
  scrollContainer = findScrollContainer(headerEl.value);

  if (scrollContainer) {
    // Add scroll listener with passive flag for performance
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
  }
});

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener("scroll", handleScroll);
  }
});
</script>

<style lang="scss"></style>
