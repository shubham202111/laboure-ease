import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe,Put, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { successResponseWithData } from '../common/utils/response.helper.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('/create')
  async createSiteUser(@Body() dto: CreateUserDto) {
      const user = await this.usersService.createUser(dto);
      return successResponseWithData(user,'User created successfully', 200);
  }

  @Get('/list')
  async fetchSiteUsers() {
      const users = await this.usersService.findAll();
      return successResponseWithData(users, 'Users fetched successfully', 200);
  }

  @Get('/supervisor/list')
  async fetchSupervisorUsers() {
      const users = await this.usersService.findNonAssignedSupervisors();
      return successResponseWithData(users, 'Users fetched successfully', 200);
    
  }

  @Get('/list/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      const user = await this.usersService.findOne(id);
      return successResponseWithData(user, 'User fetched successfully', 200);
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
      const user = await this.usersService.update(id, dto);
      return successResponseWithData(user, 'User updated successfully', 200);
  }

  @Delete('/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
      await this.usersService.remove(id);
      return successResponseWithData(null, 'User deleted successfully', 200);
  }
}