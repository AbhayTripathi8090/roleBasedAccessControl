import bcrypt from 'bcryptjs';
import { UserModel } from '../users/user.model';
import { IUserDocument } from '../users/user.types';
import { RegisterInput, LoginInput } from './auth.validation';
import { ApiError } from '../../utils/ApiError';
import { auditLogService } from '../audit-logs/auditLog.service';
import { AuditAction } from '../audit-logs/auditLog.types';

export class AuthService {
  /**
   * Register a new user with password hashing & audit log recording
   */
  async register(input: RegisterInput): Promise<IUserDocument> {
    const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'A user with this email address already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(input.password, saltRounds);

    const user = await UserModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
      role: input.role,
      avatar: input.avatar || '',
      isActive: true,
    });

    // Record CREATE_USER audit log
    await auditLogService.logAction({
      userId: user._id,
      action: AuditAction.CREATE_USER,
      resource: 'User',
      resourceId: user._id,
      metadata: { email: user.email, role: user.role },
    });

    return user;
  }

  /**
   * Authenticate user with password comparison
   */
  async login(input: LoginInput): Promise<IUserDocument> {
    const user = await UserModel.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password!);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    return user;
  }
}

export const authService = new AuthService();
