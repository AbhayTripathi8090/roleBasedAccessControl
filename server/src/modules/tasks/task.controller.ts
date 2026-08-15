import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { taskService } from './task.service';
import { getTasksQuerySchema, createTaskSchema, updateTaskSchema } from './task.validation';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = getTasksQuerySchema.parse(req.query);
  const result = await taskService.getTasks(validatedQuery, req.user!);
  res.status(200).json(new ApiResponse(200, result, 'Tasks list fetched successfully'));
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(validatedInput, req.user!);
  res.status(201).json(new ApiResponse(201, { task }, 'Task created successfully'));
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.params.id, req.user!);
  res.status(200).json(new ApiResponse(200, { task }, 'Task details fetched successfully'));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = updateTaskSchema.parse(req.body);
  const task = await taskService.updateTask(req.params.id, validatedInput, req.user!);
  res.status(200).json(new ApiResponse(200, { task }, 'Task updated successfully'));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.params.id, req.user!);
  res.status(200).json(new ApiResponse(200, null, 'Task deleted successfully'));
});
