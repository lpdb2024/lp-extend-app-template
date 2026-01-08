/**
 * App Installations Module
 * NestJS module for App Installations API
 */

import { Module } from '@nestjs/common';
import { AppInstallationsController } from './app-installations.controller';
import { AppInstallationsService } from './app-installations.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [AppInstallationsController],
  providers: [AppInstallationsService],
  exports: [AppInstallationsService],
})
export class AppInstallationsModule {}
