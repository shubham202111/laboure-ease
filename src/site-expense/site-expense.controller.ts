import { Controller, Get, Post, Body, Patch, Param, Delete , UploadedFile, UseInterceptors,} from '@nestjs/common';
import { SiteExpenseService } from './site-expense.service.js';
import { CreateSiteExpenseDto,CreateExpenseDto, SiteExpenseByIdDto, UploadExpenseFileDto } from './dto/create-site-expense.dto.js';
import { UpdateSiteExpenseDto } from './dto/update-site-expense.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ensureExpenseUploadDir, expenseMulterOptions } from '../common/utils/upload.config.js';
import { failureResponse } from '../common/utils/response.helper.js';
const uploadDir = join(process.cwd(), 'uploads', 'expenses');
@Controller('site-expense')
export class SiteExpenseController {
  constructor(private readonly siteExpenseService: SiteExpenseService) {}
  onModuleInit(): void {
    ensureExpenseUploadDir();
  }
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file', expenseMulterOptions))
  async uploadExpenseFile(
    @Body() dto: UploadExpenseFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      return failureResponse('File is required in formData under field name "file".');
    }

    return this.siteExpenseService.uploadExpenseFile(dto.expenseId, file);
  }
  @Post('/create')
  async create(@Body() dto: CreateExpenseDto) {
    return await this.siteExpenseService.createSiteExpense(dto);
  }

  @Post('/report')
  siteExpenseReport(@Body() dto :SiteExpenseByIdDto) {
    return this.siteExpenseService.siteExpenseReport(dto);
  }

  @Post('/category/report')
  siteExpenseCategoryReport(@Body() dto :SiteExpenseByIdDto) {
    return this.siteExpenseService.siteExpenseCategoryReport(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiteExpenseDto: UpdateSiteExpenseDto) {
    return this.siteExpenseService.update(+id, updateSiteExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siteExpenseService.remove(+id);
  }
}
