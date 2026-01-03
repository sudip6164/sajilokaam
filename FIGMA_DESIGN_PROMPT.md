# Comprehensive Figma Design Prompt for SajiloKaam Freelancing Platform

## Project Overview
Design a complete, professional freelancing platform similar to Upwork/Freelancer.com with a modern, clean, and structured UI. This is a two-sided marketplace connecting clients with freelancers, featuring job posting, bidding, project management, invoicing, and team collaboration.

## Design Philosophy
- **Professional & Trustworthy**: The design should inspire confidence and investment
- **Structured & Organized**: Clear visual hierarchy, proper spacing, meaningful sections
- **Rich & Informative**: Display comprehensive information, not just basic cards
- **Modern & Clean**: Contemporary design with subtle gradients, shadows, and borders
- **Consistent**: Unified design system across all pages and components

---

## Design System Specifications

### Color Palette

**Primary Colors:**
- Primary: `#3B82F6` (Blue) - Main brand color for CTAs, links, accents
- Secondary: `#8B5CF6` (Purple) - Complementary accent for gradients
- Success: `#10B981` (Green) - Success states, accepted bids, completed projects
- Warning: `#F59E0B` (Amber) - Warnings, pending states
- Error/Destructive: `#EF4444` (Red) - Errors, rejected states, delete actions
- Info: `#3B82F6` (Blue) - Information, neutral states

**Neutral Colors:**
- Background: `#FFFFFF` (White) - Main background
- Muted Background: `#F9FAFB` (Light gray) - Secondary backgrounds, cards
- Border: `#E5E7EB` (Gray) - Borders, dividers
- Text Primary: `#111827` (Dark gray) - Main text
- Text Secondary: `#6B7280` (Medium gray) - Secondary text, labels
- Text Muted: `#9CA3AF` (Light gray) - Placeholder text, disabled states

**Gradient Combinations:**
- Primary Gradient: `linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)`
- Success Gradient: `linear-gradient(135deg, #10B981 0%, #059669 100%)`
- Warning Gradient: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`
- Background Gradient: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)`

### Typography

**Font Family:**
- Primary: `Inter` (Modern, clean sans-serif)
- Display: `Poppins` (For headings, more personality)
- Monospace: `JetBrains Mono` (For code, technical content)

**Font Sizes:**
- Display 1: `48px` / `56px` line-height (Hero headlines)
- Display 2: `36px` / `44px` line-height (Page titles)
- Heading 1: `30px` / `38px` line-height (Section titles)
- Heading 2: `24px` / `32px` line-height (Subsection titles)
- Heading 3: `20px` / `28px` line-height (Card titles)
- Body Large: `18px` / `28px` line-height (Important body text)
- Body: `16px` / `24px` line-height (Default body text)
- Body Small: `14px` / `20px` line-height (Secondary text)
- Caption: `12px` / `16px` line-height (Labels, metadata)

**Font Weights:**
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

### Spacing System
- Base unit: `4px`
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

### Border Radius
- None: `0px`
- Small: `4px` (Badges, small elements)
- Medium: `8px` (Buttons, inputs)
- Large: `12px` (Cards)
- XLarge: `16px` (Large cards, modals)
- Full: `9999px` (Pills, avatars)

### Shadows
- Small: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- Medium: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- Large: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- XLarge: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

### Borders
- Default: `1px solid #E5E7EB`
- Strong: `2px solid #E5E7EB`
- Primary: `2px solid rgba(59, 130, 246, 0.2)`
- Success: `2px solid rgba(16, 185, 129, 0.2)`
- Error: `2px solid rgba(239, 68, 68, 0.2)`

---

## Component Library

### Buttons

**Primary Button:**
- Background: Primary gradient
- Text: White, semibold
- Padding: `12px 24px`
- Border radius: `8px`
- Shadow: Medium
- Hover: Slightly darker gradient, shadow large
- Active: Pressed effect (shadow small)
- Disabled: 50% opacity, no interaction

**Secondary Button:**
- Background: Transparent
- Border: 2px solid primary color
- Text: Primary color
- Hover: Background primary/10, border primary

**Outline Button:**
- Background: White
- Border: 1px solid border color
- Text: Text primary
- Hover: Background muted, border stronger

