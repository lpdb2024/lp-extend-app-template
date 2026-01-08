    import { Module } from '@nestjs/common';
    import { AuthService } from './auth.service';
    import { LocalStrategy } from './local.strategy';
    import { AuthController } from './auth.controller';
    import { PassportModule } from '@nestjs/passport';
    import { HttpModule } from '@nestjs/axios';
    import { HelperModule } from 'src/Controllers/HelperService/helper-service.module';
    import { AccountConfigModule } from 'src/Controllers/AccountConfig/account-config.module';
    // import { UserModule } from '../user/user.module';

    @Module({
      imports: [
        PassportModule,
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
        AccountConfigModule,
        HelperModule,
      ],
      providers: [AuthService, LocalStrategy],
      controllers: [AuthController],
    })
    export class AuthModule {}
