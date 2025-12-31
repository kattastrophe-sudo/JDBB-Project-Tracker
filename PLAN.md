# JDBB Project Tracker — Implementation Plan & Specification

**Role:** Antigravity (Senior Solutions Architect)  
**Status:** PLAN ONLY (Approved for Engineering Handoff)  
**Version:** 1.0.0

---

## 1. MVP Scope (Phase 1) & Future Enhancements

### Phase 1: MVP (Core Deliverables)
The Minimum Viable Product focuses on the "Happy Path" of a single semester execution.
*   **Authentication:** Email/Password login via Supabase Auth.
*   **Role Management:** Admin Technologist, Admin Instructor, Monitor, Student.
*   **Semester Management:** Create/Edit active semesters.
*   **Project & Schedule Management:** Define projects and key dates (Demos, Checks, Due Dates).
*   **Student Enrollment:** Roster management with Student Number and Tag Number.
*   **Tracking:** Student dashboard for viewing timeline; Check-in system (text + photo uploads).
*   **Review:** Instructor view of student progress and submissions.
*   **Notifications:** Email reminders for schedule items (MVP: SendGrid or Resend integration via edge functions).
*   **Reporting:** CSV Export of roster and progress status.

### Phase 2: Enhancements (Post-MVP)
*   **Bulk Image Handling:** Gallery views for critiques.
*   **Rich Text Editor:** Formatting for project descriptions.
*   **Notification Controls:** User-level opt-out preferences.
*   **Archive Mode:** Read-only access to past semesters.
*   **Calendar Feeds:** iCal export for students.

---

## 2. User Roles & Permissions Matrix

| Permission Capability | Admin Technologist | Admin Instructor | Monitor | Student |
| :--- | :---: | :---: | :---: | :---: |
| **User Management** | Create/Edit/Delete | View Roster Only | View Roster Only | View Self Only |
| **System Config** | Full Access | No Access | No Access | No Access |
| **Semester/Course** | Create/Edit/Archive | View Only | View Only | View Assigned |
| **Projects/Schedule** | Create/Edit/Delete | View / Minor Edit* | View Only | View Only |
| **Student Progress** | View/Edit All | View/Grade/Comment | View/Flag | View Self |
| **Check-ins** | Delete/Edit Any | Review/Comment | View Only | Create/Edit Self |
| **Data Export** | Full (CSV/Excel) | Limited (Course) | No Access | No Access |
| **Notification Rules** | Manage Global | View Rules | No Access | No Access |

*\*Minor Edit for Instructors: Clarification — Instructors may update descriptive text on a schedule item but cannot change the "Due Date" or "Project Code" which are canonical constraints set by the Technologist.*

---

## 3. User Stories

### Admin Technologist (Me)
1.  I want to set up a new Semester (e.g., "Winter 2026") so that enrollment can begin.
2.  I want to define the Schedule of "Demos", "Lab Days", and "Due Dates" so students know the timeline.
3.  I want to import a student roster (CSV) mapping emails to Student Numbers and Tag Numbers.
4.  I want to see a log of all sent email reminders to verify the system is working.

### Admin Instructor
1.  I want to see a "Board" view of all students for "Project P1" to see who has submitted.
2.  I want to filter students by "Needs Attention" to focus my lab time on struggling students.
3.  I want to add an internal note to a student's project record regarding a safety conversation.

### Monitor
1.  I want to see who is working on "Project P3" during open studio hours.
2.  I want to check a student's last "Progress Check-in" to see if they are stuck.

### Student
1.  I want to log in and immediately see "Next Up" items (e.g., "P1 Due in 2 days").
2.  I want to upload a photo of my casting from my phone as a "Progress Check-in".
3.  I want to see if my project status is "Reviewed" (Lime Cream colour) so I can move on.

---

## 4. UI Sitemap / Information Architecture

### Global Elements
*   **Navigation Bar:** Context-aware links based on Role.
*   **Toast Notifications:** System feedback (Success/Error).

### 4.1 Public / Auth
*   `/login`: Email/Password entry.
*   `/forgot-password`: Recovery flow.

### 4.2 Student View
*   `/dashboard`: High-level timeline, "Next Up" cards (Pacific Cyan), Alerts (Vintage Grape).
*   `/projects`: Grid of Project Cards.
*   `/projects/[id]`: Project Detail.
    *   Description & Rubric Link.
    *   Schedule List (Demos, Due Dates).
    *   Check-in History (Timeline view).
    *   "Add Check-in" Action (Emerald Button).
