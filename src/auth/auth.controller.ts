import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req,Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from '../auth/dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { UserRole } from '../enums/user-role.enum.js';
import { SendOtpDto, VerifyOtpDto } from './dto/auth-otp.dto.js';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
      return await this.authService.login(loginDto);
      
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  getProfile(@Req() req:any) {
    return {
      message: 'Access granted to protected route',
      user: req.user, 
    };
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard) 
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req:any, @Res({ passthrough: true }) res?: Response) {
    return await this.authService.logout(req.user.userId);
  }

  @Post('generate-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}