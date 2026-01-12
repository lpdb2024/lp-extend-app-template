<template>
  <div
    class="ext-app-card"
    :class="{
      'ext-app-card--disabled': disabled,
      [`ext-app-card--${appMeta.category}`]: true,
    }"
    @click="handleClick"
    :style="minHeight ? { minHeight: `${Number(minHeight) + 10}px` } : {}"
  >
    <!-- Gradient border effect -->
    <div class="ext-card-border"></div>

    <!-- Card content -->
    <div
      class="ext-card-inner"
      :style="minHeight ? { minHeight: `${minHeight}px` } : {}"
    >
      <!-- Icon -->
      <div
        class="ext-card-icon"
        :class="`ext-card-icon--${appMeta.colour || 'primary'}`"
      >
        <q-icon :name="appMeta.icon || 'sym_o_apps'" size="24px" />
      </div>

      <!-- Content -->
      <div class="ext-card-content">
        <div class="ext-card-header">
          <h3 class="ext-card-title">{{ appMeta.title }}</h3>
          <div
            v-if="appMeta.requiresLp && disabled"
            class="ext-card-badge ext-card-badge--locked"
          >
            <q-icon name="sym_o_lock" size="12px" />
            <span>Requires Connection</span>
          </div>
          <div
            v-else-if="appMeta.appType === APP_TYPES.EXTERNAL"
            class="ext-card-badge ext-card-badge--external"
          >
            <q-icon name="sym_o_open_in_new" size="12px" />
            <span>External</span>
          </div>
        </div>
        <p class="ext-card-description">{{ appMeta.caption }}</p>
      </div>

      <!-- Arrow indicator -->
      <div class="ext-card-arrow" v-if="!disabled">
        <q-icon
          :name="disabled ? 'sym_o_lock' : 'sym_o_arrow_forward'"
          size="20px"
        />
      </div>
    </div>

    <!-- Disabled overlay -->
    <div v-if="disabled" class="ext-card-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import type { AppDefinition } from "src/interfaces";
import { APP_TYPES } from "src/router/routes";
import { computed } from "vue";
import type { RouteRecordNormalized } from "vue-router";

const props = defineProps<{
  app: RouteRecordNormalized;
  disabled: boolean;
  accountId: string | null;
  minHeight?: string | number;
}>();

const appMeta = computed((): AppDefinition => {
  return props.app.meta as unknown as AppDefinition;
});

const emit = defineEmits<{
  open: [app: RouteRecordNormalized];
}>();

const handleClick = () => {
  emit("open", props.app);
};
</script>

<style scoped lang="scss">
@use "sass:color";

// Theme colors
$cosmic-900: #0c1035;
$cosmic-800: #12184a;
$cosmic-700: #1c2464;
$cosmic-600: #283380;
$cosmic-500: #3548a0;
$cosmic-400: #5068c0;
$cosmic-300: #7890d8;
$cosmic-200: #a8b8e8;
$cosmic-100: #d8e0f5;
$cosmic-50: #f0f4fb;

$nebula-blue: #4169e8;
$nebula-purple: #8d46eb;
$nebula-pink: #e849b7;
$nebula-orange: #ff8c42;

.ext-app-card {
  min-width: 360px;
  height: 190px;
  position: relative;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover:not(.ext-app-card--disabled) {
    transform: translateY(-4px);

    .ext-card-border {
      opacity: 1;
    }

    .ext-card-inner {
      border-color: transparent;
    }

    .ext-card-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &--disabled {
    cursor: not-allowed;

    .ext-card-inner {
      opacity: 0.6;
    }

    .ext-card-icon {
      filter: grayscale(1);
    }
  }
}

.ext-card-border {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    $nebula-blue,
    $nebula-purple,
    $nebula-pink
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.ext-card-inner {
  height: 180px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  margin: 1px;
  background: white;
  border: 1px solid $cosmic-100;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.ext-card-icon {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
  transition: all 0.3s ease;

  // Color variants
  &--primary {
    background: linear-gradient(
      135deg,
      $nebula-blue,
      color.adjust($nebula-blue, $lightness: -10%)
    );
  }

  &--indigo {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
  }

  &--teal {
    background: linear-gradient(135deg, #14b8a6, #0d9488);
  }

  &--orange {
    background: linear-gradient(135deg, $nebula-orange, #f97316);
  }

  &--red {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  &--pink {
    background: linear-gradient(
      135deg,
      $nebula-pink,
      color.adjust($nebula-pink, $lightness: -10%)
    );
  }

  &--purple {
    background: linear-gradient(
      135deg,
      $nebula-purple,
      color.adjust($nebula-purple, $lightness: -10%)
    );
  }

  &--blue-grey {
    background: linear-gradient(135deg, #64748b, #475569);
  }
}

.ext-card-content {
  flex: 1;
  min-width: 0;
}

.ext-card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ext-card-title {
  margin: 0;
  font-family: "Sohne Breit", "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: $cosmic-900;
  line-height: 1.3;
}

.ext-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 0.625rem;
  font-weight: 500;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &--locked {
    background: rgba($cosmic-400, 0.1);
    color: $cosmic-500;
  }

  &--external {
    background: rgba($nebula-orange, 0.1);
    color: color.adjust($nebula-orange, $lightness: -10%);
  }
}

.ext-card-description {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: $cosmic-400;
}

.ext-card-arrow {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-top: 8px;
  color: $nebula-purple;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s ease;
}

.ext-card-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 16px;
}

// ========================================
// Dark theme
// ========================================
.body--dark {
  .ext-card-inner {
    background: rgba($cosmic-800, 0.8);
    border-color: $cosmic-700;
    backdrop-filter: blur(8px);
  }

  .ext-app-card:hover:not(.ext-app-card--disabled) {
    .ext-card-inner {
      background: rgba($cosmic-800, 0.95);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
  }

  .ext-card-title {
    color: white;
  }

  .ext-card-description {
    color: $cosmic-300;
  }

  .ext-card-badge--locked {
    background: rgba($cosmic-400, 0.15);
    color: $cosmic-300;
  }

  .ext-card-badge--external {
    background: rgba($nebula-orange, 0.15);
    color: $nebula-orange;
  }

  .ext-card-arrow {
    color: $nebula-pink;
  }
}
</style>
