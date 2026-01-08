import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  IsObject,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

class SkillRoutingConfiguration {
  priority: number;
  splitPercentage: number;
  agentGroupId: number;
}
class SkillTransferList {
  id: number;
}
export class SkillDto {
  id: number;
  skillOrder: number;
  description: string;
  workingHoursId: number;
  specialOccasionId: number;
  name: string;
  maxWaitTime: number;
  deleted: boolean;
  dateUpdated: string;
  canTransfer: boolean;
  skillTransferList: SkillTransferList[];
  lobIds: number[];
  skillRoutingConfiguration: SkillRoutingConfiguration[];
}
export class AccountConfigDto {
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  @IsNumber()
  type: number;
  @ApiPropertyOptional()
  @IsObject()
  propertyValue: {
    value: any;
  };
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}

export class ManagerOf {
  agentGroupId: string;
  assignmentDate: string;
}
export class MemberOf {
  agentGroupId: string;
  assignmentDate: string;
}
// export class Profile {
//   roleTypeId: number;
//   name: string;
//   id: number;
// }
export class UserDto {
  id: string;
  deleted: boolean;
  loginName: string;
  fullName: string;
  nickname: string;
  passwordSh: string;
  isEnabled: boolean;
  maxChats: number;
  email: string;
  pictureUrl?: string;
  disabledManually: boolean;
  skillIds: number[];
  profiles: Profile[];
  profileIds: number[];
  lobIds: number[];
  changePwdNextLogin: boolean;
  memberOf: MemberOf;
  managerOf: ManagerOf[];
  permissionGroups: string[];
  description: string;
  mobileNumber: string;
  employeeId: string;
  maxAsyncChats: number;
  backgndImgUri: string;
  pnCertName: string;
  dateUpdated: string;
  lastPwdChangeDate: string;
  isApiUser: boolean;
  userTypeId: number;
}

// export class PredefinedContentDto {
//   id: number;
//   deleted: boolean;
//   enabled: boolean;
//   hotkey: {
//     prefix: string;
//     suffix: string;
//   };
//   type: number;
//   data: any[];
//   categoriesIds: number[];
//   skillIds: number[];
//   lobIds: number[];
// }

export class PredefinedContentDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsObject()
  hotkey: {
    prefix: string;
    suffix: string;
  };

  @ApiProperty()
  @IsNumber()
  type: number;

  @ApiProperty({ type: [Object] })
  @IsArray()
  data: any[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  categoriesIds: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  skillIds: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  lobIds: number[];
}

export class CampaignDto {
  id: number;
  name: string;
  description: string;
  startDate: string;
  startDateTimeZoneOffset: number;
  startTimeInMinutes: number;
  goalId: number;
  status: number;
  isDeleted: boolean;
  weight: number;
  priority: number;
  engagementIds: number[];
  timeZone: string;
  type: number;
}
class DisplayInstance {
  events: {
    click: {
      enabled: boolean;
      target: string;
    };
  };
  presentation: {
    border: {
      color: string;
      width: number;
      radius: number;
    };
    size: {
      width: string;
      height: string;
    };
    background: {
      image: string;
      color: string;
    };
    elements: {
      images: {
        css: {
          top: number;
          left: number;
          zIndex: number;
        };
        imageUrl: string;
        alt: string;
      }[];
      labels: {
        css: {
          transform: string;
          fontFamily: string;
          color: string;
          top: number;
          left: number;
          whiteSpace: string;
          fontSize: number;
          fontStyle: string;
          fontWeight: string;
          zIndex: number;
        };
        text: string;
      }[];
    };
  };
  macros: any[];
  displayInstanceType: number;
  enabled: boolean;
}
class Position {
  left: number;
  top: number;
  type: number;
}
export class EngagementDto {
  deleted: boolean;
  id: number;
  name: string;
  description: string;
  modifiedDate: string;
  createdDate: string;
  channel: number;
  type: number;
  onsiteLocations: number[];
  visitorBehaviors: number[];
  enabled: boolean;
  language: string;
  position: Position;
  displayInstances: DisplayInstance[];
  skillId: number;
  skillName: string;
  timeInQueue: number;
  followMePages: number;
  followMeTime: number;
  windowId: number;
  isPopOut: boolean;
  isUnifiedWindow: boolean;
  useSystemRouting: boolean;
  allowUnauthMsg: boolean;
  zones: any[];
  subType: number;
  source: number;
  connectorId: number;
  availabilityPolicy: number;
  availabilityPolicyForMessaging: number;
  renderingType: number;
  conversationType: number;
}
export class CampaignDetailedDto {
  id: number;
  accountId: string;
  createdDate: string;
  modifiedDate: string;
  visitorProfiles: number[];
  engagementCollectionRevision: number;
  engagements: EngagementDto[];
  name: string;
  description: string;
  startDate: string;
  startDateTimeZoneOffset: number;
  startTimeInMinutes: number;
  goalId: number;
  status: number;
  controlGroup: {
    percentage: number;
  };
  isDeleted: boolean;
  deleted: boolean;
  weight: number;
  priority: number;
  engagementIds: number[];
  timeZone: string;
  timeZoneOffset: number;
  type: number;
}
export class ApiKeyBasic {
  keyId: string;
  appSecret: string;
  token: string;
  tokenSecret: string;
}
export class IApiKeyDto {
  developerID: string;
  appName: string;
  appDescription: string;
  purpose: string;
  privileges: {
    type: string;
    data: string;
  }[];
  keyId: string;
  enabled: boolean;
  appSecret: string;
  token: string;
  tokenSecret: string;
  creationTime: string;
  keyType: string;
  ipRanges: any[];
}

