import {
  ValidationPipe,
  UsePipes,
  Delete,
  Query,
  Headers,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseInterceptors, 
  UploadedFiles,
  UploadedFile
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GoogleStorageService } from './googlestorage.service'
import { API_ROUTES } from '../../constants/constants';
// import { TrimDto } from './googlestorage.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiSecurity
} from '@nestjs/swagger';
// import { AxiosResponse } from 'axios';

@Controller(API_ROUTES.GOOGLE_STORAGE())
export class GoogleStorageController {
  constructor(private service: GoogleStorageService) {}

  @Get('images')
  @ApiOperation({ summary: 'Get images' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  async getImages(): Promise<string[]> | null {
    return this.service.getImages();
  }

  @Get('app-assets')
  @ApiOperation({ summary: 'Get images' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  async getAppImages(): Promise<string[]> | null {
    return this.service.getAppAssets();
  }

  @Get(':accountId/brand')
  @ApiOperation({ summary: 'Get images' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'prefix', required: false })
  @ApiQuery({ name: 'delimiter', required: false })
  async listBlobsWithBrandNdame(
    @Headers('brandname') prefix: string,
    @Param('accountId') accountId: string,
    @Headers('delimiter') delimiter: string | null
  ): Promise<any[]> | null {
    return this.service.listBlobsWithBrandName(accountId, prefix, delimiter);
  }

  @Post(':accountId/image-base64')
  @ApiOperation({ summary: 'Upload base64' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiOkResponse({ description: 'Base64 uploaded' })
  async uploadBase64(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return this.service.uploadBase64(body.base64, accountId, body.brandName, body.name);
  }

  @Get('/:accountId/app-resources')
  @ApiOperation({ summary: 'Get app resources' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  async getAppResources(@Headers('bucket') bucket: string): Promise<string[]> | null {
    return this.service.getAppAssets();
  }

  @Get('/:accountId/all')
  @ApiOperation({ summary: 'Get images' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'prefix', required: false })
  @ApiQuery({ name: 'delimiter', required: false })
  async listBlobsWithBrandName(
    @Headers('brandname') prefix: string,
    @Param('accountId') accountId: string,
    @Headers('delimiter') delimiter: string | null
  ): Promise<any[]> | null {
    return this.service.listBlobsWithBrandName(accountId, prefix, delimiter);
  }

  @Post(':accountId/images')
  @ApiOperation({ summary: 'Upload image' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiOkResponse({ description: 'Image uploaded' })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImage(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('accountId') accountId: string,
    @Headers('brandname') brandName: string
  ): Promise<any> {
    return this.service.uploadFileToBrandStorage(files, accountId, brandName);
  }

  @Post(':accountId/storage-base64')
  @ApiOperation({ summary: 'Upload image' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiOkResponse({ description: 'Image uploaded' })
  async uploadFile(
    @Headers('folder') folder: string,
    @Headers('filename') filename: string,
    @Body() body: any,
  ): Promise<any> {
    return this.service.uploadBase64ToStorage(body.base64, folder, filename);
  }

  @Get(':accountId/image-url')
  @ApiOperation({ summary: 'Get images' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'url', required: false })
  async getImage(
    @Param('accountId') accountId: string,
    @Query('url') url: string
  ): Promise<any> {
    return this.service.getImage(url);
  }

  @Post(':accountId/image-url')
  @ApiOperation({ summary: 'Download image by URL' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiOkResponse({ description: 'Image downloaded' })
  async downloadImageByURL(
    @Body() body: any,
    @Param('accountId') accountId: string
  ): Promise<any> {
    return this.service.downloadImageByURL(body.url, body.filename, body.brandName, accountId);
  }

  // async returnBase64FromImageUrl (url: string) {
  @Get(':accountId/image-base64')
  @ApiOperation({ summary: 'Get images' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'url', required: true })
  async returnBase64FromImageUrl(
    @Query('url') url: string
  ): Promise<string> {
    return this.service.returnBase64FromImageUrl(url);
  }

  // async removeFile (filename: string) {
  @Delete(':accountId/images')
  @ApiOperation({ summary: 'Remove file' })
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'filename', required: true })
  async removeFile(
    @Query('fileName') filename: string
  ): Promise<any> {
    return this.service.removeFile(filename);
  }

  // async searchGooglewbImages (query: string): Promise<any[]> | null {
  @Get(':accountId/search')
  @ApiOperation({ summary: 'Search Google Web Images' })  
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'query', required: true })
  async searchGooglewbImages(
    @Query('query') query: string
  ): Promise<any[]> | null {
    return this.service.searchGoogleWebImages(query, null);
  }

  // async searchGoogleWeb (query: string): Promise<any[]> | null {
  @Get(':accountId/search-google-web')
  @ApiOperation({ summary: 'Search Google Web' }) 
  @ApiResponse({ status: 401, description: 'Forbidden.' })
  @ApiQuery({ name: 'query', required: true })
  async searchGoogleWeb(
    @Query('query') query: string
  ): Promise<any[]> | null {
    return this.service.searchGoogleWeb(query);
  }
  // async searchGoogleWeb (query: string): Promise<any[]> | null {
  
  

  
}
