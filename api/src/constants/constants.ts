import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../interfaces/interfaces';

export enum CCUI_ZONES {
  AU = 'AU',
  EU = 'EU',
  US = 'US',
}

const pathProd =
  'https://conversation-simulator-660885157216.australia-southeast1.run.app';
const pathDev = 'https://lp-webhooks.ngrok.app';

export const getApplicationConfig = (env: string | null, accountId: string) => {
  const ContentEventEndpoint = `${env === 'prod' ? pathProd : pathDev}/api/v1/connector-api/${accountId}/content-event/conv-sim`;
  const ExConversationChangeNotificationEndpoint = `${env === 'prod' ? pathProd : pathDev}/api/v1/connector-api/${accountId}/state/conv-sim`;

  const webhooks = {
    'ms.MessagingEventNotification.ContentEvent': {
      endpoint: ContentEventEndpoint,
      headers: [],
    },
    'cqm.ExConversationChangeNotification': {
      endpoint: ExConversationChangeNotificationEndpoint,
      headers: [],
    },
  };
  const applicationConfig = {
    client_name: 'conversation_simulator',
    description: 'orchestrator for simulated conversations',
    grant_types: ['authorization_code', 'refresh_token', 'client_credentials'],
    redirect_uris: [
      'https://lp-conv-sim/login',
      'http://localhost:3000/login',
      'http://localhost:8080/login',
      'https://conversation-simulator-660885157216.australia-southeast1.run.app/callback',
      'https://lp-webhooks.ngrok.app/callback',
      'https://lp-webhooks.ngrok.app/login',
      'https%3A%2F%2F127.0.0.1%3A8080%2Fapi%2Fv1%2Fcallback',
      'https%3A%2F%2F127.0.0.1%3A3000%2Fapi%2Fv1%2Fcallback',
      'http://127.0.0.1:3000/callback',
      'http://localhost:8080/callback',
      'http://localhost:3000/callback',
    ],
    scope: 'msg.consumer',
    logo_uri: '',
    id: process.env.VUE_APP_CLIENT_ID,
    display_name: 'Conversation Simulator',
    enabled: true,
    quick_launch_enabled: true,
    enabled_for_profiles: [0, 1, 2, 3],
    client_id: process.env.VUE_APP_CLIENT_ID,
    client_id_issued_at: 1746085839,
    client_secret: process.env.VUE_APP_CLIENT_SECRET,
    deleted: false,
    installation_type: 'PRIVATE',
    is_internal: false,
  };
  if (env) {
    Object.assign(applicationConfig, { capabilities: { webhooks } });
  }
  return applicationConfig;
};

const v1 = 'api/v1' as const;
export const API_ROUTES = {
  AI_STUDIO(): string {
    return `${v1}/ai-studio`;
  },
  GOOGLE_STORAGE(): string {
    return `${v1}/google-storage`;
  },
  USERS(): string {
    return `${v1}/users`;
  },
  SPEECH(): string {
    return `${v1}/speech`;
  },
  KAI_ON_DEMAND(): string {
    return `${v1}/kai`;
  },
  MESSAGING(): string {
    return `${v1}/messaging`;
  },
  CONNECTOR_API(): string {
    return `${v1}/connector-api`;
  },
  DEMO_BUILDER(): string {
    return `${v1}/demo-builder`;
  },
  CONVERSATION_CLOUD(): string {
    return `${v1}/conversational-cloud`;
  },
  CONVERSATION_CREATOR(): string {
    return `${v1}/conversation-creator`;
  },
  CONVERSATION_SIMULATOR(): string {
    return `${v1}/conversation-simulator`;
  },
  LLM_TASK(): string {
    return `${v1}/llm_task`;
  },
  IDP(): string {
    return `${v1}/idp`;
  },
  CONVERSATION_BUILDER(): string {
    return `${v1}/conversation-builder`;
  },
  CC_APP(): string {
    return `${v1}/cc-app`;
  },
  ACCOUNT(): string {
    return `${v1}/account`;
  },
  ACCOUNT_CONFIG(): string {
    return `${v1}/${API_ROUTES.ACCOUNT()}/config`;
  },
  ADMINISTRATION(): string {
    return `${v1}/${API_ROUTES.ACCOUNT()}/administration`;
  },
  SNAPSHOTS(): string {
    return `${v1}/snapshots`;
  },
};

