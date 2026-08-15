import { UserRole } from '../users/user.types';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    isActive: boolean;
    createdAt?: Date;
  };
}
