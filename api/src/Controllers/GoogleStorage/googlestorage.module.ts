import { Module } from '@nestjs/common';
import { GoogleStorageController } from './googlestorage.controller';
import { GoogleStorageService } from './googlestorage.service';

@Module({
  controllers: [GoogleStorageController],
  providers: [GoogleStorageService],
  exports: [GoogleStorageService],
})
export class GoogleStorageModule {}
