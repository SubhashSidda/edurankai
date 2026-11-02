# Student Management & Enrollment System (Next.js + Supabase + Vercel)

A full-stack Student Management & Enrollment System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**.

---

### User Review & Critical Improvements

> [!IMPORTANT]
> **Refined Architectural Improvements**:
> 1. **Relational Course Integrity**: The `students` table uses `course_id UUID REFERENCES courses(id) ON DELETE RESTRICT`. Course deletion is prevented if any students are enrolled, returning a friendly HTTP `409 Conflict` error explaining how many students are enrolled.
> 2. **Case-Insensitive Unique Emails**: Enforced at the PostgreSQL level using `CREATE UNIQUE INDEX students_email_lower_unique ON students (LOWER(email));`. All incoming emails are trimmed and lowercased (`email.trim().toLowerCase()`) on both client and server before storage.
> 3. **Non-Destructive Isolated Testing**: Automated tests operate with a dedicated test isolation strategy using distinct test prefixes (`test.student.*@challenge.local`), ensuring zero impact on real student records and automatic teardown cleanup.
> 4. **Complete Course Lifecycle**: Full Course CRUD (Create, Read, **Edit/Update**, and Delete with foreign key check) in the dashboard.
> 5. **Accurate PostgreSQL Aggregations**: All dashboard counters (`Total`, `Active`, `Inactive`) are dynamically computed using `COUNT(*)` queries directly against Supabase records.
> 6. **Strict Server-Side Secrets**: `SUPABASE_SERVICE_ROLE_KEY` is loaded exclusively inside server-side Route Handlers (`lib/supabase/server.ts`) and never bundled in the browser.

---

## 1. Project Folder Structure

```
├── app/
│   ├── layout.tsx                  # Root HTML layout, font setup, metadata
│   ├── page.tsx                    # Main dashboard (Stats, Student Table, Modals)
│   ├── globals.css                 # Tailwind CSS styling and theme tokens
│   ├── api/
│   │   ├── students/
│   │   │   ├── route.ts            # GET (list/filter/search) & POST (create student)
│   │   │   └── [id]/
│   │   │       └── route.ts        # GET (detail), PUT (update), DELETE (remove)
│   │   ├── courses/
│   │   │   ├── route.ts            # GET (list courses) & POST (create course)
│   │   │   └── [id]/
│   │   │       └── route.ts        # PUT (edit course) & DELETE (remove course with FK check)
│   │   ├── stats/
│   │   │   └── route.ts            # GET (aggregate counts calculated from PostgreSQL)
│   │   └── test-suite/
│   │       └── route.ts            # POST (runs isolated, safe test cases with cleanup)
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx             # White sidebar with violet active links
│   │   ├── TopNav.tsx              # Breadcrumbs, database indicator & admin profile
│   │   ├── WelcomeBanner.tsx       # Personalized greeting & "Add Student" trigger
│   │   └── StatCards.tsx           # 3 dynamic metric cards (Total, Active, Inactive)
│   ├── students/
│   │   ├── StudentTable.tsx        # High-density data grid with sorting & action menu
│   │   ├── StudentFilterBar.tsx    # Search input (name/email) & course/status filters
│   │   ├── StudentFormModal.tsx    # Add / Edit student modal with inline validation
│   │   ├── StudentDetailModal.tsx  # View student profile card
│   │   └── DeleteConfirmModal.tsx  # Delete student confirmation modal
│   ├── courses/
│   │   ├── CourseManagerModal.tsx  # Manage, add, edit and delete courses
│   │   └── CourseFormModal.tsx     # Add / Edit course modal
│   ├── testing/
│   │   └── TestRunnerModal.tsx     # In-app test runner for the 5 challenge test cases
│   └── ui/
│       ├── Button.tsx              # Violet gradient primary and subtle outline buttons
│       ├── Input.tsx               # Rounded form inputs with focus rings
│       └── StatusBadge.tsx         # Zero-pill clean typographic status indicator
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server-only Supabase client (using Service Role Key)
│   │   └── client.ts               # Client-side Supabase client (using Anon Key only)
│   ├── validations/
│   │   ├── student.ts              # Zod / regex schemas for server & client validation
│   │   └── course.ts               # Course validation schema
│   └── types.ts                    # TypeScript types (Student, Course, Stats, ApiResponse)
├── supabase/
│   ├── schema.sql                  # PostgreSQL schema with constraints, indexes & seeds
│   └── seed.sql                    # Initial seed data for verification
├── tests/
│   └── api.test.ts                 # Integration test suite for the 5 hiring test cases
├── .env.example                    # Environment variable documentation (no secrets)
├── README.md                       # Comprehensive project & setup documentation
├── LEARNINGS.md                    # Key architectural decisions, trade-offs & learnings
├── next.config.mjs                 # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Next.js, React, Tailwind, Supabase dependencies
```

