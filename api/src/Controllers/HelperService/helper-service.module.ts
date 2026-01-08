import { Module } from '@nestjs/common';
import { HelperController } from './helper-service.controller';
import { HelperService } from './helper-service.service';
import { HttpModule } from '@nestjs/axios';
// import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  controllers: [HelperController],
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [HelperService],
  exports: [HelperService],
})
export class HelperModule {}
