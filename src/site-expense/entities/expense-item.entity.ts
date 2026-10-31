import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Expense } from './expense.entity.js';
import { Subcategory } from './subcategory.entity.js';

@Entity('expense_items')
export class ExpenseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  expenseId: number;

  @ManyToOne(() => Expense, (exp) => exp.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expenseId' })
  expense: Expense | null;

  @Column({ type: 'int' })
  subcategoryId: number;

  @ManyToOne(() => Subcategory)
  @JoinColumn({ name: 'subcategoryId' })
  subcategory: Subcategory;

  @Column({ type: 'int', nullable: true })
  qty?: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}