import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

export class BaseUriDto {
  service: string
  account: string
  baseURI: string
}