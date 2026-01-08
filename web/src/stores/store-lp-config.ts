/**
 * LP Config Store
 * Comprehensive store for LivePerson account configuration data
 * Used by Snapshots application for visualization, export, and backup
 */

import { defineStore } from 'pinia'
import { useUserStore } from './store-user'
import { useFirebaseAuthStore } from './store-firebase-auth'
import ApiService from 'src/services/ApiService'
import ErrorService from 'src/services/ErrorService'
import { Notify } from 'quasar'
import { AC_ROUTES, ACTION_KEYS_AC } from 'src/constants'

const handleRequestError = ErrorService.handleRequestError.bind(ErrorService)

// Helper to unwrap v2 API responses that return { data: [...], revision: "..." }
// Some endpoints return arrays directly, others wrap in { data: [...] }
// Also handles array of {data: item} objects like campaigns API returns
// Also handles single object responses: { data: {...}, revision: "..." }
function unwrapResponse<T>(response: T | { data: T; revision?: string }): T {
  // Case 1: Response is { data: ..., revision?: "..." } - handles both arrays and single objects
  if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
    return (response as { data: T }).data
  }
  // Case 2: Response is array of { data: item } objects (e.g., campaigns API)
  if (Array.isArray(response) && response.length > 0 && response[0] && typeof response[0] === 'object' && 'data' in response[0]) {
    return response.map((item: { data: unknown }) => item.data) as T
  }
  return response as T
}

// Helper to extract revision from v2 API responses
// The backend returns { data: [...], revision: "..." } in the response body
function extractRevision(response: unknown): string | null {
  if (response && typeof response === 'object' && 'revision' in response) {
    return (response as { revision: string }).revision || null
  }
  return null
}

// ============================================================================
// Interfaces
// ============================================================================

export interface LPSkill {
  id: number
  name: string
  description: string
  maxWaitTime: number
  skillOrder: number
  deleted: boolean
  dateUpdated: string
  canTransfer: boolean
  skillTransferList: number[]
  lobIds: number[]
  workingHoursId: number | null
  specialOccasionId: number | null
  fallbackSkill: number | null
  fallbackWhenAllAgentsAreAway: boolean
  autoCloseInSeconds: number | null
  skillRoutingConfiguration: {
    priority: number
    splitPercentage: number
    agentGroupId: number
  }[]
  slaDefaultResponseTime: number | null
  slaUrgentResponseTime: number | null
  slaFirstTimeResponseTime: number | null
  transferToAgentMaxWaitInSeconds: number | null
  redistributeLoadToConnectedAgentGroups: boolean
  defaultPostChatSurveyId: string | null
  defaultOfflineSurveyId: string | null
  defaultAgentSurveyId: string | null
  agentSurveyForMsgId: number | null
  postConversationSurveyAppInstallAssociationId?: string | null
}

export interface LPUser {
  id: number
  loginName: string
  fullName: string
  nickname: string
  email: string
  deleted: boolean
  isEnabled: boolean
  disabledManually: boolean
  userTypeId: number
  isApiUser: boolean
  skillIds: number[]
  profileIds: number[]
  lobIds?: number[]
  permissionGroups: number[]
  memberOf: {
    agentGroupId: number
    assignmentDate: string
  } | null
  managerOf: {
    agentGroupId: number
    assignmentDate: string
  }[]
  maxChats: number
  maxAsyncChats?: number
  pictureUrl: string
  employeeId: string
  description?: string
  mobileNumber?: string
  changePwdNextLogin: boolean
  dateUpdated: string
  dateCreated?: string
  lastPwdChangeDate: string
  pnCertName?: string
  backgndImgUri?: string
  lpaCreatedUser?: boolean
  resetMfaSecret?: boolean
  pid?: string
  allowedAppKeys?: string
}

export interface LPProfile {
  id: number
  name: string
  description: string
  roleTypeId: number
  roleTypeName: string
  deleted: boolean
  permissions: number[]
  permissionPackages: {
    id: number
    isEnabled: boolean
    isDisplayed: boolean
    featureKeys?: string[]
  }[]
  numOfAssignedUsers: number
  dateUpdated: string
  isAssignedToLPA: boolean
}

export interface LPAgentGroup {
  id: number
  name: string
  deleted: boolean
  isEnabled: boolean
  members: number[]
  managers: number[]
  dateUpdated: string
}

export interface LPLineOfBusiness {
  id: number
  name: string
  description?: string
}

export interface LPCampaign {
  id: number
  name: string
  description: string
  startDate: string
  startDateTimeZoneOffset: number
  startTimeInMinutes: number
  expirationDate?: string
  expirationDateTimeZoneOffset?: number
  expirationTimeInMinutes?: number
  goalId: number
  status: number
  isDeleted: boolean
  deleted?: boolean
  weight: number
  priority: number
  engagementIds: number[]
  timeZone: string
  type: number
  skillIds?: number[]
}

export interface LPEngagement {
  id: number
  campaignId: number
  name: string
  description: string
  deleted: boolean
  enabled: boolean
  channel: number
  type: number
  subType: number
  source: number
  language: string
  skillId: number
  skillName: string
  windowId: number
  timeInQueue: number
  followMePages: number
  followMeTime: number
  isPopOut: boolean
  isUnifiedWindow: boolean
  useSystemRouting: boolean
  allowUnauthMsg: boolean
  connectorId: number
  availabilityPolicy: number
  availabilityPolicyForMessaging: number
  renderingType: number
  conversationType: number
  onsiteLocations: number[]
  visitorBehaviors: number[]
  zones: unknown[]
  position: {
    left: number
    top: number
    type: number
  }
  displayInstances: unknown[]
  createdDate: string
  modifiedDate: string
}

export interface LPCampaignDetail extends LPCampaign {
  accountId: string
  createdDate: string
  modifiedDate: string
  visitorProfiles: number[]
  engagements: LPEngagement[]
  controlGroup?: {
    percentage: number
  }
}

export interface LPPredefinedContent {
  id: string | number
  name: string
  deleted: boolean
  enabled?: boolean
  data?: {
    isDefault: boolean
    lang: string
    msg: string
    title: string
  }[]
  hotkey?: {
    prefix: string
    suffix: string
  }
  type?: number
  categoriesIds?: number[]
  skillIds?: number[]
  lobIds?: number[]
  dateUpdated?: string
  dateCreated?: string
  createdBy?: string
  updatedBy?: string
}

export interface LPAutomaticMessage {
  id: string
  deleted: boolean
  enabled: boolean
  data: {
    msg: string
    lang: string
  }[]
  attributes: {
    timer?: string
    timerUnit?: string
  }
  contexts: {
    ACCOUNT?: { id: string }[]
    SKILL?: { skillId: number; enabled: boolean }[]
  }
}

export interface LPWorkingHours {
  id: number
  name: string
  description: string
  isDefault: boolean
  deleted: boolean
  events: {
    recurrence: string[]
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
  }[]
}

export interface LPSpecialOccasion {
  id: number
  name: string
  description: string
  isDefault: boolean
  deleted: boolean
  events: {
    meta: { working: boolean; name: string }
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    recurrence: string[]
  }[]
}

export interface LPApiKey {
  keyId: string
  developerID: string
  appName: string
  appDescription: string
  purpose: string
  enabled: boolean
  appSecret: string
  token: string
  tokenSecret: string
  creationTime: string
  keyType: string
  ipRanges: string[]
  privileges: { type: string; data: string }[]
}

export interface LPServiceWorker {
  id: string
  user_id: string
  account_id: string
  app_key: string
  created_by: string
  updated_by: string
  created_at: number
  updated_at: number
  appName?: string
  agentName?: string
  userEnabled?: boolean
  apiKeyEnabled?: boolean
}

export interface LPGoal {
  id: number
  name: string
  description: string
  deleted: boolean
  type: number
  source: number
  targetAmount?: number
  targetCurrency?: string
  indicator?: string
  visitDuration?: number
  numberOfPages?: number
  url?: string
  urlOperand?: number
  offSiteUrlOperand?: number
  offSiteUrl?: string
  searchEngineType?: number
  status?: number
}

export interface LPVisitorProfile {
  id: number
  name: string
  description: string
  deleted: boolean
  isDefault?: boolean
  conditions?: {
    type: number
    operator: number
    value: string
  }[]
}

export interface LPVisitorBehavior {
  id: number
  name: string
  description: string
  deleted: boolean
  type: number
  operator?: number
  value?: string
  configuration?: Record<string, unknown>
}

