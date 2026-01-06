# 5-Day Implementation Plan - Sajilo Kaam
**Timeline**: 5 Days  
**Status**: Authentication ✅ Complete | Everything Else ⏳ Pending  
**Goal**: Complete all core features and connect frontend to backend

---

## 📋 Overview

**Current State:**
- ✅ Authentication (Login, Signup, Forgot Password) - COMPLETE
- ✅ Backend APIs - 50+ controllers implemented
- ❌ Frontend-Backend Integration - NEEDS WORK
- ❌ Core Features UI - NEEDS WORK
- ❌ Testing - Only 3 auth tests

**Target State:**
- ✅ All core features functional
- ✅ Frontend fully connected to backend
- ✅ Playwright E2E tests for all major flows
- ✅ Production-ready application

---

## 🎯 Implementation Strategy

1. **Day 1-2**: Core Features (Jobs, Bids, Projects)
2. **Day 3**: Advanced Features (Tasks, Time Tracking, Messaging)
3. **Day 4**: Payments, Invoicing, Admin Panel
4. **Day 5**: ML Features, Testing, Polish

**After each subtask:**
- ✅ Test manually
- ✅ Write/update Playwright test
- ✅ Commit & push to GitHub
- ✅ Mark subtask complete

---

## 📅 DAY 1: Core Marketplace Features

### Phase 1.1: API Client Completion (2 hours)
**Goal**: Complete all missing API functions in `frontend/src/lib/api.ts`

#### Subtasks:
- [ ] **1.1.1** Complete `projectsApi` (update, delete, create)
- [ ] **1.1.2** Add `tasksApi` (list, get, create, update, delete)
- [ ] **1.1.3** Add `milestonesApi` (list, get, create, update, delete)
- [ ] **1.1.4** Add `filesApi` (upload, download, delete, list)
- [ ] **1.1.5** Add `messagesApi` (list, send, get conversation)
- [ ] **1.1.6** Add `notificationsApi` (list, mark read, mark all read)
- [ ] **1.1.7** Add `invoicesApi` (list, get, create, update, delete)
- [ ] **1.1.8** Add `paymentsApi` (initiate, verify, list)
- [ ] **1.1.9** Add `adminApi` (users, analytics, settings)
- [ ] **1.1.10** Add `profilesApi` (get, update client/freelancer)
- [ ] **1.1.11** Add `timeLogsApi` (list, create, update, delete)
- [ ] **1.1.12** Add `mldocumentApi` (upload, process, get suggestions)
- [ ] **1.1.13** Test all API functions compile (TypeScript check)
- [ ] **1.1.14** Commit: `feat: complete API client functions`

**Deliverable**: Complete API client with all endpoints

---

### Phase 1.2: Public Job Browsing (1.5 hours)
**Goal**: Allow users to browse jobs without login

#### Subtasks:
- [ ] **1.2.1** Update `FindWorkPage.tsx` to fetch from `/api/jobs` (public)
- [ ] **1.2.2** Display job cards with: title, description, budget, deadline, category
- [ ] **1.2.3** Add filters: category, budget range, job type (fixed/hourly)
- [ ] **1.2.4** Add search functionality (title/description search)
- [ ] **1.2.5** Add pagination (if backend supports)
- [ ] **1.2.6** Show "Login to Bid" button if not authenticated
- [ ] **1.2.7** Test: Browse jobs without login
- [ ] **1.2.8** Write Playwright test: `browse-jobs.spec.ts`
- [ ] **1.2.9** Commit: `feat: public job browsing`

**Deliverable**: Users can browse jobs without login

---

### Phase 1.3: Job Detail Page (1.5 hours)
**Goal**: Display full job details, show bids if client, allow bidding if freelancer

#### Subtasks:
- [ ] **1.3.1** Update `JobDetailPage.tsx` to fetch job by ID
- [ ] **1.3.2** Display: title, description, budget, deadline, category, skills, client info
- [ ] **1.3.3** If user is job owner (client): Show bids list with accept/reject buttons
- [ ] **1.3.4** If user is freelancer: Show "Submit Bid" form
- [ ] **1.3.5** Implement bid submission (amount, proposal, estimated date)
- [ ] **1.3.6** Implement bid acceptance (creates project automatically)
- [ ] **1.3.7** Show "Login to Bid" if not authenticated
- [ ] **1.3.8** Test: View job, submit bid, accept bid
- [ ] **1.3.9** Write Playwright test: `job-detail-bidding.spec.ts`
- [ ] **1.3.10** Commit: `feat: job detail and bidding`

