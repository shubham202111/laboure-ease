import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SubcategoryItemDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubcategoryItemDto)
  subcategories?: SubcategoryItemDto[];
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubcategoryItemDto)
  subcategories?: SubcategoryItemDto[];
}