**Ghost Button:**
- Background: Transparent
- Border: None
- Text: Text secondary
- Hover: Background muted

**Destructive Button:**
- Background: Error color
- Text: White
- Hover: Darker error color

**Sizes:**
- Small: `8px 16px`, text 14px
- Medium: `12px 24px`, text 16px (default)
- Large: `16px 32px`, text 18px

### Cards

**Default Card:**
- Background: White
- Border: 1px solid border color
- Border radius: `12px`
- Padding: `24px`
- Shadow: Medium
- Hover: Shadow large, slight scale (1.02)

**Elevated Card:**
- Same as default but shadow large
- Used for important content

**Bordered Card:**
- Border: 2px solid primary/20
- Background: Primary/5
- Used for highlighted content

### Input Fields

**Text Input:**
- Background: White
- Border: 1px solid border color
- Border radius: `8px`
- Padding: `12px 16px`
- Focus: Border primary, shadow small
- Error: Border error, text error
- Disabled: Background muted, text muted

**Textarea:**
- Same as text input
- Min height: `120px`
- Resizable: Vertical only

**Select/Dropdown:**
- Same styling as text input
- Dropdown arrow icon
- Options: Hover state, selected state

### Badges

**Status Badge:**
- Padding: `6px 12px`
- Border radius: `9999px`
- Font size: 12px
- Font weight: 600

**Status Colors:**
- Pending: Amber background, amber text
- Accepted/Active: Green background, green text
- Rejected/Closed: Red background, red text
- Draft: Gray background, gray text

**Skill Badge:**
- Background: Primary/10
- Text: Primary color
- Border: 1px solid primary/20
- Padding: `4px 12px`

### Avatars

**Sizes:**
- XSmall: `24px`
- Small: `32px`
- Medium: `40px` (default)
- Large: `64px`
- XLarge: `96px`

**Styles:**
- Circular with border
- Fallback: Gradient background with initials
- Online indicator: Green dot in bottom right

### Tabs

**Tab List:**
- Background: Muted
- Border radius: `8px`
- Padding: `4px`

**Tab Trigger:**
- Padding: `8px 16px`
- Border radius: `6px`
- Active: Background white, text primary, shadow small
- Inactive: Text secondary
- Hover: Background white/50

### Modals/Dialogs

**Overlay:**
- Background: `rgba(0, 0, 0, 0.5)`
- Backdrop blur: `4px`

**Modal:**
- Background: White
- Border radius: `16px`
- Padding: `24px`
- Shadow: XLarge
- Max width: `500px` (small), `700px` (medium), `900px` (large)
- Animation: Fade in + slide up

### Loading States

**Spinner:**
- Circular border animation
- Primary color
- Sizes: 16px, 24px, 32px, 48px

**Skeleton:**
- Background: Muted
- Border radius: `4px`
- Shimmer animation
- Heights: 16px, 24px, 40px, 60px

### Empty States

**Empty State Card:**
- Icon: Large (64px), muted color
- Title: Heading 3, text primary
- Description: Body, text secondary
- CTA: Primary button (optional)

### Error States

**Error Message:**
- Background: Error/10
- Border: 1px solid error/20
- Text: Error color
- Icon: Alert circle, error color

### Toast Notifications

**Success Toast:**
- Background: Success color
- Text: White
- Icon: Check circle
- Position: Top right
- Animation: Slide in from right

**Error Toast:**
- Background: Error color
- Text: White
- Icon: X circle

**Info Toast:**
- Background: Primary color
- Text: White
- Icon: Info

---

## Page Specifications

### 1. Public Pages (Pre-Login)

#### 1.1 Home Page (`/`)
**Layout:**
- Full-width hero section with gradient background
- Stats section (4 cards: Total Jobs, Active Freelancers, Completed Projects, Happy Clients)
- Features section (3-column grid: For Clients, For Freelancers, Platform Benefits)
- How It Works section (3-step process with icons)
- Categories section (Grid of category cards with icons)
- Testimonials section (Carousel or grid of testimonial cards)
- CTA section (Sign up as Freelancer / Post a Job)
- Footer

**Hero Section:**
- Headline: "Hire Experts or Get Hired for Your Skills"
- Subheadline: Descriptive text about the platform
- Search bar: Large, prominent, with placeholder "What service are you looking for?"
- Background: Gradient with subtle pattern or illustration
- CTA buttons: "Post a Job" (primary), "Browse Jobs" (secondary)

