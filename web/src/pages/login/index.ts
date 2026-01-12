/**
 * Login Page
 *
 * This module exports the login page component for LP SSO authentication.
 *
 * The login page offers LivePerson SSO authentication only.
 * Users enter their LP account ID and are redirected to LP's login page.
 *
 * Shell Mode Note:
 * When the app is running inside LP Extend shell (iframe mode), the login page
 * is typically not shown because the parent shell handles authentication.
 * The auth guard automatically detects shell mode and uses shell-provided tokens.
 */

export { default as LoginPageLpOnly } from './LoginPageLpOnly.vue';

// Default export is the LP-only login page
export { default } from './LoginPageLpOnly.vue';
