import { z } from 'zod';
import { TaskStatus, TaskPriority } from './task.types';

export const getTasksQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  project: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(1, 'Task title cannot be empty')
    .max(150, 'Task title cannot exceed 150 characters'),
  description: z.string().optional(),
  project: z.string({ required_error: 'Project ID is required' }).min(1, 'Project ID is required'),
  assignedTo: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().optional().nullable(),
});

export type GetTasksQueryInput = z.infer<typeof getTasksQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
