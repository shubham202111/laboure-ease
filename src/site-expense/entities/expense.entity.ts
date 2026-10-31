import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from './category.entity.js';
import { ExpenseItem } from './expense-item.entity.js';
import { UserSite } from '../../users/entities/user-site.entity.js';
@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  siteId: number;

  @ManyToOne(() => UserSite, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'siteId' })
  site: UserSite | null;

  @Column({ type: 'int' })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  totalAmount: number;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file?: string | null;

  @OneToMany(() => ExpenseItem, (item) => item.expense, { cascade: true })
  items: ExpenseItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}