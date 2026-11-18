import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './category.service.js';
import { CreateCategoryDto, RemoveSubCategoryDto, UpdateCategoryDto } from './dto/create-category.dto.js';

@Controller('category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/create')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get('/list')
  findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  @Post('/update')
  updateCategory(@Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(dto);
  }

  @Post('/delete-subcategory')
  async removeSubcategory(@Body() dto: RemoveSubCategoryDto) {
    return await this.categoriesService.removeSubCategory(dto);
  }
}