import type { QTableProps } from 'quasar'

export enum ConversationStatuses {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  OVERDUE = 'OVERDUE',
}

export enum ConversationQueueState {
  ALL = 'ALL',
  IN_QUEUE = 'IN_QUEUE',
  ACTIVE = 'ACTIVE',
}

export const ProcessActions = {
  TRANSFER: 'transfer',
  CLOSE: 'close_conversation',
  SEND_MESSAGE: 'send_message'
}

export const MessagingRecordHeaders: QTableProps['columns'] = [
  {
    name: 'conversationId',
    required: false,
    label: 'selected',
    align: 'left',
    field: 'conversationId',
    style: 'max-width: 50px'
  },
  {
    name: 'startTime',
    required: false,
    label: 'start time',
    align: 'left',
    field: 'startTime'
  },
  {
    name: 'duration',
    required: false,
    label: 'duration',
    align: 'left',
    field: 'duration'
  },
  {
    name: 'conversationId',
    required: false,
    label: 'conversation id',
    align: 'left',
    field: 'conversationId'
  },
  {
    name: 'latestAgentId',
    required: false,
    label: 'Agent',
    align: 'left',
    field: 'latestAgentId'
  },
  {
    name: 'latestSkillId',
    required: false,
    label: 'latest Skill',
    align: 'left',
    field: 'latestSkillId'
  },
  {
    name: 'mcs',
    required: false,
    label: 'mcs',
    align: 'left',
    field: 'mcs'
  },
  {
    name: 'status',
    required: false,
    label: 'status',
    align: 'left',
    field: 'status'
  },
  {
    name: 'latestQueueState',
    required: false,
    label: 'latest queue state',
    align: 'left',
    field: 'latestQueueState'
  },
  {
    name: 'transfers',
    required: false,
    label: 'transfers',
    align: 'left',
    field: 'transfers'
  },
  {
    name: 'conversationSurveys',
    required: false,
    label: 'conversation surveys',
    align: 'left',
    field: 'conversationSurveys'
  }
]
