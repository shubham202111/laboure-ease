import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { UserSite } from '../users/entities/user-site.entity.js';
import { UserSitesController } from './user-sites.controller.js';
import { UserSitesService } from './user-sites.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserSite, User])],
  controllers: [UserSitesController],
  providers: [UserSitesService],
  exports: [UserSitesService],
})
export class UserSitesModule {}