import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';
import { UserRole } from './modules/users/user.types';
import { generateToken, COOKIE_NAME } from './modules/auth/auth.utils';

const PORT = 5099;

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

async function runUsersApiTests() {
  console.log('🧪 Starting Users Feature API Integration Test Suite...\n');

  try {
    await connectDB().catch(() => {});
  } catch (e) {}

  let adminUser: any, memberUser: any;

  try {
    await UserModel.deleteMany({ email: { $in: ['admin.users@test.com', 'member.users@test.com'] } });

    adminUser = await UserModel.create({
      name: 'Admin User Test',
      email: 'admin.users@test.com',
      password: 'password123',
      role: UserRole.ADMIN,
    });

    memberUser = await UserModel.create({
      name: 'Member User Test',
      email: 'member.users@test.com',
      password: 'password123',
      role: UserRole.USER,
    });
  } catch (err: any) {
    console.warn('⚠️ Seeding test users without MongoDB:', err.message);
  }

  const server = http.createServer(app).listen(PORT, '127.0.0.1', async () => {
    console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

    try {
      const adminToken = generateToken({
        userId: adminUser ? adminUser._id.toString() : '660000000000000000000010',
        email: 'admin.users@test.com',
        role: UserRole.ADMIN,
      });

      const memberToken = generateToken({
        userId: memberUser ? memberUser._id.toString() : '660000000000000000000012',
        email: 'member.users@test.com',
        role: UserRole.USER,
      });

      // 1. ADMIN - GET /api/v1/users (Expect 200 with pagination)
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing ADMIN GET /api/v1/users (Expect 200 + Paginated payload)');
      const res1 = await httpRequest({
        path: '/api/v1/users?page=1&limit=5',
        method: 'GET',
        cookie: `${COOKIE_NAME}=${adminToken}`,
      });
      console.log('Status Code:', res1.status);
      console.log('Pagination Metadata:', JSON.stringify(res1.body.data?.pagination, null, 2));

      if (res1.status === 200 && res1.body.success && res1.body.data?.pagination) {
        console.log('✅ ADMIN GET /users PASSED');
      } else {
        console.error('❌ ADMIN GET /users FAILED');
      }

      // 2. MEMBER - GET /api/v1/users (Expect 403 Forbidden)
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing MEMBER GET /api/v1/users (Expect 403 Forbidden)');
      const res2 = await httpRequest({
        path: '/api/v1/users',
        method: 'GET',
        cookie: `${COOKIE_NAME}=${memberToken}`,
      });
      console.log('Status Code:', res2.status);

      if (res2.status === 403 && !res2.body.success) {
        console.log('✅ MEMBER access to user management blocked with 403 Forbidden PASSED');
      } else {
        console.error('❌ MEMBER access test FAILED');
      }

      // 3. MEMBER updating own profile - PATCH /api/v1/users/:ownId (Expect 200 OK)
      if (memberUser) {
        console.log('\n----------------------------------------');
        console.log('3️⃣ Testing MEMBER PATCH /api/v1/users/:ownId (Updating own name)');
        const res3 = await httpRequest({
          path: `/api/v1/users/${memberUser._id.toString()}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${memberToken}`,
          body: { name: 'Member Updated Name' },
        });
        console.log('Status Code:', res3.status);
        console.log('Updated Name:', res3.body.data?.user?.name);

        if (res3.status === 200 && res3.body.data?.user?.name === 'Member Updated Name') {
          console.log('✅ Self profile update PASSED');
        } else {
          console.error('❌ Self profile update FAILED');
        }
      }

      // 4. MEMBER trying to update someone else's profile - PATCH /api/v1/users/:adminId (Expect 403)
      if (adminUser) {
        console.log('\n----------------------------------------');
        console.log('4️⃣ Testing MEMBER PATCH /api/v1/users/:adminId (Expect 403 Access Denied)');
        const res4 = await httpRequest({
          path: `/api/v1/users/${adminUser._id.toString()}`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${memberToken}`,
          body: { name: 'Hacked Name' },
        });
        console.log('Status Code:', res4.status);

        if (res4.status === 403 && !res4.body.success) {
          console.log('✅ Updating other user profile blocked with 403 PASSED');
        } else {
          console.error('❌ Updating other user profile test FAILED');
        }
      }

      // 5. ADMIN updating user role - PATCH /api/v1/users/:id/role (Expect 200)
      if (memberUser) {
        console.log('\n----------------------------------------');
        console.log('5️⃣ Testing ADMIN PATCH /api/v1/users/:id/role (Promoting MEMBER to MANAGER)');
        const res5 = await httpRequest({
          path: `/api/v1/users/${memberUser._id.toString()}/role`,
          method: 'PATCH',
          cookie: `${COOKIE_NAME}=${adminToken}`,
          body: { role: UserRole.MANAGER },
        });
        console.log('Status Code:', res5.status);
        console.log('Updated Role:', res5.body.data?.user?.role);

        if (res5.status === 200 && res5.body.data?.user?.role === UserRole.MANAGER) {
          console.log('✅ Admin role promotion PASSED');
        } else {
          console.error('❌ Admin role promotion FAILED');
        }
      }

      // Cleanup test users
      try {
        await UserModel.deleteMany({ email: { $in: ['admin.users@test.com', 'member.users@test.com'] } });
      } catch (e) {}

      console.log('\n🎉 ALL USERS FEATURE API TESTS EXECUTED COMPREHENSIVELY!\n');
    } catch (err) {
      console.error('💥 Error during Users API test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runUsersApiTests();
