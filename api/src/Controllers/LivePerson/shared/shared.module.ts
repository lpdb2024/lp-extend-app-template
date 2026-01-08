/**
 * LivePerson Shared Module
 * Provides common services used across all LP domain modules
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LPDomainService } from './lp-domain.service';
import { APIService } from '../../APIService/api-service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [LPDomainService, APIService],
  exports: [LPDomainService, APIService, HttpModule],
})
export class LPSharedModule {}
