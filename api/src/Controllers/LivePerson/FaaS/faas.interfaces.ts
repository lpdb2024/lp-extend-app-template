/**
 * FaaS Interfaces
 * TypeScript interfaces for LivePerson Functions (FaaS) API
 * Domain: faasui
 */

/**
 * Lambda runtime configuration
 */
export interface ILambdaRuntime {
  uuid: string;
  name: string;
  baseImageName: string;
}

/**
 * Lambda deployment information
 */
export interface ILambdaDeployment {
  uuid: string;
  name: string;
  lambdaUUID: string;
  lambdaVersion: number;
  createdAt: string;
  deployedAt: string;
  createdBy: string;
  imageName: string;
  deploymentState: string;
  lambdaImageVersion: string | null;
}

/**
 * Lambda implementation (code, dependencies, env vars)
 */
export interface ILambdaImplementation {
  code: string;
  dependencies: string[];
  environmentVariables: IEnvironmentVariable[];
}

/**
 * Environment variable for a lambda
 */
export interface IEnvironmentVariable {
  key: string;
  value: string;
}

/**
 * Lambda sample payload
 */
export interface ILambdaSamplePayload {
  headers: unknown[];
  payload: Record<string, unknown>;
}

/**
 * Lambda entity
 */
export interface ILambda {
  uuid: string;
  version: number;
  name: string;
  description: string;
  samplePayload: ILambdaSamplePayload;
  state: 'Draft' | 'Productive' | 'Modified';
  runtime: ILambdaRuntime;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  minInstances: number;
  size: 'S' | 'M' | 'L' | 'XL';
  skills: string[];
  eventId?: string;
  lastDeployment?: ILambdaDeployment;
  implementation: ILambdaImplementation;
}

/**
 * FaaS Schedule entity
 */
export interface IFaaSSchedule {
  uuid: string;
  lambdaUUID: string;
  isActive: boolean;
  cronExpression: string;
  didLastExecutionFail: boolean;
  lastExecution: string;
  nextExecution: string;
  createdBy: string;
  invocationBody: {
    payload: Record<string, unknown>;
    headers: unknown[];
  };
}

/**
 * FaaS Proxy Setting (whitelist domain)
 */
export interface IFaaSProxySetting {
  id: number;
  domain: string;
  name: string;
}

/**
 * Data for creating a new lambda
 */
export interface ICreateLambda {
  name: string;
  description?: string;
  runtime: {
    uuid: string;
  };
  size?: 'S' | 'M' | 'L' | 'XL';
  minInstances?: number;
  skills?: string[];
  eventId?: string;
  implementation: {
    code: string;
    dependencies?: string[];
    environmentVariables?: IEnvironmentVariable[];
  };
}

/**
 * Data for updating a lambda
 */
export interface IUpdateLambda {
  name?: string;
  description?: string;
  runtime?: {
    uuid: string;
  };
  size?: 'S' | 'M' | 'L' | 'XL';
  minInstances?: number;
  skills?: string[];
  eventId?: string;
  implementation?: {
    code?: string;
    dependencies?: string[];
    environmentVariables?: IEnvironmentVariable[];
  };
}

/**
 * Data for creating a schedule
 */
export interface ICreateSchedule {
  lambdaUUID: string;
  isActive: boolean;
  cronExpression: string;
  invocationBody?: {
    payload?: Record<string, unknown>;
    headers?: unknown[];
  };
}

/**
 * Data for updating a schedule
 */
export interface IUpdateSchedule {
  isActive?: boolean;
  cronExpression?: string;
  invocationBody?: {
    payload?: Record<string, unknown>;
    headers?: unknown[];
  };
}

/**
 * Data for creating a proxy setting
 */
export interface ICreateProxySetting {
  domain: string;
  name?: string;
}
