import { Module } from '@nestjs/common';
import { CCIdpController } from './cc-idp.controller';
import { CCIdpService } from './cc-idp.service';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';
import { AccountConfigModule } from '../AccountConfig/account-config.module';
@Module({
  controllers: [CCIdpController],
  providers: [CCIdpService],
  imports: [
    AccountConfigModule,
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [CCIdpService],
})
export class CCIdpModule {}
