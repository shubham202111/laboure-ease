import { PartialType } from '@nestjs/mapped-types';
import { CreateSiteExpenseDto } from './create-site-expense.dto.js';

export class UpdateSiteExpenseDto extends PartialType(CreateSiteExpenseDto) {}
