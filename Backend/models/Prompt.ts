import mongoose, { Schema, Document } from 'mongoose';

export type LessonContentOrigin = 'live_model' | 'offline_stub';

export interface IPrompt extends Document<string> {
  user_id: string;
  category_id: string;
  sub_category_id: string;
  prompt: string;
  response: string;
  content_origin: LessonContentOrigin;
}

const PromptSchema: Schema = new Schema(
  {
    user_id: { type: String, ref: 'User', required: true, index: true },
    category_id: { type: String, ref: 'Category', required: true },
    sub_category_id: { type: String, ref: 'SubCategory', required: true },
    prompt: { type: String, required: true, maxlength: 8000 },
    response: { type: String, required: true },
    content_origin: {
      type: String,
      enum: ['live_model', 'offline_stub'],
      default: 'live_model',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  },
);

export default mongoose.model<IPrompt>('Prompt', PromptSchema);