**Deliverable**: Full job detail page with bidding functionality

---

### Phase 1.4: Post Job Page (1 hour)
**Goal**: Allow clients to post new jobs

#### Subtasks:
- [ ] **1.4.1** Update `PostJobPage.tsx` to use real API
- [ ] **1.4.2** Form fields: title, description, budget, budgetType, deadline, category, skills
- [ ] **1.4.3** Fetch categories from `/api/job-categories`
- [ ] **1.4.4** Fetch skills from `/api/job-skills` (or create multi-select)
- [ ] **1.4.5** Submit to `/api/jobs` (POST)
- [ ] **1.4.6** Show success message and redirect to job detail
- [ ] **1.4.7** Handle validation errors
- [ ] **1.4.8** Test: Post a job as client
- [ ] **1.4.9** Write Playwright test: `post-job.spec.ts`
- [ ] **1.4.10** Commit: `feat: post job functionality`

**Deliverable**: Clients can post jobs

---

### Phase 1.5: Client Dashboard (1 hour)
**Goal**: Show client's jobs, projects, stats

#### Subtasks:
- [ ] **1.5.1** Update `ClientDashboard.tsx` to fetch real data
- [ ] **1.5.2** Fetch user's jobs: `/api/jobs/my-jobs`
- [ ] **1.5.3** Fetch user's projects: `/api/projects?clientId={userId}`
- [ ] **1.5.4** Display stats: total jobs, active projects, pending bids
- [ ] **1.5.5** Show recent jobs list (last 5)
- [ ] **1.5.6** Show recent projects list (last 5)
- [ ] **1.5.7** Add links to "View All Jobs", "View All Projects"
- [ ] **1.5.8** Test: View dashboard as client
- [ ] **1.5.9** Commit: `feat: client dashboard`

**Deliverable**: Functional client dashboard

---

### Phase 1.6: Freelancer Dashboard (1 hour)
**Goal**: Show freelancer's bids, projects, stats

#### Subtasks:
- [ ] **1.6.1** Update `FreelancerDashboard.tsx` to fetch real data
- [ ] **1.6.2** Fetch user's bids: `/api/bids?freelancerId={userId}`
- [ ] **1.6.3** Fetch user's projects: `/api/projects?freelancerId={userId}`
- [ ] **1.6.4** Display stats: active bids, active projects, earnings
- [ ] **1.6.5** Show recent bids list (last 5)
- [ ] **1.6.6** Show recent projects list (last 5)
- [ ] **1.6.7** Add links to "View All Bids", "View All Projects"
- [ ] **1.6.8** Test: View dashboard as freelancer
- [ ] **1.6.9** Commit: `feat: freelancer dashboard`

**Deliverable**: Functional freelancer dashboard

---

### Phase 1.7: My Jobs Page (Client) (1 hour)
**Goal**: List all client's jobs with filters

#### Subtasks:
- [ ] **1.7.1** Create/update `MyJobsPage.tsx`
- [ ] **1.7.2** Fetch jobs: `/api/jobs/my-jobs`
- [ ] **1.7.3** Display in table/cards: title, status, bids count, budget, deadline
- [ ] **1.7.4** Add filters: status (OPEN, CLOSED, IN_PROGRESS)
- [ ] **1.7.5** Add actions: View, Edit, Delete
- [ ] **1.7.6** Implement delete confirmation
- [ ] **1.7.7** Link to job detail page
- [ ] **1.7.8** Test: View, edit, delete jobs
- [ ] **1.7.9** Commit: `feat: my jobs page`

**Deliverable**: Client can manage their jobs

---

### Phase 1.8: My Bids Page (Freelancer) (1 hour)
**Goal**: List all freelancer's bids

