import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, BadRequestException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Public route: anyone can log in
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Public route: verify email
  @Get('verify')
  async verifyEmail(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
    if (!token) throw new BadRequestException('Token is required');
    
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid or expired token');

    await this.usersService.update(user.id, { isVerified: true, verificationToken: null });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/login?verified=true`);
  }
}
