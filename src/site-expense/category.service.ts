import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { Subcategory } from './entities/subcategory.entity.js';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto.js';
import { successResponseWithData, successResponse, failureResponse, failureResponseWithError } from '../common/utils/response.helper.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Subcategory) private subcategoryRepo: Repository<Subcategory>,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create({
      name: dto.name,
      description: dto.description || '',
    });
    const createdCategory = await this.categoryRepo.save(category);

    if (dto.subcategories && dto.subcategories.length > 0) {
      const subcategoriesToSave = dto.subcategories.map((sub) =>
        this.subcategoryRepo.create({
          name: sub.name,
          categoryId: createdCategory.id,
        }),
      );
      await this.subcategoryRepo.save(subcategoriesToSave);
    }

    return successResponseWithData('Category created successfully', await this.findOneCategory(createdCategory.id));
  }

  async findAllCategories() {
    const categories = await this.categoryRepo.find({
      relations: { subcategories: true },
      order: { id: 'DESC' },
    });

    return successResponseWithData('Categories fetched successfully', categories);
  }

  async findOneCategory(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { subcategories: true },
    });

    if (!category) {
      return failureResponse('Category not found');
    }
    return category;
  }

  async updateCategory(dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.id },
      relations: { subcategories: true },
    });

    if (!category) {
      return failureResponse('Category not found');
    }

    if (dto.name) {
      category.name = dto.name;
    }

    if (dto.description) {
      category.description = dto.description;
    }

    if (dto.name || dto.description) {
      await this.categoryRepo.save(category);
    }

    if (dto.subcategories && Array.isArray(dto.subcategories)) {
      for (const subDto of dto.subcategories) {
        if (subDto.id) {
          await this.subcategoryRepo.update(subDto.id, { name: subDto.name });
        } else {
          const newSub = this.subcategoryRepo.create({
            name: subDto.name,
            categoryId: category.id,
          });
          await this.subcategoryRepo.save(newSub);
        }
      }
    }

    const updatedCategory = await this.findOneCategory(dto.id);
    return successResponseWithData('Category updated successfully', updatedCategory);
  }
}