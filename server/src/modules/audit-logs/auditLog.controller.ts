import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { auditLogService } from './auditLog.service';
import { queryAuditLogsSchema } from './auditLog.validation';

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = queryAuditLogsSchema.parse(req.query);
  const result = await auditLogService.getAuditLogs(validatedQuery);
  res.status(200).json(new ApiResponse(200, result, 'Audit logs fetched successfully'));
});
