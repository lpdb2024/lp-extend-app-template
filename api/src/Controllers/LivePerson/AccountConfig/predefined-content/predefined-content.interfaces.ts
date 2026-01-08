/**
 * Predefined Content Interfaces
 * TypeScript interfaces for LivePerson Predefined Content API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity, IHotkey } from '../../shared/lp-common.interfaces';

/**
 * Predefined content type
 */
export enum PredefinedContentType {
  TEXT = 0,
  HTML = 1,
}

/**
 * Content data entry for different languages
 */
export interface IPredefinedContentData {
  msg: string;
  lang: string;
  title?: string;
}

/**
 * Predefined content entity returned by LivePerson API
 */
export interface IPredefinedContent extends ILPBaseEntity {
  id: number;
  deleted?: boolean;
  enabled: boolean;
  type: number;
  data: IPredefinedContentData[];
  categoriesIds?: number[];
  skillIds?: number[];
  isDefault?: boolean;
  hotkey?: IHotkey;
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Data for creating new predefined content
 */
export interface ICreatePredefinedContent {
  enabled: boolean;
  type?: number;
  data: IPredefinedContentData[];
  categoriesIds?: number[];
  skillIds?: number[];
  hotkey?: IHotkey;
}

/**
 * Data for updating predefined content
 */
export interface IUpdatePredefinedContent {
  enabled?: boolean;
  type?: number;
  data?: IPredefinedContentData[];
  categoriesIds?: number[];
  skillIds?: number[];
  hotkey?: IHotkey;
}

/**
 * Query parameters for predefined content list
 */
export interface IPredefinedContentQuery {
  select?: string;
  includeDeleted?: boolean;
  skillIds?: string;
  categoryIds?: string;
  enabled?: boolean;
}

/**
 * Response structure for predefined content list
 */
export interface IPredefinedContentListResponse {
  data: IPredefinedContent[];
  revision?: string;
}

/**
 * Response structure for single predefined content
 */
export interface IPredefinedContentResponse {
  data: IPredefinedContent;
  revision?: string;
}

/**
 * Category for predefined content
 */
export interface IPredefinedCategory extends ILPBaseEntity {
  id: number;
  name: string;
  order?: number;
  deleted?: boolean;
  dateCreated?: string;
  dateUpdated?: string;
}

/**
 * Data for creating a predefined category
 */
export interface ICreatePredefinedCategory {
  name: string;
  order?: number;
}

/**
 * Data for updating a predefined category
 */
export interface IUpdatePredefinedCategory {
  name?: string;
  order?: number;
}

/**
 * Response structure for predefined categories list
 */
export interface IPredefinedCategoriesResponse {
  data: IPredefinedCategory[];
  revision?: string;
}

/**
 * Response structure for single predefined category
 */
export interface IPredefinedCategoryResponse {
  data: IPredefinedCategory;
  revision?: string;
}
