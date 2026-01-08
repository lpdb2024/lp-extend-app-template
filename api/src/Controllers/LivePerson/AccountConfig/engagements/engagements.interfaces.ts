/**
 * Engagements API Interfaces
 * TypeScript interfaces for LivePerson Engagements API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Engagement channel types
 */
export enum EngagementChannel {
  WEB = 1,
  MOBILE_APP = 2,
}

/**
 * Engagement types
 */
export enum EngagementType {
  PEELING_CORNER = 0,
  OVERLAY = 1,
  TOASTER = 2,
  SLIDE_OUT = 3,
  EMBEDDED = 4,
  STICKY = 5,
  PROACTIVE = 6,
  CONTENT_OFFER = 7,
  BANNER = 8,
  BUTTON = 9,
  CONTENT_BANNER = 10,
  OFFSITE = 11,
  LANDING_PAGE = 12,
  APP_INSTALL = 13,
}

/**
 * Engagement sub-types
 */
export enum EngagementSubType {
  OVERLAY = 5,
  EMBEDDED = 6,
  PEELING_CORNER_LEFT = 10,
  PEELING_CORNER_RIGHT = 11,
  TOASTER = 13,
  SLIDE_OUT = 18,
  STICKY = 24,
  MOBILE_SDK = 34,
}

/**
 * Engagement source types
 */
export enum EngagementSource {
  WEB = 0,
  MOBILE_SDK = 12,
}

/**
 * Availability policy
 */
export enum AvailabilityPolicy {
  ONLINE_ONLY = 0,
  ALWAYS_SHOW = 1,
}

/**
 * Availability policy for messaging
 */
export enum AvailabilityPolicyForMessaging {
  ONLINE_ONLY = 0,
  ALWAYS_SHOW = 1,
}

/**
 * Rendering type
 */
export enum RenderingType {
  EMBEDDED = 0,
  POPUP = 1,
}

/**
 * Conversation type
 */
export enum ConversationType {
  LIVE_CHAT = 0,
  MESSAGING = 1,
}

/**
 * Position type for engagement placement
 */
export enum PositionType {
  TOP_LEFT = 1,
  TOP_CENTER = 2,
  TOP_RIGHT = 3,
  MIDDLE_LEFT = 4,
  MIDDLE_CENTER = 5,
  MIDDLE_RIGHT = 6,
  BOTTOM_LEFT = 7,
  BOTTOM_CENTER = 8,
  BOTTOM_RIGHT = 9,
  CUSTOM = 10,
  TOASTER = 11,
}

/**
 * Display instance types
 */
export enum DisplayInstanceType {
  OFFLINE = 1,
  ONLINE = 2,
  BUSY = 4,
}

/**
 * Position configuration
 */
export interface IEngagementPosition {
  left: number;
  top: number;
  type: PositionType;
}

/**
 * Effects configuration
 */
export interface IEngagementEffects {
  useLightBox?: boolean;
  secondsToCollapseAfter?: number;
  displayStartState?: number;
}

/**
 * CSS style object
 */
export interface ICssStyle {
  [key: string]: string | number;
}

/**
 * Click event configuration
 */
export interface IClickEvent {
  enabled: boolean;
  target?: string;
}

/**
 * Display instance events
 */
export interface IDisplayEvents {
  click: IClickEvent;
}

/**
 * Button element
 */
export interface IButtonElement {
  text: string;
  css: ICssStyle;
  order?: number;
}

/**
 * Image element
 */
export interface IImageElement {
  imageUrl: string;
  alt?: string;
  css: ICssStyle;
  order?: number;
  role?: string;
}

/**
 * Label element
 */
export interface ILabelElement {
  text: string;
  css: ICssStyle;
  order?: number;
}

/**
 * Close button element
 */
export interface ICloseButtonElement {
  imageUrl: string;
  alt?: string;
  css: ICssStyle;
  'aria-label'?: string;
}

/**
 * Peel element (for peeling corner)
 */
export interface IPeelElement {
  imageUrl: string;
  alt?: string;
  css: ICssStyle;
}

/**
 * Slide out pin element
 */
export interface ISlideOutPinElement {
  imageUrl: string;
  alt?: string;
  css: ICssStyle;
  events?: { click: string };
}

/**
 * Presentation elements
 */
export interface IPresentationElements {
  buttons?: IButtonElement[];
  images?: IImageElement[];
  labels?: ILabelElement[];
  closeButtons?: ICloseButtonElement[];
  peels?: IPeelElement[];
  slideOutPins?: ISlideOutPinElement[];
}

/**
 * Presentation size
 */
export interface IPresentationSize {
  width?: string | number;
  height?: string | number;
}

/**
 * Presentation background
 */
export interface IPresentationBackground {
  color?: string;
  image?: string;
  position?: string;
  repeat?: string;
}

/**
 * Presentation border
 */
export interface IPresentationBorder {
  color?: string;
  width?: number;
  radius?: number;
}

/**
 * Presentation margin
 */
