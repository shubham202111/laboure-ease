import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { UserSite } from './entities/user-site.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserStatus } from '../enums/user-status.enum.js';
import { UserRole } from '../enums/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserSite)
    private readonly siteRepo: Repository<UserSite>,
  ) { }

  private safeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let siteId: number | null = null;

    if (dto.user_site_id !== undefined) {
      if (dto.role == UserRole.ADMIN) {
        throw new BadRequestException(
          'Admins cannot be assigned to a site',
        );
      }

      const site = await this.siteRepo.findOne({
        where: { id: dto.user_site_id, status: UserStatus.ACTIVE },
      });

      if (!site) {
        throw new BadRequestException('site not found');
      }

      siteId = site.id;
    }

    const { user_site_id, ...data } = dto;

    const user = this.userRepo.create({
      ...data,
      password: await bcrypt.hash(dto.password, 12),
      displayName : `${dto.firstName} ${dto.lastName}`,
      status: UserStatus.ACTIVE,
      user_site_id: siteId,
    });

    return this.safeUser(await this.userRepo.save(user));
  }

  async findAll() {
    const users = await this.userRepo.find({
      order: { id: 'DESC', status:UserStatus.ACTIVE },
    });

    return users.map((user) => this.safeUser(user));
  }

  async findNonAssignedSupervisors() {
    const users = await this.userRepo.find({
      where: { user_site_id:  IsNull(), status: UserStatus.ACTIVE, role: UserRole.SUPERVISOR },
      order: { id: 'DESC' },
    });

    return users.map((user) => this.safeUser(user));
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id, status:UserStatus.ACTIVE } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.safeUser(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id ,status:UserStatus.ACTIVE} });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email ,status:UserStatus.ACTIVE },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const nextRole = dto.role ?? user.role;
    let nextSiteId = user.user_site_id;

    if (dto.user_site_id !== undefined) {
      if (nextRole !== UserRole.LABOURER) {
        throw new BadRequestException(
          'Only labourers can be assigned a site',
        );
      }

      const site = await this.siteRepo.findOne({
        where: { id: dto.user_site_id, status: 1 },
      });

      if (!site) {
        throw new BadRequestException('Active site not found');
      }
      nextSiteId = site.id;
    }

    if (dto.role !== undefined && dto.role !== UserRole.LABOURER && dto.user_site_id === undefined) {
      nextSiteId = null;
    }

    const { user_site_id, password, ...fields } = dto;
    const updatedFirstName = dto.firstName ?? user.firstName;
    const updatedLastName = dto.lastName ?? user.lastName;
    const displayName = `${updatedFirstName} ${updatedLastName}`;

    Object.assign(user, fields, {displayName, user_site_id: nextSiteId });

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }
    return this.safeUser(await this.userRepo.save(user));
  }

  async remove(id: number) {
  const user = await this.userRepo.findOne({ 
    where: { id, status: UserStatus.ACTIVE } 
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const supervisedSites = await this.siteRepo.count({
    where: { supervisor: { id } },
  });

  if (supervisedSites > 0) {
    throw new BadRequestException(
      'Reassign or remove this supervisor’s sites before deactivating the user',
    );
  }

  user.status = UserStatus.INACTIVE;
  return await this.userRepo.save(user);
}
}