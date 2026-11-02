-- ==============================================================================
-- EduRankAI Student Management & Enrollment System - Database Schema
-- Compatible with Supabase PostgreSQL (Fresh Project & Production Ready)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    credit_hours INTEGER NOT NULL DEFAULT 3 CHECK (credit_hours > 0 AND credit_hours <= 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Students Table
-- course_id references courses(id) with ON DELETE RESTRICT
-- to prevent accidental deletion of a course that has students actively enrolled.
CREATE TABLE IF NOT EXISTS students (
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

-- 4. Enable Row Level Security (RLS)
-- Enables strict access control. With RLS enabled and no public policies created,
-- all direct anonymous access from the browser/client is blocked.
-- The backend Next.js API routes use SUPABASE_SERVICE_ROLE_KEY to perform authorized operations.
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions to service_role (Used by Next.js Server-Side Route Handlers)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE public.courses TO service_role;
GRANT ALL ON TABLE public.students TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;

-- 6. Case-Insensitive Unique Student Email Index
CREATE UNIQUE INDEX IF NOT EXISTS students_email_lower_unique 
    ON students (LOWER(email));

-- 7. Performance & Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_students_course_id ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);

-- 8. Trigram Indexes for Fast ILIKE Fuzzy / Substring Search
-- Supports the application's search queries: full_name ILIKE '%term%' and email ILIKE '%term%'
CREATE INDEX IF NOT EXISTS idx_students_full_name_trgm 
    ON students USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_students_email_trgm 
    ON students USING gin (email gin_trgm_ops);

-- 9. Trigger to automatically update updated_at timestamp on record modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_courses_updated_at ON courses;
CREATE TRIGGER set_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- Initial Seed Catalog
-- ==============================================================================

-- Seed Academic Courses
INSERT INTO courses (id, code, name, department, credit_hours) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'SE-201', 'Full-Stack Web Engineering', 'Engineering & CS', 4),
    ('a0000000-0000-0000-0000-000000000002', 'CS-101', 'Computer Science & Algorithms', 'Engineering & CS', 4),
    ('a0000000-0000-0000-0000-000000000003', 'DS-301', 'Data Science & Machine Learning', 'Computer Science', 4),
    ('a0000000-0000-0000-0000-000000000004', 'CY-401', 'Cybersecurity & Cloud Systems', 'Information Tech', 3),
    ('a0000000-0000-0000-0000-000000000005', 'UX-105', 'Modern UI/UX Product Design', 'Design & Media', 3)
ON CONFLICT (code) DO NOTHING;

-- Seed Sample Students with Valid PostgreSQL Expression Conflict Handling
INSERT INTO students (id, full_name, email, phone_number, course_id, enrollment_date, status) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Sophia Montgomery', 'sophia.montgomery@university.edu', '+1 (555) 234-5678', 'a0000000-0000-0000-0000-000000000001', '2026-09-01', 'Active'),
    ('b0000000-0000-0000-0000-000000000002', 'Marcus Vance', 'marcus.vance@university.edu', '+1 (555) 345-6789', 'a0000000-0000-0000-0000-000000000002', '2026-09-01', 'Active'),
    ('b0000000-0000-0000-0000-000000000003', 'Elena Rostova', 'elena.rostova@university.edu', '+1 (555) 456-7890', 'a0000000-0000-0000-0000-000000000003', '2026-09-15', 'Active'),
    ('b0000000-0000-0000-0000-000000000004', 'Devon Washington', 'devon.washington@university.edu', '+1 (555) 567-8901', 'a0000000-0000-0000-0000-000000000001', '2026-08-20', 'Inactive'),
    ('b0000000-0000-0000-0000-000000000005', 'Chloe Chen', 'chloe.chen@university.edu', '+1 (555) 678-9012', 'a0000000-0000-0000-0000-000000000005', '2026-10-01', 'Active')
ON CONFLICT ((LOWER(email))) DO NOTHING;
