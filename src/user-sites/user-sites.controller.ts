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
      const newUser = await this.userSitesService.create(dto);
      return successResponseWithData('User sites registered successfully', newUser);
    
  }

  @Post('/list')
  async siteListData(@Body() siteListDto: SiteListDto) {
      const result = await this.userSitesService.findAllFiltered(siteListDto);
      return successResponseWithData('Site list retrieved successfully', result);
  }

  @Get('/count')
  async siteListCountData() {
      const result = await this.userSitesService.getSiteData();
      return successResponseWithData('Site list retrieved successfully', result);
  }

  @Get('/list/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      const result = await this.userSitesService.findOne(id);
      return successResponseWithData('Site retrieved successfully', result);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserSiteDto,
  ) {
      const result = await this.userSitesService.updateSite(id, dto);
      return successResponseWithData('Site updated successfully', result);
  }

  @Delete('/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
      const result = await this.userSitesService.removeSite(id);
      return successResponse('Site deleted successfully');
  }
}