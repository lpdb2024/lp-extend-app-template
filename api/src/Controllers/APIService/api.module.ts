import { Global, Module } from '@nestjs/common';
import { APIService } from './api-service'
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';
import { AccountConfigModule } from '../AccountConfig/account-config.module';
@Global()
@Module({
  controllers: [],
  providers: [APIService],
  imports: [
    AccountConfigModule,
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [APIService],
})
export class APIModule {}