export class ApiKeyDto {
  @ApiProperty()
  @IsString()
  developerID: string;
  @ApiProperty()
  @IsString()
  appName: string;
  @ApiProperty()
  @IsString()
  appDescription: string;
  @ApiProperty()
  @IsString()
  purpose: string;
  @ApiProperty({ type: [Object] })
  @IsArray()
  privileges: {
    type: string;
    data: string;
  }[];
  @ApiProperty()
  @IsString()
  keyId: string;
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
  @ApiProperty()
  @IsString()
  appSecret: string;
  @ApiProperty()
  @IsString()
  token: string;
  @ApiProperty()
  @IsString()
  tokenSecret: string;
  @ApiProperty()
  @IsString()
  creationTime: string;
  @ApiProperty()
  @IsString()
  keyType: string;
  @ApiProperty({ type: [String] })
  @IsArray()
  ipRanges: string[];
}

export class Engagement {
  @ApiProperty()
  @IsBoolean()
  designEngagement: boolean;

  @ApiProperty()
  @IsBoolean()
  designWindow: boolean;

  @ApiProperty()
  @IsArray()
  entryPoint: string[];

  @ApiProperty()
  @IsArray()
  visitorBehavior: string[];

  @ApiProperty()
  @IsArray()
  targetAudience: string[];

  @ApiProperty()
  @IsArray()
  goal: string[];

  @ApiProperty()
  @IsArray()
  consumerIdentity: string[];

  @ApiProperty()
  @IsBoolean()
  languageSelection: boolean;
}
export class Webhooks {
  @ApiProperty()
  @IsString()
  endpoint: string;

  @ApiProperty()
  @IsNumber()
  maxRetries: number;
}
export class Capabilities {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  Engagement: Engagement;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  webhooks: Webhooks;
}
export class AppInstallDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsArray()
  grantTypes: string[];

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @IsString()
  clientName: string;

  @ApiProperty()
  @IsString()
  clientSecret: string;

  @ApiProperty()
  @IsNumber()
  clientSecretExpiresAt: number;

  @ApiProperty()
  @IsNumber()
  clientIdIssuedAt: number;

  @ApiProperty()
  @IsString()
  scope: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  capabilities: Capabilities;

  @ApiProperty()
  @IsString()
  logoUri: string;

  @ApiProperty()
  @IsBoolean()
  isInternal: boolean;
}
export class MsgIntRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  latestConversationQueueState: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  latestAgentIds: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  skillIds: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  status: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  start: {
    from: number;
    to: number;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  end: {
    from: number;
    to: number;
  };
}

export interface ServiceWorkerBase {
  loginName: string;
  user_id: string;
  appName: string;
  keyId: string;
  appSecret: string;
  token: string;
  tokenSecret: string;
}

export class ServiceWorkerDataRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  user_id: string;

  @ApiProperty()
  @IsString()
  account_id: string;

  @ApiProperty()
  @IsString()
  app_key: string;
}

export class ServiceWorkerData extends ServiceWorkerDataRequest {
  static collectionName = 'service_workers';
  @ApiProperty()
  @IsString()
  created_by: string;

  @ApiProperty()
  @IsString()
  updated_by: string;

  @ApiProperty()
  @IsNumber()
  created_at: number;

  @ApiProperty()
  @IsNumber()
  updated_at: number;
}

