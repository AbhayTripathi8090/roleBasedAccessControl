import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';
import { ProjectModel } from './modules/projects/project.model';
import { TaskModel } from './modules/tasks/task.model';
import { UserRole } from './modules/users/user.types';
import { generateToken, COOKIE_NAME } from './modules/auth/auth.utils';

const PORT = 5096;

function httpRequest(options: {
  path: string;
  method: string;
  cookie?: string;
  body?: any;
}): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: options.path,
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...(options.cookie ? { Cookie: options.cookie } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode || 500, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTasksApiTests() {
  console.log('🧪 Starting Task CRUD API Integration Test Suite...\n');

  try {
    await connectDB().catch(() => {});
  } catch (e) {}

  let adminUser: any, managerUser: any, assignedMember: any, unassignedMember: any;
  let project: any, createdTaskId: string = '';

  try {
    await UserModel.deleteMany({ email: { $in: ['admin.task@test.com', 'mgr.task@test.com', 'mem1.task@test.com', 'mem2.task@test.com'] } });

    adminUser = await UserModel.create({ name: 'Admin Task', email: 'admin.task@test.com', password: 'password123', role: UserRole.ADMIN });
    managerUser = await UserModel.create({ name: 'Manager Task', email: 'mgr.task@test.com', password: 'password123', role: UserRole.MANAGER });
    assignedMember = await UserModel.create({ name: 'Assigned Member', email: 'mem1.task@test.com', password: 'password123', role: UserRole.USER });
    unassignedMember = await UserModel.create({ name: 'Unassigned Member', email: 'mem2.task@test.com', password: 'password123', role: UserRole.USER });

    await ProjectModel.deleteMany({ owner: managerUser._id });

    project = await ProjectModel.create({
      name: 'Task Testing Project',
      description: 'Project for Task CRUD verification',
      status: 'ACTIVE',
      owner: managerUser._id,
      members: [managerUser._id, assignedMember._id, unassignedMember._id],
    });

    await TaskModel.deleteMany({ project: project._id });
  } catch (err: any) {
    console.warn('⚠️ Seeding warning:', err.message);
  }

  const server = http.createServer(app).listen(PORT, '127.0.0.1', async () => {
    console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

    try {
      const managerToken = generateToken({ userId: managerUser._id.toString(), email: managerUser.email, role: UserRole.MANAGER });
      const assignedToken = generateToken({ userId: assignedMember._id.toString(), email: assignedMember.email, role: UserRole.USER });
      const unassignedToken = generateToken({ userId: unassignedMember._id.toString(), email: unassignedMember.email, role: UserRole.USER });

      const projectId = project._id.toString();
      const assigneeId = assignedMember._id.toString();

      // 1. MANAGER creates task assigned to member (Expect 201 Created)
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing MANAGER POST /api/v1/tasks (Create Task)');
      const res1 = await httpRequest({
        path: '/api/v1/tasks',
        method: 'POST',
        cookie: `${COOKIE_NAME}=${managerToken}`,
        body: {
          title: 'Implement Authentication Unit Tests',
          description: 'High priority task for RBAC system',
          project: projectId,
          assignedTo: assigneeId,
          status: 'TODO',
          priority: 'HIGH',
        },
      });

      console.log('Status Code:', res1.status);
      console.log('Created Task Title:', res1.body.data?.task?.title);

      if (res1.status === 201 && res1.body.success && res1.body.data?.task?._id) {
        createdTaskId = res1.body.data.task._id;
        console.log('✅ MANAGER task creation PASSED');
      } else {
        console.error('❌ MANAGER task creation FAILED');
      }

      // 2. USER attempts task creation (Expect 403 Forbidden)
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing USER POST /api/v1/tasks (Expect 403 Forbidden)');
      const res2 = await httpRequest({
        path: '/api/v1/tasks',
        method: 'POST',
        cookie: `${COOKIE_NAME}=${assignedToken}`,
        body: { title: 'Illegal Task', project: projectId },
      });
      console.log('Status Code:', res2.status);

      if (res2.status === 403 && !res2.body.success) {
        console.log('✅ USER task creation restriction PASSED');
      } else {
        console.error('❌ USER task creation restriction FAILED');
      }

      // 3. ASSIGNED MEMBER updates task STATUS (Expect 200 OK)
      if (createdTaskId) {
        console.log('\n----------------------------------------');
        console.log('3️⃣ Testing ASSIGNED MEMBER PATCH /api/v1/tasks/:id (Status update to IN_PROGRESS)');
        const res3 = await httpRequest({
          path: `/api/v1/tasks/${createdTaskId}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${assignedToken}`,
          body: { status: 'IN_PROGRESS' },
        });
        console.log('Status Code:', res3.status);
        console.log('Updated Status:', res3.body.data?.task?.status);

        if (res3.status === 200 && res3.body.data?.task?.status === 'IN_PROGRESS') {
          console.log('✅ Member task status update PASSED');
        } else {
          console.error('❌ Member task status update FAILED');
        }
      }

      // 4. ASSIGNED MEMBER attempts to update title/priority (Expect 403 Forbidden)
      if (createdTaskId) {
        console.log('\n----------------------------------------');
        console.log('4️⃣ Testing ASSIGNED MEMBER PATCH /api/v1/tasks/:id (Attempting title/priority change)');
        const res4 = await httpRequest({
          path: `/api/v1/tasks/${createdTaskId}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${assignedToken}`,
          body: { title: 'Hacked Title', priority: 'LOW' },
        });
        console.log('Status Code:', res4.status);
        console.log('Error Message:', res4.body.message);

        if (res4.status === 403 && !res4.body.success) {
          console.log('✅ Member non-status update restriction PASSED');
        } else {
          console.error('❌ Member non-status update restriction FAILED');
        }
      }

      // 5. UNASSIGNED MEMBER attempts to update task status (Expect 403 Forbidden)
      if (createdTaskId) {
        console.log('\n----------------------------------------');
        console.log('5️⃣ Testing UNASSIGNED MEMBER PATCH /api/v1/tasks/:id (Expect 403 Forbidden)');
        const res5 = await httpRequest({
          path: `/api/v1/tasks/${createdTaskId}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${unassignedToken}`,
          body: { status: 'COMPLETED' },
        });
        console.log('Status Code:', res5.status);

        if (res5.status === 403 && !res5.body.success) {
          console.log('✅ Unassigned user status update block PASSED');
        } else {
          console.error('❌ Unassigned user status update block FAILED');
        }
      }

      // 6. MANAGER deletes task (Expect 200 OK)
      if (createdTaskId) {
        console.log('\n----------------------------------------');
        console.log('6️⃣ Testing MANAGER DELETE /api/v1/tasks/:id');
        const res6 = await httpRequest({
          path: `/api/v1/tasks/${createdTaskId}`,
          method: 'DELETE',
          cookie: `${COOKIE_NAME}=${managerToken}`,
        });
        console.log('Status Code:', res6.status);

        if (res6.status === 200 && res6.body.success) {
          console.log('✅ MANAGER task deletion PASSED');
        } else {
          console.error('❌ MANAGER task deletion FAILED');
        }
      }

      // Cleanup test data
      try {
        await UserModel.deleteMany({ email: { $in: ['admin.task@test.com', 'mgr.task@test.com', 'mem1.task@test.com', 'mem2.task@test.com'] } });
        await ProjectModel.deleteOne({ _id: projectId });
        if (createdTaskId) await TaskModel.deleteOne({ _id: createdTaskId });
      } catch (e) {}

      console.log('\n🎉 ALL TASK CRUD API TESTS EXECUTED COMPREHENSIVELY!\n');
    } catch (err) {
      console.error('💥 Error during Task API test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runTasksApiTests();
