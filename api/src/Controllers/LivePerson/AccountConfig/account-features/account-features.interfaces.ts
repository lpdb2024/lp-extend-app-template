/**
 * Account Features Interfaces
 * Types for LivePerson Account Config Feature Grants API
 */

export interface IFeatureValue {
  type: 'LPBoolean' | 'LPString' | 'LPInteger';
  $: string;
}

export interface IAccountFeature {
  id: string;
  from: string;
  to: string;
  deleted: boolean;
  value: IFeatureValue;
}

export interface IGrantedFeatures {
  revision: number;
  grantedFeature: IAccountFeature[];
}

export interface IAccountFeaturesResponse {
  id: string;
  grantedFeatures: IGrantedFeatures;
}

export interface IUpdateFeature {
  id: string;
  value: IFeatureValue;
}

export interface IUpdateFeaturesPayload {
  grantedFeature: IUpdateFeature[];
}
