import {
  Controller, Get, Post, Body, Patch, Param,
  UseGuards, Request, Delete, ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserRole } from './dto/user.dto';
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

  // Admin & Superadmin: get all users on the platform
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Admin & Superadmin: get all teachers
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Get('teachers')
  findAllTeachers() {
    return this.usersService.findByRole(UserRole.TEACHER);
  }

  // Admin & Superadmin: get all students on the platform
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
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

  // Admin & Superadmin: assign a student to a teacher
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
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

  // Admin & Superadmin: delete any user account
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    if (req.user.role === UserRole.ADMIN) {
      const targetUser = await this.usersService.findById(id);
      if (targetUser.role === UserRole.SUPERADMIN || targetUser.role === UserRole.ADMIN) {
        throw new ForbiddenException('Admins cannot delete SUPERADMIN or other ADMIN accounts.');
      }
    }
    return this.usersService.remove(id);
  }

  // Admin & Superadmin: Onboard a new user securely
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Post()
  create(@Request() req, @Body() createUserDto: CreateUserDto) {
    // A regular ADMIN cannot create a SUPERADMIN or another ADMIN
    if (req.user.role === UserRole.ADMIN) {
      if (createUserDto.role === UserRole.SUPERADMIN || createUserDto.role === UserRole.ADMIN) {
        throw new ForbiddenException('Admins can only create TEACHER and STUDENT accounts.');
      }
    }
    return this.usersService.create(createUserDto);
  }
}