export enum LE_USER_ROLES {
  ADMIN = 'Administrator',
  AGENT = 'Agent',
  CAMPAIGN_MANAGER = 'Campaign Manager',
  AGENT_MANAGER = 'Agent Manager',
}

export const MANAGER_ROLES = [LE_USER_ROLES.ADMIN, LE_USER_ROLES.AGENT_MANAGER];

export const USER_ROLES = {
  CONSUMER: 'CONSUMER',
  EXTERNAL_CONSUMER: 'EXTERNAL_CONSUMER',
  EXTERNAL_MODEL_MANAGER: 'EXTERNAL_MODEL_MANAGER',
  AGENT: 'AGENT',
  MODEL_MANAGER: 'MODEL_MANAGER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

export const ERROR_RESPONSES = {
  UNAUTHORIZED: 'You are not authorised to use this resource',
};

export const GOOGLE_AUTH_API = 'https://identitytoolkit.googleapis.com/v1/';
export const GOOGLE_ASSETS_FOLDER = 'app-resources';
export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IUser = request.user;
    return user;
  },
);

export const authenticationErrors = {
  9000: 'DEFAULT,',
  9001: 'SERVER_ERROR,',
  9007: "CUSTOMER_JWT_NOT_VALID - failed to validate customer JWT - mostly due to public key doesn't match customer private key ( in the connector config)",
  9008: 'LP_JWT_NOT_VALID - failed to validate LP JWT',
  9009: 'ESAPI_ERROR - esapi validation errors',
  9010: 'SERVICE_TIMEOUT- idp controller timed out',
  9011: 'CUSTOMER_AUTH_FAILED - validation authcode against customer site failed',
  9012: 'INPUT_VALIDATION_ERROR - input is not valid',
  9013: 'AUTHENTICATION_TIMEOUT - the Customer endpoint auth call timed out',
  9014: 'AUTHENTICATE_EXCEPTION - authentication encounterd unexpected error',
  9015: 'UNSUPPORTED_AUTH_TYPE - connector Type is not supported',
  1001: 'PARSE_ERROR - failed to parse JWT',
  1003: 'NO_SUCH_ALGORITHM',
  1004: 'JOSE_EXECEPTION - failed to decrypt JWE',
  1005: 'INVALID_KEY_SPEC',
  1006: 'UNSUPPORTED_ENCODING',
  1007: 'SNMP_INIT_FAILED',
  1008: 'JWT_NOT_VALID - input is not in JWT format',
  1009: 'JWT_PARSING_ERROR',
  1010: 'LP_JWT_PARSING_ERROR',
  1011: 'JWT_MISSING_CALIMESET',
  1012: 'JWT_EXPIRED',
  1022: 'AC_CLIENT_INIT_FAILED',
  1023: 'AC_CONNECTOR_FAILED - failed to fetch connector configuration',
  1024: 'AC_CONNECTOR_NOT_FOUND - no connector found',
  1025: 'AC_CONNECTOR_TYPE_NOT_FOUND - connector found but the type is not supported',
  1026: 'SDE_PARSE_EXCEPTION',
  1027: 'RSA_DECRYPTOR_INIT_ERROR',
  1028: 'RSA_VERIFIER_INIT_ERROR - the customer public key is not valid',
  1029: 'AES_SECRET_DECODING_ERROR - failed to decode hex AES secret',
  1030: 'ENCRYPTION_INIT_FAILED',
  1031: 'ENCRYPTION_FAILED',
  1032: 'DECRYPTION_INIT_FAILED',
  1033: 'DECRYPTION_DECODE_EXCEPTION',
  1034: 'DECRYPTION_EXCEPTION',
  1036: 'DEPENDENCY_TESTER_INIT_FAILED - failed create Health service dependency tester',
  1037: 'LE_AUTH_DESERIALIZER_FAILED - failed deserializ le auth data',
  1038: 'JWK_PARSE_FAILED - failed to parse JWK data',
  1039: 'ITE_SETTINGS_TYPE_NOT_FOUND , //Site settings not found',
  1040: 'SITE_SETTINGS_JWK_NOT_FOUND //Site settings JWK not found',
  1041: 'JWK_ID_NOT_FOUND - JWK kid was not found',
  1042: 'MULTIPLE_JWK_WITHOUT_KID_HEADER - JWK kid was not found in header where ther eis multiple jwks',
  1043: 'SSL_INIT_FAILED',
  1044: 'CASSANDRA_CLIENT_INIT_FAILED',
  1045: 'BLACKLIST_UPDATE_FAILED',
  1046: 'BLACKLIST_READ_FAILED',
  1047: 'BLACKLIST_ADD_FAILED',
  1048: 'BLACKLIST_REMOVE_FAILED',
  1049: 'UN_AUTH_JWT_FOUND_IN_BLACKLIST',
  1050: 'AC_PROVISION_DATA_NOT_FOUND - no Provision featrue found',
  2001: 'NON_AUTH_JWT_REFRESH_EXPIRED',
  2002: 'NON_AUTH_JWT_INVALID_SIGNATURE',
  2004: 'NON_AUTH_JWT_WRONG_ACCOUNT_ID',
  2005: 'NON_AUTH_JWT_MESSAGING_FEATURE_OFF',
  2006: 'CAPTCHA_VERIFICATION_FAILED',
  2007: 'CAPTCHA_VERIFICATION_SERVICE_ERROR',
};
export class DTODefaults {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  created_by?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  updated_by?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  created_at?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  updated_at?: number;
}
export class RecordBasic {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  created_by?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  updated_by?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  created_at?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  updated_at?: number;
}

