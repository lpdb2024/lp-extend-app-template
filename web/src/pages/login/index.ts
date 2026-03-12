/**
 * Login Pages
 *
 * - LoginPage: Multi-auth login page (Agent Login + SSO, controlled by VITE_AUTH_STRATEGY)
 * - LoginPageLpOnly: LP SSO only login page (legacy)
 *
 * The default export is LoginPage, which supports:
 * - VITE_AUTH_STRATEGY='agent-login' → Agent Login only (username/password)
 * - VITE_AUTH_STRATEGY='sso' → LP SSO only
 * - VITE_AUTH_STRATEGY='independent' → Both methods (tabbed)
 * - VITE_AUTH_STRATEGY='shell' → Login page not shown (shell handles auth)
 */

export { default as LoginPage } from './LoginPage.vue';
export { default as LoginPageLpOnly } from './LoginPageLpOnly.vue';

// Default export is the multi-auth login page
export { default } from './LoginPage.vue';
