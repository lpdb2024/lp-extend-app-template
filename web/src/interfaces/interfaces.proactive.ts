export interface messageComponent {
  type: string;
  sub_type: string;
  content: string;
  variables: string[];
  optOut: string;
}

interface ProactiveChannel {
  type: string;
  language: string;
  outboundnumber: string;
  messageComponents: messageComponent[];
}

export interface ProactiveTemplate {
  id: string;
  name: string;
  lookbackPeriodDay: number;
  lookbackPeriodHour: number;
  updatedAt: string;
  createdAt: string;
  channels: ProactiveChannel[];
  routeAllWithinLookback: boolean;
}

export interface ProactiveConfiguration {
  id: string;
  description: string;
  name: string;
  accountId: string;
  proactiveTemplate: ProactiveTemplate;
  namespace: string;
  uid: string;
  email: string;
  skillId: string;
  skillName: string;
  proactive: {
    campaignName: string | null;
    skill: string | null;
    templateId: string | null;
    consent: boolean;
    consumers: {
      consumerPhoneNumber: string | null;
      header: string | null;
      variableHeadersType: string | null;
      variables: { [key: string]: string };
      tempVariables: { name: string; value: string}[]
    }[];
  };
}
