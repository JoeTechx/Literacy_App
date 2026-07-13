import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleDocument = ModuleItem & Document;

@Schema({ timestamps: true })
export class ModuleItem {
  @Prop({ required: true })
  moduleId: number; // e.g., 1 for "Tap the Sound", 2 for "Trace the Letter"

  @Prop({ required: true })
  title: string;

  // Polymorphic content based on module type
  @Prop({ type: Object, required: true })
  content: any; // Could be { letter: 'A', type: 'vowel' } or { word: 'CAT', hint: '...' }

  @Prop({ default: true })
  isActive: boolean;
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleItem);
