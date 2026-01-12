# Village Panchayat Management System - Frontend to Backend Specifications

**Project:** Gram Panchayat Sarahi Digital Portal  
**Version:** 1.0  
**Date:** January 2026  
**Technology Stack:**
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend (To Build):** Node.js/FastAPI, MySQL/PostgreSQL
- **Authentication:** JWT-based

---

## Table of Contents
1. [User Roles & Permissions](#user-roles--permissions)
2. [Authentication Flow](#authentication-flow)
3. [Pages & Routes](#pages--routes)
4. [Database Schema Requirements](#database-schema-requirements)
5. [API Endpoints Needed](#api-endpoints-needed)
6. [Form Fields & Validation](#form-fields--validation)
7. [File Structure](#file-structure)

---

## User Roles & Permissions

### 1. **Citizen** (Village Member)
- **Access:** Limited to own data
- **Capabilities:**
  - View personal dashboard
  - Apply for certificates (Birth, Death, Income, Residence)
  - Register complaints (Water, Road, Electricity)
  - Track application status
  - View government schemes
  - View notices

### 2. **Clerk** (Panchayat Staff)
- **Access:** All citizen data (read/write)
- **Capabilities:**
  - View all certificates
  - Process certificate applications
  - Approve/Reject certificates
  - View all complaints
  - Update complaint status
  - Manage schemes
  - Post notices

### 3. **Admin** (Sarpanch/Secretary)
- **Access:** Full system access
- **Capabilities:**
  - All Clerk permissions
  - Approve/Reject citizen registrations
  - Manage users (Clerks, Citizens)
  - View analytics
  - Manage notices
  - System settings

---

## Authentication Flow

### Registration Process
1. **Public Registration Request Page** (`/register`)
   - Citizen fills registration form
   - Request saved as "pending"
   - Admin reviews and approves/rejects

2. **Login Page** (`/login`)
   - Role selection: Citizen, Clerk, Admin
   - Credentials validation
   - JWT token generation
   - Role-based redirect

3. **Session Management**
   - Store JWT in localStorage/cookies
   - Auto-logout on token expiry
   - Role-based route protection

---

## Pages & Routes

### Public Pages

#### 1. Landing Page (`/`)
**Purpose:** Public homepage  
**Features:**
- Hero section with stats
- Services overview (4 cards)
- Notice board preview (3 items)
- Contact information
- Login/Register CTAs

#### 2. Registration Page (`/register`)
**Purpose:** New citizen registration request  
**Form Fields:** (See Form Fields section)
**Features:**
- Success message after submission
- Redirect to login
- Link back to home

#### 3. Login Page (`/login`)
**Purpose:** User authentication  
**Form Fields:**
- Email/Mobile
- Password
- Role (dropdown: citizen, clerk, admin)
**Features:**
- Role-based validation
- Citizen: Check approved status
- Admin/Clerk: Default credentials
- Link to registration

---

### Citizen Pages (Protected Routes)

#### 1. Citizen Dashboard (`/citizen/dashboard`)
**Features:**
- Welcome message
- Stats cards (4): Applied, Active, Approved, Pending
- Quick actions (2 cards):
  - Apply for Certificate
  - Lodge a Complaint
- Recent activities timeline
- Notice board
- Village stats (progress bars)

#### 2. Certificates Page (`/citizen/certificates`)
**Features:**
- List all certificates (filterable by status)
- Status: Pending, Approved, Rejected
- Download approved certificates
- View rejection reasons

#### 3. Apply Certificate Page (`/citizen/certificates/apply`)
**Form Fields:**
- Certificate Type (dropdown)
- Applicant Details
- Upload documents
**Features:**
- Multi-step form
- Preview before submit
- Success confirmation

#### 4. Complaints Page (`/citizen/complaints`)
**Features:**
- List all complaints (filterable)
- Status: Open, In Progress, Resolved, Closed
- View complaint details
- Track progress

#### 5. New Complaint Page (`/citizen/complaints/new`)
**Form Fields:**
- Complaint Type (Water, Road, Electricity, Other)
- Description
- Location
- Upload photos (optional)
**Features:**
- Image upload support
- Success message with complaint ID

#### 6. Schemes Page (`/citizen/schemes`)
**Features:**
- List all government schemes
- Filter by eligibility
- Apply for schemes
- View application status

#### 7. Profile Page (`/citizen/profile`)
**Features:**
- View/Edit personal details
- Change password
- View registration status

---

### Clerk Pages (Protected Routes)

#### 1. Clerk Dashboard (`/clerk/dashboard`)
**Features:**
- Stats: Total applications, pending, approved today
- Recent activities
- Quick links to manage certificates/complaints

#### 2. Manage Certificates (`/clerk/certificates`)
**Features:**
- List all certificate applications
- Filter by status, type, date
- Search by applicant name/ID
- Approve/Reject with remarks

#### 3. Certificate Details (`/clerk/certificates/[id]`)
**Features:**
- View full application
- Applicant details
- Documents uploaded
- Approve/Reject buttons
- Add remarks

#### 4. Manage Complaints (`/clerk/complaints`)
**Features:**
- List all complaints
- Filter by status, type
- Assign to self
- Update status

#### 5. Complaint Details (`/clerk/complaints/[id]`)
**Features:**
- View complaint details
- Update status
- Add comments/notes
- Close complaint

#### 6. Manage Schemes (`/clerk/schemes`)
**Features:**
- Add new schemes
- Edit existing schemes
- View applications

#### 7. Notices Page (`/clerk/notices`)
**Features:**
- Create new notice
- Edit/Delete notices
- Set expiry date

---

### Admin Pages (Protected Routes)

#### 1. Admin Dashboard (`/admin/dashboard`)
**Features:**
- Comprehensive stats
- Charts (pending vs approved)
- User analytics
- System health

#### 2. Registration Requests (`/admin/registration-requests`)
**Features:**
- List all pending registrations
- View applicant details (All fields from registration form)
- Filter by status: All, Pending, Approved, Rejected
- Search by name, email, Aadhaar
- Stats cards: Total, Pending, Approved, Rejected
**Actions:**
- Approve button (creates user account)
- Reject button (with reason)

#### 3. Manage Certificates (`/admin/certificates`)
**Features:**
- Same as Clerk + Override capability
- View all certificates across all users

#### 4. Manage Complaints (`/admin/complaints`)
**Features:**
- Same as Clerk + Reassign capability
- Analytics on complaint resolution

#### 5. User Management (`/admin/users`)
**Features:**
- List all users (Citizens, Clerks)
- Add new clerk
- Deactivate users
- Reset passwords

#### 6. Notices Management (`/admin/notices`)
**Features:**
- Create/Edit/Delete notices
- Publish/Unpublish

#### 7. Analytics (`/admin/analytics`)
**Features:**
- Certificate stats
- Complaint trends
- User growth
- Scheme utilization

---

## Database Schema Requirements

### 1. **Users Table**
```sql
users:
  - id (PK, UUID)
  - email (UNIQUE, NOT NULL)
  - password_hash (NOT NULL)
  - role (ENUM: 'citizen', 'clerk', 'admin')
  - full_name
  - mobile
  - is_active (BOOLEAN, default: true)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### 2. **Registration Requests Table**
```sql
registration_requests:
  - id (PK, UUID)
  - full_name (NOT NULL)
  - date_of_birth (DATE, NOT NULL)
  - gender (ENUM: 'male', 'female', 'other')
  - aadhaar_number (UNIQUE, NOT NULL)
  - email (UNIQUE, NOT NULL)
  - mobile (NOT NULL)
  - address (TEXT, NOT NULL)
  - village (NOT NULL)
  - pincode (NOT NULL)
  - password_hash (NOT NULL)
  - status (ENUM: 'pending', 'approved', 'rejected', default: 'pending')
  - submitted_at (TIMESTAMP)
  - reviewed_at (TIMESTAMP, NULL)
  - reviewed_by (FK -> users.id, NULL)
  - rejection_reason (TEXT, NULL)
```

### 3. **Citizen Profiles Table**
```sql
citizen_profiles:
  - id (PK, UUID)
  - user_id (FK -> users.id, UNIQUE)
  - aadhaar_number (UNIQUE)
  - date_of_birth (DATE)
  - gender (ENUM)
  - address (TEXT)
  - village
  - pincode
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### 4. **Certificates Table**
```sql
certificates:
  - id (PK, UUID)
  - application_number (UNIQUE, AUTO-GENERATED)
  - citizen_id (FK -> users.id)
  - certificate_type (ENUM: 'birth', 'death', 'income', 'residence')
  - applicant_name
  - father_name (for birth/death)
  - mother_name (for birth/death)
  - date_of_birth (for birth)
  - date_of_death (for death)
  - place_of_birth (for birth)
  - place_of_death (for death)
  - annual_income (for income)
  - address (for residence)
  - purpose (TEXT)
  - status (ENUM: 'pending', 'approved', 'rejected', default: 'pending')
  - submitted_at (TIMESTAMP)
  - processed_at (TIMESTAMP, NULL)
  - processed_by (FK -> users.id, NULL)
  - remarks (TEXT, NULL)
  - certificate_url (TEXT, NULL) -- PDF download link
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### 5. **Certificate Documents Table**
```sql
certificate_documents:
  - id (PK, UUID)
  - certificate_id (FK -> certificates.id)
  - document_type (e.g., 'aadhaar', 'birth_proof', 'address_proof')
  - file_url (TEXT)
  - uploaded_at (TIMESTAMP)
```

### 6. **Complaints Table**
```sql
complaints:
  - id (PK, UUID)
  - complaint_number (UNIQUE, AUTO-GENERATED)
  - citizen_id (FK -> users.id)
  - complaint_type (ENUM: 'water', 'road', 'electricity', 'other')
  - subject (TEXT, NOT NULL)
  - description (TEXT, NOT NULL)
  - location (TEXT)
  - status (ENUM: 'open', 'in_progress', 'resolved', 'closed', default: 'open')
  - priority (ENUM: 'low', 'medium', 'high', default: 'medium')
  - assigned_to (FK -> users.id, NULL)
  - submitted_at (TIMESTAMP)
  - resolved_at (TIMESTAMP, NULL)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### 7. **Complaint Images Table**
```sql
complaint_images:
  - id (PK, UUID)
  - complaint_id (FK -> complaints.id)
  - image_url (TEXT)
  - uploaded_at (TIMESTAMP)
```

### 8. **Complaint Comments Table**
```sql
complaint_comments:
  - id (PK, UUID)
  - complaint_id (FK -> complaints.id)
  - user_id (FK -> users.id)
  - comment (TEXT)
  - created_at (TIMESTAMP)
```

### 9. **Schemes Table**
```sql
schemes:
  - id (PK, UUID)
  - scheme_name (NOT NULL)
  - scheme_code (UNIQUE)
  - description (TEXT)
  - eligibility_criteria (TEXT)
  - benefits (TEXT)
  - start_date (DATE)
  - end_date (DATE, NULL)
  - is_active (BOOLEAN, default: true)
  - created_by (FK -> users.id)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

### 10. **Scheme Applications Table**
```sql
scheme_applications:
  - id (PK, UUID)
  - application_number (UNIQUE, AUTO-GENERATED)
  - scheme_id (FK -> schemes.id)
  - citizen_id (FK -> users.id)
  - status (ENUM: 'pending', 'approved', 'rejected', default: 'pending')
  - submitted_at (TIMESTAMP)
  - processed_at (TIMESTAMP, NULL)
  - processed_by (FK -> users.id, NULL)
  - remarks (TEXT, NULL)
```

### 11. **Notices Table**
```sql
notices:
  - id (PK, UUID)
  - title (NOT NULL)
  - content (TEXT, NOT NULL)
  - notice_type (ENUM: 'important', 'update', 'success', 'general')
  - is_published (BOOLEAN, default: false)
  - published_at (TIMESTAMP, NULL)
  - expiry_date (DATE, NULL)
  - created_by (FK -> users.id)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

---

## API Endpoints Needed

### Authentication Endpoints

```
POST   /api/auth/register              # New citizen registration request
POST   /api/auth/login                 # User login
POST   /api/auth/logout                # User logout
POST   /api/auth/refresh               # Refresh JWT token
POST   /api/auth/forgot-password       # Request password reset
POST   /api/auth/reset-password        # Reset password
GET    /api/auth/me                    # Get current user info
```

### Citizen Endpoints

```
GET    /api/citizen/dashboard          # Dashboard stats
GET    /api/citizen/profile            # Get profile
PUT    /api/citizen/profile            # Update profile
POST   /api/citizen/change-password    # Change password

# Certificates
GET    /api/citizen/certificates                    # List all certificates
GET    /api/citizen/certificates/:id                # Get certificate details
POST   /api/citizen/certificates                    # Apply for certificate
POST   /api/citizen/certificates/:id/documents      # Upload documents
GET    /api/citizen/certificates/:id/download       # Download certificate PDF

# Complaints
GET    /api/citizen/complaints                      # List all complaints
GET    /api/citizen/complaints/:id                  # Get complaint details
POST   /api/citizen/complaints                      # Register new complaint
POST   /api/citizen/complaints/:id/images          # Upload complaint images

# Schemes
GET    /api/citizen/schemes                         # List all schemes
GET    /api/citizen/schemes/:id                     # Get scheme details
POST   /api/citizen/schemes/:id/apply               # Apply for scheme
GET    /api/citizen/scheme-applications             # My applications
```

### Clerk Endpoints

```
GET    /api/clerk/dashboard            # Dashboard stats

# Certificates Management
GET    /api/clerk/certificates                      # List all certificates
GET    /api/clerk/certificates/:id                  # Get certificate details
PUT    /api/clerk/certificates/:id/approve          # Approve certificate
PUT    /api/clerk/certificates/:id/reject           # Reject certificate
POST   /api/clerk/certificates/:id/generate-pdf     # Generate certificate PDF

# Complaints Management
GET    /api/clerk/complaints                        # List all complaints
GET    /api/clerk/complaints/:id                    # Get complaint details
PUT    /api/clerk/complaints/:id/assign             # Assign complaint
PUT    /api/clerk/complaints/:id/status             # Update status
POST   /api/clerk/complaints/:id/comments           # Add comment

# Schemes Management
POST   /api/clerk/schemes                           # Create scheme
PUT    /api/clerk/schemes/:id                       # Update scheme
GET    /api/clerk/schemes/:id/applications          # View applications

# Notices
POST   /api/clerk/notices                           # Create notice
PUT    /api/clerk/notices/:id                       # Update notice
DELETE /api/clerk/notices/:id                       # Delete notice
```

### Admin Endpoints

```
GET    /api/admin/dashboard            # Dashboard with analytics

# Registration Requests
GET    /api/admin/registration-requests             # List all requests
GET    /api/admin/registration-requests/:id         # Get request details
PUT    /api/admin/registration-requests/:id/approve # Approve request
PUT    /api/admin/registration-requests/:id/reject  # Reject request

# User Management
GET    /api/admin/users                             # List all users
POST   /api/admin/users                             # Create user (Clerk)
PUT    /api/admin/users/:id                         # Update user
DELETE /api/admin/users/:id                         # Deactivate user
POST   /api/admin/users/:id/reset-password          # Reset password

# All Clerk permissions + analytics
GET    /api/admin/analytics/certificates            # Certificate stats
GET    /api/admin/analytics/complaints              # Complaint trends
GET    /api/admin/analytics/users                   # User growth
GET    /api/admin/analytics/schemes                 # Scheme utilization
```

### Public Endpoints

```
GET    /api/public/notices                          # Latest notices
GET    /api/public/schemes                          # Active schemes
```

---

## Form Fields & Validation

### Registration Form (`/register`)
```javascript
{
  fullName: {
    type: "text",
    required: true,
    label: "Full Name (as per Aadhaar)",
    validation: "min 3 chars, max 100 chars"
  },
  dateOfBirth: {
    type: "date",
    required: true,
    label: "Date of Birth",
    validation: "must be 18+ years old"
  },
  gender: {
    type: "select",
    required: true,
    options: ["male", "female", "other"],
    label: "Gender"
  },
  aadhaarNumber: {
    type: "text",
    required: true,
    label: "Aadhaar Number",
    validation: "exactly 12 digits, unique"
  },
  email: {
    type: "email",
    required: true,
    label: "Email Address",
    validation: "valid email format, unique"
  },
  mobile: {
    type: "tel",
    required: true,
    label: "Mobile Number",
    validation: "exactly 10 digits"
  },
  address: {
    type: "textarea",
    required: true,
    label: "Complete Address",
    validation: "min 10 chars"
  },
  village: {
    type: "text",
    required: true,
    label: "Village/Town",
    default: "Sarahi"
  },
  pincode: {
    type: "text",
    required: true,
    label: "PIN Code",
    validation: "exactly 6 digits"
  },
  password: {
    type: "password",
    required: true,
    label: "Password",
    validation: "min 6 chars"
  },
  confirmPassword: {
    type: "password",
    required: true,
    label: "Confirm Password",
    validation: "must match password"
  }
}
```

### Login Form (`/login`)
```javascript
{
  email: {
    type: "email",
    required: true,
    label: "Email or Mobile"
  },
  password: {
    type: "password",
    required: true,
    label: "Password"
  },
  role: {
    type: "select",
    required: true,
    options: ["citizen", "clerk", "admin"],
    default: "citizen"
  }
}
```

### Certificate Application Form
```javascript
{
  certificateType: {
    type: "select",
    required: true,
    options: ["birth", "death", "income", "residence"]
  },
  // Dynamic fields based on type
  
  // For Birth Certificate:
  childName: { type: "text", required: true },
  fatherName: { type: "text", required: true },
  motherName: { type: "text", required: true },
  dateOfBirth: { type: "date", required: true },
  placeOfBirth: { type: "text", required: true },
  
  // For Death Certificate:
  deceasedName: { type: "text", required: true },
  dateOfDeath: { type: "date", required: true },
  placeOfDeath: { type: "text", required: true },
  causeOfDeath: { type: "text" },
  
  // For Income Certificate:
  applicantName: { type: "text", required: true },
  annualIncome: { type: "number", required: true },
  sourceOfIncome: { type: "text", required: true },
  
  // For Residence Certificate:
  applicantName: { type: "text", required: true },
  residentialAddress: { type: "textarea", required: true },
  yearsOfResidence: { type: "number", required: true },
  
  // Common fields:
  purpose: { type: "text", required: true },
  documents: { type: "file[]", required: true }
}
```

### Complaint Form
```javascript
{
  complaintType: {
    type: "select",
    required: true,
    options: ["water", "road", "electricity", "other"]
  },
  subject: {
    type: "text",
    required: true,
    validation: "min 5 chars, max 200 chars"
  },
  description: {
    type: "textarea",
    required: true,
    validation: "min 20 chars"
  },
  location: {
    type: "text",
    required: false
  },
  images: {
    type: "file[]",
    required: false,
    validation: "max 5 images, max 5MB each"
  }
}
```

---

## File Structure

```
panchayat-frontend/
├── app/
│   ├── page.js                          # Landing page
│   ├── login/page.js                    # Login page
│   ├── register/page.js                 # Registration page
│   │
│   ├── citizen/
│   │   ├── layout.js                    # Citizen layout with sidebar
│   │   ├── dashboard/page.js
│   │   ├── profile/page.js
│   │   ├── certificates/
│   │   │   ├── page.js                  # List certificates
│   │   │   └── apply/page.js            # Apply for certificate
│   │   ├── complaints/
│   │   │   ├── page.js                  # List complaints
│   │   │   └── new/page.js              # New complaint
│   │   └── schemes/page.js
│   │
│   ├── clerk/
│   │   ├── layout.js                    # Clerk layout with sidebar
│   │   ├── dashboard/page.js
│   │   ├── certificates/
│   │   │   ├── page.js                  # Manage certificates
│   │   │   └── [id]/page.js             # Certificate details
│   │   ├── complaints/
│   │   │   ├── page.js                  # Manage complaints
│   │   │   └── [id]/page.js             # Complaint details
│   │   ├── schemes/page.js
│   │   └── notices/page.js
│   │
│   └── admin/
│       ├── layout.js                    # Admin layout with sidebar
│       ├── dashboard/page.js
│       ├── registration-requests/page.js
│       ├── certificates/page.js
│       ├── complaints/page.js
│       ├── users/page.js
│       ├── notices/page.js
│       └── analytics/page.js
│
├── components/
│   ├── ui/
│   │   ├── Button.js
│   │   └── Card.js
│   └── layout/
│       ├── Header.js
│       └── Sidebar.js
│
└── app/globals.css
```

---

## Color Scheme (Design System)

```css
Primary: #059669 (Emerald 600)
Primary Dark: #047857 (Emerald 700)
Primary Light: #34d399 (Emerald 400)

Background: #F8FAFC (Slate 50)
Surface: #FFFFFF (White)
Text: #0F172A (Slate 900)

Success: #10B981 (Emerald 500)
Error: #EF4444 (Red 500)
Warning: #F59E0B (Amber 500)
Info: #3B82F6 (Blue 500)
```

---

## Additional Backend Requirements

### 1. **File Upload**
- Support for image uploads (complaints)
- Support for document uploads (certificates)
- Store in cloud storage (AWS S3 / Cloudinary)
- Return public URLs

### 2. **PDF Generation**
- Generate certificate PDFs
- Include QR code for verification
- Watermark with panchayat seal

### 3. **Email Notifications**
- Registration approval/rejection
- Certificate approval
- Complaint status updates
- Password reset

### 4. **SMS Notifications** (Optional)
- OTP for mobile verification
- Application status updates

### 5. **Security**
- JWT authentication
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Input validation & sanitization
- CORS configuration
- Rate limiting

### 6. **Analytics**
- Track user actions
- Generate reports
- Export data as CSV/Excel

---

## Next Steps for Backend Development

1. **Setup Project**
   - Initialize Node.js/FastAPI project
   - Setup MySQL/PostgreSQL database
   - Configure environment variables

2. **Database**
   - Create tables based on schema
   - Setup migrations
   - Seed initial data (admin user)

3. **Authentication**
   - Implement JWT authentication
   - Create auth middleware
   - Implement role-based access

4. **API Development**
   - Build REST API endpoints
   - Implement validation
   - Error handling

5. **File Handling**
   - Setup file upload
   - Configure cloud storage
   - PDF generation

6. **Testing**
   - Unit tests
   - Integration tests
   - API testing with Postman

7. **Deployment**
   - Setup CI/CD
   - Deploy to production
   - Configure SSL

---

## Contact & Support

For any clarifications or additional requirements, please refer to this document or contact the development team.

**Version History:**
- v1.0 - Initial specification (January 2026)

---

**End of Document**
