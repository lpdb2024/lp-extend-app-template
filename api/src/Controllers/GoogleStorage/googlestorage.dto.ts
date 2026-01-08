import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNumber, IsString } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

export class ImageDTO {
  @ApiProperty()
  @IsString()
  image: string 
}
export class ImagesDTO {
  @IsArray()
  images: string[]
}