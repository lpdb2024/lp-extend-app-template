/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from "src/services/ApiService";
import { useRoute } from "vue-router";
export const route = useRoute();
import { useUserStore } from "./store-user";
import { defineStore } from "pinia";
import ErrorService from "src/services/ErrorService";
const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);
import { Notify } from "quasar";
import { TEXT_SPEECH_ROUTES } from "src/constants";
import type { IVoice, VoiceCollection } from "src/interfaces/speech";
import { SPEECH_ACTION_KEYS } from "src/constants/constants.speech";
// import type {
// } from "src/interfaces";

interface IPiniaState {
  accountId: string | null;
  voices: IVoice[];
  voice: IVoice | null;
  collections: VoiceCollection[];
}

export const useSpeechStore = defineStore("text-to-speech", {
  state: (): IPiniaState => ({
    accountId: null,
    voices: [],
    voice: null, // This can be used to store a selected voice
    collections: [],
  }),
  persist: true,
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
    async listVoices(useCache?: boolean): Promise<any> {
      if (useCache && this.voices.length > 0) {
        return this.voices;
      }
      const accountId = this.getaccountId();
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = SPEECH_ACTION_KEYS.LIST_VOICES;
        const url = TEXT_SPEECH_ROUTES.VOICES(accountId);
        const response = await ApiService.get<any>(url, actionKey);
        this.$patch({
          voices: response.data.voices || [],
        });
        return response.data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async listCollections(useCache?: boolean): Promise<any> {
      if (useCache && this.collections.length > 0) {
        return this.collections;
      }
      const accountId = this.getaccountId();
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = SPEECH_ACTION_KEYS.LIST_COLLECTIONS;
        const url = TEXT_SPEECH_ROUTES.COLLECTIONS(accountId);
        const response = await ApiService.get<any>(url, actionKey);
        this.$patch({
          collections: response.data,
        });
        return response.data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getVoices(useCache?: boolean): Promise<any> {
      await this.listCollections(useCache);
    },
    async getAudio(text: string, voiceId: string): Promise<any> {
      const accountId = this.getaccountId();
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = SPEECH_ACTION_KEYS.TEXT_TO_SPEECH;
        const url = TEXT_SPEECH_ROUTES.TEXT_TO_SPEECH_BY_VOICE(
          accountId,
          voiceId
        );
        if (!text || text.trim() === "") {
          Notify.create({
            type: "lpFail",
            spinner: false,
            message: "Text is required",
            caption: "Please provide text to convert to speech.",
          });
          return null;
        }
        if (!voiceId) {
          Notify.create({
            type: "lpFail",
            spinner: false,
            message: "Voice ID is required",
            caption: "Please select a valid voice.",
          });
          return null;
        }
        const response = await ApiService.post<any>(
          url,
          {
            text,
            modelId: voiceId,
          },
          actionKey
        );
        return response.data?.buffer?.data || null;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
  },
});
