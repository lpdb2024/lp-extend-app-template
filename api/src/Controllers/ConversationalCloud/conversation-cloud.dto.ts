import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  IsObject,
  IsOptional,
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
  id: string;
  type: number;
  propertyValue: {
    value: any;
  };
  deleted: boolean;
}

export class ManagerOf {
  agentGroupId: string;
  assignmentDate: string;
}
export class MemberOf {
  agentGroupId: string;
  assignmentDate: string;
}

export class UserDto {
  id: string;
  pid?: string;
  deleted: boolean;
  loginName: string;
  fullName: string;
  nickname: string;
  passwordSh: string;
  isEnabled: boolean;
  maxChats: number;
  email: string;
  allowedAppKeys?: string;
  pictureUrl?: string;
  disabledManually: boolean;
  skillIds: number[];
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

export class PredefinedContentDto {
  id: number;
  deleted: boolean;
  enabled: boolean;
  hotkey: {
    prefix: string;
    suffix: string;
  };
  type: number;
  data: any[];
  categoriesIds: number[];
  skillIds: number[];
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

export class ApiKeyDto {
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
  Webhooks: Webhooks;
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

export interface Connection {
  on(event: string, callback: (conversation: any) => Promise<void>): void;
  open(): Promise<void>;
  close(): void;
}
