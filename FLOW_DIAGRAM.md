# SajiloKaam - Complete Job-to-Project Flow Diagram

## System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SAJILOKAAM PLATFORM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT JOURNEY                              │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   Client     │
    │   Login      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Client     │
    │  Dashboard   │
    └──────┬───────┘
           │
           │ Click "Post a Job"
           ▼
    ┌──────────────────────────────────────┐
    │       PostJobPage (Multi-step)       │
    ├──────────────────────────────────────┤
    │ Step 1: Basic Info                   │
    │  - Title, Category, Description      │
    │  - Skills                            │
    ├──────────────────────────────────────┤
    │ Step 2: Budget & Timeline            │
    │  - Budget Type (Fixed/Hourly)        │
    │  - Amount in Rs.                     │
    │  - Project Length                    │
    │  - Location                          │
    ├──────────────────────────────────────┤
    │ Step 3: Requirements                 │
    │  - Requirements list                 │
    │  - Deliverables list                 │
    │  - Experience Level                  │
    ├──────────────────────────────────────┤
    │ Step 4: Review & Submit              │
    │  - Preview all details               │
    │  - Submit to backend                 │
    └──────────────┬───────────────────────┘
                   │
                   │ POST /api/jobs
                   ▼
            ┌──────────────┐
            │   Backend    │
            │  Creates Job │
            └──────┬───────┘
                   │
                   │ Job saved to database
                   ▼
            ┌──────────────┐
            │   Database   │
            │  jobs table  │
            └──────┬───────┘
                   │
                   │ Success response
                   ▼
    ┌──────────────────────────┐
    │  Client Dashboard        │
    │  - Job appears in list   │
    │  - Status: OPEN          │
    │  - Proposals: 0          │
    └──────────────────────────┘
           │
           │ Wait for proposals...
           │
           │ GET /api/jobs/{jobId}/bids
           ▼
    ┌──────────────────────────┐
    │  Proposals appear!       │
    │  "3 Proposals" button    │
    └──────┬───────────────────┘
           │
           │ Click "3 Proposals"
           ▼
    ┌──────────────────────────────────────┐
    │      ProposalsListPage               │
    ├──────────────────────────────────────┤
    │  Proposal 1:                         │
    │  - Freelancer: John Doe              │
    │  - Bid: Rs. 45,000                   │
    │  - Cover Letter: "I am..."           │
    │  - [Accept Proposal] [View Details]  │
    ├──────────────────────────────────────┤
    │  Proposal 2:                         │
    │  - Freelancer: Jane Smith            │
    │  - Bid: Rs. 50,000                   │
    │  - Cover Letter: "I have..."         │
    │  - [Accept Proposal] [View Details]  │
    └──────────────┬───────────────────────┘
                   │
                   │ Click "Accept Proposal"
                   │
                   │ POST /api/projects/accept-bid/{bidId}
                   ▼
            ┌──────────────────┐
            │     Backend      │
            │  1. Update bid   │
            │     status to    │
            │     ACCEPTED     │
            │  2. Create       │
            │     project      │
            └──────┬───────────┘
                   │
                   │ Project created
                   ▼
            ┌──────────────┐
            │   Database   │
            │  - bids      │
            │  - projects  │
            └──────┬───────┘
                   │
                   │ Success response
                   ▼
    ┌──────────────────────────┐
    │  Client Dashboard        │
    │  - Active Projects: 1    │
    │  - New project appears   │
    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                           FREELANCER JOURNEY                             │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ Freelancer   │
    │   Login      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Freelancer   │
    │  Dashboard   │
    └──────┬───────┘
           │
           │ Click "Find Work"
           ▼
    ┌──────────────────────────────────────┐
    │       FindWorkPage                   │
    │  - List of available jobs            │
    │  - Filter by category, budget, etc.  │
    │  - Search functionality              │
    └──────┬───────────────────────────────┘
           │
           │ Click on a job card
           │
           │ GET /api/jobs/{id}
           ▼
    ┌──────────────────────────────────────┐
    │       JobDetailPage                  │
    ├──────────────────────────────────────┤
    │  Job Title: Build React Dashboard    │
    │  Budget: Rs. 50,000 (Fixed)          │
    │  Location: Remote                    │
    │  Skills: React, TypeScript, CSS      │
    │  Description: Full description...    │
    │  Requirements: List of requirements  │
    │  Deliverables: List of deliverables  │
    │                                      │
    │  [Submit Proposal] [♥ Save]          │
    └──────┬───────────────────────────────┘
           │
           │ Click "Submit Proposal"
           ▼
    ┌──────────────────────────────────────┐
    │      ProposalForm (Modal)            │
    ├──────────────────────────────────────┤
    │  Cover Letter:                       │
    │  ┌────────────────────────────────┐  │
    │  │ Dear Client,                   │  │
    │  │ I am excited to apply...       │  │
    │  │ (min 100 characters)           │  │
    │  └────────────────────────────────┘  │
    │                                      │
    │  Your Bid:                           │
    │  ┌────────────┐  ┌───────────────┐  │
    │  │ Fixed Price│  │ Hourly Rate   │  │
    │  └────────────┘  └───────────────┘  │
    │  Rs. [45,000]                        │
    │                                      │
    │  Delivery Time:                      │
    │  [7] [Days ▼]                        │
    │                                      │
    │  ┌────────────────────────────────┐  │
    │  │ Your bid:      Rs. 45,000      │  │
    │  │ Platform fee:  -Rs. 4,500      │  │
    │  │ ──────────────────────────────  │  │
    │  │ You'll receive: Rs. 40,500     │  │
    │  └────────────────────────────────┘  │
    │                                      │
    │  Milestones (Optional)               │
    │  Attachments (Optional)              │
    │                                      │
    │  [Cancel] [Submit Proposal]          │
    └──────┬───────────────────────────────┘
           │
           │ Click "Submit Proposal"
           │
           │ POST /api/jobs/{jobId}/bids
           ▼
            ┌──────────────┐
            │   Backend    │
            │  Creates Bid │
            └──────┬───────┘
                   │
                   │ Bid saved to database
                   ▼
            ┌──────────────┐
            │   Database   │
            │  bids table  │
            └──────┬───────┘
                   │
                   │ Success response
                   ▼
    ┌──────────────────────────┐
    │  Freelancer Dashboard    │
    │  - Recent Proposals: 1   │
    │  - Status: PENDING       │
    └──────────────────────────┘
           │
           │ Wait for client to accept...
           │
           │ When accepted:
           ▼
    ┌──────────────────────────┐
    │  Freelancer Dashboard    │
    │  - Active Projects: 1    │
    │  - New project appears   │
    │  - Status: IN_PROGRESS   │
    └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │    users     │
    │  (clients &  │
    │ freelancers) │
    └──────┬───────┘
           │
           │ 1:N (client posts many jobs)
           ▼
    ┌──────────────┐
    │     jobs     │
    │  - title     │
    │  - budget    │
    │  - status    │
    │  - client_id │
    └──────┬───────┘
           │
           │ 1:N (job receives many bids)
           ▼
    ┌──────────────┐
    │     bids     │
    │  - job_id    │
    │  - freelancer│
    │  - amount    │
    │  - status    │
    │  - message   │
    └──────┬───────┘
           │
           │ When bid is accepted:
           │ 1:1 (bid creates one project)
           ▼
    ┌──────────────┐
    │   projects   │
    │  - job_id    │
    │  - title     │
    │  - status    │
    └──────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          API ENDPOINTS FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

