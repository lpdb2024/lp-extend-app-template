import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}