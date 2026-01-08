<template>
  <q-page class="landing-page">
    <div class="landing-header">
      <div class="landing-title">
        <h1 class="ff-space-bold lp-theme-text">Welcome</h1>
        <p class="landing-subtitle">Select an application to get started</p>
      </div>
      <div class="landing-search">
        <q-input
          v-model="search"
          placeholder="Search applications..."
          :color="style.navButton"
          filled
          dense
          clearable
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="sym_o_search" />
          </template>
        </q-input>
      </div>
    </div>

    <div class="app-grid">
      <q-card
        v-for="route in filteredRoutes"
        :key="route.name ?? route.path ?? String(route)"
        flat
        class="app-card st-card"
      >
        <q-card-section class="app-card-header">
          <q-avatar
            class="app-icon br-8"
            :color="style.navButton"
            size="48px"
          >
            <q-icon color="white" :name="getIcon(route)" size="24px" />
          </q-avatar>
          <div class="app-title-section">
            <h3 class="app-title ff-space-bold">{{ getTitle(route) }}</h3>
          </div>
        </q-card-section>

        <q-card-section class="app-description">
          <p class="ff-space">{{ getCaption(route) }}</p>
        </q-card-section>

        <q-card-actions class="app-actions">
          <q-btn
            :to="getRoutePath(route)"
            :color="style.navButton"
            class="app-open-btn"
            unelevated
            no-caps
            label="Open"
            icon-right="sym_o_arrow_forward"
          />
        </q-card-actions>
      </q-card>

      <div v-if="filteredRoutes.length === 0" class="empty-state">
        <q-icon name="sym_o_search_off" size="64px" color="grey-5" />
        <h3>No applications found</h3>
        <p>Try adjusting your search term</p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/store-user';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteRecordRaw, RouteRecordNormalized } from 'vue-router';

type NavRoute = RouteRecordRaw | RouteRecordNormalized;

const { navRoutes, style } = storeToRefs(useUserStore());
const search = ref('');
const route = useRoute();
const accountId = ref<string | null>();

const filteredRoutes = computed(() => {
  if (!search.value || search.value.trim().length === 0) {
    return navRoutes.value;
  }
  const searchLower = search.value.toLowerCase().trim();
  return navRoutes.value.filter(r => {
    const title = getTitle(r).toLowerCase();
    const caption = getCaption(r).toLowerCase();
    return title.includes(searchLower) || caption.includes(searchLower);
  });
});

function getIcon(r: NavRoute): string {
  const meta = r?.meta as { icon?: string } | undefined;
  return meta?.icon ?? 'sym_o_apps';
}

function getTitle(r: NavRoute): string {
  const meta = r?.meta as { title?: string } | undefined;
  return String(meta?.title ?? r.name ?? r.path ?? '');
}

function getCaption(r: NavRoute): string {
  const meta = r?.meta as { caption?: string } | undefined;
  return meta?.caption ?? 'No description available';
}

function getRoutePath(r: NavRoute): string {
  if (r.path && accountId.value) {
    return r.path.replace(':accountId', accountId.value);
  }
  return r.path ?? '';
}

onMounted(() => {
  accountId.value = route.params.accountId as string;
});
</script>

<style scoped lang="scss">
.landing-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.landing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.landing-title {
  h1 {
    margin: 0;
    font-size: 1.75rem;
  }
}

.landing-subtitle {
  margin: 4px 0 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.landing-search {
  min-width: 280px;
  max-width: 400px;
}

.search-input {
  :deep(.q-field__control) {
    border-radius: 10px;
  }
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  flex: 1;
  align-content: start;
}

.app-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
}

.app-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 8px;
}

.app-icon {
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.3;
}

.app-description {
  flex: 1;
  padding-top: 0;

  p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.8;
    line-height: 1.5;
  }
}

.app-actions {
  padding-top: 8px;
  justify-content: flex-end;
}

.app-open-btn {
  border-radius: 8px;
  padding: 8px 16px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  opacity: 0.7;

  h3 {
    margin: 16px 0 8px;
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}
</style>