#### Subtasks:
- [ ] **1.8.1** Create/update `MyBidsPage.tsx`
- [ ] **1.8.2** Fetch bids: `/api/bids?freelancerId={userId}`
- [ ] **1.8.3** Display in table/cards: job title, amount, status, date submitted
- [ ] **1.8.4** Add filters: status (PENDING, ACCEPTED, REJECTED)
- [ ] **1.8.5** Link to job detail page
- [ ] **1.8.6** Show bid status badges
- [ ] **1.8.7** Test: View bids as freelancer
- [ ] **1.8.8** Commit: `feat: my bids page`

**Deliverable**: Freelancer can view their bids

---

**Day 1 Total: ~10 hours**  
**End of Day 1**: Core marketplace features functional

---

## 📅 DAY 2: Project Management & Collaboration

### Phase 2.1: Project List Pages (1 hour)
**Goal**: Show all projects for client/freelancer

#### Subtasks:
- [ ] **2.1.1** Create/update `ClientProjectsPage.tsx`
- [ ] **2.1.2** Fetch projects: `/api/projects?clientId={userId}`
- [ ] **2.1.3** Display: title, freelancer, status, budget, deadline, progress
- [ ] **2.1.4** Create/update `FreelancerProjectsPage.tsx`
- [ ] **2.1.5** Fetch projects: `/api/projects?freelancerId={userId}`
- [ ] **2.1.6** Add filters: status
- [ ] **2.1.7** Link to project detail page
- [ ] **2.1.8** Test: View projects
- [ ] **2.1.9** Commit: `feat: project list pages`

**Deliverable**: Project listing pages

---

### Phase 2.2: Project Detail Page (2 hours)
**Goal**: Full project workspace with tasks, files, messages

#### Subtasks:
- [ ] **2.2.1** Update `ProjectDetailPage.tsx` or `ProjectWorkspace.tsx`
- [ ] **2.2.2** Fetch project: `/api/projects/{id}`
- [ ] **2.2.3** Display: title, description, client, freelancer, status, budget, deadline
- [ ] **2.2.4** Add tabs/sections: Overview, Tasks, Files, Messages, Milestones
- [ ] **2.2.5** Fetch and display tasks: `/api/tasks?projectId={id}`
- [ ] **2.2.6** Fetch and display milestones: `/api/milestones?projectId={id}`
- [ ] **2.2.7** Show project progress (based on tasks)
- [ ] **2.2.8** Add "Create Task" button (if user has permission)
- [ ] **2.2.9** Test: View project detail
- [ ] **2.2.10** Commit: `feat: project detail page`

**Deliverable**: Full project detail page

---

### Phase 2.3: Task Management (2 hours)
**Goal**: Create, view, update, delete tasks

#### Subtasks:
- [ ] **2.3.1** Create `TaskList.tsx` component
- [ ] **2.3.2** Fetch tasks: `/api/tasks?projectId={id}`
- [ ] **2.3.3** Display tasks in list/kanban view
- [ ] **2.3.4** Create `TaskForm.tsx` (create/edit modal)
- [ ] **2.3.5** Form fields: title, description, status, assignee, priority, dueDate
- [ ] **2.3.6** Create task: POST `/api/tasks`
- [ ] **2.3.7** Update task: PUT `/api/tasks/{id}`
- [ ] **2.3.8** Delete task: DELETE `/api/tasks/{id}`
- [ ] **2.3.9** Add task status change (drag-drop or dropdown)
- [ ] **2.3.10** Test: Create, update, delete tasks
- [ ] **2.3.11** Write Playwright test: `task-management.spec.ts`
- [ ] **2.3.12** Commit: `feat: task management`

**Deliverable**: Full task CRUD functionality

---

### Phase 2.4: Kanban Board (1.5 hours)
**Goal**: Visual kanban board for tasks

#### Subtasks:
- [ ] **2.4.1** Create `KanbanBoard.tsx` component
- [ ] **2.4.2** Group tasks by status (TODO, IN_PROGRESS, DONE)
- [ ] **2.4.3** Implement drag-drop (use @dnd-kit or similar)
- [ ] **2.4.4** Update task status on drop
- [ ] **2.4.5** Show task cards with: title, assignee, priority, due date
- [ ] **2.4.6** Click card to open task detail/edit
- [ ] **2.4.7** Add "Add Task" button per column
- [ ] **2.4.8** Test: Drag-drop tasks
- [ ] **2.4.9** Commit: `feat: kanban board`

**Deliverable**: Interactive kanban board

