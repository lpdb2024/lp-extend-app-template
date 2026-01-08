/**
 * Users API Interfaces
 * TypeScript interfaces for Vue frontend export
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * User profile reference
 */
export interface IUserProfile {
  /** Profile ID */
  id: number;
  /** Profile name */
  name?: string;
  /** Role type ID */
  roleTypeId?: number;
}

/**
 * Group membership
 */
export interface IUserGroupMembership {
  /** Agent group ID */
  agentGroupId: string | number;
  /** Assignment date */
  assignmentDate: string;
}

/**
 * User entity from LivePerson
 */
export interface IUser extends ILPBaseEntity {
  /** Unique identifier */
  id: string;
  /** Whether user is deleted */
  deleted?: boolean;
  /** Login name / username */
  loginName: string;
  /** Full display name */
  fullName?: string;
  /** Nickname */
  nickname?: string;
  /** Whether user is enabled */
  isEnabled: boolean;
  /** Maximum concurrent chats for live chat */
  maxChats?: number;
  /** Maximum concurrent async conversations */
  maxAsyncChats?: number;
  /** Email address */
  email?: string;
  /** Profile picture URL */
  pictureUrl?: string;
  /** Whether manually disabled */
  disabledManually?: boolean;
  /** Assigned skill IDs */
  skillIds?: number[];
  /** User profiles */
  profiles?: IUserProfile[];
  /** Profile IDs */
  profileIds?: number[];
  /** Line of business IDs */
  lobIds?: number[];
  /** Force password change on next login */
  changePwdNextLogin?: boolean;
  /** Group the user is member of */
  memberOf?: IUserGroupMembership;
  /** Groups the user manages */
  managerOf?: IUserGroupMembership[];
  /** Permission group names */
  permissionGroups?: string[];
  /** User description */
  description?: string;
  /** Mobile phone number */
  mobileNumber?: string;
  /** Employee ID */
  employeeId?: string;
  /** Background image URI */
  backgndImgUri?: string;
  /** Push notification certificate name */
  pnCertName?: string;
  /** Last update timestamp */
  dateUpdated?: string;
  /** Last password change date */
  lastPwdChangeDate?: string;
  /** Whether this is an API user */
  isApiUser?: boolean;
  /** User type ID (0=human, 1=bot, 2=system) */
  userTypeId?: number;
}

/**
 * Request to create a new user
 */
export interface ICreateUserRequest {
  /** Login name (required) */
  loginName: string;
  /** Password (required for new users) */
  password?: string;
  /** Full name */
  fullName?: string;
  /** Nickname */
  nickname?: string;
  /** Email address */
  email?: string;
  /** Whether user is enabled */
  isEnabled?: boolean;
  /** Maximum concurrent chats */
  maxChats?: number;
  /** Maximum async conversations */
  maxAsyncChats?: number;
  /** Assigned skill IDs */
  skillIds?: number[];
  /** Profile IDs */
  profileIds?: number[];
  /** Line of business IDs */
  lobIds?: number[];
  /** Force password change on next login */
  changePwdNextLogin?: boolean;
  /** Group membership */
  memberOf?: IUserGroupMembership;
  /** Permission group names */
  permissionGroups?: string[];
  /** User description */
  description?: string;
  /** Mobile number */
  mobileNumber?: string;
  /** Employee ID */
  employeeId?: string;
  /** User type ID */
  userTypeId?: number;
}

/**
 * Request to update a user
 */
export interface IUpdateUserRequest {
  /** Full name */
  fullName?: string;
  /** Nickname */
  nickname?: string;
  /** Email address */
  email?: string;
  /** Whether user is enabled */
  isEnabled?: boolean;
  /** Maximum concurrent chats */
  maxChats?: number;
  /** Maximum async conversations */
  maxAsyncChats?: number;
  /** Assigned skill IDs */
  skillIds?: number[];
  /** Profile IDs */
  profileIds?: number[];
  /** Line of business IDs */
  lobIds?: number[];
  /** Force password change on next login */
  changePwdNextLogin?: boolean;
  /** Group membership */
  memberOf?: IUserGroupMembership;
  /** Permission group names */
  permissionGroups?: string[];
  /** User description */
  description?: string;
  /** Mobile number */
  mobileNumber?: string;
  /** Employee ID */
  employeeId?: string;
  /** Profile picture URL */
  pictureUrl?: string;
}

/**
 * Query parameters for listing users
 */
export interface IUsersQueryParams {
  /** API version (default: 6.0) */
  v?: string;
  /** Select specific fields */
  select?: string;
  /** Include deleted users */
  includeDeleted?: boolean;
}

/**
 * Response from get all users
 */
export interface IUsersResponse {
  /** Array of users */
  users: IUser[];
  /** Revision for optimistic locking */
  revision?: string;
}

/**
 * Password reset request
 */
export interface IResetPasswordRequest {
  /** New password */
  newPassword: string;
}

/**
 * Batch update field operation
 */
export interface IBatchUpdateField {
  /** Field name to update (e.g., 'skillIds', 'profileIds') */
  name: string;
  /** Values to add or remove */
  value: (string | number)[];
  /** Operation type: 'add' or 'remove' */
  operation: 'add' | 'remove';
}

/**
 * Request body for batch user update
 */
export interface IBatchUpdateUsersRequest {
  /** User IDs to update */
  ids: (string | number)[];
  /** Fields to update with their operations */
  fields: IBatchUpdateField[];
}

/**
 * Response from batch user update
 */
export interface IBatchUpdateUsersResponse {
  /** Updated users (if any returned) */
  users?: IUser[];
  /** Success status */
  success?: boolean;
}
