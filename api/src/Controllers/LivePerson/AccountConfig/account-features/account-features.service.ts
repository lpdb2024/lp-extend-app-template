/**
 * Account Features Service
 * Handles Account Config Feature Grants API operations for LivePerson
 */

import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { APIService } from '../../../APIService/api-service';
import { LPDomainService } from '../../shared/lp-domain.service';
import { LPBaseService } from '../../shared/lp-base.service';
import {
  LP_SERVICE_DOMAINS,
} from '../../shared/lp-constants';
import { ILPResponse, ILPRequestOptions } from '../../shared/lp-common.interfaces';
import {
  IGrantedFeatures,
  IUpdateFeaturesPayload,
} from './account-features.interfaces';
import { TokenInfo } from '../../shared/sdk-provider.service';

@Injectable()
export class AccountFeaturesService extends LPBaseService {
  protected readonly serviceDomain = LP_SERVICE_DOMAINS.ACCOUNT_CONFIG_WRITE;
  protected readonly defaultApiVersion = '2.0';

  constructor(
    apiService: APIService,
    domainService: LPDomainService,
    @InjectPinoLogger(AccountFeaturesService.name)
    logger: PinoLogger,
  ) {
    super(apiService, domainService, logger);
    this.logger.setContext(AccountFeaturesService.name);
  }

  /**
   * Get all account features (feature grants)
   */
  async getAll(
    accountId: string,
    token: TokenInfo | string,
    excludeLegacy: boolean = true,
  ): Promise<ILPResponse<IGrantedFeatures>> {
    const path = `/api/account/${accountId}/configuration/provision/featureGrants`;

    // ?v=2.0&excludeLegacy=true&jsonProvider=gson HTTP/1.1
    const requestOptions: ILPRequestOptions = {
      // source: 'ccui',
      version: '2.0',
      additionalParams: {
        excludeLegacy: excludeLegacy.toString(),
        jsonProvider: 'gson',
      },
    };

    const response = await this.get<any>(accountId, path, token, requestOptions);

    // Parse the LP response format to extract grantedFeatures
    const data = response.data;
    let grantedFeatures: IGrantedFeatures;

    // Try different response structures LP API may return
    const itemsCollection = data?.appDataList?.[0]?.accountList?.accountList?.[0]?.itemsCollection?.data;

    if (itemsCollection) {
      // Structure: { appDataList: [{ accountList: { accountList: [{ itemsCollection: { data: [...] } }] } }] }
      // Transform to expected format
      const features = itemsCollection.map((item: any) => ({
        id: item.compoundFeatureID,
        from: item.startDate,
        to: item.endDate,
        deleted: item.isDeleted || false,
        value: {
          type: 'LPBoolean' as const,
          $: String(item.value?.value ?? item.value),
        },
      }));
      grantedFeatures = {
        revision: parseInt(response.revision) || 0,
        grantedFeature: features,
      };
    } else if (data?.appDataList?.[0]?.accountList?.accountData?.[0]?.grantedFeatures) {
      grantedFeatures = data.appDataList[0].accountList.accountData[0].grantedFeatures;
    } else if (data?.acApp?.[0]?.accountList?.account?.[0]?.grantedFeatures) {
      // Structure from Postman example: { acApp: [{ accountList: { account: [{ grantedFeatures }] } }] }
      grantedFeatures = data.acApp[0].accountList.account[0].grantedFeatures;
    } else if (data?.grantedFeatures) {
      grantedFeatures = data.grantedFeatures;
    } else {
      // Fallback
      grantedFeatures = {
        revision: data?.revision || 0,
        grantedFeature: data?.grantedFeature || [],
      };
    }

    return {
      data: grantedFeatures,
      revision: response.revision || grantedFeatures.revision?.toString(),
    };
  }

  /**
   * Update account features (batch update)
   */
  async update(
    accountId: string,
    token: TokenInfo | string,
    data: IUpdateFeaturesPayload,
    revision: string,
  ): Promise<ILPResponse<IGrantedFeatures>> {
    const path = `/api/account/${accountId}/configuration/provision/featureGrants`;

    const requestOptions: ILPRequestOptions = {
      source: 'ccui',
      revision,
      version: '2.0',
      additionalParams: {
        overrideAll: 'false',
        jsonProvider: 'gson',
      },
    };

    const response = await this.put<any>(accountId, path, data, token, requestOptions);

    // Parse response
    const responseData = response.data;
    let grantedFeatures: IGrantedFeatures;

    if (responseData?.acApp?.[0]?.accountList?.account?.[0]?.grantedFeatures) {
      grantedFeatures = responseData.acApp[0].accountList.account[0].grantedFeatures;
    } else if (responseData?.grantedFeatures) {
      grantedFeatures = responseData.grantedFeatures;
    } else {
      grantedFeatures = {
        revision: responseData?.revision || 0,
        grantedFeature: responseData?.grantedFeature || [],
      };
    }

    return {
      data: grantedFeatures,
      revision: response.revision || grantedFeatures.revision?.toString(),
    };
  }

  /**
   * Get the current revision for account features
   */
  async getRevision(accountId: string, token: TokenInfo | string): Promise<string | undefined> {
    const response = await this.getAll(accountId, token);
    return response.revision;
  }
}
