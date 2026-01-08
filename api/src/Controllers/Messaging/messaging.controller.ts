import {
  ValidationPipe,
  UsePipes,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Res,
  UseInterceptors,
  Headers,
  UploadedFiles,
} from '@nestjs/common';
// import { CreateCatDto } from './dto/create-cat.dto';
// import { CatsService } from './cats.service';
import { MessagingService } from './messaging.service';
import { API_ROUTES } from '../../constants/constants';
import { ConnectorDto } from './messaging.interfaces.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller(API_ROUTES.MESSAGING())
export class MessagingController {
  constructor(private service: MessagingService) {}

  @Put(':accountId/upload-file')
  @ApiOperation({ summary: 'Upload image' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiOkResponse({ description: 'file uploaded' })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImage(
    @UploadedFiles() file: Express.Multer.File,
    @Param('accountId') accountId: string,
    @Headers('sig') sig: string,
    @Headers('exp') exp: string,
    @Headers('size') size: string,
    @Headers('relativepath') relativepath: string,
  ): Promise<any> {
    return this.service.uploadFile(
      accountId,
      size,
      sig,
      exp,
      relativepath,
      file,
    );
  }

  @Post(':accountId/connectors/:connectorId')
  async authenticateConnector(
    @Param('accountId') accountId: string,
    @Param('connectorId') connectorId: string,
    @Body() body: any,
  ): Promise<any> | null {
    return this.service.authenticateJWT(accountId, connectorId, body);
  }

  @Get(':accountId/domains')
  async getDomains(
    @Param('accountId') accountId: string,
  ): Promise<ConnectorDto[]> | null {
    console.info('getDomains called for accountId:', accountId);
    return this.service.getDomains(accountId);
  }

  // @Get(':accountId/users')
  // async getUsers(
  //   @Param('accountId') accountId: string
  // ): Promise<ConnectorDto[]> | null {
  //   console.info
  //   return this.service.getUsers(accountId);
  // }

  @Get(':accountId/consumer-jwt')
  async getAnonymousTokenJWT(
    @Param('accountId') accountId: string,
  ): Promise<any> | null {
    return this.service.getAnonomousJWT(accountId);
  }

  @Get(':accountId/consumer-jws')
  async getAnonymousToken(
    @Param('accountId') accountId: string,
  ): Promise<any> | null {
    return this.service.getAnonomousJWT(accountId);
  }

  @Post(':accountId/authorize')
  async authoriseAnonomousJWT(
    @Param('accountId') accountId: string,
    @Body() body: any,
  ): Promise<any> | null {
    return this.service.authoriseAnonomousJWT(accountId, body);
  }

  @Get(':accountId/connectors')
  async getConnectors(
    @Param('accountId') accountId: string,
  ): Promise<ConnectorDto[]> | null {
    return this.service.getConnectors(accountId);
  }

  // @Get(':accountId/skills')
  // async getSkills(
  //   @Param('accountId') accountId: string
  // ): Promise<ConnectorDto[]> | null {
  //   return this.service.getSkills(accountId);
  // }

  @Get(':accountId/users')
  async getUsers(
    @Param('accountId') accountId: string,
  ): Promise<ConnectorDto[]> | null {
    console.info;
    return this.service.getUsers(accountId);
  }
}
