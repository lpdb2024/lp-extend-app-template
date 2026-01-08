/**
 * Window Configurations API Interfaces
 * TypeScript interfaces for LivePerson Window Configurations API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Custom style metadata - fonts
 */
export interface ICustomStyleFonts {
  [key: string]: string;
}

/**
 * Custom style metadata - colors
 */
export interface ICustomStyleColors {
  [key: string]: string;
}

/**
 * Custom style metadata
 */
export interface ICustomStyleMeta {
  fonts?: ICustomStyleFonts;
  colors?: ICustomStyleColors;
}

/**
 * Custom style config item attributes
 */
export interface ICustomStyleConfigAttrs {
  style?: Record<string, string>;
  options?: Record<string, unknown>;
}

/**
 * Custom style config item
 */
export interface ICustomStyleConfigItem {
  attrs?: ICustomStyleConfigAttrs;
  options?: Record<string, unknown>;
}

/**
 * Custom style configuration
 */
export interface ICustomStyle {
  v?: string;
  meta?: ICustomStyleMeta;
  config?: Record<string, ICustomStyleConfigItem>;
}

/**
 * Window configuration JSON structure
 */
export interface IWindowConfigJson {
  scheme?: string;
  surveyAgentChatEnabled?: boolean;
  surveyPreChatEnabled?: boolean;
  surveyPostChatEnabled?: boolean;
  surveyOfflineEnabled?: boolean;
  customStyle?: ICustomStyle;
  [key: string]: unknown;
}

/**
 * Window configuration entity
 */
export interface IWindowConfiguration extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  deleted?: boolean;
  isUserDefault?: boolean;
  json?: IWindowConfigJson;
  modifiedDate?: string;
  createdDate?: string;
}

/**
 * Window configuration creation request
 */
export interface IWindowConfigurationCreateRequest {
  name: string;
  description?: string;
  isUserDefault?: boolean;
  json?: IWindowConfigJson;
}

/**
 * Window configuration update request
 */
export interface IWindowConfigurationUpdateRequest {
  name?: string;
  description?: string;
  isUserDefault?: boolean;
  json?: IWindowConfigJson;
}

/**
 * Window configuration query parameters
 */
export interface IWindowConfigurationQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  include_deleted?: boolean;
}
