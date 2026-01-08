import {
  ValidationPipe,
  UsePipes,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Res,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
// import { CreateCatDto } from './dto/create-cat.dto';
// import { CatsService } from './cats.service';
import { ConversationBuilderService } from './cb.service';
// import { Response as Res } from 'express';
import { API_ROUTES, MANAGER_ROLES } from '../../constants/constants';
import { User } from 'src/constants/constants';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosResponse } from 'axios';

import { AppAuthRequest, TokenDetails } from './cb.dto';
import { VerifyUser } from 'src/Firebase/auth.service';
import { UserData } from '../users/users.interfaces';
import { LpToken } from '../CCIDP/cc-idp.interfaces';
import { VerifyToken } from 'src/auth/auth.decorators';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller(API_ROUTES.CONVERSATION_BUILDER())
export class ConversationBuilderController {
  constructor(private service: ConversationBuilderService) {}

  @Get('/:accountId/bots')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getBots(
    @Param('accountId') accountId: string,
    @Headers('cb_token') authorization: string,
    @Headers('cb_org') organization: string,
  ): Promise<any> | null {
    return this.service.getBots(accountId, authorization, organization);
  }

  @Get('/:accountId/bots/:botId/logs')
  @UseGuards(RolesGuard)
  @Roles(MANAGER_ROLES)
  async getBotLogs(
    @VerifyToken({ roles: MANAGER_ROLES }) lpToken: LpToken,
    @Param('botId') botId: string,
  ): Promise<any> | null {
    console.info(
      'ConversationBuilderController.getBotLogs',
      'botId:',
      botId,
      'lpToken:',
      lpToken,
    );
    return this.service.getBotLogsFormatted(
      botId,
      lpToken.cbToken,
      lpToken.cbOrg,
    );
  }
}
