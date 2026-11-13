import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subcategory } from './subcategory.entity.js';
import { UserStatus } from '../../enums/user-status.enum.js';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  description: string;

  @OneToMany(() => Subcategory, (sub) => sub.category)
  subcategories: Subcategory[];

  @Column({ type: 'tinyint', default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}