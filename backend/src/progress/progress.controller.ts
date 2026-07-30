import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // Student: get their own progress across all modules
  @Roles(UserRole.STUDENT)
  @Get()
  getMyProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.userId);
  }

  // Student: submit a score/attempt after completing a module
  @Roles(UserRole.STUDENT)
  @Post()
  updateProgress(@Request() req, @Body() updateDto: UpdateProgressDto) {
    return this.progressService.updateProgress(req.user.userId, updateDto);
  }

  // Teacher: view the progress of a specific student assigned to them
  @Roles(UserRole.TEACHER)
  @Get('student/:studentId')
  getStudentProgress(@Param('studentId') studentId: string) {
    return this.progressService.getUserProgress(studentId);
  }

  // Admin & Superadmin: view progress for any student
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Get('all')
  getAllProgress() {
    // In a real app, this might require a new service method to fetch all progress logs
    // For now, returning a mock or calling a service method you'd need to implement
    return { message: "Global progress data endpoint available to Admins" };
  }
}
