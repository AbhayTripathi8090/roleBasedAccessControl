import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';
import { ProjectModel } from './modules/projects/project.model';
import { TaskModel } from './modules/tasks/task.model';
import { UserRole } from './modules/users/user.types';
import { ProjectStatus } from './modules/projects/project.types';
import { TaskStatus, TaskPriority } from './modules/tasks/task.types';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  console.log('🌱 Seeding WorkFlow RBAC Database with Demo Users & Sample Data...');

  try {
    await connectDB();

    // Clean existing seed demo accounts
    await UserModel.deleteMany({ email: { $in: ['admin@test.com', 'manager@test.com', 'user@test.com'] } });

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Seed Users
    const admin = await UserModel.create({
      name: 'System Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    const manager = await UserModel.create({
      name: 'Sarah Manager',
      email: 'manager@test.com',
      password: hashedPassword,
      role: UserRole.MANAGER,
      isActive: true,
    });

    const member = await UserModel.create({
      name: 'Alex Member',
      email: 'user@test.com',
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    });

    console.log('✅ Created 3 Seed Accounts:');
    console.log('   - ADMIN:   admin@test.com   (password123)');
    console.log('   - MANAGER: manager@test.com (password123)');
    console.log('   - USER:    user@test.com    (password123)');

    // 2. Create Sample Projects
    await ProjectModel.deleteMany({ owner: { $in: [admin._id, manager._id] } });

    const rbacProject = await ProjectModel.create({
      name: 'Enterprise RBAC Platform',
      description: 'Role-based access control backend and Next.js frontend implementation.',
      status: ProjectStatus.ACTIVE,
      owner: manager._id,
      members: [manager._id, member._id, admin._id],
    });

    const cloudProject = await ProjectModel.create({
      name: 'Cloud Infrastructure Upgrade',
      description: 'Migrating microservices to Kubernetes clusters and AWS.',
      status: ProjectStatus.PLANNING,
      owner: admin._id,
      members: [admin._id, manager._id],
    });

    console.log('✅ Created 2 Sample Projects');

    // 3. Create Sample Tasks
    await TaskModel.deleteMany({ project: { $in: [rbacProject._id, cloudProject._id] } });

    await TaskModel.create({
      title: 'Implement Authorization Middleware',
      description: 'Build authorizeRoles and resource ownership verification helpers.',
      project: rbacProject._id,
      assignedTo: member._id,
      createdBy: manager._id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await TaskModel.create({
      title: 'Audit Logging System',
      description: 'Capture login, user updates, and task actions asynchronously.',
      project: rbacProject._id,
      assignedTo: member._id,
      createdBy: admin._id,
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    console.log('✅ Created 2 Sample Tasks');

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY! You can now log in at http://localhost:3000/login');
  } catch (err: any) {
    console.error('💥 Error seeding database:', err.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedDatabase();
