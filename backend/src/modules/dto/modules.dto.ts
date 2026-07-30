import { IsNotEmpty, IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateModuleItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  @IsIn(['tap_the_sound', 'tracing', 'match'])
  type?: string;

  @IsArray()
  @IsNotEmpty()
  content: any[];

  @IsString()
  @IsOptional()
  ageGroup?: string; // e.g., '5-7', '8-10', '11-12'
}

export class UpdateModuleItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  content?: any[];

  @IsOptional()
  @IsString()
  isActive?: boolean;
}