export class ApplicationSettingsDto {
  static collectionName = 'application_settings';
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  value: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
export class AppSettingsDTOCollectionName {
  static collectionName = 'app_settings';
}

// class AppSettingsDTO includes the collection name, and can include any arbitrary properties
export class AppSettingsDTO {
  static collectionName = 'app_settings';
  [key: string]: any;
}

// User-level settings (tied to Firebase UID, not LP account)
// Used for app-wide settings like GitHub integration
export class UserSettingsDTO {
  static collectionName = 'user_settings';
  github?: {
    pat: string;
    repo: string;
    branch?: string;
  };
  [key: string]: any;
}

class PromptVersionDetails {
  version: number;
  createdBy: number;
  createdAt: number;
}
class PromptVariables {
  name: string;
  sourceType: string;
  value?: string;
}
class PromptClientConfig {
  maxConversationTurns: number;
  maxConversationMessages: number;
  maxConversationTokens: number;
  includeLastUserMessage: boolean;
}
class PromptGenericConfig {
  llmProvider: string;
  llm: string;
  llmSubscriptionName: string;
  samplingTemperature?: number;
  maxResponseTokens?: number;
  maxPromptTokens?: number;
  completionsNumber?: number;
}

class PromptConfiguration {
  genericConfig: PromptGenericConfig;
  clientConfig: PromptClientConfig;
  variables: PromptVariables[];
}

export class PromptDto {
  accountId: string;
  id: string;
  name: string;
  clientType: string;
  description: string;
  langCode: string;
  promptHeader: string;
  createdBy: number;
  createdAt: number;
  updatedAt: number;
  version: number;
  status: string;
  default: boolean;
  configuration: PromptConfiguration;
  versionDetails: PromptVersionDetails[];
}

export class PromptResponseDto {
  success: boolean;
  statusCode: number;
  successResult: {
    prompts: PromptDto[];
  };
}

export interface ConvCloudAppKeyBasic {
  developerID: string;
  appName: string;
  appDescription: string;
  purpose: string;
  privileges: {
    [key: string]: string;
  }[];
  keyId: string;
  enabled: boolean;
  appSecret: string;
  token: string;
  tokenSecret: string;
  creationTime: string;
  keyType: string;
  ipRanges: string[];
}

class PermissionPackage {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  isDisplayed: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  featureKeys?: string[];

  @ApiProperty()
  @IsNumber()
  id: number;
}

export class Profile {
  @ApiProperty()
  @IsNumber()
  roleTypeId: number;
  @ApiProperty()
  @IsBoolean()
  deleted: boolean;
  @ApiProperty()
  @IsString()
  roleTypeName: string;
  @ApiProperty()
  @IsArray()
  permissions: number[];
  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsNumber()
  id: number;
  @ApiProperty()
  @IsNumber()
  numOfAssignedUsers: number;
  @ApiProperty({ type: [PermissionPackage] })
  @IsArray()
  permissionPackages: PermissionPackage[];
  @ApiProperty()
  @IsString()
  dateUpdated: string;
  @ApiProperty()
  @IsBoolean()
  isAssignedToLPA: boolean;
}

export class LineOfBusiness {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AgentGroupDto {
  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({ type: [Number] })
  @IsArray()
  members: number[];

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  managers: number[];

  @ApiProperty()
  @IsString()
  dateUpdated: string;
}

export class AutomaticMessage {
  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsArray()
  data: { msg: string; lang: string }[];

  @ApiProperty({ type: Object })
  @IsObject()
  attributes: { timer?: string; timerUnit?: string };

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ type: Object })
  @IsObject()
  contexts: {
    ACCOUNT: { id: string }[];
    SKILL: { skillId: number; enabled: boolean }[];
  };

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}

export class WorkingHoursDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsArray()
  events: {
    recurrence: string[];
    start: {
      dateTime: string;
      timeZone: string;
    };
    end: {
      dateTime: string;
      timeZone: string;
    };
  }[];
}

export class SpecialOccasionDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsArray()
  events: {
    meta: { working: boolean; name: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    recurrence: string[];
  }[];

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean;
}

export class GoalDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsBoolean()
  systemDefault: boolean;

  @ApiProperty()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty()
  @IsString()
  modifiedDate: string;

  @ApiProperty()
  @IsString()
  createdDate: string;

  @ApiProperty()
  @IsNumber()
  type: number;

  @ApiProperty()
  @IsNumber()
  indicatorType: number;
}

// const visitorProfiles = [{"id":1400596270,"name":"All visitors","description":"Default target audience, automatically created","isSystemDefault":true,"systemDefault":true,"conditionBoxTypes":[0]}]

export class VisitorProfileDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isSystemDefault: boolean;

  @ApiProperty()
  @IsBoolean()
  systemDefault: boolean;

  @ApiProperty({ type: [Number] })
  @IsArray()
  conditionBoxTypes: number[];
}

interface WindowAttrs {
  style: Partial<CSSStyleDeclaration>;
}

