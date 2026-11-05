import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteExpenseService } from './site-expense.service.js';
import { SiteExpenseController } from './site-expense.controller.js';
import { Category } from './entities/category.entity.js';
import { Subcategory } from './entities/subcategory.entity.js';
import { Expense } from './entities/expense.entity.js';
import { ExpenseItem } from './entities/expense-item.entity.js';
import { UserSite } from '../users/entities/user-site.entity.js';
import { CategoriesController } from './category.controller.js';
import { CategoriesService } from './category.service.js';
@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory, Expense, ExpenseItem,UserSite])],
  controllers: [SiteExpenseController, CategoriesController],
  providers: [SiteExpenseService,CategoriesService],
})
export class SiteExpenseModule {}
