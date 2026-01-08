import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsString } from 'class-validator';
import { HelperService } from 'src/utils/HelperService';

const JS = new HelperService();
const { ToBoolean } = JS;

export class ConnectorDto {
  id: number;
  deleted: boolean;
  name: string;
  description: string;
  type: number;
  configuration: {
    jwtPublicKey: string;
    rfcCompliance: boolean;
    preferred: boolean;
    authorizationEndpoint: string;
    jsContext: string;
    jsMethodName: string;
    clientId: string;
    acrValues: string[];
    pkceEnabled: boolean;
  }
}
