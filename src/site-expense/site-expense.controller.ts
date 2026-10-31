import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SiteExpenseService } from './site-expense.service.js';
import { CreateSiteExpenseDto,CreateExpenseDto, SiteExpenseByIdDto } from './dto/create-site-expense.dto.js';
import { UpdateSiteExpenseDto } from './dto/update-site-expense.dto.js';

@Controller('site-expense')
export class SiteExpenseController {
  constructor(private readonly siteExpenseService: SiteExpenseService) {}

  @Post('/create')
  async create(@Body() dto: CreateExpenseDto) {
    return await this.siteExpenseService.createSiteExpense(dto);
  }

  @Post('/report')
  siteExpenseReport(@Body() dto :SiteExpenseByIdDto) {
    return this.siteExpenseService.siteExpenseReport(dto);
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