---

### Phase 2.5: Task Comments (1 hour)
**Goal**: Add comments to tasks

#### Subtasks:
- [ ] **2.5.1** Create `TaskComments.tsx` component
- [ ] **2.5.2** Fetch comments: `/api/comments?taskId={id}`
- [ ] **2.5.3** Display comments with: author, text, timestamp
- [ ] **2.5.4** Add comment form: text input + submit
- [ ] **2.5.5** Create comment: POST `/api/comments`
- [ ] **2.5.6** Show comment reactions (if backend supports)
- [ ] **2.5.7** Test: Add comments to tasks
- [ ] **2.5.8** Commit: `feat: task comments`

**Deliverable**: Comment functionality on tasks

---

### Phase 2.6: File Management (1.5 hours)
**Goal**: Upload, view, download files in projects

#### Subtasks:
- [ ] **2.6.1** Create `ProjectFiles.tsx` component
- [ ] **2.6.2** Fetch files: `/api/files?projectId={id}` (or similar endpoint)
- [ ] **2.6.3** Display files: name, size, uploader, date
- [ ] **2.6.4** Add file upload: POST `/api/files` (multipart/form-data)
- [ ] **2.6.5** Add file download: GET `/api/files/{id}/download`
- [ ] **2.6.6** Add file delete: DELETE `/api/files/{id}`
- [ ] **2.6.7** Show file preview (images, PDFs if possible)
- [ ] **2.6.8** Test: Upload, download, delete files
- [ ] **2.6.9** Commit: `feat: file management`

**Deliverable**: File upload/download functionality

---

### Phase 2.7: Messaging System (2 hours)
**Goal**: Real-time messaging between client and freelancer

#### Subtasks:
- [ ] **2.7.1** Update `MessagesPage.tsx` or create new component
- [ ] **2.7.2** Fetch conversations: `/api/conversations`
- [ ] **2.7.3** Display conversation list (client/freelancer name, last message, timestamp)
- [ ] **2.7.4** Fetch messages: `/api/messages?conversationId={id}`
- [ ] **2.7.5** Display messages: sender, text, timestamp
- [ ] **2.7.6** Add message input + send button
- [ ] **2.7.7** Send message: POST `/api/messages`
- [ ] **2.7.8** Implement WebSocket connection (if backend supports)
- [ ] **2.7.9** Show "typing..." indicator (if WebSocket available)
- [ ] **2.7.10** Test: Send/receive messages
- [ ] **2.7.11** Write Playwright test: `messaging.spec.ts`
- [ ] **2.7.12** Commit: `feat: messaging system`

**Deliverable**: Messaging functionality

---

### Phase 2.8: Milestones (1 hour)
**Goal**: Create and manage project milestones

#### Subtasks:
- [ ] **2.8.1** Create `MilestonesList.tsx` component
- [ ] **2.8.2** Fetch milestones: `/api/milestones?projectId={id}`
- [ ] **2.8.3** Display milestones: title, due date, status, progress
- [ ] **2.8.4** Create milestone form: title, description, due date
- [ ] **2.8.5** Create milestone: POST `/api/milestones`
- [ ] **2.8.6** Update milestone status: PUT `/api/milestones/{id}`
- [ ] **2.8.7** Test: Create, update milestones
- [ ] **2.8.8** Commit: `feat: milestones`

**Deliverable**: Milestone management

---

**Day 2 Total: ~11 hours**  
**End of Day 2**: Project management and collaboration features functional

---

## 📅 DAY 3: Time Tracking, Profiles, Notifications

### Phase 3.1: Time Tracking (2 hours)
**Goal**: Log time for tasks/projects

#### Subtasks:
- [ ] **3.1.1** Create `TimeTrackingPage.tsx`
- [ ] **3.1.2** Fetch time logs: `/api/time-logs?projectId={id}` or `/api/time-logs?freelancerId={id}`
- [ ] **3.1.3** Display time logs: task, date, hours, description
- [ ] **3.1.4** Create time log form: task, date, hours, description, category
- [ ] **3.1.5** Create time log: POST `/api/time-logs`
- [ ] **3.1.6** Update time log: PUT `/api/time-logs/{id}`
- [ ] **3.1.7** Delete time log: DELETE `/api/time-logs/{id}`
- [ ] **3.1.8** Add timer functionality (start/stop/pause) if backend supports
- [ ] **3.1.9** Show time summary (total hours per project/task)
- [ ] **3.1.10** Test: Log time, view time logs
- [ ] **3.1.11** Commit: `feat: time tracking`

