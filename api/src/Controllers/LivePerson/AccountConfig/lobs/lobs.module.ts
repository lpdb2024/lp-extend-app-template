/**
 * LOBs Module
 * NestJS module for LOBs (Lines of Business) API
 */

import { Module } from '@nestjs/common';
import { LobsController } from './lobs.controller';
import { LobsService } from './lobs.service';
import { LPSharedModule } from '../../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [LobsController],
  providers: [LobsService],
  exports: [LobsService],
})
export class LobsModule {}
