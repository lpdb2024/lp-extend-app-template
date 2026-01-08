# LP App Template

A starter template for building LivePerson platform applications with full LP API integration.

## Features

- Vue 3 + TypeScript + Quasar frontend
- NestJS + TypeScript backend
- All LivePerson API integrations pre-configured
- Pinia stores for all LP domains
- Firebase authentication
- Shell bridge for platform integration

## Quick Start

```bash
# Clone this template
git clone https://github.com/your-org/lp-app-template my-new-app
cd my-new-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase and LP credentials

# Start development
npm run dev
```

## Project Structure

```
lp-app-template/
├── services/
│   ├── frontend/               # Vue 3 + Quasar frontend
│   │   ├── src/
│   │   │   ├── applications/   # Your app components go here
│   │   │   ├── components/     # Shared UI components
│   │   │   ├── composables/    # Vue composables (including shell bridge)
│   │   │   ├── constants/      # API routes, action keys
│   │   │   ├── stores/         # Pinia stores (all LP APIs)
│   │   │   └── services/       # ApiService, ErrorService
│   │   └── package.json
│   │
│   └── backend/                # NestJS backend
│       ├── src/
│       │   ├── Controllers/
│       │   │   └── LivePerson/ # All LP API modules
│       │   └── firestore/      # Firebase integration
│       └── package.json
│
├── docs/
│   └── DEVELOPER_GUIDE.md      # Comprehensive development guide
│
└── package.json                # Root package (workspace)
```

## Available LP Stores

### Account Configuration
- `useSkillsStore` - Skills management
- `useUsersStore` - User/agent management
- `useAgentGroupsStore` - Agent group management
- `usePredefinedContentStore` - Predefined content
- `useAutomaticMessagesStore` - Automatic messages
- `useLobsStore` - Lines of business

### Messaging
- `useConversationsStore` - Messaging history, transcripts

### Proactive
- `useProactiveStore` - Proactive campaigns

## Shell Integration

When running inside the LP Platform Shell, use the shell bridge:

```typescript
import { useShellBridge } from '@/composables/useShellBridge';

const { inShellMode, isAuthenticated, getAuthHeaders } = useShellBridge({
  appId: 'my-app-id',
});

// API calls automatically include shell auth headers
const headers = getAuthHeaders();
```

## Creating Your First App

1. Create your main component in `src/applications/MyApp/`:

```vue
<template>
  <q-page class="fc">
    <ExtPageHeader
      category="My Category"
      title="My App"
      caption="Description of my app"
    />

    <div class="f-1 p-16">
      <!-- Your app content -->
    </div>
  </q-page>
</template>
```

2. Add route in `src/router/routes.ts`:

```typescript
{
  path: '/my-app',
  name: 'my-app',
  component: () => import('src/applications/MyApp/MyApp.vue'),
  meta: { requiresAuth: true }
}
```

3. Create Pinia store in `src/stores/store-my-app.ts`:

```typescript
import { defineStore } from 'pinia';
import ApiService from 'src/services/ApiService';
import { MY_APP_ROUTES, MY_APP_ACTION_KEYS } from 'src/constants';

export const useMyAppStore = defineStore('myApp', {
  state: () => ({
    items: [],
    loading: false,
  }),

  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        const { data } = await ApiService.get(
          MY_APP_ROUTES.LIST(accountId),
          MY_APP_ACTION_KEYS.LIST
        );
        this.items = data;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

## Development Commands

```bash
# Frontend
cd services/frontend
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run ESLint

# Backend
cd services/backend
npm run start:dev     # Start with hot reload
npm run build         # Production build
npm run lint          # Run ESLint

# Both (from root)
npm run dev           # Start both frontend and backend
npm run build         # Build both
```

## Application Tiers

When registering your app with the shell, specify the appropriate tier:

| Tier | Use Case |
|------|----------|
| 1 | Full product suite (multiple features) |
| 2 | Targeted solution (specific workflow) |
| 3 | Single-feature tool |

## License

MIT