**Stats Cards:**
- Icon, number (large, bold), label
- Hover effect: Slight lift
- Gradient border on hover

**Features:**
- Icon, title, description
- Card layout with hover effect

**Categories:**
- Icon, name, job count
- Grid layout, clickable cards
- Hover: Border primary, shadow

#### 1.2 Jobs Listing Page (`/jobs`)
**Header:**
- Title: "Browse Available Jobs"
- Search bar: Full width with filters
- Filter buttons: Category, Budget Range, Experience Level, Job Type, Sort By

**Job Cards:**
- Title (large, bold)
- Client name/avatar
- Category badge
- Skills (badges, max 5 visible)
- Budget range (prominent, primary color)
- Posted date
- Status badge
- Description preview (2-3 lines, truncated)
- "View Details" button
- Hover: Shadow large, border primary

**Empty State:**
- Icon, message, "Post a Job" CTA

**Pagination:**
- Page numbers, prev/next buttons
- Current page highlighted

#### 1.3 Job Detail Public Page (`/jobs/:id`)
**Layout:**
- Two-column: Main content (left 2/3) + Sidebar (right 1/3)

**Main Content:**
- Header: Title, status badge, category, posted date
- Client card: Avatar, name, rating, location, member since
- Job description: Rich formatted text with sections
- Skills section: Badges grid
- Requirements: Job type, experience level, timeline

**Sidebar:**
- Budget card: Range, average bid (if visible)
- Timeline: Deadline, days remaining
- Job details: Type, experience, category
- CTA: "Submit Bid" button (if logged in as freelancer) or "Login to Bid"

**Bid Comparison (if visible):**
- Stats: Total bids, average, range
- Bid list: Freelancer info, amount, status, proposal preview

#### 1.4 Freelancers Listing Page (`/freelancers`)
**Header:**
- Title: "Find Top Freelancers"
- Search bar with filters
- Filter buttons: Skills, Experience Level, Hourly Rate, Rating, Availability

**Freelancer Cards:**
- Avatar (large, 80px)
- Name, title/tagline
- Rating (stars + number)
- Skills (badges, max 5)
- Hourly rate (prominent)
- Location
- Availability status
- "View Profile" button
- Hover: Enhanced shadow, border primary

**Empty State:**
- Icon, message

#### 1.5 Freelancer Profile Public (`/freelancers/:id`)
**Layout:**
- Header section: Avatar (large), name, title, rating, location, hourly rate
- Tabs: Overview, Portfolio, Reviews, Skills

**Overview Tab:**
- Bio/description
- Skills grid
- Experience level
- Availability
- Languages
- Education
- Certifications

**Portfolio Tab:**
- Project cards with images, title, description, skills used

**Reviews Tab:**
- Review cards: Client avatar, name, rating, comment, date, project name

**Sidebar:**
- Contact card: "Hire Me" button, hourly rate, response time
- Stats: Completed projects, success rate, on-time delivery

#### 1.6 About Page (`/about`)
- Hero section: Mission statement
- Company story section
- Team section (optional)
- Values section
- Stats section
- CTA section

#### 1.7 Contact Page (`/contact`)
- Contact form: Name, email, subject, message
- Contact information card: Email, phone, address
- Map (optional)
- Social media links

#### 1.8 Pricing Page (`/pricing`)
- Pricing tiers: Free, Basic, Premium, Enterprise
- Feature comparison table
- FAQ section
- CTA section

#### 1.9 Terms Page (`/terms`)
- Legal text, well-formatted
- Sections with headings
- Last updated date

#### 1.10 Privacy Page (`/privacy`)
- Privacy policy text
- Sections with headings
- Last updated date

---

### 2. Authentication Pages

#### 2.1 Login Page (`/login`)
**Layout:**
- Centered card (max-width: 400px)
- Logo at top
- Title: "Welcome Back"
- Form: Email, Password, "Remember me" checkbox
- "Forgot Password?" link
- Submit button: "Sign In"
- Divider: "OR"
- Social login buttons (Google, optional)
- Footer: "Don't have an account? Sign Up" link

**States:**
- Default
- Error: Error message below form
- Loading: Button disabled, spinner