**Deliverable**: Time tracking functionality

---

### Phase 3.2: Timer Component (1 hour)
**Goal**: Start/stop timer for tasks

#### Subtasks:
- [ ] **3.2.1** Create `TimerComponent.tsx`
- [ ] **3.2.2** Fetch active timer: GET `/api/timers/active` (if exists)
- [ ] **3.2.3** Start timer: POST `/api/timers/start` (taskId)
- [ ] **3.2.4** Stop timer: POST `/api/timers/{id}/stop`
- [ ] **3.2.5** Display running time (update every second)
- [ ] **3.2.6** Show current task being tracked
- [ ] **3.2.7** Add pause/resume if backend supports
- [ ] **3.2.8** Test: Start/stop timer
- [ ] **3.2.9** Commit: `feat: timer component`

**Deliverable**: Timer functionality

---

### Phase 3.3: Client Profile (1 hour)
**Goal**: View and edit client profile

#### Subtasks:
- [ ] **3.3.1** Create/update `ClientProfilePage.tsx`
- [ ] **3.3.2** Fetch profile: GET `/api/profiles/client/{userId}`
- [ ] **3.3.3** Display: company name, description, contact info, verification status
- [ ] **3.3.4** Edit form: company name, description, phone, address
- [ ] **3.3.5** Update profile: PUT `/api/profiles/client/{id}`
- [ ] **3.3.6** Upload documents for verification (if needed)
- [ ] **3.3.7** Test: View, edit client profile
- [ ] **3.3.8** Commit: `feat: client profile`

**Deliverable**: Client profile management

---

### Phase 3.4: Freelancer Profile (1.5 hours)
**Goal**: View and edit freelancer profile

#### Subtasks:
- [ ] **3.4.1** Update `FreelancerProfilePage.tsx`
- [ ] **3.4.2** Fetch profile: GET `/api/profiles/freelancer/{userId}`
- [ ] **3.4.3** Display: bio, skills, hourly rate, portfolio, experience, verification status
- [ ] **3.4.4** Edit form: bio, skills (multi-select), hourly rate, portfolio items
- [ ] **3.4.5** Update profile: PUT `/api/profiles/freelancer/{id}`
- [ ] **3.4.6** Upload portfolio items/documents
- [ ] **3.4.7** Show public profile view (for clients to see)
- [ ] **3.4.8** Test: View, edit freelancer profile
- [ ] **3.4.9** Commit: `feat: freelancer profile`

**Deliverable**: Freelancer profile management

---

### Phase 3.5: Notifications (1.5 hours)
**Goal**: Display and manage notifications

#### Subtasks:
- [ ] **3.5.1** Update `NotificationsDropdown.tsx`
- [ ] **3.5.2** Fetch notifications: GET `/api/notifications`
- [ ] **3.5.3** Display notifications: type, message, timestamp, read status
- [ ] **3.5.4** Mark as read: PUT `/api/notifications/{id}/read`
- [ ] **3.5.5** Mark all as read: PUT `/api/notifications/read-all`
- [ ] **3.5.6** Show unread count badge
- [ ] **3.5.7** Implement WebSocket for real-time notifications (if backend supports)
- [ ] **3.5.8** Add notification preferences (if backend supports)
- [ ] **3.5.9** Test: View, mark notifications as read
- [ ] **3.5.10** Commit: `feat: notifications`

**Deliverable**: Notification system

---

### Phase 3.6: Search Functionality (1 hour)
**Goal**: Global search across jobs, projects, users

#### Subtasks:
- [ ] **3.6.1** Create `SearchPage.tsx` or add search to header
- [ ] **3.6.2** Add search input with debounce
- [ ] **3.6.3** Call: GET `/api/search?q={query}` (if exists)
- [ ] **3.6.4** Display results: jobs, projects, users (grouped)
- [ ] **3.6.5** Add filters: type (jobs/projects/users)
- [ ] **3.6.6** Link to result pages
- [ ] **3.6.7** Test: Search functionality
- [ ] **3.6.8** Commit: `feat: search functionality`

