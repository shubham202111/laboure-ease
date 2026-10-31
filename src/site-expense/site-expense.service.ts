import { Injectable } from '@nestjs/common';
import { CreateExpenseDto, CreateSiteExpenseDto, SiteExpenseByIdDto } from './dto/create-site-expense.dto.js';
import { UpdateSiteExpenseDto } from './dto/update-site-expense.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity.js';
import { ExpenseItem } from './entities/expense-item.entity.js';
import { UserSite } from '../users/entities/user-site.entity.js';
import { Category } from './entities/category.entity.js';
import { successResponseWithData, successResponse, failureResponse, failureResponseWithError } from '../common/utils/response.helper.js';
import { UserStatus } from '../enums/user-status.enum.js';

@Injectable()
export class SiteExpenseService {
  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseItem) private itemRepo: Repository<ExpenseItem>,
    @InjectRepository(UserSite) private siteRepo: Repository<UserSite>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) { }
  async createSiteExpense(dto: CreateExpenseDto) {
    const site = await this.siteRepo.findOne({ where: { id: dto.siteId, status: UserStatus.ACTIVE } });
    if (!site) return failureResponse('site not exists');

    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) return failureResponse('category not exists');

    let totalAmount = 0;
    const hasItems = dto.items && dto.items.length > 0;

    if (hasItems) {
      totalAmount = (dto.items ?? []).reduce((sum, item) => sum + Number(item.amount), 0);
    } else if (dto.amount !== undefined && dto.amount !== null) {
      totalAmount = dto.amount;
    } else {
      return failureResponse('Either a direct amount or subcategory items must be provided.');
    }

    const expense = this.expenseRepo.create({
      siteId: dto.siteId,
      categoryId: dto.categoryId,
      totalAmount,
      expenseDate: dto.expenseDate,
      note: dto.note,
      file: dto.file,
    });

    const savedExpense = await this.expenseRepo.save(expense);

    if (hasItems) {
      const itemsToSave = (dto.items ?? []).map((item) =>
        this.itemRepo.create({
          expenseId: savedExpense.id,
          subcategoryId: item.subcategoryId,
          qty: item.qty ?? null,
          amount: item.amount,
        }),
      );
      await this.itemRepo.save(itemsToSave);
    }

    const result = await this.siteReportData(savedExpense.id);
    return successResponseWithData('Site expense created successfully.', result)
  }

  async siteReportData(id: number) {
    const expense = await this.expenseRepo.findOne({
      where: { id },
      relations: {
        site: true,
        category: true,
        items: { subcategory: true },
      },
    });

    if (!expense) return failureResponse('Expense record not found')
    return expense;
  }
  async siteExpenseReport(dto: SiteExpenseByIdDto) {
  const site = await this.siteRepo.findOne({ 
    where: { id: dto.siteId, status: UserStatus.ACTIVE }  });

  if (!site) {
    return failureResponse('Site not exists');
  }

  const expensesLedger = await this.expenseRepo.find({
    where: { siteId: dto.siteId },
    relations: {
      site :{ supervisor:true},
      category: true,
      items: { subcategory: true },
    },
    order: { id: 'DESC' },
  });

  const totalExpenseAmount = expensesLedger.reduce(
    (sum, exp) => sum + Number(exp.totalAmount || 0),
    0,
  );

  const categoryMap = new Map();
  expensesLedger.forEach((exp) => {
    if (exp.category && !categoryMap.has(exp.category.id)) {
      categoryMap.set(exp.category.id, exp.category);
    }
  });
  const expenseCategories = Array.from(categoryMap.values());

  const reportData = {
    expensesLedger,
    totalExpenseAmount,
    expenseEntriesCount : expensesLedger.length,
    expenseCategoriesCount: expenseCategories.length,
  };

  return successResponseWithData('Site expense ledger fetched successfully.', reportData);
}

  async getSiteLedger(siteId: number) {
    const expenses = await this.expenseRepo.find({
      where: { siteId },
      relations: {
        category: true,
        items: { subcategory: true },
      },
      order: { expenseDate: 'DESC', id: 'DESC' },
    });

    const totalSiteExpense = expenses.reduce((sum, exp) => sum + Number(exp.totalAmount), 0);

    const data = {
      siteId,
      totalSiteExpense,
      expenses,
    }
    return successResponseWithData('Site ledger fetch successfullt', data);
  }

  findAll() {
    return `This action returns all siteExpense`;
  }

  update(id: number, updateSiteExpenseDto: UpdateSiteExpenseDto) {
    return `This action updates a #${id} siteExpense`;
  }

  remove(id: number) {
    return `This action removes a #${id} siteExpense`;
  }
}
