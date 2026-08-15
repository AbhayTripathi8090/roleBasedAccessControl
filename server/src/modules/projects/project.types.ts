import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface IProject {
  _id?: string | Types.ObjectId;
  name: string;
  description?: string;
  status: ProjectStatus;
  owner: Types.ObjectId | string;
  members: Array<Types.ObjectId | string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {}