export interface LPOnsiteLocation {
  id: number
  name: string
  description: string
  deleted: boolean
  type: number
  urlOperand?: number
  url?: string
  referrerOperand?: number
  referrerUrl?: string
  includeSubfolders?: boolean
}

export interface LPWindowConfiguration {
  id: number
  name: string
  description: string
  deleted: boolean
  isDefault?: boolean
  settings?: Record<string, unknown>
  template?: string
  language?: string
}

export interface LPConnector {
  id: number | string
  name: string
  description?: string
  deleted?: boolean
  type: number
  enabled?: boolean
  displayName?: string
  clientId?: string
  grantTypes?: string[]
  responseTypes?: string[]
  scope?: string
  redirectUris?: string[]
  entryUri?: string
  logoUri?: string
  quickLaunchEnabled?: boolean
  enabledForProfiles?: number[]
  categories?: string[]
  overview?: string
  isInternal?: boolean
  configuration?: Record<string, unknown>
}

export interface LPAppInstallation {
  id: string
  client_name: string
  description?: string
  display_name?: string
  enabled?: boolean
  redirect_uris?: string[]
  grant_types: string[]
  response_types?: string[]
  scope?: string
  client_secret?: string
  client_secret_expires_at?: number
  client_id_issued_at?: number
  logo_uri?: string
  quick_launch_enabled?: boolean
  enabled_for_profiles?: number[]
  categories?: string[]
  is_internal?: boolean
  capabilities?: Record<string, unknown>
  entry_uri?: string
  overview?: string
}

export interface LPWidgetParameter {
  key: string
  value: string
}

export interface LPWidget {
  id: number
  name: string
  description?: string
  span: string
  mode: 'published' | 'draft'
  url: string
  type: 'core' | 'iFrame' | 'module'
  parameters: LPWidgetParameter[]
  skillIds: number[]
  deleted: boolean
  enabled: boolean
  order: number
  profileIds: number[]
  componentName?: string
  path?: string
}

// Account Properties (Settings)
export interface LPAccountPropertyValue {
  value: string | string[] | number | boolean | Record<string, unknown>
}

export interface LPAccountProperty {
  id: string
  createdDate?: string
  modifiedDate?: string
  type: number // 1=Boolean, 2=String, 3=Array, 4=Object
  propertyValue: LPAccountPropertyValue
  deleted: boolean
}

// Snapshot metadata
export interface SnapshotMetadata {
  accountId: string
  createdAt: number
  version: string
  entityCounts: {
    skills: number
    users: number
    profiles: number
    agentGroups: number
    lobs: number
    campaigns: number
    engagements: number
    predefinedContent: number
    automaticMessages: number
    workingHours: number
    specialOccasions: number
    apiKeys: number
    serviceWorkers: number
    goals: number
    visitorProfiles: number
    visitorBehaviors: number
    onsiteLocations: number
    windowConfigurations: number
    connectors: number
    appInstallations: number
    widgets: number
    accountProperties: number
  }
}

export interface LPConfigSnapshot {
  metadata: SnapshotMetadata
  skills: LPSkill[]
  users: LPUser[]
  profiles: LPProfile[]
  agentGroups: LPAgentGroup[]
  lobs: LPLineOfBusiness[]
  campaigns: LPCampaign[]
  campaignDetails: LPCampaignDetail[]
  predefinedContent: LPPredefinedContent[]
  automaticMessages: LPAutomaticMessage[]
  automaticMessagesDefault: LPAutomaticMessage[]
  workingHours: LPWorkingHours[]
  specialOccasions: LPSpecialOccasion[]
  apiKeys: LPApiKey[]
  serviceWorkers: LPServiceWorker[]
  goals: LPGoal[]
  visitorProfiles: LPVisitorProfile[]
  visitorBehaviors: LPVisitorBehavior[]
  onsiteLocations: LPOnsiteLocation[]
  windowConfigurations: LPWindowConfiguration[]
  connectors: LPConnector[]
  appInstallations: LPAppInstallation[]
  widgets: LPWidget[]
  accountProperties: LPAccountProperty[]
}

// Loading state keys
type LoadingKey =
  | 'skills'
  | 'users'
  | 'profiles'
  | 'agentGroups'
  | 'lobs'
  | 'campaigns'
  | 'campaignDetails'
  | 'predefinedContent'
  | 'automaticMessages'
  | 'workingHours'
  | 'specialOccasions'
  | 'apiKeys'
  | 'serviceWorkers'
  | 'goals'
  | 'visitorProfiles'
  | 'visitorBehaviors'
  | 'onsiteLocations'
  | 'windowConfigurations'
  | 'connectors'
  | 'appInstallations'
  | 'widgets'
  | 'accountProperties'
  | 'all'

// ============================================================================
// State Interface
// ============================================================================

interface LPConfigState {
  // Core entities
  skills: LPSkill[]
  users: LPUser[]
  profiles: LPProfile[]
  agentGroups: LPAgentGroup[]
  lobs: LPLineOfBusiness[]

  // Campaigns & Engagements
  campaigns: LPCampaign[]
  campaignDetails: LPCampaignDetail[]
  goals: LPGoal[]

  // Content
  predefinedContent: LPPredefinedContent[]
  automaticMessages: LPAutomaticMessage[]
  automaticMessagesDefault: LPAutomaticMessage[]

  // Scheduling
  workingHours: LPWorkingHours[]
  specialOccasions: LPSpecialOccasion[]

  // Visitor targeting
  visitorProfiles: LPVisitorProfile[]
  visitorBehaviors: LPVisitorBehavior[]
  onsiteLocations: LPOnsiteLocation[]
  windowConfigurations: LPWindowConfiguration[]

  // API & Integration
  apiKeys: LPApiKey[]
  serviceWorkers: LPServiceWorker[]
  connectors: LPConnector[]
  appInstallations: LPAppInstallation[]

  // UI Personalization
  widgets: LPWidget[]

  // Account Settings
  accountProperties: LPAccountProperty[]

  // Metadata
  revisions: Record<string, string | null>
  lastFetched: Record<string, number>
  loading: Record<LoadingKey, boolean>
  error: string | null
}

// ============================================================================
// Store Definition
// ============================================================================