export enum SIMULATION_STATUS {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETING_TASK = 'COMPLETING_TASK',
  SIMULATION_COMPLETED = 'SIMULATION_COMPLETED',
  ANALYSIS_COMPLETED = 'ANALYSIS_COMPLETED',
  ANALYSING = 'ANALYSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

export const ONGOING_SIMULATION_STATUSES = [
  SIMULATION_STATUS.IN_PROGRESS,
  SIMULATION_STATUS.ANALYSIS_COMPLETED,
  SIMULATION_STATUS.SIMULATION_COMPLETED,
  SIMULATION_STATUS.COMPLETING_TASK,
  SIMULATION_STATUS.ANALYSING,
];

export enum AUDIENCES {
  ALL = 'ALL',
}

export enum MESSAGE_TYPES {
  RICH_CONTENT = 'RICH_CONTENT',
  TEXT_PLAIN = 'TEXT_PLAIN',
}

export enum CONVERSATION_STATE {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

export enum DIALOG_TYPES {
  MAIN = 'MAIN',
  POST_SURVEY = 'POST_SURVEY',
}

export enum PROMPT_NAMES {
  SYNTHETIC_CUSTOMER = 'synthetic customer',
  AGENT_ASSESSMENT = 'agent assessment',
  CONVERSATION_ASSESSMENT = 'conversation assessment',
  OVERALL_ASSESSMENT = 'overall assessment',
}

export enum CONVERSATION_SIMULATION_STATES {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ANALYSING = 'ANALYSING', // Analysis is in progress
  COMPLETED = 'COMPLETED', // Analysis has been completed
}
export enum CONVERSATION_ROLES {
  ASSIGNED_AGENT = 'ASSIGNED_AGENT',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  CONSUMER = 'CONSUMER',
  CONTROLLER = 'CONTROLLER',
}

export const AGENT_ROLES = [
  CONVERSATION_ROLES.ASSIGNED_AGENT,
  CONVERSATION_ROLES.AGENT,
  CONVERSATION_ROLES.MANAGER,
];

export enum APP_SETTING_NAMES {
  SYNTHETIC_CUSTOMER = 'synthetic customer',
  CONVERSATION_ASSESSMENT = 'conversation assessment',
  OVERALL_ASSESSMENT = 'overall assessment',
  AGENT_ASSESSMENT = 'agent assessment',
  BOT_ASSESSMENT = 'bot assessment',
  AGENT_SUCCESS_CRITERIA = 'agent success criteria',
  BOT_SUCCESS_CRITERIA = 'bot success criteria',
  SYNTHETIC_CUSTOMER_BEHAVIOURS = 'configure',
  AI_STUDIO_FLOW = 'AI Flow',
  SERVICE_WORKER = 'service worker',
}

export enum SENDERS {
  AGENT = 'Agent',
  CONSUMER = 'Consumer',
}

export const CORE_PERMISSIONS = ['CORE:READ', 'CORE:WRITE', 'CORE:DELETE'];
