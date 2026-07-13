import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  moduleId: number;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Compound index so a user only has one progress record per module
ProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
