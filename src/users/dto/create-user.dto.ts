import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

import { UserRole } from '../../enums/user-role.enum.js';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsString()
  @MaxLength(100)
  displayName: string;

  @IsString()
  @MaxLength(100)
  mobileNo: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;
 
  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  aadharNo: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  profilePicture?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsInt()
  @Min(1)
  user_site_id?: number;
}