import { Module } from '@nestjs/common';
import { CCAppMgtController } from './cc-app-manager.controller';
import { CCAppMgtSevice } from './cc-app-manager.service';
import { AccountConfigModule } from '../AccountConfig/account-config.module';
import { HttpModule } from '@nestjs/axios';
import { HelperModule } from '../HelperService/helper-service.module';

@Module({
  controllers: [CCAppMgtController],
  imports: [AccountConfigModule,
    HelperModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CCAppMgtSevice],
  exports: [CCAppMgtSevice],
})
export class CCAppMgtModule {}
