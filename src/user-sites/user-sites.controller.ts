import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, BadRequestException, Put } from '@nestjs/common';
import { UserSitesService } from './user-sites.service.js';
import { CreateUserSiteDto, SiteListDto } from './dto/create-user-site.dto.js';
import { UpdateUserSiteDto } from './dto/update-user-site.dto.js';
import { successResponseWithData } from '../common/utils/response.helper.js';

@Controller('user-sites')
export class UserSitesController {
  constructor(
    private readonly userSitesService: UserSitesService,
  ) { }

  @Post('/register')
  async registerSite(@Body() dto: CreateUserSiteDto) {
      const newUser = await this.userSitesService.create(dto);
      return successResponseWithData(newUser, 'User sites registered successfully', 200);
    
  }

  @Post('/list')
  async siteListData(@Body() siteListDto: SiteListDto) {
      const result = await this.userSitesService.findAllFiltered(siteListDto);
      return successResponseWithData(result, 'Site list retrieved successfully', 200);
  }

  @Get('/list/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      const result = await this.userSitesService.findOne(id);
      return successResponseWithData(result, 'Site retrieved successfully', 200);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserSiteDto,
  ) {
      const result = await this.userSitesService.updateSite(id, dto);
      return successResponseWithData(result, 'Site updated successfully', 200);
  }

  @Delete('/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
      const result = await this.userSitesService.removeSite(id);
      return successResponseWithData(result, 'Site deleted successfully', 200);
  }
}