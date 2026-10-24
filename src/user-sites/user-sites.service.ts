import {Injectable,NotFoundException,BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,Like } from 'typeorm';

import { UserSite } from '../users/entities/user-site.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../enums/user-role.enum.js';
import { UserStatus } from '../enums/user-status.enum.js';

import { CreateUserSiteDto, SiteListDto } from './dto/create-user-site.dto.js';
import { UpdateUserSiteDto } from './dto/update-user-site.dto.js';

@Injectable()
export class UserSitesService {
  constructor(
    @InjectRepository(UserSite)
    private readonly siteRepo: Repository<UserSite>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async getSupervisor(id: number) {
    const supervisor = await this.userRepo.findOne({
      where: {
        id,
        role: UserRole.SUPERVISOR,
        status: UserStatus.ACTIVE,
      },
    });

    if (!supervisor) {
      throw new BadRequestException(
        'Active supervisor not found',
      );
    }

    return supervisor;
  }

  async create(dto: CreateUserSiteDto) {
    const supervisor = dto.supervisorId
    ? await this.getSupervisor(dto.supervisorId)
    : null;

    const site = this.siteRepo.create({
      siteName: dto.siteName,
      siteAddress: dto.siteAddress,
      supervisor,
      startDate: dto.startDate ?? null,
      status: 1,
    });

    return this.siteRepo.save(site);
  }

  async findAllFiltered(siteListDto: SiteListDto) {
    const { siteName, id, page = 1, limit = 10 } = siteListDto;

    const pageNum = page > 0 ? page : 1;
    const limitNum = limit > 0 ? limit : 10;
    const skip = (pageNum - 1) * limitNum;

    const whereCondition: any = {};

    if (siteName) {
      whereCondition.siteName = Like(`%${siteName}%`);
    }

    if (id) {
      whereCondition.id = id;
    }

    const [data, total] = await this.siteRepo.findAndCount({
      where: whereCondition,
      relations: { supervisor: true },
      select: {
        id: true,
        siteName: true,
        siteAddress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        supervisor: {
          id: true,
          firstName: true,
          lastName: true,
          displayName: true,
          email: true,
        },
      },
      order: { id: 'DESC' },
      skip,
      take: limitNum,
    });

    return {
      data,
      metaData: {
        totalItems: total, 
        itemCount: data.length, 
        itemsPerPage: limitNum,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
      },
    };
  }

  async findOne(id: number) {
    const site = await this.siteRepo.findOne({
      where: { id },
      relations: { supervisor: true },
      select: {
        id: true,
        siteName: true,
        siteAddress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        supervisor: {
          id: true,
          firstName: true,
          lastName: true,
          displayName: true,
          email: true,
        },
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    return site;
  }

  async updateSite(id: number, dto: UpdateUserSiteDto) {
    const site = await this.siteRepo.findOne({ where: { id } });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    if (dto.siteName !== undefined) {
      site.siteName = dto.siteName;
    }

    if (dto.siteAddress !== undefined) {
      site.siteAddress = dto.siteAddress;
    }

    if (dto.supervisorId !== undefined) {
      site.supervisor = await this.getSupervisor(dto.supervisorId);
    }

    return this.siteRepo.save(site);
  }

  async remove(id: number) {
    const site = await this.siteRepo.findOne({ where: { id } });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    const assignedUsers = await this.userRepo.count({
      where: { user_site_id: id },
    });

    if (assignedUsers > 0) {
      throw new BadRequestException(
        'Reassign users before deleting this site',
      );
    }

    await this.siteRepo.delete(id);

    return { message: 'Site deleted successfully' };
  }
}