import {IsString,IsInt,IsNotEmpty,MaxLength,Min,IsOptional, IsDateString} from 'class-validator';
import { Type } from 'class-transformer';
export class CreateUserSiteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  siteName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  siteAddress: string;

  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string | null;

  @IsOptional()
  supervisorId: number;
}

export class SiteListDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}