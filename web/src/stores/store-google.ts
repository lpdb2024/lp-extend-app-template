/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from "src/services/ApiService";
import { useUserStore } from "./store-user";
import { defineStore } from "pinia";
import ErrorService from "src/services/ErrorService";
const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);
import { Notify } from "quasar";
import {
  ACTION_KEYS,
  GOOGLE_ACTION_KEYS,
  GOOGLE_CLOUD_ROUTES,
  API_ROUTES,
} from "src/constants";
import { useRoute } from "vue-router";
import { uuid } from "short-uuid";

const route = useRoute();
interface IGoogleHeaders {
  bucket?: string;
  name?: string;
  path?: string;
}
interface IGoogleState {
  loaded: boolean;
  accountId?: string | null;
  files: any[];
  appResources: any[];
  demoFiles: {
    files: any[];
    id?: string | null;
  };
}
export const useGoogleStore = defineStore("google", {
  state: (): IGoogleState => ({
    loaded: false,
    accountId: null,
    files: [],
    appResources: [],
    demoFiles: {
      files: [],
      id: null,
    },
  }),
  getters: {},
  actions: {
    getaccountId() {
      const accountId =
        (route?.query?.accountId ? String(route.query.accountId) : null) ||
        useUserStore().accountId ||
        sessionStorage.getItem("accountId");
      if (!this.accountId || !accountId || accountId !== this.accountId) {
        this.$reset();
      }
      this.accountId = accountId;
      return accountId;
    },
    async getAppAssets(useCache?: boolean): Promise<any[] | []> {
      if (useCache && this.appResources.length > 0) {
        return this.appResources;
      }
      try {
        this.$patch({
          appResources: [],
        });
        const accountId = this.getaccountId();
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = GOOGLE_ACTION_KEYS.GET_STORAGE_FILES;
        const url = GOOGLE_CLOUD_ROUTES.ASSETS();
        const { data } = await ApiService.get<any[]>(url, actionKey, undefined, {
          headers: {
            resources: true,
          },
        });
        console.info(data);
        this.$patch({
          appResources: data || [],
        });
        return data || [];
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },

    async saveFiles(headers: IGoogleHeaders, formData: FormData): Promise<any> {
      const n = Notify.create({
        position: "top",
        type: "lpInfo",
        spinner: true,
        timeout: 0,
        group: false,
        message: "Uploading Files",
        caption: "Please wait",
      });
      try {
        const accountId = useUserStore().accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }

        const actionKey = ACTION_KEYS.ADD_STORAGE_FILE;
        const url = API_ROUTES.STORAGE_FILES(accountId);
        const { data } = await ApiService.post<any[]>(
          url,
          formData,
          actionKey,
          {
            path: headers.path ?? '',
            bucket: headers.bucket ?? '',
            "Content-Type": "multipart/form-data",
          },
          true
        );
        console.info(data);
        // this.$patch({
        //   files: data || []
        // })
        n({
          type: "lpSuccess",
          spinner: false,
          message: "Files Uploaded",
          caption: "Success",
        });
        return data;
      } catch (error) {
        n({
          type: "lpFail",
          spinner: false,
          message: "Error",
          caption: error instanceof Error ? error.message : "Unknown error",
        });
        return null;
      }
    },
    // @Get(':accountId/search')
    async searchGoogleImages(
      query: string,
      params: string
    ): Promise<any[] | null> {
      try {
        const accountId = this.getaccountId();
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = GOOGLE_ACTION_KEYS.SEARCH_GOOGLE_IMAGES;
        const url =
          GOOGLE_CLOUD_ROUTES.IMAGE_SEARCH(accountId) +
          `?query=${query}${params}`;
        const { data } = await ApiService.get<any[]>(url, actionKey, undefined);
        console.info(data);
        return data || null;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async searchGooleWeb(query: string): Promise<any[] | null> {
      try {
        const accountId = this.getaccountId();
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = GOOGLE_ACTION_KEYS.SEARCH_GOOGLE_WEB;
        const url =
          GOOGLE_CLOUD_ROUTES.WEB_SEARCH(accountId) + `?query=${query}`;
        const { data } = await ApiService.get<any[]>(url, actionKey, undefined);
        console.info(data);
        return data || null;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getBase64FromUrl(imageUrl: string): Promise<string> {
      try {
        const accountId = this.getaccountId();
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = GOOGLE_ACTION_KEYS.GET_STORAGE_FILES + uuid();
        const url = `${GOOGLE_CLOUD_ROUTES.IMAGE_BASE64(
          accountId
        )}?url=${imageUrl}`;
        const { data } = await ApiService.get<string>(url, actionKey);
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return "";
      }
    },
    async uploadbase64ToGoogleStorageLocation(
      base64: string,
      folder: string,
      filename: string
    ): Promise<string> {
      try {
        const accountId = this.getaccountId();
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = GOOGLE_ACTION_KEYS.STORAGE_ADD_IMAGE_BASE64;
        const url = GOOGLE_CLOUD_ROUTES.STORAGE_BASE64(accountId);
        const { data } = await ApiService.post<string>(
          url,
          { base64 },
          actionKey,
          {
            folder,
            filename,
          }
        );
        console.info(data);
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return "";
      }
    },
  },
});
