/**
 * Onsite Locations API Interfaces
 * TypeScript interfaces for LivePerson Onsite Locations API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Condition box types for onsite locations
 */
export enum OnsiteLocationConditionBoxType {
  ALL = 0,
  URL = 4,
}

/**
 * Onsite location entity
 */
export interface IOnsiteLocation extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  isSystemDefault?: boolean;
  systemDefault?: boolean;
  deleted?: boolean;
  conditionBoxTypes?: OnsiteLocationConditionBoxType[];
  appInstallationId?: string;
  modifiedDate?: string;
  createdDate?: string;
}

/**
 * Onsite location creation request
 */
export interface IOnsiteLocationCreateRequest {
  name: string;
  description?: string;
  conditionBoxTypes?: OnsiteLocationConditionBoxType[];
  appInstallationId?: string;
}

/**
 * Onsite location update request
 */
export interface IOnsiteLocationUpdateRequest {
  name?: string;
  description?: string;
  conditionBoxTypes?: OnsiteLocationConditionBoxType[];
  appInstallationId?: string;
}

/**
 * Onsite location query parameters
 */
export interface IOnsiteLocationQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  include_deleted?: boolean;
}
