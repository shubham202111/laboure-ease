import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteExpenseService } from './site-expense.service.js';
import { SiteExpenseController } from './site-expense.controller.js';
import { Category } from './entities/category.entity.js';
import { Subcategory } from './entities/subcategory.entity.js';
import { Expense } from './entities/expense.entity.js';
import { ExpenseItem } from './entities/expense-item.entity.js';
import { UserSite } from '../users/entities/user-site.entity.js';
@Module({
  imports: [TypeOrmModule.forFeature([Category, Subcategory, Expense, ExpenseItem,UserSite])],
  controllers: [SiteExpenseController],
  providers: [SiteExpenseService],
})
export class SiteExpenseModule {}
