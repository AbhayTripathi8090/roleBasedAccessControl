import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export interface IUser {
  _id?: string | Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}
