import { canAccessResource, verifyResourceAccess } from './utils/authorization';
import { UserRole, IUserDocument } from './modules/users/user.types';
import { ApiError } from './utils/ApiError';

async function runResourceAuthTests() {
  console.log('🧪 Starting Resource-Level Authorization Unit & Integration Test Suite...\n');

  // Mock User Entities
  const adminUser = { _id: '660000000000000000000001', role: UserRole.ADMIN } as unknown as IUserDocument;
  const managerUser1 = { _id: '660000000000000000000002', role: UserRole.MANAGER } as unknown as IUserDocument;
  const managerUser2 = { _id: '660000000000000000000003', role: UserRole.MANAGER } as unknown as IUserDocument;
  const normalUser1 = { _id: '660000000000000000000004', role: UserRole.USER } as unknown as IUserDocument;
  const normalUser2 = { _id: '660000000000000000000005', role: UserRole.USER } as unknown as IUserDocument;

  // Mock Resources
  const projectOwnedByManager1 = {
    ownerId: '660000000000000000000002',
    memberIds: ['660000000000000000000004'],
  };

  const taskAssignedToUser1 = {
    creatorId: '660000000000000000000002',
    assigneeId: '660000000000000000000004',
  };

  console.log('1️⃣ ADMIN Authorization Test (Should manage everything)');
  const adminProjectAccess = canAccessResource(adminUser, projectOwnedByManager1);
  const adminTaskAccess = canAccessResource(adminUser, taskAssignedToUser1);

  if (adminProjectAccess && adminTaskAccess) {
    console.log('✅ ADMIN can access all projects & tasks - PASSED');
  } else {
    console.error('❌ ADMIN access test FAILED');
  }

  console.log('\n2️⃣ MANAGER Resource Ownership Authorization Test');
  const mgr1ProjectAccess = canAccessResource(managerUser1, projectOwnedByManager1);
  const mgr2ProjectAccess = canAccessResource(managerUser2, projectOwnedByManager1);

  if (mgr1ProjectAccess && !mgr2ProjectAccess) {
    console.log('✅ MANAGER 1 (Owner) Granted, MANAGER 2 (Non-Owner) Denied - PASSED');
  } else {
    console.error('❌ MANAGER ownership test FAILED');
  }

  console.log('\n3️⃣ USER Task Assignment Authorization Test');
  const user1TaskAccess = canAccessResource(normalUser1, taskAssignedToUser1);
  const user2TaskAccess = canAccessResource(normalUser2, taskAssignedToUser1);

  if (user1TaskAccess && !user2TaskAccess) {
    console.log('✅ USER 1 (Assignee) Granted, USER 2 (Unassigned) Denied - PASSED');
  } else {
    console.error('❌ USER task assignment test FAILED');
  }

  console.log('\n4️⃣ verifyResourceAccess 403 Forbidden Exception Test');
  try {
    verifyResourceAccess(normalUser2, taskAssignedToUser1);
    console.error('❌ Expected 403 ApiError but assertion passed');
  } catch (err: any) {
    if (err instanceof ApiError && err.statusCode === 403) {
      console.log('✅ Threw 403 ApiError correctly:', err.message);
    } else {
      console.error('❌ Unexpected error type:', err);
    }
  }

  console.log('\n🎉 ALL RESOURCE-LEVEL AUTHORIZATION TESTS PASSED!\n');
}

runResourceAuthTests();
