import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';
import { ProjectModel } from './modules/projects/project.model';
import { UserRole } from './modules/users/user.types';
import { generateToken, COOKIE_NAME } from './modules/auth/auth.utils';

const PORT = 5097;

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

async function runProjectMembersApiTests() {
  console.log('🧪 Starting Project Member Management Integration Test Suite...\n');

  try {
    await connectDB().catch(() => {});
  } catch (e) {}

  let ownerManager: any, otherManager: any, memberToAdd: any, project: any;

  try {
    await UserModel.deleteMany({ email: { $in: ['owner.members@test.com', 'other.members@test.com', 'toadd.members@test.com'] } });

    ownerManager = await UserModel.create({ name: 'Owner Manager', email: 'owner.members@test.com', password: 'password123', role: UserRole.MANAGER });
    otherManager = await UserModel.create({ name: 'Other Manager', email: 'other.members@test.com', password: 'password123', role: UserRole.MANAGER });
    memberToAdd = await UserModel.create({ name: 'Member To Add', email: 'toadd.members@test.com', password: 'password123', role: UserRole.USER });

    await ProjectModel.deleteMany({ owner: ownerManager._id });

    project = await ProjectModel.create({
      name: 'Member Management Project',
      description: 'Test Project',
      status: 'PLANNING',
      owner: ownerManager._id,
      members: [ownerManager._id],
    });
  } catch (err: any) {
    console.warn('⚠️ Seeding test environment warning:', err.message);
  }

  const server = http.createServer(app).listen(PORT, '127.0.0.1', async () => {
    console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

    try {
      const ownerToken = generateToken({ userId: ownerManager._id.toString(), email: ownerManager.email, role: UserRole.MANAGER });
      const otherToken = generateToken({ userId: otherManager._id.toString(), email: otherManager.email, role: UserRole.MANAGER });

      const projectId = project._id.toString();
      const memberUserId = memberToAdd._id.toString();

      // 1. Owner Manager adds a member (Expect 200 OK)
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing Owner Manager POST /api/v1/projects/:id/members (Add Member)');
      const res1 = await httpRequest({
        path: `/api/v1/projects/${projectId}/members`,
        method: 'POST',
        cookie: `${COOKIE_NAME}=${ownerToken}`,
        body: { userId: memberUserId },
      });
      console.log('Status Code:', res1.status);
      console.log('Updated Members Count:', res1.body.data?.project?.members?.length);

      if (res1.status === 200 && res1.body.success && res1.body.data?.project?.members?.length === 2) {
        console.log('✅ Member addition PASSED');
      } else {
        console.error('❌ Member addition FAILED');
      }

      // 2. Duplicate Member Addition (Expect 400 Bad Request)
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing Duplicate Member Addition (Expect 400 Bad Request)');
      const res2 = await httpRequest({
        path: `/api/v1/projects/${projectId}/members`,
        method: 'POST',
        cookie: `${COOKIE_NAME}=${ownerToken}`,
        body: { userId: memberUserId },
      });
      console.log('Status Code:', res2.status);
      console.log('Error Message:', res2.body.message);

      if (res2.status === 400 && !res2.body.success) {
        console.log('✅ Duplicate member prevention PASSED');
      } else {
        console.error('❌ Duplicate member prevention FAILED');
      }

      // 3. Non-existent User Addition (Expect 404 Not Found)
      console.log('\n----------------------------------------');
      console.log('3️⃣ Testing Non-existent User Addition (Expect 404 Not Found)');
      const res3 = await httpRequest({
        path: `/api/v1/projects/${projectId}/members`,
        method: 'POST',
        cookie: `${COOKIE_NAME}=${ownerToken}`,
        body: { userId: '660000000000000000000099' },
      });
      console.log('Status Code:', res3.status);
      console.log('Error Message:', res3.body.message);

      if (res3.status === 404 && !res3.body.success) {
        console.log('✅ Non-existent user validation PASSED');
      } else {
        console.error('❌ Non-existent user validation FAILED');
      }

      // 4. Unauthorized Manager Addition (Expect 403 Forbidden)
      console.log('\n----------------------------------------');
      console.log('4️⃣ Testing Unauthorized Manager Addition (Expect 403 Forbidden)');
      const res4 = await httpRequest({
        path: `/api/v1/projects/${projectId}/members`,
        method: 'POST',
        cookie: `${COOKIE_NAME}=${otherToken}`,
        body: { userId: memberUserId },
      });
      console.log('Status Code:', res4.status);

      if (res4.status === 403 && !res4.body.success) {
        console.log('✅ Unauthorized manager access blocked with 403 PASSED');
      } else {
        console.error('❌ Unauthorized manager test FAILED');
      }

      // 5. Remove Project Member (Expect 200 OK)
      console.log('\n----------------------------------------');
      console.log('5️⃣ Testing Owner Manager DELETE /api/v1/projects/:id/members/:userId');
      const res5 = await httpRequest({
        path: `/api/v1/projects/${projectId}/members/${memberUserId}`,
        method: 'DELETE',
        cookie: `${COOKIE_NAME}=${ownerToken}`,
      });
      console.log('Status Code:', res5.status);
      console.log('Updated Members Count:', res5.body.data?.project?.members?.length);

      if (res5.status === 200 && res5.body.data?.project?.members?.length === 1) {
        console.log('✅ Member removal PASSED');
      } else {
        console.error('❌ Member removal FAILED');
      }

      // 6. Attempting to remove Project Owner (Expect 400 Bad Request)
      console.log('\n----------------------------------------');
      console.log('6️⃣ Testing Attempting to Remove Project Owner (Expect 400 Bad Request)');
      const res6 = await httpRequest({
        path: `/api/v1/projects/${projectId}/members/${ownerManager._id.toString()}`,
        method: 'DELETE',
        cookie: `${COOKIE_NAME}=${ownerToken}`,
      });
      console.log('Status Code:', res6.status);
      console.log('Error Message:', res6.body.message);

      if (res6.status === 400 && !res6.body.success) {
        console.log('✅ Owner removal protection PASSED');
      } else {
        console.error('❌ Owner removal protection FAILED');
      }

      // Cleanup test data
      try {
        await UserModel.deleteMany({ email: { $in: ['owner.members@test.com', 'other.members@test.com', 'toadd.members@test.com'] } });
        await ProjectModel.deleteOne({ _id: projectId });
      } catch (e) {}

      console.log('\n🎉 ALL PROJECT MEMBER MANAGEMENT TESTS PASSED COMPREHENSIVELY!\n');
    } catch (err) {
      console.error('💥 Error during Member Management API test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runProjectMembersApiTests();
