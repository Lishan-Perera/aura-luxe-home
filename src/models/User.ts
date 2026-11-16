import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'customer' | 'store_manager' | 'super_admin';
  avatar?: {
    url: string;
    public_id: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(?:\+94|0)[7][0-9]{8}$/, 'Please enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)'],
    },
    role: {
      type: String,
      enum: ['customer', 'store_manager', 'super_admin'],
      default: 'customer',
      index: true,
    },
    avatar: {
      url: { type: String },
      public_id: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

