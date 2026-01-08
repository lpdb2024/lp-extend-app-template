import { defineStore } from "pinia";
import { useUserStore } from "src/stores/store-user";
import ApiService from "src/services/ApiService";
import ErrorService from "src/services/ErrorService";
const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);
import { Notify, Dark } from "quasar";
import { useRoute } from "vue-router";
export const route = useRoute();

import { sortByKey, sortName } from "src/utils/functions";

import type {
  AutomaticMessage,
  PredefinedContent,
  ICampaignEngagement,
  ISkillRequest,
  ISkillInfo,
  CCUser,
  IProfile,
  IFaas,
  ICampaign,
  ICampaignInfo,
  ConvCloudAppKeyBasic,
  ServiceWorkerData,
  IBrandDetails,
  IAccountConfig,
  SkillsDetailed,
  LineOfBusiness,
  IWorkingDayProfile,
  SpecialOccasion,
  AgentGroup,
  IAccountFeature,
  IGrantedFeatures,
} from "src/interfaces";
// import {
//   EncyptedKey,
//   ServiceWorkerBase,
//   CCApp
// } from 'src/interfaces'

import type { AC_VALUE_TYPES } from "src/constants";
import { ACTION_KEYS_AC, AC_ROUTES, getACValueType } from "src/constants";
import { useFirebaseAuthStore } from "./store-firebase-auth";
// import { colors } from 'quasar'

// const { getPaletteColor } = colors

export interface IAccountConfigState {
  agentGroups: AgentGroup[];
  userSettings: IAccountConfig[];
  accountSettings: IAccountConfig[];
  accountFeatures: IAccountFeature[];
  searchAccountConfig: string;
  searchAccountFeatures: string;
  sortAccountConfig: AC_VALUE_TYPES[] | null;
  serviceWorkers: ServiceWorkerData[];
  brandDetails: IBrandDetails | null;
  connectorEnv: string | null;
  accountId: string | null;
  dark?: boolean;
  automaticMessages: AutomaticMessage[];
  automaticMessagesDefault: AutomaticMessage[];
  campaigns: ICampaign[];
  campaignsInfo: ICampaignInfo[];
  engagements: ICampaignEngagement[];
  lobs: LineOfBusiness[];
  functions: IFaas[];
  keys: ConvCloudAppKeyBasic[];
  predefinedContent: PredefinedContent[];
  revisions: {
    lobs: string | null;
    skills: string | null;
    automaticMessages: string | null;
    campaigns: string | null;
    engagements: string | null;
    users: string | null;
    profiles: string | null;
    predefinedContent: string | null;
    applications: string | null;
    accountFeatures: string | null;
  };
  selectedKey: ConvCloudAppKeyBasic | null;
  self: CCUser | null;
  skills: SkillsDetailed[];
  skillAcRevision: string | null;
  user: CCUser | null;
  users: CCUser[];
  profiles: IProfile[];
  workingHours: IWorkingDayProfile[];
  specialOccasions: SpecialOccasion[];
}