export interface IPresentationMargin {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * Display instance presentation
 */
export interface IDisplayPresentation {
  elements?: IPresentationElements;
  size?: IPresentationSize;
  background?: IPresentationBackground;
  border?: IPresentationBorder;
  margin?: IPresentationMargin;
  floating_engagement?: boolean;
  alt?: string;
}

/**
 * Display instance configuration
 */
export interface IDisplayInstance {
  displayInstanceType: DisplayInstanceType;
  enabled: boolean;
  events?: IDisplayEvents;
  presentation?: IDisplayPresentation;
  macros?: unknown[];
  displaySettings?: Record<string, unknown>;
}

/**
 * Zone configuration
 */
export interface IZone {
  zoneId: number;
  zoneType?: string;
}

/**
 * External target
 */
export interface IExternalTarget {
  targetId: string;
  targetType: string;
}

/**
 * Engagement entity
 */
export interface IEngagement extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  deleted?: boolean;
  modifiedDate?: string;
  createdDate?: string;
  channel: EngagementChannel;
  type: EngagementType;
  subType?: EngagementSubType;
  source?: EngagementSource;
  enabled: boolean;
  language?: string;
  weight?: number;

  // Targeting
  onsiteLocations?: number[];
  visitorBehaviors?: number[];

  // Display configuration
  position?: IEngagementPosition;
  effects?: IEngagementEffects;
  displayInstances?: IDisplayInstance[];

  // Timing
  timeInQueue?: number;
  followMePages?: number;
  followMeTime?: number;

  // Window configuration
  windowId?: number;
  isPopOut?: boolean;
  isUnifiedWindow?: boolean;

  // Routing
  useSystemRouting?: boolean;
  skillId?: number;
  skillName?: string;

  // Messaging
  allowUnauthMsg?: boolean;
  conversationType?: ConversationType;
  showSmsPreSurveyOnMobile?: boolean;

  // App/Connector
  appInstallationId?: string | null;
  connectorId?: number;

  // Availability
  availabilityPolicy?: AvailabilityPolicy;
  availabilityPolicyForMessaging?: AvailabilityPolicyForMessaging;
  renderingType?: RenderingType;

  // Zones
  zones?: IZone[];

  // External targets
  externalTargets?: IExternalTarget[] | null;

  // Surveys
  surveyId?: number;
  offlineWindowId?: number;
  offlineSurveyId?: number;

  // Campaign relationship
  campaignId?: number;
}

/**
 * Engagement creation request
 */
export interface IEngagementCreateRequest {
  id?: null;
  name: string;
  description?: string;
  channel?: EngagementChannel;
  type: EngagementType;
  subType?: EngagementSubType;
  source?: EngagementSource;
  enabled?: boolean;
  language?: string;
  weight?: number;
  onsiteLocations?: number[];
  visitorBehaviors?: number[];
  position?: IEngagementPosition;
  effects?: IEngagementEffects;
  displayInstances?: IDisplayInstance[];
  timeInQueue?: number;
  followMePages?: number;
  followMeTime?: number;
  windowId?: number;
  isPopOut?: boolean;
  isUnifiedWindow?: boolean;
  useSystemRouting?: boolean;
  skillId?: number;
  skillName?: string;
  allowUnauthMsg?: boolean;
  conversationType?: ConversationType;
  showSmsPreSurveyOnMobile?: boolean;
  appInstallationId?: string | null;
  connectorId?: number;
  availabilityPolicy?: AvailabilityPolicy;
  availabilityPolicyForMessaging?: AvailabilityPolicyForMessaging;
  renderingType?: RenderingType;
  zones?: IZone[];
  externalTargets?: IExternalTarget[] | null;
  surveyId?: number;
}

/**
 * Engagement update request - full entity for PUT
 */
export interface IEngagementUpdateRequest {
  id: number;
  name: string;
  description?: string;
  weight?: number;
  enabled: boolean;
  deleted?: boolean;
  windowId?: number;
  isPopOut?: boolean;
  useSystemRouting?: boolean;
  renderingType?: RenderingType;
  appInstallationId?: string | null;
  channel: EngagementChannel;
  showSmsPreSurveyOnMobile?: boolean;
  modifiedDate?: string;
  createdDate?: string;
  type: EngagementType;
  onsiteLocations?: number[];
  visitorBehaviors?: number[];
  language?: string;
  position?: IEngagementPosition;
  effects?: IEngagementEffects;
  displayInstances?: IDisplayInstance[];
  skillId?: number;
  skillName?: string;
  timeInQueue?: number;
  followMePages?: number;
  followMeTime?: number;
  isUnifiedWindow?: boolean;
  allowUnauthMsg?: boolean;
  zones?: IZone[];
  subType?: EngagementSubType;
  source?: EngagementSource;
  connectorId?: number;
  availabilityPolicy?: AvailabilityPolicy;
  availabilityPolicyForMessaging?: AvailabilityPolicyForMessaging;
  conversationType?: ConversationType;
  externalTargets?: IExternalTarget[] | null;
}

/**
 * Engagement partial update - for convenience methods that update single fields
 */
export type IEngagementPartialUpdate = Partial<IEngagementUpdateRequest>;

/**
 * Engagement query parameters
 */
export interface IEngagementQuery {
  v?: string;
  fields?: string | string[];
  field_set?: 'all' | 'summary';
  select?: string;
  filter?: string;
  include_deleted?: boolean;
}