**Deliverable**: Global search

---

### Phase 3.7: Saved Jobs (1 hour)
**Goal**: Allow freelancers to save jobs

#### Subtasks:
- [ ] **3.7.1** Add "Save Job" button on job detail page
- [ ] **3.7.2** Save job: POST `/api/saved-jobs` (jobId)
- [ ] **3.7.3** Create `SavedJobsPage.tsx`
- [ ] **3.7.4** Fetch saved jobs: GET `/api/saved-jobs`
- [ ] **3.7.5** Display saved jobs list
- [ ] **3.7.6** Remove saved job: DELETE `/api/saved-jobs/{id}`
- [ ] **3.7.7** Test: Save/unsave jobs
- [ ] **3.7.8** Commit: `feat: saved jobs`

**Deliverable**: Save jobs functionality

---

**Day 3 Total: ~9 hours**  
**End of Day 3**: Time tracking, profiles, notifications functional

---

## 📅 DAY 4: Payments, Invoicing, Admin Panel

### Phase 4.1: Invoice Management (2 hours)
**Goal**: Create, view, manage invoices

#### Subtasks:
- [ ] **4.1.1** Create `InvoicesPage.tsx` (for freelancers)
- [ ] **4.1.2** Fetch invoices: GET `/api/invoices?freelancerId={userId}`
- [ ] **4.1.3** Display invoices: number, amount, status, due date, client
- [ ] **4.1.4** Create `InvoiceDetailPage.tsx`
- [ ] **4.1.5** Fetch invoice: GET `/api/invoices/{id}`
- [ ] **4.1.6** Display invoice: items, amounts, total, status
- [ ] **4.1.7** Create `CreateInvoicePage.tsx` or modal
- [ ] **4.1.8** Form: project, items (description, quantity, rate), due date
- [ ] **4.1.9** Create invoice: POST `/api/invoices`
- [ ] **4.1.10** Download PDF: GET `/api/invoices/{id}/pdf` (if exists)
- [ ] **4.1.11** Test: Create, view invoices
- [ ] **4.1.12** Write Playwright test: `invoicing.spec.ts`
- [ ] **4.1.13** Commit: `feat: invoice management`

**Deliverable**: Invoice CRUD functionality

---

### Phase 4.2: Payment Integration (2.5 hours)
**Goal**: Integrate Khalti and eSewa payment gateways

#### Subtasks:
- [ ] **4.2.1** Create `PaymentPage.tsx` or payment modal
- [ ] **4.2.2** Show payment form: invoice, amount, gateway selection (Khalti/eSewa)
- [ ] **4.2.3** Initiate payment: POST `/api/payments/{id}/initiate` (gateway)
- [ ] **4.2.4** Handle payment redirect to gateway
- [ ] **4.2.5** Create `PaymentSuccessPage.tsx`
- [ ] **4.2.6** Verify payment: POST `/api/payments/verify/{transactionId}`
- [ ] **4.2.7** Create `PaymentFailurePage.tsx`
- [ ] **4.2.8** Show payment status and allow retry
- [ ] **4.2.9** Update invoice status after payment
- [ ] **4.2.10** Test: Payment flow (test mode)
- [ ] **4.2.11** Write Playwright test: `payments.spec.ts`
- [ ] **4.2.12** Commit: `feat: payment integration`

**Deliverable**: Payment gateway integration

---

### Phase 4.3: Escrow Management (1 hour)
**Goal**: View and manage escrow accounts

#### Subtasks:
- [ ] **4.3.1** Create `EscrowPage.tsx`
- [ ] **4.3.2** Fetch escrow: GET `/api/escrow?projectId={id}` or user escrow
- [ ] **4.3.3** Display escrow: project, amount, status, releases
- [ ] **4.3.4** Show release history
- [ ] **4.3.5** Add "Release Funds" button (if client)
- [ ] **4.3.6** Release funds: POST `/api/escrow/{id}/release`
- [ ] **4.3.7** Test: View escrow, release funds
- [ ] **4.3.8** Commit: `feat: escrow management`

**Deliverable**: Escrow functionality

---

### Phase 4.4: Admin Dashboard (1.5 hours)
**Goal**: Admin overview with stats

