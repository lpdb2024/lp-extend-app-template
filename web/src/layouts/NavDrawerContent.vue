<template>
  <div class="nav-drawer-content">
    <div class="nav-search-container">
      <q-input
        v-model="search"
        placeholder="Search apps..."
        :color="style.navButton"
        filled
        dense
        clearable
        class="nav-search-input"
      >
        <template v-slot:prepend>
          <q-icon name="sym_o_search" size="sm" />
        </template>
      </q-input>
    </div>

    <q-list class="nav-list">
      <q-item
        v-for="route in filteredRoutes"
        :key="route.path"
        :to="routePath(route.path)"
        clickable
        class="nav-item"
        active-class="nav-item-active"
      >
        <q-item-section side>
          <q-avatar
            square
            :color="style.navButton"
            class="nav-avatar br-6"
            size="36px"
          >
            <q-icon
              color="white"
              :name="(route?.meta as AppRouteMeta)?.icon || 'sym_o_apps'"
              size="20px"
            />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="nav-item-title ff-space-bold">
            {{ (route?.meta as AppRouteMeta)?.title || route.name }}
          </q-item-label>
          <q-item-label caption class="nav-item-caption ff-space">
            {{ (route?.meta as AppRouteMeta)?.caption || '' }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-if="filteredRoutes.length === 0" class="nav-empty-state">
        <q-item-section class="ta-c">
          <q-icon name="sym_o_search_off" size="32px" color="grey-5" class="mb-10" />
          <q-item-label class="text-grey-6">No apps found</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import type { AppRouteMeta } from 'src/interfaces';
import { useUserStore } from 'src/stores/store-user';
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'
import type { RouteRecordRaw, RouteRecordNormalized } from 'vue-router'

const { style } = storeToRefs(useUserStore());

interface Props {
  navRoutes: (RouteRecordRaw | RouteRecordNormalized)[]
}
const props = defineProps<Props>()

const router = useRouter()
const search = ref('');

const filteredRoutes = computed(() => {
  if (!search.value || search.value.trim().length === 0) {
    return props.navRoutes;
  }
  const searchLower = search.value.toLowerCase().trim();
  return props.navRoutes.filter(route => {
    const meta = route?.meta as AppRouteMeta | undefined;
    const title = (meta?.title || route.name || '').toString().toLowerCase();
    const caption = (meta?.caption || '').toString().toLowerCase();
    return title.includes(searchLower) || caption.includes(searchLower);
  });
});

function routePath(path: string) {
  const route = router.resolve(path);
  const accountId = router.currentRoute.value.params.accountId as string | undefined;
  if (accountId && route.path.includes(':accountId')) {
    return route.path.replace(':accountId', accountId);
  }
  return route.path;
}
</script>

<style scoped lang="scss">
.nav-drawer-content {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-search-container {
  margin-bottom: 16px;
  padding-top: 8px;
}

.nav-search-input {
  :deep(.q-field__control) {
    border-radius: 8px;
  }
}

.nav-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.nav-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &.nav-item-active {
    background: rgba(56, 99, 229, 0.1);
  }
}

.body--dark {
  .nav-item {
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &.nav-item-active {
      background: rgba(49, 204, 236, 0.15);
    }
  }
}

.nav-avatar {
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-avatar {
  transform: scale(1.05);
}

.nav-item-title {
  font-size: 0.9rem;
  line-height: 1.3;
}

.nav-item-caption {
  font-size: 0.75rem;
  opacity: 0.7;
}

.nav-empty-state {
  padding: 32px 16px;
  flex-direction: column;
}
</style>
