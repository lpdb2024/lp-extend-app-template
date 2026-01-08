/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any;
    initMap: any;
  }
}
import type { APP_TYPES, CATEGORIES } from "src/router/routes";
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ISkillInfo } from "./";

import type { APP_ENV, ROLES, SettingProperty } from "src/constants";

export interface AppEnvVar {
  env: APP_ENV;
  phase: string;
  datacenter: string;
  grid: string;
  firebase: any;
}

export interface AppDefinition {
  name: string;
  title: string;
  description: string;
  caption?: string;
  icon: string;
  path: string;
  requiresLp: boolean;
  category: CATEGORIES
  appType: APP_TYPES;
  colour?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
  shareAuth?: boolean;
  isNav: boolean;
}

export interface ApplicationRoute {
  name: string
  meta: AppDefinition
}

export interface ISavedAccount {
  accountId: string;
  accountName: string;
}

export interface baseURI {
  service: string;
  account: string;
  baseURI: string;
}
export interface IUser {
  uid: string;
  display_name: string;
  email: string;
  photo_url: string;
  account_id: string | number;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
  account_type: string;
}

export interface IMobileApp {
  label?: string;
  imgPath?: string;
  bottom?: boolean;
  brandApp?: boolean;
}

export interface UserData {
  assigned_models: any[];
  favorite_models: any[];
  permissions: any[];
  roles: ROLES[];
  uid: string;
  email: string;
  account_id: string;
  account_ids: string[];
  consumer_jwt: string | null;
  created_at: number;
  created_by: string;
  display_name: string;
  is_cc_user: boolean;
  is_lpa: boolean;
  photo_url: string;
  terms_agreed: boolean;
  updated_at: number;
  updated_by: string;
}

export interface IClaims {
  aud: string;
  email: string;
  exp: number;
  iat: string;
  is_admin: string;
  is_lpa: string;
  iss: string;
  sub: string;
  username: string;
  wsuk: string;
  expiresAt?: number;
}

export interface IAuthUser {
  loginName: string;
  userId: string;
  userPid: string;
  userPrivileges: number[];
  isLPA: boolean;
  isAdmin: boolean;
  sessionTTl: string;
  bearer: string;
  sessionId: string;
}
export interface INotifyDialog {
  title: string;
  body: string;
  maxWidth?: number;
  icon?: string;
  iconColor?: string;
  persistent?: boolean;
  hideClose?: boolean;
  primaryAgree?: boolean;
  primaryAgreeLabel?: string;

  cancelLabel?: string;
  onCancelFn?: (...args: any) => unknown;

  secondaryLabel?: string;
  onSecondaryFn?: (...args: any) => Promise<unknown>;

  primaryLabel?: string;
  onPrimaryFn?: (...args: any) => Promise<unknown>;

  closeOnPrimary?: boolean;
  closeAfterPrimary?: boolean;
  closeOnSecondary?: boolean;
  closeAfterSecondary?: boolean;
}
export interface INotifyConfig {
  type: string | null;
  message: string | null;
  caption: string | null;
  color?: string;
  icon?: string;
  iconColor?: string | null;
  avatar?: string | null;
  position?: "top" | "left" | "right" | "bottom";
  timeout?: number | null;
  actions?: {
    label: string;
    color?: string;
    handler: () => void;
  }[];
}
export interface DemoRequest {
  account_id: string;
  solutions_demonstrated: string[];
  name: string;
  description?: string | null;
  brand_name: string;
}
export interface DemoBasic {
  solutions_demonstrated: string[];
  description: string;
  name: string;
  brand_name: string;
  account_id: string;
  id: string;
  logo: string;
  active: boolean;
}
export interface IColor {
  color: string | null;
  useCustom: boolean;
  custom: string | null;
}
export interface IcolorDefaults {
  primary: string;
  secondary: string;
  accent: string;
  buttons: string;
  icons: string;
  text: string;
  [key: string]: string;
}
export interface IMessagingWindowBanner {
  background: IColor | null;
  img: string | null;
  url: string | null;
  padding: number | null;
  height: number | null;
  width: number | null;
  widthAuto: boolean;
  imgHeight: number | null;
  imgWidth: number | null;
}
export interface GoogleFileMeta {
  value: string;
  name: string;
  content_type: string;
  size: number;
  url: string;
}

