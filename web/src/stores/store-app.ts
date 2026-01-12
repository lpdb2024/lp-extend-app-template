import { defineStore } from "pinia";
// import { API_ROUTES } from 'src/constants/routes'
// import ErrorService from 'src/services/ErrorService'
// import ApiService from 'src/services/ApiService'
// import { LocalStorageCache } from './session_storage'
// import { useAuthStore } from './store-auth'
import type { KVPObject, RouteMeta } from "src/interfaces";
import { colors } from "quasar";
import { AC_ROUTES, ACTION_KEYS, V2 } from "src/constants";
import ApiService from "src/services/ApiService";

const { getPaletteColor } = colors;
export interface AccountSettingDocument {
  id?: string;
  name: string;
  label: string;
  accountId: string;
  value: string;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
  updatedBy: string;
}

// Setting names constants
export const ACCOUNT_SETTING_NAMES = {
  AI_STUDIO_PROXY_FLOW: "aiStudioProxyFlow",
} as const;

export interface IAppState {
  accountId: string | null;
  dark: boolean;
  appRoutes: RouteMeta[];
  internalRoutes: RouteMeta[];
  appSearch: string;
  controlCenter: KVPObject;
  maximizedToggleQueueHealth: boolean;
  settings: KVPObject | null;
  windowWidth: number;
  windowHeight: number;
  miniState?: boolean;
  // Account settings keyed by accountId -> settingName -> value
  accountSettings: Record<string, Record<string, AccountSettingDocument>>;
}

