import { Schema, model } from 'mongoose';
import { IAuditLogDocument } from './auditLog.types';

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for audit logs'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      index: true,
    },
    resource: {
      type: String,
      required: [true, 'Audit resource is required'],
      trim: true,
      index: true,
    },
    resourceId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: function (doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for audit log chronological queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

export const AuditLogModel = model<IAuditLogDocument>('AuditLog', auditLogSchema);
