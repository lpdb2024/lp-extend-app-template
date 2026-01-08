/**
 * Profiles Interfaces
 * TypeScript interfaces for LivePerson Profiles API
 * Use these interfaces in Vue frontend for type safety
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Profile permission object
 */
export interface IProfilePermission {
  isEnabled: boolean;
  isAssignedToAllUsers?: boolean;
  enabledForAgentGroupIds?: number[];
  enabledForUserIds?: number[];
}

/**
 * Profile permission keys
 */
export type ProfilePermissionKey =
  | 'campaign_manage'
  | 'campaign_view'
  | 'engagement_history_view'
  | 'messaging_history_view'
  | 'users_manage'
  | 'users_view'
  | 'skills_manage'
  | 'skills_view'
  | 'agent_groups_manage'
  | 'agent_groups_view'
  | 'profiles_manage'
  | 'profiles_view'
  | 'predefined_content_manage'
  | 'predefined_content_view'
  | 'automatic_messages_manage'
  | 'automatic_messages_view'
  | 'working_hours_manage'
  | 'working_hours_view'
  | 'special_occasions_manage'
  | 'special_occasions_view'
  | 'conversation_builder_manage'
  | 'conversation_builder_view'
  | 'intent_manager_manage'
  | 'intent_manager_view'
  | 'knowledge_ai_manage'
  | 'knowledge_ai_view'
  | 'bot_accounts_manage'
  | 'bot_accounts_view'
  | 'all_conversations_view'
  | 'all_conversations_manage'
  | 'agent_status_view'
  | 'agent_status_manage'
  | 'lobs_manage'
  | 'lobs_view';

/**
 * Profile permissions object
 */
export interface IProfilePermissions {
  [key: string]: IProfilePermission;
}

/**
 * Profile entity returned by LivePerson API
 */
export interface IProfile extends ILPBaseEntity {
  id: number;
  name: string;
  description?: string;
  roleTypeId: number;
  roleTypeName?: string;
  dateCreated?: string;
  dateUpdated?: string;
  deleted?: boolean;
  isAssignedToLPA?: boolean;
  permissions?: IProfilePermissions;
  permissionGroups?: IProfilePermissionGroup[];
}

/**
 * Permission group structure
 */
export interface IProfilePermissionGroup {
  groupId: string;
  groupName: string;
  permissions: IProfilePermissionItem[];
}

/**
 * Permission item within a group
 */
export interface IProfilePermissionItem {
  permissionId: string;
  permissionName: string;
  isEnabled: boolean;
  isAssignedToAllUsers?: boolean;
  enabledForAgentGroupIds?: number[];
  enabledForUserIds?: number[];
}

/**
 * Role types
 */
export enum ProfileRoleType {
  AGENT = 1,
  AGENT_MANAGER = 2,
  CAMPAIGN_MANAGER = 3,
  ADMIN = 4,
  LPA = 5,
  CUSTOM = 6,
}

/**
 * Role type name mapping
 */
export const ProfileRoleTypeNames: Record<ProfileRoleType, string> = {
  [ProfileRoleType.AGENT]: 'Agent',
  [ProfileRoleType.AGENT_MANAGER]: 'Agent Manager',
  [ProfileRoleType.CAMPAIGN_MANAGER]: 'Campaign Manager',
  [ProfileRoleType.ADMIN]: 'Admin',
  [ProfileRoleType.LPA]: 'LPA',
  [ProfileRoleType.CUSTOM]: 'Custom',
};

/**
 * Data for creating a new profile
 */
export interface ICreateProfile {
  name: string;
  description?: string;
  roleTypeId: number;
  permissions?: IProfilePermissions;
}

/**
 * Data for updating a profile
 */
export interface IUpdateProfile {
  name?: string;
  description?: string;
  roleTypeId?: number;
  permissions?: IProfilePermissions;
}

/**
 * Query parameters for profiles list
 */
export interface IProfilesQuery {
  select?: string;
  includeDeleted?: boolean;
}

/**
 * Response structure for profiles list
 */
export interface IProfilesResponse {
  data: IProfile[];
  revision?: string;
}

/**
 * Response structure for single profile
 */
export interface IProfileResponse {
  data: IProfile;
  revision?: string;
}
