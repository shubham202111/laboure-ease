import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity.js';
import { UserStatus } from '../../enums/user-status.enum.js';

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'int' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'tinyint', default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}