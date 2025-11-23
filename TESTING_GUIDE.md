# Testing Guide - SajiloKaam Application

This guide will help you test all the newly implemented features and ensure everything works correctly.

## 🚀 Quick Start - Running the Application

### Option 1: Docker Compose (Recommended)
```bash
# From the project root directory
docker-compose up --build
```

This will start:
- MySQL database on port 3306
- Backend API on http://localhost:8080
- Frontend on http://localhost:5173
- phpMyAdmin on http://localhost:8081
- ML Service on http://localhost:5000

### Option 2: Local Development
```bash
# Terminal 1: Start MySQL (if not using Docker)
# Or use Docker just for MySQL:
docker-compose up mysql phpmyadmin

# Terminal 2: Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### Access Points
- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Health Check**: http://localhost:8080/actuator/health
- **phpMyAdmin**: http://localhost:8081

---

## 🧪 Testing Checklist

### 1. Authentication & Basic Setup
- [ ] **Sign Up**: Create a new user account
- [ ] **Login**: Login with credentials
- [ ] **Logout**: Verify logout works
- [ ] **Protected Routes**: Try accessing protected pages without login (should redirect)

### 2. Dispute Resolution Feature ⭐ NEW

#### 2.1 View Disputes Page
- [ ] Navigate to `/disputes` from the navbar
- [ ] Verify the page loads with hero section
- [ ] Check that statistics cards show (Open, In Review, Resolved)
- [ ] Verify empty state when no disputes exist

#### 2.2 Create a Dispute
- [ ] Go to `/payments` page
- [ ] Find a payment in the "Recent Payments" section
- [ ] Click "Raise Dispute" button
- [ ] Fill in the dispute form:
  - Select a payment
  - Choose dispute type (Refund Request, Payment Issue, Service Not Delivered)
  - Enter reason
- [ ] Submit the dispute
- [ ] Verify success message appears
- [ ] Check that dispute appears in "Your Disputes" section

#### 2.3 Admin Dispute Resolution
- [ ] Login as admin user (`admin@sajilokaam.com / admin123`)
- [ ] Navigate to `/disputes`
- [ ] Verify you see all disputes (not just your own)
- [ ] Click "Resolve Dispute" on an open dispute
- [ ] Fill in resolution:
  - Select status (Resolved, Rejected, Closed)
  - Enter resolution details
- [ ] Submit resolution
- [ ] Verify dispute status updates
- [ ] Check that resolved dispute shows resolution details

#### 2.4 Dispute Status Flow
- [ ] Create a dispute (status: OPEN)
- [ ] As admin, change status to IN_REVIEW
- [ ] Resolve the dispute (status: RESOLVED/REJECTED/CLOSED)
- [ ] Verify status changes are reflected correctly

### 3. Subtasks Feature ⭐ NEW

#### 3.1 Create Subtasks
- [ ] Navigate to a project (e.g., `/projects/1`)
- [ ] Click on a task card to open the task drawer
- [ ] Scroll to "Subtasks" section
- [ ] Click "+ Add Subtask"
- [ ] Enter subtask title
- [ ] Click "Create"
- [ ] Verify subtask appears in the list

#### 3.2 Manage Subtasks
- [ ] Check/uncheck subtask checkbox to toggle status (TODO ↔ DONE)
- [ ] Verify status badge updates (TODO, IN_PROGRESS, DONE)
- [ ] Click "Delete" on a subtask
- [ ] Confirm deletion
- [ ] Verify subtask is removed

#### 3.3 Subtasks in Kanban Board
- [ ] Navigate to `/projects/{id}/kanban`
- [ ] Click "Quick view" on any task card
- [ ] Verify subtasks section appears in the drawer
- [ ] Create a subtask from Kanban view
- [ ] Verify it syncs back to project detail page

### 4. Advanced Task Filtering ⭐ NEW

#### 4.1 Basic Status Filter
- [ ] Navigate to a project page
- [ ] Use the "Status" dropdown filter
- [ ] Select "To Do", "In Progress", "Done"
- [ ] Verify tasks are filtered correctly
- [ ] Select "All" to show all tasks

#### 4.2 Advanced Filters
- [ ] Click "Show Advanced" button
- [ ] Test Priority filter:
  - Select different priorities (LOW, MEDIUM, HIGH, CRITICAL)
  - Verify only tasks with that priority show
- [ ] Test Label filter:
  - Select a label from dropdown
  - Verify only tasks with that label show
- [ ] Test Assignee filter:
  - Select an assignee
  - Select "Unassigned"
  - Verify filtering works
- [ ] Test Due Date filter:
  - Select "Overdue" (should show tasks past due date)
  - Select "Today" (should show tasks due today)
  - Select "This Week" (should show tasks due within 7 days)
  - Select "Upcoming" (should show tasks due after this week)
  - Select "No Due Date" (should show tasks without due dates)

#### 4.3 Combined Filters
- [ ] Apply multiple filters simultaneously:
  - Status: "In Progress"
  - Priority: "HIGH"
  - Label: [any label]
- [ ] Verify only tasks matching ALL criteria show
- [ ] Click "Clear all filters"
- [ ] Verify all filters reset and all tasks show

### 5. Existing Features (Sanity Check)

#### 5.1 Task Management
- [ ] Create a new task
- [ ] Update task status
- [ ] Assign task to a freelancer
- [ ] Update task priority
- [ ] Add/remove labels from tasks
- [ ] Set due dates

#### 5.2 Project Features
- [ ] Create a project
- [ ] View project details
- [ ] Add milestones
- [ ] View Kanban board
- [ ] Drag and drop tasks between columns

#### 5.3 Payment Features
- [ ] Create an invoice
- [ ] View payment center
- [ ] Initiate a payment
- [ ] View payment history

---

## 🐛 Common Issues & Troubleshooting

### Backend Not Starting
**Issue**: Backend fails to start
**Solutions**:
- Check if MySQL is running: `docker ps` or check port 3306
- Verify database connection in `application.properties`
- Check logs: `docker logs sajilokaam-backend`
- Ensure JWT_SECRET is set in environment

### Frontend Not Loading
**Issue**: Blank screen or errors in browser console
**Solutions**:
- Check if backend is running on port 8080
- Verify API calls in browser DevTools Network tab
- Check console for CORS errors
- Ensure frontend is running on port 5173

### Database Connection Issues
**Issue**: Cannot connect to database
**Solutions**:
- Verify MySQL container is healthy: `docker ps`
- Check database credentials in `application.properties`
- Try accessing phpMyAdmin at http://localhost:8081
- Check Flyway migrations completed successfully

### Subtasks Not Appearing
**Issue**: Subtasks don't show up
**Solutions**:
- Check browser console for API errors
- Verify backend endpoint: `GET /api/tasks/{taskId}/subtasks`
- Check network tab for failed requests
- Ensure you're clicking on a task to open the drawer

### Disputes Not Loading
**Issue**: Disputes page is empty or errors
**Solutions**:
- Verify you have payments created first
- Check API endpoint: `GET /api/payment-disputes/my`
- Check browser console for errors
- Verify authentication token is valid

### Filters Not Working
**Issue**: Task filters don't apply correctly
**Solutions**:
- Check browser console for JavaScript errors
- Verify tasks have the properties you're filtering by (priority, labels, etc.)
- Try refreshing the page
- Check that filter state is updating in React DevTools

---

## 📊 Test Data Setup

### Create Test Users
1. **Admin User** (should already exist):
   - Email: `admin@sajilokaam.com`
   - Password: `admin123`
   - Role: ADMIN

2. **Freelancer User**:
   - Sign up as freelancer
   - Complete onboarding
   - Wait for admin approval (or approve yourself as admin)

3. **Client User**:
   - Sign up as client
   - Complete onboarding
   - Wait for admin approval

### Create Test Data
1. **Create a Project**:
   - As client, create a job
   - As freelancer, submit a proposal
   - As client, accept proposal (creates project)

2. **Create Tasks**:
   - Go to project detail page
   - Create multiple tasks with different:
     - Statuses (TODO, IN_PROGRESS, DONE)
     - Priorities (LOW, MEDIUM, HIGH, CRITICAL)
     - Assignees
     - Labels
     - Due dates (some past, some future)

3. **Create Payments**:
   - As freelancer, create an invoice
   - As client, go to payment center
   - Create a payment for the invoice

---

## ✅ Feature Verification Checklist

After testing, verify these specific new features:

### Dispute Resolution
- [ ] Disputes page accessible from navbar
- [ ] Can create dispute from payment center
- [ ] Disputes appear in "Your Disputes" section
- [ ] Admin can see all disputes
- [ ] Admin can resolve disputes
- [ ] Resolution details are saved and displayed
- [ ] Dispute status updates correctly

### Subtasks
- [ ] Subtasks section appears in task drawer
- [ ] Can create subtasks
- [ ] Can toggle subtask status (checkbox)
- [ ] Can delete subtasks
- [ ] Subtasks work in both Project Detail and Kanban views
- [ ] Subtask status badges display correctly

### Advanced Filtering
- [ ] Basic status filter works
- [ ] Advanced filters toggle shows/hides
- [ ] Priority filter works
- [ ] Label filter works
- [ ] Assignee filter works
- [ ] Due date filter works (all options)
- [ ] Multiple filters can be combined
- [ ] "Clear all filters" button works
- [ ] Filter counts are accurate

---

## 🔍 Manual Testing Tips

1. **Use Browser DevTools**:
   - Open Network tab to see API calls
   - Check Console for errors
   - Use React DevTools to inspect component state

2. **Test Edge Cases**:
   - Empty states (no tasks, no disputes)
   - Large lists (many tasks, many subtasks)
   - Rapid clicking (prevent double submissions)
   - Invalid inputs (empty forms, invalid dates)

3. **Cross-Browser Testing**:
   - Test in Chrome, Firefox, Edge
   - Check responsive design on mobile

4. **User Flow Testing**:
   - Complete full workflows end-to-end
   - Test as different user roles (admin, freelancer, client)

---

## 📝 Reporting Issues

If you find bugs or issues:

1. **Note the steps to reproduce**
2. **Check browser console for errors**
3. **Check backend logs** (if using Docker: `docker logs sajilokaam-backend`)
4. **Take screenshots** if UI issues
5. **Note your environment**:
   - Operating system
   - Browser and version
   - Docker or local setup

---

## 🎯 Quick Test Script

Run through this quick test to verify everything works:

```bash
# 1. Start the application
docker-compose up --build

# 2. Open browser to http://localhost:5173

# 3. Login as admin
# Email: admin@sajilokaam.com
# Password: admin123

# 4. Quick checks:
# - Navigate to /disputes - should load
# - Navigate to /projects - should load
# - Open a project - should show tasks
# - Click a task - drawer should open
# - Check for "Subtasks" section - should be visible
# - Try creating a subtask - should work
# - Try filtering tasks - should work
```

---

## 🚨 Known Limitations

1. **Payment Gateway Integration**: Uses test/sandbox keys - real payments won't work
2. **ML Service**: Requires spaCy model download on first run
3. **File Uploads**: May have size limits (check backend configuration)
4. **Real-time Updates**: Some features may require page refresh to see updates

---

## 📚 Additional Resources

- **API Documentation**: `private_docs/md/API_DOCUMENTATION.md`
- **How to Use Guide**: `private_docs/md/HOW_TO_USE.md`
- **Deployment Guide**: `private_docs/md/DEPLOYMENT.md`

---

**Happy Testing! 🎉**

If everything works, you should be able to:
- ✅ Manage payment disputes
- ✅ Break down tasks into subtasks
- ✅ Filter tasks with advanced criteria
- ✅ Use all existing features seamlessly

