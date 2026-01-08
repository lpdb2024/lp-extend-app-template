/**
 * App Installations API Interfaces
 * TypeScript interfaces for installed applications in LivePerson
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * App Installation (Installed Application) entity from LivePerson
 */
export interface IAppInstallation extends ILPBaseEntity {
  /** Unique client ID */
  id: string;
  /** Client name */
  client_name: string;
  /** Description of the application */
  description?: string;
  /** Display name for UI */
  display_name?: string;
  /** Whether the app is enabled */
  enabled?: boolean;
  /** OAuth redirect URIs */
  redirect_uris?: string[];
  /** OAuth grant types (e.g., 'client_credentials', 'authorization_code') */
  grant_types: string[];
  /** OAuth response types */
  response_types?: string[];
  /** OAuth scope */
  scope?: string;
  /** Client secret (typically redacted) */
  client_secret?: string;
  /** Client secret expiration timestamp */
  client_secret_expires_at?: number;
  /** Client ID issued at timestamp */
  client_id_issued_at?: number;
  /** Logo URI */
  logo_uri?: string;
  /** Whether quick launch is enabled */
  quick_launch_enabled?: boolean;
  /** Profiles that can use this app */
  enabled_for_profiles?: number[];
  /** App categories */
  categories?: string[];
  /** Whether this is an internal app */
  is_internal?: boolean;
  /** App capabilities configuration */
  capabilities?: Record<string, unknown>;
  /** Entry URI for app launch */
  entry_uri?: string;
  /** Application overview/description */
  overview?: string;
}

/**
 * Request to create a new app installation
 */
export interface ICreateAppInstallationRequest {
  /** Client name (required) */
  client_name: string;
  /** Description */
  description?: string;
  /** Display name */
  display_name?: string;
  /** Whether enabled */
  enabled?: boolean;
  /** Redirect URIs */
  redirect_uris?: string[];
  /** Grant types */
  grant_types: string[];
  /** Response types */
  response_types?: string[];
  /** Scope */
  scope?: string;
  /** Logo URI */
  logo_uri?: string;
  /** Quick launch enabled */
  quick_launch_enabled?: boolean;
  /** Enabled for profiles */
  enabled_for_profiles?: number[];
  /** Categories */
  categories?: string[];
  /** Capabilities */
  capabilities?: Record<string, unknown>;
  /** Entry URI */
  entry_uri?: string;
  /** Overview */
  overview?: string;
}

/**
 * Request to update an app installation
 */
export interface IUpdateAppInstallationRequest {
  /** Client name */
  client_name?: string;
  /** Description */
  description?: string;
  /** Display name */
  display_name?: string;
  /** Whether enabled */
  enabled?: boolean;
  /** Redirect URIs */
  redirect_uris?: string[];
  /** Grant types */
  grant_types?: string[];
  /** Response types */
  response_types?: string[];
  /** Scope */
  scope?: string;
  /** Logo URI */
  logo_uri?: string;
  /** Quick launch enabled */
  quick_launch_enabled?: boolean;
  /** Enabled for profiles */
  enabled_for_profiles?: number[];
  /** Categories */
  categories?: string[];
  /** Capabilities */
  capabilities?: Record<string, unknown>;
  /** Entry URI */
  entry_uri?: string;
  /** Overview */
  overview?: string;
}

/**
 * Query parameters for listing app installations
 */
export interface IAppInstallationsQueryParams {
  /** API version */
  v?: string;
  /** Select specific fields */
  select?: string;
  /** Include deleted apps */
  includeDeleted?: boolean;
}
