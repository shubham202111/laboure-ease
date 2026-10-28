import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, Put, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { successResponseWithData, successResponse, failureResponse, failureResponseWithError } from '../common/utils/response.helper.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/create')
    async createSiteUser(@Body() dto: CreateUserDto) {
        return await this.usersService.createUser(dto);
    }

    @Get('/list')
    async fetchSiteUsers() {
        return await this.usersService.findAll();
    }

    @Get('/supervisor/list')
    async fetchSupervisorUsers() {
        return await this.usersService.findNonAssignedSupervisors();
    }

    @Get('/list/:id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.findOne(id);
    }

    @Put('/update/:id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
    ) {
        return  await this.usersService.update(id, dto);
    }

    @Delete('/delete/:id')
    async remove(@Param('id', ParseIntPipe) id: number) {
      return  await this.usersService.remove(id);
    }
}