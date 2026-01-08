/**
 * Special Occasions Module
 * NestJS module for Special Occasions API
 */

import { Module } from '@nestjs/common';
import { SpecialOccasionsController } from './special-occasions.controller';
import { SpecialOccasionsService } from './special-occasions.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [SpecialOccasionsController],
  providers: [SpecialOccasionsService],
  exports: [SpecialOccasionsService],
})
export class SpecialOccasionsModule {}
