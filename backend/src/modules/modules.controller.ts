import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleItemDto, UpdateModuleItemDto } from './dto/modules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':moduleId')
  findByModuleId(@Param('moduleId') moduleId: string) {
    return this.modulesService.findByModuleId(Number(moduleId));
  }

  // Typically these would be protected by a RolesGuard for TEACHER only
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateModuleItemDto) {
    return this.modulesService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateModuleItemDto) {
    return this.modulesService.update(id, updateDto);
  }
}
