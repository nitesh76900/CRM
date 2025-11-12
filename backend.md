# Backend Planning Documentation

## Database Collections Schema

### 1. BlockedToken Schema
- **token** (String, required, unique) - The token to be blocked
- **expiresAt** (Date, default: 7 days from creation, expires: '7d') - Expiration date for the blocked token

### 2. Company Schema
- **name** (String, required, trim, minLength: 3) - The company's name
- **phoneNo** (String, required, unique, match: /^\d{10,15}$/) - The company's contact number
- **email** (String, required, unique, lowercase, trim) - The company's email address
- **industry** (String, required, trim) - The industry the company operates in
- **image** - Stores the company's image details:
  - **public_id** (String, required) - The image's public ID
  - **url** (String, required) - The image's URL
- **address** - The company's address details:
  - **country** (String, required) - The country
  - **state** (String, required) - The state
  - **city** (String, required) - The city
  - **pincode** (String, required, match: /^\d{4,10}$/) - The postal code
- **owner** (ObjectId, references User, required) - The user who owns the company
- **employees** (Array<ObjectId>, references Employee) - List of employees in the company
- **verify** (String, enum: Pending, Verify, Rejected, default: Pending) - Verification status
- **verifyBy** (ObjectId, references User) - User who verified the company
- **isActive** (Boolean, default: true) - Indicates if the company is active
- **timestamps** - Automatically stores creation and update times

### 3. User Schema
- **name** (String, required, minLength: 3) - The full name of the user
- **email** (String, required, unique, lowercase) - The email address of the user
- **phoneNo** (String, required, unique, match: /^\d{10,15}$/) - The user's phone number
- **password** (String, required) - The password for authentication
- **role** (String, enum: SuperAdmin, CompanyAdmin, Employee, default: Employee) - The role assigned to the user
- **company** (ObjectId, references Company, default: null) - The company associated with the user
  - Custom validation: Must be null for SuperAdmin role
- **timestamps** - Automatically stores creation and update times

### 4. Employee Schema
- **user** (ObjectId, references User, required) - The associated user
- **image** - Stores the employee's image details:
  - **public_id** (String, required) - The image's public ID
  - **url** (String, required) - The image's URL
- **address** - The employee's address details:
  - **country** (String, required) - The country
  - **state** (String, required) - The state
  - **city** (String, required) - The city
  - **pincode** (String, required, match: /^\d{4,10}$/) - The postal code
- **designation** (String, required) - The employee's job designation
- **company** (ObjectId, references Company, required) - The company the employee belongs to
- **role** (ObjectId, references Role) - The role assigned to the employee
- **verify** (String, enum: Pending, Verify, Rejected, default: Pending) - Verification status
- **isActive** (Boolean, default: true) - Whether the employee is active
- **timestamps** - Automatically stores creation and update times

### 5. Role Schema
- **name** (String, required, minLength: 3, maxLength: 50) - The role name
- **permissions** - Defines CRUD permissions for different features:
  - **leads** - Permission set for lead management:
    - **create** (Boolean, default: false)
    - **read** (Boolean, default: false)
    - **update** (Boolean, default: false)
    - **delete** (Boolean, default: false)
  - **tasks** - Permission set for task management:
    - **create** (Boolean, default: false)
    - **read** (Boolean, default: false)
    - **update** (Boolean, default: false)
    - **delete** (Boolean, default: false)
  - **meeting** - Permission set for meeting management:
    - **create** (Boolean, default: false)
    - **read** (Boolean, default: false)
    - **update** (Boolean, default: false)
    - **delete** (Boolean, default: false)
- **isActive** (Boolean, default: true) - Whether the role is active
- **company** (ObjectId, references Company, required) - The company to which the role belongs
- **timestamps** - Automatically stores creation and update times

### 6. Todo Schema
- **user** (ObjectId, references User, required) - The user who created the todo
- **company** (ObjectId, references Company, required) - The company the todo belongs to
- **title** (String, required, minLength: 3, maxLength: 100) - The todo title
- **description** (String, required, minLength: 5) - Detailed description of the todo
- **priority** (String, enum: High, Medium, Low, default: Medium) - The priority level
- **conclusion** (String) - The conclusion of the todo
- **conclusionSubmitTime** (Date) - When the conclusion was submitted
- **timestamps** - Automatically stores creation and update times

### 7. Meeting Schema
- **title** (String, required) - The meeting title
- **participants** (Array<ObjectId>, references User, required) - List of users attending the meeting
- **forLead** (ObjectId, references Lead) - Associated lead if the meeting is lead-related
- **scheduledTime** (Date, required) - The scheduled meeting time
- **agenda** (String, required) - The meeting agenda
- **addParticipants** (Array<ObjectId>, references Contacts) - Additional contact participants
- **company** (ObjectId, references Company, required) - The company hosting the meeting
- **timestamps** - Automatically stores creation and update times