export const useLPConfigStore = defineStore('lp-config', {
  state: (): LPConfigState => ({
    // Core entities
    skills: [],
    users: [],
    profiles: [],
    agentGroups: [],
    lobs: [],

    // Campaigns & Engagements
    campaigns: [],
    campaignDetails: [],
    goals: [],

    // Content
    predefinedContent: [],
    automaticMessages: [],
    automaticMessagesDefault: [],

    // Scheduling
    workingHours: [],
    specialOccasions: [],

    // Visitor targeting
    visitorProfiles: [],
    visitorBehaviors: [],
    onsiteLocations: [],
    windowConfigurations: [],

    // API & Integration
    apiKeys: [],
    serviceWorkers: [],
    connectors: [],
    appInstallations: [],

    // UI Personalization
    widgets: [],

    // Account Settings
    accountProperties: [],

    // Metadata
    revisions: {},
    lastFetched: {},
    loading: {
      skills: false,
      users: false,
      profiles: false,
      agentGroups: false,
      lobs: false,
      campaigns: false,
      campaignDetails: false,
      predefinedContent: false,
      automaticMessages: false,
      workingHours: false,
      specialOccasions: false,
      apiKeys: false,
      serviceWorkers: false,
      goals: false,
      visitorProfiles: false,
      visitorBehaviors: false,
      onsiteLocations: false,
      windowConfigurations: false,
      connectors: false,
      appInstallations: false,
      widgets: false,
      accountProperties: false,
      all: false,
    },
    error: null,
  }),

  getters: {
    // Account ID helper
    accountId(): string | null {
      return useUserStore().accountId || useFirebaseAuthStore().activeLpAccountId || sessionStorage.getItem('accountId')
    },

    // ========================================================================
    // Entity by ID getters
    // ========================================================================

    getSkillById: (state) => (id: number | string) =>
      state.skills.find((s) => String(s.id) === String(id)),

    getUserById: (state) => (id: number | string) =>
      state.users.find((u) => String(u.id) === String(id)),

    getProfileById: (state) => (id: number | string) =>
      state.profiles.find((p) => String(p.id) === String(id)),

    getAgentGroupById: (state) => (id: number | string) =>
      state.agentGroups.find((g) => String(g.id) === String(id)),

    getLobById: (state) => (id: number | string) =>
      state.lobs.find((l) => String(l.id) === String(id)),

    getCampaignById: (state) => (id: number | string) =>
      state.campaigns.find((c) => String(c.id) === String(id)),

    getCampaignDetailById: (state) => (id: number | string) =>
      state.campaignDetails.find((c) => String(c.id) === String(id)),

    getWorkingHoursById: (state) => (id: number | string) =>
      state.workingHours.find((w) => String(w.id) === String(id)),

    getSpecialOccasionById: (state) => (id: number | string) =>
      state.specialOccasions.find((s) => String(s.id) === String(id)),

    getGoalById: (state) => (id: number | string) =>
      state.goals.find((g) => String(g.id) === String(id)),

    getVisitorProfileById: (state) => (id: number | string) =>
      state.visitorProfiles.find((vp) => String(vp.id) === String(id)),

    getVisitorBehaviorById: (state) => (id: number | string) =>
      state.visitorBehaviors.find((vb) => String(vb.id) === String(id)),

    getOnsiteLocationById: (state) => (id: number | string) =>
      state.onsiteLocations.find((ol) => String(ol.id) === String(id)),

    getWindowConfigurationById: (state) => (id: number | string) =>
      state.windowConfigurations.find((wc) => String(wc.id) === String(id)),

    getConnectorById: (state) => (id: number | string) =>
      state.connectors.find((c) => String(c.id) === String(id)),

    getAppInstallationById: (state) => (id: string) =>
      state.appInstallations.find((ai) => ai.id === id),

    getWidgetById: (state) => (id: number | string) =>
      state.widgets.find((w) => String(w.id) === String(id)),

    // ========================================================================
    // Name by ID getters
    // ========================================================================

    getSkillName: (state) => (id: number | string) =>
      state.skills.find((s) => String(s.id) === String(id))?.name || `Skill ${id}`,

    getUserName: (state) => (id: number | string) =>
      state.users.find((u) => String(u.id) === String(id))?.fullName ||
      state.users.find((u) => String(u.id) === String(id))?.loginName ||
      `User ${id}`,

    getProfileName: (state) => (id: number | string) =>
      state.profiles.find((p) => String(p.id) === String(id))?.name || `Profile ${id}`,

    getLobName: (state) => (id: number | string) =>
      state.lobs.find((l) => String(l.id) === String(id))?.name || `LOB ${id}`,

    // ========================================================================
    // Relationship getters
    // ========================================================================

    // Get users assigned to a skill
    getUsersBySkillId: (state) => (skillId: number | string) =>
      state.users.filter((u) => u.skillIds?.includes(Number(skillId))),

    // Get skills assigned to a user
    getSkillsByUserId: (state) => (userId: number | string) => {
      const user = state.users.find((u) => String(u.id) === String(userId))
      if (!user?.skillIds) return []
      return state.skills.filter((s) => user.skillIds.includes(s.id))
    },

    // Get LOBs for a skill
    getLobsBySkillId: (state) => (skillId: number | string) => {
      const skill = state.skills.find((s) => String(s.id) === String(skillId))
      if (!skill?.lobIds) return []
      return state.lobs.filter((l) => skill.lobIds.includes(l.id))
    },

    // Get skills in a LOB
    getSkillsByLobId: (state) => (lobId: number | string) =>
      state.skills.filter((s) => s.lobIds?.includes(Number(lobId))),

    // Get transfer skills for a skill
    getTransferSkills: (state) => (skillId: number | string) => {
      const skill = state.skills.find((s) => String(s.id) === String(skillId))
      if (!skill?.skillTransferList) return []
      return state.skills.filter((s) => skill.skillTransferList.includes(s.id))
    },

    // Get profiles for a user
    getProfilesByUserId: (state) => (userId: number | string) => {
      const user = state.users.find((u) => String(u.id) === String(userId))
      if (!user?.profileIds) return []
      return state.profiles.filter((p) => user.profileIds.includes(p.id))
    },

    // Get users with a profile
    getUsersByProfileId: (state) => (profileId: number | string) =>
      state.users.filter((u) => u.profileIds?.includes(Number(profileId))),

    // Get agent group for a user
    getAgentGroupByUserId: (state) => (userId: number | string) => {
      const user = state.users.find((u) => String(u.id) === String(userId))
      if (!user?.memberOf?.agentGroupId) return null
      return state.agentGroups.find(
        (g) => String(g.id) === String(user.memberOf?.agentGroupId)
      )
    },

    // Get members of an agent group
    getMembersByAgentGroupId: (state) => (groupId: number | string) => {
      const group = state.agentGroups.find((g) => String(g.id) === String(groupId))
      if (!group?.members) return []
      return state.users.filter((u) => group.members.includes(u.id))
    },

    // Get campaigns using a skill (from engagement routing)
    getCampaignsBySkillId: (state) => (skillId: number | string) => {
      const campaignIds = new Set<number>()
      state.campaignDetails.filter((d) => d != null).forEach((detail) => {
        detail.engagements?.forEach((eng) => {
          if (String(eng.skillId) === String(skillId)) {
            campaignIds.add(detail.id)
          }
        })
      })
      return state.campaigns.filter((c) => campaignIds.has(c.id))
    },

    // Get engagements using a skill
    getEngagementsBySkillId: (state) => (skillId: number | string) => {
      const engagements: LPEngagement[] = []
      state.campaignDetails.filter((d) => d != null).forEach((detail) => {
        detail.engagements?.forEach((eng) => {
          if (String(eng.skillId) === String(skillId)) {
            engagements.push({ ...eng, campaignId: detail.id })
          }
        })
      })
      return engagements
    },

    // Get working hours for a skill
    getWorkingHoursBySkillId: (state) => (skillId: number | string) => {
      const skill = state.skills.find((s) => String(s.id) === String(skillId))
      if (!skill?.workingHoursId) return null
      return state.workingHours.find((w) => w.id === skill.workingHoursId)
    },

    // Get special occasion for a skill
    getSpecialOccasionBySkillId: (state) => (skillId: number | string) => {
      const skill = state.skills.find((s) => String(s.id) === String(skillId))
      if (!skill?.specialOccasionId) return null
      return state.specialOccasions.find((s) => s.id === skill.specialOccasionId)
    },

    // ========================================================================
    // Aggregation getters
    // ========================================================================

    // Total engagement count across all campaigns
    totalEngagementCount: (state) =>
      state.campaignDetails
        .filter((c) => c != null)
        .reduce((sum, c) => sum + (c.engagements?.length || 0), 0),

    // Active skills (not deleted)
    activeSkills: (state) => state.skills.filter((s) => !s.deleted),

    // Active users (enabled and not deleted)
    activeUsers: (state) => state.users.filter((u) => u.isEnabled && !u.deleted),

    // Human users (not bots)
    humanUsers: (state) =>
      state.users.filter((u) => u.userTypeId === 1 && !u.deleted),

    // Bot users
    botUsers: (state) =>
      state.users.filter((u) => u.userTypeId === 2 && !u.deleted),

    // Active campaigns
    activeCampaigns: (state) =>
      state.campaigns.filter((c) => c.status === 1 && !c.isDeleted),

    // ========================================================================
    // Stats getters
    // ========================================================================

    entityCounts: (state) => ({
      skills: state.skills.length,
      activeSkills: state.skills.filter((s) => !s.deleted).length,
      users: state.users.length,
      activeUsers: state.users.filter((u) => u.isEnabled && !u.deleted).length,
      humanUsers: state.users.filter((u) => u.userTypeId === 1).length,
      botUsers: state.users.filter((u) => u.userTypeId === 2).length,
      profiles: state.profiles.length,
      agentGroups: state.agentGroups.length,
      lobs: state.lobs.length,
      campaigns: state.campaigns.length,
      activeCampaigns: state.campaigns.filter((c) => c.status === 1).length,
      engagements: state.campaignDetails
        .filter((c) => c != null)
        .reduce((sum, c) => sum + (c.engagements?.length || 0), 0),
      predefinedContent: state.predefinedContent.length,
      automaticMessages: state.automaticMessages.length + state.automaticMessagesDefault.length,
      workingHours: state.workingHours.length,
      specialOccasions: state.specialOccasions.length,
      apiKeys: state.apiKeys.length,
      serviceWorkers: state.serviceWorkers.length,
    }),

    // Average skills per user
    avgSkillsPerUser: (state) => {
      const usersWithSkills = state.users.filter((u) => u.skillIds?.length > 0)
      if (usersWithSkills.length === 0) return 0
      const totalSkills = usersWithSkills.reduce(
        (sum, u) => sum + (u.skillIds?.length || 0),
        0
      )
      return Math.round((totalSkills / usersWithSkills.length) * 10) / 10
    },

    // Average users per skill
    avgUsersPerSkill: (state) => {
      if (state.skills.length === 0) return 0
      const totalAssignments = state.users.reduce(
        (sum, u) => sum + (u.skillIds?.length || 0),
        0
      )
      return Math.round((totalAssignments / state.skills.length) * 10) / 10
    },

    // Is any data loading
    isLoading: (state) => Object.values(state.loading).some((v) => v),

    // Has data been fetched
    hasData: (state) =>
      state.skills.length > 0 ||
      state.users.length > 0 ||
      state.campaigns.length > 0,
  },

  actions: {
    // TEMP
    // lpConfigStore.loadSnapshot(MOCK);
    loadSnapshot(snapshot: LPConfigSnapshot) {
      // Snapshot data is already unwrapped, so assign directly without transformation
      this.skills = snapshot.skills || []
      this.users = snapshot.users || []
      this.profiles = snapshot.profiles || []
      this.agentGroups = snapshot.agentGroups || []
      this.lobs = snapshot.lobs || []
      this.campaigns = snapshot.campaigns || []
      this.campaignDetails = snapshot.campaignDetails || []
      this.predefinedContent = snapshot.predefinedContent || []
      this.automaticMessages = snapshot.automaticMessages || []
      this.automaticMessagesDefault = snapshot.automaticMessagesDefault || []
      this.workingHours = snapshot.workingHours || []
      this.specialOccasions = snapshot.specialOccasions || []
      this.apiKeys = snapshot.apiKeys || []
      this.serviceWorkers = snapshot.serviceWorkers || []
      this.goals = snapshot.goals || []
      this.visitorProfiles = snapshot.visitorProfiles || []
      this.visitorBehaviors = snapshot.visitorBehaviors || []
      this.onsiteLocations = snapshot.onsiteLocations || []
      this.windowConfigurations = snapshot.windowConfigurations || []
      this.connectors = snapshot.connectors || []
      this.appInstallations = snapshot.appInstallations || []
      this.widgets = snapshot.widgets || []
      this.accountProperties = snapshot.accountProperties || []
    },
    // ========================================================================
    // Fetch Actions
    // ========================================================================

    async fetchSkills(useCache = false): Promise<LPSkill[]> {
      if (useCache && this.skills.length > 0) return this.skills
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.skills = true
      try {
        const url = AC_ROUTES.SKILLS(accountId)
        const { data } = await ApiService.get<LPSkill[]>(url, ACTION_KEYS_AC.SKILL_GET_ALL)
        const items = unwrapResponse(data)
        this.skills = items.sort((a, b) => a.name.localeCompare(b.name))
        // Extract revision from response body (backend returns { data: [...], revision: "..." })
        this.revisions.skills = extractRevision(data)
        this.lastFetched.skills = Date.now()
        return this.skills
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.skills = false
      }
    },

    async fetchUsers(useCache = false): Promise<LPUser[]> {
      if (useCache && this.users.length > 0) return this.users
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.users = true
      try {
        const url = AC_ROUTES.USERS(accountId)
        const { data } = await ApiService.get<LPUser[]>(url, ACTION_KEYS_AC.USERS_GET)
        const items = unwrapResponse(data)
        this.users = items.sort((a, b) => (a.fullName || a.loginName).localeCompare(b.fullName || b.loginName))
        // Extract revision from response body (backend returns { data: [...], revision: "..." })
        this.revisions.users = extractRevision(data)
        this.lastFetched.users = Date.now()
        return this.users
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.users = false
      }
    },

    /**
     * Fetch a single user by ID with all fields
     * This ensures we have complete user data before updates
     */
    async fetchUserById(userId: number): Promise<LPUser | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = AC_ROUTES.USERS_BY_ID(accountId, userId)
        const { data } = await ApiService.get<LPUser>(url, `${ACTION_KEYS_AC.USERS_GET}_${userId}`)
        const user = unwrapResponse(data)

        // Update revision from response
        const revision = extractRevision(data)
        if (revision) {
          this.revisions.users = revision
        }

        // Update in local state if exists
        const index = this.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          this.users[index] = user
        }

        return user
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async fetchProfiles(useCache = false): Promise<LPProfile[]> {
      if (useCache && this.profiles.length > 0) return this.profiles
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.profiles = true
      try {
        const url = AC_ROUTES.PROFILES(accountId)
        const { data } = await ApiService.get<LPProfile[]>(url, ACTION_KEYS_AC.PROFILES_GET)
        const items = unwrapResponse(data)
        this.profiles = items.sort((a, b) => a.name.localeCompare(b.name))
        // Extract revision from response body (backend returns { data: [...], revision: "..." })
        this.revisions.profiles = extractRevision(data)
        this.lastFetched.profiles = Date.now()
        return this.profiles
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.profiles = false
      }
    },

    async fetchAgentGroups(useCache = false): Promise<LPAgentGroup[]> {
      if (useCache && this.agentGroups.length > 0) return this.agentGroups
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.agentGroups = true
      try {
        const url = AC_ROUTES.AGENT_GROUPS(accountId)
        const { data } = await ApiService.get<LPAgentGroup[]>(url, ACTION_KEYS_AC.AGENT_GROUPS_GET)
        const items = unwrapResponse(data)
        this.agentGroups = items.sort((a, b) => a.name.localeCompare(b.name))
        this.revisions.agentGroups = extractRevision(data)
        this.lastFetched.agentGroups = Date.now()
        return this.agentGroups
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.agentGroups = false
      }
    },

    async fetchLobs(useCache = false): Promise<LPLineOfBusiness[]> {
      if (useCache && this.lobs.length > 0) return this.lobs
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.lobs = true
      try {
        const url = AC_ROUTES.LOBS(accountId)
        const { data } = await ApiService.get<LPLineOfBusiness[]>(url, ACTION_KEYS_AC.LOBS_GET)
        const items = unwrapResponse(data)
        this.lobs = items.sort((a, b) => a.name.localeCompare(b.name))
        this.revisions.lobs = extractRevision(data)
        this.lastFetched.lobs = Date.now()
        return this.lobs
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.lobs = false
      }
    },

    async fetchCampaigns(useCache = false): Promise<LPCampaign[]> {
      if (useCache && this.campaigns.length > 0) return this.campaigns
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.campaigns = true
      try {
        const url = AC_ROUTES.CAMPAIGNS(accountId)
        const { data } = await ApiService.get<LPCampaign[]>(url, ACTION_KEYS_AC.CAMPAIGNS_GET_ALL)
        const items = unwrapResponse(data)
        this.campaigns = items.sort((a, b) => a.name.localeCompare(b.name))
        this.revisions.campaigns = extractRevision(data)
        this.lastFetched.campaigns = Date.now()
        return this.campaigns
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.campaigns = false
      }
    },

    async fetchCampaignDetail(campaignId: number | string): Promise<LPCampaignDetail | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = AC_ROUTES.CAMPAIGNS_BY_ID(accountId, campaignId)
        // Use dynamic action key to allow parallel fetches for different campaigns
        const actionKey = `${ACTION_KEYS_AC.CAMPAIGNS_BY_ID}_${campaignId}`
        const { data } = await ApiService.get<LPCampaignDetail>(url, actionKey)
        const item = unwrapResponse(data)

        // Update or add to campaignDetails
        const existingIndex = this.campaignDetails.findIndex(
          (c) => c != null && String(c.id) === String(campaignId)
        )
        if (existingIndex >= 0) {
          this.campaignDetails[existingIndex] = item
        } else {
          this.campaignDetails.push(item)
        }
        return item
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async fetchAllCampaignDetails(): Promise<LPCampaignDetail[]> {
      this.loading.campaignDetails = true
      try {
        // First ensure we have campaigns
        if (this.campaigns.length === 0) {
          await this.fetchCampaigns()
        }

        // Fetch details for each campaign (fetchCampaignDetail updates this.campaignDetails internally)
        await Promise.all(
          this.campaigns.map((c) => this.fetchCampaignDetail(c.id))
        )

        this.lastFetched.campaignDetails = Date.now()
        return this.campaignDetails
      } finally {
        this.loading.campaignDetails = false
      }
    },

    async fetchPredefinedContent(useCache = false): Promise<LPPredefinedContent[]> {
      if (useCache && this.predefinedContent.length > 0) return this.predefinedContent
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.predefinedContent = true
      try {
        const url = AC_ROUTES.PREDEFINED_CONTENT(accountId)
        const { data } = await ApiService.get<LPPredefinedContent[]>(
          url,
          ACTION_KEYS_AC.PREDEFINED_CONTENT_GET
        )
        this.predefinedContent = unwrapResponse(data)
        this.revisions.predefinedContent = extractRevision(data)
        this.lastFetched.predefinedContent = Date.now()
        return this.predefinedContent
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.predefinedContent = false
      }
    },

    async fetchAutomaticMessages(useCache = false): Promise<LPAutomaticMessage[]> {
      if (useCache && this.automaticMessages.length > 0) return this.automaticMessages
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.automaticMessages = true
      try {
        const url = AC_ROUTES.AUTOMATIC_MESSAGES(accountId)
        const { data } = await ApiService.get<LPAutomaticMessage[]>(
          url,
          ACTION_KEYS_AC.AUTOMATIC_MESSAGES_GET
        )
        this.automaticMessages = unwrapResponse(data)
        this.revisions.automaticMessages = extractRevision(data)
        this.lastFetched.automaticMessages = Date.now()
        return this.automaticMessages
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.automaticMessages = false
      }
    },

    async fetchAutomaticMessagesDefault(useCache = false): Promise<LPAutomaticMessage[]> {
      if (useCache && this.automaticMessagesDefault.length > 0) return this.automaticMessagesDefault
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = AC_ROUTES.AUTOMATIC_MESSAGES_DEFAULT(accountId)
        const { data } = await ApiService.get<LPAutomaticMessage[]>(
          url,
          ACTION_KEYS_AC.AUTOMATIC_MESSAGES_GET_DEFAULT
        )
        this.automaticMessagesDefault = unwrapResponse(data)
        return this.automaticMessagesDefault
      } catch (error) {
        handleRequestError(error, true)
        return []
      }
    },

    async fetchWorkingHours(useCache = false): Promise<LPWorkingHours[]> {
      if (useCache && this.workingHours.length > 0) return this.workingHours
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.workingHours = true
      try {
        const url = AC_ROUTES.WORKING_HOURS(accountId)
        const { data } = await ApiService.get<LPWorkingHours[]>(url, ACTION_KEYS_AC.WORKING_HOURS_GET)
        const items = unwrapResponse(data)
        this.workingHours = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.workingHours = Date.now()
        return this.workingHours
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.workingHours = false
      }
    },

    async fetchSpecialOccasions(useCache = false): Promise<LPSpecialOccasion[]> {
      if (useCache && this.specialOccasions.length > 0) return this.specialOccasions
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.specialOccasions = true
      try {
        const url = AC_ROUTES.SPECIAL_OCCASIONS(accountId)
        const { data } = await ApiService.get<LPSpecialOccasion[]>(
          url,
          ACTION_KEYS_AC.SPECIAL_OCCASIONS_GET
        )
        const items = unwrapResponse(data)
        this.specialOccasions = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.specialOccasions = Date.now()
        return this.specialOccasions
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.specialOccasions = false
      }
    },

    async fetchApiKeys(useCache = false): Promise<LPApiKey[]> {
      if (useCache && this.apiKeys.length > 0) return this.apiKeys
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.apiKeys = true
      try {
        const url = AC_ROUTES.APP_KEYS(accountId)
        const { data } = await ApiService.get<LPApiKey[]>(url, ACTION_KEYS_AC.APP_KEYS_GET)
        const items = unwrapResponse(data)
        this.apiKeys = items.sort((a, b) => a.appName.localeCompare(b.appName))
        this.lastFetched.apiKeys = Date.now()
        return this.apiKeys
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.apiKeys = false
      }
    },

    async fetchServiceWorkers(useCache = false): Promise<LPServiceWorker[]> {
      if (useCache && this.serviceWorkers.length > 0) return this.serviceWorkers
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.serviceWorkers = true
      try {
        const url = AC_ROUTES.SERVICE_WORKERS(accountId)
        const { data } = await ApiService.get<LPServiceWorker[]>(url, ACTION_KEYS_AC.GET_SERVICE_WORKERS)
        const items = unwrapResponse(data)

        // Enrich with user and app key names
        for (const worker of items) {
          const user = this.users.find((u) => String(u.id) === String(worker.user_id))
          const appKey = this.apiKeys.find((k) => k.keyId === worker.app_key)
          worker.appName = appKey?.appName || worker.app_key
          worker.agentName = user?.loginName || worker.user_id
          worker.userEnabled = user?.isEnabled ?? false
          worker.apiKeyEnabled = appKey?.enabled ?? false
        }

        this.serviceWorkers = items
        this.lastFetched.serviceWorkers = Date.now()
        return this.serviceWorkers
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.serviceWorkers = false
      }
    },

    async fetchGoals(useCache = false): Promise<LPGoal[]> {
      if (useCache && this.goals.length > 0) return this.goals
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.goals = true
      try {
        const url = AC_ROUTES.GOALS(accountId)
        const { data } = await ApiService.get<LPGoal[]>(url, ACTION_KEYS_AC.GOALS_GET)
        const items = unwrapResponse(data)
        this.goals = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.goals = Date.now()
        return this.goals
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.goals = false
      }
    },

    async fetchVisitorProfiles(useCache = false): Promise<LPVisitorProfile[]> {
      if (useCache && this.visitorProfiles.length > 0) return this.visitorProfiles
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.visitorProfiles = true
      try {
        const url = AC_ROUTES.VISITOR_PROFILES(accountId)
        const { data } = await ApiService.get<LPVisitorProfile[]>(url, ACTION_KEYS_AC.VISITOR_PROFILES_GET)
        const items = unwrapResponse(data)
        this.visitorProfiles = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.visitorProfiles = Date.now()
        return this.visitorProfiles
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.visitorProfiles = false
      }
    },

    async fetchVisitorBehaviors(useCache = false): Promise<LPVisitorBehavior[]> {
      if (useCache && this.visitorBehaviors.length > 0) return this.visitorBehaviors
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.visitorBehaviors = true
      try {
        const url = AC_ROUTES.VISITOR_BEHAVIORS(accountId)
        const { data } = await ApiService.get<LPVisitorBehavior[]>(url, ACTION_KEYS_AC.VISITOR_BEHAVIORS_GET)
        const items = unwrapResponse(data)
        this.visitorBehaviors = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.visitorBehaviors = Date.now()
        return this.visitorBehaviors
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.visitorBehaviors = false
      }
    },

    async fetchOnsiteLocations(useCache = false): Promise<LPOnsiteLocation[]> {
      if (useCache && this.onsiteLocations.length > 0) return this.onsiteLocations
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.onsiteLocations = true
      try {
        const url = AC_ROUTES.ONSITE_LOCATIONS(accountId)
        const { data } = await ApiService.get<LPOnsiteLocation[]>(url, ACTION_KEYS_AC.ONSITE_LOCATIONS_GET)
        const items = unwrapResponse(data)
        this.onsiteLocations = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.onsiteLocations = Date.now()
        return this.onsiteLocations
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.onsiteLocations = false
      }
    },

    async fetchWindowConfigurations(useCache = false): Promise<LPWindowConfiguration[]> {
      if (useCache && this.windowConfigurations.length > 0) return this.windowConfigurations
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.windowConfigurations = true
      try {
        const url = AC_ROUTES.WINDOW_CONFIGURATIONS(accountId)
        const { data } = await ApiService.get<LPWindowConfiguration[]>(url, ACTION_KEYS_AC.WINDOW_CONFIGURATIONS_GET)
        const items = unwrapResponse(data)
        this.windowConfigurations = items.sort((a, b) => a.name.localeCompare(b.name))
        this.lastFetched.windowConfigurations = Date.now()
        return this.windowConfigurations
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.windowConfigurations = false
      }
    },

    async fetchConnectors(useCache = false): Promise<LPConnector[]> {
      if (useCache && this.connectors.length > 0) return this.connectors
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.connectors = true
      try {
        const url = AC_ROUTES.CONNECTORS(accountId)
        const { data } = await ApiService.get<LPConnector[]>(url, ACTION_KEYS_AC.CONNECTORS_GET)
        const items = unwrapResponse(data)
        this.connectors = Array.isArray(items) ? items.sort((a, b) => a.name.localeCompare(b.name)) : []
        this.lastFetched.connectors = Date.now()
        return this.connectors
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.connectors = false
      }
    },

    async fetchAppInstallations(useCache = false): Promise<LPAppInstallation[]> {
      if (useCache && this.appInstallations.length > 0) return this.appInstallations
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.appInstallations = true
      try {
        const url = AC_ROUTES.APP_INSTALLATIONS(accountId)
        const { data } = await ApiService.get<LPAppInstallation[]>(url, ACTION_KEYS_AC.APP_INSTALLATIONS_GET)
        const items = unwrapResponse(data)
        this.appInstallations = Array.isArray(items) ? items.sort((a, b) => a.client_name.localeCompare(b.client_name)) : []
        this.lastFetched.appInstallations = Date.now()
        return this.appInstallations
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.appInstallations = false
      }
    },

    async fetchWidgets(useCache = false): Promise<LPWidget[]> {
      if (useCache && this.widgets.length > 0) return this.widgets
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.widgets = true
      try {
        const url = AC_ROUTES.WIDGETS(accountId)
        const { data } = await ApiService.get<LPWidget[]>(url, ACTION_KEYS_AC.WIDGETS_GET)
        const items = unwrapResponse(data)
        this.widgets = Array.isArray(items) ? items.sort((a, b) => a.name.localeCompare(b.name)) : []
        this.lastFetched.widgets = Date.now()
        return this.widgets
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.widgets = false
      }
    },

    async fetchAccountProperties(useCache = false): Promise<LPAccountProperty[]> {
      if (useCache && this.accountProperties.length > 0) return this.accountProperties
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      this.loading.accountProperties = true
      try {
        const url = AC_ROUTES.ACCOUNT_PROPERTIES(accountId)
        const { data } = await ApiService.get<LPAccountProperty[]>(url, ACTION_KEYS_AC.ACCOUNT_PROPERTIES_GET)
        const items = unwrapResponse(data)
        this.accountProperties = Array.isArray(items) ? items : []
        this.revisions.accountProperties = extractRevision(data)
        this.lastFetched.accountProperties = Date.now()
        return this.accountProperties
      } catch (error) {
        handleRequestError(error, true)
        return []
      } finally {
        this.loading.accountProperties = false
      }
    },

    // ========================================================================
    // Bulk Fetch
    // ========================================================================

    async fetchAllConfig(showNotification = true): Promise<void> {
      this.loading.all = true
      this.error = null

      const notification = showNotification
        ? Notify.create({
            type: 'ongoing',
            message: 'Loading account configuration...',
            spinner: true,
            timeout: 0,
            position: 'top',
          })
        : null

      try {
        // Parallel fetch of all non-dependent data
        await Promise.all([
          this.fetchSkills(),
          this.fetchUsers(),
          this.fetchProfiles(),
          this.fetchAgentGroups(),
          this.fetchLobs(),
          this.fetchCampaigns(),
          this.fetchPredefinedContent(),
          this.fetchAutomaticMessages(),
          this.fetchAutomaticMessagesDefault(),
          this.fetchWorkingHours(),
          this.fetchSpecialOccasions(),
          this.fetchApiKeys(),
          this.fetchGoals(),
          this.fetchVisitorProfiles(),
          this.fetchVisitorBehaviors(),
          this.fetchOnsiteLocations(),
          this.fetchWindowConfigurations(),
          this.fetchConnectors(),
          this.fetchAppInstallations(),
          this.fetchWidgets(),
          this.fetchAccountProperties(),
        ])

        // Fetch campaign details (depends on campaigns)
        await this.fetchAllCampaignDetails()

        // Fetch service workers (depends on users and apiKeys)
        // await this.fetchServiceWorkers()

        if (notification) {
          notification({
            type: 'positive',
            message: 'Account configuration loaded',
            spinner: false,
            timeout: 2000,
          })
        }
      } catch (error) {
        this.error = 'Failed to load account configuration'
        if (notification) {
          notification({
            type: 'negative',
            message: 'Failed to load configuration',
            spinner: false,
            timeout: 3000,
          })
        }
        throw error
      } finally {
        this.loading.all = false
      }
    },

    // ========================================================================
    // Snapshot Export
    // ========================================================================

    getSnapshot(): LPConfigSnapshot {
      const accountId = this.accountId || 'unknown'
      return {
        metadata: {
          accountId,
          createdAt: Date.now(),
          version: '1.0.0',
          entityCounts: {
            skills: this.skills.length,
            users: this.users.length,
            profiles: this.profiles.length,
            agentGroups: this.agentGroups.length,
            lobs: this.lobs.length,
            campaigns: this.campaigns.length,
            engagements: this.campaignDetails
              .filter((c) => c != null)
              .reduce((sum, c) => sum + (c.engagements?.length || 0), 0),
            predefinedContent: this.predefinedContent.length,
            automaticMessages:
              this.automaticMessages.length + this.automaticMessagesDefault.length,
            workingHours: this.workingHours.length,
            specialOccasions: this.specialOccasions.length,
            apiKeys: this.apiKeys.length,
            serviceWorkers: this.serviceWorkers.length,
            goals: this.goals.length,
            visitorProfiles: this.visitorProfiles.length,
            visitorBehaviors: this.visitorBehaviors.length,
            onsiteLocations: this.onsiteLocations.length,
            windowConfigurations: this.windowConfigurations.length,
            connectors: this.connectors.length,
            appInstallations: this.appInstallations.length,
            widgets: this.widgets.length,
            accountProperties: this.accountProperties.length,
          },
        },
        skills: this.skills,
        users: this.users,
        profiles: this.profiles,
        agentGroups: this.agentGroups,
        lobs: this.lobs,
        campaigns: this.campaigns,
        campaignDetails: this.campaignDetails,
        predefinedContent: this.predefinedContent,
        automaticMessages: this.automaticMessages,
        automaticMessagesDefault: this.automaticMessagesDefault,
        workingHours: this.workingHours,
        specialOccasions: this.specialOccasions,
        apiKeys: this.apiKeys,
        serviceWorkers: this.serviceWorkers,
        goals: this.goals,
        visitorProfiles: this.visitorProfiles,
        visitorBehaviors: this.visitorBehaviors,
        onsiteLocations: this.onsiteLocations,
        windowConfigurations: this.windowConfigurations,
        connectors: this.connectors,
        appInstallations: this.appInstallations,
        widgets: this.widgets,
        accountProperties: this.accountProperties,
      }
    },

    downloadSnapshot(filename?: string): void {
      const snapshot = this.getSnapshot()
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        filename ||
        `lp-snapshot-${snapshot.metadata.accountId}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      Notify.create({
        type: 'positive',
        message: 'Snapshot downloaded',
        timeout: 2000,
      })
    },

    // ========================================================================
    // Skill CRUD Operations
    // ========================================================================

    async updateSkill(
      skillId: number,
      updates: Partial<LPSkill>
    ): Promise<LPSkill | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      // Auto-fetch skills if revision is missing
      if (!this.revisions.skills) {
        await this.fetchSkills()
      }

      const revision = this.revisions.skills
      if (!revision) {
        throw new Error('Failed to get skills revision')
      }

      try {
        const url = AC_ROUTES.SKILLS_BY_ID(accountId, skillId)
        const { data } = await ApiService.put<LPSkill>(
          url,
          updates,
          ACTION_KEYS_AC.SKILL_UPDATE,
          { 'If-Match': revision }
        )
        const updatedSkill = unwrapResponse(data)

        // Update local state
        const index = this.skills.findIndex((s) => s.id === skillId)
        if (index !== -1) {
          this.skills[index] = { ...this.skills[index], ...updatedSkill }
        }
        // Extract revision from response body
        this.revisions.skills = extractRevision(data) || revision

        Notify.create({
          type: 'positive',
          message: `Skill "${updatedSkill.name}" updated successfully`,
          timeout: 3000,
        })

        return updatedSkill
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async deleteSkill(skillId: number): Promise<boolean> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      // Auto-fetch skills if revision is missing
      if (!this.revisions.skills) {
        await this.fetchSkills()
      }

      const revision = this.revisions.skills
      if (!revision) {
        throw new Error('Failed to get skills revision')
      }

      try {
        const url = AC_ROUTES.SKILLS_BY_ID(accountId, skillId)
        // ApiService.delete signature: (path, key, params?, body?, headers?)
        // If-Match must be passed as header, not query param
        const { data } = await ApiService.delete(
          url,
          ACTION_KEYS_AC.SKILL_DELETE,
          undefined, // params
          undefined, // body
          { 'If-Match': revision } // headers
        )

        // Update local state - mark as deleted
        const index = this.skills.findIndex((s) => s.id === skillId)
        if (index !== -1 && this.skills[index]) {
          this.skills[index].deleted = true
        }
        // Extract revision from response body
        this.revisions.skills = extractRevision(data) || revision

        Notify.create({
          type: 'positive',
          message: 'Skill deleted successfully',
          timeout: 3000,
        })

        return true
      } catch (error) {
        handleRequestError(error, true)
        return false
      }
    },

    /**
     * Check skill dependencies before deletion
     * Returns information about users assigned to the skill
     */
    async checkSkillDependencies(skillId: number): Promise<{
      skillId: number
      skillName: string
      hasDependencies: boolean
      users: { id: string; loginName: string; fullName?: string }[]
    } | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = AC_ROUTES.SKILLS_DEPENDENCIES(accountId, skillId)
        const { data } = await ApiService.get(url, ACTION_KEYS_AC.SKILL_DEPENDENCIES)
        return data as {
          skillId: number
          skillName: string
          hasDependencies: boolean
          users: { id: string; loginName: string; fullName?: string }[]
        }
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    /**
     * Smart delete skill with automatic dependency management
     * mode='check': Returns dependencies without deleting
     * mode='force': Removes skill from all users, then deletes the skill
     */
    async smartDeleteSkill(
      skillId: number,
      mode: 'check' | 'force'
    ): Promise<{
      success: boolean
      message?: string
      dependencies?: {
        skillId: number
        skillName: string
        hasDependencies: boolean
        users: { id: string; loginName: string; fullName?: string }[]
      }
      usersUpdated?: string[]
      usersFailed?: { userId: string; error: string }[]
    } | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      try {
        const url = AC_ROUTES.SKILLS_SMART_DELETE(accountId, skillId)
        const { data } = await ApiService.post(url, { mode }, ACTION_KEYS_AC.SKILL_SMART_DELETE)
        const result = data as {
          success: boolean
          message?: string
          dependencies?: {
            skillId: number
            skillName: string
            hasDependencies: boolean
            users: { id: string; loginName: string; fullName?: string }[]
          }
          usersUpdated?: string[]
          usersFailed?: { userId: string; error: string }[]
        }

        // If force mode succeeded, update local state
        if (mode === 'force' && result.success) {
          // Mark skill as deleted locally
          const index = this.skills.findIndex((s) => s.id === skillId)
          if (index !== -1 && this.skills[index]) {
            this.skills[index].deleted = true
          }

          // Refresh users to get updated skillIds
          await this.fetchUsers()

          Notify.create({
            type: 'positive',
            message: result.message || 'Skill deleted successfully',
            timeout: 3000,
          })
        } else if (mode === 'force' && !result.success) {
          Notify.create({
            type: 'negative',
            message: result.message || 'Failed to delete skill',
            timeout: 5000,
          })
        }

        return result
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async deleteSkillsBulk(skillIds: number[]): Promise<{ success: number; failed: number }> {
      const results = { success: 0, failed: 0 }

      for (const skillId of skillIds) {
        const success = await this.deleteSkill(skillId)
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      }

      if (results.success > 0) {
        Notify.create({
          type: results.failed > 0 ? 'warning' : 'positive',
          message: `Deleted ${results.success} skill(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          timeout: 3000,
        })
      }

      return results
    },

    async createSkill(
      skillData: Partial<LPSkill>
    ): Promise<LPSkill | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      const revision = this.revisions.skills

      try {
        const url = AC_ROUTES.SKILLS(accountId)
        const headers: Record<string, string> = {}
        if (revision) {
          headers['If-Match'] = revision
        }

        const { data, headers: resHeaders } = await ApiService.post<LPSkill>(
          url,
          skillData,
          ACTION_KEYS_AC.SKILL_CREATE,
          headers
        )
        const newSkill = unwrapResponse(data)

        // Update local state
        this.skills.push(newSkill)
        this.skills.sort((a, b) => a.name.localeCompare(b.name))
        this.revisions.skills = resHeaders['ac-revision'] || revision

        Notify.create({
          type: 'positive',
          message: `Skill "${newSkill.name}" created successfully`,
          timeout: 3000,
        })

        return newSkill
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    // ========================================================================
    // User CRUD Operations
    // ========================================================================

    async updateUser(
      userId: number,
      updates: Partial<LPUser>
    ): Promise<LPUser | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      // Fetch fresh user data by ID to ensure we have complete data
      const freshUser = await this.fetchUserById(userId)
      if (!freshUser) {
        throw new Error(`Failed to fetch user with id ${userId}`)
      }

      const revision = this.revisions.users
      if (!revision) {
        throw new Error('Failed to get users revision')
      }

      // Build the full user object with updates merged
      // Start with the fresh user data, then apply updates on top
      const mergedData = {
        ...freshUser,
        ...updates,
      }

      // Build API payload with ALL fields from IUpdateUserRequest
      // Note: managerOf is NOT part of the update interface (read-only field)
      // Note: loginName is NOT part of the update interface (only for create)
      // Note: LP API requires memberOf.agentGroupId to be a STRING, not number
      // Note: LP API rejects null values in ID arrays
      const fullUserData: Record<string, unknown> = {
        // Core updatable fields - always include
        fullName: mergedData.fullName || '',
        nickname: mergedData.nickname || '',
        email: mergedData.email || '',
        isEnabled: mergedData.isEnabled ?? true,
        maxChats: mergedData.maxChats ?? 0,
        changePwdNextLogin: mergedData.changePwdNextLogin ?? false,
        // ID arrays - filter out any null/undefined values
        skillIds: (mergedData.skillIds || []).filter((id): id is number => id != null),
        profileIds: (mergedData.profileIds || []).filter((id): id is number => id != null),
        lobIds: (mergedData.lobIds || []).filter((id): id is number => id != null),
        // Permission groups - include as-is
        permissionGroups: mergedData.permissionGroups || [],
      }

      // Include maxAsyncChats if it has a value
      if (mergedData.maxAsyncChats != null) {
        fullUserData.maxAsyncChats = mergedData.maxAsyncChats
      }

      // Include optional string fields if they have values
      if (mergedData.employeeId) fullUserData.employeeId = mergedData.employeeId
      if (mergedData.description) fullUserData.description = mergedData.description
      if (mergedData.mobileNumber) fullUserData.mobileNumber = mergedData.mobileNumber
      if (mergedData.pictureUrl) fullUserData.pictureUrl = mergedData.pictureUrl

      // memberOf - agentGroupId MUST be a STRING per LP API validation
      // Note: -1 is "Main Group" internal value
      if (mergedData.memberOf && mergedData.memberOf.agentGroupId != null) {
        const agentGroupId = Number(mergedData.memberOf.agentGroupId)
        // Include if it's a valid ID (>= -1 for Main Group)
        if (!isNaN(agentGroupId)) {
          fullUserData.memberOf = {
            agentGroupId: String(agentGroupId),  // MUST be string per LP API
            assignmentDate: mergedData.memberOf.assignmentDate,
          }
        }
      }
      // NOTE: managerOf is intentionally NOT included - it's not part of the update schema

      try {
        const url = AC_ROUTES.USERS_BY_ID(accountId, userId)
        const { data } = await ApiService.put<LPUser>(
          url,
          fullUserData,
          ACTION_KEYS_AC.USERS_UPDATE,
          { 'If-Match': revision }
        )
        const updatedUser = unwrapResponse(data)

        // Update local state
        const index = this.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updatedUser }
        }
        // Extract revision from response body
        this.revisions.users = extractRevision(data) || revision

        Notify.create({
          type: 'positive',
          message: `User "${updatedUser.loginName}" updated successfully`,
          timeout: 3000,
        })

        return updatedUser
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    async updateUserSkills(
      userId: number,
      skillIds: number[]
    ): Promise<LPUser | null> {
      return this.updateUser(userId, { skillIds })
    },

    async bulkAssignSkillsToUsers(
      userIds: number[],
      skillIdsToAdd: number[]
    ): Promise<{ success: number; failed: number }> {
      const results = { success: 0, failed: 0 }

      for (const userId of userIds) {
        // IMPORTANT: Fetch fresh user data from API, not from local store
        const freshUser = await this.fetchUserById(userId)
        if (!freshUser) {
          results.failed++
          continue
        }

        // Merge existing skills with new ones (no duplicates)
        const currentSkillIds = freshUser.skillIds || []
        const newSkillIds = [...new Set([...currentSkillIds, ...skillIdsToAdd])]

        // Only update if skills actually changed
        if (newSkillIds.length === currentSkillIds.length) {
          // All skills already assigned, skip
          results.success++
          continue
        }

        const success = await this.updateUserSkills(userId, newSkillIds)
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      }

      if (results.success > 0) {
        Notify.create({
          type: results.failed > 0 ? 'warning' : 'positive',
          message: `Updated skills for ${results.success} user(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          timeout: 3000,
        })
      }

      return results
    },

    /**
     * Remove skills from multiple users using LP's batch API
     * This is much more efficient than updating users one-by-one
     */
    async bulkRemoveSkillsFromUsers(
      userIds: number[],
      skillIdsToRemove: number[]
    ): Promise<{ success: number; failed: number }> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      console.log('[bulkRemoveSkillsFromUsers] START with batch API', { userIds, skillIdsToRemove })

      // Use the new batch API endpoint for each skill to remove
      // The LP batch API allows removing specific values from array fields
      for (const skillId of skillIdsToRemove) {
        try {
          const url = AC_ROUTES.USERS_BATCH_REMOVE_SKILL(accountId)
          await ApiService.post(
            url,
            { skillId, userIds },
            ACTION_KEYS_AC.USERS_BATCH_REMOVE_SKILL
          )
          console.log('[bulkRemoveSkillsFromUsers] batch API success for skill', { skillId, userCount: userIds.length })
        } catch (error) {
          console.error('[bulkRemoveSkillsFromUsers] batch API error', { skillId, error })
          handleRequestError(error, true)
          return { success: 0, failed: userIds.length }
        }
      }

      // Refresh users to get updated data
      await this.fetchUsers()

      Notify.create({
        type: 'positive',
        message: `Removed ${skillIdsToRemove.length} skill(s) from ${userIds.length} user(s)`,
        timeout: 3000,
      })

      return { success: userIds.length, failed: 0 }
    },

    /**
     * Legacy method - remove skills from users one-by-one
     * @deprecated Use bulkRemoveSkillsFromUsers instead
     */
    async bulkRemoveSkillsFromUsersLegacy(
      userIds: number[],
      skillIdsToRemove: number[]
    ): Promise<{ success: number; failed: number }> {
      const results = { success: 0, failed: 0 }

      console.log('[bulkRemoveSkillsFromUsersLegacy] START', { userIds, skillIdsToRemove })

      for (const userId of userIds) {
        // IMPORTANT: Fetch fresh user data from API, not from local store
        const freshUser = await this.fetchUserById(userId)
        console.log('[bulkRemoveSkillsFromUsersLegacy] freshUser fetched', {
          userId,
          freshUserSkillIds: freshUser?.skillIds,
          freshUserLoginName: freshUser?.loginName,
        })
        if (!freshUser) {
          results.failed++
          continue
        }

        // Remove specified skills from the FRESH user data
        const currentSkillIds = freshUser.skillIds || []
        const newSkillIds = currentSkillIds.filter(
          (id) => !skillIdsToRemove.includes(id)
        )

        console.log('[bulkRemoveSkillsFromUsersLegacy] skill calculation', {
          userId,
          currentSkillIds,
          skillIdsToRemove,
          newSkillIds,
        })

        // Only update if skills actually changed
        if (newSkillIds.length === currentSkillIds.length) {
          // No skills to remove, skip
          console.log('[bulkRemoveSkillsFromUsersLegacy] SKIPPING - no change', { userId })
          results.success++
          continue
        }

        console.log('[bulkRemoveSkillsFromUsersLegacy] calling updateUserSkills', { userId, newSkillIds })
        const success = await this.updateUserSkills(userId, newSkillIds)
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      }

      if (results.success > 0) {
        Notify.create({
          type: results.failed > 0 ? 'warning' : 'positive',
          message: `Removed skills from ${results.success} user(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          timeout: 3000,
        })
      }

      return results
    },

    async bulkSetAgentGroup(
      userIds: number[],
      agentGroupId: number | null
    ): Promise<{ success: number; failed: number }> {
      const results = { success: 0, failed: 0 }

      for (const userId of userIds) {
        const memberOf = agentGroupId
          ? { agentGroupId, assignmentDate: new Date().toISOString() }
          : null
        const success = await this.updateUser(userId, { memberOf })
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      }

      if (results.success > 0) {
        Notify.create({
          type: results.failed > 0 ? 'warning' : 'positive',
          message: `Updated agent group for ${results.success} user(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          timeout: 3000,
        })
      }

      return results
    },

    async bulkSetUserEnabled(
      userIds: number[],
      isEnabled: boolean
    ): Promise<{ success: number; failed: number }> {
      const results = { success: 0, failed: 0 }

      for (const userId of userIds) {
        const success = await this.updateUser(userId, { isEnabled })
        if (success) {
          results.success++
        } else {
          results.failed++
        }
      }

      if (results.success > 0) {
        Notify.create({
          type: results.failed > 0 ? 'warning' : 'positive',
          message: `${isEnabled ? 'Enabled' : 'Disabled'} ${results.success} user(s)${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          timeout: 3000,
        })
      }

      return results
    },

    // ========================================================================
    // Engagement Operations
    // ========================================================================

    async deleteEngagement(
      campaignId: number,
      engagementId: number
    ): Promise<boolean> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      // Get a fresh revision from campaigns
      if (this.campaigns.length === 0) {
        await this.fetchCampaigns()
      }
      const revision = this.revisions.campaigns
      if (!revision) {
        throw new Error('No revision found for campaigns')
      }

      try {
        const url = AC_ROUTES.ENGAGEMENTS_BY_ID(accountId, campaignId, engagementId)
        await ApiService.delete(
          url,
          ACTION_KEYS_AC.ENGAGEMENT_DELETE,
          undefined,
          undefined,
          { revision }
        )

        // Update local state - remove from campaignDetails
        const campaignDetail = this.campaignDetails.find(c => c.id === campaignId)
        if (campaignDetail?.engagements) {
          campaignDetail.engagements = campaignDetail.engagements.filter(
            e => e.id !== engagementId
          )
        }

        return true
      } catch (error) {
        handleRequestError(error, true)
        return false
      }
    },

    // ========================================================================
    // Predefined Content Operations
    // ========================================================================

    async updatePredefinedContent(
      contentId: number,
      updates: Partial<LPPredefinedContent>
    ): Promise<LPPredefinedContent | null> {
      const accountId = this.accountId
      if (!accountId) throw new Error('No accountId found')

      // Ensure we have predefined content loaded
      if (this.predefinedContent.length === 0) {
        await this.fetchPredefinedContent()
      }
      const revision = this.revisions.predefinedContent
      if (!revision) {
        throw new Error('No revision found for predefined content')
      }

      // Get current content item
      const currentContent = this.predefinedContent.find(p => p.id === contentId)
      if (!currentContent) {
        throw new Error(`Predefined content with id ${contentId} not found`)
      }

      // Merge updates with current content
      const updatedContent = {
        ...currentContent,
        ...updates,
      }

      try {
        const url = AC_ROUTES.PREDEFINED_CONTENT_BY_ID(accountId, contentId)
        const { data, headers } = await ApiService.put<{ data: LPPredefinedContent; revision?: string } | LPPredefinedContent>(
          url,
          updatedContent,
          ACTION_KEYS_AC.PREDEFINED_CONTENT_UPDATE,
          { 'If-Match': revision }
        )
        // Handle response which may be wrapped in { data: ..., revision: ... } or direct
        const result: LPPredefinedContent = (data && typeof data === 'object' && 'data' in data && !Array.isArray(data))
          ? (data as { data: LPPredefinedContent }).data
          : data as LPPredefinedContent

        // Update local state
        const index = this.predefinedContent.findIndex(p => p.id === contentId)
        if (index !== -1) {
          this.predefinedContent[index] = result
        }
        this.revisions.predefinedContent = headers['ac-revision'] || extractRevision(data) || revision

        return result
      } catch (error) {
        handleRequestError(error, true)
        return null
      }
    },

    // ========================================================================
    // Reset
    // ========================================================================

    resetState(): void {
      this.$reset()
    },
  },

  persist: {
    storage: sessionStorage,
    pick: ['lastFetched'],
  },
})
