/**
 * Goals API Interfaces
 * TypeScript interfaces for LivePerson Goals API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Goal type enum
 */
export enum GoalType {
  INTERACT = 4,
  PURCHASE = 1,
  GENERATE_LEAD = 2,
  SERVICE = 3,
}

/**
 * Goal indicator type
 */
export enum GoalIndicatorType {
  URL = 1,
  ENGAGEMENT_ATTRIBUTE = 2,
  INTERACTION = 3,
}

/**
 * Goal entity
 */
export interface IGoal extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  type: GoalType;
  indicatorType: GoalIndicatorType;
  systemDefault?: boolean;
  deleted?: boolean;
  modifiedDate?: string;
  createdDate?: string;
}

/**
 * Goal creation request
 */
export interface IGoalCreateRequest {
  name: string;
  description?: string;
  type: GoalType;
  indicatorType: GoalIndicatorType;
}

/**
 * Goal update request
 */
export interface IGoalUpdateRequest {
  name?: string;
  description?: string;
  type?: GoalType;
  indicatorType?: GoalIndicatorType;
}

/**
 * Goal query parameters
 */
export interface IGoalQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  include_deleted?: boolean;
}
