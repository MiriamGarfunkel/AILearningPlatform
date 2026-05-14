import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document<string> {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  password_hash?: string;
  role: 'user' | 'admin';
}

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String, required: false, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    _id: false,
  },
);

UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.password_hash;
    return ret;
  },
});

export default mongoose.model<IUser>('User', UserSchema);
