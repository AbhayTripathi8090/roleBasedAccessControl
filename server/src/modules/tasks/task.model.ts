import { Schema, model } from 'mongoose';
import { ITaskDocument, TaskStatus, TaskPriority } from './task.types';

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title cannot be empty'],
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Associated project is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TaskStatus),
        message: '{VALUE} is not a valid task status',
      },
      default: TaskStatus.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TaskPriority),
        message: '{VALUE} is not a valid task priority',
      },
      default: TaskPriority.MEDIUM,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
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

// Compound indexes for rapid task queries & dashboard filtering
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ project: 1, priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

export const TaskModel = model<ITaskDocument>('Task', taskSchema);