export const useAppStore = defineStore("appStore", {
  state: (): IAppState => ({
    accountId: null,
    dark: false,
    appRoutes: [],
    internalRoutes: [],
    appSearch: "",
    maximizedToggleQueueHealth: false,
    controlCenter: {
      queueHealthCollapsed: false,
      agentStatusCollapsed: false,
      agentMeticsCollapsed: false,
      controlTowerCollapsed: false,
    },
    settings: null,
    windowWidth: 0,
    windowHeight: 0,
    miniState: true,
    accountSettings: {},
  }),
  persist: {
    storage: localStorage,
  },
  getters: {
    isDark: (state) => state.dark,
    apps: (state) => {
      // const users = useAuthStore().userData
      // if (!users) {
      //   return []
      // }

      if (!state.appSearch || state.appSearch === "") {
        return state.appRoutes;
      } else {
        return state.appRoutes.filter((route) => {
          return (
            route.name &&
            route.name.toLowerCase().includes(state.appSearch.toLowerCase())
          );
        });
      }
    },
    background: (state) => {
      if (state.dark) {
        return "~assets/backgrounds/bots-abstract-transparent.png";
      } else {
        return "url(assets/backgrounds/nexus-landing-01.png)";
      }
    },
    style: (state) => {
      const { dark } = state;
      // const dark = Dark.isActive
      // const background = state.dark ? 'assets/backgrounds/bots-abstract-transparent.png' : '~@assets/backgrounds/nexus-landing-01.png'

      return {
        // '--background': `url(${background})`,
        // '--background-image': background,
        "--isDark": dark ? "true" : "false",
        "--table-header": dark ? "#1b1d4d" : "#ffffff", // 1b1d4d <-darker
        "--table-color": dark ? "#ececec" : "#48495d",
        "--n-card-bg": dark ? "#33355d" : "#e4e5ec", // 1c1f51 <-darker
        "--n-glass": dark ? "#313369cf" : "#ffffffeb", // 1c1f51 <-darker
        "--route_nav": dark ? "#1b1d4d" : "#ffffff",
        "--n-text": dark ? "#afcdff" : "#616161",
        "--n-text-ld": dark ? "#ffffff" : "#757575",
        "--n-icon-ld": dark ? "#ffffff" : "#929bbd",
        "--n-nav-icon": dark ? "#68b6d5" : "#616161",
        "--n-blue-01": "#07093c",
        "--n-blue-02": "#1b1d4d",
        "--n-blue-03": "#2e2f5e", // 414d7a <- more greyish,
        "--lp-bg-theme-gradient": dark
          ? "linear-gradient(to right, #3863e5, #8d46eb)"
          : "linear-gradient(to right, #3863e5, #8d46eb, #e849b7)",
      };
    },
    colors: (state) => {
      const { dark } = state;
      return {
        mono: dark ? "white" : "black",
        inactiveChipColor: dark ? "grey-6" : "grey-6",
        tableChipColor: dark ? "info" : "indigo",
        infoText: dark ? "text-info" : "text-indigo",
        tableCaption: `text-${dark ? "info" : "indigo"}`,
        cardOverline: dark ? "info" : "indigo",
        info: dark ? "info" : "indigo",
        // tableCaption: dark ? getPaletteColor('info') : getPaletteColor('indigo')
      };
    },
  },
  actions: {
    setaccountId(accountId: string) {
      this.accountId = accountId;
    },
    setDark(dark: boolean) {
      this.dark = dark;
    },
    getColor(colorA: string, ColorB: string) {
      const { dark } = this;
      const a = colorA.includes("$")
        ? getPaletteColor(colorA.replace("$", ""))
        : colorA;
      const b = ColorB.includes("$")
        ? getPaletteColor(ColorB.replace("$", ""))
        : ColorB;
      return dark ? a : b;
    },
    async saveAppSettings(settings: KVPObject) {
      const { accountId } = this;
      if (!accountId) throw new Error("No accountId found");

      const actionKey = ACTION_KEYS.APP_SETTINGS_UPDATE;
      const url = AC_ROUTES.APP_SETTINGS_MANY(accountId);
      const { data } = await ApiService.put<KVPObject>(
        url,
        settings,
        actionKey
      );
      if (data) {
        console.info("App settings saved", data);
        this.settings = data;
      }
    },
    async getAppSettings() {
      const { accountId } = this;
      if (!accountId) throw new Error("No accountId found");
      const actionKey = ACTION_KEYS.APP_SETTINGS_GET;
      const url = AC_ROUTES.APP_SETTINGS(accountId);
      const { data } = await ApiService.get<KVPObject>(url, actionKey);
      if (data) {
        this.settings = data;
      }
      return data;
    },

    // ==========================================================================
    // Account-level settings (per LP account)
    // ==========================================================================

    /**
     * Get all settings for an account
     */
    async getAccountSettings(accountId: string): Promise<AccountSettingDocument[]> {
      try {
        const url = `${V2}/account-settings/${accountId}`;
        const { data } = await ApiService.get<AccountSettingDocument[]>(
          url,
          ACTION_KEYS.APP_SETTINGS_GET
        );

        // Store in state keyed by setting name
        if (data && Array.isArray(data)) {
          if (!this.accountSettings[accountId]) {
            this.accountSettings[accountId] = {};
          }
          for (const setting of data) {
            this.accountSettings[accountId][setting.name] = setting;
          }
        }

        return data || [];
      } catch (error) {
        console.warn("Failed to get account settings:", error);
        return [];
      }
    },

    /**
     * Get a specific setting value for an account
     */
    getAccountSettingValue(accountId: string, settingName: string): string | null {
      return this.accountSettings[accountId]?.[settingName]?.value || null;
    },

    /**
     * Save a setting for an account
     */
    async saveAccountSetting(
      accountId: string,
      name: string,
      label: string,
      value: string
    ): Promise<AccountSettingDocument> {

      const url = `${V2}/account-settings/${accountId}`;
      const { data } = await ApiService.put<AccountSettingDocument>(
        url,
        { name, label, value },
        ACTION_KEYS.APP_SETTINGS_UPDATE
      );

      // Update local state
      if (data) {
        if (!this.accountSettings[accountId]) {
          this.accountSettings[accountId] = {};
        }
        this.accountSettings[accountId][name] = data;
      }

      return data;
    },

    /**
     * Delete a setting for an account
     */
    async deleteAccountSetting(accountId: string, settingName: string): Promise<void> {
      const url = `${V2}/account-settings/${accountId}/${settingName}`;
      await ApiService.delete(url, ACTION_KEYS.APP_SETTINGS_UPDATE);

      // Remove from local state
      if (this.accountSettings[accountId]) {
        delete this.accountSettings[accountId][settingName];
      }
    },

    // async saveFiles (files: File[], path: string, name: string) {
    //   const { accountId } = useAuthStore()
    //   if (!accountId) {
    //     throw new Error('No account id found.')
    //   }
    //   const formData = new FormData()
    //   files.forEach((file) => {
    //     formData.append('files', file)
    //   })
    //   formData.append('path', path)
    //   formData.append('name', name)
    //   try {
    //     const actionKey = ACTION_KEYS.SAVE_FILES
    //     const url = API_ROUTES.IDEA_FILES(accountId)
    //     await ApiService.post(url, formData, actionKey, {
    //       'Content-Type': 'multipart/form-data'
    //     }, true)
    //   } catch (e) {
    //     ErrorService.handleRequestError(e)
    //   }
    // }
  },
});
