import { forwardRef, Module } from '@nestjs/common';
import { AccountConfigController } from './account-config.controller';
import { AccountConfigService } from './account-config.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';
// import { ConversationCloudModule } from 'src/Controllers/ConversationalCloud/conversation-cloud.module'
@Module({
  controllers: [AccountConfigController],
  providers: [AccountConfigService],
  imports: [
    // forwardRef(() => ConversationCloudModule),
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [
    AccountConfigService
  ],
})
export class AccountConfigModule {}
