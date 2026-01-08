import { Module } from '@nestjs/common';
import { LLMTaskController } from './llm-task.controller';
import { LLMTaskService } from './llm-task.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';

@Module({
  controllers: [LLMTaskController],
  providers: [LLMTaskService],
  imports: [
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [LLMTaskService],
})
export class LLMTaskModule {}
