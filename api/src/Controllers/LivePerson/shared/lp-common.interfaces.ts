/**
 * LivePerson Common Interfaces
 * These interfaces are exported for use in Vue frontend for type safety
 */

/**
 * Base entity interface - all LP entities extend this
 */
export interface ILPBaseEntity {
  id: number | string;
  deleted?: boolean;
  dateUpdated?: string;
}

/**
 * Standard LP API response wrapper
 */
export interface ILPResponse<T> {
  data: T;
  revision?: string;
  headers?: Record<string, string>;
}

/**
 * Paginated response from LP APIs
 */
export interface ILPPaginatedResponse<T> {
  data: T[];
  _metadata: ILPMetadata;
}

/**
 * Metadata for paginated responses
 */
export interface ILPMetadata {
  count: number;
  self?: ILPLink;
  next?: ILPLink;
  prev?: ILPLink;
}

/**
 * Link object in metadata
 */
export interface ILPLink {
  rel: string;
  href: string;
}

/**
 * Request options for LP API calls
 */
export interface ILPRequestOptions {
  version?: string;
  revision?: string;
  select?: string;
  includeDeleted?: boolean;
  source?: string;
  additionalParams?: Record<string, string>;
  /** Use write domain (accountConfigReadWrite) instead of read domain */
  useWriteDomain?: boolean;
}

/**
 * Error response from LP APIs
 */
export interface ILPErrorResponse {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: ILPValidationError[];
}

/**
 * Validation error detail
 */
export interface ILPValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Domain resolution response
 */
export interface ILPDomainResponse {
  baseURIs: ILPBaseUri[];
}

/**
 * Base URI entry from domain API
 */
export interface ILPBaseUri {
  service: string;
  account: string;
  baseURI: string;
}

/**
 * LP Token interface
 */
export interface ILPToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt?: number;
}

/**
 * Bearer token with additional metadata
 */
export interface ILPBearerToken extends ILPToken {
  idToken?: string;
  refreshToken?: string;
  uid?: string;
  accountId: string;
}

/**
 * Date range filter for queries
 */
export interface ILPDateRange {
  from: number;
  to: number;
}

/**
 * Common audit fields
 */
export interface ILPAuditFields {
  createdAt?: number | string;
  createdBy?: string | number;
  updatedAt?: number | string;
  updatedBy?: string | number;
}

/**
 * Skill routing configuration
 */
export interface ISkillRoutingConfig {
  priority: number;
  splitPercentage: number;
  agentGroupId: number;
}

/**
 * Working hours event
 */
export interface IWorkingHoursEvent {
  recurrence: string[];
  start: IDateTimeWithZone;
  end: IDateTimeWithZone;
}

/**
 * DateTime with timezone
 */
export interface IDateTimeWithZone {
  dateTime: string;
  timeZone: string;
}

/**
 * Special occasion event
 */
export interface ISpecialOccasionEvent extends IWorkingHoursEvent {
  meta: {
    working: boolean;
    name: string;
  };
}

/**
 * Permission package for profiles
 */
export interface IPermissionPackage {
  id: number;
  isEnabled: boolean;
  isDisplayed: boolean;
  featureKeys?: string[];
}

/**
 * Group membership
 */
export interface IGroupMembership {
  agentGroupId: string | number;
  assignmentDate: string;
}

/**
 * Hotkey configuration
 */
export interface IHotkey {
  prefix: string;
  suffix: string;
}

/**
 * Localized data entry
 */
export interface ILocalizedData {
  lang: string;
  msg?: string;
  title?: string;
  text?: string;
}

/**
 * Context configuration for automatic messages
 */
export interface IAutoMessageContext {
  ACCOUNT?: { id: string }[];
  SKILL?: { skillId: number; enabled: boolean }[];
}

/**
 * Attributes for automatic messages
 */
export interface IAutoMessageAttributes {
  timer?: string;
  timerUnit?: string;
}
