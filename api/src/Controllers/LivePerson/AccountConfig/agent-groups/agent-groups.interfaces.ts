/**
 * Agent Groups API Interfaces
 * TypeScript interfaces for Vue frontend export
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Agent Group entity from LivePerson
 */
export interface IAgentGroup extends ILPBaseEntity {
  /** Unique identifier for the agent group */
  id: number;
  /** Name of the agent group (must be unique) */
  name: string;
  /** Description of the agent group */
  description?: string;
  /** Parent group ID (null only for root group) */
  parentGroupId?: number | null;
  /** Whether the group is enabled */
  isEnabled: boolean;
  /** Whether the group is deleted */
  deleted?: boolean;
  /** Last update timestamp */
  dateUpdated?: string;
}

/**
 * Agent Group with members (returned when getUsers=true)
 */
export interface IAgentGroupWithMembers extends IAgentGroup {
  /** Array of user IDs who are members of this group */
  members?: number[];
  /** Array of user IDs who are managers of this group */
  managers?: number[];
}

/**
 * Request to create a new agent group
 */
export interface ICreateAgentGroupRequest {
  /** Name of the agent group (required, must be unique) */
  name: string;
  /** Description of the agent group */
  description?: string;
  /** Parent group ID (required if other groups exist, null only for root) */
  parentGroupId?: number | null;
  /** Whether the group is enabled (default: true) */
  isEnabled?: boolean;
}

/**
 * Request to update an agent group
 */
export interface IUpdateAgentGroupRequest {
  /** Name of the agent group */
  name?: string;
  /** Description of the agent group */
  description?: string;
  /** Parent group ID */
  parentGroupId?: number | null;
  /** Whether the group is enabled */
  isEnabled?: boolean;
}

/**
 * Request to update multiple agent groups
 */
export interface IBulkUpdateAgentGroupsRequest {
  /** Array of agent groups to update */
  agentGroups: (IUpdateAgentGroupRequest & { id: number })[];
}

/**
 * Query parameters for listing agent groups
 */
export interface IAgentGroupsQueryParams {
  /** API version (default: 2.0) */
  v?: string;
  /** Include user members in response */
  getUsers?: boolean;
  /** Select specific fields */
  select?: string;
  /** Include deleted groups */
  includeDeleted?: boolean;
}

/**
 * Response from get all agent groups
 */
export interface IAgentGroupsResponse {
  /** Array of agent groups */
  agentGroups: IAgentGroupWithMembers[];
  /** Revision for optimistic locking */
  revision?: string;
}

/**
 * Response from single agent group operations
 */
export interface IAgentGroupResponse {
  /** The agent group data */
  agentGroup: IAgentGroup;
  /** Revision for optimistic locking */
  revision?: string;
}

/**
 * Response from create agent group
 */
export interface ICreateAgentGroupResponse {
  /** The created agent group */
  agentGroup: IAgentGroup;
  /** New revision */
  revision?: string;
  /** Location header with URI to new resource */
  location?: string;
}

/**
 * Response from delete operation
 */
export interface IDeleteAgentGroupResponse {
  /** Whether the delete was successful */
  success: boolean;
  /** New revision after delete */
  revision?: string;
}

/**
 * Bulk delete request
 */
export interface IBulkDeleteAgentGroupsRequest {
  /** Array of agent group IDs to delete */
  ids: number[];
}