#### 2.2 Register Page (`/register`)
**Layout:**
- Similar to login
- Form: Full name, email, password, confirm password, role selector (Freelancer/Client), terms checkbox
- Submit: "Create Account"
- Footer: "Already have an account? Sign In"

**Role Selector:**
- Two cards: Freelancer and Client
- Icon, title, description
- Selected: Border primary, background primary/5

#### 2.3 Forgot Password (`/forgot-password`)
- Centered card
- Title: "Reset Password"
- Description text
- Email input
- Submit button
- Back to login link

#### 2.4 Reset Password (`/reset-password`)
- Centered card
- Title: "Set New Password"
- Password and confirm password inputs
- Submit button

#### 2.5 Verify Email (`/verify-email`)
- Centered card
- Icon: Mail
- Title: "Verify Your Email"
- Description: Instructions
- Resend email button
- Change email link

#### 2.6 Email Verified (`/email-verified`)
- Success state
- Icon: Check circle (green)
- Title: "Email Verified!"
- Description: Success message
- CTA: "Continue to Dashboard"

#### 2.7 Admin Login (`/admin/login`)
- Similar to regular login
- Distinct styling (maybe different color scheme)
- Title: "Admin Login"

---

### 3. Freelancer Pages (Post-Login)

#### 3.1 Freelancer Dashboard (`/freelancer`)
**Layout:**
- Header: Welcome message, quick stats
- Stats grid (4 cards): Active Bids, Active Projects, Earnings (This Month), Completed Projects
- Quick actions: Post Job, View Bids, View Projects, Messages
- Recent activity: List of recent bids, projects, messages
- Earnings chart (optional)

**Stats Cards:**
- Icon, number (large), label, trend indicator (up/down arrow with percentage)

#### 3.2 Available Jobs (`/freelancer/jobs` or `/jobs` when logged in)
- Similar to public jobs page
- Additional: "Bid" button on each card
- Filter: "Jobs I Can Bid On"

#### 3.3 Submit Bid Page (`/jobs/:id/bid`)
**Layout:**
- Two-column: Job overview (left) + Bid form (right)

**Job Overview:**
- Job title, description preview
- Budget range
- Skills required
- Deadline
- Client info

**Bid Form:**
- Amount input (with currency)
- Proposal message (textarea, character count)
- Estimated timeline
- Tips/guidelines card
- Submit button

#### 3.4 My Bids (`/bids`)
**Header:**
- Title: "My Bids"
- Stats cards: Total, Pending, Accepted, Rejected
- Search and filter

**Tabs:**
- All, Pending, Accepted, Rejected

**Bid Cards:**
- Job title (link)
- Job description preview
- Client info
- Bid amount (prominent)
- Status badge
- Submitted date
- Actions: View Job, Withdraw (if pending)

#### 3.5 My Projects (`/projects`)
**Header:**
- Title: "My Projects"
- Stats: Active, Completed, On Hold
- Search

**Tabs:**
- All, Active, Completed, On Hold

**Project Cards:**
- Project title
- Client info
- Status badge
- Progress bar (if active)
- Budget/earnings
- Deadline
- Actions: View Details, Messages

#### 3.6 Project Detail (`/projects/:id`)
**Layout:**
- Header: Project title, status, client info
- Stats cards: Budget, Time spent, Deadline, Progress
- Tabs: Overview, Milestones, Chat, Files, Time Log

**Overview Tab:**
- Project description
- Requirements
- Timeline
- Budget breakdown

**Milestones Tab:**
- Milestone cards: Title, description, status, due date, payment
- Add milestone button (if allowed)

**Chat Tab:**
- Message list
- Message input
- File attachments

**Files Tab:**
- File list with previews
- Upload button
- Download buttons

**Time Log Tab:**
- Time tracker: Start/stop button, current session
- Log entries: Date, duration, description
- Total time summary

#### 3.7 Profile (`/profile`)
**Layout:**
- Two-column: Sidebar (sticky) + Main content

**Sidebar:**
- Profile card: Avatar (large), name, title, rating, location
- Stats: Completed projects, success rate, response time
- Edit profile button

**Main Content:**
- Tabs: Personal Info, Skills, Portfolio, Education, Certifications, Payment Methods

**Personal Info:**
- Form: Full name, email, phone, bio, location, hourly rate, availability
- Save button