export const useACStore = defineStore("AccountConfigStore", {
  state: (): IAccountConfigState => ({
    userSettings: [],
    agentGroups: [],
    lobs: [],
    accountSettings: [],
    accountFeatures: [],
    searchAccountConfig: "",
    searchAccountFeatures: "",
    sortAccountConfig: [],
    serviceWorkers: [],
    brandDetails: null,
    connectorEnv: null,
    accountId: null,
    dark: false,
    automaticMessages: [],
    automaticMessagesDefault: [],
    campaigns: [],
    campaignsInfo: [],
    engagements: [],
    functions: [],
    keys: [],
    predefinedContent: [],
    revisions: {
      lobs: null,
      skills: null,
      automaticMessages: null,
      campaigns: null,
      engagements: null,
      users: null,
      predefinedContent: null,
      applications: null,
      profiles: null,
      accountFeatures: null,
    },
    selectedKey: null,
    self: null,
    skills: [],
    skillAcRevision: null,
    user: null,
    users: [],
    profiles: [],
    workingHours: [],
    specialOccasions: [],
  }),
  getters: {
    isDark: (state) => state.dark,
    accountSettingsFiltered: (state) => {
      const { sortAccountConfig, searchAccountConfig } = state;

      const _a1: IAccountConfig[] = [];
      if (sortAccountConfig && sortAccountConfig?.length > 0) {
        for (const s of state.accountSettings) {
          const valueType = getACValueType(s.type);
          if (sortAccountConfig.includes(valueType)) {
            _a1.push(s);
          }
        }
      } else {
        _a1.push(...state.accountSettings);
      }
      if (!searchAccountConfig || searchAccountConfig === "") {
        return _a1;
      }
      return _a1.filter((setting) =>
        setting.id.toLowerCase().includes(searchAccountConfig.toLowerCase())
      );
    },
    autoMessages: (state) => {
      const automaticMessages = state.automaticMessages || [];
      const automaticMessagesDefault = state.automaticMessagesDefault || [];
      return automaticMessages.concat(automaticMessagesDefault);
    },
    skillIdToName: (state) => {
      return (id: string | number): string | null => {
        const skill = state.skills.find(
          (s: ISkillInfo) => String(s.id) === String(id)
        );
        return skill ? skill.name : null;
      };
    },
    appKeyName:
      (state) =>
      (appKey: string): string => {
        const key = state.keys.find(
          (k: ConvCloudAppKeyBasic) => k.keyId === appKey
        );
        return key ? key.appName : appKey;
      },
    accountFeaturesFiltered: (state) => {
      const { searchAccountFeatures, accountFeatures } = state;
      if (!searchAccountFeatures || searchAccountFeatures === "") {
        return accountFeatures;
      }
      return accountFeatures.filter((feature) =>
        feature.id.toLowerCase().includes(searchAccountFeatures.toLowerCase())
      );
    },
    accountId(): string | null {
      // return useUserStore().accountId || sessionStorage.getItem("accountId");
      return useFirebaseAuthStore().activeLpAccountId
    },
  },
  actions: {
    getUserById(id: string): CCUser | null {
      return (
        this.users.find((u: CCUser) => String(u.id) === String(id)) || null
      );
    },
    // getAccountId(): string | null {
    //   console.info("query", useRoute(), route?.query, route, useUserStore());
    //   const accountId =
    //     (route?.query?.accountId ? String(route.query.accountId) : null) ||
    //     useUserStore().accountId ||
    //     sessionStorage.getItem("accountId");
    //   if (!this.accountId || !accountId || accountId !== this.accountId) {
    //     this.$reset();
    //   }
    //   this.accountId = accountId;
    //   return accountId;
    // },
    setDark(dark: boolean) {
      this.dark = dark;
    },
    async getAccountConfigAll(refetch?: boolean): Promise<IAccountConfig[]> {
      try {
        if (!refetch && this.accountId) {
          return [];
        }
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS_AC.CONFIG_GET_ALL;
        const url = AC_ROUTES.CONFIG_ALL(accountId);
        const { data } = await ApiService.get<IAccountConfig[]>(url, actionKey);
        this.$patch({
          accountSettings: data,
        });
        return data;
      } catch {
        return [];
      }
    },
    async getAccountConfig(): Promise<IAccountConfig[]> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS_AC.CONFIG_GET;
        const url = AC_ROUTES.CONFIG(accountId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.get<any>(url, actionKey);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const theme = data.find((x: any) => x.id === "le.general.theme");
        const value = theme?.propertyValue?.value;
        this.$patch({
          userSettings: data,
          dark: value === "dark",
        });
        useUserStore().setDark(value === "dark");
        Dark.set(value === "dark");
        return data;
      } catch {
        return [];
      }
    },
    async updateAccountConfig(
      body: Partial<IAccountConfig>
    ): Promise<IAccountConfig | null> {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const x = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Updating account settings...",
          caption: "please wait",
          spinner: true,
          group: false,
          position: "top",
        });
        // https://static.liveperson.com/static-assets/2022/05/05115236/lp-light%402x-1.jpg
        delete body.deleted;
        const actionKey = ACTION_KEYS_AC.CONFIG_UPDATE;
        const url = AC_ROUTES.CONFIG(accountId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.put<any>(url, body, actionKey);
        this.$patch({
          accountSettings: data,
        });
        x({
          type: "lpSuccess",
          message: "Updated account settings",
          spinner: false,
          caption: "complete",
          timeout: 500,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getBrandDetails(refetch?: boolean): Promise<IBrandDetails | null> {
      try {
        if (!refetch && this.brandDetails) {
          return this.brandDetails;
        }
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS_AC.BRAND_GET;
        const url = AC_ROUTES.BRAND(accountId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.get<any>(url, actionKey);
        this.$patch({
          brandDetails: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getServiceWorkers(): Promise<ServiceWorkerData[] | []> {
      const siteId = this.accountId;
      if (!siteId) {
        throw new Error("No siteId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.GET_SERVICE_WORKERS;
        const url = AC_ROUTES.SERVICE_WORKERS(siteId);
        const { data } = await ApiService.get<ServiceWorkerData[]>(
          url,
          actionKey
        );
        await this.getConvCloudAppKeys(true);
        await this.getUsers(true);
        for (const worker of data) {
          const user = this.users.find(
            (u: CCUser) => u.id === Number(worker.user_id)
          );
          const appKey = this.keys.find(
            (k: ConvCloudAppKeyBasic) => k.keyId === worker.app_key
          );
          worker.appName = appKey?.appName || worker.appName || "Unknown App";
          worker.user_id = String(worker.user_id);
          worker.agentName = user ? user.loginName : "Unknown User";
          worker.userEnabled = user?.isEnabled ? true : false;
          worker.apiKeyEnabled = appKey?.enabled ? true : false;
        }
        this.$patch({
          serviceWorkers: data,
        });
        return data;
      } catch (error) {
        Notify.create({
          type: "lpFail",
          spinner: false,
          message: "Error",
          caption: ErrorService.handleRequestError(error),
        });
        return [];
      }
    },
    async addServiceWorker(
      serviceWorkerBase: ServiceWorkerData
    ): Promise<boolean> {
      const siteId = this.accountId;
      if (!siteId) {
        throw new Error("No siteId found");
      }
      try {
        serviceWorkerBase.account_id = siteId;
        const actionKey = ACTION_KEYS_AC.CREATE_SERVICE_WORKER;
        const url = AC_ROUTES.SERVICE_WORKERS(siteId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.post<any>(
          url,
          serviceWorkerBase,
          actionKey
        );
        this.$patch({
          serviceWorkers: [...this.serviceWorkers, data],
        });
        return true;
      } catch (error) {
        Notify.create({
          type: "lpFail",
          spinner: false,
          message: "Error",
          caption: ErrorService.handleRequestError(error),
        });
        return false;
      } finally {
        // Refresh the service workers list after adding a new one
        await this.getServiceWorkers();
      }
    },
    async removeServiceWorker(serviceWorkerId: string): Promise<boolean> {
      const siteId = this.accountId;
      if (!siteId) {
        throw new Error("No siteId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.DELETE_SERVICE_WORKER;
        const url = AC_ROUTES.SERVICE_WORKER_BY_ID(siteId, serviceWorkerId);
        await ApiService.delete(url, actionKey);
        const serviceWorkers: ServiceWorkerData[] = this.serviceWorkers.filter(
          (sw: ServiceWorkerData) => sw.id !== serviceWorkerId
        );
        this.$patch({
          serviceWorkers,
        });
        return true;
      } catch (error) {
        Notify.create({
          type: "lpFail",
          spinner: false,
          message: "Error",
          caption: ErrorService.handleRequestError(error),
        });
        return false;
      }
    },
    async getCampaigns(useCache?: boolean | null): Promise<ICampaign[] | []> {
      const accountId = this.accountId;
      if (useCache && this.campaigns.length > 0) {
        return this.campaigns;
      }
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS_AC.CAMPAIGNS_GET_ALL;
        const url = AC_ROUTES.CAMPAIGNS(accountId);
        const response = await ApiService.get<ICampaign[]>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.campaigns = skillAcRevision;
        this.$patch({
          campaigns: data.sort(sortName),
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getCampaignById(campaignId: string): Promise<ICampaignInfo | null> {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS_AC.CAMPAIGNS_BY_ID;
        const url = AC_ROUTES.CAMPAIGNS_BY_ID(accountId, campaignId);
        const response = await ApiService.get<ICampaignInfo>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        if (!data) {
          throw new Error("No campaign found");
        }
        // add to this.campaignsInfo array or overwrite if exists
        const existingIndex = this.campaignsInfo.findIndex(
          (c: ICampaignInfo) => String(c.id) === String(data.id)
        );
        if (existingIndex >= 0) {
          this.campaignsInfo[existingIndex] = data;
        } else {
          this.campaignsInfo.push(data);
        }
        this.revisions.campaigns = skillAcRevision;
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async buildCampaignInfo() {
      const campaigns = await this.getCampaigns(true);
      for (const campaign of campaigns) {
        await this.getCampaignById(String(campaign.id));
      }
      return this.campaignsInfo;
    },
    async getEngagement(
      campaignId: string,
      engagementId: string
    ): Promise<ICampaignEngagement[] | []> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        if (!campaignId) {
          throw new Error("No campaignId found");
        }
        if (!engagementId) {
          throw new Error("No engagementId found");
        }
        const actionKey = ACTION_KEYS_AC.ENGAGEMENT_GET_ALL;
        const url = AC_ROUTES.ENGAGEMENTS_BY_ID(
          accountId,
          campaignId,
          engagementId
        );
        const response = await ApiService.get<ICampaignEngagement[]>(
          url,
          actionKey
        );
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.engagements = skillAcRevision;
        return response.data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async deleteEngagement(
      campaignId: string,
      engagementId: string,
      skillId: string,
      useNotify?: boolean
    ) {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        if (!campaignId) {
          throw new Error("No campaignId found");
        }
        if (!engagementId) {
          throw new Error("No engagementId found");
        }
        const eng = await this.getEngagement(campaignId, engagementId);
        if (!eng) {
          throw new Error("No engagement found");
        }
        const revision = this.revisions.engagements;
        const x = useNotify
          ? Notify.create({
              type: "lpInfo",
              timeout: 0,
              message: "Deleting engagements...",
              caption: "please wait",
              spinner: true,
              group: false,
              position: "top",
            })
          : null;
        const actionKey = ACTION_KEYS_AC.ENGAGEMENT_DELETE;
        const url = AC_ROUTES.ENGAGEMENTS_BY_ID(
          accountId,
          campaignId,
          engagementId
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await ApiService.delete<any>(
          url,
          actionKey,
          undefined,
          undefined,
          {
            revision: revision ?? '',
          }
        );
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.engagements = skillAcRevision;
        const engagements = this.engagements.filter(
          (e: ICampaignEngagement) => String(e.id) !== String(engagementId)
        );
        this.$patch({
          engagements,
        });
        const skill = skillId
          ? this.skills.find(
              (s: SkillsDetailed) => String(s.id) === String(skillId)
            )
          : null;
        if (skill && skill.engagements) {
          const skillEngIndex = skill.engagements.findIndex(
            (e: { campaignId: string; id: string | number; name: string }) =>
              String(e.id) === String(engagementId)
          );
          if (skillEngIndex >= 0) {
            skill.engagements.splice(skillEngIndex, 1);
          }
        }
        if (useNotify && x) {
          x({
            type: "lpSuccess",
            message: "Deleted engagements",
            spinner: false,
            caption: "complete",
            timeout: 500,
          });
        }
        return true;
      } catch (error) {
        handleRequestError(error, true);
        return false;
      }
    },
    async getConvCloudAppKeys(
      useCache?: boolean
    ): Promise<ConvCloudAppKeyBasic[] | null> {
      if (useCache && this.keys.length > 0) {
        return this.keys;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.APP_KEYS_GET;
        const url = AC_ROUTES.APP_KEYS(accountId);
        const { data } = await ApiService.get<ConvCloudAppKeyBasic[]>(
          url,
          actionKey
        );
        // sort by appName
        const keys = sortByKey("appName", data as unknown as Record<string, unknown>[]);
        this.$patch({ keys });
        return data;
      } catch (e) {
        ErrorService.handleRequestError(e);
        return null;
      }
    },
    async updateBrandDetails(
      body: Partial<IBrandDetails>
    ): Promise<IBrandDetails | null> {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const x = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Updating brand details...",
          caption: "please wait",
          spinner: true,
          group: false,
          position: "top",
        });
        const actionKey = ACTION_KEYS_AC.BRAND_UPDATE;
        const url = AC_ROUTES.BRAND(accountId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.put<any>(url, body, actionKey);
        this.$patch({
          brandDetails: data,
        });
        x({
          type: "lpSuccess",
          message: "Updated brand details",
          spinner: false,
          caption: "complete",
          timeout: 500,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getUsers(useCache?: boolean | null): Promise<CCUser[] | []> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      if (useCache && this.users.length > 0) {
        return this.users;
      }
      try {
        const actionKey = ACTION_KEYS_AC.USERS_GET;
        const url = AC_ROUTES.USERS(accountId);
        const response = await ApiService.get<CCUser[]>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.users = skillAcRevision;
        this.$patch({
          users: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getAgentGroups(
      useCache?: boolean | null
    ): Promise<AgentGroup[] | []> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      if (useCache && this.agentGroups.length > 0) {
        return this.agentGroups;
      }
      try {
        const actionKey = ACTION_KEYS_AC.AGENT_GROUPS_GET;
        const url = AC_ROUTES.AGENT_GROUPS(accountId);
        const response = await ApiService.get<AgentGroup[]>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.users = skillAcRevision;
        this.$patch({
          agentGroups: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    getSkillName(id: string): string | null {
      const skill = this.skills.find(
        (s: ISkillInfo) => String(s.id) === String(id)
      );
      return skill?.name || null;
    },
    async deleteSkill(skillId: number, useNotify: boolean) {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const x = useNotify
          ? Notify.create({
              type: "lpInfo",
              timeout: 0,
              message: "Deleting skills...",
              caption: "please wait",
              spinner: true,
              group: false,
              position: "top",
            })
          : null;
        const actionKey = ACTION_KEYS_AC.SKILL_DELETE;
        const url = AC_ROUTES.SKILLS_BY_ID(accountId, String(skillId));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await ApiService.delete<any>(
          url,
          actionKey,
          undefined,
          undefined,
          {
            revision: this.revisions.skills ?? '',
          }
        );
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        // remove skill from skills
        const skills = this.skills.filter((s: ISkillInfo) => s.id !== skillId);
        this.$patch({
          skillAcRevision,
          skills,
        });
        if (useNotify && x) {
          x({
            type: "lpSuccess",
            message: "Deleted skills",
            spinner: false,
            caption: "complete",
            timeout: 500,
          });
        }
        return true;
      } catch (error) {
        handleRequestError(error, true);
        return false;
      }
    },
    async getSkills(useCache?: boolean | null): Promise<ISkillInfo[] | []> {
      try {
        const accountId = this.accountId;
        console.info("getSkills", accountId);
        if (useCache && this.skills.length > 0) {
          return this.skills;
        }
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = ACTION_KEYS_AC.SKILL_GET_ALL;
        const url = AC_ROUTES.SKILLS(accountId);
        console.info("url", url);
        const response = await ApiService.get<{data: ISkillInfo[]}>(url, actionKey);
        const { data } = response.data;
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        console.info(response.data);
        // Ensure data is an array before sorting
        const dataArray = Array.isArray(data) ? data : [];
        const skills: ISkillInfo[] = dataArray.sort(sortName);
        this.revisions.skills = skillAcRevision;
        console.info(response.data, skills);
        this.$patch({
          skills,
          skillAcRevision,
        });
        return skills;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async createSkill(body: ISkillRequest): Promise<ISkillInfo | null> {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const x = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Creating skill...",
          caption: "please wait",
          spinner: true,
          group: false,
          position: "top",
        });
        const actionKey = ACTION_KEYS_AC.SKILL_CREATE;
        const url = AC_ROUTES.SKILLS(accountId);
        const response = await ApiService.post<ISkillInfo>(
          url,
          body,
          actionKey,
          {
            "ac-revision": this.skillAcRevision ?? '',
          }
        );
        const data = response.data;
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.skills = skillAcRevision;
        this.$patch({
          skills: [...this.skills, data],
          skillAcRevision,
        });
        x({
          type: "lpSuccess",
          message: "Created skill: " + data.name,
          spinner: false,
          caption: "complete",
          timeout: 500,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getApplication(): Promise<{ env: string } | null> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.APPLICATION_GET;
        const url = AC_ROUTES.APPLICATION(accountId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await ApiService.get<any>(url, actionKey);
        this.$patch({
          connectorEnv: data.env,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async setApplication(env: string): Promise<{ env: string } | null> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.APPLICATION_GET;
        const url = AC_ROUTES.APPLICATION(accountId);

        const { data } = await ApiService.post<{ env: string }>(
          url,
          { env },
          actionKey
        );
        this.$patch({
          connectorEnv: data.env,
        });
        Notify.create({
          type: "lpSuccess",
          spinner: false,
          message: "Updated application",
          caption: "complete",
          timeout: 500,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getProfiles(useCache?: boolean | null): Promise<IProfile[] | []> {
      if (useCache && this.users.length > 0) {
        return this.profiles;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.PROFILES_GET;
        const url = AC_ROUTES.PROFILES(accountId);
        const response = await ApiService.get<IProfile[]>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.profiles = skillAcRevision;
        this.$patch({
          profiles: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getLOBs(useCache?: boolean | null): Promise<LineOfBusiness[] | []> {
      if (useCache && this.lobs.length > 0) {
        return this.lobs;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.LOBS_GET;
        const url = AC_ROUTES.LOBS(accountId);
        const response = await ApiService.get<LineOfBusiness[]>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.lobs = skillAcRevision;
        this.$patch({
          lobs: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getPredefinedContent(
      useCache?: boolean | null
    ): Promise<PredefinedContent[] | []> {
      if (useCache && this.predefinedContent.length > 0) {
        return this.predefinedContent;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.PREDEFINED_CONTENT_GET;
        const url = AC_ROUTES.PREDEFINED_CONTENT(accountId);
        const response = await ApiService.get<PredefinedContent[]>(
          url,
          actionKey
        );
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.predefinedContent = skillAcRevision;
        this.$patch({
          predefinedContent: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getAutomaticMessages(
      useCache?: boolean | null
    ): Promise<AutomaticMessage[] | []> {
      if (useCache && this.automaticMessages.length > 0) {
        return this.automaticMessages;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.AUTOMATIC_MESSAGES_GET;
        const url = AC_ROUTES.AUTOMATIC_MESSAGES(accountId);
        const response = await ApiService.get<AutomaticMessage[]>(
          url,
          actionKey
        );
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.automaticMessages = skillAcRevision;
        this.$patch({
          automaticMessages: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getAutomaticMessagesDefault(
      useCache?: boolean | null
    ): Promise<AutomaticMessage[] | []> {
      if (useCache && this.automaticMessages.length > 0) {
        return this.automaticMessages;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.AUTOMATIC_MESSAGES_GET_DEFAULT;
        const url = AC_ROUTES.AUTOMATIC_MESSAGES_DEFAULT(accountId);
        const response = await ApiService.get<AutomaticMessage[]>(
          url,
          actionKey
        );
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.automaticMessages = skillAcRevision;
        this.$patch({
          automaticMessagesDefault: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getWorkingHours(
      useCache?: boolean | null
    ): Promise<IWorkingDayProfile[] | null> {
      if (useCache && this.workingHours.length > 0) {
        return this.workingHours;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.WORKING_HOURS_GET;
        const url = AC_ROUTES.WORKING_HOURS(accountId);
        const { data } = await ApiService.get<IWorkingDayProfile[]>(
          url,
          actionKey
        );
        this.$patch({
          workingHours: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getSpecialOccasions(
      useCache?: boolean | null
    ): Promise<SpecialOccasion[] | null> {
      if (useCache && this.specialOccasions.length > 0) {
        return this.specialOccasions;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.SPECIAL_OCCASIONS_GET;
        const url = AC_ROUTES.SPECIAL_OCCASIONS(accountId);
        const { data } = await ApiService.get<SpecialOccasion[]>(
          url,
          actionKey
        );
        this.$patch({
          specialOccasions: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    // =========================================================================
    // Account Features (Feature Grants)
    // =========================================================================
    async getAccountFeatures(
      useCache?: boolean | null
    ): Promise<IAccountFeature[] | null> {
      if (useCache && this.accountFeatures.length > 0) {
        return this.accountFeatures;
      }
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = ACTION_KEYS_AC.ACCOUNT_FEATURES_GET;
        const url = AC_ROUTES.ACCOUNT_FEATURES(accountId);
        // Response format: { data: { data: { revision, grantedFeature }, revision } }
        const response = await ApiService.get<{ data: IGrantedFeatures; revision?: string }>(url, actionKey);
        const { data: responseData, headers } = response;
        // The actual features data is nested inside responseData.data
        const featuresData = responseData?.data || responseData;
        const revision = headers["ac-revision"] || responseData?.revision || featuresData?.revision?.toString();
        this.revisions.accountFeatures = revision;
        const features = featuresData?.grantedFeature || [];
        this.$patch({
          accountFeatures: features,
        });
        return features;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async updateAccountFeature(
      featureId: string,
      value: string
    ): Promise<IAccountFeature[] | null> {
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      const revision = this.revisions.accountFeatures;
      if (!revision) {
        throw new Error("No revision found - please fetch features first");
      }
      try {
        const x = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Updating feature...",
          caption: featureId,
          spinner: true,
          group: false,
          position: "top",
        });
        const actionKey = ACTION_KEYS_AC.ACCOUNT_FEATURES_UPDATE;
        const url = AC_ROUTES.ACCOUNT_FEATURES(accountId);
        const payload = {
          grantedFeature: [
            {
              id: featureId,
              value: {
                type: "LPBoolean",
                $: value,
              },
            },
          ],
        };
        const response = await ApiService.put<IGrantedFeatures>(
          url,
          payload,
          actionKey,
          {
            "If-Match": revision,
          }
        );
        const { data, headers } = response;
        const newRevision = headers["ac-revision"] || data?.revision?.toString();
        this.revisions.accountFeatures = newRevision;
        // Update the local feature in state
        const featureIndex = this.accountFeatures.findIndex(
          (f) => f.id === featureId
        );
        if (featureIndex >= 0 && this.accountFeatures[featureIndex]?.value) {
          this.accountFeatures[featureIndex].value.$ = value;
        }
        x({
          type: "lpSuccess",
          message: "Updated feature",
          spinner: false,
          caption: featureId,
          timeout: 500,
        });
        return this.accountFeatures;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
  },
});
