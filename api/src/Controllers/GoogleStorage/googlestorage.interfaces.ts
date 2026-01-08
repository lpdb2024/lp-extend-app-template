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

export const COLLECTIONS = {
  MAKES: 'makes',
  MODELS: 'models',
  TRIMS: 'trims',
}

export class MakesDTO {
  static collectionName = COLLECTIONS.MAKES;

  @IsString()
  id: string;

  @IsString()
  name: string;

  @ToBoolean()
  active: boolean;

  models?: any[];

  @IsInt()
  created_at?: number;

  @IsInt()
  updated_at?: number;

  @IsString()
  created_by?: string;

  @IsString()
  updated_by?: string;
}

export class MakesDocument {
  static collectionName = 'makes';
  id: number | string;
  name: string;
  active: boolean;
  models?: any[];
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
}
export class CarMake {
  static collectionName = 'makes';
  id: number | string;
  name: string;
  active: boolean;
  models?: any[];
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
}

export class CarModel {
  static collectionName = 'models';
    id: number | string
    make_id: number | string
    make_name: string
    name: string
    year: number
    active: boolean
    created_at?: number
    updated_at?: number
    created_by?: string
    updated_by?: string
}

export class CarColour {
  id: number | string
  name: string
  color: string
  type: string
}

export class Engine {
  engine_type?: string
  fuel_type?: string
  cylinders?: number
  size?: number
  valves?: number
  cam_type?: string
  drive_type?: string
}
export class BodyDTO {
  id: number | string
  type: string
  doors: number
  length: number
  width: number
  seats: number
  height: number
  wheel_base: number
  gross_weight: number
  max_payload: number
  max_towing_capacity: number
}
export class CarTrim {
  static collectionName = COLLECTIONS.TRIMS;
  id: number | string
  make_model_id: number | string
  make_model_name: string
  make_id: number | string
  make_name: string
  name: string
  images: string[]
  description?: string
  year: number
  msrp?: number
  interior_colors?: CarColour[]
  exterior_colors?: CarColour[]
  engine?: Engine
  body?: BodyDTO
  active: boolean
  created_at?: number
  updated_at?: number
  created_by?: string
  updated_by?: string
}