**Skills:**
- Skills list with proficiency levels
- Add skill button
- Remove skill buttons

**Portfolio:**
- Project cards: Image, title, description, skills, link
- Add project button

**Education:**
- Education entries: Institution, degree, field, years
- Add education button

**Certifications:**
- Certification cards: Name, issuer, date, credential ID
- Add certification button

**Payment Methods:**
- Payment method cards: Type, last 4 digits, expiry
- Add payment method button

#### 3.8 Invoices (`/invoices`)
**Header:**
- Title: "Invoices"
- Stats: Total, Paid, Pending, Overdue
- Filter: Status, date range

**Invoice List:**
- Invoice cards: Invoice #, client, amount, status, due date
- Actions: View, Download, Send reminder

**Invoice Detail:**
- Invoice header: Number, date, due date, status
- Client info
- Line items table
- Totals
- Payment status
- Actions: Download PDF, Send email

#### 3.9 Messages (`/messages`)
**Layout:**
- Two-column: Conversation list (left) + Chat (right)

**Conversation List:**
- Search bar
- Conversation items: Avatar, name, last message preview, timestamp, unread count

**Chat:**
- Header: Contact name, status
- Message list: Bubbles (sent/received), timestamps
- Input: Text area, send button, attach file button

#### 3.10 Notifications (`/notifications`)
- Notification list: Icon, title, description, timestamp, read/unread
- Mark all as read button
- Filter: All, Unread, Bids, Projects, Messages

#### 3.11 Sprint Planner (`/projects/:id/sprints`)
- Kanban board: To Do, In Progress, Review, Done
- Task cards: Title, assignee, priority, due date
- Add task button
- Sprint selector

#### 3.12 Teams (`/freelancer/teams`)
- Team list: Team name, members, projects
- Create team button
- Team detail: Members list, projects, chat

---

### 4. Client Pages (Post-Login)

#### 4.1 Client Dashboard (`/client`)
- Similar structure to freelancer dashboard
- Stats: Active Jobs, Total Bids, Active Projects, Total Spent
- Quick actions: Post Job, View Jobs, View Projects, Messages
- Recent activity

#### 4.2 Post Job (`/post-job`)
**Layout:**
- Multi-step form or single page with sections

**Sections:**
1. **Basic Info:**
   - Job title
   - Category selector
   - Description (rich text editor)
   - Skills selector (with suggestions)

2. **Budget & Timeline:**
   - Budget range (min/max)
   - Job type (hourly/fixed)
   - Deadline
   - Estimated duration

3. **Requirements:**
   - Experience level
   - Job type (remote/onsite)
   - Attachments (file upload)

4. **Review:**
   - Summary of all inputs
   - Submit button

**Form Elements:**
- Clear labels
- Help text where needed
- Validation messages
- Character counts
- File upload previews

#### 4.3 My Jobs (`/my-jobs`)
**Header:**
- Title: "My Jobs"
- Stats: Total, Open, Closed, In Progress
- Search and filter
- "Post a Job" button

**Tabs:**
- All, Open, Closed, In Progress

**Job Cards:**
- Title, status badge, category
- Budget range
- Total bids count
- Posted date
- Actions: View Details, Edit, Close

#### 4.4 Job Detail (Client) (`/my-jobs/:id`)
**Layout:**
- Similar to public job detail but with client controls
- Edit button
- Close job button
- Bid management section

**Bids Section:**
- Bid comparison table/cards
- Sort: Amount, Experience, Rating
- Accept bid button
- View freelancer profile link
- Proposal preview

**Bid Card:**
- Freelancer info: Avatar, name, rating, experience
- Bid amount (prominent)
- Proposal message
- Submitted date
- Status badge
- Actions: Accept, Reject, View Profile

#### 4.5 Client Projects (`/my-projects`)
- Similar to freelancer projects
- Project cards with freelancer info
- Status tracking
- Payment management

#### 4.6 Client Project Detail (`/my-projects/:id`)
- Similar to freelancer project detail
- Client-specific actions: Approve milestone, Release payment
- Freelancer info sidebar
- Project timeline

#### 4.7 Client Profile (`/client-profile`)
- Company info form
- Company description
- Logo upload
- Contact information
- Notification settings
- Security settings (password change)

