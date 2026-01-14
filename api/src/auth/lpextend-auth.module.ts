/**
 * LP Extend Auth Module (v2)
 *
 * Provides API key-based authentication for LP Extend child apps.
 *
 * Configuration (via environment variables):
 * - LPEXTEND_API_KEY: Your app's API key from registration
 * - LPEXTEND_SHELL_URL: Shell base URL (default: http://localhost:3001)
 *
 * Usage:
 * 1. Import this module in your AppModule
 * 2. Use @Public() decorator for public routes
 * 3. Use @LpUserId(), @LpAccountId(), etc. decorators in controllers
 * 4. Use @RequiresApi('skills') to require specific API access
 *
 * @example
 * // app.module.ts
 * @Module({
 *   imports: [LpExtendAuthModule],
 *   // ...
 * })
 * export class AppModule {}
 *
 * @example
 * // my.controller.ts
 * @Controller('api/my')
 * export class MyController {
 *   @Get('profile')
 *   getProfile(@LpUserId() userId: string, @LpAccountId() accountId: string) {
 *     return { userId, accountId };
 *   }
 *
 *   @Public()
 *   @Get('health')
 *   healthCheck() {
 *     return { status: 'ok' };
 *   }
 *
 *   @RequiresApi('skills')
 *   @Get('skills')
 *   getSkills(@LpAccessToken() token: string) {
 *     // Only accessible if app has 'skills' API access
 *   }
 * }
 */

import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { LpExtendAuthService } from './lpextend-auth.service';
import { LpExtendAuthMiddleware } from './lpextend-auth.middleware';
import { LpExtendAuthGuard } from './lpextend-auth.guard';

@Module({
  imports: [HttpModule],
  providers: [
    LpExtendAuthService,
    LpExtendAuthMiddleware,
    // Register guard globally - use @Public() to opt out
    {
      provide: APP_GUARD,
      useClass: LpExtendAuthGuard,
    },
  ],
  exports: [LpExtendAuthService],
})
export class LpExtendAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to all routes
    consumer
      .apply(LpExtendAuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
