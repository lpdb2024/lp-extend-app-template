import { Controller, Post, Get, Res, Param, Req, Body, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { VerifyToken, VerifyFirebaseToken } from 'src/auth/auth.decorators';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('callback')
  async login(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.authenticateUser(req, res);
  }

  @Get('logout/:accountId')
  async logout(
    @Param('accountId') accountId: string,
    @VerifyToken() token: string,
    @Res() res: Response,
  ) {
    await this.authService.logOut(accountId, token);
    res.clearCookie('cc_auth');
  }

  /**
   * Get user profile by Firebase UID
   * Called after Firebase authentication to get user's LP account info
   */
  @Get('api/v2/auth/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile by Firebase token' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing Firebase token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getCurrentUser(
    @VerifyFirebaseToken() firebaseUid: string,
  ) {
    return this.authService.getUserByFirebaseUid(firebaseUid);
  }

  /**
   * Update user's default LP account
   */
  @Put('api/v2/auth/me/default-account')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set user default LP account' })
  @ApiResponse({ status: 200, description: 'Default account updated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing Firebase token' })
  @ApiResponse({ status: 400, description: 'Invalid account ID or user not linked to account' })
  async setDefaultAccount(
    @VerifyFirebaseToken() firebaseUid: string,
    @Body('accountId') accountId: string,
  ) {
    return this.authService.setDefaultAccount(firebaseUid, accountId);
  }

  /**
   * Link a new LP account to the user
   */
  @Post('api/v2/auth/me/link-account')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a new LP account to user' })
  @ApiResponse({ status: 200, description: 'Account linked successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing Firebase token' })
  async linkAccount(
    @VerifyFirebaseToken() firebaseUid: string,
    @Body('accountId') accountId: string,
  ) {
    return this.authService.linkLpAccount(firebaseUid, accountId);
  }
}