interface WindowConfig {
  transcript_bubble_agent_text: WindowAttrs;
  agent: WindowAttrs;
  input_text: WindowAttrs;
  transcript_bubble_visitor: WindowAttrs;
  transcript_bubble_agent: WindowAttrs;
  transcript_bubble_agentArrow: WindowAttrs;
  transcript_time: WindowAttrs;
  mainArea: WindowAttrs;
  input: WindowAttrs;
  transcript_bubble_visitor_text: WindowAttrs;
  actionsMenu: WindowAttrs;
  top: WindowAttrs;
  transcript_bubble_visitorArrowBorder: WindowAttrs;
  transcript_bubble_visitorArrow: WindowAttrs;
  logo: WindowAttrs;
  transcript_bubble_agentArrowBorder: WindowAttrs;
  action: { options: { icon_set: string } };
  top_text: WindowAttrs;
  actionsMenu_actionItem_text: WindowAttrs;
  transcript_message: WindowAttrs;
}

interface customStyle {
  v: string;
  meta: {
    fonts: Record<string, string>;
    colors: Record<string, string>;
  };
  config: WindowConfig;
}
interface WindowJson {
  scheme: string;
  surveyAgentChatEnabled: boolean;
  surveyPreChatEnabled: boolean;
  customStyle: customStyle;
  sound: boolean;
  welcomeMessage: {
    isDefault: boolean;
    quickReplies: Array<{
      'background-color': string;
      size: string;
      color: string;
      'border-color-hover': string;
      'font-family': string;
      'color-hover': string;
      'border-color': string;
      text: string;
      bold: boolean;
      'is-font-inherit': boolean;
      'background-color-hover': string;
      italic: boolean;
    }>;
    whenToPresent: string;
    isEnabled: boolean;
    text: string;
  };
  surveyPreChatId: string;
  surveyPostChatEnabled: boolean;
  description: string;
  language: string;
  winConfMetadata: {
    orderID: number;
    isTemplateDefault: boolean;
    isBase: boolean;
  };
  widgets: boolean;
  logoUrl: string;
  print: boolean;
  popoutAction: boolean;
  logoImage: boolean;
  surveyPostChatId: string;
  surveyOfflineId: string;
  name: string;
  id: number;
  agentUrl: string;
  agentImage: boolean;
  email: boolean;
  surveyAgentChatId: string;
  [key: string]: any; // Allow additional properties
}
export interface WindowConfigDto {
  deleted: boolean;
  isUserDefault: boolean;
  name: string;
  json: WindowJson;
  id: number;
  templateId?: string;
  type: string;
  order: number;
  [key: string]: any;
}

export class VisitorBehaviourDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isSystemDefault: boolean;

  @ApiProperty()
  @IsBoolean()
  systemDefault: boolean;

  @ApiProperty({ type: [Number] })
  @IsArray()
  conditionBoxTypes: number[];
}

export class OnsiteLocationDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isSystemDefault: boolean;

  @ApiProperty()
  @IsBoolean()
  systemDefault: boolean;

  @ApiProperty({ type: [Number] })
  @IsArray()
  conditionBoxTypes: number[];
}

export interface ExtMsgConnector {
  id: number;
  deleted: boolean;
  name: string;
  description?: string;
  type: number;
  configuration: {
    enabled: boolean;
    settings?: {
      currentServingEnv?: string;
      servingStatus?: string;
      targetServingEnv?: string;
      botJoinDelay?: number;
      [key: string]: string | number | boolean | undefined;
    };
    plugins?: {
      AutoMessages?: {
        autoDisableOffHours: boolean;
        logsEnabled: boolean;
        enabled: boolean;
      };
    };
    phone?: string;
    provider?: string;
    key?: string;
    adminUsername?: string;
    username?: string;
    whatsappClientDomainOverride?: string;
    defaultHSM?: string;
    userProfile?: boolean;
    showAgentNameOnMessage?: boolean;
    whatsAppBusinessAccountID?: string;
    isHosted?: boolean;
    phoneNumberId?: string;
    onboardingFlow?: string;
    busyMsg?: string;
    secureFormsLanguage?: string;
  };
}

export interface Zone {
  id: number;
  createdDate: string;
  modifiedDate: string;
  name: string;
  deleted: boolean;
  zoneType: number;
  zoneValue: string;
  mainZone: boolean;
  capping: number;
  mapping: {
    engagementSubType: string;
  }[];
  isDeleted: boolean;
}

export interface Widget {
  name: string;
  id: number;
  span: string;
  description: string;
  mode: string;
  url: string;
  type: string;
  parameters: { name: string; value: string }[];
  skillIds: number[];
  deleted: boolean;
  enabled: boolean;
  order: number;
  profileIds: number[];
  componentName?: string;
  path?: string;
}