export interface IBackgroundConfig {
  background: IColor;
  type: string;
  url?: string;
  image: {
    url: string;
    position: string;
    size: string;
    repeat: string;
  };
  useLayer: boolean;
  lpRibbon: boolean;
  lpRibbonPosition: string;
  layerColor: IColor;
  layerOpacity: number;
  layerImage?: {
    url: string;
    position: string;
    size: string;
    repeat: string;
  };
}
export interface ISlideImageConfig {
  background: IColor;
  type: string;
  url?: string;
  image: {
    url: string;
    position: string;
    size: string;
    repeat: string;
  };
  useLayer: boolean;
  layerColor: IColor;
  layerOpacity: number;
  layerImage?: {
    url: string;
    position: string;
    size: string;
    repeat: string;
  };
}
export interface ITextConfig {
  value: string;
  weight?: number;
  color?: string;
  font?: string;
  size?: number;
  style?: string;
  align?: string;
}
export interface IDomainInfo {
  region: string | null;
  services: Record<string, string | null> | null;
  zone: string | null;
}

export interface IProactiveConsumer {
  consumerPhoneNumber: string;
  header: string;
  variableHeadersType: string;
  variables: Record<string, string>;
  tempVariables?: string[];
  [key: string]: any;
}

export interface IProactiveConfiguration {
  _id: string;
  name: string;
  brandName: string;
  proactiveTemplate: any;
  namespace: string;
  nickname: string;
  email: string;
  skill: ISkillInfo | null;
  proactive: {
    campaignName: string | null;
    skill: string | null;
    templateId: string | null;
    consent: boolean;
    consumers: IProactiveConsumer[];
  };
}

export interface IControl {
  label: string;
  variable_name: string | null;
  completed: boolean;

  value: any;
  touched?: boolean;
}

export interface IFormImage {
  url: string;
  parentHeight: number;
  width: number;
  height: number;
  widthAuto: boolean;
  heightAuto: boolean;
  pinToTop: boolean;
  position: string;
  fit: string;
  padding: number;
}

export interface IControlParent {
  type: string;
  name: string;
  controls: IControl[];
  required: boolean;
  completed: boolean;

  value: any;
  variableName: string | null;
  label: string;
  image?: IFormImage | null;
  font?: string;
  fontWeight?: number;
  fontSize?: number;
  shape?: string | null;
  labelColor?: string | null;
  controlColor?: string | null;
  textColor?: string | null;
  style?: string | null;
  touched?: boolean;
}
export interface IFormDefaults {
  applyFontAll: boolean;
  backgroundColor?: string | null;
  backgroundLayerColor?: string | null;
  backgroundOpactity?: number;
  paddingOuter?: number;
  paddingInner?: number;
  backgroundImage?: string | null;
  font: string;
  fontWeight: number;
  shape?: string | null;
  labelColor?: string | null;
  controlColor?: string | null;
  textColor?: string | null;
  style?: string | null;
}

export interface CCSDocument {
  accountId: string;
  nameSpace: string;
  sessionId: string;
  ttlSeconds: number;
  payload: any;
}

export interface IPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  created_at: number;
  updated_at: number;
  created_by: string;
  updated_by: string;
  category: string;
}

export interface IPromptRequest {
  name: string;
  description: string;
  prompt: string;
  category: string;
}

export interface KVPObject {
  [key: string]: string | number | boolean | null | undefined;
}

export interface KeyValuePair<
  T = string | boolean | object | number | FileList | null | undefined
> {
  [key: string]: T;
}

export interface Connector {
  id: number;
  deleted: boolean;
  name: string;
  type: number;
  configuration: {
    jwtPublicKey: string;
    rfcCompliance: boolean;
    preferred: boolean;
    authorizationEndpoint: string;
    jsContext: string;
    jsMethodName: string;
    clientId: string;
    acrValues: string[];
    pkceEnabled: boolean;
    jwtValidationType?: string;
    jwksEndpoint?: string;
    issuerDisplayName?: string;
    issuer?: string;
  };
}

export interface RouteMeta {
  title?: string;
  name?: string;
  color?: string;
  caption?: string;
  icon?: string;
  link?: string;
  isRoute?: boolean;
  img?: string | null;
  requiresAuth?: boolean;
  requiredRoles?: ROLES[];
  viewPermissions?: string[];
}

interface Engagement {
  design_engagement: boolean;
  design_window: boolean;
  entry_point: string[];
  visitor_behavior: string[];
  target_audience: string[];
  goal: string[];
  consumer_identity: string[];
  language_selection: boolean;
}

interface webhooks {
  [key: string]: {
    endpoint: string;
    headers: string[];
  };
}
interface Capabilities {
  webhooks?: webhooks;
  engagement?: Engagement;
}

export interface CCApp {
  id?: string;
  client_name: string;
  description: string;
  grant_types: string[];
  scope: string;
  logo_uri: string;
  redirect_uris: string[];
  capabilities?: Capabilities;
  display_name?: string;
  categories?: string[];
  quick_launch_enabled?: boolean;
  enabled_for_profiles?: number[];
  enabled?: boolean;
  client_id?: string;
  client_secret?: string;
  client_secret_expires_at?: number;
  client_id_issued_at?: number;
  deleted?: boolean;
}

