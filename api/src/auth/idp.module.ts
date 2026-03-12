/**
 * IDP Module
 *
 * Provides authentication endpoints for standalone apps:
 * - Agent Login (username/password via LP Login Service API)
 * - SSO (OAuth2 via LP Sentinel)
 * - Session management (cookie-based, no database required)
 *
 * Requires HelperModule for LP domain resolution (CSDS).
 * Requires ConversationBuilderModule for CB token acquisition.
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IdpController } from './idp.controller';
import { HelperModule } from '../Controllers/HelperService/helper-service.module';
import { ConversationBuilderModule } from '../Controllers/LivePerson/ConversationBuilder/cb.module';

@Module({
  imports: [
    HttpModule.register({ timeout: 10000, maxRedirects: 5 }),
    HelperModule,
    ConversationBuilderModule,
  ],
  controllers: [IdpController],
})
export class IdpModule {}
