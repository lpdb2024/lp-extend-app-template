import { Module } from '@nestjs/common';
import { ConversationCloudController } from './conversation-cloud.controller';
import { ConversationCloudService } from './conversation-cloud.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../../HelperService/helper-service.module';

@Module({
  controllers: [ConversationCloudController],
  providers: [ConversationCloudService],
  imports: [
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [ConversationCloudService],
})
export class ConversationCloudModule {}
