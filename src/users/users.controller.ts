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
    try{
      const user = await this.usersService.createUser(dto);
      return successResponseWithData(user,'User created successfully', 200);
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  @Get('/list')
  async fetchSiteUsers() {
    try{
      const users = await this.usersService.findAll();
      return successResponseWithData(users, 'Users fetched successfully', 200);
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  @Get('/supervisor/list')
  async fetchSupervisorUsers() {
    try{
      const users = await this.usersService.findNonAssignedSupervisors();
      return successResponseWithData(users, 'Users fetched successfully', 200);
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  @Get('/list/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try{
      const user = await this.usersService.findOne(id);
      return successResponseWithData(user, 'User fetched successfully', 200);
    } catch (error) {
      throw new BadRequestException('Failed to fetch user');
    }
  }

  @Put('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    try{
      const user = await this.usersService.update(id, dto);
      return successResponseWithData(user, 'User updated successfully', 200);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  @Delete('/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try{
      await this.usersService.remove(id);
      return successResponseWithData(null, 'User deleted successfully', 200);
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }
}