#### Subtasks:
- [ ] **4.4.1** Update `AdminDashboard.tsx`
- [ ] **4.4.2** Fetch stats: GET `/api/admin/dashboard/stats`
- [ ] **4.4.3** Display: total users, jobs, projects, revenue, pending verifications
- [ ] **4.4.4** Add charts (use chart component if available)
- [ ] **4.4.5** Show recent activity
- [ ] **4.4.6** Add quick links to: users, verifications, payments
- [ ] **4.4.7** Test: View admin dashboard
- [ ] **4.4.8** Commit: `feat: admin dashboard`

**Deliverable**: Admin dashboard with stats

---

### Phase 4.5: Admin User Management (1.5 hours)
**Goal**: Admin can manage users

#### Subtasks:
- [ ] **4.5.1** Create/update `AdminUserManagementPage.tsx`
- [ ] **4.5.2** Fetch users: GET `/api/admin/users`
- [ ] **4.5.3** Display users table: name, email, role, status, verification
- [ ] **4.5.4** Add filters: role, status, verification
- [ ] **4.5.5** Create user: POST `/api/admin/users`
- [ ] **4.5.6** Update user: PUT `/api/admin/users/{id}`
- [ ] **4.5.7** Delete user: DELETE `/api/admin/users/{id}` (with confirmation)
- [ ] **4.5.8** Test: CRUD users as admin
- [ ] **4.5.9** Commit: `feat: admin user management`

**Deliverable**: Admin user management

---

### Phase 4.6: Admin Verification Queue (1 hour)
**Goal**: Admin approves/rejects profile verifications

#### Subtasks:
- [ ] **4.6.1** Create `AdminVerificationPage.tsx`
- [ ] **4.6.2** Fetch pending verifications: GET `/api/admin/verifications/pending`
- [ ] **4.6.3** Display verification requests: user, profile type, documents
- [ ] **4.6.4** Show uploaded documents (download/view)
- [ ] **4.6.5** Approve: POST `/api/admin/verifications/{id}/approve`
- [ ] **4.6.6** Reject: POST `/api/admin/verifications/{id}/reject` (with reason)
- [ ] **4.6.7** Test: Approve/reject verifications
- [ ] **4.6.8** Commit: `feat: admin verification queue`

**Deliverable**: Verification workflow

---

### Phase 4.7: Admin Analytics (1 hour)
**Goal**: Platform analytics for admin

#### Subtasks:
- [ ] **4.7.1** Create `AdminAnalyticsPage.tsx`
- [ ] **4.7.2** Fetch analytics: GET `/api/admin/analytics`
- [ ] **4.7.3** Display: user growth, job postings, revenue, active projects
- [ ] **4.7.4** Add charts: line chart (growth), pie chart (roles), bar chart (revenue)
- [ ] **4.7.5** Add date range filters
- [ ] **4.7.6** Test: View analytics
- [ ] **4.7.7** Commit: `feat: admin analytics`

**Deliverable**: Admin analytics page

---

**Day 4 Total: ~10 hours**  
**End of Day 4**: Payments, invoicing, admin panel functional

---

## 📅 DAY 5: ML Features, Testing, Polish

### Phase 5.1: ML Document Upload (1.5 hours)
**Goal**: Upload documents and extract tasks

#### Subtasks:
- [ ] **5.1.1** Create `MLDocumentUpload.tsx` component
- [ ] **5.1.2** Add file upload (PDF, images)
- [ ] **5.1.3** Upload: POST `/api/mldocuments/upload` (multipart/form-data)
- [ ] **5.1.4** Process document: POST `/api/mldocuments/{id}/process`
- [ ] **5.1.5** Show processing status (loading)
- [ ] **5.1.6** Fetch suggestions: GET `/api/mldocuments/{id}/suggestions`
- [ ] **5.1.7** Display suggested tasks: title, description, confidence
- [ ] **5.1.8** Allow user to review and accept/reject suggestions
- [ ] **5.1.9** Create tasks from suggestions: POST `/api/mldocuments/{id}/create-tasks`
- [ ] **5.1.10** Test: Upload document, extract tasks
- [ ] **5.1.11** Commit: `feat: ML document task extraction`

**Deliverable**: ML document processing

---

