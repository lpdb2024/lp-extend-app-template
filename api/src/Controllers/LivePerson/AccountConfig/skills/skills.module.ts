/**
 * Skills Module
 * NestJS module for Skills API
 */

import { Module, forwardRef } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { LPSharedModule } from '../../shared/shared.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [LPSharedModule, forwardRef(() => UsersModule)],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
