import { ValidationPipe, UsePipes, Controller, Get, Headers, Param, Post, Body, Put, Delete, Res } from '@nestjs/common';
// import { CreateCatDto } from './dto/create-cat.dto';
// import { CatsService } from './cats.service';
import { LLMTaskService } from './llm-task.service'
// import { Response as Res } from 'express';
import { API_ROUTES, User } from '../../constants/constants';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { LE_USER_ROLES } from 'src/constants/constants'

import {
  ConversationTopicDto,
  ConversationTopicRequestDto,
  ConversationSampleDto
} from './llm-task.dto'

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosResponse } from 'axios';

@Controller(API_ROUTES.LLM_TASK())
export class LLMTaskController {
  constructor(private service: LLMTaskService) {}

  @Post('/:accountId/generate_conversations')
  @ApiOperation({ summary: 'Add Topic' })
  @ApiResponse({ status: 200, description: 'The topic has been successfully added.'})
  @ApiResponse({ status: 201, description: 'The topic has been successfully added.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UsePipes(new ValidationPipe({ transform: false, whitelist: true}))
  @UseGuards(RolesGuard)
  @Roles([LE_USER_ROLES.ADMIN])
  async createUser(
    @Headers('authorization') token: string,
    @User() user: any,
    @Body() body: any
  ): Promise<any> {
    const responseBody = await this.service.generateConversations(body)
    console.info(responseBody)
    return responseBody
  }
  
}
