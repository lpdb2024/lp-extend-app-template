/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IColor } from './interfaces'

export interface ISkill {
  name: string;
  id: number;
}

export interface IEngagement {
  id: string;
  name: string;
  brand_name: string;
  site_id: string;
  intents: string[];
  button_label: string;
  button_type: string;
  background: IColor;
  color: IColor
  routing: ISkill
}

export interface ISkillInfo {
  canTransfer: boolean;
  maxWaitTime: number;
  skillRoutingConfiguration: any[];
  description: string;
  fallbackWhenAllAgentsAreAway: boolean;
  lobIds: number[];
  fallbackSkill: number;
  autoCloseInSeconds: number;
  dateUpdated: string;
  agentSurveyForMsgId: number;
  workingHoursId: number;
  skillOrder: number;
  slaFirstTimeResponseTime: number;
  deleted: boolean;
  slaUrgentResponseTime: number;
  name: string;
  defaultAgentSurveyId: string;
  redistributeLoadToConnectedAgentGroups: boolean;
  id: number;
  slaDefaultResponseTime: number;
  skillTransferList: number[];
  transferToAgentMaxWaitInSeconds: number;
  defaultPostChatSurveyId: string;
  postConversationSurveyAppInstallAssociationId: string;
}

export interface SkillsDetailed extends ISkillInfo {
  bots?: { id: number; name: string }[]
  campaigns?: { id: string | number; name: string}[]
  engagements?: { campaignId: string, id: string | number; name: string}[]
  agents?: { id: string | number; name: string}[]
  automaticMessages?: string[]
  predefinedContent?: { id: string | number; name: string; message?: string }[]
}

/*
"expirationDate": "2026-11-30 23:59:59",
    "expirationDateTimeZoneOffset": -18000000,
    "expirationTimeInMinutes": 737093,
*/

export interface ICampaign {
  id: number;
  name: string;
  skillIds?: number[];
  description: string;
  startDate: string;
  startDateTimeZoneOffset: number;
  startTimeInMinutes: number;
  expirationDate?: string;
  expirationDateTimeZoneOffset?: number;
  expirationTimeInMinutes?: number;
  goalId: number;
  status: number;
  isDeleted: boolean;
  weight: number;
  priority: number;
  engagementIds: number[];
  timeZone: string;
  type: number;
}

export interface ICampaignEngagement {
  deleted: boolean;
  id: number;
  campaignId?: number;
  campaignName?: string;
  name: string;
  description: string;
  modifiedDate: string;
  createdDate: string;
  channel: number;
  type: number;
  onsiteLocations: number[];
  visitorBehaviors: number[];
  enabled: boolean;
  language: string;
  position: {
    left: number;
    top: number;
    type: number;
  };
  displayInstances: {
    events: {
      click: {
        enabled: boolean;
        target: string;
      };
    };
    presentation: {
      border: {
        color: string;
        width: number;
        radius: number;
      };
      size: {
        width: string;
        height: string;
      };
      background: {
        image: string;
        color: string;
      };
      elements: {
        images: {
          css: {
            top: number;
            left: number;
            zIndex: number;
          };
          imageUrl: string;
          alt: string;
        }[];
        labels: {
          css: {
            transform: string;
            fontFamily: string;
            color: string;
            top: number;
            left: number;
            'white-space': string;
            fontSize: number;
            fontStyle: string;
            fontWeight: string;
            zIndex: number;
          };
          text: string;
        }[];
      };
    };
    macros: any[];
    displayInstanceType: number;
    enabled: boolean;
  }[];
  skillId: number;
  skillName: string;
  timeInQueue: number;
  followMePages: number;
  followMeTime: number;
  windowId: number;
  isPopOut: boolean;
  isUnifiedWindow: boolean;
  useSystemRouting: boolean;
  allowUnauthMsg: boolean;
  zones: any[];
  subType: number;
  source: number;
  connectorId: number;
  availabilityPolicy: number;
  availabilityPolicyForMessaging: number;
  renderingType: number;
  conversationType: number;
}

export interface ICampaignInfo {
  id: number;
  accountId: string;
  createdDate: string;
  modifiedDate: string;
  visitorProfiles: number[];
  engagements: ICampaignEngagement[];
  name: string;
  description: string;
  startDate: string;
  startDateTimeZoneOffset: number;
  startTimeInMinutes: number;
  goalId: number;
  status: number;
  controlGroup: {
    percentage: number;
  };
  isDeleted: boolean;
  deleted: boolean;
  weight: number;
  priority: number;
  engagementIds: number[];
  timeZone: string;
  type: number;
}


