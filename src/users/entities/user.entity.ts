import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, } from 'typeorm';
import { UserStatus } from '../../enums/user-status.enum.js';
import { UserRole } from '../../enums/user-role.enum.js';
import { UserSite } from './user-site.entity.js';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'varchar', length: 100 })
  mobileNo: string;

  @Column({ type: 'varchar', length: 150,  nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  aadharNo?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  profilePicture?: string | null;

  @Column({ type: 'tinyint', default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', length: 50, default: UserRole.SUPERVISOR })
  role: UserRole;

  @Column({ type: 'int', nullable: true })
  user_site_id: number | null;

  @ManyToOne(() => UserSite, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_site_id' })
  site: UserSite;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}