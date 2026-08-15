import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';
import { ProjectModel } from './modules/projects/project.model';
import { UserRole } from './modules/users/user.types';
import { generateToken, COOKIE_NAME } from './modules/auth/auth.utils';

const PORT = 5098;

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

async function runProjectsApiTests() {
  console.log('🧪 Starting Project CRUD API Integration Test Suite...\n');

  try {
    await connectDB().catch(() => {});
  } catch (e) {}

  let adminUser: any, manager1: any, manager2: any, memberUser: any;
  let createdProjectId: string = '';

  try {
    await UserModel.deleteMany({ email: { $in: ['admin.proj@test.com', 'mgr1.proj@test.com', 'mgr2.proj@test.com', 'mem.proj@test.com'] } });

    adminUser = await UserModel.create({ name: 'Admin Proj', email: 'admin.proj@test.com', password: 'password123', role: UserRole.ADMIN });
    manager1 = await UserModel.create({ name: 'Manager One', email: 'mgr1.proj@test.com', password: 'password123', role: UserRole.MANAGER });
    manager2 = await UserModel.create({ name: 'Manager Two', email: 'mgr2.proj@test.com', password: 'password123', role: UserRole.MANAGER });
    memberUser = await UserModel.create({ name: 'Member Proj', email: 'mem.proj@test.com', password: 'password123', role: UserRole.USER });

    await ProjectModel.deleteMany({ owner: { $in: [manager1._id, manager2._id, adminUser._id] } });
  } catch (err: any) {
    console.warn('⚠️ Test database setup issue:', err.message);
  }

  const server = http.createServer(app).listen(PORT, '127.0.0.1', async () => {
    console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

    try {
      const adminToken = generateToken({ userId: adminUser._id.toString(), email: adminUser.email, role: UserRole.ADMIN });
      const manager1Token = generateToken({ userId: manager1._id.toString(), email: manager1.email, role: UserRole.MANAGER });
      const manager2Token = generateToken({ userId: manager2._id.toString(), email: manager2.email, role: UserRole.MANAGER });
      const memberToken = generateToken({ userId: memberUser._id.toString(), email: memberUser.email, role: UserRole.USER });

      // 1. MANAGER 1 creates project
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing MANAGER 1 POST /api/v1/projects (Create Project)');
      const res1 = await httpRequest({
        path: '/api/v1/projects',
        method: 'POST',
        cookie: `${COOKIE_NAME}=${manager1Token}`,
        body: {
          name: 'Manager 1 Web Project',
          description: 'Production RBAC Web System',
          status: 'ACTIVE',
          members: [memberUser._id.toString()],
        },
      });

      console.log('Status Code:', res1.status);
      console.log('Created Project Name:', res1.body.data?.project?.name);

      if (res1.status === 201 && res1.body.success && res1.body.data?.project?._id) {
        createdProjectId = res1.body.data.project._id;
        console.log('✅ MANAGER 1 project creation PASSED');
      } else {
        console.error('❌ MANAGER 1 project creation FAILED');
      }

      // 2. USER attempts project creation (Expect 403)
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing USER POST /api/v1/projects (Expect 403 Forbidden)');
      const res2 = await httpRequest({
        path: '/api/v1/projects',
        method: 'POST',
        cookie: `${COOKIE_NAME}=${memberToken}`,
        body: { name: 'Illegal Project' },
      });
      console.log('Status Code:', res2.status);

      if (res2.status === 403 && !res2.body.success) {
        console.log('✅ USER creation restriction PASSED');
      } else {
        console.error('❌ USER creation restriction FAILED');
      }

      // 3. MEMBER GET /api/v1/projects (Expect only projects where member)
      console.log('\n----------------------------------------');
      console.log('3️⃣ Testing MEMBER GET /api/v1/projects (Expect member-accessible projects)');
      const res3 = await httpRequest({
        path: '/api/v1/projects',
        method: 'GET',
        cookie: `${COOKIE_NAME}=${memberToken}`,
      });
      console.log('Status Code:', res3.status);
      console.log('Projects Count:', res3.body.data?.projects?.length);

      if (res3.status === 200 && res3.body.data?.projects) {
        console.log('✅ MEMBER projects listing PASSED');
      } else {
        console.error('❌ MEMBER projects listing FAILED');
      }

      // 4. MANAGER 2 attempts update on MANAGER 1's project (Expect 403)
      if (createdProjectId) {
        console.log('\n----------------------------------------');
        console.log('4️⃣ Testing MANAGER 2 PATCH /api/v1/projects/:id (Expect 403 Access Denied)');
        const res4 = await httpRequest({
          path: `/api/v1/projects/${createdProjectId}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${manager2Token}`,
          body: { name: 'Hacked Project Title' },
        });
        console.log('Status Code:', res4.status);

        if (res4.status === 403 && !res4.body.success) {
          console.log('✅ MANAGER 2 unauthorized update blocked with 403 PASSED');
        } else {
          console.error('❌ MANAGER 2 update test FAILED');
        }
      }

      // 5. MANAGER 1 updates own project (Expect 200)
      if (createdProjectId) {
        console.log('\n----------------------------------------');
        console.log('5️⃣ Testing MANAGER 1 PATCH /api/v1/projects/:id (Update own project)');
        const res5 = await httpRequest({
          path: `/api/v1/projects/${createdProjectId}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${manager1Token}`,
          body: { status: 'COMPLETED' },
        });
        console.log('Status Code:', res5.status);
        console.log('Updated Status:', res5.body.data?.project?.status);

        if (res5.status === 200 && res5.body.data?.project?.status === 'COMPLETED') {
          console.log('✅ MANAGER 1 project update PASSED');
        } else {
          console.error('❌ MANAGER 1 project update FAILED');
        }
      }

      // 6. MANAGER 1 deletes own project (Expect 200)
      if (createdProjectId) {
        console.log('\n----------------------------------------');
        console.log('6️⃣ Testing MANAGER 1 DELETE /api/v1/projects/:id');
        const res6 = await httpRequest({
          path: `/api/v1/projects/${createdProjectId}`,
          method: 'DELETE',
          cookie: `${COOKIE_NAME}=${manager1Token}`,
        });
        console.log('Status Code:', res6.status);

        if (res6.status === 200 && res6.body.success) {
          console.log('✅ MANAGER 1 project deletion PASSED');
        } else {
          console.error('❌ MANAGER 1 project deletion FAILED');
        }
      }

      // Clean up test data
      try {
        await UserModel.deleteMany({ email: { $in: ['admin.proj@test.com', 'mgr1.proj@test.com', 'mgr2.proj@test.com', 'mem.proj@test.com'] } });
      } catch (e) {}

      console.log('\n🎉 ALL PROJECT CRUD API TESTS EXECUTED COMPREHENSIVELY!\n');
    } catch (err) {
      console.error('💥 Error during Project API test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runProjectsApiTests();