### 8. TaskAssigned Schema
- **company** (ObjectId, references Company, required) - The company the task belongs to
- **title** (String, required) - The task title
- **description** (String, required) - The task description
- **priority** (String, enum: High, Medium, Low, default: Medium) - The task priority
- **assignedTo** (ObjectId, references Employee, required) - The employee assigned to the task
- **assignedBy** (ObjectId, references User, required) - The user who assigned the task
- **dueDate** (Date, required) - The deadline for the task
- **conclusion** (String) - The task conclusion
- **conclusionSubmitTime** (Date) - When the conclusion was submitted
- **timestamps** - Automatically stores creation and update times

### 9. LeadFor Schema
- **company** (ObjectId, references Company, required) - The company the lead category belongs to
- **name** (String, required, minLength: 3) - The name of the lead category
- **isActive** (Boolean, default: true) - Whether the lead category is active
- **timestamps** - Automatically stores creation and update times

### 10. LeadSource Schema
- **company** (ObjectId, references Company, required) - The company the lead source belongs to
- **name** (String, required, minLength: 3) - The name of the lead source
- **isActive** (Boolean, default: true) - Whether the lead source is active
- **timestamps** - Automatically stores creation and update times

### 11. LeadStatusLabel Schema
- **company** (ObjectId, references Company, required) - The company the status label belongs to
- **name** (String, required, minLength: 3, trim: true) - The name of the status label
- **timestamps** - Automatically stores creation and update times

### 12. Lead Schema
- **for** (ObjectId, references LeadFor, required) - The purpose of the lead
- **source** (ObjectId, references LeadSource, required) - The source of the lead
- **priority** (String, enum: Low, Medium, High, default: Medium) - The priority level
- **contact** (ObjectId, references Contacts, required) - The lead's contact information
- **reference** - Reference contact information:
  - **name** (String, trim: true) - Reference name
  - **email** (String, lowercase, match: email pattern) - Reference email
  - **phoneNo** (String, match: /^\d{10,15}$/) - Reference phone number
- **followUps** - Array of follow-up records:
  - **sequence** (Number, required) - Follow-up sequence number
  - **date** (Date, required) - Follow-up date
  - **conclusion** (String, trim: true) - Follow-up conclusion
  - **meeting** (ObjectId, references Meeting) - Associated meeting
- **status** (ObjectId, references LeadStatusLabel, required) - The current status of the lead
- **remark** (String, trim: true) - Additional remarks
- **assignedTo** (ObjectId, references Employee, required) - The employee handling the lead
- **company** (ObjectId, references Company, required) - The company associated with the lead
- **timestamps** - Automatically stores creation and update times

### 13. Contacts Schema
- **name** (String, required, trim: true) - The contact's name
- **phoneNo** (String, match: /^\d{10,15}$/) - The contact's phone number
- **email** (String, required, lowercase, trim: true) - The contact's email address
- **address** - The contact's address details:
  - **country** (String) - The country
  - **state** (String) - The state
  - **city** (String) - The city
  - **pincode** (String, match: /^\d{4,10}$/) - The postal code
- **businessCard** - Business card image details:
  - **public_id** (String, required) - The image's public ID
  - **url** (String, required) - The image's URL
- **isClient** (Boolean, default: false) - Indicates if the contact is a client
- **company** (ObjectId, references Company, required) - The company associated with the contact
- **timestamps** - Automatically stores creation and update times

## Schema Relationships Overview

1. User-Company Relationship:
   - Users can belong to one company (except SuperAdmin)
   - Companies have one owner (User)
   - Companies can have multiple employees (Users)
   - Companies require verification (Pending, Verify, Rejected) with verifier tracking

2. Role-Based Access:
   - Users have a role (SuperAdmin, CompanyAdmin, Employee)
   - Companies can define custom roles with specific permissions
   - Employees are assigned roles within their company

3. Lead Management:
   - Leads are associated with a company
   - Leads have a source (LeadSource) and purpose (LeadFor)
   - Leads are assigned to employees
   - Leads can have associated meetings and follow-ups
   - Lead status is managed through customizable status labels (LeadStatusLabel)
   - Lead contacts are managed through the Contacts collection

4. Task Management:
   - Tasks (TaskAssigned) are company-specific
   - Tasks are assigned to employees by users
   - Todos are personal tasks linked to both user and company

5. Meeting Organization:
   - Meetings are company-specific
   - Meetings can be associated with leads
   - Meetings can include both internal users and external contacts

6. Security:
   - Blocked tokens are tracked with automatic expiration after 7 days
   - All schemas include timestamps for creation and update tracking
   - Proper validation rules for required fields, string lengths, and data formats
   - String fields are automatically trimmed unless otherwise specified

Key Features:
1. Comprehensive company verification system
2. Flexible role-based permissions system
3. Integrated contact management
4. Structured lead tracking and follow-up system
5. Task and meeting management with priority levels
6. Token blacklisting for security