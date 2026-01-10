# Complete Job-to-Project Flow Testing Guide

This guide walks you through testing the complete flow from job posting to project creation in SajiloKaam.

## Prerequisites

1. **Backend Running**: Ensure Spring Boot backend is running on `http://localhost:8080`
2. **Frontend Running**: Ensure React frontend is running on `http://localhost:5173`
3. **Database**: MySQL database should be running with all migrations applied
4. **Test Accounts**: You'll need both a client and freelancer account

## Flow Overview

```
Client Posts Job → Freelancer Views Job → Freelancer Submits Proposal → 
Client Views Proposals → Client Accepts Proposal → Project Created
```

## Step-by-Step Testing

### 1. Client Posts a Job

**As Client:**

1. Navigate to `http://localhost:5173/login`
2. Login with a client account
3. Click "Post a Job" button in the header or dashboard
4. Fill out the job posting form:
   - **Step 1 - Basic Info:**
     - Job Title: "Build a React Dashboard"
     - Category: Select "Web Development"
     - Description: Detailed project description
     - Skills: Add relevant skills (e.g., React, TypeScript, CSS)
   
   - **Step 2 - Budget & Timeline:**
     - Budget Type: Fixed Price or Hourly
     - Budget: Rs. 50,000 (or hourly rate)
     - Project Length: 1-3 months
     - Location: "Remote" or specific location
   
   - **Step 3 - Requirements:**
     - Requirements: List project requirements (one per line)
     - Deliverables: List expected deliverables (one per line)
     - Experience Level: Intermediate
   
   - **Step 4 - Review:**
     - Review all details
     - Click "Post Job"

5. **Expected Result:** 
   - Success toast: "Job posted successfully!"
   - Redirected to client dashboard
   - New job appears in "Recent Job Postings"

### 2. Freelancer Views Job

**As Freelancer:**

1. Logout from client account
2. Login with a freelancer account
3. Navigate to "Find Work" page
4. **Expected Result:**
   - See the newly posted job in the job listings
   - Job shows correct title, budget, skills, and location
5. Click on the job card to view details
6. **Expected Result:**
   - Job detail page opens with full information
   - "Submit Proposal" button is visible (not "Login to Apply")
   - All job details are correctly displayed:
     - Budget shows as single value for fixed price (not range)
     - Required skills are displayed
     - Location shows correctly (not "Remote" default)

### 3. Freelancer Submits Proposal

**As Freelancer (continued):**

1. On the job detail page, click "Submit Proposal"
2. Fill out the proposal form:
   - **Cover Letter:** Write at least 100 characters explaining why you're a good fit
   - **Your Bid:** Enter your bid amount (e.g., Rs. 45,000)
   - **Bid Type:** Fixed Price or Hourly (should match job type)
   - **Delivery Time:** Enter delivery time (e.g., 7 days)
   - **Attachments (Optional):** Upload portfolio samples
   - **Milestones (Optional):** Add milestones if fixed price

3. **Expected Result:**
   - Platform fee (10%) is calculated and displayed
   - "You'll receive" amount is shown (90% of bid)
   - All amounts display in "Rs." (not "$")
   
4. Click "Submit Proposal"
5. **Expected Result:**
   - Success toast: "Proposal submitted successfully!"
   - Redirected to freelancer dashboard
   - Proposal appears in "Recent Proposals" section

### 4. Client Views Proposals

**As Client:**

1. Logout from freelancer account
2. Login with the client account
3. Navigate to client dashboard
4. **Expected Result:**
   - Posted job shows a button: "1 Proposal" (or more if multiple)
   
5. Click "1 Proposal" button or "View All" for job postings
6. **Expected Result:**
   - Redirected to proposals list page
   - URL: `http://localhost:5173/proposals-list?jobId=X`
   - See all proposals for this job:
     - Freelancer name and email
     - Bid amount in Rs.
     - Cover letter
     - Submission date
     - Status badge (PENDING)

### 5. Client Accepts Proposal

**As Client (continued):**

