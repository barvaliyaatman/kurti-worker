# API Specification

## Project Information

**Project Name:** Worker Management ERP for Kurti Manufacturing Factory

**Document Version:** 1.0

**Status:** Draft

---

# 1. API Standards

Base URL

/api/v1

Authentication

JWT Token

Request Format

JSON

Response Format

JSON

HTTP Status Codes

200 - Success

201 - Created

400 - Validation Error

401 - Unauthorized

403 - Forbidden

404 - Not Found

409 - Duplicate Record

500 - Internal Server Error

---

# 2. Authentication APIs

## Login

POST

/auth/login

Request

{
    "email": "owner@factory.com",
    "password": "password"
}

Response

{
    "token": "...",
    "user": {}
}

Permission

Public

---

## Logout

POST

/auth/logout

Permission

Owner

Manager

Cutting Master

---

## Current User

GET

/auth/me

Permission

Authenticated User

---

# 3. Dashboard APIs

## Dashboard Summary

GET

/dashboard

Response

{
    "employees": 120,
    "jobCards": 12,
    "readyCutting": 4,
    "cutting": 2,
    "completed": 6,
    "salaryPending": 15
}

Permission

All Users

---

# 4. Employee APIs

## Get Employees

GET

/employees

Supports

Search

Filter

Pagination

Permission

Owner

Manager

---

## Employee Details

GET

/employees/:id

---

## Create Employee

POST

/employees

Permission

Owner

---

## Update Employee

PUT

/employees/:id

Permission

Owner

---

## Disable Employee

PATCH

/employees/:id/status

Permission

Owner

---

## Delete Employee

DELETE

/employees/:id

Only if employee has no work history.

Permission

Owner

---

# 5. Job Card APIs

## Job Card List

GET

/job-cards

---

## Job Card Details

GET

/job-cards/:id

---

## Create Job Card

POST

/job-cards

Permission

Owner

---

## Update Job Card

PUT

/job-cards/:id

Permission

Owner

---

## Send To Cutting

POST

/job-cards/:id/send-cutting

Permission

Owner

---

# 6. Cutting APIs

## Ready For Cutting

GET

/cutting

Permission

Cutting Master

---

## Start Cutting

POST

/cutting/:id/start

Permission

Cutting Master

---

## Complete Cutting

POST

/cutting/:id/complete

Permission

Cutting Master

---

# 7. Bundle APIs

## Bundle List

GET

/bundles

Permission

Manager

---

## Bundle Details

GET

/bundles/:id

Permission

Manager

---

# 8. Assignment APIs

## Assignment List

GET

/assignments

---

## Create Assignment

POST

/assignments

Request

{
    "bundleId": "",
    "employeeId": "",
    "assignedQty": 20
}

Permission

Manager

---

## Update Assignment

PUT

/assignments/:id

---

## Complete Assignment

POST

/assignments/:id/complete

Request

{
    "completedQty":20
}

---

## Cancel Assignment

POST

/assignments/:id/cancel

---

# 9. Employee Ledger APIs

## Employee Ledger

GET

/employees/:id/ledger

Permission

Manager

Owner

---

# 10. Salary APIs

## Salary List

GET

/salaries

---

## Employee Salary

GET

/salaries/:employeeId

---

## Monthly Salary

GET

/salaries/month/:month

---

# 11. Advance APIs

## Advance List

GET

/advances

---

## Add Advance

POST

/advances

---

## Update Advance

PUT

/advances/:id

---

## Delete Advance

DELETE

/advances/:id

---

# 12. Salary Payment APIs

## Payment List

GET

/payments

---

## Create Payment

POST

/payments

---

## Payment Details

GET

/payments/:id

---

# 13. Report APIs

## Employee Productivity

GET

/reports/productivity

---

## Salary Report

GET

/reports/salary

---

## Advance Report

GET

/reports/advance

---

## Payment Report

GET

/reports/payment

---

## Production Report

GET

/reports/production

---

# 14. Validation Rules

Employee

- Employee Code must be unique.
- Phone Number must be unique.
- Piece Rate must be greater than zero.

Job Card

- Job Card Number must be unique.
- Quantity must be greater than zero.
- Due Date is required.

Assignment

- Assigned Quantity cannot exceed Remaining Quantity.
- Completed Quantity cannot exceed Assigned Quantity.

Salary

- Payment Amount cannot exceed Balance Amount.

Advance

- Amount must be greater than zero.

---

# 15. Permission Matrix

| API | Owner | Cutting Master | Manager |
|------|--------|----------------|----------|
| Login | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Employees | ✅ | ❌ | ✅ (View Only) |
| Job Cards | ✅ | ❌ | View Only |
| Cutting | ❌ | ✅ | ❌ |
| Assignment | ❌ | ❌ | ✅ |
| Salary | ✅ | ❌ | ✅ |
| Advance | ✅ | ❌ | ✅ |
| Payment | ✅ | ❌ | ✅ |
| Reports | ✅ | ❌ | ✅ |

---

# 16. Response Format

Success Response

{
    "success": true,
    "message": "Data fetched successfully",
    "data": {}
}

Validation Error

{
    "success": false,
    "message": "Validation failed",
    "errors": {}
}

Server Error

{
    "success": false,
    "message": "Internal Server Error"
}

---

# 17. API Security

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Input Validation
- SQL Injection Protection
- XSS Protection
- Rate Limiting
- Audit Logging

---

# 18. Future APIs

The following APIs will be added in future versions.

- Inventory APIs
- Purchase APIs
- Supplier APIs
- Customer APIs
- Sales APIs
- Dispatch APIs
- Packing APIs
- QC APIs
- Barcode APIs
- Notification APIs