# EduRankAI — Student Management & Enrollment System
## Final Project Engineering Report

**Author**: Subhash Sidda  
**GitHub Repository**: [SubhashSidda/edurankai](https://github.com/SubhashSidda/edurankai)  
**Live Production URL**: [https://edurankai-tawny.vercel.app/](https://edurankai-tawny.vercel.app/)  
**Date**: November 2026  

---

## 1. Project Overview and Objective

**EduRankAI** is a full-stack student management and academic course enrollment application. The objective of the project is to provide educational administrators and coordinators with a centralized, reliable system to:

- Maintain clean, consistent academic records.
- Track real-time course enrollment numbers.
- Prevent data integrity issues such as duplicate registrations or orphaned student records.
- Provide responsive dashboard metrics on enrollment status.

The system was engineered with an emphasis on relational data integrity, strict server-side validation, clean UI design, and production security standards.

---

## 2. Technology Stack

The project utilizes a modern TypeScript stack:

- **Frontend & Full-Stack Framework**: Next.js 15 (App Router architecture with React 19).
- **Programming Language**: TypeScript (strict type safety across database schemas, APIs, and UI components).
- **Styling & Design System**: Tailwind CSS (clean typographic hierarchy, neutral backgrounds, zero unnecessary pill badges).
- **Database**: Supabase PostgreSQL (relational database with foreign key constraints, unique indexes, and triggers).
- **Icons & Animations**: Lucide React and Motion (`motion/react`).
- **Testing & Tooling**: Node.js test assertions (`node:assert/strict`), `tsx` runner, and Next.js compiler.
- **Hosting & CI/CD**: Vercel connected to GitHub for automatic continuous deployment.

---

## 3. System Architecture and Database Design

### Architecture Overview
The application follows a clean 3-tier full-stack architecture:

1. **Client Tier**: Interactive React components running in the browser (`components/students/*`, `components/courses/*`, `components/dashboard/*`).
2. **Server Tier**: Next.js Route Handlers (`app/api/*`) executing business logic, input validation, and database operations.
3. **Database Tier**: Hosted Supabase PostgreSQL database enforcing relational constraints and data persistence.

### Database Schema
The database schema (`supabase/schema.sql`) defines two primary relational tables:

```sql
-- Academic Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    credit_hours INTEGER NOT NULL DEFAULT 3 CHECK (credit_hours > 0 AND credit_hours <= 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Enrollments Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relational Constraints and Indexes
- **Foreign Key Protection (`ON DELETE RESTRICT`)**: Prevents deleting a course if students are actively enrolled in it.
- **Case-Insensitive Unique Email Index**: `CREATE UNIQUE INDEX students_email_lower_unique ON students (LOWER(email));` guarantees unique student registrations regardless of letter casing.
- **Trigram Search Indexes**: Enabled `pg_trgm` and created GIN trigram indexes (`idx_students_full_name_trgm` and `idx_students_email_trgm`) to accelerate `ILIKE '%term%'` substring searches.
- **Automated Timestamp Triggers**: Trigger function `update_updated_at_column()` automatically updates `updated_at` on any record modification.

---

## 4. Implemented Features

### Student Management (Full CRUD)
- **Create**: Register new students with full name, email, phone number, assigned course, enrollment date, and status.
- **Read**: View students in a clean data table with pagination and student initials avatar chips.
- **Update**: Edit personal details, contact numbers, assigned track, and active/inactive status via a dedicated modal.
- **Delete**: Remove student records with confirmation dialogs and immediate UI synchronization.

### Course Catalog Management
- Add new academic courses with course code, name, department, and credit hours.
- Edit existing course metadata.
- View real-time enrolled student counts calculated from live database records.
- Safe deletion validation: blocks course deletion if students are assigned.

### Dashboard Statistics
- Dynamic KPI metrics reflecting real-time database state:
  - Total students enrolled.
  - Active vs. Inactive student breakdown.
  - Total academic courses offered.

### Search and Filtering
- Search students in real time across both **full name** and **email address**.
- Filter student records by **Course** or by **Enrollment Status** (`Active` / `Inactive`).

### Form Validation & Integrity
- Client-side and server-side validation ensuring:
  - Names are between 2 and 100 characters.
  - Emails follow standard RFC formats and are converted to lowercase.
  - Phone numbers contain between 7 and 16 digits.
  - Course selection references a valid, existing course UUID.
  - Credit hours are integers between 1 and 12.

---

## 5. API Design and Security

### API Endpoints
All client communication occurs through protected Next.js App Router Route Handlers:

| Endpoint | Method | Purpose |
| :--- | :---: | :--- |
| `/api/students` | `GET` | Retrieve filtered or searched student records. |
| `/api/students` | `POST` | Validate and create a new student record. |
| `/api/students/[id]` | `GET` | Fetch single student details by UUID. |
| `/api/students/[id]` | `PUT` | Validate and update an existing student record. |
| `/api/students/[id]` | `DELETE` | Delete a student record by UUID. |
| `/api/courses` | `GET` | List all courses with student counts. |
| `/api/courses` | `POST` | Create a new academic course. |
| `/api/courses/[id]` | `PUT` | Update course details. |
| `/api/courses/[id]` | `DELETE` | Delete course with foreign key check. |
| `/api/stats` | `GET` | Retrieve aggregate metrics. |
| `/api/config-status` | `GET` | Check database connection status safely. |

### Security Architecture
- **Row Level Security (RLS)**: Enabled on all tables (`ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;`). Direct public anonymous access via the client-side REST API is denied.
- **Server-Side Secret Isolation**: Database operations use `SUPABASE_SERVICE_ROLE_KEY` solely inside server-side Route Handlers (`lib/supabase/server.ts`). It is never bundled into client JavaScript.
- **No Stale Data Caching**: All dynamic route handlers export `export const dynamic = 'force-dynamic'`, guaranteeing live responses on Vercel serverless functions.
- **Git Protection**: `.gitignore` strictly excludes all `.env*` files to protect credentials.

---

## 6. Automated Testing Results

An automated test suite (`tests/api-students.test.ts`) was written using Node.js assertions (`node:assert/strict`) and executed via `npm test` against the local Next.js server connected directly to the live Supabase database.

### Test Execution Summary
- **Total Tests Run**: 8
- **Passed**: 8
- **Failed**: 0
- **Duration**: ~8.8 seconds

### Detailed Results Breakdown
1. **Pre-flight Check**: Verified live course catalog retrieval for foreign key reference (`200 OK`). &rarr; **PASSED**
2. **Student Creation**: Enrolled candidate with valid fields, returning joined course details (`201 Created`). &rarr; **PASSED**
3. **Invalid Input Rejection**: Tested empty name, malformed email, and short phone; verified error maps (`400 Bad Request`). &rarr; **PASSED**
4. **Duplicate Email Rejection**: Submitted identical email in uppercase; verified case-insensitive collision (`409 Conflict`). &rarr; **PASSED**
5. **Student Update**: Modified name, phone, and status; verified persistence in database (`200 OK`). &rarr; **PASSED**
6. **Student Deletion**: Removed the test candidate record (`200 OK`). &rarr; **PASSED**
7. **Deletion Verification**: Confirmed direct ID lookup returned `404 Not Found` and search returned 0 items. &rarr; **PASSED**
8. **Seed Data Protection**: Confirmed all 5 original seeded students remained intact and unmodified in the database. &rarr; **PASSED**
9. **Guaranteed Cleanup**: Test suite wrapped in a `try ... finally` block, ensuring zero leftover test records. &rarr; **PASSED**

---

## 7. Deployment Details

The project is deployed and accessible in production:

- **Source Code Repository**: [https://github.com/SubhashSidda/edurankai](https://github.com/SubhashSidda/edurankai)
- **Live Production URL**: [https://edurankai-tawny.vercel.app/](https://edurankai-tawny.vercel.app/)
- **Deployment Platform**: Vercel
- **Database Host**: Supabase (AWS ap-southeast-1 region)
- **Build Command**: `next build` (compiled across 8 App Router endpoints with 0 errors)

---

## 8. Challenges Encountered and Solutions

1. **Schema and Code Field Name Mismatches**:
   - *Challenge*: Discrepancies between legacy references (`phone` vs. `phone_number` and `credits` vs. `credit_hours`).
   - *Solution*: Performed an audit and aligned all TypeScript types, validations, service queries, and UI forms.
2. **PostgreSQL Unique Expression Conflict Syntax**:
   - *Challenge*: The seed SQL script failed when using `ON CONFLICT (LOWER(email))`.
   - *Solution*: Corrected the syntax to require double parentheses: `ON CONFLICT ((LOWER(email))) DO NOTHING;`.
3. **Sub-string Search Performance**:
   - *Challenge*: Standard B-tree indexes were ineffective for `ILIKE '%term%'` wildcard searches.
   - *Solution*: Added the `pg_trgm` extension and implemented GIN trigram indexes on `full_name` and `email`.
4. **Supabase Database Permissions**:
   - *Challenge*: The API returned `permission denied for table courses` after running initial DDL in the SQL editor.
   - *Solution*: Granted explicit `USAGE` and `ALL` privileges on public tables and sequences to the `service_role` user.
5. **Client-Side Hydration Mismatches**:
   - *Challenge*: Dynamic dates caused initial render discrepancies between server HTML and client DOM.
   - *Solution*: Implemented an `isMounted` client guard and deterministic ISO date handling.

---

## 9. Key Learnings

1. **Defense-in-Depth Data Validation**: While client-side form validation is essential for good user experience, true data integrity must be guaranteed by server-side validation and database-level constraints.
2. **Server-Side API Boundaries**: Using Next.js Route Handlers as an API layer provides complete control over security, hides sensitive service role keys, and prevents direct database exposure.
3. **Automated End-to-End Verification**: Writing automated tests that interact with real database records creates high confidence that changes do not break existing behavior.
4. **AI-Assisted Development Reflection**: AI tools were utilized throughout the project to assist with drafting boilerplate code, reviewing schemas, and refactoring types. As the engineer, I was responsible for diagnosing database permission errors, executing tests, validating outputs, and ensuring production readiness.

---

## 10. Conclusion and Future Improvements

The EduRankAI Student Management & Enrollment System is fully functional, verified, and running in production on Vercel with real-time Supabase PostgreSQL integration.

### Proposed Future Improvements
- **Batch Student Import / Export**: Support CSV upload and export for bulk student enrollments.
- **Role-Based Access Control (RBAC)**: Implement authentication (via Supabase Auth) separating Admin, Faculty, and Student roles.
- **Audit Logging**: Maintain an immutable activity log tracking every enrollment, update, and deletion.
- **Pagination Controls**: Add offset/cursor pagination for scaling beyond thousands of student records.
