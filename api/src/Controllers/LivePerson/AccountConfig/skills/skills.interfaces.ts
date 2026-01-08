/**
 * Skills API Interfaces
 * TypeScript interfaces for Vue frontend export
 */

import { ILPBaseEntity } from '../../shared/lp-common.interfaces';

/**
 * Skill routing configuration
 */
export interface ISkillRoutingConfiguration {
  /** Routing priority */
  priority: number;
  /** Split percentage for routing */
  splitPercentage: number;
  /** Target agent group ID */
  agentGroupId: number;
}

/**
 * Skill transfer list entry
 */
export interface ISkillTransferEntry {
  /** Skill ID that can be transferred to */
  id: number;
}

/**
 * Skill entity from LivePerson
 */
export interface ISkill extends ILPBaseEntity {
  /** Unique identifier for the skill */
  id: number;
  /** Name of the skill */
  name: string;
  /** Description of the skill */
  description?: string;
  /** Display order of the skill */
  skillOrder?: number;
  /** Working hours schedule ID */
  workingHoursId?: number;
  /** Special occasion schedule ID */
  specialOccasionId?: number;
  /** Maximum wait time in seconds */
  maxWaitTime?: number;
  /** Whether the skill is deleted */
  deleted?: boolean;
  /** Last update timestamp */
  dateUpdated?: string;
  /** Whether transfers are allowed */
  canTransfer?: boolean;
  /** List of skills that can be transferred to */
  skillTransferList?: ISkillTransferEntry[];
  /** Line of business IDs */
  lobIds?: number[];
  /** Routing configuration */
  skillRoutingConfiguration?: ISkillRoutingConfiguration[];
  /** Default post conversation survey ID */
  postConversationSurveyId?: number;
  /** Fallback skill ID when offline */
  fallbackSkill?: number;
  /** Auto close time in seconds */
  autoCloseInSeconds?: number;
  /** Transfer to agent when no agents online */
  transferToAgentMaxWaitInSeconds?: number;
}

/**
 * Request to create a new skill
 */
export interface ICreateSkillRequest {
  /** Name of the skill (required) */
  name: string;
  /** Description of the skill */
  description?: string;
  /** Display order */
  skillOrder?: number;
  /** Working hours schedule ID */
  workingHoursId?: number;
  /** Special occasion schedule ID */
  specialOccasionId?: number;
  /** Maximum wait time in seconds */
  maxWaitTime?: number;
  /** Whether transfers are allowed */
  canTransfer?: boolean;
  /** List of skill IDs that can be transferred to */
  skillTransferList?: ISkillTransferEntry[];
  /** Line of business IDs */
  lobIds?: number[];
  /** Routing configuration */
  skillRoutingConfiguration?: ISkillRoutingConfiguration[];
}

/**
 * Request to update a skill
 */
export interface IUpdateSkillRequest {
  /** Name of the skill */
  name?: string;
  /** Description of the skill */
  description?: string;
  /** Display order */
  skillOrder?: number;
  /** Working hours schedule ID */
  workingHoursId?: number;
  /** Special occasion schedule ID */
  specialOccasionId?: number;
  /** Maximum wait time in seconds */
  maxWaitTime?: number;
  /** Whether transfers are allowed */
  canTransfer?: boolean;
  /** List of skill IDs that can be transferred to */
  skillTransferList?: ISkillTransferEntry[];
  /** Line of business IDs */
  lobIds?: number[];
  /** Routing configuration */
  skillRoutingConfiguration?: ISkillRoutingConfiguration[];
}

/**
 * Query parameters for listing skills
 */
export interface ISkillsQueryParams {
  /** API version (default: 2.0) */
  v?: string;
  /** Select specific fields */
  select?: string;
  /** Include deleted skills */
  includeDeleted?: boolean;
}

/**
 * Response from get all skills
 */
export interface ISkillsResponse {
  /** Array of skills */
  skills: ISkill[];
  /** Revision for optimistic locking */
  revision?: string;
}