export interface IBrandDetails {
  brandName: string;
  brandIndustry: string;
  industries: string[];
}

export interface AUTH {
  access_token: string | null;
  token_type: string | null;
  refresh_token: string | null;
  id_token: string | null;
  expires_in: number | null;
  expiresAt?: number;
  decoded: object | null;
  expiresIn: number | null;
}

export interface CB_AUTH {
  chatBotPlatformUser: object | null;
  apiAccessToken: string | null;
  apiAccessPermToken: string | null;
  config: object | null;
  sessionOrganizationId: string | null;
  leAccountId: string | null;
  cbRegion: string | null;
  enabledFeatures: string[] | null;
  siteSettings: string[] | null;
  leUserId: string | null;
  privileges: number[] | null;
  isElevatedLpa: boolean | null;
}

export interface AppRouteMeta {
  title?: string;
  caption?: string;
  icon?: string;
  active?: string;
  navRoute?: string;
  requiresAuth?: string;
  type?: string;
  path?: string;
  isNav?: boolean;
  isExternal?: boolean;
}

interface SettingBase {
  id: SettingProperty | string;
  type: number;
  deleted: boolean;
}

export interface SettingGeneral {
  value: string | number | boolean | undefined;
}

interface SettingManagerWorkspaceMetricsConfiguration {
  value: {
    AMW_version: string;
    widgets: {
      widget_name: string;
      metrics: {
        name: string;
        config: {
          enabled: string;
          configurable: string;
          deleted: string;
          displayOrder?: number;
          reducedDisplayOrder?: number;
          ACFeatureEnabled?: string;
        };
      }[];
    }[];
    [key: string]: any;
  };
}

interface WrapUpTime {
  value: { active: boolean; time: number };
}

interface SocialSettingsTwitter {
  value: {
    isWidgetEnabled: boolean;
    isAgentMessageDeletionEnabled: boolean;
    isHandleSelectionEnabled: boolean;
    defaultHandleId: string;
    isUmsProxyEnabled: boolean;
    isHistoryProxyEnabled: boolean;
  };
}

interface LLMBrandDetails {
  value: {
    brandName: string;
    brandIndustry: string;
  };
}

interface LEEngagementCapping {
  value: {
    type: number;
    capping: number;
  };
}

interface LECampaignReinviteAfterDecline {
  value: {
    chat: boolean;
    content: boolean;
  };
}

interface LLMAgreementInfo {
  value: {
    isPreviewEnabled: boolean;
    expirationTimestamp: number;
    capacityVolume: number;
    accountId: string;
    userId: number;
    loginName: string;
    consentTimestamp: number;
  };
}

interface LEAccountInfo {
  value: {
    expirationDate: number;
    maxConcurrentAgentSessions: number;
    numberOfUsers: number;
  };
}

interface RolloverConfig {
  value: {
    enabled: boolean;
    enableAutomaticRollover: boolean;
    enableManualRollover: boolean;
    type: string;
    rolloverAccountId: string;
    rolloverAccountSkillId: string;
    maxNumRoutingAttempts: number;
    disableNonConfiguredSkills: boolean;
    excludedChannels: string[];
    skillConfigs: {
      skillId: string;
      enabled: boolean;
      enableAutomaticRollover: boolean;
      type: string;
      maxNumRoutingAttempts: number;
      rolloverAccountId: string;
      rolloverAccountSkillId: string;
      excludedChannels: string[];
      enableManualRollover: boolean;
      manualRolloverConfig: {
        rolloverAccountId: string;
        rolloverSkillIds: string[];
      }[];
    }[];
    manualRolloverConfig: {
      rolloverAccountId: string;
      rolloverSkillIds: string[];
    }[];
  };
  deleted: boolean;
}

export interface IAccountConfig extends SettingBase {
  propertyValue: {
    value: any;
  }
}

// Account Features (Feature Grants)
export interface IAccountFeatureValue {
  type: 'LPBoolean' | 'LPString' | 'LPInteger';
  $: string;
}

export interface IAccountFeature {
  id: string;
  from: string;
  to: string;
  deleted: boolean;
  value: IAccountFeatureValue;
}

export interface IGrantedFeatures {
  revision: number;
  grantedFeature: IAccountFeature[];
}

export type AccountConfigItem<
  T =
    | SettingGeneral
    | SettingManagerWorkspaceMetricsConfiguration
    | WrapUpTime
    | SocialSettingsTwitter
    | LLMBrandDetails
    | LEEngagementCapping
    | LECampaignReinviteAfterDecline
    | LLMAgreementInfo
    | LEAccountInfo
    | RolloverConfig
> = {
  id: string;
  type: number;
  propertyValue: T;
  deleted: boolean;
};
