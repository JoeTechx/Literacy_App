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
