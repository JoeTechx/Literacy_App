import {
  Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleItemDto, UpdateModuleItemDto } from './dto/modules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/dto/user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  // Student: get all modules assigned to them
  @Roles(UserRole.STUDENT)
  @Get('my-modules')
  getMyModules(@Request() req) {
    return this.modulesService.findByAssignedStudent(req.user.userId);
  }

  // Teacher: get all modules they have created
  @Roles(UserRole.TEACHER)
  @Get('my-content')
  getMyContent(@Request() req) {
    return this.modulesService.findByTeacher(req.user.userId);
  }

  // Teacher: create a new learning module (auto-links to the teacher)
  @Roles(UserRole.TEACHER)
  @Post()
  create(@Request() req, @Body() createDto: CreateModuleItemDto) {
    return this.modulesService.create(req.user.userId, createDto);
  }

  // Teacher: assign an existing module to one of their students
  @Roles(UserRole.TEACHER)
  @Post(':moduleDocId/assign/:studentId')
  assignToStudent(
    @Request() req,
    @Param('moduleDocId') moduleDocId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.modulesService.assignToStudent(req.user.userId, moduleDocId, studentId);
  }

  // Teacher & Admins: edit module content they own (Admins can edit any)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateModuleItemDto) {
    return this.modulesService.update(req.user.userId, req.user.role, id, updateDto);
  }

  // Teacher & Admins: delete a module they own (Admins can delete any)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.modulesService.remove(req.user.userId, req.user.role, id);
  }
}
