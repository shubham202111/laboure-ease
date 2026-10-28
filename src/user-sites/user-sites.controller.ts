import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, BadRequestException, Put } from '@nestjs/common';
import { UserSitesService } from './user-sites.service.js';
import { CreateUserSiteDto, SiteListDto } from './dto/create-user-site.dto.js';
import { UpdateUserSiteDto } from './dto/update-user-site.dto.js';
import { successResponseWithData ,successResponse,failureResponse,failureResponseWithError } from '../common/utils/response.helper.js';

@Controller('user-sites')
export class UserSitesController {
  constructor(
    private readonly userSitesService: UserSitesService,
  ) { }

  @Post('/register')
  async registerSite(@Body() dto: CreateUserSiteDto) {
      return await this.userSitesService.create(dto);
    
  }

  @Post('/list')
  async siteListData(@Body() siteListDto: SiteListDto) {
      return await this.userSitesService.findAllFiltered(siteListDto);
  }

  @Get('/count')
  async siteListCountData() {
      return await this.userSitesService.getSiteData();
  }

  @Get('/list/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      return await this.userSitesService.findOne(id);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserSiteDto,
  ) {
      return await this.userSitesService.updateSite(id, dto);
  }

  @Delete('/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
      return await this.userSitesService.removeSite(id);
  }
}