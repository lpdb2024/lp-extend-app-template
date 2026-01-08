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

### 1. Create Your Repository

Create a new empty repository on GitHub (or your git provider) for your new app. Do not initialize it with a README or any other files.

### 2. Clone the Template

```bash
git clone https://github.com/lpdb2024/lp-extend-app-template my-new-app
cd my-new-app
```

### 3. Disconnect from Template and Initialize Fresh Repo

```bash
# Remove the template's git history
rm -rf .git

# Initialize a fresh git repository
git init

# Add all files and create initial commit
git add .
git commit -m "Initial commit from LP App Template"

# Connect to your new repository and push
git remote add origin https://github.com/your-org/my-new-app.git
git branch -M main
git push -u origin main
```

### 4. Install Dependencies

```bash
# Install frontend dependencies
cd web
npm install

# Install backend dependencies
cd ../api
npm install
```

### 5. Configure Environment

Create a `.env` file in the `api/` folder:

```bash
# api/.env

# Server port
PORT=9001

# Shell JWT Secret (get from LP Extend Slack channel)
SHELL_JWT_SECRET="your-shell-jwt-secret"

# Cookie encryption secret (get from LP Extend Slack channel)
COOKIE_SECRET="your-cookie-secret"

# Salt token for hashing (get from LP Extend Slack channel)
SALT_TOKEN="your-salt-token"

# Firebase/Firestore (optional - only if using Firestore for data persistence)
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

#### Setting up Firebase (Optional)

The template is pre-configured to use Firestore for data persistence. If you want to use this feature:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Enable Firestore Database in the project

2. **Generate a Service Account**
   - In Firebase Console, go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

3. **Add to Environment**
   - Open the downloaded JSON file
   - Copy the entire JSON content
   - In `api/.env`, set `GOOGLE_SERVICE_ACCOUNT` to the JSON (as a single line):
   ```bash
   GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project",...}'
   ```

> **Note:** If you don't configure `GOOGLE_SERVICE_ACCOUNT`, the app will still run but Firestore features will be disabled.

#### Getting Secret Values

Contact the LP Extend team via Slack (channel TBC) to obtain values for:
- `SHELL_JWT_SECRET`
- `COOKIE_SECRET`
- `SALT_TOKEN`

### 6. Start Development

```bash
# Terminal 1: Start backend (from api/ folder)
cd api
npm run start:dev

# Terminal 2: Start frontend (from web/ folder)
cd web
npm run dev
```

- Frontend dev server: http://localhost:9000
- Backend API server: http://localhost:9001
- Swagger API docs: http://localhost:9001/api

> **Important:** Steps 2-3 disconnect your app from the template repository. This ensures you have a clean git history and won't accidentally push changes back to the template.

## Project Structure

```
lp-app-template/
├── web/                        # Vue 3 + Quasar frontend
│   ├── src/
│   │   ├── applications/       # Your app components go here
│   │   ├── components/         # Shared UI components
│   │   ├── composables/        # Vue composables (including shell bridge)
│   │   ├── constants/          # API routes, action keys
│   │   ├── stores/             # Pinia stores (all LP APIs)
│   │   └── services/           # ApiService, ErrorService
│   └── package.json
│
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── Controllers/
│   │   │   └── LivePerson/     # All LP API modules
│   │   └── firestore/          # Firebase integration
│   ├── public/                 # Built frontend served by NestJS
│   ├── .env                    # Environment configuration
│   └── package.json
│
├── docs/
│   └── AUTHENTICATION_GUIDE.md # Authentication documentation
│
├── Dockerfile                  # Docker build configuration
├── docker-compose.yml          # Docker compose for local testing
└── cloudbuild.yaml             # Google Cloud Build configuration
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
import { useShellBridge } from "@/composables/useShellBridge";

const { inShellMode, isAuthenticated, getAuthHeaders } = useShellBridge({
  appId: "my-app-id",
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
import { defineStore } from "pinia";
import ApiService from "src/services/ApiService";
import { MY_APP_ROUTES, MY_APP_ACTION_KEYS } from "src/constants";

export const useMyAppStore = defineStore("myApp", {
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
    },
  },
});
```

## Development Commands

```bash
# Frontend (from web/ folder)
cd web
npm run dev           # Start Vite dev server on port 9000
npm run build         # Production build (outputs to api/public/)
npm run lint          # Run ESLint

# Backend (from api/ folder)
cd api
npm run start:dev     # Start NestJS with hot reload on port 9001
npm run build         # Production build
npm run lint          # Run ESLint

# Docker (from root)
docker-compose build  # Build Docker image
docker-compose up     # Run in Docker locally
```

## Production Build

To build the frontend and serve it from NestJS:

```bash
# Build frontend (outputs to api/public/)
cd web
npm run build

# Build and start backend
cd ../api
npm run build
npm run start:prod
```

The app will be available at http://localhost:9001

## Application Tiers

When registering your app with the shell, specify the appropriate tier:

| Tier | Use Case                               |
| ---- | -------------------------------------- |
| 1    | Full product suite (multiple features) |
| 2    | Targeted solution (specific workflow)  |
| 3    | Single-feature tool                    |

## License

MIT
