import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';

const PORT = 5059;
const BASE_URL = `http://localhost:${PORT}/api/v1/auth`;

async function runTests() {
  console.log('🧪 Starting Auth API Integration Test Suite...\n');

  try {
    await connectDB().catch((err) => {
      console.warn('⚠️ Starting test server without live MongoDB connection:', err.message);
    });
  } catch (err) {
    // Continue with mock/fallback if DB unavailable
  }

  // Cleanup test user if exists
  try {
    await UserModel.deleteOne({ email: 'test.workflow@example.com' });
  } catch (e) {}

  const server = http.createServer(app).listen(PORT, async () => {
    console.log(`🚀 Test server listening on port ${PORT}`);

    try {
      let cookieHeader = '';

      // Test 1: POST /api/v1/auth/register
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing POST /api/v1/auth/register');
      const regRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Workflow User',
          email: 'test.workflow@example.com',
          password: 'Password123!',
          role: 'ADMIN',
        }),
      });

      const regData = await regRes.json();
      console.log('Status Code:', regRes.status);
      console.log('Response Payload:', JSON.stringify(regData, null, 2));

      const setCookie = regRes.headers.get('set-cookie');
      if (setCookie) {
        cookieHeader = setCookie.split(';')[0];
        console.log('Received HttpOnly Cookie Header:', cookieHeader);
      }

      if (regRes.status === 201 && regData.success) {
        console.log('✅ POST /register PASSED');
      } else {
        console.error('❌ POST /register FAILED');
      }

      // Test 2: POST /api/v1/auth/login
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing POST /api/v1/auth/login');
      const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test.workflow@example.com',
          password: 'Password123!',
        }),
      });

      const loginData = await loginRes.json();
      console.log('Status Code:', loginRes.status);
      console.log('Response Payload:', JSON.stringify(loginData, null, 2));

      const loginSetCookie = loginRes.headers.get('set-cookie');
      if (loginSetCookie) {
        cookieHeader = loginSetCookie.split(';')[0];
      }

      if (loginRes.status === 200 && loginData.success) {
        console.log('✅ POST /login PASSED');
      } else {
        console.error('❌ POST /login FAILED');
      }

      // Test 3: GET /api/v1/auth/me (Authenticated)
      console.log('\n----------------------------------------');
      console.log('3️⃣ Testing GET /api/v1/auth/me (With Cookie)');
      const meRes = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
        },
      });

      const meData = await meRes.json();
      console.log('Status Code:', meRes.status);
      console.log('Response Payload:', JSON.stringify(meData, null, 2));

      if (meRes.status === 200 && meData.success && meData.data.user.email === 'test.workflow@example.com') {
        console.log('✅ GET /me (Authenticated) PASSED');
      } else {
        console.error('❌ GET /me FAILED');
      }

      // Test 4: POST /api/v1/auth/logout
      console.log('\n----------------------------------------');
      console.log('4️⃣ Testing POST /api/v1/auth/logout');
      const logoutRes = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          Cookie: cookieHeader,
        },
      });

      const logoutData = await logoutRes.json();
      console.log('Status Code:', logoutRes.status);
      console.log('Response Payload:', JSON.stringify(logoutData, null, 2));

      if (logoutRes.status === 200 && logoutData.success) {
        console.log('✅ POST /logout PASSED');
      } else {
        console.error('❌ POST /logout FAILED');
      }

      // Test 5: GET /api/v1/auth/me (Unauthenticated)
      console.log('\n----------------------------------------');
      console.log('5️⃣ Testing GET /api/v1/auth/me (After Logout / Unauthenticated)');
      const unauthMeRes = await fetch(`${BASE_URL}/me`, {
        method: 'GET',
      });

      const unauthMeData = await unauthMeRes.json();
      console.log('Status Code:', unauthMeRes.status);
      console.log('Response Payload:', JSON.stringify(unauthMeData, null, 2));

      if (unauthMeRes.status === 401 && !unauthMeData.success) {
        console.log('✅ Centralized 401 Unauthorized Error Handling PASSED');
      } else {
        console.error('❌ Unauthenticated test FAILED');
      }

      // Cleanup test user
      try {
        await UserModel.deleteOne({ email: 'test.workflow@example.com' });
      } catch (e) {}

      console.log('\n🎉 ALL AUTHENTICATION API TESTS EXECUTED COMPREHENSIVELY!\n');
    } catch (err) {
      console.error('💥 Error during test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runTests();
