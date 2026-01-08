/**
 * Connector Module
 * NestJS module for Connector API
 */

import { Module } from '@nestjs/common';
import { ConnectorController } from './connector.controller';
import { ConnectorService } from './connector.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
