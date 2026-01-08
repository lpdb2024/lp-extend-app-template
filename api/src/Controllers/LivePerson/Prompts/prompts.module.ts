/**
 * Prompts Module
 * NestJS module for LivePerson Prompt Library API
 * Domain: promptlibrary
 */

import { Module } from '@nestjs/common';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './prompts.service';
import { LPSharedModule } from '../shared/shared.module';

@Module({
  imports: [LPSharedModule],
  controllers: [PromptsController],
  providers: [PromptsService],
  exports: [PromptsService],
})
export class PromptsModule {}
