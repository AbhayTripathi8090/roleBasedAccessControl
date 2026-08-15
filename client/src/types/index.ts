export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  owner: User | string;
  members: User[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: Project | string;
  assignedTo?: User | string | null;
  createdBy: User | string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  user: User | string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}
