/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ROLES } from 'src/constants';
import type { ISkill } from './'

export interface IManagerOf {
  agentGroupId: number;
  assignmentDate: Date;
}
export interface IAgentGroup {
  roleTypeId: number;
  name: string;
  id: number;
}

export interface NameAndId {
  name: string;
  id: number | string;
}

export interface IFaas {
  uuid: string
  version: number
  name: string
  eventId?: string
  description: string
  samplePayload: {
    headers: string[]
    payload: any
  }
  state: string
  runtime: {
    uuid: string
    name: string
    baseImageName: string
  }
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  minInstances: number
  size: string
  skills: string[]
  implementation: {
    code: string
    dependencies: string[]
    environmentVariables: string[]
  }
}



export interface AutomaticMessage {
  deleted: boolean;
  data: { msg: string; lang: string }[];
  attributes: { timer?: string; timerUnit?: string };
  id: string;
  contexts: {
    ACCOUNT: { id: string }[];
    SKILL: { skillId: number; enabled: boolean }[];
  };
  enabled: boolean;
}

export interface AutomaticMessageContext {
  ACCOUNT: { [key: string]: { id: string; deleted: boolean; enabled: boolean; data: any[]; attributes: any }[] };
  SKILL: { [key: string]: { id: string; deleted: boolean; skillId: number; enabled: boolean; data: any[]; attributes: any }[] };
}

export interface PredefinedContent {
  id: string
  name: string
  data?: { isDefault: boolean; lang: string; msg: string; title: string; }[]
  message: string
  categories: string[]
  deleted: boolean
  dateUpdated: string
  dateCreated: string
  createdBy: string
  updatedBy: string
  skills?: { id: string; name: string }[]
  skillIds?: number[]
}

export interface ISkillRequest {
  id?: number | string | null;
  name: string;
  description: string;
  maxWaitTime: number;
  skillRoutingConfiguration: any[];
  defaultPostChatSurveyId: string | null;
  defaultOfflineSurveyId: string | null;
  defaultAgentSurveyId: string | null;
  wrapUpTime: number | null;
  lobIds: number[];
  canTransfer: boolean;
  skillTransferList: any[];
  slaDefaultResponseTime: number | null;
  slaUrgentResponseTime: number | null;
  slaFirstTimeResponseTime: number | null;
  transferToAgentMaxWaitInSeconds: number | null;
  workingHoursId: number | null;
  specialOccasionId: number | null;
  autoCloseInSeconds: number | null;
  fallbackSkill: number | null;
  fallbackWhenAllAgentsAreAway: boolean;
  agentSurveyForMsgId: number | null;
  agentSurveyForMsgTimeoutInMinutes: number | null;
  redistributeLoadToConnectedAgentGroups: boolean;
}

export interface CCUser {
  userTypeId: number;
  resetMfaSecret: boolean;
  isApiUser: boolean;
  profileIds: number[];
  permissionGroups: number[];
  pid: string;
  allowedAppKeys: string;
  skills: ISkill[];
  changePwdNextLogin: boolean;
  dateCreated: Date;
  disabledManually: boolean;
  maxChats: number;
  skillIds: number[];
  loginName: string;
  nickname: string;
  id: number;
  memberOf: {
    agentGroupId: number;
    assignmentDate: Date;
  },
  lpaCreatedUser: boolean;
  email: string;
  lobs: number[];
  managerOf: IManagerOf[];
  pictureUrl: string;
  profiles: IAgentGroup[];
  fullName: string;
  employeeId: string;
  managedAgentGroups: ISkill[];
  dateUpdated: string;
  pnCertName: string;
  deleted: boolean;
  isEnabled: boolean;
  lastPwdChangeDate: string;
}

export interface AppUser  extends CCUser {
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
  accountId: string;
  displayName: string;
  email: string;
  roles: ROLES[];
  permissions: string[];
  photoUrl: string;
  isLPA: boolean;
  termsAgreed: boolean;
  installedApps: string[];
  appPermissions: string[];
}

export interface AgentGroup {
  deleted: boolean;
  isEnabled: boolean;
  members: number[];
  name: string;
  id: number;
  managers: number[];
  dateUpdated: string;
}
export interface ConvCloudAppKeyBasic {
  developerID: string
  appName: string
  appDescription: string
  purpose: string
  privileges: {
    [key: string]: string
  }[]
  keyId: string
  enabled: boolean
  appSecret: string
  token: string
  tokenSecret: string
  creationTime: string
  keyType: string
  ipRanges: string[]
}

export interface EncyptedKey {
  site_id: string
  appName: string
  appDescription: string
  keyId: string
  key: string
}

interface PermissionPackage {
  isEnabled: boolean;
  isDisplayed: boolean;
  featureKeys?: string[];
  id: number;
}

export interface IProfile {
  roleTypeId: number;
  deleted: boolean;
  roleTypeName: string;
  permissions: number[];
  description: string;
  name: string;
  id: number;
  numOfAssignedUsers: number;
  permissionPackages: PermissionPackage[];
  dateUpdated: string;
  isAssignedToLPA: boolean;
}
export interface LineOfBusiness {
  id: number;
  name: string;
  description?: string;
}

export interface IWorkingDayProfile {
  id: number;
  name: string;
  isDefault: boolean;
  deleted: boolean;
  description: string;
  events: {
    recurrence: string[];
    start: {
      dateTime: string;
      timeZone: string;
    };
    end: {
      dateTime: string;
      timeZone: string;
    };
  }[];
}

export interface SpecialOccasion {
  id: number;
  name: string;
  deleted: boolean;
  description: string;
  events: {
    meta: { working: boolean; name: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    recurrence: string[];
  }[];
  isDefault: boolean;
}
