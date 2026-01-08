/**
 * Connector API Interfaces
 * TypeScript interfaces for Vue frontend export
 *
 * The Connector API allows brands to configure and manage third-party messaging connectors
 * such as Twilio SMS, WhatsApp, Facebook Messenger, etc.
 */

import { ILPBaseEntity } from '../shared/lp-common.interfaces';

/**
 * Connector configuration
 */
export interface IConnectorConfiguration {
  /** JWT validation type (e.g., "JWKS_ENDPOINT") */
  jwtValidationType?: string;
  /** JWKS endpoint URL for JWT validation */
  jwksEndpoint?: string;
  /** JWT public key for validation */
  jwtPublicKey?: string;
  /** RFC compliance flag */
  rfcCompliance?: boolean;
  /** Issuer display name */
  issuerDisplayName?: string;
  /** Issuer URL */
  issuer?: string;
  /** Whether this connector is preferred */
  preferred?: boolean;
  /** Authorization endpoint URL */
  authorizationEndpoint?: string;
  /** JavaScript context */
  jsContext?: string;
  /** JavaScript method name */
  jsMethodName?: string;
  /** OAuth client ID */
  clientId?: string;
  /** ACR (Authentication Context Reference) values */
  acrValues?: string[];
  /** Whether PKCE is enabled */
  pkceEnabled?: boolean;
  /** Engagement capabilities */
  engagement?: IConnectorEngagementCapabilities;
  /** Webhook configurations */
  webhooks?: Record<string, IConnectorWebhook>;
  /** Logo URI */
  logo_uri?: string;
  /** Other dynamic configuration properties */
  [key: string]: any;
}

/**
 * Connector engagement capabilities
 */
export interface IConnectorEngagementCapabilities {
  /** Whether custom engagement design is allowed */
  design_engagement?: boolean;
  /** Whether custom window design is allowed */
  design_window?: boolean;
  /** Allowed entry points */
  entry_point?: string[];
  /** Allowed visitor behaviors */
  visitor_behavior?: string[];
  /** Allowed target audience criteria */
  target_audience?: string[];
  /** Allowed goal types */
  goal?: string[];
  /** Allowed consumer identity types */
  consumer_identity?: string[];
  /** Whether language selection is allowed */
  language_selection?: boolean;
}

/**
 * Connector webhook configuration
 */
export interface IConnectorWebhook {
  /** Webhook endpoint URL */
  endpoint: string;
  /** Custom headers for webhook */
  headers?: Record<string, string> | string[];
  /** Maximum number of retries */
  max_retries?: number;
  /** Retry configuration */
  retry?: {
    /** Retention time in seconds */
    retention_time: number;
  };
}

/**
 * Connector entity from LivePerson
 */
export interface IConnector extends ILPBaseEntity {
  /** Unique identifier */
  id: number | string;
  /** Whether connector is deleted */
  deleted?: boolean;
  /** Connector name */
  name: string;
  /** Connector description */
  description?: string;
  /** Connector type (0=implicit, 1=OAuth) */
  type: number;
  /** Connector configuration */
  configuration: IConnectorConfiguration;
  /** Whether connector is enabled */
  enabled?: boolean;
  /** Display name for UI */
  displayName?: string;
  /** Client ID for OAuth */
  clientId?: string;
  /** Client secret for OAuth (typically redacted in responses) */
  clientSecret?: string;
  /** Grant types supported */
  grantTypes?: string[];
  /** OAuth response types */
  responseTypes?: string[];
  /** OAuth scopes */
  scope?: string;
  /** Redirect URIs for OAuth flow */
  redirectUris?: string[];
  /** Entry URI for app launch */
  entryUri?: string;
  /** Logo URI */
  logoUri?: string;
  /** Quick launch enabled */
  quickLaunchEnabled?: boolean;
  /** Enabled for profiles */
  enabledForProfiles?: number[];
  /** App categories */
  categories?: string[];
  /** Overview/description */
  overview?: string;
  /** Whether this is an internal connector */
  isInternal?: boolean;
  /** Software statement JWT */
  softwareStatement?: string;
  /** Capabilities */
  capabilities?: Record<string, any>;
  /** Client secret expiration timestamp */
  clientSecretExpiresAt?: number;
  /** Client ID issued at timestamp */
  clientIdIssuedAt?: number;
}

/**
 * Request to create a new connector
 */
export interface ICreateConnectorRequest {
  /** Connector name (required) */
  name: string;
  /** Connector description */
  description?: string;
  /** Connector type (0=implicit, 1=OAuth) */
  type: number;
  /** Connector configuration */
  configuration: IConnectorConfiguration;
  /** Whether connector is enabled */
  enabled?: boolean;
  /** Display name */
  displayName?: string;
  /** Grant types */
  grantTypes?: string[];
  /** Response types */
  responseTypes?: string[];
  /** OAuth scope */
  scope?: string;
  /** Redirect URIs */
  redirectUris?: string[];
  /** Entry URI */
  entryUri?: string;
  /** Logo URI */
  logoUri?: string;
  /** Quick launch enabled */
  quickLaunchEnabled?: boolean;
  /** Enabled for profiles */
  enabledForProfiles?: number[];
  /** Categories */
  categories?: string[];
  /** Overview */
  overview?: string;
  /** Capabilities */
  capabilities?: Record<string, any>;
}

/**
 * Request to update a connector
 */
export interface IUpdateConnectorRequest {
  /** Connector name */
  name?: string;
  /** Connector description */
  description?: string;
  /** Connector type */
  type?: number;
  /** Connector configuration */
  configuration?: Partial<IConnectorConfiguration>;
  /** Whether connector is enabled */
  enabled?: boolean;
  /** Display name */
  displayName?: string;
  /** Grant types */
  grantTypes?: string[];
  /** Response types */
  responseTypes?: string[];
  /** OAuth scope */
  scope?: string;
  /** Redirect URIs */
  redirectUris?: string[];
  /** Entry URI */
  entryUri?: string;
  /** Logo URI */
  logoUri?: string;
  /** Quick launch enabled */
  quickLaunchEnabled?: boolean;
  /** Enabled for profiles */
  enabledForProfiles?: number[];
  /** Categories */
  categories?: string[];
  /** Overview */
  overview?: string;
  /** Capabilities */
  capabilities?: Record<string, any>;
}

/**
 * Query parameters for listing connectors
 */
export interface IConnectorsQueryParams {
  /** API version */
  v?: string;
  /** Select specific fields */
  select?: string;
  /** Include deleted connectors */
  includeDeleted?: boolean;
}

/**
 * Response from get all connectors
 */
export interface IConnectorsResponse {
  /** Array of connectors */
  connectors: IConnector[];
  /** Revision for optimistic locking */
  revision?: string;
}

/**
 * Connector type enum
 */
export enum ConnectorType {
  /** Implicit authentication (legacy) */
  IMPLICIT = 0,
  /** OAuth authentication */
  OAUTH = 1,
}

/**
 * Grant type values
 */
export enum GrantType {
  CLIENT_CREDENTIALS = 'client_credentials',
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token',
}

/**
 * Response type values
 */
export enum ResponseType {
  CODE = 'code',
  TOKEN = 'token',
}
