import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, isBoolean } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';
// import { FilteredRecord } from '../ConversationSimulator/conv-simulator.dto';

export class ConversationTopicRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  config: AccountConfigDto[];

  @ApiProperty()
  @IsString()
  categoryName: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  active: boolean;
}
export class AccountConfigDto {
  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsString()
  account_id: string;

  @ApiProperty()
  @IsInt()
  skill_id: number;

  @ApiProperty()
  @IsString()
  skill_name: string;
}
export class ConversationCreationRequest {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty({
    description: 'The skill_id of the conversation',
    default: '-1',
  })
  @IsString()
  skillId: string;

  @ApiProperty({
    description: 'The messages of the conversation',
    default: [],
  })
  @IsArray()
  messages: any[];
}
