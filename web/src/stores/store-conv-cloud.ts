/* eslint-disable @typescript-eslint/no-explicit-any */
import ApiService from "src/services/ApiService";
import { useRoute } from "vue-router";
export const route = useRoute();
// import { useUserStore } from "./store-user";
import { defineStore } from "pinia";
import ErrorService from "src/services/ErrorService";
const handleRequestError = ErrorService.handleRequestError.bind(ErrorService);
import { sortName, sortByKey } from "src/utils/functions";
import { Notify } from "quasar";
import {
  CONV_CLOUD_ACTION_KEYS,
  CONV_CLOUD_ROUTES,
  KAI_ROUTES,
} from "src/constants";
import { formatLogs } from "src/utils/formatLogs";
import type {
  DebugLog,
  CBDebugRecords,
  NameAndId,
  baseURI,
  KnowledgeDataSourceResponse,
  KnowledgeDataSource,
  IKnowledgeBaseDetailResponse,
  IKnowledgeBaseDetail,
  KAIArticle,
  KVPObject,
  ProcessConversationsRequest,
  ConversationHistoryRecords,
  ConversationHistoryResponse,
  DefaultPromptResponse,
  DefaultPrompt,
  AutomaticMessage,
  AutomaticMessageContext,
  PredefinedContent,
  ICampaignEngagement,
  ISkillRequest,
  SkillsDetailed,
  CCUser,
  IFaas,
  ICampaign,
  ICampaignInfo,
  ConvCloudAppKeyBasic,
  EncyptedKey,
  PayloadFilters,
} from "src/interfaces";
import { useFirebaseAuthStore } from "./store-firebase-auth";

interface IState {
  articles: KAIArticle[];
  articleCategories: string[];
  automaticMessages: AutomaticMessage[];
  baseURIs: baseURI[];
  botLogs: {
    logs: CBDebugRecords[];
    records: number;
    errorIndexes?: number[];
  };
  campaigns: ICampaign[];
  campaignsInfo: ICampaignInfo[];
  categoryFilters: string[];
  conversations: ConversationHistoryRecords[];
  defaultPrompt: DefaultPrompt | null;
  engagements: ICampaignEngagement[];
  filters: string[];
  functions: IFaas[];
  knowledgeBases: KnowledgeDataSource[];
  keys: ConvCloudAppKeyBasic[];
  loadingQueue: boolean;
  loadingAgents: boolean;
  loadingShifts: boolean;
  loadingCampaigns: boolean;
  operationsFilters: {
    skills: number[];
    sortBy: string | null;
    direction?: string | null;
  };
  predefinedContent: PredefinedContent[];
  region: string | null;
  revisions: {
    skills: string | null;
    automaticMessages: string | null;
    campaigns: string | null;
    engagements: string | null;
    users: string | null;
    predefinedContent: string | null;
  };
  selectedKey: ConvCloudAppKeyBasic | null;
  services: any;
  skills: SkillsDetailed[];
  skillAcRevision: string | null;
  // accountId: string | null;
  users: CCUser[];
  zone: string | null;
}