1. On the proposals list page, review the proposal
2. Click "Accept Proposal" button
3. **Expected Result:**
   - Button shows "Accepting..." while processing
   - Success toast: "Proposal accepted! Project has been created."
   - Proposal status changes to "ACCEPTED"
   - Redirected to client dashboard

4. On the dashboard, check "Active Projects" section
5. **Expected Result:**
   - New project appears in "Active Projects"
   - Project title matches the job title
   - Project shows the freelancer assigned
   - Budget matches the accepted proposal amount

### 6. Verify Project Creation

**As Client:**

1. Navigate to "Active Projects" section in dashboard
2. Click on the newly created project
3. **Expected Result:**
   - Project detail page opens
   - Shows project information
   - Shows freelancer details
   - Shows budget and timeline

**As Freelancer:**

1. Logout and login as the freelancer
2. Navigate to freelancer dashboard
3. **Expected Result:**
   - New project appears in "Active Projects"
   - Project shows client information
   - Shows accepted bid amount

## Expected Behaviors

### Currency Display
- ✅ All amounts should display as "Rs." (Nepali Rupees)
- ✅ No "$" symbols anywhere in the flow

### Job Details Display
- ✅ Fixed price jobs show single amount (not "Rs. X - Rs. X")
- ✅ Required skills are displayed correctly
- ✅ Location shows specified location or "Not specified" (not "Remote" default)

### Proposal Submission
- ✅ Cover letter requires minimum 100 characters
- ✅ Platform fee (10%) is calculated and shown
- ✅ "You'll receive" shows 90% of bid amount

### Proposal Acceptance
- ✅ Only client who posted the job can accept proposals
- ✅ Accepting a proposal creates a project
- ✅ Bid status changes to "ACCEPTED"
- ✅ Other pending bids remain in "PENDING" status

### Dashboard Updates
- ✅ Client dashboard shows proposal count for open jobs
- ✅ Accepted proposals appear as active projects
- ✅ Stats update correctly (total jobs, active projects, etc.)

## Common Issues & Troubleshooting

### Issue: "Submit Proposal" button not showing
- **Solution:** Ensure you're logged in as a freelancer, not a client

### Issue: Proposal count not showing on dashboard
- **Solution:** Refresh the page or check if proposals are in "PENDING" status

### Issue: Error accepting proposal
- **Solution:** 
  - Check backend logs for errors
  - Ensure you're logged in as the client who posted the job
  - Verify the bid is in "PENDING" status

### Issue: Project not created after accepting proposal
- **Solution:**
  - Check backend endpoint: `POST /api/projects/accept-bid/{bidId}`
  - Verify database has the project record
  - Check browser console for errors

### Issue: Currency showing as "$" instead of "Rs."
- **Solution:** Clear browser cache and refresh

## API Endpoints Used

1. **POST** `/api/jobs` - Create job
2. **GET** `/api/jobs` - List jobs
3. **GET** `/api/jobs/{id}` - Get job details
4. **GET** `/api/jobs/{jobId}/bids` - List proposals for a job
5. **POST** `/api/jobs/{jobId}/bids` - Submit proposal
6. **POST** `/api/projects/accept-bid/{bidId}` - Accept proposal and create project
7. **GET** `/api/projects` - List projects

## Database Tables Involved

1. `jobs` - Job postings
2. `bids` - Proposals/bids
3. `projects` - Created projects
4. `users` - Client and freelancer accounts
5. `job_categories` - Job categories
6. `skills` - Skills required for jobs

## Success Criteria

✅ Client can post a job with all details
✅ Freelancer can view the job in "Find Work"
✅ Freelancer can submit a proposal with cover letter and bid
✅ Client can view all proposals for their job
✅ Client can accept a proposal
✅ Accepting a proposal creates a project
✅ Project appears in both client and freelancer dashboards
✅ All currency displays as "Rs."
✅ All data persists correctly in the database

## Next Steps After This Flow

After completing this flow, the system is ready for:
- Project management features (tasks, milestones, deliverables)
- Messaging between client and freelancer
- Payment processing and escrow
- Time tracking for hourly projects
- Project completion and review system
