/*
11Labs Text-to-Speech API interface
*/

export interface IVoice {
  voiceId: string;
  modelId: string;
  name: string;
  canBeFinetuned: boolean;
  canDoTextToSpeech: boolean;
  canDoVoiceConversion: boolean;
  canUseStyle: boolean;
  canUseSpeakerBoost: boolean;
  servesProVoices: boolean;
  tokenCostFactor: number;
  description: string;
  requiresAlphaAccess: boolean;
  maxCharactersRequestFreeUser: number;
  maxCharactersRequestSubscribedUser: number;
  maximumTextLengthPerRequest: number;
  languages: {
    languageId: string;
    name: string;
  }[];
  modelRates?: {
    characterCostMultiplier?: number;
  };
  concurrencyGroup?: string; // e.g., "standard"
}

export interface VoiceCollection {
  collection_id: string;
  title: string;
  icon: string;
  permission_on_resource: string;
}
