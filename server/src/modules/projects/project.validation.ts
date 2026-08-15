import { z } from 'zod';
import { ProjectStatus } from './project.types';

export const getProjectsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional().default(ProjectStatus.PLANNING),
  members: z.array(z.string()).optional().default([]),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  members: z.array(z.string()).optional(),
});

export const addProjectMemberSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).min(1, 'User ID cannot be empty'),
});

export type GetProjectsQueryInput = z.infer<typeof getProjectsQuerySchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