CLIENT ACTIONS:
1. POST   /api/jobs                    → Create job
2. GET    /api/jobs                    → List all jobs (with filters)
3. GET    /api/jobs/{id}               → Get job details
4. GET    /api/jobs/{jobId}/bids       → List proposals for job
5. POST   /api/projects/accept-bid/{bidId} → Accept proposal & create project
6. GET    /api/projects                → List client's projects

FREELANCER ACTIONS:
1. GET    /api/jobs                    → Browse available jobs
2. GET    /api/jobs/{id}               → View job details
3. POST   /api/jobs/{jobId}/bids       → Submit proposal
4. GET    /api/bids                    → List own proposals
5. GET    /api/projects                → List assigned projects


┌─────────────────────────────────────────────────────────────────────────┐
│                          STATE TRANSITIONS                               │
└─────────────────────────────────────────────────────────────────────────┘

JOB STATUS:
    OPEN → CLOSED (when proposal accepted)
    OPEN → CANCELLED (by client)

BID STATUS:
    PENDING → ACCEPTED (when client accepts)
    PENDING → REJECTED (when client rejects)

PROJECT STATUS:
    (Created) → IN_PROGRESS → COMPLETED → CLOSED
              ↓
           CANCELLED


┌─────────────────────────────────────────────────────────────────────────┐
│                       COMPONENT HIERARCHY                                │
└─────────────────────────────────────────────────────────────────────────┘

App
├── Router
│   ├── Header
│   │   └── User dropdown (with role-based navigation)
│   │
│   ├── CLIENT ROUTES:
│   │   ├── ClientDashboard
│   │   │   ├── Overview (stats, recent jobs, recent projects)
│   │   │   ├── Active Projects
│   │   │   ├── Posted Jobs (with proposal counts)
│   │   │   └── Payments
│   │   │
│   │   ├── PostJobPage (multi-step form)
│   │   │   ├── Step 1: Basic Info
│   │   │   ├── Step 2: Budget & Timeline
│   │   │   ├── Step 3: Requirements
│   │   │   └── Step 4: Review
│   │   │
│   │   ├── ProposalsListPage
│   │   │   └── List of proposals with accept/reject actions
│   │   │
│   │   └── ClientProfilePage (multi-step)
│   │
│   ├── FREELANCER ROUTES:
│   │   ├── FreelancerDashboard
│   │   │   ├── Overview (stats, active projects, proposals)
│   │   │   ├── Active Projects
│   │   │   └── Earnings
│   │   │
│   │   ├── FindWorkPage
│   │   │   └── Job listings with filters
│   │   │
│   │   ├── JobDetailPage
│   │   │   └── ProposalForm (modal)
│   │   │
│   │   └── FreelancerProfilePage
│   │
│   ├── SHARED ROUTES:
│   │   ├── MessagesPage
│   │   ├── ProjectDetailPage
│   │   └── AccountSettingsPage
│   │
│   └── Footer
│
└── AuthContext (provides authentication state)


┌─────────────────────────────────────────────────────────────────────────┐
│                          SUCCESS METRICS                                 │
└─────────────────────────────────────────────────────────────────────────┘

✅ Complete flow from job posting to project creation
✅ All currency displays in Rs. (Nepali Rupees)
✅ Real-time proposal counts on client dashboard
✅ Smooth user experience with loading states
✅ Proper error handling and user feedback
✅ Role-based access control (client vs freelancer)
✅ Responsive design for all screen sizes
✅ Database persistence for all entities
✅ RESTful API design
✅ JWT-based authentication
