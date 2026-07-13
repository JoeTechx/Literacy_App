import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModuleItem, ModuleDocument } from './modules.schema';
import { CreateModuleItemDto, UpdateModuleItemDto } from './dto/modules.dto';

@Injectable()
export class ModulesService {
  constructor(@InjectModel(ModuleItem.name) private moduleModel: Model<ModuleDocument>) {}

  async create(createModuleItemDto: CreateModuleItemDto): Promise<ModuleItem> {
    const newItem = new this.moduleModel(createModuleItemDto);
    return newItem.save();
  }

  async findAll(): Promise<ModuleItem[]> {
    return this.moduleModel.find({ isActive: true }).exec();
  }

  async findByModuleId(moduleId: number): Promise<ModuleItem[]> {
    return this.moduleModel.find({ moduleId, isActive: true }).exec();
  }

  async findById(id: string): Promise<ModuleItem> {
    const item = await this.moduleModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Module item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateModuleItemDto): Promise<ModuleItem> {
    const updated = await this.moduleModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Module item with ID ${id} not found`);
    }
    return updated;
  }
}
