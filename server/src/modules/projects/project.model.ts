import { Schema, model } from 'mongoose';
import { IProjectDocument, ProjectStatus } from './project.types';

const projectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ProjectStatus),
        message: '{VALUE} is not a valid project status',
      },
      default: ProjectStatus.PLANNING,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

// Compound & list indexes for high performance project querying
projectSchema.index({ members: 1 });
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ members: 1, status: 1 });
projectSchema.index({ createdAt: -1 });

export const ProjectModel = model<IProjectDocument>('Project', projectSchema);
