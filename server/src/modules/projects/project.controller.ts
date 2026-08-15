import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { projectService } from './project.service';
import { getProjectsQuerySchema, createProjectSchema, updateProjectSchema, addProjectMemberSchema } from './project.validation';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getProjectsQuerySchema.parse(req.query);
  const result = await projectService.getProjects(validatedQuery, req.user!);
  res.status(200).json(new ApiResponse(200, result, 'Projects list fetched successfully'));
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = createProjectSchema.parse(req.body);
  const project = await projectService.createProject(validatedInput, req.user!);
  res.status(201).json(new ApiResponse(201, { project }, 'Project created successfully'));
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProjectById(req.params.id, req.user!);
  res.status(200).json(new ApiResponse(200, { project }, 'Project details fetched successfully'));
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = updateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(req.params.id, validatedInput, req.user!);
  res.status(200).json(new ApiResponse(200, { project }, 'Project updated successfully'));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.deleteProject(req.params.id, req.user!);
  res.status(200).json(new ApiResponse(200, null, 'Project deleted successfully'));
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = addProjectMemberSchema.parse(req.body);
  const project = await projectService.addProjectMember(req.params.id, validatedInput, req.user!);
  res.status(200).json(new ApiResponse(200, { project }, 'Project member added successfully'));
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.removeProjectMember(req.params.id, req.params.userId, req.user!);
  res.status(200).json(new ApiResponse(200, { project }, 'Project member removed successfully'));
});
