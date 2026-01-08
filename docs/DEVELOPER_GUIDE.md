# LP App Template - Developer Guide

This guide covers everything you need to know to build LivePerson platform applications.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Development](#frontend-development)
3. [Backend Development](#backend-development)
4. [LP API Integration](#lp-api-integration)
5. [Shell Integration](#shell-integration)
6. [Deployment](#deployment)

---

## Architecture Overview

### Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- TypeScript
- Quasar Framework
- Pinia (State Management)

**Backend:**
- NestJS
- TypeScript
- Firebase (Firestore, Auth)
- LivePerson APIs

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vue Frontend  │────▶│  NestJS Backend │────▶│  LivePerson API │
│                 │     │                 │     │                 │
│  Pinia Stores   │◀────│  LP Services    │◀────│  (Various)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      ▼
         │              ┌─────────────────┐
         └─────────────▶│    Firestore    │
                        │  (App Data)     │
                        └─────────────────┘
```

---

## Frontend Development

### Project Structure

```
src/
├── applications/       # Feature modules
│   └── MyApp/
│       ├── MyApp.vue
│       ├── components/
│       └── types/
├── components/         # Shared components
│   └── common-ui/
├── composables/        # Vue composables
├── constants/          # Routes, action keys
├── router/             # Vue Router
├── services/           # API, Error services
├── stores/             # Pinia stores
└── styles/             # Global styles
```

### Creating a Store

Every feature should have its own Pinia store:

```typescript
// src/stores/store-my-feature.ts
import { defineStore } from 'pinia';
import { useUserStore } from './store-user';
import ApiService from 'src/services/ApiService';
import ErrorService from 'src/services/ErrorService';
import { MY_FEATURE_ROUTES, MY_FEATURE_ACTION_KEYS } from 'src/constants';

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);

interface MyItem {
  id: string;
  name: string;
  // ...
}

interface MyFeatureState {
  items: MyItem[];
  loading: {
    items: boolean;
    creating: boolean;
  };
}

export const useMyFeatureStore = defineStore('myFeature', {
  state: (): MyFeatureState => ({
    items: [],
    loading: {
      items: false,
      creating: false,
    },
  }),

  getters: {
    accountId(): string | null {
      return useUserStore().accountId;
    },
  },

  actions: {
    async fetchItems() {
      const accountId = this.accountId;
      if (!accountId) return [];

      this.loading.items = true;
      try {
        const { data } = await ApiService.get<MyItem[]>(
          MY_FEATURE_ROUTES.LIST(accountId),
          MY_FEATURE_ACTION_KEYS.LIST
        );
        this.items = data;
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      } finally {
        this.loading.items = false;
      }
    },
  },
});
```

### Creating Constants

```typescript
// src/constants/constants.my-feature.ts
import { V1 } from './constants';

const BASE = `${V1}/my-feature`;

export const MY_FEATURE_ROUTES = {
  LIST: (accountId: string) => `${BASE}/${accountId}`,
  ITEM: (accountId: string, id: string) => `${BASE}/${accountId}/${id}`,
};

export enum MY_FEATURE_ACTION_KEYS {
  LIST = 'MY_FEATURE_LIST',
  CREATE = 'MY_FEATURE_CREATE',
  UPDATE = 'MY_FEATURE_UPDATE',
  DELETE = 'MY_FEATURE_DELETE',
}
```

### Using CSS Helpers

The template includes utility CSS classes:

```html
<!-- Flexbox -->
<div class="fc">Column layout</div>
<div class="fr">Row layout</div>
<div class="f-1">Flex grow</div>

<!-- Alignment -->
<div class="ai-c">Align items center</div>
<div class="jc-c">Justify content center</div>
<div class="jc-sb">Justify space between</div>

<!-- Spacing (multiples of 4px) -->
<div class="p-16">Padding 16px</div>
<div class="m-8">Margin 8px</div>
<div class="g-12">Gap 12px</div>

<!-- Sizing -->
<div class="h-100-p">Height 100%</div>
<div class="w-100-p">Width 100%</div>
```

---

## Backend Development

### Module Structure

```
src/Controllers/
├── LivePerson/           # LP API integrations
│   ├── shared/           # Base services, domain resolver
│   ├── AccountConfig/    # Skills, Users, etc.
│   └── MessagingHistory/ # Conversations
├── MyFeature/            # Your feature
│   ├── my-feature.controller.ts
│   ├── my-feature.service.ts
│   ├── my-feature.dto.ts
│   └── my-feature.module.ts
└── app.module.ts
```

### Creating a Controller

```typescript
// src/Controllers/MyFeature/my-feature.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MyFeatureService } from './my-feature.service';
import { CreateItemDto } from './my-feature.dto';

@ApiTags('My Feature')
@Controller('api/v1/my-feature')
export class MyFeatureController {
  constructor(private readonly service: MyFeatureService) {}

  @Get(':accountId')
  @ApiOperation({ summary: 'List all items' })
  async list(@Param('accountId') accountId: string) {
    return this.service.findAll(accountId);
  }

  @Post(':accountId')
  @ApiOperation({ summary: 'Create item' })
  async create(
    @Param('accountId') accountId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.service.create(accountId, dto);
  }
}
```

### Creating a Service

```typescript
// src/Controllers/MyFeature/my-feature.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CollectionReference } from 'firebase-admin/firestore';
import { MyFeatureDto, MyItemDocument } from './my-feature.dto';

@Injectable()
export class MyFeatureService {
  constructor(
    @InjectPinoLogger(MyFeatureService.name)
    private readonly logger: PinoLogger,
    @Inject(MyFeatureDto.collectionName)
    private collection: CollectionReference<MyItemDocument>,
  ) {}

  async findAll(accountId: string): Promise<MyItemDocument[]> {
    const fn = 'findAll';
    try {
      const snapshot = await this.collection
        .where('accountId', '==', accountId)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.logger.error({ fn, accountId, error }, 'Failed to fetch items');
      throw error;
    }
  }
}
```

### Registering Firestore Collection

```typescript
// src/firestore/firestore.providers.ts
export const FirestoreCollectionProviders: string[] = [
  MyFeatureDto.collectionName,
  // ... other collections
];
```

---

## LP API Integration

### Using LP Services

All LP API integrations extend `LPBaseService`:

```typescript
// In your service
import { LPSkillsService } from '../LivePerson/AccountConfig/skills/skills.service';

@Injectable()
export class MyService {
  constructor(private readonly skillsService: LPSkillsService) {}

  async doSomethingWithSkills(accountId: string) {
    const skills = await this.skillsService.getSkills(accountId);
    // Use skills data
  }
}
```

### Available LP Services

| Service | Domain | Description |
|---------|--------|-------------|
| `LPSkillsService` | AccountConfig | Skills CRUD |
| `LPUsersService` | AccountConfig | Users/Agents CRUD |
| `LPAgentGroupsService` | AccountConfig | Agent groups |
| `LPPredefinedContentService` | AccountConfig | Canned responses |
| `LPAutomaticMessagesService` | AccountConfig | Auto messages |
| `LPConversationsService` | MessagingHistory | Conversation search |

---

## Shell Integration

### Detecting Shell Mode

```typescript
import { useShellBridge } from '@/composables/useShellBridge';

const { inShellMode, isAuthenticated } = useShellBridge({
  appId: 'my-app',
});

if (inShellMode.value) {
  // Running inside LP Platform Shell
} else {
  // Running standalone
}
```

### Adding Auth Headers

```typescript
const { getAuthHeaders } = useShellBridge({ appId: 'my-app' });

// Include in API calls
const headers = {
  ...getAuthHeaders(),
  'Content-Type': 'application/json',
};
```

---

## Deployment

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Frontend build output: services/frontend/dist
# Backend build output: services/backend/dist
```

### Environment Variables

Create `.env` files for each environment:

**Frontend (.env)**
```
VITE_API_URL=https://api.myapp.com
VITE_SHELL_ORIGIN=https://shell.lpplatform.com
```

**Backend (.env)**
```
FIREBASE_PROJECT_ID=my-project
FIREBASE_PRIVATE_KEY=...
PORT=3001
```

### Registering with Shell

Contact the platform team to register your app:

```json
{
  "id": "my-app",
  "name": "My Application",
  "tier": 2,
  "url": "https://my-app.example.com",
  "icon": "sym_o_widgets",
  "permissions": [
    "skills:read",
    "conversations:read"
  ]
}
```