---

## 2. PostgreSQL Relational Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3 CHECK (credits > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Students Table with Foreign Key & Constraints
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Case-Insensitive Unique Email Index
CREATE UNIQUE INDEX IF NOT EXISTS students_email_lower_unique ON students (LOWER(email));

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);

-- Initial Courses Seed
INSERT INTO courses (code, name, department, credits) VALUES
    ('CS-101', 'Computer Science Fundamentals', 'Engineering', 4),
    ('SE-201', 'Full-Stack Web Development', 'Engineering', 4),
    ('DS-301', 'Data Science & Machine Learning', 'Computer Science', 4),
    ('CY-401', 'Cybersecurity Principles', 'Information Technology', 3),
    ('UI-102', 'UI/UX Design Systems', 'Design & Media', 3)
ON CONFLICT (code) DO NOTHING;
```

---

## 3. Server-Side Route Handlers & Foreign Key Protection

1. **`GET /api/students`**:
   - Performs a relational join: `students.*, courses(id, name, code, department)`.
   - Supports search by student name or email (case-insensitive `ILIKE`).
   - Filters by `course_id` and `status`.

2. **`POST /api/students`**:
   - Normalizes email: `email = email.trim().toLowerCase()`.
   - Validates all required fields and phone number format.
   - Verifies that `course_id` exists in `courses`.
   - Traps PostgreSQL unique violation (`23505`) $\rightarrow$ returns HTTP `409 Conflict` ("A student with this email is already registered").

3. **`PUT /api/students/[id]`**:
   - Normalizes email and checks uniqueness against other students.
   - Updates record and returns updated student data.

4. **`DELETE /api/students/[id]`**:
   - Removes student record; returns `200 OK` or `404 Not Found`.

5. **`DELETE /api/courses/[id]`**:
   - Queries `students` table for `COUNT(*) WHERE course_id = id`.
   - If count > 0, halts deletion and returns HTTP `409 Conflict`:
     `"Cannot delete course: X active students are currently enrolled in it. Please reassign or delete these students first."`
   - Otherwise, safely deletes the course.

6. **`PUT /api/courses/[id]`**:
   - Updates course name, department, and credit values.

7. **`GET /api/stats`**:
   - Real-time `COUNT(*)` queries on Supabase:
     - `totalStudents = count of all students`
     - `activeStudents = count WHERE status = 'Active'`
     - `inactiveStudents = count WHERE status = 'Inactive'`
     - `totalCourses = count of all courses`

8. **`POST /api/test-suite` (Safe, Non-Destructive Isolated Test Runner)**:
   - Creates an isolated student with email `test.runner.<uuid>@challenge.local`.
   - Tests invalid payloads $\rightarrow$ verifies `400 Bad Request`.
   - Attempts duplicate insertion $\rightarrow$ verifies `409 Conflict`.
   - Updates student $\rightarrow$ verifies `200 OK`.
   - Deletes test student $\rightarrow$ verifies `200 OK`.
   - Automatic cleanup `finally { ... }` ensures the database stays clean.

---

## 4. UI Design System (White + Violet)

- **Pure White Canvas (`#FFFFFF`)**: Clean, light SaaS dashboard.
- **Electric Violet (`#6C3BEB`)**: Primary buttons, active indicators, focused outlines.
- **Light Lavender (`#F1ECFF`)**: Active sidebar badges, modal icon backgrounds.
- **Dark Navy Headings (`#1E1B4B`)**: Bold, legible typography.
- **Zero-Pill Discipline**: Status labels presented cleanly with micro-indicators instead of heavy capsule badges.
- **Course Manager**: Full modal to add, edit, and delete courses with real-time enrollment checks.
