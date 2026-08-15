import { Document, Types } from 'mongoose';

export enum AuditAction {
  LOGIN = 'LOGIN',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  CHANGE_ROLE = 'CHANGE_ROLE',
  DELETE_USER = 'DELETE_USER',
  CREATE_PROJECT = 'CREATE_PROJECT',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  ADD_PROJECT_MEMBER = 'ADD_PROJECT_MEMBER',
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  DELETE_TASK = 'DELETE_TASK',
  UPDATE_TASK_STATUS = 'UPDATE_TASK_STATUS',
}

export interface LogActionParams {
  userId: string | Types.ObjectId;
  action: AuditAction | string;
  resource: string;
  resourceId?: string | Types.ObjectId | null;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface IAuditLog {
  _id?: string | Types.ObjectId;
  user: Types.ObjectId | string;
  action: AuditAction | string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}
