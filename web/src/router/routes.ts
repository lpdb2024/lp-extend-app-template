import { ROUTE_NAMES, ROUTE_TITLES } from "src/constants";
import type { RouteRecordRaw } from "vue-router";

export enum APP_TYPES {
  LP = "lp",
  EXTERNAL = "external",
  INTERNAL = "internal",
}

export enum CATEGORIES {
  TOOLS = "tools",
  ANALYTICS = "analytics",
  AUTOMATION = "automation",
  INTEGRATION = "integration",
  OTHER = "other",
}

const routes: RouteRecordRaw[] = [
  {
    path: "/callback",
    component: () => import("layouts/EmptyLayout.vue"),
    children: [
      {
        name: ROUTE_NAMES.CALLBACK,
        meta: { title: ROUTE_TITLES[ROUTE_NAMES.CALLBACK], isPreAuth: true },
        path: "",
        component: () => import("pages/callbackPage.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("layouts/LayoutLogin.vue"),
    children: [
      {
        name: ROUTE_NAMES.LOGIN,
        meta: { title: ROUTE_TITLES[ROUTE_NAMES.LOGIN], isPreAuth: true },
        path: "",
        component: () => import("src/pages/LoginPageExtend.vue"),
      },
    ],
  },
  {
    path: "/logout",
    component: () => import("layouts/EmptyLayout.vue"),
    children: [
      {
        name: ROUTE_NAMES.LOGOUT,
        meta: { title: ROUTE_TITLES[ROUTE_NAMES.LOGOUT], isPreAuth: true },
        path: "",
        component: () => import("pages/LogoutPage.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/EmptyLayout.vue"),
    children: [
      {
        name: ROUTE_NAMES.INDEX,
        meta: {
          title: ROUTE_TITLES[ROUTE_NAMES.INDEX],
          requiresAuth: true,
        },
        path: "",
        component: () => import("pages/IndexPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export { routes };
export default routes;
