import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from './progress.schema';
import { UpdateProgressDto } from './dto/progress.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private usersService: UsersService,
  ) {}

  async getUserProgress(userId: string): Promise<Progress[]> {
    return this.progressModel.find({ userId }).exec();
  }

  async updateProgress(userId: string, updateDto: UpdateProgressDto): Promise<Progress> {
    const { moduleId, score = 0, attempts = 0, isCompleted } = updateDto;

    const progress = await this.progressModel.findOneAndUpdate(
      { userId, moduleId },
      {
        $inc: { score, attempts },
        ...(isCompleted !== undefined && { isCompleted }),
      },
      { new: true, upsert: true }
    ).exec();

    // If score increased, update the user's total points
    if (score > 0) {
      const user = await this.usersService.findById(userId);
      await this.usersService.update(userId, { totalPoints: user.totalPoints + score });
    }

    return progress;
  }
}