### Phase 5.2: Reports & Exports (1 hour)
**Goal**: Export reports (CSV/PDF)

#### Subtasks:
- [ ] **5.2.1** Create `ReportsPage.tsx`
- [ ] **5.2.2** Add export options: Projects, Tasks, Time Logs
- [ ] **5.2.3** Export CSV: GET `/api/reports/projects/csv` (or similar)
- [ ] **5.2.4** Export PDF: GET `/api/reports/projects/pdf`
- [ ] **5.2.5** Add date range filters
- [ ] **5.2.6** Show download links/buttons
- [ ] **5.2.7** Test: Export reports
- [ ] **5.2.8** Commit: `feat: reports and exports`

**Deliverable**: Report export functionality

---

### Phase 5.3: Playwright E2E Tests (3 hours)
**Goal**: Comprehensive E2E test coverage

#### Subtasks:
- [ ] **5.3.1** Test: Complete job posting flow (client)
- [ ] **5.3.2** Test: Complete bidding flow (freelancer)
- [ ] **5.3.3** Test: Project creation from accepted bid
- [ ] **5.3.4** Test: Task creation and management
- [ ] **5.3.5** Test: Time logging
- [ ] **5.3.6** Test: Invoice creation and payment
- [ ] **5.3.7** Test: Messaging between client and freelancer
- [ ] **5.3.8** Test: File upload/download
- [ ] **5.3.9** Test: Admin user management
- [ ] **5.3.10** Test: Profile verification workflow
- [ ] **5.3.11** Run all tests and fix failures
- [ ] **5.3.12** Commit: `test: add E2E tests`

**Deliverable**: Comprehensive test suite

---

### Phase 5.4: Bug Fixes & Polish (2 hours)
**Goal**: Fix bugs and improve UX

#### Subtasks:
- [ ] **5.4.1** Fix any TypeScript errors
- [ ] **5.4.2** Fix any console errors
- [ ] **5.4.3** Add loading states where missing
- [ ] **5.4.4** Add error handling where missing
- [ ] **5.4.5** Improve error messages
- [ ] **5.4.6** Add empty states (no data messages)
- [ ] **5.4.7** Improve mobile responsiveness
- [ ] **5.4.8** Add tooltips where helpful
- [ ] **5.4.9** Test all major flows manually
- [ ] **5.4.10** Commit: `fix: bug fixes and polish`

**Deliverable**: Polished application

---

### Phase 5.5: Documentation Update (1 hour)
**Goal**: Update documentation

#### Subtasks:
- [ ] **5.5.1** Update `PROJECT_STATUS.md` with completion status
- [ ] **5.5.2** Update `CHANGELOG.md` with all changes
- [ ] **5.5.3** Create `TESTING_GUIDE.md` (if not exists)
- [ ] **5.5.4** Update `README.md` if needed
- [ ] **5.5.5** Commit: `docs: update documentation`

**Deliverable**: Updated documentation

---

**Day 5 Total: ~8.5 hours**  
**End of Day 5**: Complete application ready for demo

---

## 📊 Summary

### Total Estimated Time: ~48.5 hours over 5 days

### Daily Breakdown:
- **Day 1**: 10 hours - Core Marketplace
- **Day 2**: 11 hours - Project Management
- **Day 3**: 9 hours - Time Tracking & Profiles
- **Day 4**: 10 hours - Payments & Admin
- **Day 5**: 8.5 hours - ML, Testing, Polish

### Key Deliverables:
1. ✅ Complete API client integration
2. ✅ All core features functional
3. ✅ Payment gateway integration
4. ✅ Admin panel complete
5. ✅ ML document processing
6. ✅ Comprehensive E2E tests
7. ✅ Production-ready application

---

## ✅ Success Criteria

- [ ] All subtasks completed
- [ ] All Playwright tests passing
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All features tested manually
- [ ] All commits pushed to GitHub
- [ ] Documentation updated

---

## 📝 Notes

- **After each subtask**: Test → Commit → Push → Mark Complete
- **Commit format**: `feat:`, `fix:`, `test:`, `docs:` prefixes
- **Keep commits small**: One feature per commit
- **Test thoroughly**: Don't skip manual testing
- **Ask for help**: If stuck on a subtask, ask immediately

---

**Let's build this! 🚀**

