import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';
// import { ConnectorAPIModule } from 'src/Controllers/ConnectorAPI/connector-api.module';
import { CCAppMgtModule } from 'src/Controllers/CCAppManagement/cc-app-manager.module';
import { ConnectorAPIModule } from '../ConnectorAPI/connector-api.module';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService],
  imports: [
    CCAppMgtModule,
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConnectorAPIModule,
  ],
  exports: [],
})
export class MessagingModule {}
