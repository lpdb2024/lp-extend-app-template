import { forwardRef, Module } from '@nestjs/common';
import { ConversationCloudController } from './conversation-cloud.controller';
import { ConversationCloudService } from './conversation-cloud.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';
import { AccountConfigModule } from '../AccountConfig/account-config.module';
@Module({
  controllers: [ConversationCloudController],
  providers: [ConversationCloudService],
  imports: [
    forwardRef(() => AccountConfigModule),
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [ConversationCloudService],
})
export class ConversationCloudModule {}
