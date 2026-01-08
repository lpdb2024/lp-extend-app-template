/**
 * Working Hours Interfaces
 * TypeScript interfaces for LivePerson Working Hours (Workdays) API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity, IWorkingHoursEvent } from '../../shared/lp-common.interfaces';

/**
 * Days of the week
 */
export enum DayOfWeek {
  SUNDAY = 'SU',
  MONDAY = 'MO',
  TUESDAY = 'TU',
  WEDNESDAY = 'WE',
  THURSDAY = 'TH',
  FRIDAY = 'FR',
  SATURDAY = 'SA',
}

/**
 * Recurrence type
 */
export enum RecurrenceType {
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

/**
 * Working hours item (single time slot)
 */
export interface IWorkingHoursItem {
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence: string[];
}

/**
 * Working hours entity returned by LivePerson API
 */
export interface IWorkingHours extends ILPBaseEntity {
  id: number;
  name?: string;
  description?: string;
  deleted?: boolean;
  isDefault?: boolean;
  events: IWorkingHoursItem[];
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Data for creating new working hours
 */
export interface ICreateWorkingHours {
  name?: string;
  description?: string;
  isDefault?: boolean;
  events: IWorkingHoursItem[];
}

/**
 * Data for updating working hours
 */
export interface IUpdateWorkingHours {
  name?: string;
  description?: string;
  isDefault?: boolean;
  events?: IWorkingHoursItem[];
}

/**
 * Query parameters for working hours list
 */
export interface IWorkingHoursQuery {
  select?: string;
  includeDeleted?: boolean;
}

/**
 * Response structure for working hours list
 */
export interface IWorkingHoursListResponse {
  data: IWorkingHours[];
  revision?: string;
}

/**
 * Response structure for single working hours
 */
export interface IWorkingHoursResponse {
  data: IWorkingHours;
  revision?: string;
}

/**
 * Helper to create a weekly recurrence string
 */
export function createWeeklyRecurrence(days: DayOfWeek[]): string[] {
  return [`RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}`];
}

/**
 * Standard working hours preset (Mon-Fri 9-5)
 */
export const STANDARD_WORKING_HOURS: IWorkingHoursItem = {
  start: {
    dateTime: '09:00:00',
    timeZone: 'America/New_York',
  },
  end: {
    dateTime: '17:00:00',
    timeZone: 'America/New_York',
  },
  recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
};
