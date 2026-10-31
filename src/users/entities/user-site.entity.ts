import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, } from 'typeorm';

import { User } from './user.entity.js';
import { UserStatus } from '../../enums/user-status.enum.js';
import { Expense } from '../../site-expense/entities/expense.entity.js';

@Entity('user_sites')
export class UserSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  siteName: string;

  @Column({ type: 'varchar', length: 255 })
  siteAddress: string;

  @Column({type: 'date', nullable: true})
  startDate: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User | null;

  @OneToMany(() => Expense, (expense) => expense.site, { cascade: true })
  expenses: Expense[];

  @Column({type: 'tinyint',default: UserStatus.ACTIVE})
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}