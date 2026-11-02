EduRankAI – Student Management & Enrollment System

A full-stack student management and enrollment platform built to simplify student record management, course administration, and enrollment tracking.

🚀 Tech Stack

- Frontend: Next.js 15 (App Router), TypeScript
- Styling: Tailwind CSS
- Backend: Next.js Route Handlers
- Database: Supabase PostgreSQL
- Deployment: Vercel
- Version Control: Git & GitHub

✨ Features

Student Management

- Add new student records
- View student details
- Update student information
- Delete student records
- Search students by name or email
- Filter students by course and status

Course Management

- Add and manage courses
- Edit course information
- Track enrolled student counts
- Prevent deletion of courses linked to students

Dashboard

- Total student count
- Active student count
- Inactive student count
- Dynamic statistics from the database

Data Validation & Security

- Required field validation
- Email format validation
- Case-insensitive unique email constraint
- PostgreSQL foreign key constraints
- Row Level Security (RLS)
- Server-side Supabase access

📁 Project Structure

edurankai/
├── app/
│   ├── api/
│   │   ├── students/
│   │   ├── courses/
│   │   ├── stats/
│   │   └── config-status/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   ├── students/
│   ├── courses/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── services/
│   ├── supabase/
│   ├── validations/
│   └── types.ts
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
└── package.json

⚙️ Getting Started

1. Clone the repository

git clone https://github.com/SubhashSidda/edurankai.git
cd edurankai

2. Install dependencies

npm install

3. Configure environment variables

Create a ".env.local" file in the project root.

Add your Supabase credentials:

NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
APP_URL=http://localhost:3000

Never commit ".env.local" or expose your Secret API key.

4. Configure the database

Open your Supabase SQL Editor and execute:

"supabase/schema.sql"

This creates the required tables, constraints, indexes, triggers, and sample records.

5. Start the development server

npm run dev

Open http://localhost:3000 in your browser.

🔌 API Endpoints

Method| Endpoint| Purpose
GET| "/api/students"| List and search students
POST| "/api/students"| Create a student
GET| "/api/students/[id]"| Get student details
PUT| "/api/students/[id]"| Update a student
DELETE| "/api/students/[id]"| Delete a student
GET| "/api/courses"| List courses
POST| "/api/courses"| Create a course
PUT| "/api/courses/[id]"| Update a course
DELETE| "/api/courses/[id]"| Delete a course
GET| "/api/stats"| Get dashboard statistics

🧪 Testing

The application requires verification of:

- Student creation
- Invalid input rejection
- Duplicate email rejection
- Student updates
- Student deletion
- Course management
- Dashboard statistics

Only verified tests should be reported as passing.

🔐 Security Notes

- Environment variables are stored locally.
- Secret API keys are restricted to server-side code.
- Row Level Security is enabled on database tables.
- Database constraints protect data integrity.
- Never publish credentials in GitHub.

📌 Project Status

Core application structure, dashboard components, API routes, Supabase schema, and GitHub synchronization have been prepared.

Live database CRUD verification, automated test results, and deployment status should be updated after successful verification.

👨‍💻 Author

Subhash Sidda

GitHub: https://github.com/SubhashSidda

📄 License

No open-source license has been assigned yet.
