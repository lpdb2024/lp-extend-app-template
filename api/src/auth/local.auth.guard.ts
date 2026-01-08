import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Response } from 'express';
import type { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { LE_USER_ROLES } from 'src/constants/constants';

import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // const response = context.switchToHttp().getResponse<Response>();


    if (!request.user1) {
      // response.redirect('/login');
      return false;
    }
    return true;
  }
}


