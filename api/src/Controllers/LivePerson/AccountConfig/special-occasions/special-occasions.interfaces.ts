/**
 * Special Occasions Interfaces
 * TypeScript interfaces for LivePerson Special Occasions API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity, ISpecialOccasionEvent } from '../../shared/lp-common.interfaces';

/**
 * Special occasion meta data
 */
export interface ISpecialOccasionMeta {
  working: boolean;
  name: string;
}

/**
 * Special occasion event item
 */
export interface ISpecialOccasionItem {
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence?: string[];
  meta: ISpecialOccasionMeta;
}

/**
 * Special occasion entity returned by LivePerson API
 */
export interface ISpecialOccasion extends ILPBaseEntity {
  id: number;
  name?: string;
  description?: string;
  deleted?: boolean;
  isDefault?: boolean;
  events: ISpecialOccasionItem[];
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Data for creating a new special occasion
 */
export interface ICreateSpecialOccasion {
  name?: string;
  description?: string;
  isDefault?: boolean;
  events: ISpecialOccasionItem[];
}

/**
 * Data for updating a special occasion
 */
export interface IUpdateSpecialOccasion {
  name?: string;
  description?: string;
  isDefault?: boolean;
  events?: ISpecialOccasionItem[];
}

/**
 * Query parameters for special occasions list
 */
export interface ISpecialOccasionsQuery {
  select?: string;
  includeDeleted?: boolean;
}

/**
 * Response structure for special occasions list
 */
export interface ISpecialOccasionsListResponse {
  data: ISpecialOccasion[];
  revision?: string;
}

/**
 * Response structure for single special occasion
 */
export interface ISpecialOccasionResponse {
  data: ISpecialOccasion;
  revision?: string;
}

/**
 * Helper to create a holiday event (non-working day)
 */
export function createHolidayEvent(
  name: string,
  date: string,
  timeZone: string = 'America/New_York',
): ISpecialOccasionItem {
  return {
    start: {
      dateTime: `${date}T00:00:00`,
      timeZone,
    },
    end: {
      dateTime: `${date}T23:59:59`,
      timeZone,
    },
    meta: {
      working: false,
      name,
    },
  };
}

/**
 * Helper to create a special working day event
 */
export function createSpecialWorkingDayEvent(
  name: string,
  date: string,
  startTime: string,
  endTime: string,
  timeZone: string = 'America/New_York',
): ISpecialOccasionItem {
  return {
    start: {
      dateTime: `${date}T${startTime}`,
      timeZone,
    },
    end: {
      dateTime: `${date}T${endTime}`,
      timeZone,
    },
    meta: {
      working: true,
      name,
    },
  };
}
