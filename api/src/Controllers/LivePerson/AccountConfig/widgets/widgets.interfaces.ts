/**
 * Widgets Interfaces
 * TypeScript interfaces for LivePerson Widgets API (UI Personalization)
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Widget parameter (for iFrame and module widgets)
 */
export interface IWidgetParameter {
  name: string;
  value: string;
}

/**
 * Widget entity returned by LivePerson API
 */
export interface IWidget extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  span: string;
  mode: 'published' | 'draft';
  url: string;
  type: 'core' | 'iFrame' | 'module';
  parameters: IWidgetParameter[];
  skillIds: number[];
  deleted: boolean;
  enabled: boolean;
  order: number;
  profileIds: number[];
  /** For module widgets */
  componentName?: string;
  /** For module widgets - path to the UMD JS file */
  path?: string;
}

/**
 * Data for creating a new Widget
 */
export interface ICreateWidget {
  name: string;
  description?: string;
  span?: string;
  mode?: 'published' | 'draft';
  url?: string;
  type: 'iFrame' | 'module';
  parameters?: IWidgetParameter[];
  skillIds?: number[];
  enabled?: boolean;
  order?: number;
  profileIds?: number[];
  componentName?: string;
  path?: string;
}

/**
 * Data for updating a Widget
 */
export interface IUpdateWidget {
  name?: string;
  description?: string;
  span?: string;
  mode?: 'published' | 'draft';
  url?: string;
  parameters?: IWidgetParameter[];
  skillIds?: number[];
  enabled?: boolean;
  order?: number;
  profileIds?: number[];
  componentName?: string;
  path?: string;
}

/**
 * Query parameters for Widgets list
 */
export interface IWidgetsQuery {
  select?: string;
  return?: 'active' | 'all';
}

/**
 * Response structure for Widgets list
 */
export interface IWidgetsResponse {
  data: IWidget[];
  revision?: string;
}

/**
 * Response structure for single Widget
 */
export interface IWidgetResponse {
  data: IWidget;
  revision?: string;
}
