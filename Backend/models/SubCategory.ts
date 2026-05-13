import mongoose, { Schema, Document } from 'mongoose';

export interface ISubCategory extends Document {
  category_id: mongoose.Types.ObjectId;
  name: string;
}

const SubCategorySchema: Schema = new Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    _id: true,
  },
);

export default mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);
