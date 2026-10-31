import { IsNotEmpty, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSiteExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  subcategoryId: number;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  expenseDate: string;

  @IsOptional()
  note?: string;

  @IsOptional()
  file?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSiteExpenseDto)
  items?: CreateSiteExpenseDto[] | [];
}
export class SiteExpenseByIdDto {
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  // @IsOptional()
  // @IsString()
  // startDate : Date;

  // @IsOptional()
  // @IsString()
  // endDate : Date;
}