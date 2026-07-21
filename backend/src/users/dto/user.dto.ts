import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsNumber } from 'class-validator';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  age?: number; // Added to support age-specific module assignment

  @IsOptional()
  @IsString()
  teacherId?: string; // Set by admin when assigning a student to a teacher
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  totalPoints?: number;
}
