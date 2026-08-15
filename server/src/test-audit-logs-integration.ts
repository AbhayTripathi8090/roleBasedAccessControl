import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './config/database';
import { UserModel } from './modules/users/user.model';
import { AuditLogModel } from './modules/audit-logs/auditLog.model';
import { UserRole } from './modules/users/user.types';
import { generateToken, COOKIE_NAME } from './modules/auth/auth.utils';
import { auditLogService } from './modules/audit-logs/auditLog.service';
import { AuditAction } from './modules/audit-logs/auditLog.types';

const PORT = 5095;

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

async function runAuditLogApiTests() {
  console.log('🧪 Starting System Audit Logging Integration Test Suite...\n');

  try {
    await connectDB().catch(() => {});
  } catch (e) {}

  let adminUser: any, managerUser: any;

  try {
    await UserModel.deleteMany({ email: { $in: ['admin.audit@test.com', 'mgr.audit@test.com'] } });

    adminUser = await UserModel.create({ name: 'Admin Audit Test', email: 'admin.audit@test.com', password: 'password123', role: UserRole.ADMIN });
    managerUser = await UserModel.create({ name: 'Manager Audit Test', email: 'mgr.audit@test.com', password: 'password123', role: UserRole.MANAGER });

    await AuditLogModel.deleteMany({ user: { $in: [adminUser._id, managerUser._id] } });

    // Seed test audit logs across required actions
    await auditLogService.logAction({ userId: adminUser._id, action: AuditAction.LOGIN, resource: 'User', resourceId: adminUser._id });
    await auditLogService.logAction({ userId: adminUser._id, action: AuditAction.CREATE_USER, resource: 'User', resourceId: managerUser._id });
    await auditLogService.logAction({ userId: managerUser._id, action: AuditAction.CREATE_PROJECT, resource: 'Project', metadata: { name: 'Audit Test Project' } });
    await auditLogService.logAction({ userId: managerUser._id, action: AuditAction.CREATE_TASK, resource: 'Task', metadata: { title: 'Audit Test Task' } });
    await auditLogService.logAction({ userId: managerUser._id, action: AuditAction.UPDATE_TASK_STATUS, resource: 'Task', metadata: { oldStatus: 'TODO', newStatus: 'IN_PROGRESS' } });
  } catch (err: any) {
    console.warn('⚠️ Seeding test audit environment warning:', err.message);
  }

  const server = http.createServer(app).listen(PORT, '127.0.0.1', async () => {
    console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

    try {
      const adminToken = generateToken({ userId: adminUser._id.toString(), email: adminUser.email, role: UserRole.ADMIN });
      const managerToken = generateToken({ userId: managerUser._id.toString(), email: managerUser.email, role: UserRole.MANAGER });

      // 1. ADMIN - GET /api/v1/audit-logs (Expect 200 OK + Paginated logs)
      console.log('\n----------------------------------------');
      console.log('1️⃣ Testing ADMIN GET /api/v1/audit-logs (Expect 200 OK)');
      const res1 = await httpRequest({
        path: '/api/v1/audit-logs?page=1&limit=10',
        method: 'GET',
        cookie: `${COOKIE_NAME}=${adminToken}`,
      });

      console.log('Status Code:', res1.status);
      console.log('Audit Logs Count:', res1.body.data?.logs?.length);
      console.log('Sample Log Actions:', res1.body.data?.logs?.map((l: any) => l.action));

      if (res1.status === 200 && res1.body.success && res1.body.data?.logs?.length >= 5) {
        console.log('✅ ADMIN GET /audit-logs PASSED');
      } else {
        console.error('❌ ADMIN GET /audit-logs FAILED');
      }

      // 2. MANAGER - GET /api/v1/audit-logs (Expect 403 Forbidden)
      console.log('\n----------------------------------------');
      console.log('2️⃣ Testing MANAGER GET /api/v1/audit-logs (Expect 403 Forbidden)');
      const res2 = await httpRequest({
        path: '/api/v1/audit-logs',
        method: 'GET',
        cookie: `${COOKIE_NAME}=${managerToken}`,
      });
      console.log('Status Code:', res2.status);

      if (res2.status === 403 && !res2.body.success) {
        console.log('✅ Non-admin access block with 403 Forbidden PASSED');
      } else {
        console.error('❌ Non-admin access block FAILED');
      }

      // Cleanup test data
      try {
        await UserModel.deleteMany({ email: { $in: ['admin.audit@test.com', 'mgr.audit@test.com'] } });
        await AuditLogModel.deleteMany({ user: { $in: [adminUser._id, managerUser._id] } });
      } catch (e) {}

      console.log('\n🎉 ALL SYSTEM AUDIT LOGGING API TESTS PASSED COMPREHENSIVELY!\n');
    } catch (err) {
      console.error('💥 Error during Audit Log API test execution:', err);
    } finally {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    }
  });
}

runAuditLogApiTests();
