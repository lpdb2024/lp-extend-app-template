/**
 * Onsite Locations Module
 * NestJS module for LivePerson Onsite Locations API
 */

import { Module } from '@nestjs/common';
import { OnsiteLocationsController } from './onsite-locations.controller';
import { OnsiteLocationsService } from './onsite-locations.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [OnsiteLocationsController],
  providers: [OnsiteLocationsService],
  exports: [OnsiteLocationsService],
})
export class OnsiteLocationsModule {}
