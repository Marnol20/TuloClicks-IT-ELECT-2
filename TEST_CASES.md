# TuloClicks System - Test Cases
## Based on IT ELECT 2 Project Deliverables & Milestones

**Project:** TuloClicks Event Management Platform
**Date:** April 16, 2026
**Current Phase:** Task 3 - Core System Development

---

## TABLE OF CONTENTS
1. [Task 3 Test Cases - Authentication & Data Management](#task-3-authentication--data-management)
2. [Task 4 Test Cases - Database Integration & Transactions](#task-4-database-integration--transactions)
3. [Task 5 Test Cases - Reporting & Data Visualization](#task-5-reporting--data-visualization)
4. [Task 6 Test Cases - System Refinement & Testing](#task-6-system-refinement--testing)

---

## TASK 3: AUTHENTICATION & DATA MANAGEMENT
**Deadline:** April 18, 2026

### 1.1 USER REGISTRATION (Sign-Up)

#### TC-AUTH-001: Successful User Registration
**Objective:** Verify that a new user can successfully register with valid credentials
**Steps:**
1. Navigate to Sign-Up page (/auth/signup)
2. Enter valid email: `testuser@gmail.com`
3. Enter full name: `John Doe`
4. Enter password: `SecurePass123!`
5. Confirm password: `SecurePass123!`
6. Click "Sign Up" button

**Expected Result:**
- User account created successfully
- User redirected to login page
- Success message displayed: "Registration successful"
- User can log in with credentials

**Status:** ⬜ Pending

---

#### TC-AUTH-002: Registration - Password Validation (Too Weak)
**Objective:** Verify system rejects weak passwords
**Steps:**
1. Enter email: `user2@gmail.com`
2. Enter password: `123` (too short)
3. Click "Sign Up"

**Expected Result:**
- Error message: "Password must be at least 8 characters"
- Registration blocked
- Form data retained

**Status:** ⬜ Pending

---

#### TC-AUTH-003: Registration - Duplicate Email
**Objective:** Verify system prevents duplicate email registration
**Steps:**
1. Attempt to register with existing email: `testuser@gmail.com`
2. Fill other details
3. Click "Sign Up"

**Expected Result:**
- Error message: "Email already exists"
- Registration blocked
- User suggested to login instead

**Status:** ⬜ Pending

---

#### TC-AUTH-004: Registration - Invalid Email Format
**Objective:** Verify email validation
**Steps:**
1. Enter invalid email: `invalidemail.com`
2. Fill other fields
3. Click "Sign Up"

**Expected Result:**
- Error message: "Invalid email format"
- Registration blocked

**Status:** ⬜ Pending

---

#### TC-AUTH-005: Registration - Missing Required Fields
**Objective:** Verify all required fields must be filled
**Steps:**
1. Leave "Full Name" empty
2. Fill other fields
3. Click "Sign Up"

**Expected Result:**
- Error message: "All fields are required"
- Form validation highlighting empty field

**Status:** ⬜ Pending

---

### 1.2 USER LOGIN (Sign-In)

#### TC-AUTH-006: Successful User Login
**Objective:** Verify user can log in with correct credentials
**Steps:**
1. Navigate to Login page (/auth/login)
2. Enter email: `testuser@gmail.com`
3. Enter password: `SecurePass123!`
4. Click "Login" button

**Expected Result:**
- Login successful
- User redirected to home dashboard
- Session created
- User role displayed (e.g., "User", "Organizer", "Admin")

**Status:** ⬜ Pending

---

#### TC-AUTH-007: Login - Incorrect Password
**Objective:** Verify system rejects incorrect password
**Steps:**
1. Enter email: `testuser@gmail.com`
2. Enter password: `WrongPassword123!`
3. Click "Login"

**Expected Result:**
- Error message: "Invalid email or password"
- Login blocked
- User remains on login page
- No sensitive information revealed

**Status:** ⬜ Pending

---

#### TC-AUTH-008: Login - Non-existent Email
**Objective:** Verify system handles non-existent users
**Steps:**
1. Enter email: `nonexistent@gmail.com`
2. Enter any password
3. Click "Login"

**Expected Result:**
- Error message: "Invalid email or password"
- Login blocked

**Status:** ⬜ Pending

---

#### TC-AUTH-009: Login - Empty Fields
**Objective:** Verify validation for empty login fields
**Steps:**
1. Leave email field empty
2. Leave password field empty
3. Click "Login"

**Expected Result:**
- Error message: "Email and password are required"
- Form validation highlighting empty fields

**Status:** ⬜ Pending

---

### 1.3 SESSION MANAGEMENT & PASSWORD SECURITY

#### TC-AUTH-010: Session Persistence
**Objective:** Verify user session persists during activity
**Steps:**
1. User logs in successfully
2. User navigates between pages (Home → Events → Tickets)
3. User session should remain active
4. After 30 minutes of inactivity, check if session expires

**Expected Result:**
- Session active while browsing
- After 30 min idle: User prompted to login again
- User data preserved but access restricted

**Status:** ⬜ Pending

---

#### TC-AUTH-011: Password Encryption
**Objective:** Verify passwords are encrypted in database
**Steps:**
1. Create user account
2. Access database directly
3. Search for password field of newly created user

**Expected Result:**
- Password stored as encrypted hash (not plain text)
- Hash should use BCrypt algorithm
- Cannot decrypt to original password

**Status:** ⬜ Pending

---

#### TC-AUTH-012: User Logout
**Objective:** Verify user can logout successfully
**Steps:**
1. User logged in
2. Click "Logout" button in sidebar/navigation
3. Attempt to access protected page

**Expected Result:**
- Logout successful
- Session destroyed
- User redirected to login page
- Protected pages inaccessible

**Status:** ⬜ Pending

---

### 1.4 ROLE-BASED ACCESS CONTROL

#### TC-AUTH-013: User Role Access - Regular User
**Objective:** Verify user sees appropriate dashboard
**Steps:**
1. Login as regular user
2. Check dashboard pages accessible: Home, Browse Events, My Tickets
3. Check admin/organizer pages inaccessible

**Expected Result:**
- User dashboard visible
- Event browsing working
- Ticket management accessible
- Admin panel returns error/redirect
- Organizer dashboard returns error/redirect

**Status:** ⬜ Pending

---

#### TC-AUTH-014: Organizer Role Access
**Objective:** Verify organizer sees appropriate dashboard
**Steps:**
1. Login as organizer account
2. Check pages accessible: Organizer Dashboard, My Events, Bookings
3. Attempt to access Admin Dashboard

**Expected Result:**
- Organizer dashboard visible
- Event management accessible
- Booking tracking working
- Admin panel inaccessible

**Status:** ⬜ Pending

---

#### TC-AUTH-015: Admin Role Access
**Objective:** Verify admin sees appropriate dashboard
**Steps:**
1. Login as admin account
2. Check all admin features accessible
3. Attempt to access user/organizer restricted features

**Expected Result:**
- Admin dashboard fully accessible
- All admin features working
- User/organizer features accessible (for management)
- No restrictions on data access

**Status:** ⬜ Pending

---

### 1.5 CRUD OPERATIONS - EVENTS

#### TC-CRUD-001: Create Event
**Objective:** Verify organizer can create new event
**Steps (Organizer):**
1. Navigate to "My Events"
2. Click "Create Event"
3. Fill in:
   - Title: "Tech Conference 2026"
   - Description: "Annual tech industry conference"
   - Category: "Conference"
   - Start Date: 2026-05-10
   - End Date: 2026-05-12
   - Venue: "Convention Center"
   - Ticket Price: 500
4. Click "Create"

**Expected Result:**
- Event created successfully
- Event ID generated
- Organizer redirected to event details
- Event visible in "My Events" list
- Event appears in public event listings

**Status:** ⬜ Pending

---

#### TC-CRUD-002: Read Event Details
**Objective:** Verify event details can be viewed
**Steps:**
1. Navigate to event created in TC-CRUD-001
2. Check all details displayed correctly

**Expected Result:**
- All event information displayed
- Event date/time correct
- Organizer name shown
- Description properly formatted
- Ticket availability shown

**Status:** ⬜ Pending

---

#### TC-CRUD-003: Update Event
**Objective:** Verify organizer can edit event
**Steps:**
1. Go to event created in TC-CRUD-001
2. Click "Edit"
3. Change title to "Tech Summit 2026"
4. Change ticket price to 600
5. Click "Update"

**Expected Result:**
- Changes saved successfully
- Updated details visible in event page
- Update timestamp recorded
- Users see updated information

**Status:** ⬜ Pending

---

#### TC-CRUD-004: Delete Event
**Objective:** Verify event can be deleted
**Steps:**
1. Create test event
2. Click "Delete" button
3. Confirm deletion
4. Search for deleted event

**Expected Result:**
- Event deleted from system
- No longer visible in listings
- Event-related data handled appropriately
- Users cannot book deleted event

**Status:** ⬜ Pending

---

### 1.6 CRUD OPERATIONS - BOOKINGS

#### TC-CRUD-005: Create Booking
**Objective:** Verify user can book event
**Steps (User):**
1. Navigate to event details page
2. Click "Book Now"
3. Select number of tickets: 2
4. Click "Proceed to Payment"
5. Complete payment

**Expected Result:**
- Booking created
- Booking reference generated
- QR code generated
- User receives booking confirmation
- Ticket count decremented
- Booking visible in "My Tickets"

**Status:** ⬜ Pending

---

#### TC-CRUD-006: Read Booking Details
**Objective:** Verify booking details accessible
**Steps:**
1. Navigate to "My Tickets"
2. Click on booking from TC-CRUD-005
3. View booking details

**Expected Result:**
- Booking information displayed correctly
- Event details shown
- Attendee information visible
- QR code displayed
- Payment status shown
- Total amount visible

**Status:** ⬜ Pending

---

#### TC-CRUD-007: Update Booking
**Objective:** Verify booking can be modified
**Steps:**
1. Open booking from TC-CRUD-005
2. Click "Edit"
3. Change attendee name
4. Click "Update"

**Expected Result:**
- Booking updated
- Changes visible immediately
- History recorded
- No conflicts created

**Status:** ⬜ Pending

---

#### TC-CRUD-008: Cancel Booking
**Objective:** Verify user can cancel booking
**Steps:**
1. Open active booking
2. Click "Cancel Booking"
3. Select cancellation reason
4. Confirm cancellation

**Expected Result:**
- Booking status changed to "Cancelled"
- Refund processed (if applicable)
- Ticket freed up for others
- Cancellation confirmation sent
- Refund status updated

**Status:** ⬜ Pending

---

---

## TASK 4: DATABASE INTEGRATION & TRANSACTIONS
**Deadline:** April 25, 2026

### 2.1 RELATIONAL TRANSACTIONS

#### TC-DB-001: User-Booking-Payment Transaction
**Objective:** Verify multi-entity transaction integrity
**Steps:**
1. User books event (creates booking record)
2. Payment processed (creates payment record)
3. Verify relationships:
   - booking.user_id = user.id
   - booking.event_id = event.id
   - payment.booking_id = booking.id

**Expected Result:**
- All records created with correct foreign keys
- Relationships intact
- No orphaned records
- Data consistency maintained

**Status:** ⬜ Pending

---

#### TC-DB-002: Event-Ticket Inventory Transaction
**Objective:** Verify ticket inventory updates with booking
**Steps:**
1. Event has 100 tickets available
2. User books 5 tickets
3. Check inventory records

**Expected Result:**
- Inventory decremented from 100 to 95
- Transaction logged
- No double-booking (atomic operation)
- Concurrent bookings handled correctly

**Status:** ⬜ Pending

---

#### TC-DB-003: Cascade Delete - Event Deletion
**Objective:** Verify cascade behavior when event deleted
**Steps:**
1. Delete event with 5 related bookings
2. Check database for:
   - Event record
   - Related booking records
   - Related payment records

**Expected Result:**
- Event deleted
- Related bookings deleted (or marked as cancelled)
- Payments handled appropriately
- No orphaned records

**Status:** ⬜ Pending

---

### 2.2 DATABASE QUERIES & JOINS

#### TC-DB-004: Inner Join - User-Booking-Event
**Objective:** Verify complex join operations work
**Steps:**
1. Query: Get all bookings for user ID 5 with event details
2. Execute SQL with INNER JOIN
3. Verify results

**Expected Result:**
- Only bookings with matching events returned
- Event details included in result
- No null values
- Correct filtering applied

**Status:** ⬜ Pending

---

#### TC-DB-005: Left Join - Organizer-Events
**Objective:** Verify left join shows all organizers (even with no events)
**Steps:**
1. Query all organizers with their event count
2. Use LEFT JOIN with events table
3. Check organizers with 0 events

**Expected Result:**
- All organizers returned (even without events)
- Event count 0 for organizers without events
- NULL values handled correctly
- Accurate counting

**Status:** ⬜ Pending

---

#### TC-DB-006: Aggregate Query - Total Revenue
**Objective:** Verify aggregation functions work correctly
**Steps:**
1. Query total revenue from all payments
2. Sum by event, by organizer, by date range
3. Verify calculations

**Expected Result:**
- Correct sum calculations
- Filtering works with aggregates
- GROUP BY functioning properly
- HAVING clause filters correctly

**Status:** ⬜ Pending

---

### 2.3 DATA CONSISTENCY & INTEGRITY

#### TC-DB-007: Transaction Rollback
**Objective:** Verify failed transaction rolls back properly
**Steps:**
1. Initiate booking transaction
2. Simulate payment failure mid-process
3. Check database state

**Expected Result:**
- All changes rolled back
- No partial records created
- User balance unchanged
- Inventory unchanged
- Error message displayed

**Status:** ⬜ Pending

---

#### TC-DB-008: Concurrent Booking - Last Ticket
**Objective:** Verify race condition handling
**Steps:**
1. Event has 1 ticket remaining
2. Two users simultaneously attempt to book
3. Monitor database operations

**Expected Result:**
- Only one booking succeeds
- One user gets success message
- One user gets "Sold Out" message
- Inventory correct
- No data corruption

**Status:** ⬜ Pending

---

---

## TASK 5: REPORTING & DATA VISUALIZATION
**Deadline:** May 2, 2026

### 3.1 SYSTEM-GENERATED REPORTS

#### TC-RPT-001: User Activity Report
**Objective:** Verify user activity logging and reporting
**Steps (Admin):**
1. Navigate to Reports section
2. Select "User Activity Report"
3. Set date range: Last 30 days
4. Click "Generate Report"

**Expected Result:**
- Report generated
- Shows user login timestamps
- Shows user actions (bookings, cancellations)
- Includes user names and IDs
- Exports as PDF/CSV option available

**Status:** ⬜ Pending

---

#### TC-RPT-002: Transaction History Report
**Objective:** Verify transaction logging
**Steps (Admin):**
1. Navigate to Reports
2. Select "Transaction History"
3. Filter by date: This month
4. Click "Generate"

**Expected Result:**
- All payments listed with:
  - Transaction ID
  - User name
  - Event name
  - Amount
  - Payment status
  - Date/time
- Totals calculated
- Export options available

**Status:** ⬜ Pending

---

#### TC-RPT-003: Event Summary Report
**Objective:** Verify event performance metrics
**Steps (Organizer):**
1. Navigate to My Events
2. Click "View Report" on an event
3. Check metrics displayed

**Expected Result:**
- Total bookings shown
- Revenue calculated
- Attendee count
- Cancellation count
- Average attendance rate
- Charts/graphs displaying trends

**Status:** ⬜ Pending

---

#### TC-RPT-004: Revenue Report
**Objective:** Verify revenue calculations
**Steps (Admin):**
1. Navigate to Reports
2. Select "Revenue Report"
3. Choose date range
4. Select currency

**Expected Result:**
- Total revenue displayed
- Breakdown by event
- Breakdown by organizer
- Breakdown by payment method
- Trends visualization
- Accurate calculations

**Status:** ⬜ Pending

---

### 3.2 DATA VISUALIZATION

#### TC-VIZ-001: Booking Trends Chart
**Objective:** Verify chart generation for trends
**Steps:**
1. Navigate to Dashboard
2. Check booking trends chart
3. Verify data points match database

**Expected Result:**
- Line/bar chart displays
- Correct time periods (daily/weekly/monthly)
- Data matches database records
- Interactive elements work (hover, zoom)
- Legend accurate

**Status:** ⬜ Pending

---

#### TC-VIZ-002: Revenue Distribution Pie Chart
**Objective:** Verify pie chart for distribution
**Steps:**
1. View revenue report
2. Check pie chart by category
3. Verify percentages

**Expected Result:**
- Pie chart displays
- Segments colored differently
- Percentages calculated correctly
- Labels shown
- Tooltips on hover

**Status:** ⬜ Pending

---

### 3.3 EXPORT FEATURES

#### TC-EXP-001: Export Report to PDF
**Objective:** Verify PDF export functionality
**Steps:**
1. Generate any report
2. Click "Export as PDF"
3. Verify file downloaded
4. Open PDF and check formatting

**Expected Result:**
- PDF downloaded successfully
- Filename meaningful
- Content properly formatted
- Tables readable
- No data corruption
- All information included

**Status:** ⬜ Pending

---

#### TC-EXP-002: Export Report to CSV
**Objective:** Verify CSV export functionality
**Steps:**
1. Generate report
2. Click "Export as CSV"
3. Download file
4. Open in Excel/Sheets

**Expected Result:**
- CSV file downloaded
- Data in proper columns
- Headers included
- No encoding issues
- Importable to Excel
- Numbers formatted correctly

**Status:** ⬜ Pending

---

---

## TASK 6: SYSTEM REFINEMENT & TESTING
**Deadline:** May 9, 2026

### 4.1 FUNCTIONAL TESTING - ALL FEATURES

#### TC-FUNC-001: Home Page Load
**Objective:** Verify home page loads correctly
**Steps:**
1. Logged-in user navigates to home
2. Page loads completely
3. Check all sections render

**Expected Result:**
- Page loads within 2 seconds
- Hero section displays
- Stats cards show correct data
- Recent tickets section shows
- Featured events section shows
- No console errors

**Status:** ⬜ Pending

---

#### TC-FUNC-002: Browse Events Functionality
**Objective:** Verify event browsing works
**Steps:**
1. Navigate to Browse Events
2. Test filtering by category
3. Test search functionality
4. Test sorting by date/price
5. Click on event

**Expected Result:**
- All events display correctly
- Filters work properly
- Search returns relevant results
- Sorting applies correctly
- Event details page loads

**Status:** ⬜ Pending

---

#### TC-FUNC-003: Event Details Page Complete
**Objective:** Verify all event details display
**Steps:**
1. Open event details page
2. Verify all sections: Title, Description, Speakers, Venue, Booking

**Expected Result:**
- All information displays
- Images load correctly
- Responsive on mobile
- Booking button functional
- No missing data

**Status:** ⬜ Pending

---

#### TC-FUNC-004: Booking Flow Complete
**Objective:** Verify complete booking flow
**Steps:**
1. Start from event details
2. Click "Book Now"
3. Select tickets
4. Enter attendee info
5. Complete payment
6. Verify confirmation

**Expected Result:**
- Each step functions
- Data saved correctly
- Confirmation email sent
- Ticket QR code generated
- Booking appears in My Tickets

**Status:** ⬜ Pending

---

#### TC-FUNC-005: Admin Dashboard Full Access
**Objective:** Verify admin can access all features
**Steps:**
1. Login as admin
2. Check each menu item:
   - Dashboard
   - Events (Approvals)
   - Organizers
   - Users
   - Payments
   - Reports
   - Support Issues

**Expected Result:**
- All sections load
- Data displays correctly
- Action buttons work
- Filters/search functional
- No permission errors

**Status:** ⬜ Pending

---

#### TC-FUNC-006: Organizer Dashboard Full Access
**Objective:** Verify organizer features work
**Steps:**
1. Login as organizer
2. Access:
   - My Events
   - Create Event
   - Bookings
   - Speakers
   - Tickets
   - QR Code Scanning

**Expected Result:**
- All features accessible
- Data accurate
- CRUD operations functional
- QR scanner works
- Reporting available

**Status:** ⬜ Pending

---

### 4.2 BUG IDENTIFICATION & RESOLUTION

#### TC-BUG-001: Memory Leaks
**Objective:** Identify and fix memory leaks
**Steps:**
1. Monitor browser memory usage
2. Perform actions for 10 minutes
3. Check memory growth

**Expected Result:**
- Memory usage stable
- No exponential growth
- No untracked listeners
- DOM properly cleaned up

**Status:** ⬜ Pending

---

#### TC-BUG-002: UI Responsiveness
**Objective:** Test UI on multiple screen sizes
**Steps:**
1. Test on: Mobile (320px), Tablet (768px), Desktop (1920px)
2. Check element alignment
3. Check font sizes
4. Check button functionality

**Expected Result:**
- UI responsive on all sizes
- Text readable
- Buttons clickable
- No horizontal scroll
- Images scale properly

**Status:** ⬜ Pending

---

#### TC-BUG-003: Browser Compatibility
**Objective:** Test on multiple browsers
**Steps:**
1. Test on: Chrome, Firefox, Safari, Edge
2. Check all features
3. Test form submissions
4. Test payments

**Expected Result:**
- All features work on all browsers
- Styling consistent
- No JavaScript errors
- No console warnings
- Payment processing works

**Status:** ⬜ Pending

---

#### TC-BUG-004: Network Error Handling
**Objective:** Verify graceful error handling
**Steps:**
1. Simulate network failure (F12 → Network → Offline)
2. Try to load page
3. Try to submit form
4. Reconnect network

**Expected Result:**
- Error messages displayed
- User informed of issue
- Retry options provided
- Data not lost when reconnected
- UI remains usable

**Status:** ⬜ Pending

---

### 4.3 PERFORMANCE TESTING

#### TC-PERF-001: Page Load Speed
**Objective:** Verify acceptable page load times
**Steps:**
1. Use Lighthouse/GTmetrix
2. Measure: Home, Events, Event Details
3. Check scores

**Expected Result:**
- First Contentful Paint < 2s
- Largest Contentful Paint < 4s
- Cumulative Layout Shift < 0.1
- Lighthouse score > 80

**Status:** ⬜ Pending

---

#### TC-PERF-002: Database Query Performance
**Objective:** Verify queries complete quickly
**Steps:**
1. Monitor query execution times
2. Check for N+1 problems
3. Monitor during heavy load

**Expected Result:**
- Queries < 500ms for single records
- List queries < 2s for 1000 records
- No N+1 problems
- Proper indexing used

**Status:** ⬜ Pending

---

#### TC-PERF-003: API Response Times
**Objective:** Verify API responds quickly
**Steps:**
1. Load test API endpoints
2. Monitor response times
3. Test with 100+ concurrent users

**Expected Result:**
- Response times < 500ms under normal load
- Graceful degradation under high load
- No timeouts
- Error rates < 0.1%

**Status:** ⬜ Pending

---

### 4.4 SECURITY TESTING

#### TC-SEC-001: SQL Injection Prevention
**Objective:** Verify SQL injection protection
**Steps:**
1. Try to inject SQL in search field
2. Example: `'; DROP TABLE users; --`
3. Check database integrity

**Expected Result:**
- Injection attempt blocked
- Error message (generic, not detailed)
- Database unchanged
- No sensitive info revealed

**Status:** ⬜ Pending

---

#### TC-SEC-002: XSS Prevention
**Objective:** Verify XSS protection
**Steps:**
1. Try to inject script: `<script>alert('XSS')</script>`
2. In user input fields
3. Check if executed

**Expected Result:**
- Script not executed
- Content escaped/sanitized
- Displayed as text
- No security issues

**Status:** ⬜ Pending

---

#### TC-SEC-003: CSRF Protection
**Objective:** Verify CSRF token implementation
**Steps:**
1. Capture form submission
2. Attempt to resubmit without token
3. Try from different domain

**Expected Result:**
- CSRF token required
- Submission blocked without token
- Cross-origin requests rejected
- Session protected

**Status:** ⬜ Pending

---

#### TC-SEC-004: Password Reset Security
**Objective:** Verify secure password reset
**Steps:**
1. Request password reset
2. Check reset link (should be temporary)
3. Try to use reset link twice

**Expected Result:**
- Reset link sent to email
- Link expires after 24 hours
- One-time use only
- New password set securely
- Old sessions invalidated

**Status:** ⬜ Pending

---

---

## TEST SUMMARY

### Progress Tracking

| Task | Total Test Cases | Pending | In Progress | Passed | Failed |
|------|-----------------|---------|-------------|--------|--------|
| Task 3 (Auth & Data) | 15 | 15 | 0 | 0 | 0 |
| Task 4 (Database) | 8 | 8 | 0 | 0 | 0 |
| Task 5 (Reports) | 10 | 10 | 0 | 0 | 0 |
| Task 6 (Refinement) | 19 | 19 | 0 | 0 | 0 |
| **TOTAL** | **52** | **52** | **0** | **0** | **0** |

---

### How to Use This Document

1. **Before Testing:** Mark test case as "In Progress"
2. **During Testing:** Document actual results
3. **After Testing:** Mark as "Passed" or "Failed" with notes
4. **Bugs Found:** Create GitHub issue with:
   - Test case number
   - Steps to reproduce
   - Expected vs actual result
   - Screenshots/logs

---

### Testing Priority

**Phase 1 (High Priority):**
- TC-AUTH-001 through TC-AUTH-015 (All authentication)
- TC-CRUD-001 through TC-CRUD-008 (All CRUD operations)
- TC-FUNC-001 through TC-FUNC-006 (Basic functionality)

**Phase 2 (Medium Priority):**
- TC-DB-001 through TC-DB-008 (Database operations)
- TC-SEC-001 through TC-SEC-004 (Security)

**Phase 3 (Lower Priority):**
- TC-RPT-001 through TC-EXP-002 (Reports & Export)
- TC-PERF-001 through TC-PERF-003 (Performance)

---

### Notes

- All test cases must be completed before Task 6 deadline (May 9)
- Failed tests must be fixed before production deployment
- Test cases should be re-run after any code changes
- Load testing (TC-PERF-003) requires staging environment

---

**Document Version:** 1.0
**Last Updated:** April 16, 2026
