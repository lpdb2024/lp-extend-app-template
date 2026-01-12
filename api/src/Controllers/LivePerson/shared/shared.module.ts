/**
 * LivePerson Shared Module
 * Provides common services used across all LP domain modules
 */

import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LPDomainService } from './lp-domain.service';
import { APIService } from '../../APIService/api-service';
import { SDKProviderService } from './sdk-provider.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [LPDomainService, APIService, SDKProviderService],
  exports: [LPDomainService, APIService, HttpModule, SDKProviderService],
})
export class LPSharedModule {}
