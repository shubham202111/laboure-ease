import {Injectable,NotFoundException,BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,Like } from 'typeorm';

import { UserSite } from '../users/entities/user-site.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../enums/user-role.enum.js';
import { UserStatus } from '../enums/user-status.enum.js';

import { CreateUserSiteDto, SiteListDto } from './dto/create-user-site.dto.js';
import { UpdateUserSiteDto } from './dto/update-user-site.dto.js';
import { successResponseWithData ,successResponse,failureResponse,failureResponseWithError } from '../common/utils/response.helper.js';

@Injectable()
export class UserSitesService {
  constructor(
    @InjectRepository(UserSite)
    private readonly siteRepo: Repository<UserSite>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async getSupervisor(id: number, excludeSiteId?: number) {
    const supervisor = await this.userRepo.findOne({
      where: {
        id,
        role: UserRole.SUPERVISOR,
        status: UserStatus.ACTIVE,
      },
    });

    if (!supervisor) {
      throw new BadRequestException('Active supervisor not found');
    }

    const query = this.siteRepo.createQueryBuilder('site')
      .leftJoinAndSelect('site.supervisor', 'supervisor')
      .where('supervisor.id = :supervisorId', { supervisorId: supervisor.id })
      .andWhere('site.status = :status', { status: UserStatus.ACTIVE });

    if (excludeSiteId) {
      query.andWhere('site.id != :excludeSiteId', { excludeSiteId });
    }

    const existingSiteAssignment = await query.getOne();

    if (existingSiteAssignment) {
      throw new BadRequestException(
        `Supervisor is already assigned to active site: "${existingSiteAssignment.siteName}"`,
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

    const siteData = this.siteRepo.save(site);
    return successResponseWithData('User sites registered successfully', siteData);
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
    whereCondition.status = UserStatus.ACTIVE;

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
        startDate: true,
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

    if (data.length === 0) {
      return failureResponse('sites data not available.')
    }
    const siteIds = data.map((site) => site.id);

    const labourCounts = await this.userRepo
      .createQueryBuilder('user')
      .select('user.user_site_id', 'siteId')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.user_site_id IN (:...siteIds)', { siteIds })
      .andWhere('user.role = :role', { role: UserRole.LABOURER })
      .groupBy('user.user_site_id')
      .getRawMany();

    const countMap = new Map();
    labourCounts.forEach((item) => {
      countMap.set(Number(item.siteId), Number(item.count));
    });

    const formattedData = data.map((site) => ({
      ...site,
      totalLabours: countMap.get(site.id) || 0,
      totalExpense: '24,567'
    }));
    const responseData ={
      data: formattedData,
      metaData: {
        totalItems: total,
        itemCount: formattedData.length,
        itemsPerPage: limitNum,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
      },
    };
  return successResponseWithData('Site list retrieved successfully', responseData);
}

  async findOne(id: number) {
    const site = await this.siteRepo.findOne({
      where: { id , status: UserStatus.ACTIVE },
      relations: { supervisor: true },
      select: {
        id: true,
        siteName: true,
        siteAddress: true,
        status: true,
        startDate:true,
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
      return failureResponse('Site not found')
    }
    return successResponseWithData('Site list retrieved successfully', site);
  }

  async getSiteData() {
    const totalActiveSites = await this.siteRepo.count({
      where: { status: UserStatus.ACTIVE },
    });

    const totalSupervisors = await this.userRepo.count({
      where: {
        role: UserRole.SUPERVISOR,
        status: UserStatus.ACTIVE
      },
    });

    const totalLabourers = await this.userRepo.count({
      where: {
        role: UserRole.LABOURER,
        status: UserStatus.ACTIVE
      },
    });
    const res = {
      totalActiveSites,
      totalSupervisors,
      totalLabourers,
    }
    return successResponseWithData('Site list retrieved successfully', res);
  }

  async updateSite(id: number, dto: UpdateUserSiteDto) {
    const site = await this.siteRepo.findOne({ where: { id , status: UserStatus.ACTIVE } });

    if (!site) {
      return failureResponse('Site not found')
    }

    if (dto.siteName !== undefined) {
      site.siteName = dto.siteName;
    }

    if (dto.siteAddress !== undefined) {
      site.siteAddress = dto.siteAddress;
    }
    if (dto.startDate !== undefined) {
      site.startDate = dto.startDate;
    }

    if (dto.supervisorId !== undefined) {
      if (!dto.supervisorId) {
        site.supervisor = null;
      } else {
        site.supervisor = await this.getSupervisor(dto.supervisorId, id);
      }
    }

    const sitedata= this.siteRepo.save(site);
    return successResponseWithData('Site updated successfully', sitedata);
  }

  async removeSite(id: number) {
    const site = await this.siteRepo.findOne({
      where: { id },
    });

  if (!site) {
    return failureResponse('Site not found')
  }

  site.status = UserStatus.INACTIVE;

  return await this.siteRepo.save(site);

  return successResponse('Site Deleted Successfully');
  }
}