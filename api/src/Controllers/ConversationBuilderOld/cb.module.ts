import { Module } from '@nestjs/common';
import { ConversationBuilderController } from './cb.controller';
import { ConversationBuilderService } from './cb.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';

@Module({
  controllers: [ConversationBuilderController],
  providers: [ConversationBuilderService],
  imports: [
    HelperModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  exports: [ConversationBuilderService],
})
export class ConversationBuilderModule {}
