import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsObject, IsString } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

export class AppAuthRequest {
    @ApiProperty()
    @IsString()
    redirect: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsString()
    appname: string;
}

export class TokenDetails {
    @ApiProperty()
    @IsString()
    site_id: string;

    @ApiProperty()
    @IsString()
    region: string;

    @ApiProperty()
    @IsString()
    claims: string;

    @ApiProperty()
    @IsString()
    token_info: string;

    @ApiProperty()
    @IsString()
    ccs_token: string;

    @ApiProperty()
    @IsString()
    cb_auth_token: string;
}   

export class Token {
    @ApiProperty()
    @IsString()
    access_token: string;

    @ApiProperty()
    @IsString()
    token_type: string;

    @ApiProperty()
    @IsString()
    refresh_token: string;

    @ApiProperty()
    @IsString()
    id_token: string;

    @ApiProperty()
    @IsNumber()
    expires_in: number;
}


export class ChatBotPlatformUser {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsString()
    firstname: string;

    @ApiProperty()
    @IsString()
    lastname: string;

    @ApiProperty()
    @IsString()
    userLoginType: string;

    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty()
    @IsString()
    role: string;

    @ApiProperty()
    @IsString()
    orgId: string;

    @ApiProperty()
    @IsString()
    status: string;

    @ApiProperty()
    @IsString()
    creationTime: string;

    @ApiProperty()
    @IsString()
    modificationTime: string;

    @ApiProperty()
    @IsBoolean()
    cb2Enabled: boolean;
}

export class CBSuccessResult {
    @ApiProperty()
    @IsObject()
    chatBotPlatformUser: ChatBotPlatformUser;

    @ApiProperty()
    @IsString()
    apiAccessToken: string;

    @ApiProperty()
    @IsString()
    apiAccessPermToken: string;

    @ApiProperty()
    @IsObject()
    config: any;

    @ApiProperty()
    @IsString()
    sessionOrganizationId: string;

    @ApiProperty()
    @IsString()
    leAccountId: string;

    @ApiProperty()
    @IsString()
    cbRegion: string;

    @ApiProperty()
    @IsArray()
    enabledFeatures: string[];

    @ApiProperty()
    @IsArray()
    siteSettings: any[];

    @ApiProperty()
    @IsString()
    leUserId: string;

    @ApiProperty()
    @IsArray()
    privileges: number[];

    @ApiProperty()
    @IsBoolean()
    isElevatedLpa: boolean;
}

export class CBAuthInfoDto {
    @ApiProperty()
    @IsBoolean()
    success: boolean;

    @ApiProperty()
    @IsObject()
    successResult: CBSuccessResult;

    @ApiProperty()
    @IsString()
    message: string;
}

// ============ Pagination Query DTOs ============
export class PaginationQueryDto {
    @ApiProperty({ required: false, default: 1 })
    @IsInt()
    page?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @IsInt()
    size?: number = 10;
}

export class BotGroupQueryDto extends PaginationQueryDto {
    @ApiProperty({ required: false })
    @IsString()
    'sort-by'?: string;

    @ApiProperty({ required: false })
    @IsString()
    'bot-group'?: string;
}

// ============ Bot Agent Management DTOs ============
export class BotAgentActionDto {
    @ApiProperty()
    @IsString()
    lpAccountId: string;

    @ApiProperty()
    @IsString()
    lpAccountUser: string;
}

export class AddBotAgentDto extends BotAgentActionDto {
    @ApiProperty()
    @IsString()
    deploymentEnvironment: 'PRODUCTION' | 'STAGING';

    @ApiProperty()
    @IsString()
    type: 'messaging' | 'chat';

    @ApiProperty()
    @IsObject()
    configurations: {
        lpUserRole: string;
        enableAccessibility: boolean;
        tileDisplay: string;
    };

    @ApiProperty()
    @IsString()
    lpUserId: string;

    @ApiProperty()
    @IsString()
    botId: string;
}

// ============ Knowledge Base Query DTOs ============
export class KnowledgeBaseQueryDto {
    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    includeMetrics?: boolean = true;
}