#### 4.8 Client Invoices (`/client-invoices`)
- Invoice list (invoices received from freelancers)
- Filter: Status, date
- Pay invoice button
- Invoice detail view

#### 4.9 Client Messages (`/client-messages`)
- Same structure as freelancer messages
- Conversations with freelancers

#### 4.10 Client Notifications (`/client-notifications`)
- Same structure as freelancer notifications
- Client-specific notification types

---

### 5. Admin Pages

#### 5.1 Admin Dashboard (`/admin`)
**Layout:**
- Stats grid: Total Users, Pending Verifications, Active Jobs, Total Revenue
- Charts: User growth, Job postings, Revenue
- Recent activity: New users, verifications, reports
- Quick actions

#### 5.2 User Management (`/admin/users`)
**Header:**
- Title: "User Management"
- Search and filter: Role, Status, Verification
- Export button

**User Table:**
- Columns: Avatar, Name, Email, Role, Status, Verification, Joined, Actions
- Actions: View, Edit, Ban/Unban, Delete
- Pagination

**User Detail:**
- User info card
- Activity log
- Edit user form
- Ban/Unban button

#### 5.3 Verification Queue (`/admin/verification`)
**Header:**
- Title: "Verification Queue"
- Stats: Pending, Approved, Rejected
- Filter: Role, Date

**Verification Cards:**
- User info: Avatar, name, email, role
- Documents: ID, portfolio, certificates (preview/download)
- Submitted date
- Actions: Approve, Reject, Request More Info

#### 5.4 Statistics (`/admin/statistics`)
- Charts: User growth, Job postings, Bids, Revenue
- Date range selector
- Export reports button
- Key metrics cards

#### 5.5 Reports (`/admin/reports`)
- Report list: Type, date range, status
- Generate report button
- Report detail view
- Download button

#### 5.6 Admin Settings (`/admin/settings`)
- Platform settings form
- Email settings
- Payment settings
- Security settings
- Save button

---

### 6. Error & Utility Pages

#### 6.1 404 Not Found (`/404` or `*`)
**Layout:**
- Centered content
- Large "404" text (gradient)
- Icon: Broken link or search
- Title: "Page Not Found"
- Description: "The page you're looking for doesn't exist"
- CTA: "Go Home" button
- Illustration (optional)

#### 6.2 Access Denied (`/access-denied`)
- Similar to 404
- Title: "Access Denied"
- Description: "You don't have permission to access this page"
- Icon: Lock
- CTA: "Go Back" or "Contact Admin"

#### 6.3 Success Page (`/success`)
- Success icon (check circle, green)
- Title: "Success!"
- Description: Dynamic message
- CTA: "Continue" button

#### 6.4 Failure Page (`/failure`)
- Error icon (X circle, red)
- Title: "Something Went Wrong"
- Description: Error message
- CTA: "Try Again" or "Go Back"

#### 6.5 Loading States
- Full-page spinner with message
- Skeleton screens for content areas
- Button loading states (spinner in button)

#### 6.6 Empty States
- Icon (large, muted)
- Title
- Description
- CTA button (optional)

---

## Responsive Breakpoints

- Mobile: `320px - 767px`
- Tablet: `768px - 1023px`
- Desktop: `1024px - 1439px`
- Large Desktop: `1440px+`

**Mobile Adaptations:**
- Single column layouts
- Stacked cards
- Hamburger menu
- Bottom navigation (optional)
- Full-width buttons
- Simplified headers

**Tablet Adaptations:**
- Two-column layouts where appropriate
- Sidebar becomes collapsible
- Adjusted spacing

---

## Interactive States

### Hover States
- Buttons: Darker background, larger shadow
- Cards: Lift effect (shadow large, slight scale)
- Links: Underline or color change
- Icons: Color change or scale

### Active States
- Buttons: Pressed effect (shadow small, slight scale down)
- Tabs: Active indicator
- Menu items: Background highlight

### Focus States
- Inputs: Border primary, shadow small
- Buttons: Outline ring
- Links: Underline

### Disabled States
- 50% opacity
- No pointer events
- Cursor: not-allowed

### Loading States
- Spinner animation
- Skeleton screens
- Button: Disabled with spinner

### Error States
- Red border
- Error message below
- Error icon

### Success States
- Green border
- Success message
- Success icon

