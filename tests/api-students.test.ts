import assert from 'node:assert/strict';

/**
 * Automated Test Suite for EduRankAI Student Management APIs
 * 
 * Verifies:
 * 1. Successful student creation (HTTP 201)
 * 2. Invalid student input rejection (HTTP 400)
 * 3. Case-insensitive duplicate email rejection (HTTP 409)
 * 4. Student update (HTTP 200)
 * 5. Student deletion (HTTP 200)
 * 6. Verification that deleted records are removed from Supabase (HTTP 404)
 * 7. Verification that seeded records are protected and untouched
 * 
 * Execution:
 * npx tsx tests/api-students.test.ts
 */

const BASE_URL = process.env.TEST_HOST || 'http://127.0.0.1:3000';

// Protected Seeded Student Identifiers (Must NEVER be modified or deleted)
const PROTECTED_SEEDED_IDS = new Set([
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000005',
]);

const PROTECTED_SEEDED_EMAILS = new Set([
  'sophia.montgomery@university.edu',
  'marcus.vance@university.edu',
  'elena.rostova@university.edu',
  'devon.washington@university.edu',
  'chloe.chen@university.edu',
]);

// Track created test record IDs for guaranteed cleanup
const createdTestStudentIds = new Set<string>();

interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const testResults: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ⏳ ${name}... `);
    await fn();
    const duration = Date.now() - start;
    console.log(`\x1b[32mPASSED\x1b[0m (${duration}ms)`);
    testResults.push({ name, passed: true, durationMs: duration });
  } catch (err: any) {
    const duration = Date.now() - start;
    console.log(`\x1b[31mFAILED\x1b[0m (${duration}ms)`);
    console.error(`     \x1b[31mError:\x1b[0m ${err.message || err}`);
    testResults.push({ name, passed: false, durationMs: duration, error: err.message || String(err) });
  }
}

// Guaranteed Cleanup Handler
async function performCleanup() {
  if (createdTestStudentIds.size === 0) return;

  console.log(`\n🧹 Cleaning up ${createdTestStudentIds.size} isolated test record(s)...`);
  for (const studentId of Array.from(createdTestStudentIds)) {
    // Safety check: Never delete a protected seed record
    if (PROTECTED_SEEDED_IDS.has(studentId)) {
      console.error(`🚨 Critical Security Alert: Skipped deletion of protected seeded student ID ${studentId}`);
      continue;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/students/${studentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        console.log(`   ✓ Cleaned up test record: ${studentId}`);
        createdTestStudentIds.delete(studentId);
      } else {
        console.warn(`   ⚠ Cleanup notice: Student ${studentId} returned HTTP ${res.status}`);
      }
    } catch (cleanupErr: any) {
      console.warn(`   ⚠ Cleanup error for student ${studentId}:`, cleanupErr.message);
    }
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('   EduRankAI — Student Management Automated Test Suite');
  console.log('======================================================');
  console.log(`Target Host: ${BASE_URL}\n`);

  try {
    // 0. Pre-Flight Check: Fetch valid course from live catalog
    let validCourseId = '';
    await runTest('Pre-flight: Fetch live course catalog for foreign key reference', async () => {
      const res = await fetch(`${BASE_URL}/api/courses`);
      assert.equal(res.status, 200, `Expected HTTP 200 from /api/courses, got ${res.status}`);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data), 'Expected courses array in response');
      assert.ok(body.data.length > 0, 'Catalog should contain seeded courses');
      validCourseId = body.data[0].id;
      assert.ok(validCourseId, 'Course ID should be non-empty');
    });

    // Unique test run identifier
    const runTag = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const testEmail = `autotest.${runTag}@academic-testing.edu`;
    let createdStudentId = '';

    // 1. Test Successful Student Creation (HTTP 201)
    await runTest('1. Test successful student creation (HTTP 201)', async () => {
      const payload = {
        full_name: `Test Candidate ${runTag}`,
        email: testEmail,
        phone_number: '+1 (555) 888-0001',
        course_id: validCourseId,
        enrollment_date: '2026-11-02',
        status: 'Active',
      };

      const res = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      assert.equal(res.status, 201, `Expected HTTP 201 Created, received ${res.status}`);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data?.id, 'Response should return created student ID');
      assert.equal(json.data.email, testEmail.toLowerCase());
      assert.equal(json.data.phone_number, payload.phone_number);
      assert.equal(json.data.status, 'Active');
      assert.ok(json.data.course, 'Created student should include joined course details');

      createdStudentId = json.data.id;
      createdTestStudentIds.add(createdStudentId);
    });

    // 2. Test Invalid Student Input Rejection (HTTP 400)
    await runTest('2. Test invalid student input rejection (HTTP 400)', async () => {
      // 2a. Missing full_name
      const resMissingName = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: '',
          email: `invalid.${runTag}@test.edu`,
          phone_number: '+1 (555) 000-1111',
          course_id: validCourseId,
          enrollment_date: '2026-11-02',
          status: 'Active',
        }),
      });
      assert.equal(resMissingName.status, 400, 'Expected 400 Bad Request for empty full_name');
      const jsonMissingName = await resMissingName.json();
      assert.equal(jsonMissingName.success, false);
      assert.ok(jsonMissingName.errors?.full_name, 'Should return validation error for full_name');

      // 2b. Malformed email
      const resBadEmail = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Invalid Email Student',
          email: 'not-an-email-format',
          phone_number: '+1 (555) 000-1111',
          course_id: validCourseId,
          enrollment_date: '2026-11-02',
          status: 'Active',
        }),
      });
      assert.equal(resBadEmail.status, 400, 'Expected 400 Bad Request for malformed email');
      const jsonBadEmail = await resBadEmail.json();
      assert.equal(jsonBadEmail.success, false);
      assert.ok(jsonBadEmail.errors?.email, 'Should return validation error for email');

      // 2c. Invalid short phone number (< 7 digits)
      const resBadPhone = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Invalid Phone Student',
          email: `valid.${runTag}@test.edu`,
          phone_number: '1234',
          course_id: validCourseId,
          enrollment_date: '2026-11-02',
          status: 'Active',
        }),
      });
      assert.equal(resBadPhone.status, 400, 'Expected 400 Bad Request for invalid phone');
      const jsonBadPhone = await resBadPhone.json();
      assert.equal(jsonBadPhone.success, false);
      assert.ok(jsonBadPhone.errors?.phone_number, 'Should return validation error for phone_number');
    });

    // 3. Test Case-Insensitive Duplicate Email Rejection (HTTP 409)
    await runTest('3. Test case-insensitive duplicate email rejection (HTTP 409)', async () => {
      // Send the email in UPPERCASE
      const uppercaseEmail = testEmail.toUpperCase();
      assert.notEqual(uppercaseEmail, testEmail);

      const res = await fetch(`${BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `Duplicate Attempt ${runTag}`,
          email: uppercaseEmail,
          phone_number: '+1 (555) 888-0002',
          course_id: validCourseId,
          enrollment_date: '2026-11-02',
          status: 'Active',
        }),
      });

      assert.equal(res.status, 409, `Expected HTTP 409 Conflict, received ${res.status}`);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.isDuplicate, true, 'isDuplicate flag should be true');
      assert.ok(json.error && json.error.toLowerCase().includes('already enrolled'), 'Error message should explain email collision');
    });

    // 4. Test Student Update (HTTP 200)
    await runTest('4. Test student update (HTTP 200)', async () => {
      assert.ok(createdStudentId, 'createdStudentId must exist from Test 1');

      const updatedPayload = {
        full_name: `Updated Candidate ${runTag}`,
        email: testEmail,
        phone_number: '+1 (555) 999-9999',
        course_id: validCourseId,
        enrollment_date: '2026-11-02',
        status: 'Inactive',
      };

      const res = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      assert.equal(res.status, 200, `Expected HTTP 200 OK, received ${res.status}`);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.full_name, updatedPayload.full_name);
      assert.equal(json.data.phone_number, updatedPayload.phone_number);
      assert.equal(json.data.status, 'Inactive');

      // Verify persistence via GET /api/students/[id]
      const verifyRes = await fetch(`${BASE_URL}/api/students/${createdStudentId}`);
      assert.equal(verifyRes.status, 200);
      const verifyJson = await verifyRes.json();
      assert.equal(verifyJson.data.status, 'Inactive');
      assert.equal(verifyJson.data.phone_number, updatedPayload.phone_number);
    });

    // 5. Test Student Deletion (HTTP 200)
    await runTest('5. Test student deletion (HTTP 200)', async () => {
      assert.ok(createdStudentId, 'createdStudentId must exist');

      const res = await fetch(`${BASE_URL}/api/students/${createdStudentId}`, {
        method: 'DELETE',
      });

      assert.equal(res.status, 200, `Expected HTTP 200 OK, received ${res.status}`);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data?.id, createdStudentId);

      // Successfully deleted; remove from pending cleanup set
      createdTestStudentIds.delete(createdStudentId);
    });

    // 6. Verify Deleted Record Is Removed from Supabase (HTTP 404 & Empty Search)
    await runTest('6. Verify deleted record is removed from Supabase (HTTP 404)', async () => {
      // 6a. Direct ID query should now return 404
      const resGetById = await fetch(`${BASE_URL}/api/students/${createdStudentId}`);
      assert.equal(resGetById.status, 404, `Expected HTTP 404 Not Found for deleted student, received ${resGetById.status}`);

      // 6b. Search query should not find the deleted student
      const resSearch = await fetch(`${BASE_URL}/api/students?search=${encodeURIComponent(testEmail)}`);
      assert.equal(resSearch.status, 200);
      const jsonSearch = await resSearch.json();
      assert.equal(jsonSearch.count, 0, 'Search count should be 0 for deleted student email');
      assert.deepEqual(jsonSearch.data, [], 'Search data array should be empty');
    });

    // 7. Verify Integrity of Seed Records (Must NEVER be altered)
    await runTest('7. Verify the 5 seeded students remain intact and protected', async () => {
      const res = await fetch(`${BASE_URL}/api/students`);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.count >= 5, `Expected at least 5 seeded students, found ${json.count}`);

      // Verify each seeded email is present
      const loadedEmails = new Set(json.data.map((s: any) => s.email.toLowerCase()));
      for (const seededEmail of Array.from(PROTECTED_SEEDED_EMAILS)) {
        assert.ok(
          loadedEmails.has(seededEmail),
          `Seeded student email "${seededEmail}" was not found! Seed records must never be modified or deleted.`
        );
      }
    });

  } finally {
    // Guaranteed Cleanup Execution
    await performCleanup();
  }

  // Final Summary Report
  const total = testResults.length;
  const passed = testResults.filter((t) => t.passed).length;
  const failed = testResults.filter((t) => !t.passed).length;

  console.log('\n======================================================');
  console.log('                 TEST EXECUTION SUMMARY               ');
  console.log('======================================================');
  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : \x1b[32m${passed}\x1b[0m`);
  console.log(`Failed          : ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '0'}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