export const useConvCloudStore = defineStore("convCloud", {
  state: (): IState => ({
    articleCategories: [],
    articles: [],
    automaticMessages: [],
    baseURIs: [],
    botLogs: {
      logs: [],
      records: 0,
    },
    campaigns: [],
    campaignsInfo: [],
    categoryFilters: [],
    conversations: [],
    defaultPrompt: null,
    engagements: [],
    filters: [],
    functions: [],
    keys: [],
    loadingQueue: false,
    loadingAgents: false,
    loadingShifts: false,
    loadingCampaigns: false,
    knowledgeBases: [],
    operationsFilters: {
      skills: [1572249270, 1696480670, 1526881670, 1442367870, 1877241570],
      sortBy: null,
      direction: null,
    },
    predefinedContent: [],
    region: null,
    revisions: {
      skills: null,
      automaticMessages: null,
      campaigns: null,
      engagements: null,
      users: null,
      predefinedContent: null,
    },
    selectedKey: null,
    services: null,
    // accountId: null,
    skillAcRevision: null,
    skills: [],
    users: [],
    zone: null,
  }),
  persist: true,
  getters: {
    accountId(): string | null {
      // return useUserStore().accountId || sessionStorage.getItem("accountId");
      console.info("getting accountId from firebase store", useFirebaseAuthStore().activeLpAccountId);
      return useFirebaseAuthStore().activeLpAccountId
    },
    logs(state) {
      return state.botLogs.logs;
      // const filters = JSON.parse(JSON.stringify(state.filters))
      // filters.forEach((f: string, index: number) => {
      //   filters[index] = f.toUpperCase().replace(' ', '_')
      // })
      // console.info(filters)
      // if (filters.length === 0) return state.botLogs.logs
      // const logs = JSON.parse(JSON.stringify(state.botLogs.logs))
      // const filteredLogs: CBDebugRecords[] = []
      // logs.forEach((log: CBDebugRecords) => {
      //   const debugLogs: DebugLog[] = log.debugLogs.filter((l: DebugLog) => {
      //     const tags = l.tags || []
      //     return tags.some((t: string) => filters.includes(t))
      //   })
      //   if (debugLogs.length > 0) filteredLogs.push({ ...log, debugLogs })
      // })
      // return filteredLogs
    },
    filteredArticles: (state) => {
      const category = state.categoryFilters;
      const articles = state.articles;
      if (category.length === 0) return articles;
      return articles.filter((article: KAIArticle) =>
        category.includes(article.category)
      );
    },
    faasFunctions: (state) => {
      const functions = state.functions.filter(
        (f: IFaas) =>
          f.state === "Productive" &&
          (!f.eventId || f.eventId === "conversational_command")
      );
      return functions;
    },
    skillsAgents: (state) => {
      const { users, skills } = state;
      const botsWithSkill = (skillId: number) => {
        const u = users.filter(
          (user: CCUser) =>
            user?.skillIds?.includes(skillId) && user?.userTypeId === 2
        );
        const arr: { id: number; name: string }[] = [];
        u.forEach((user: CCUser) => {
          arr.push({ id: user.id, name: user.fullName });
        });
        return arr;
      };

      const arr = [];
      for (const skill of skills) {
        const bots = botsWithSkill(skill.id);
        skill.bots = bots;
        arr.push(skill);
      }
      return arr;
    },
  },
  actions: {
    getSkillName(id: string) {
      const skill = this.skills.find(
        (s: SkillsDetailed) => String(s.id) === String(id)
      );
      return skill?.name || null;
    },
    setLogs(logs: CBDebugRecords[]) {
      const limit = 1;
      for (const log of logs) {
        // exit if limit exceeded
        if (Number(log) >= limit) {
          break;
        }
        log.errorIndexes = [];
        // const userMessage: string = the record where log.debugLogs.content.title = "Interaction not in progress"
        log.userMessage =
          log.debugLogs.find(
            (l: DebugLog) => l.content.title === "Interaction not in progress"
          )?.content.summary || null;
        const formattedLogs: DebugLog[] = formatLogs(log.debugLogs) || [];
        log.debugLogs = formattedLogs;
        for (const l of formattedLogs) {
          if (l.level === "ERROR" || l.level === "WARN") {
            if (log.errorIndexes) {
              log?.errorIndexes?.push(Number(l));
            }
          }
        }
      }
      const botLogs = {
        logs,
        records: logs?.length || 0,
      };
      // this.botLogs = botLogs
      this.$patch({ botLogs });
      return botLogs;
    },
    async createMappings() {
      const n = Notify.create({
        type: "lpInfo",
        timeout: 0,
        message: "Creating mappings...",
        caption: "please wait",
        spinner: true,
        group: false,
        position: "top",
      });
      this.$patch({
        skills: [],
        campaigns: [],
        engagements: [],
        users: [],
      });
      const skills = (await this.getSkills()) || [];
      const users: CCUser[] = (await this.getUsers()) || [];
      const campaigns = (await this.getCampaigns()) || [];
      const predefinedContent: PredefinedContent[] =
        (await this.getPredefinedContent()) || [];
      const automaticMessages: AutomaticMessage[] =
        (await this.getAutomaticMessages()) || [];

      for (const skill of skills) {
        if (skill.skillTransferList && skill.skillTransferList.length > 0) {
          for (const transferSkillId of skill.skillTransferList) {
            const transferIndex = skills.findIndex(
              (s: SkillsDetailed) => s.id === transferSkillId
            );
            if (transferIndex >= 0 && skills[transferIndex]) {
              skills[transferIndex].skillTransferList =
                skills[transferIndex].skillTransferList ?? [];
              skills[transferIndex].skillTransferList.push(skill.id);
            }
          }
        }
      }

      for (const autoMessage of automaticMessages) {
        if (autoMessage?.contexts?.SKILL) {
          for (const skillContext of autoMessage.contexts.SKILL) {
            const skillId = skillContext.skillId;
            const skillIndex = skills.findIndex(
              (s: SkillsDetailed) => s.id === skillId
            );
            if (skillIndex >= 0) {
              const skill = skills[skillIndex];
              if (skill) {
                skill.automaticMessages = skill.automaticMessages || [];
                skill.automaticMessages.push(autoMessage.id);
              }
            }
          }
        }
      }

      for (const p of predefinedContent) {
        if (p?.skillIds) {
          for (const skillId of p.skillIds) {
            const skillIndex = skills.findIndex(
              (s: SkillsDetailed) => String(s.id) === String(skillId)
            );
            if (skillIndex >= 0) {
              console.info(`adding PDC ${p.id} to skill ${skillId}`);
              const skill = skills[skillIndex];
              if (!skill) {
                continue;
              }
              // Fix: Ensure skill is defined before accessing its properties
              if (!skill.predefinedContent) {
                skill.predefinedContent = [];
              }
              if (!p.data) {
                continue;
              }
              const name = p?.data[0]?.title ?? "";
              const message = p?.data[0]?.msg;
              console.info(p.data[0]);
              const predefinedContentObj: {
                id: string;
                name: string;
                message?: string;
              } = { id: p.id, name };
              if (message !== undefined) {
                predefinedContentObj.message = message;
              }
              skill.predefinedContent.push(predefinedContentObj);
            }
          }
        }
      }

      let c = 0;
      for (const campaign of campaigns) {
        c++;
        n({
          type: "lpInfo",
          timeout: 0,
          message: "Creating mappings for " + campaign.name,
          caption: "campaign " + c + " of " + campaigns.length,
          spinner: true,
        });
        const campaignInfo = await this.getCampaignById(String(campaign.id));
        if (!campaignInfo) continue;
        for (const engagement of campaignInfo.engagements) {
          campaign.skillIds = campaign.skillIds || [];
          if (
            engagement.skillId &&
            !campaign.skillIds.includes(engagement.skillId)
          ) {
            campaign.skillIds.push(engagement.skillId);
          }
          // Add engagements to Skills
          const engSkill = skills.find(
            (s: SkillsDetailed) => s.id === engagement.skillId
          );
          if (engSkill) {
            engSkill.engagements = engSkill.engagements || [];
            engSkill.engagements.push({
              campaignId: String(campaign.id),
              id: engagement.id,
              name: engagement.name,
            });
            // Add Campaigns to Skills
            engSkill.campaigns = engSkill.campaigns || [];
            if (
              !engSkill.campaigns.find((c: NameAndId) => c.id === campaign.id)
            ) {
              engSkill.campaigns.push({
                id: campaign.id,
                name: campaign.name,
              });
            }
          }

          engagement.campaignId = campaign.id;
          engagement.campaignName = campaign.name;
          this.engagements.push(engagement);
        }
      }
      let userIndex = 0;
      for (const user of users) {
        n({
          type: "lpInfo",
          timeout: 0,
          message: "Creating mappings for USERS: " + user.fullName,
          caption: "user " + (userIndex + 1) + " of " + users.length,
        });
        if (user.skillIds) {
          for (const skillId of user.skillIds) {
            const skillIndex = skills.findIndex(
              (s: SkillsDetailed) => String(s.id) === String(skillId)
            );
            if (skillIndex >= 0) {
              const skill = skills[skillIndex];
              if (skill) {
                skill.agents = skill.agents || [];
                skill.agents.push({
                  id: user.id,
                  name: user.fullName,
                });
              }
            }
          }
        }
        userIndex++;
      }
      this.skills = skills;
      console.info(skills);
      this.$patch({
        campaigns,
        users,
        skills,
      });
      n({
        type: "lpSuccess",
        message: "Created mappings",
        spinner: false,
        caption: "complete",
        timeout: 500,
      });
      return true;
    },
    async getConvCloudAppKeys(
      useCache?: boolean
    ): Promise<ConvCloudAppKeyBasic[] | null> {
      if (useCache && this.keys.length > 0) {
        return this.keys;
      }
      // const accountId = useUserStore().accountId;
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_APP_KEYS;
        const url = CONV_CLOUD_ROUTES.APP_KEYS(accountId);
        const { data } = await ApiService.get<ConvCloudAppKeyBasic[]>(
          url,
          actionKey
        );
        // sort by appName
        const keys = sortByKey("appName", data as unknown as Record<string, unknown>[]) as unknown as ConvCloudAppKeyBasic[];
        this.$patch({ keys });
        return data;
      } catch (e) {
        ErrorService.handleRequestError(e);
        return null;
      }
    },
    async saveConvCloudAppKey(
      key: ConvCloudAppKeyBasic
    ): Promise<ConvCloudAppKeyBasic | null> {
      // const accountId = useUserStore().accountId;
      const accountId = this.accountId;
      if (!accountId) {
        throw new Error("No accountId found");
      }
      try {
        const actionKey = CONV_CLOUD_ACTION_KEYS.SAVE_APP_KEY;
        const url = CONV_CLOUD_ROUTES.APP_KEYS(accountId);
        const { data } = await ApiService.post<EncyptedKey>(
          url,
          key,
          actionKey
        );
        const foundKey = this.keys.find(
          (k: ConvCloudAppKeyBasic) => k.keyId === data.keyId
        );
        if (foundKey) {
          this.$patch({
            selectedKey: foundKey,
          });
        }
        return foundKey || null;
      } catch (e) {
        ErrorService.handleRequestError(e);
        return null;
      }
    },
    async getBotLogs(id: string) {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        this.botLogs = {
          logs: [],
          records: 0,
        };
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_BOT_LOGS;
        const url = CONV_CLOUD_ROUTES.BOT_LOGS(accountId, id);
        const { data } = await ApiService.get<any>(url, actionKey);
        console.info(data);

        // const logs = this.setLogs([data?.successResult?.logs[0]])
        // const logs just get first 2 array items
        const logs = this.setLogs(data?.successResult?.logs.slice(0, 2));

        // const logs = convertlog(data?.successResult?.logs)
        // console.info(logs)
        // this.$patch({
        //   botLogs: logs
        // })
        return logs;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    // getaccountId() {
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
    lpService(service: string) {
      if (!this.services) return;
      const s: string = this.services[service] || null;
      return s;
    },
    getServiceDomain(service: string) {
      console.info(service);
      return this.baseURIs.find((x: baseURI) => x?.service === service)
        ?.baseURI;
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
        const actionKey = CONV_CLOUD_ACTION_KEYS.DELETE_SKILLS;
        const url = CONV_CLOUD_ROUTES.SKILLS_BY_ID(accountId, String(skillId));
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
        const skills = this.skills.filter(
          (s: SkillsDetailed) => s.id !== skillId
        );
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
    async getPredefinedContent(
      useCache?: boolean | null
    ): Promise<PredefinedContent[] | []> {
      try {
        const accountId = this.accountId;
        if (useCache && this.predefinedContent.length > 0) {
          return this.predefinedContent;
        }
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CANNED_RESPONSES;
        const url = CONV_CLOUD_ROUTES.CANNED_RESPONSES(accountId);
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
        console.info(data);
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getOnePredefinedContent(
      id: string
    ): Promise<PredefinedContent | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CANNED_RESPONSE;
        const url = CONV_CLOUD_ROUTES.CANNED_RESPONSES_BY_ID(accountId, id);
        const response = await ApiService.get<PredefinedContent>(
          url,
          actionKey
        );
        const data = response.data;
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.predefinedContent = skillAcRevision;
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async updatePredefinedContent(
      body: PredefinedContent,
      skillId?: string
    ): Promise<PredefinedContent | null> {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.UPDATE_CANNED_RESPONSE;
        const url = CONV_CLOUD_ROUTES.CANNED_RESPONSES_BY_ID(
          accountId,
          String(body.id)
        );
        const response = await ApiService.put<PredefinedContent>(
          url,
          body,
          actionKey,
          {
            revision: this.revisions.predefinedContent ?? '',
          }
        );
        const data = response.data;
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.predefinedContent = skillAcRevision;
        const index = this.predefinedContent.findIndex(
          (p: PredefinedContent) => p.id === data.id
        );
        if (index >= 0) {
          this.predefinedContent[index] = data;
        }
        if (skillId) {
          const skillIndex = this.skills.findIndex(
            (s: SkillsDetailed) => s.id === Number(skillId)
          );
          if (skillIndex >= 0) {
            const skill = this.skills[skillIndex];
            if (!skill) {
              return data;
            }
            skill.predefinedContent = skill.predefinedContent || [];
            // find and remove the predefined content
            const pIndex = skill.predefinedContent.findIndex(
              (p: KVPObject) => p.id === data.id
            );
            if (pIndex >= 0) {
              skill.predefinedContent.splice(pIndex, 1);
            }
          }
        }
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async deleteSkills(skillIds: number[]) {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const n = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Deleting skills...",
          caption: "please wait",
          spinner: true,
          group: false,
          position: "top",
        });
        let idx = 0;
        for (const skillId of skillIds) {
          n({
            type: "lpInfo",
            timeout: 0,
            message: "Deleting skill...",
            caption: `skill # ${idx + 1} of ${skillIds.length}`,
            spinner: true,
          });
          await this.deleteSkill(skillId, false);
          idx++;
        }
        n({
          type: "lpSuccess",
          message: "Deleted skills",
          spinner: false,
          caption: "complete",
          timeout: 500,
        });
        return true;
      } catch (error) {
        handleRequestError(error, true);
        return false;
      }
    },
    async getSkills(useCache?: boolean | null): Promise<SkillsDetailed[] | []> {
      try {
        const accountId = this.accountId;
        if (useCache && this.skills.length > 0) {
          return this.skills;
        }
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_SKILLS;
        const url = CONV_CLOUD_ROUTES.SKILLS(accountId);
        const response = await ApiService.get<SkillsDetailed[]>(url, actionKey);
        const data = response.data;
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        console.info(response);
        const skills: SkillsDetailed[] = data.sort(sortName);
        this.revisions.skills = skillAcRevision;
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
    async createSkill(body: ISkillRequest): Promise<SkillsDetailed | null> {
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
        const actionKey = CONV_CLOUD_ACTION_KEYS.CREATE_SKILL;
        const url = CONV_CLOUD_ROUTES.SKILLS(accountId);
        const response = await ApiService.post<SkillsDetailed>(
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
    async getACRevision(): Promise<string | null> {
      const accountId = this.accountId;
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }

        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_SKILLS;
        const url = CONV_CLOUD_ROUTES.SKILLS(accountId);
        const response = await ApiService.get<SkillsDetailed[]>(url, actionKey);
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        return skillAcRevision;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getCampaigns(useCache?: boolean | null): Promise<ICampaign[] | []> {
      const accountId = this.accountId;
      if (useCache) {
        if (
          this.accountId &&
          accountId === this.accountId &&
          this.campaigns.length > 0
        ) {
          return this.campaigns;
        }
      }
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CAMPAIGNS;
        const url = CONV_CLOUD_ROUTES.CAMPAIGNS(accountId);
        const response = await ApiService.get<ICampaign[]>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.campaigns = skillAcRevision;
        this.$patch({
          campaigns: data,
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
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CAMPAIGN_BY_ID;
        const url = CONV_CLOUD_ROUTES.CAMPAIGNS_BY_ID(accountId, campaignId);
        const response = await ApiService.get<ICampaignInfo>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.campaigns = skillAcRevision;
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
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
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_ENGAGEMENT;
        const url = CONV_CLOUD_ROUTES.ENGAGEMENT(
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
        const actionKey = CONV_CLOUD_ACTION_KEYS.DELETE_ENGAGEMENTS;
        const url = CONV_CLOUD_ROUTES.ENGAGEMENT(
          accountId,
          String(campaignId),
          String(engagementId)
        );
        // (path: string, key: string, params?: any, body?: any, headers?: any)
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
        // remove from skills
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
    async getUsers(useCache?: boolean | null): Promise<CCUser[] | []> {
      const accountId = this.accountId;
      if (useCache) {
        if (
          this.accountId &&
          accountId === this.accountId &&
          this.users.length > 0
        ) {
          return this.users;
        }
      }
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_USERS;
        const url = CONV_CLOUD_ROUTES.USERS(accountId);
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
    async getUser(userId: string): Promise<CCUser | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_USER;
        const url = CONV_CLOUD_ROUTES.USERS_BY_ID(accountId, userId);
        const response = await ApiService.get<CCUser>(url, actionKey);
        const headers = response.headers;
        const usersAcRevision = headers["ac-revision"];
        this.revisions.users = usersAcRevision;
        return response.data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async updateUser(
      user: CCUser,
      skillId: string | null
    ): Promise<CCUser | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        await this.getUser(String(user.id));
        if (!this.revisions.users) {
          throw new Error("No revisions found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.UPDATE_USER;
        const url = CONV_CLOUD_ROUTES.USERS_BY_ID(accountId, String(user.id));
        const response = await ApiService.put<CCUser>(url, user, actionKey, {
          revision: this.revisions.users,
        });
        const headers = response.headers;
        const usersAcRevision = headers["ac-revision"];
        this.revisions.users = usersAcRevision;
        if (skillId) {
          // remove user from this.skills.skillId
          const skillIndex = this.skills.findIndex(
            (s: SkillsDetailed) => String(s.id) === String(skillId)
          );
          console.info(this.skills[skillIndex]?.agents);
          if (skillIndex !== -1 && this.skills[skillIndex]?.agents) {
            const agents = this.skills[skillIndex].agents;
            if (agents) {
              const userIndex = agents.findIndex(
                (a: { id: string | number; name: string }) =>
                  String(a.id) === String(user.id)
              );
              if (userIndex !== -1) {
                agents.splice(userIndex, 1);
              }
            }
          }
        }
        return response.data;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getUserFromPID(pid: string): Promise<CCUser | null> {
      try {
        const users = await this.getUsers(true);
        return users.find((x: CCUser) => x.pid === pid) || null;
      } catch {
        return null;
      }
    },
    async getUserFromID(id: string): Promise<CCUser | null> {
      try {
        const users = await this.getUsers(true);
        return users.find((x: CCUser) => String(x.id) === String(id)) || null;
      } catch {
        return null;
      }
    },
    async getFaasFunctions(useCache?: boolean | null): Promise<IFaas[] | []> {
      const accountId = this.accountId;
      if (useCache) {
        if (
          this.accountId &&
          accountId === this.accountId &&
          this.functions.length > 0
        ) {
          return this.functions;
        }
      }
      try {
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_FAAS_FUNCTIONS;
        const url = CONV_CLOUD_ROUTES.FAAS_FUNCTIONS(accountId);
        const { data } = await ApiService.get<IFaas[]>(url, actionKey);
        this.$patch({
          functions: data,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getDefaultPrompt(): Promise<DefaultPrompt | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_DEFAULT_PROMPT;
        const url = CONV_CLOUD_ROUTES.DEFAULT_PROMPT(accountId);
        const { data } = await ApiService.get<DefaultPromptResponse>(
          url,
          actionKey
        );
        if (!data?.successResult) {
          throw new Error("No data found");
        }
        this.$patch({
          defaultPrompt: data.successResult.prompt,
        });

        return data.successResult.prompt;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getKnowledgeBases(
      useCache?: boolean
    ): Promise<KnowledgeDataSource[] | null> {
      try {
        if (useCache && this.knowledgeBases?.length > 0) {
          return this.knowledgeBases;
        }
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_KNOWLEDGE_BASES;
        const url = KAI_ROUTES.KNOWLEDGE_BASES(accountId);
        const { data } = await ApiService.get<KnowledgeDataSourceResponse>(
          url,
          actionKey
        );
        if (!data?.successResult) {
          throw new Error("No data found");
        }
        const knowledgeBases = data.successResult.KnowledgeDataSource;
        if (!knowledgeBases) {
          throw new Error("No data found");
        }
        this.$patch({
          knowledgeBases,
        });
        return knowledgeBases;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },
    async getKnowledgeBase(kbId: string): Promise<IKnowledgeBaseDetail | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_KNOWLEDGE_BASE;
        const url = KAI_ROUTES.KNOWLEDGE_BASES_BY_ID(accountId, kbId);
        const { data } = await ApiService.get<IKnowledgeBaseDetailResponse>(
          url,
          actionKey
        );
        if (!data?.successResult) {
          throw new Error("No data found");
        }
        return data.successResult.KnowledgeDataSource;
      } catch (error) {
        handleRequestError(error, true);
        return null;
      }
    },

    getConversations(
      body: PayloadFilters,
      firstonly?: boolean
    ): Promise<{ records: ConversationHistoryRecords[]; count: number }> {
      return new Promise((resolve, reject) => {
        const accountId = this.accountId;
        if (!accountId) {
          reject(new Error("No accountId found"));
        }
        console.info(body);
        const n = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Processing conversations...",
          caption: "please wait",
          spinner: true,
          group: false,
          position: "top",
        });
        let url = CONV_CLOUD_ROUTES.CONVERSATIONS(String(accountId));
        if (firstonly) {
          url += "?firstonly=true";
        }
        ApiService.post<ConversationHistoryResponse>(
          url,
          body,
          CONV_CLOUD_ACTION_KEYS.GET_CONVERSATIONS
        )
          .then((response) => {
            const records = response.data.conversationHistoryRecords;
            const count = response.data._metadata?.count || 0;
            console.info(response);
            this.conversations = records;
            n({
              type: "lpSuccess",
              message: "Processed conversations",
              spinner: false,
              caption: "complete",
              timeout: 500,
            });
            resolve({
              records,
              count,
            });
          })
          .catch((error) => {
            n({
              type: "lpFail",
              spinner: false,
              message: "Error",
              caption: error.message || "Failed to fetch conversations",
            });
            reject(error instanceof Error ? error : new Error(error?.message || "Failed to fetch conversations"));
          });
      });
    },
    async getOneConversation(
      conversationId: string
    ): Promise<ConversationHistoryRecords | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CONVERSATION;
        const url = CONV_CLOUD_ROUTES.CONVERSATION(accountId, conversationId);
        const response = await ApiService.get<ConversationHistoryResponse>(
          url,
          actionKey
        );
        const records = response.data.conversationHistoryRecords;
        const conversation = records && records.length > 0 ? records[0] : null;
        return conversation ?? null;
      } catch {
        throw new Error("No data found");
      }
    },

    getConversationById(
      conversationId: string
    ): Promise<ConversationHistoryRecords | null> {
      return new Promise((resolve, reject) => {
        const accountId = this.accountId;
        if (!accountId) {
          reject(new Error("No accountId found"));
          return;
        }
        // Use CONVERSATION_PROXY (POST) to get full conversation with messageRecords
        const url = CONV_CLOUD_ROUTES.CONVERSATION_PROXY(
          String(accountId),
          conversationId
        );
        ApiService.post<ConversationHistoryResponse>(
          url,
          {}, // Empty body - backend adds contentToRetrieve
          CONV_CLOUD_ACTION_KEYS.GET_CONVERSATION
        )
          .then((response) => {
            const records = response.data.conversationHistoryRecords;
            const conversation =
              records && records.length > 0 ? records[0] : null;
            resolve(conversation ?? null);
          })
          .catch((error) => {
            handleRequestError(error, true);
            // reject(error);
          });
      });
    },
    async processConversations(
      body: ProcessConversationsRequest
    ): Promise<string[] | []> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const n = Notify.create({
          type: "lpInfo",
          timeout: 0,
          message: "Processing conversations...",
          caption: "please wait",
          spinner: true,
          group: false,
          position: "top",
        });
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CONVERSATIONS;
        const url = CONV_CLOUD_ROUTES.PROCESS_CONVERSATIONS(accountId);
        const { data } = await ApiService.post<string[]>(url, body, actionKey);
        n({
          type: "lpSuccess",
          message: "Processed conversations",
          spinner: false,
          caption: "complete",
          timeout: 500,
        });
        return data;
      } catch (error) {
        handleRequestError(error, true);
        return [];
      }
    },
    async getAutomaticMessages(
      useCache?: boolean
    ): Promise<AutomaticMessage[] | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        if (useCache && this.automaticMessages?.length > 0) {
          return this.automaticMessages;
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_AUTOMATIC_MESSAGES;
        const url = CONV_CLOUD_ROUTES.AUTOMATIC_MESSAGES(accountId);
        const response = await ApiService.get<any>(url, actionKey);
        const { data, headers } = response;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.automaticMessages = skillAcRevision;
        this.$patch({
          automaticMessages: data,
        });
        return data;
      } catch {
        return null;
      }
    },
    async getOneAutomaticMessage(
      id: string
    ): Promise<AutomaticMessageContext | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.GET_AUTOMATIC_MESSAGE;
        const url = CONV_CLOUD_ROUTES.AUTOMATIC_MESSAGES_BY_ID(accountId, id);
        const response = await ApiService.get<any>(url, actionKey);
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.automaticMessages = skillAcRevision;
        return response.data;
      } catch {
        return null;
      }
    },
    async deleteAutomaticMessageVariant(
      id: string,
      skillId?: string
    ): Promise<boolean> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.DELETE_AUTOMATIC_MESSAGE;
        const url = CONV_CLOUD_ROUTES.AUTOMATIC_MESSAGES_BY_ID(accountId, id);
        const response = await ApiService.delete<any>(
          url,
          actionKey,
          {
            skill_id: skillId,
          },
          undefined,
          {
            revision: this.revisions.automaticMessages ?? '',
          }
        );
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.automaticMessages = skillAcRevision;
        this.automaticMessages = this.automaticMessages.filter(
          (p: AutomaticMessage) => p.id !== id
        );
        if (skillId) {
          const AM = this.automaticMessages.find(
            (p: AutomaticMessage) => p.id === id
          );
          if (AM) {
            const amSkillIndex = AM.contexts.SKILL.findIndex(
              (s: { skillId: number; enabled: boolean }) =>
                String(s.skillId) === String(skillId)
            );
            if (amSkillIndex >= 0) {
              AM.contexts.SKILL.splice(amSkillIndex, 1);
            }
          }
          const skillIndex = this.skills.findIndex(
            (s: SkillsDetailed) => s.id === Number(skillId)
          );
          if (skillIndex >= 0) {
            const skill = this.skills[skillIndex];
            if (!skill) {
              return true;
            }
            skill.automaticMessages = skill.automaticMessages || [];
            const pIndex = skill.automaticMessages.findIndex(
              (p: string) => p === id
            );
            if (pIndex >= 0) {
              skill.automaticMessages.splice(pIndex, 1);
            }
          }
        }
        return true;
      } catch {
        return false;
      }
    },
    async updateAutomaticMessage(
      body: AutomaticMessage,
      skillId?: string
    ): Promise<AutomaticMessage | null> {
      try {
        const accountId = this.accountId;
        if (!accountId) {
          throw new Error("No accountId found");
        }
        const actionKey = CONV_CLOUD_ACTION_KEYS.UPDATE_AUTOMATIC_MESSAGE;
        const url = CONV_CLOUD_ROUTES.AUTOMATIC_MESSAGES_BY_ID(
          accountId,
          body.id
        );
        const response = await ApiService.put<any>(url, body, actionKey, {
          revision: this.revisions.automaticMessages ?? '',
        });
        const headers = response.headers;
        const skillAcRevision = headers["ac-revision"];
        this.revisions.automaticMessages = skillAcRevision;
        const index = this.automaticMessages.findIndex(
          (p: AutomaticMessage) => p.id === body.id
        );
        if (index >= 0) {
          this.automaticMessages[index] = body;
        }
        if (skillId) {
          const skillIndex = this.skills.findIndex(
            (s: SkillsDetailed) => s.id === Number(skillId)
          );
          if (skillIndex >= 0) {
            const skill = this.skills[skillIndex];
            if (!skill) {
              return response.data;
            }
            skill.automaticMessages = skill.automaticMessages || [];
            const pIndex = skill.automaticMessages.findIndex(
              (p: string) => p === body.id
            );
            if (pIndex >= 0) {
              skill.automaticMessages.splice(pIndex, 1);
            }
          }
        }
        return response.data;
      } catch {
        return null;
      }
    },

    // async sendWebView (accountId: string, body: any): Promise<any | null> {
    //   try {
    //     const actionKey = CONV_CLOUD_ACTION_KEYS.SEND_WEBVIEW
    //     const url = CONV_CLOUD_ROUTES.WEBVIEW(accountId)
    //     const { data } = await ApiService.post<any>(url, body, actionKey)
    //     return data
    //   } catch (error) {
    //     Notify.create({
    //       type: 'lpFail',
    //       spinner: false,
    //       message: 'Error',
    //       caption: ErrorService.handleRequestError(error)
    //     })
    //     return null
    //   }
    // },
    // async getAccountConfig (): Promise<any | null> {
    //   try {
    //     const accountId = this.getaccountId()
    //     if (!accountId) {
    //       throw new Error('No accountId found')
    //     }
    //     const actionKey = CONV_CLOUD_ACTION_KEYS.GET_ACCOUNT_CONFIG
    //     const url = CONV_CLOUD_ROUTES.ACCOUNT_CONFIG(accountId)
    //     const { data } = await ApiService.get<any>(url, actionKey)
    //     const theme = data.find((x: any) => x.id === 'le.general.theme')
    //     const value = theme?.propertyValue?.value
    //     console.info(`theme: ${value}`)
    //     useUserStore().setDark(value === 'dark')
    //     Dark.set(value === 'dark')
    //     console.info(theme)
    //     return data
    //   } catch (error) {
    //     Notify.create({
    //       type: 'lpFail',
    //       spinner: false,
    //       message: 'Error',
    //       caption: ErrorService.handleRequestError(error)
    //     })
    //     return null
    //   }
    // },
    // async getConversationById (id: string) {
    //   try {
    //     const accountId = this.getaccountId()
    //     if (!accountId) {
    //       throw new Error('No accountId found')
    //     }
    //     const actionKey = CONV_CLOUD_ACTION_KEYS.GET_CONVERSATION_BY_ID
    //     const url = CONV_CLOUD_ROUTES.CONVERSATION_BY_ID(accountId, id)
    //     const { data } = await ApiService.get<any>(url, actionKey)
    //     return data
    //   } catch (error) {
    //     Notify.create({
    //       type: 'lpFail',
    //       spinner: false,
    //       message: 'Error',
    //       caption: ErrorService.handleRequestError(error)
    //     })
    //     return []
    //   }
    // }
  },
});
