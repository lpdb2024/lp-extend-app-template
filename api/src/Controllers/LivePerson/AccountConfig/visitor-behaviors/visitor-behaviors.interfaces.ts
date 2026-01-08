/**
 * Visitor Behaviors API Interfaces
 * TypeScript interfaces for LivePerson Visitor Behaviors API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Condition box types for visitor behaviors
 */
export enum ConditionBoxType {
  ALL = 0,
  FLOW = 5,
  TIME_ON_PAGE = 6,
  ENGAGEMENT_ATTRIBUTE = 13,
  CART = 14,
}

/**
 * Visitor behavior entity
 */
export interface IVisitorBehavior extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  isSystemDefault?: boolean;
  systemDefault?: boolean;
  deleted?: boolean;
  conditionBoxTypes?: ConditionBoxType[];
  modifiedDate?: string;
  createdDate?: string;
}

/**
 * Visitor behavior creation request
 */
export interface IVisitorBehaviorCreateRequest {
  name: string;
  description?: string;
  conditionBoxTypes?: ConditionBoxType[];
}

/**
 * Visitor behavior update request
 */
export interface IVisitorBehaviorUpdateRequest {
  name?: string;
  description?: string;
  conditionBoxTypes?: ConditionBoxType[];
}

/**
 * Visitor behavior query parameters
 */
export interface IVisitorBehaviorQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  include_deleted?: boolean;
}
