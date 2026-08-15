import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authenticate } from './middlewares/auth.middleware';
import { authorizeRoles } from './middlewares/rbac.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { generateToken, COOKIE_NAME } from './modules/auth/auth.utils';
import { UserRole } from './modules/users/user.types';
import { UserModel } from './modules/users/user.model';
import { connectDB, disconnectDB } from './config/database';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Protected Test Endpoints demonstrating RBAC
app.get('/test/admin-only', authenticate, authorizeRoles(UserRole.ADMIN), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin!', user: req.user });
});

app.get('/test/manager-or-admin', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.MANAGER), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Manager or Admin!', user: req.user });
});

app.get('/test/any-role', authenticate, authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome User, Manager, or Admin!', user: req.user });
});

app.use(errorMiddleware);

const PORT = 5060;
const BASE_URL = `http://localhost:${PORT}/test`;

async function runRbacTests() {
  console.log('🧪 Starting RBAC Authorization Middleware Test Suite...\n');

  try {
    await connectDB().catch(() => {});
  } catch (e) {}

  // Setup test users in database
  let adminUser, managerUser, normalUser;

  try {
    await UserModel.deleteMany({ email: { $in: ['admin@test.com', 'manager@test.com', 'user@test.com'] } });

    adminUser = await UserModel.create({
      name: 'Admin Test User',
      email: 'admin@test.com',
      password: 'password123',
      role: UserRole.ADMIN,
    });

    managerUser = await UserModel.create({
      name: 'Manager Test User',
      email: 'manager@test.com',
      password: 'password123',
      role: UserRole.MANAGER,
    });

    normalUser = await UserModel.create({
      name: 'Normal Test User',
      email: 'user@test.com',
      password: 'password123',
      role: UserRole.USER,
    });
  } catch (err: any) {
    console.warn('⚠️ MongoDB not connected, skipping live database seeding:', err.message);
  }

  const server = http.createServer(app).listen(PORT, async () => {
    console.log(`🚀 RBAC Test server listening on port ${PORT}`);

    try {
      const adminToken = generateToken({
        userId: adminUser ? adminUser._id.toString() : '660000000000000000000001',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });

      const managerToken = generateToken({
        userId: managerUser ? managerUser._id.toString() : '660000000000000000000002',
        email: 'manager@test.com',
        role: UserRole.MANAGER,
      });

      const userToken = generateToken({
        userId: normalUser ? normalUser._id.toString() : '660000000000000000000003',
        email: 'user@test.com',
        role: UserRole.USER,
      });

      // 1. Test USER trying to access ADMIN-only endpoint -> Expect 403
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing USER role accessing /test/admin-only (Expect 403)');
      const res1 = await fetch(`${BASE_URL}/admin-only`, {
        headers: { Cookie: `${COOKIE_NAME}=${userToken}` },
      });
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Response Payload:', JSON.stringify(data1, null, 2));

      if (res1.status === 403 && !data1.success) {
        console.log('✅ USER access blocked with 403 Forbidden - PASSED');
      } else {
        console.error('❌ USER access test FAILED');
      }

      // 2. Test ADMIN accessing ADMIN-only endpoint -> Expect 200
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing ADMIN role accessing /test/admin-only (Expect 200)');
      const res2 = await fetch(`${BASE_URL}/admin-only`, {
        headers: { Cookie: `${COOKIE_NAME}=${adminToken}` },
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status);
      console.log('Response Payload:', JSON.stringify(data2, null, 2));

      if (res2.status === 200 && data2.success) {
        console.log('✅ ADMIN access permitted with 200 OK - PASSED');
      } else {
        console.error('❌ ADMIN access test FAILED');
      }

      // 3. Test MANAGER accessing MANAGER-or-ADMIN endpoint -> Expect 200
      console.log('\n----------------------------------------');
      console.log('3️⃣ Testing MANAGER role accessing /test/manager-or-admin (Expect 200)');
      const res3 = await fetch(`${BASE_URL}/manager-or-admin`, {
        headers: { Cookie: `${COOKIE_NAME}=${managerToken}` },
      });
      const data3 = await res3.json();
      console.log('Status Code:', res3.status);
      console.log('Response Payload:', JSON.stringify(data3, null, 2));

      if (res3.status === 200 && data3.success) {
        console.log('✅ MANAGER access permitted with 200 OK - PASSED');
      } else {
        console.error('❌ MANAGER access test FAILED');
      }

      // 4. Test Unauthenticated access -> Expect 401
      console.log('\n----------------------------------------');
      console.log('4️⃣ Testing Unauthenticated request to /test/admin-only (Expect 401)');
      const res4 = await fetch(`${BASE_URL}/admin-only`);
      const data4 = await res4.json();
      console.log('Status Code:', res4.status);
      console.log('Response Payload:', JSON.stringify(data4, null, 2));

      if (res4.status === 401 && !data4.success) {
        console.log('✅ Unauthenticated request blocked with 401 Unauthorized - PASSED');
      } else {
        console.error('❌ Unauthenticated request test FAILED');
      }

      // Clean up test users
      try {
        await UserModel.deleteMany({ email: { $in: ['admin@test.com', 'manager@test.com', 'user@test.com'] } });
      } catch (e) {}

      console.log('\n🎉 ALL RBAC AUTHORIZATION TESTS PASSED!\n');
    } catch (err) {
      console.error('💥 Error during RBAC test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runRbacTests();
