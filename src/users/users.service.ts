import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { UserSite } from './entities/user-site.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserStatus } from '../enums/user-status.enum.js';
import { UserRole } from '../enums/user-role.enum.js';
import { successResponseWithData, successResponse, failureResponse, failureResponseWithError } from '../common/utils/response.helper.js';

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
    if (dto.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        return failureResponse('User already exists');
      }
    }

    let siteId: number | null = null;

    if (dto.user_site_id !== undefined) {
      if (dto.role === UserRole.ADMIN) {
        return failureResponse('Admins cannot be assigned to a site');
      }

      const site = await this.siteRepo.findOne({
        where: { id: dto.user_site_id, status: UserStatus.ACTIVE },
      });

      if (!site) {
        return failureResponse('site not found');
      }

      siteId = site.id;

      if (dto.role === UserRole.SUPERVISOR) {
        if (!siteId) {
          return failureResponse('supervisor must be assigned to a site');
        }

        const existingSupervisor = await this.userRepo.findOne({
          where: {
            user_site_id: siteId,
            role: UserRole.SUPERVISOR,
            status: UserStatus.ACTIVE,
          },
        });

        if (existingSupervisor) {
          return failureResponse('This site already has an assigned supervisor');
        }
      }
    }

    const { user_site_id, ...data } = dto;

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : null;

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword,
      displayName: `${dto.firstName ?? ''} ${dto.lastName ?? ''}`.trim(),
      status: UserStatus.ACTIVE,
      user_site_id: siteId,
    });

    const savedUser = await this.userRepo.save(user);
    const userData = await this.safeUser(savedUser);

    return successResponseWithData('User created successfully', userData);
  }

  async findAll() {
  const users = await this.userRepo.find({
    where: { status: UserStatus.ACTIVE }, 
    relations: { site: true },          
    order: { id: 'DESC' },
  });

  const userData = users.map((user) => {
    const safeData = this.safeUser(user);
    return {
      ...safeData,
      site: user.site || null,
    };
  });

  return successResponseWithData('Users fetched successfully', userData);
}

  async findNonAssignedSupervisors() {
    const users = await this.userRepo.find({
      where: { status: UserStatus.ACTIVE, role: UserRole.SUPERVISOR },
      order: { id: 'DESC' },
    });

    const userData = users.map((user) => this.safeUser(user));
    return successResponseWithData('Users fetched successfully', userData);
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id, status: UserStatus.ACTIVE } });

    if (!user) {
      return failureResponse('User not found')
    }

    const userData = this.safeUser(user);
    return successResponseWithData('Users fetched successfully', userData);
  }

  // async update(id: number, dto: UpdateUserDto) {
  //   const user = await this.userRepo.findOne({ where: { id, status: UserStatus.ACTIVE } });

  //   if (!user) {
  //     return failureResponse('User not found')
  //   }

  //   if (dto.email && dto.email !== user.email) {
  //     const existing = await this.userRepo.findOne({
  //       where: { email: dto.email, status: UserStatus.ACTIVE },
  //     });

  //     if (existing) {
  //       return failureResponse('Email already exists')
  //     }
  //   }

  //   const nextRole = dto.role ?? user.role;
  //   let nextSiteId = user.user_site_id;

  //   if (dto.user_site_id !== undefined) {
  //     if (nextRole !== UserRole.LABOURER) {
  //       return failureResponse('Only labourers can be assigned a site')
  //     }

  //     const site = await this.siteRepo.findOne({
  //       where: { id: dto.user_site_id, status: 1 },
  //     });

  //     if (!site) {
  //       return failureResponse('Active site not found')
  //     }
  //     nextSiteId = site.id;
  //   }

  //   if (dto.role !== undefined && dto.role !== UserRole.LABOURER && dto.user_site_id === undefined) {
  //     nextSiteId = null;
  //   }

  //   const { user_site_id, password, ...fields } = dto;
  //   const updatedFirstName = dto.firstName ?? user.firstName;
  //   const updatedLastName = dto.lastName ?? user.lastName;
  //   const displayName = `${updatedFirstName} ${updatedLastName}`;

  //   Object.assign(user, fields, { displayName, user_site_id: nextSiteId });

  //   if (password) {
  //     user.password = await bcrypt.hash(password, 12);
  //   }
  //   const userData = this.safeUser(await this.userRepo.save(user));
  //   return successResponseWithData('Users updated successfully', userData);
  // }
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id, status: UserStatus.ACTIVE } });

    if (!user) {
      return failureResponse('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email, status: UserStatus.ACTIVE },
      });

      if (existing) {
        return failureResponse('Email already exists');
      }
    }

    const nextRole = dto.role ?? user.role;
    let nextSiteId = user.user_site_id;

    if (dto.user_site_id !== undefined) {
      if (nextRole === UserRole.ADMIN) {
        return failureResponse('Admins cannot be assigned to a site');
      }

      const site = await this.siteRepo.findOne({
        where: { id: dto.user_site_id, status: UserStatus.ACTIVE },
      });

      if (!site) {
        return failureResponse('Active site not found');
      }
      nextSiteId = site.id;
    }

    if (dto.role !== undefined && dto.role === UserRole.ADMIN && dto.user_site_id === undefined) {
      nextSiteId = null;
    }

    if (nextRole === UserRole.SUPERVISOR) {
      if (!nextSiteId) {
        return failureResponse('A supervisor must be assigned to a site');
      }

      const existingSupervisor = await this.userRepo.findOne({
        where: {
          user_site_id: nextSiteId,
          role: UserRole.SUPERVISOR,
          status: UserStatus.ACTIVE,
        },
      });

      if (existingSupervisor && existingSupervisor.id !== user.id) {
        return failureResponse('This site already has an assigned supervisor');
      }
    }

    const { user_site_id, password, ...fields } = dto;
    const updatedFirstName = dto.firstName ?? user.firstName;
    const updatedLastName = dto.lastName ?? user.lastName;
    const displayName = `${updatedFirstName} ${updatedLastName}`.trim();

    Object.assign(user, fields, { displayName, user_site_id: nextSiteId });

    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    const savedUser = await this.userRepo.save(user);
    const userData = await this.safeUser(savedUser);

    return successResponseWithData('Users updated successfully', userData);
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({
      where: { id, status: UserStatus.ACTIVE }
    });

    if (!user) {
      return failureResponse('user not found')
    }

    const supervisedSites = await this.siteRepo.count({
      where: { supervisor: { id } },
    });

    if (supervisedSites > 0) {
      return failureResponse('Reassign or remove this supervisor’s sites before deactivating the user')
    }

    user.status = UserStatus.INACTIVE;
    const userData = await this.userRepo.save(user);
    return successResponse('Users deleted successfully');
  }
}