import { IsNotEmpty, IsNumber, IsObject, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateModuleItemDto {
  @IsNumber()
  @IsNotEmpty()
  moduleId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @IsNotEmpty()
  content: any;

  @IsString()
  @IsOptional()
  ageGroup?: string; // e.g., '5-7', '8-10', '11-12'
}

export class UpdateModuleItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  content?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
