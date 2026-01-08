/**
 * Campaigns API Interfaces
 * TypeScript interfaces for LivePerson Campaigns API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Campaign type enum
 */
export enum CampaignType {
  WEB = 0,
  BROADCAST = 1,
}

/**
 * Campaign status enum
 */
export enum CampaignStatus {
  UNPUBLISHED = 0,
  PUBLISHED = 1,
  SCHEDULED = 2,
}

/**
 * Control group configuration
 */
export interface IControlGroup {
  percentage: number;
}

/**
 * Campaign entity
 */
export interface ICampaign extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  type: CampaignType;
  startDate?: string;
  expirationDate?: string;
  goalId?: number;
  lobId?: number;
  status: CampaignStatus;
  isDeleted?: boolean;
  deleted?: boolean;
  priority?: number;
  weight?: number;
  timeZone?: string;
  startDateTimeZoneOffset?: number;
  expirationDateTimeZoneOffset?: number;
  startTimeInMinutes?: number;
  expirationTimeInMinutes?: number;
  controlGroup?: IControlGroup;
  engagements?: number[];
  engagementIds?: number[];
  visitorProfiles?: number[];
  operationHours?: number;
  engaged?: number;
  conversion?: number;
  createdDate?: string;
  modifiedDate?: string;
}

/**
 * Campaign creation request
 */
export interface ICampaignCreateRequest {
  name: string;
  description?: string;
  type?: CampaignType;
  startDate?: string;
  expirationDate?: string;
  goalId?: number;
  lobId?: number;
  status?: CampaignStatus;
  priority?: number;
  weight?: number;
  timeZone?: string;
  controlGroup?: IControlGroup;
  engagementIds?: number[];
  visitorProfiles?: number[];
  operationHours?: number;
}

/**
 * Campaign update request
 */
export interface ICampaignUpdateRequest {
  name?: string;
  description?: string;
  type?: CampaignType;
  startDate?: string;
  expirationDate?: string;
  goalId?: number;
  lobId?: number;
  status?: CampaignStatus;
  priority?: number;
  weight?: number;
  timeZone?: string;
  controlGroup?: IControlGroup;
  engagementIds?: number[];
  visitorProfiles?: number[];
  operationHours?: number;
}

/**
 * Campaign query parameters
 */
export interface ICampaignQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  filter?: string;
  include_deleted?: boolean;
}

/**
 * Available fields for campaign queries
 */
export const CAMPAIGN_FIELDS = [
  'id',
  'name',
  'description',
  'startDate',
  'expirationDate',
  'goalId',
  'lobId',
  'status',
  'isDeleted',
  'priority',
  'engagementIds',
  'weight',
  'timeZone',
  'startDateTimeZoneOffset',
  'expirationDateTimeZoneOffset',
  'startTimeInMinutes',
  'expirationTimeInMinutes',
  'type',
] as const;

export type CampaignField = (typeof CAMPAIGN_FIELDS)[number];
