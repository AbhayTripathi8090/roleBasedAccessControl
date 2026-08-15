import { Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface ITask {
  _id?: string | Types.ObjectId;
  title: string;
  description?: string;
  project: Types.ObjectId | string;
  assignedTo?: Types.ObjectId | string | null;
  createdBy: Types.ObjectId | string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}
