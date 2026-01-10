import { Module } from '@nestjs/common';
import { AIStudioController } from './ai-studio.controller';
import { AIStudioService } from './ai-studio.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../../HelperService/helper-service.module';

@Module({
  controllers: [AIStudioController],
  providers: [AIStudioService],
  imports: [
    HelperModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  exports: [
    AIStudioService
  ],
})
export class AIStudioModule {}
