import { isValidObjectId } from 'mongoose';
import { AuditLogModel } from './auditLog.model';
import { LogActionParams, IAuditLogDocument } from './auditLog.types';
import { QueryAuditLogsInput } from './auditLog.validation';
import { ApiError } from '../../utils/ApiError';

export class AuditLogService {
  /**
   * Reusable non-blocking method to log system actions
   */
  async logAction(params: LogActionParams): Promise<IAuditLogDocument | null> {
    try {
      const log = await AuditLogModel.create({
        user: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ? params.resourceId.toString() : null,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress || '',
      });
      return log;
    } catch (error) {
      // Non-blocking log error handling to protect main business transactions
      console.error('⚠️ [AuditLogService] Failed to record audit log:', error);
      return null;
    }
  }

  /**
   * Fetch paginated audit logs (ADMIN only)
   */
  async getAuditLogs(query: QueryAuditLogsInput) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.user) {
      if (!isValidObjectId(query.user)) {
        throw new ApiError(400, 'Invalid User ID filter format');
      }
      filter.user = query.user;
    }

    if (query.action) {
      filter.action = query.action;
    }

    if (query.resource) {
      filter.resource = query.resource;
    }

    if (query.resourceId) {
      filter.resourceId = query.resourceId;
    }

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .populate('user', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLogModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

export const auditLogService = new AuditLogService();
