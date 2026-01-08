/**
 * Window Configurations Module
 * NestJS module for LivePerson Window Configurations API
 */

import { Module } from '@nestjs/common';
import { WindowConfigurationsController } from './window-configurations.controller';
import { WindowConfigurationsService } from './window-configurations.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [WindowConfigurationsController],
  providers: [WindowConfigurationsService],
  exports: [WindowConfigurationsService],
})
export class WindowConfigurationsModule {}
