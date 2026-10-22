# CyberHero — Online Cybersecurity Awareness Examination System
**Dhaanish Ahmed College of Engineering, Chennai**  
*Autonomous • NAAC A+ • Approved by AICTE & Affiliated to Anna University*  
*A Cyber Security Awareness & Knowledge Challenge for Class 10, 11 & 12 Students*

---

## 1. Project Overview

CyberHero is a production-grade examination web application designed and built specifically for the cybersecurity awareness initiative organized by **Dhaanish Ahmed College of Engineering, Chennai**. 

The system implements strict examination integrity, cryptographic verification, concurrency-safe roll number assignment, real-time live monitoring via Server-Sent Events (SSE), and official spreadsheet record generation.

### Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, ExcelJS, Bcrypt, JWT, Helmet.
- **Persistence**: PostgreSQL 18 (normalized relational schema with foreign keys, indexes, and transactions).
- **Styling & Assets**: Premium dark navy cybersecurity theme (`#070B19`), electric blue/cyan accents (`#00D2FF` / `#0070F3`), official Dhaanish Ahmed College banner logo and shield crest assets.

---

## 2. Directory Structure

```text
cyberhero/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── public/                 # Official assets (college-logo.jpeg, dhaanish-banner.jpeg, cyber-hero.png)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, FacultySidebar
│   │   ├── context/            # AuthContext (Student & Faculty sessions)
│   │   ├── pages/              # 11 Dedicated views matching approved mockup
│   │   │   ├── LandingPage.tsx             # (1) Hero, about, rules, contact
│   │   │   ├── LoginSelectionPage.tsx      # (2) Student & Faculty selection
│   │   │   ├── StudentRegistrationPage.tsx # (3) Registration + OTP verification
│   │   │   ├── StudentLoginPage.tsx        # (4) Roll number + password
│   │   │   ├── StudentExamPage.tsx         # (5 & 6) Exam interface & submit modal
│   │   │   ├── ThankYouPage.tsx            # (7) Post-submission confirmation
│   │   │   ├── FacultyLoginPage.tsx        # (8) Faculty login + password change
│   │   │   ├── FacultyDashboardPage.tsx    # (9) Real-time stats & charts
│   │   │   ├── QuestionBankPage.tsx        # (10) Question CRUD & exam locking
│   │   │   └── StudentDirectoryPage.tsx    # (11) Student directory & excel export
│   │   ├── services/api.ts     # Typed fetch client with credentials
│   │   ├── App.tsx             # Router & protected navigation
│   │   ├── main.tsx
│   │   └── index.css           # Cyber tokens & glassmorphism utilities
│   ├── tailwind.config.js
│   └── vite.config.ts          # Proxy configuration to :5000
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   └── schema.prisma       # Normalized PostgreSQL database models
│   ├── src/
│   │   ├── middleware/         # authMiddleware (role checks, token verification)
│   │   ├── routes/             # authRoutes, studentRoutes, facultyRoutes
│   │   ├── services/           # authService, examService, excelService, otpService, rollNumberService, sseService
│   │   ├── config.ts           # Environment variable management
│   │   ├── prisma.ts           # PrismaClient singleton
│   │   ├── seed.ts             # 30 cybersecurity questions + sample candidates
│   │   └── index.ts            # Express server entrypoint
│   ├── tests/
│   │   └── run-tests.ts        # 24-point automated security & logic test suite
│   ├── .env.example            # Configuration template
│   └── package.json
│
├── shared/
│   └── types.ts                # Shared TypeScript contracts & interfaces
└── README.md
```

---

## 3. Quickstart & Running Locally

### Prerequisites
- Node.js v18+ (tested on v24)
- PostgreSQL 18
- npm or pnpm

### 1. Database Setup
Ensure PostgreSQL is running and the database `cyberhero` exists:
```bash
# Connection URL format:
postgresql://postgres:<password>@localhost:5433/cyberhero?schema=public
```

### 2. Backend Initialization
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed    # Seeds default faculty, exam, and 30 questions
npm test               # Runs the 24-point automated test suite
npm run dev            # Starts backend on http://localhost:5000
```

### 3. Frontend Initialization
```bash
cd client
npm install
npm run dev            # Starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173/` in your browser.

---

## 4. Key Security & Functional Features

1. **Student Registration & 4-Digit Roll Number Allocator**:
   - Collects full name, school, standard (10th, 11th, 12th), addresses, city, contact info, and password.
   - Enforces cryptographic OTP verification before registration completes.
   - Concurrency-safe unique 4-digit roll number allocator in range `1000–9999` with database unique constraint.
   - Capacity exhaustion protection (`Registration is full: Roll number capacity exhausted`).
   - Confirmation email automatically dispatched containing the assigned roll number.

2. **Faculty Authentication & Forced Password Change**:
   - Initial bootstrap account: `dhaanishchennai@gmail.com`.
   - Initial password seeded from `FACULTY_PASSWORD` in `server/.env`.
   - `mustChangePassword` flag strictly requires faculty to update their password before full dashboard access is granted.

3. **Strict Exam Locking Mechanism**:
   - Explicit "Lock Exam" action in Question Bank.
   - Backend transactions freeze questions, options, and correct answers into an immutable version snapshot (`ExamVersion`).
   - Modification or deletion during a locked state is rejected at the database level.

4. **Exam Experience & Integrity**:
   - Independent question and option shuffling per student using persisted `AttemptQuestion` and `AttemptOption` mappings.
   - **Zero Answer Leakage**: Correct answer keys (`isCorrect`) are stripped from all student-facing API endpoints.
   - Idempotent answer saving on option selection.
   - Server-enforced 45-minute countdown timer with automatic attempt finalization upon expiry.

5. **Student Directory & Real Excel Export**:
   - Search by roll number, name, school, standard, or status.
   - Generates authentic `.xlsx` spreadsheets using `ExcelJS` featuring institutional branding, column widths, and scores.

---

## 5. Event-Day Operational Runbook

### Pre-Event Checklist (T-2 Hours)
- [ ] Verify PostgreSQL service is active and disk storage has > 5GB free.
- [ ] Run automated tests: `npm test` inside `server/`.
- [ ] Log in to Faculty Portal (`dhaanishchennai@gmail.com`) and verify active question bank.
- [ ] Click **Lock Exam** to freeze the exam version for the competition.
- [ ] Verify Server-Sent Events indicator shows "Live Updates Active".

### Live Monitoring During Examination
- Monitor the **Currently Taking** and **Live Participation** charts on the Faculty Dashboard.
- Faculty can monitor student submissions in real-time without refreshing the page.

### Post-Event Data Preservation & Export
- In **Students** view, click **Download Excel** to export complete records to `.xlsx`.
- Run database backup command:
  ```bash
  pg_dump -U postgres -h 127.0.0.1 -p 5433 -d cyberhero -F c -b -v -f "cyberhero_backup_$(date +%Y%m%d_%H%M%S).dump"
  ```

---

## 6. Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend HTTP port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres@127.0.0.1:5433/cyberhero` |
| `JWT_SECRET` | Secret key for signing auth tokens | `secure_random_string_32_chars` |
| `FACULTY_EMAIL` | Bootstrap faculty email | `dhaanishchennai@gmail.com` |
| `FACULTY_PASSWORD` | Initial temporary password | `ChangeMe@123` |
| `APP_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `event@dhaanishchennai.edu.in` |
| `EMAIL_PASS` | SMTP app password | `app_password` |
| `EMAIL_FROM` | Sender address | `CyberHero Dhaanish <noreply@...>` |

---
*Created for Dhaanish Ahmed College of Engineering, Chennai.*
