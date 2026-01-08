export enum OAI_SPEAKERS {
  CONSUMER = 'Consumer',
  SYSTEM = 'System',
  AGENT = 'Agent'
}

export interface OpenAiMessage {
  speaker: OAI_SPEAKERS
  text: string
  time: number
  id?: string
}

export enum INSTRUCTION_TYPES {
  REPHRASE = 'Please try again to rephrase the following text',
  ELABORATE = 'Please elaborate on the following text, providing a concise well thought-out response',
  SUMMARIZE = 'Please summarize the following text, providing a concise well thought-out response. The text should be no more than 50 words',
  PROFESSIONALISE = 'Please professionalize the following text, providing a concise well thought-out response',
  SIMPLIFY = 'Please simplify the following text, providing a concise well thought-out response',
  STEPS = 'If this is a series of steps to follow, please format appropriate with a numbered lsit of steps. Please provide the following text in dot point steps, providing a concise well thought-out response',
  DOT_POINTS = 'Please provide the following text in dot point steps, providing a concise well thought-out response',
}