*   `/profile`: View own details (Tag #, Student #).

### 4.3 Admin / Staff View
*   `/admin/dashboard`: Semester selector, key stats (overdue count).
*   `/admin/semesters`: List management.
*   `/admin/semesters/[id]/schedule`: Calendar/List builder for Schedule Items.
*   `/admin/semesters/[id]/projects`: Project definition & ordering.
*   `/admin/semesters/[id]/roster`: Student list, enrollment status, Tag # management.
*   `/admin/progress`: The "Tracker" view.
    *   Matrix: Rows (Students) x Cols (Projects).
    *   Cells indicate status colour (Neutral, Info, Emphasis, Success).
*   `/admin/students/[id]`: Individual student profile & history across the semester.
*   `/admin/reports`: Export tools.

---

## 5. Data Model & Schema Proposal

*No SQL code provided. Descriptive entities only.*

### 5.1 Entities

**Profiles (Users)**
*   `id`: UUID (Primary Key, linked to Auth).
*   `email`: Text.
*   `role`: Enum (admin_technologist, admin_instructor, monitor, student).
*   `full_name`: Text.
*   `preferred_name`: Text.
*   `created_at`: Timestamp.

**Semesters**
*   `id`: UUID.
*   `name`: Text (e.g., "Winter 2026").
*   `start_date`: Date.
*   `end_date`: Date.
*   `is_active`: Boolean.
*   `course_code`: Text.

**Enrollments**
*   `id`: UUID.
*   `profile_id`: Foreign Key (Profiles).
*   `semester_id`: Foreign Key (Semesters).
*   `student_number`: Text (Unique within semester).
*   `tag_number`: Text (Two digits "01"-"99", unique within semester).
*   `status`: Enum (active, dropped).

**Projects**
*   `id`: UUID.
*   `semester_id`: Foreign Key (Semesters).
*   `code`: Text (e.g., "P1", "P2").
*   `title`: Text.
*   `description`: Text (Markdown allowed).
*   `sequence_order`: Integer.
*   `is_published`: Boolean.
*   `rubric_url`: Text (Optional).

**Schedule Items**
*   `id`: UUID.
*   `semester_id`: Foreign Key (Semesters).
*   `project_id`: Foreign Key (Projects, Nullable).
*   `title`: Text.
*   `date`: Date.
*   `type`: Enum (assigned, demo, progress_check, lab_day, due, critique, other).
*   `description`: Text.

**Student Project States**
*   `id`: UUID.
*   `enrollment_id`: Foreign Key (Enrollments).
*   `project_id`: Foreign Key (Projects).
*   `status`: Enum (not_started, in_progress, submitted, reviewed).
*   `instructor_notes`: Text (Private).
*   `student_notes`: Text.
*   `is_flagged`: Boolean (Needs attention).
*   `last_activity_at`: Timestamp.

**Check-ins**
*   `id`: UUID.
*   `student_project_state_id`: Foreign Key (Student Project States).
*   `author_id`: Foreign Key (Profiles).
*   `type`: Enum (progress, demo_attended, question, submission).
*   `content`: Text.
*   `created_at`: Timestamp.
*   `attachments`: Array of URLs (or separate link table).

---

## 6. Data Rules & Validation

1.  **Tag Number Reuse:**
    *   Tag Numbers ("01"–"99") are NOT unique globally.
    *   They MUST be unique within a specific `semester_id`.
    *   Validation logic must run during student import/creation to prevent "01" duplicates in the same active course.

2.  **Student Identity:**
    *   Student Number is the immutable reference for the college.
    *   Tag Number is the immutable reference for the Studio workflow (physical storage).

3.  **Project Codes:**
    *   Project Codes (e.g., "P1") must be unique within a semester to ensure schedule items link correctly.

4.  **Dates:**
    *   All dates stored as UTC in DB, but displayed and calculated using "America/Toronto" logic.

---

## 7. Security Plan (Conceptual RLS)

*   **Public:** No access.
*   **Admin Technologist:**
    *   Read/Write ALL tables.
*   **Admin Instructor:**
    *   Read ALL tables.
    *   Update `student_project_states` (Status, Notes).
    *   Insert `check_ins` (Comments).
    *   No Delete permissions on `semesters`, `projects`, `schedule_items`.
*   **Monitor:**
    *   Read `schedule_items`, `projects`.
    *   Read `enrollments` (Roster).
    *   Read `student_project_states`.
    *   No Write access (unless Monitor Notes feature is enabled in Phase 2).
*   **Student:**
    *   Read `semesters`, `projects`, `schedule_items`.
    *   Read `enrollments` WHERE `profile_id` = `auth.uid()`.
    *   Read/Write `check_ins` WHERE owned by self.
    *   Read `student_project_states` WHERE owned by self.
    *   **CRITICAL:** Students cannot see other students' enrollments or work.

---

## 8. Notification & Reminder System Design

### Architecture
*   **Trigger:** Scheduled Edge Function (Supabase Cron).
*   **Frequency:** Runs once daily at 08:00 America/Toronto.
*   **Logic:**
    1.  Query active semesters.
    2.  Query `schedule_items` occurring in exactly X days (Offsets: 7, 3, 1, 0).
    3.  Filter by `type` (e.g., Due Dates, Progress Checks).
    4.  Fetch active students in those semesters.
    5.  Check "Notification Log" table to ensure (Student + ScheduleItem + Date) combo hasn't been sent.
    6.  Dispatch email via Provider (Resend/SendGrid).
    7.  Write success/fail to "Notification Log".

### Deduplication
*   Database uniqueness constraint on the Notification Log table: `(enrollment_id, schedule_item_id, sent_date)`.

---

## 9. Reporting & Export Design

### Roster Export (CSV)
*   **Columns:** Student Number, Tag Number, Last Name, Preferred Name, Email, Status.
*   **Format:** UTF-8 CSV.

### Progress Matrix Export (CSV)
*   **Columns:** Student Number, Tag Number, Name, [P1 Status], [P1 Last Check-in], [P2 Status], [P2 Last Check-in]...
*   **Usage:** Used for grading reconciliation in Excel.

---

## 10. Operational SOPs (Standard Operating Procedures)

### Semester Onboarding
1.  Admin Technologist creates new Semester entity.
2.  Admin imports Project templates or creates new Projects.
3.  Admin defines Schedule Items (Demos, Due Dates).
4.  Admin imports Student Roster CSV (Columns: StudentNumber, Tag, Email, Name).
5.  System sends "Welcome/Invite" emails via Auth provider.

### Archiving
1.  Semester `is_active` flag set to `false`.
2.  Reminders automatically stop (query filters by `is_active`).
3.  Student write access revoked via RLS (based on `is_active` check).

---

## 11. Build Order Checklist

1.  **Project Setup:** Initialize Next.js, Tailwind, setup Colour Variables (Lime Cream, Emerald, etc.).
2.  **Supabase Init:** Setup Auth, Database Tables, Enums, Buckets (Storage).
3.  **RLS Implementation:** Apply Row Level Security policies per role.
4.  **Layout & Navigation:** Create App Shell with Role-based navbar.
5.  **Admin Feature: Semesters & Roster:** Build CRUD and CSV Import.
6.  **Admin Feature: Projects & Schedule:** Build Creation forms.
7.  **Student Feature: Dashboard:** Build read-only views of data.
8.  **Student Feature: Check-ins:** Build form + image upload logic.
9.  **Admin Feature: Progress Tracker:** Build the Matrix view.
10. **Notifications:** Implement Cron + Email logic.
11. **QA:** Test roles and mobile responsiveness.

---

## 12. Testing Plan

### Acceptance Tests (Manual)
1.  **Identity:** Login as Student A. Verify I cannot see Student B's data via API or UI.
2.  **Upload:** Upload a 5MB image from a mobile browser. Verify resizing/storage.
3.  **Roles:** Login as Monitor. Try to delete a project. Verify Error.
4.  **Schedule:** Set a due date. Verify it appears on Student Dashboard in correct Timezone.

### Design Compliance
*   Verify "Reviewed" status uses **Lime Cream (#BCE784)**.
*   Verify "Submit" buttons use **Emerald (#5DD39E)**.
*   Verify Overdue alerts use **Vintage Grape (#513B56)**.

---

## 13. Assumptions & Unknowns

*   **Assumption:** Student emails provided in the roster match the Google/Email account they will use to sign up.
*   **Assumption:** Instructors do not need to grade (assign marks) in this platform, only track status/completion.
*   **Unknown:** Specific file size limit for Supabase Storage tier (will default to 5MB soft limit in app).
*   **Unknown:** Whether "Monitor Notes" should be visible to other Instructors (Assumed Yes).

---

## Plan Validation Checklist (No Hallucinations)

*   [x] **No Invented Features:** Only listed MVP features included.
*   [x] **Canonical Conventions:** Used "Projects", "Demos", "Tag Number", "Student Number". No "Tasks".
*   [x] **Roles Consistent:** Technologist, Instructor, Monitor, Student permissions aligned.
*   [x] **Non-Goals Excluded:** No grading, payments, or rubric builders.
*   [x] **Colour System:** Official palette (Lime Cream, Emerald, etc.) enforced in UI section.
*   [x] **No Code:** All logic described in text/plan format.