---

## Technical Specifications

### Technology Stack
- **Frontend Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS 3+
- **UI Components:** Shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State Management:** React Query (TanStack Query) for server state, React Context for auth
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion (optional, for complex animations)
- **Notifications:** Sonner (toast notifications)

### File Structure
```
frontend/src/
├── components/
│   ├── ui/              # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── Jobs.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── ...
│   ├── freelancer/
│   │   ├── FreelancerDashboard.tsx
│   │   └── ...
│   ├── client/
│   │   ├── ClientDashboard.tsx
│   │   └── ...
│   └── admin/
│       └── ...
├── layouts/
│   ├── PublicLayout.tsx
│   ├── AuthLayout.tsx
│   ├── FreelancerLayout.tsx
│   ├── ClientLayout.tsx
│   └── AdminLayout.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── api.ts
└── App.tsx
```

### Code Formatting Standards
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for JSX, double for HTML attributes
- **Semicolons:** Yes
- **Trailing commas:** Yes
- **Line length:** Max 100 characters
- **Component naming:** PascalCase
- **File naming:** PascalCase for components, camelCase for utilities
- **Import order:** External libraries → Internal components → Types → Utils

### Component Structure
```tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ComponentName() {
  // Hooks
  const { id } = useParams();
  const [data, setData] = useState(null);
  
  // Effects
  useEffect(() => {
    loadData();
  }, [id]);
  
  // Handlers
  const handleAction = async () => {
    // Implementation
  };
  
  // Render
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Content */}
    </div>
  );
}
```

### Styling Guidelines
- Use Tailwind utility classes
- Custom colors defined in `tailwind.config.js`
- Consistent spacing using the spacing scale
- Responsive classes: `md:`, `lg:`, `xl:`
- Hover states: `hover:`
- Focus states: `focus:`
- Dark mode: `dark:` (if implemented)

### Accessibility Requirements
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Proper heading hierarchy
- Color contrast ratios (WCAG AA minimum)

---

## Design Deliverables Checklist

### Must Have
- [ ] Complete design system (colors, typography, spacing, components)
- [ ] All public pages (Home, Jobs, Freelancers, About, Contact, etc.)
- [ ] All authentication pages
- [ ] All freelancer pages
- [ ] All client pages
- [ ] All admin pages
- [ ] All error/utility pages
- [ ] All component states (hover, active, disabled, loading, error)
- [ ] Mobile responsive designs
- [ ] Tablet responsive designs
- [ ] Desktop designs
- [ ] Empty states for all list pages
- [ ] Loading states
- [ ] Error states
- [ ] Success states

### Design File Organization
- **Frames:** Organize by page type (Public, Auth, Freelancer, Client, Admin, Errors)
- **Components:** Create reusable component library
- **Styles:** Define text styles, color styles, effect styles
- **Auto Layout:** Use for all components and pages
- **Variants:** Use for component states (default, hover, active, disabled)

### Export Specifications
- **Icons:** SVG format, 24x24px default
- **Images:** PNG/JPG, optimized
- **Assets:** Export at 1x, 2x, 3x for retina displays

---

## Additional Notes

1. **Consistency is Key:** Every page should feel like part of the same system
2. **Information Density:** Don't be afraid to show information - users need context
3. **Visual Hierarchy:** Use size, color, and spacing to guide the eye
4. **Progressive Disclosure:** Show important info first, details on demand
5. **Feedback:** Every action should have visual feedback
6. **Error Prevention:** Clear validation, helpful error messages
7. **Performance:** Design should consider loading states and skeleton screens
8. **Accessibility:** Design should be usable by everyone

---

## Final Instructions for Figma

1. Start with the design system (colors, typography, components)
2. Create a component library with all reusable elements
3. Design pages in order: Public → Auth → Freelancer → Client → Admin → Errors
4. For each page, create all states: Default, Loading, Empty, Error, Success
5. Create responsive variants for mobile, tablet, and desktop
6. Use auto layout for all components and pages
7. Name all layers clearly and organize them in groups
8. Add annotations/comments explaining interactions and behaviors
9. Export assets as needed
10. Create a style guide page documenting the design system

**Remember:** This is a professional platform. The design should inspire trust, confidence, and investment. Every element should be purposeful and well-designed.

