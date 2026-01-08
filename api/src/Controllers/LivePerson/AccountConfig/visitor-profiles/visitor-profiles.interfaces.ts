/**
 * Visitor Profiles (Audiences) API Interfaces
 * TypeScript interfaces for LivePerson Visitor Profiles API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Condition box types for visitor profiles
 */
export enum VisitorProfileConditionBoxType {
  ALL = 0,
  FLOW = 5,
  TIME_ON_PAGE = 6,
  ENGAGEMENT_ATTRIBUTE = 13,
  CART = 14,
}

/**
 * Visitor profile entity (audience)
 */
export interface IVisitorProfile extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  isSystemDefault?: boolean;
  systemDefault?: boolean;
  deleted?: boolean;
  conditionBoxTypes?: VisitorProfileConditionBoxType[];
  modifiedDate?: string;
  createdDate?: string;
}

/**
 * Visitor profile creation request
 */
export interface IVisitorProfileCreateRequest {
  name: string;
  description?: string;
  conditionBoxTypes?: VisitorProfileConditionBoxType[];
}

/**
 * Visitor profile update request
 */
export interface IVisitorProfileUpdateRequest {
  name?: string;
  description?: string;
  conditionBoxTypes?: VisitorProfileConditionBoxType[];
}

/**
 * Visitor profile query parameters
 */
export interface IVisitorProfileQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  include_deleted?: boolean;
}
