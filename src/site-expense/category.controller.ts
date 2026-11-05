import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './category.service.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto.js';

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

    // @Post('/delete/')
    // async remove() {
    //     return await this.categoriesService.removeCategory(id);
    // }
}