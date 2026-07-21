import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, Request, Delete, ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UserRole } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Any authenticated user can view their own profile
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Admin only: get all users on the platform
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Admin only: get all teachers
  @Roles(UserRole.ADMIN)
  @Get('teachers')
  findAllTeachers() {
    return this.usersService.findByRole(UserRole.TEACHER);
  }

  // Admin only: get all students on the platform
  @Roles(UserRole.ADMIN)
  @Get('students')
  findAllStudents() {
    return this.usersService.findByRole(UserRole.STUDENT);
  }

  // Teacher only: get all students assigned to the logged-in teacher
  @Roles(UserRole.TEACHER)
  @Get('my-students')
  getMyStudents(@Request() req) {
    return this.usersService.findStudentsByTeacher(req.user.userId);
  }

  // Admin only: assign a student to a teacher
  @Roles(UserRole.ADMIN)
  @Patch(':studentId/assign-teacher/:teacherId')
  assignStudentToTeacher(
    @Param('studentId') studentId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.usersService.assignStudentToTeacher(studentId, teacherId);
  }

  // Any authenticated user can update their own profile only
  @Patch('profile')
  updateOwnProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  // Admin only: delete any user account
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
