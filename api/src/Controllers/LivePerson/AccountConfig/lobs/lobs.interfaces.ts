/**
 * LOBs (Lines of Business) Interfaces
 * TypeScript interfaces for LivePerson LOBs API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * LOB entity returned by LivePerson API
 */
export interface ILob extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  deleted?: boolean;
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Data for creating a new LOB
 */
export interface ICreateLob {
  name: string;
  description?: string;
}

/**
 * Data for updating a LOB
 */
export interface IUpdateLob {
  name?: string;
  description?: string;
}

/**
 * Query parameters for LOBs list
 */
export interface ILobsQuery {
  select?: string;
  includeDeleted?: boolean;
}

/**
 * Response structure for LOBs list
 */
export interface ILobsResponse {
  data: ILob[];
  revision?: string;
}

/**
 * Response structure for single LOB
 */
export interface ILobResponse {
  data: ILob;
  revision?: string;
}
