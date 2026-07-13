import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @IsNotEmpty()
  moduleId: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  attempts?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
