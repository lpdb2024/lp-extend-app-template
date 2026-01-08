/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from "src/services/ApiService";
import type {
  RouteRecordName,
  RouteRecordNormalized,
  RouteRecordRaw,
} from "vue-router";
import ErrorService from "src/services/ErrorService";
const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);
import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";
// import { encrypt } from 'src/functions/common'

import { Dark } from "quasar";
// import type {
//   ROLES} from 'src/constants';
import type { ROLES } from "src/constants";
import { ACTION_KEYS, API_ROUTES, USER_ROUTES } from "src/constants";
import type {
  baseURI,
  IClaims,
  CCUser,
  UserData,
  ISkillInfo,
  AppUser,
  KVPObject,
} from "src/interfaces";
import { createDomainInfo } from "src/utils/functions";
import { useAppStore } from "./store-app";

interface IUserState {
  onLoginPage: boolean;
  proactiveToken: string | null;
  users: UserData[];
  appName: string;
  dark: boolean;
  appRoute: string | null;
  auth: IClaims | null;
  baseURIs: baseURI[];
  user: AppUser | null;
  services: any;
  zone: string | null;
  region: string | null;
  accountId: string | null;
  accessToken?: string | null;
  count: number;
  skills: ISkillInfo[];
  skillAcRevision: string | null;
  navRoutes: (RouteRecordRaw | RouteRecordNormalized)[];
  proactiveCredentials: {
    client_id: string | null;
    client_secret: string | null;
  };
}
export const useUserStore = defineStore("users", {
  state: (): IUserState => ({
    onLoginPage: false,
    proactiveToken: null,
    appName: "Solutions Toolkit",
    count: 0,
    dark: false,
    appRoute: null,
    users: [],
    user: null,
    accessToken: null,
    auth: null,
    baseURIs: [],
    services: null,
    zone: null,
    region: null,
    accountId: null,
    skillAcRevision: null,
    skills: [],
    navRoutes: [],
    proactiveCredentials: {
      client_id: null,
      client_secret: null,
    },
  }),
  persist: {
    storage: localStorage,
  },
  getters: {
    hasRole: (state) => (allowedRoles: ROLES[]) =>
      !!state.user?.roles.some((role) =>
        allowedRoles.some((allowedRole) => allowedRole === role)
      ),
    style: (state) => {
      const { dark } = state;
      // const dark = Dark.isActive
      return {
        "--isDark": dark ? "true" : "false",
        "--table-header": dark ? "#1b1d4d" : "#ffffff", // 1b1d4d <-darker
        "--table-color": dark ? "#ececec" : "#48495d",
        "--stk-card-bg": dark ? "#33355d" : "#e4e5ec", // 1c1f51 <-darker
        "--route_nav": dark ? "#1b1d4d" : "#ffffff",
        "--stk-text": dark ? "#afcdff" : "#616161",
        "--stk-text-ld": dark ? "#ffffff" : "#757575",
        "--stk-icon-ld": dark ? "#ffffff" : "#929bbd",
        "--stk-nav-icon": dark ? "#68b6d5" : "#616161",
        "--stk-blue-01": "#07093c",
        "--stk-blue-02": "#1b1d4d",
        "--stk-blue-03": "#2e2f5e", // 414d7a <- more greyish,
        dialogButton: dark ? "info" : "indigo",
        navButton: dark ? "info" : "deep-orange",
      };
    },
  },
  actions: {
    setDark(dark: boolean) {
      this.dark = dark;
      this.$patch({
        dark,
      });
      Dark.set(dark);
      useAppStore().setDark(dark);
    },
    setAppRoute(appRoute: string) {
      this.appRoute = appRoute;
    },
    removeAppRoute() {
      this.appRoute = null;
    },
    setaccountId(accountId: string) {
      this.accountId = accountId;
    },
    incrementCount() {
      this.count++;
    },
    getToken() {
      return this.accessToken;
    },
    lpService(service: string) {
      if (!this.services) return;
      const s: string = this.services[service] || null;
      return s;
    },
    async getlpDomains(
      site: string | null,
      hideNotification?: boolean
    ): Promise<baseURI[] | null> {
      try {
        const accountId: string | null =
          site || sessionStorage.getItem("accountId");
        if (!accountId) {
          throw new Error("No accountId found");
        }
        this.accountId = accountId;
        const actionKey = ACTION_KEYS.GET_DOMAINS;
        const url = API_ROUTES.DOMAINS_BY_ID(accountId);
        const { data } = await ApiService.get<any>(url, actionKey);
        console.info(data);
        const domainInfo = createDomainInfo(data.baseURIs);
        this.$patch((state) => {
          state.baseURIs = Array.isArray(data.baseURIs) ? data.baseURIs : [];
          state.region =
            typeof domainInfo.region === "string" ? domainInfo.region : null;
          state.zone =
            typeof domainInfo.zone === "string" ? domainInfo.zone : null;
          state.services =
            typeof domainInfo.services === "object" &&
            domainInfo.services !== null
              ? domainInfo.services
              : {};
        });
        return data;
      } catch (error) {
        if (!hideNotification) {
          handleRequestError(error, true);
        }
        return null;
      }
    },
    authRedirect() {
      const domain = this.lpService("sentinel");
      const REDIRECT = `${location.origin}/callback`;
      return `https://${domain}/sentinel/api/account/${this.accountId}/authorize?v=1.0&response_type=code&redirect_uri=${REDIRECT}&client_id=${process.env.VUE_APP_CLIENT_ID}`;
    },
    async logout(): Promise<any> {
      const { accountId } = this;
      try {
        if (!accountId) throw new Error("No accountId found");
        const actionKey = ACTION_KEYS.LOGOUT;
        const url = API_ROUTES.LOGOUT(accountId);
        await ApiService.get<any>(url, actionKey);
        this.$reset();
        return true;
      } catch (error) {
        handleRequestError(error, true);
      } finally {
        this.$reset();
        window.location.href = "/login";
      }
    },
    async getSentinelUrl(
      accountId: string,
      appRoute?: RouteRecordName | string | null
    ): Promise<string | null> {
      try {
        if (!accountId) throw new Error("No accountId found");
        this.$patch({
          accountId,
        });
        this.accountId = accountId;

        const actionKey = ACTION_KEYS.LOGIN;
        let url = API_ROUTES.LOGIN_URL(accountId);
        if (appRoute) {
          url += `?appRoute=${String(appRoute)}`;
        }

        const { data } = await ApiService.get<any>(url, actionKey);
        this.$patch({
          user: data,
        });
        return data.url;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async authApp(code: string, redirect: string): Promise<any> {
      const { accountId } = this;
      try {
        if (!accountId) throw new Error("No accountId found");
        const actionKey = ACTION_KEYS.REQUEST_AUTH;
        const url = API_ROUTES.TOKEN(accountId);
        const { data } = await ApiService.post<any>(
          url,
          {
            "Content-Type": "application/x-www-form-urlencoded",
            redirect,
            code,
            appname: "DEMO_BUILDER",
          },
          actionKey
        );

        data.decoded = jwtDecode(data.idToken);
        console.info(data);

        const AUTH = data;
        // Use expiry timestamp from backend if available, otherwise calculate from expiresIn (hours)
        // Backend returns expiry as a timestamp in milliseconds
        // Backend returns expiresIn in HOURS (data.expires_in / 3600)
        const expiresAt = data.expiry || (Date.now() + (data.expiresIn * 3600 * 1000));
        AUTH.expiresAt = expiresAt;

        // Add expiresAt to decoded claims so it persists with auth state
        const authClaims = {
          ...data.decoded,
          expiresAt: expiresAt,
        };

        this.$patch({
          auth: authClaims,
          accessToken: AUTH.accessToken,
        });
        window.sessionStorage.setItem("sub", data.decoded.sub);

        // Also set LP session in firebase auth store for UI state sync
        const { useFirebaseAuthStore } = await import('./store-firebase-auth');
        const firebaseAuth = useFirebaseAuthStore();

        console.info('[LP Auth] Setting LP session:', {
          accountId,
          tokenExpiry: AUTH.expiresAt,
          expiresIn: data.expiresIn,
          expiryFromBackend: data.expiry,
          expiresInMinutes: Math.round((AUTH.expiresAt - Date.now()) / 60000),
        });

        firebaseAuth.setLpSession({
          accountId: accountId,
          accessToken: AUTH.accessToken,
          tokenExpiry: AUTH.expiresAt,
          lpUserId: data.decoded?.sub || null,
          isLPA: data.decoded?.isLPA || false,
          cbToken: data.cbToken || undefined,
          cbOrg: data.cbOrg || undefined,
        });

        await this.getSelf();
        return data;
      } catch (error) {
        handleRequestError(error, true);
      }
    },
    async getUserById(id: string): Promise<CCUser | null> {
      try {
        const domain = this.lpService("accountConfigReadWrite");
        const { accountId } = this;

        if (!id) throw new Error("No id found");
        if (!accountId) throw new Error("No accountId found");
        if (!domain) throw new Error("No domain found");

        const actionKey = ACTION_KEYS.GET_USER_DATA;
        const url = API_ROUTES.USERS_BY_ID(accountId, id);
        const { data } = await ApiService.get<any>(url, actionKey);
        this.$patch({
          user: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getUsers(): Promise<CCUser[] | []> {
      try {
        const { accountId } = this;
        if (!accountId) throw new Error("No accountId found");
        const actionKey = ACTION_KEYS.GET_USER_DATA;
        const url = USER_ROUTES.USERS(accountId);
        const { data } = await ApiService.get<any>(url, actionKey, undefined);
        this.$patch({
          users: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    findUser(id: string): UserData | null {
      if (!id) return null;
      if (!this.users || this.users.length === 0) return null;
      const user = this.users.find((u) => String(u.uid) === id);
      return user || null;
    },
    async getSelf(): Promise<CCUser | null> {
      try {
        const { accountId } = this;
        if (!accountId) throw new Error("No accountId found");
        const actionKey = ACTION_KEYS.GET_USER_DATA;
        const url = USER_ROUTES.SELF(accountId);
        const { data } = await ApiService.get<any>(url, actionKey);
        this.$patch({
          user: data,
        });
        return data;
      } catch {
        return null;
      }
    },

    async setProactiveCredentials(): Promise<KVPObject> {
      try {
        const { accountId } = this;
        if (!accountId) throw new Error("No accountId found");
        const actionKey = ACTION_KEYS.SAVE_CREDENTIALS;
        const url = USER_ROUTES.CREDENTIALS(accountId);
        const payload = {
          accountId: accountId,
          proactive: this.proactiveCredentials,
        };
        console.info(payload);
        const { data } = await ApiService.post<any>(url, payload, actionKey);
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return {};
      }
    },
    async getProactiveCredentials(): Promise<KVPObject> {
      try {
        const { accountId } = this;
        if (!accountId) throw new Error("No accountId found");
        const actionKey = ACTION_KEYS.GET_USER_DATA;
        const url = USER_ROUTES.CREDENTIALS(accountId);
        const { data } = await ApiService.get<any>(url, actionKey);
        const proactive = data.proactive;
        // Only update if proactive credentials exist, otherwise keep defaults
        if (proactive && typeof proactive === 'object') {
          this.$patch({
            proactiveCredentials: {
              client_id: proactive.client_id ?? null,
              client_secret: proactive.client_secret ?? null,
            },
          });
        }
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return {};
      }
    },
    async getProactiveAppJWT() {
      try {
        if (!this.accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS.GET_PROACTIVE_APP_JWT;
        const url = API_ROUTES.PROACTIVE_APP_JWT(this.accountId);
        const { data } = await ApiService.get<any>(url, actionKey);
        this.proactiveToken = data.access_token;
        return data.access_token;
      } catch (error) {
        handleRequestError(error, true);
      }
    },
  },
});
