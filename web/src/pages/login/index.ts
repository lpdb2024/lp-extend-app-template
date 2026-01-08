/**
 * Login Page Variants
 *
 * This module exports different login page variants that developers can choose from
 * when building their application. Each variant offers different authentication methods.
 *
 * Available Variants:
 *
 * 1. LoginPageFull (default)
 *    - Firebase Auth: Google OAuth + Email/Password
 *    - LP SSO: Direct LivePerson authentication
 *    - Best for: Applications that need maximum flexibility
 *
 * 2. LoginPageLpOnly
 *    - LP SSO only
 *    - Best for: Internal LP tools, applications exclusively for LP users
 *
 * 3. LoginPageGoogleOnly
 *    - Google OAuth only (via Firebase)
 *    - Best for: Simple apps, quick onboarding, consumer-facing apps
 *
 * Usage:
 *
 * In your router/routes.ts, import the desired variant:
 *
 * ```typescript
 * // Option 1: Full login page (default)
 * import LoginPage from 'src/pages/login/LoginPageFull.vue';
 *
 * // Option 2: LP SSO only
 * import LoginPage from 'src/pages/login/LoginPageLpOnly.vue';
 *
 * // Option 3: Google only
 * import LoginPage from 'src/pages/login/LoginPageGoogleOnly.vue';
 *
 * // Then use in routes:
 * {
 *   path: '/login',
 *   name: 'login',
 *   component: LoginPage,
 * }
 * ```
 *
 * Shell Mode Note:
 * When the app is running inside LP Extend shell (iframe mode), the login page
 * is typically not shown because the parent shell handles authentication.
 * The auth guard automatically detects shell mode and uses shell-provided tokens.
 */

export { default as LoginPageFull } from './LoginPageFull.vue';
export { default as LoginPageLpOnly } from './LoginPageLpOnly.vue';
export { default as LoginPageGoogleOnly } from './LoginPageGoogleOnly.vue';

// Default export is the full login page
export { default } from './LoginPageFull.vue';
