import { forwardRef, Module } from '@nestjs/common';
import { ConnectorAPIController } from './connector-api.controller';
import { ConnectorAPIService } from './connector-api.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';
import { ConversationCloudModule } from '../ConversationalCloud/conversation-cloud.module';
import { AIStudioModule } from '../AIStudio/ai-studio.module';
import { APIService } from '../APIService/api-service';
@Module({
  controllers: [ConnectorAPIController],
  providers: [
    ConnectorAPIService,
    APIService
  ],
  imports: [
    AIStudioModule,
    ConversationCloudModule,
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [
    ConnectorAPIService
  ],
})
export class ConnectorAPIModule {}
