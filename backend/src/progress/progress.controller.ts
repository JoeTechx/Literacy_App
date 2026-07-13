import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getUserProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.userId);
  }

  @Patch()
  updateProgress(@Request() req, @Body() updateDto: UpdateProgressDto) {
    return this.progressService.updateProgress(req.user.userId, updateDto);
  }
}
