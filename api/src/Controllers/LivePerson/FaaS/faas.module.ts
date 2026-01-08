/**
 * FaaS Module
 * NestJS module for LivePerson Functions (FaaS) API
 * Domain: faasUI
 */

import { Module } from '@nestjs/common';
import { FaaSController } from './faas.controller';
import { FaaSService } from './faas.service';
import { HelperModule } from '../../HelperService/helper-service.module';
import { APIModule } from '../../APIService/api.module';

@Module({
  imports: [HelperModule, APIModule],
  controllers: [FaaSController],
  providers: [FaaSService],
  exports: [FaaSService],
})
export class FaaSModule {}
