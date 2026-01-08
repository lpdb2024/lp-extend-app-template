import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsString } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;


export class ConversationTopicRequestDto {
  @ApiProperty()
  @IsString()
  account_id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  verticalName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  active: boolean;
}


class message {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  role: string;
}

export class ConversationSampleDto {
  static collectionName = 'conversation_samples';

  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  account_id: string;

  @ApiProperty()
  @IsString()
  skill_id: string;

  @ApiProperty()
  @IsString()
  skill_name: string;

  @ApiProperty()
  @IsBoolean()
  active: boolean;

  @ApiProperty()
  @IsString()
  topic_id: string;

  @ApiProperty()
  @IsArray()
  messages: message[];

  @ApiProperty()
  @IsString()
  created_by: string;

  @ApiProperty()
  @IsString()
  updated_by: string;

  @ApiProperty()
  @IsNumber()
  created_at: number;

  @ApiProperty()
  @IsNumber()
  updated_at: number;
}

export class ConversationTopicDto extends ConversationTopicRequestDto {
    static collectionName = 'conversation_topics';

    @ApiPropertyOptional()
    @IsString()
    id?: string;

    @ApiPropertyOptional()
    @IsArray()
    conversations: ConversationSampleDto[];

    @ApiPropertyOptional()
    @IsString()
    created_by?: string;

    @ApiPropertyOptional()
    @IsString()
    updated_by?: string;

    @ApiPropertyOptional()
    @IsNumber()    
    created_at?: number;

    @ApiPropertyOptional()
    @IsNumber()
    updated_at?: number;
}