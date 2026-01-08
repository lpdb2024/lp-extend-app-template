import { V1 } from './constants'
export const CONV_SIM_ROUTES = {
  BASE: (accountId: string) => `${V1}/conversation-creator/${accountId}`,
  RUN_TASK: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/run-task`,
  STOP_TASK: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/stop-task`,
  PERSONAS: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/personas`,
  PERSONA: (accountId: string, personaId: string) => `${CONV_SIM_ROUTES.PERSONAS(accountId)}/${personaId}`,
  PERSONA_TEMPLATES: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/personas-templates`,
  SCENARIOS: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/scenarios`,
  SCENARIO_TEMPLATES: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/scenario-templates`,
  SCENARIO_ID: (accountId: string, scenarioId: string) => `${CONV_SIM_ROUTES.SCENARIOS(accountId)}/${scenarioId}`,
  VERTICALS: (accountId: string) => `${CONV_SIM_ROUTES.BASE(accountId)}/scenario-verticals`
}
