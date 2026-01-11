# SajiloKaam - Critical Flow Testing Guide

## 🎯 GOAL: Complete flow from Job Posting to Project Start

---

## ✅ PRE-REQUISITES
- [ ] Backend running (port 8080)
- [ ] Frontend running (port 5173)
- [ ] Database seeded with categories and skills
- [ ] At least 2 users: 1 client, 1 freelancer

---

## 📋 CRITICAL PATH TEST SCENARIOS

### **SCENARIO 1: CLIENT POSTS A JOB**

**User:** Client
**Steps:**
1. Login as client
2. Navigate to "Post Job"
3. **Step 1 - Job Details:**
   - Enter job title
   - Select category from dropdown
   - Enter description
4. **Step 2 - Budget & Timeline:**
   - Select budget type (Fixed/Hourly)
   - Enter budget amount
   - Enter duration
   - Select experience level
   - Enter location
5. **Step 3 - Skills & Requirements:**
   - Select skills from dropdown OR type custom skills
   - Add requirements
   - Add deliverables
6. **Step 4 - Review & Post:**
   - Review all details
   - Click "Post Job"

**Expected Result:**
- ✅ Job created successfully
- ✅ Redirected to job detail page
- ✅ Skills visible (both database + custom)
- ✅ All fields display correctly

---

### **SCENARIO 2: FREELANCER VIEWS & BIDS ON JOB**

**User:** Freelancer
**Steps:**
1. Login as freelancer
2. Navigate to "Find Work"
3. Browse jobs (filter by category/skills optional)
4. Click on a job to view details
5. Click "Submit Proposal"
6. **In Proposal Form:**
   - Write cover letter (min 100 characters)
   - Enter bid amount
   - Set delivery time
   - Click "Submit Proposal"

**Expected Result:**
- ✅ Proposal submitted successfully
- ✅ Redirected to freelancer dashboard
- ✅ Proposal visible in "Recent Proposals" section

---

### **SCENARIO 3: CLIENT REVIEWS & ACCEPTS PROPOSAL**

**User:** Client
**Steps:**
1. Login as client
2. Go to Client Dashboard
3. Find the job in "Recent Job Postings"
4. Click "View Proposals" button
5. **On Proposals List Page:**
   - See all submitted proposals
   - Review freelancer details, bid amount, cover letter
   - Click "Accept Proposal" on desired bid

**Expected Result:**
- ✅ Proposal accepted successfully
- ✅ Project created automatically
- ✅ Proposal status changed to "ACCEPTED"
- ✅ Project visible in "Active Projects"

---

### **SCENARIO 4: VERIFY PROJECT CREATED**

**User:** Both Client & Freelancer
**Steps:**
1. **Client Dashboard:**
   - Check "Active Projects" section
   - Should see new project with freelancer name
2. **Freelancer Dashboard:**
   - Check "Active Projects" section
   - Should see new project with client name

**Expected Result:**
- ✅ Project visible to both parties
- ✅ Project status: "IN_PROGRESS"
- ✅ All project details correct

---

## 🔍 CURRENT STATUS

### ✅ WORKING Features:
1. **Authentication:** Login/Signup with role selection
2. **Job Posting:** Full 4-step form with custom skills
3. **Job Browsing:** Filter and view jobs
4. **Proposal Submission:** Freelancers can bid
5. **Proposal Review:** Clients can view all bids
6. **Proposal Acceptance:** Creates project automatically
7. **Skills System:** Database + custom skills support
8. **Profile Management:** Both client and freelancer profiles

### ⚠️ KNOWN ISSUES:
1. **Payment Flow:** Currently, project is created without payment
   - eSewa integration exists but not linked to proposal acceptance
   - Should add payment step before or after project creation
2. **Proposal Count:** Not showing on job cards yet
3. **Connects System:** Backend ready, frontend not integrated

### 💡 RECOMMENDED NEXT STEPS:
1. **Test the complete flow** (Scenarios 1-4)
2. **Fix any issues** found during testing
3. **Add payment flow** if required by business logic
4. **Polish UI/UX** for production readiness

---

## 🚀 QUICK TEST COMMANDS

```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Check if skills were seeded
curl http://localhost:8080/api/job-skills | head -100

# Check if categories exist
curl http://localhost:8080/api/job-categories
```

---

## 📝 TEST ACCOUNTS

**Client:**
- Email: client1@example.com
- Password: password

**Freelancer:**
- Email: freelancer1@example.com
- Password: password

**Admin:**
- Email: admin@sajilokaam.com
- Password: admin123

---

## ✅ SUCCESS CRITERIA

The flow is **COMPLETE** when:
1. ✅ Client can post job with skills
2. ✅ Freelancer can view and bid on job
3. ✅ Client can view proposals with all details
4. ✅ Client can accept proposal
5. ✅ Project is created and visible to both parties
6. ✅ No errors in browser console or backend logs
7. ✅ All data persists (refresh page, data still there)

---

## 🐛 DEBUGGING TIPS

**If job posting fails:**
- Check browser console for errors
- Verify category and skills are loaded
- Check backend logs: `docker logs sajilokaam-backend --tail 50`

**If proposal submission fails:**
- Verify freelancer is logged in
- Check if job owner is trying to bid (should be blocked)
- Verify backend accepts bid API call

**If proposal acceptance fails:**
- Check if project creation API works
- Verify client owns the job
- Check backend logs for errors

---

**Last Updated:** 2026-01-11
**Status:** Ready for Testing 🧪
