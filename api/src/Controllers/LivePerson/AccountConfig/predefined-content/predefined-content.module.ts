/**
 * Predefined Content Module
 * NestJS module for Predefined Content (Canned Responses) API
 */

import { Module } from '@nestjs/common';
import { PredefinedContentController } from './predefined-content.controller';
import { PredefinedContentService } from './predefined-content.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [PredefinedContentController],
  providers: [PredefinedContentService],
  exports: [PredefinedContentService],
})
export class PredefinedContentModule {}
