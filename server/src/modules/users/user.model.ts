import { Schema, model } from 'mongoose';
import { IUserDocument, UserRole } from './user.types';

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in normal queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: '{VALUE} is not a valid user role',
      },
      default: UserRole.USER,
      index: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound & secondary indexes for fast query resolution
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

export const UserModel = model<IUserDocument>('User', userSchema);
