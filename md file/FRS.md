# Functional Requirement Specification (FRS)

## Project Information

**Project Name:** Worker Management ERP for Kurti Manufacturing Factory

**Document Version:** 1.0

**Document Status:** Draft

**Prepared By:** Functional Analysis Team

**Based On:** Business Requirement Specification (BRS) Version 1.0

---

# Table of Contents

1. Introduction
2. Functional Overview
3. User Roles
4. Dashboard Module
5. Employee Management Module
6. Job Card Management Module
7. Cutting Management Module
8. Work Assignment Module
9. Employee Ledger Module
10. Salary Management Module
11. Advance Management Module
12. Salary Payment Module
13. Reports Module
14. System-wide Functional Requirements
15. Validation Rules
16. Permission Matrix
17. Status Flow
18. Acceptance Criteria

---

# 1. Introduction

The purpose of this document is to describe how every feature of the Worker Management ERP should function.

This document acts as the implementation guide for developers, UI/UX designers, QA engineers, and database architects.

Unlike the Business Requirement Specification, this document focuses on software behavior, business logic, validations, workflows, permissions, and user interactions.

No technical implementation or database design is included in this document.

---

# 2. Functional Overview

The Worker Management ERP manages the production workflow from Job Card creation to salary payment.

The system includes the following functional modules:

- Dashboard
- Employee Management
- Job Card Management
- Cutting Management
- Work Assignment
- Employee Ledger
- Salary Management
- Advance Management
- Salary Payment
- Reports

Each module has clearly defined responsibilities, validations, and permissions.

---

# 3. User Roles

## Owner

Permissions

- Full System Access
- Employee Management
- Job Card Management
- Dashboard
- Reports
- Salary
- Payments
- Settings

---

## Cutting Master

Permissions

- View Ready For Cutting Job Cards
- Start Cutting
- Complete Cutting

Restrictions

- Cannot create Job Cards
- Cannot assign workers
- Cannot manage salary

---

## Manager

Permissions

- View Cutting Completed Job Cards
- Assign Work
- Update Completed Quantity
- Manage Advances
- Salary Payments
- Employee Ledger

Restrictions

- Cannot create Job Cards
- Cannot send Job Cards to Cutting

---

# 4. Dashboard Module

## Purpose

Provide a real-time overview of factory production.

## Functional Requirements

The dashboard shall display:

- Total Employees
- Active Job Cards
- Ready For Cutting
- Cutting In Progress
- Cutting Completed
- Pending Work Assignments
- Completed Work Today
- Pending Salary
- Recent Activities

## User Actions

- View dashboard
- Filter by date
- Open module shortcuts

## Business Logic

- Data must refresh automatically.
- Counts should reflect only active records.
- Dashboard visibility depends on user role.

## Acceptance Criteria

- Dashboard loads within acceptable time.
- Only authorized data is visible.
- KPI values are accurate.

---

# 5. Employee Management Module

## Purpose

Manage factory employees.

## Features

- Add Employee
- Edit Employee
- Disable Employee
- View Employee Profile
- Search Employees
- Filter Employees

## Employee Information

- Employee Code
- Name
- Phone
- Role
- Piece Rate
- Joining Date
- Status
- Notes

## Validations

- Employee Code must be unique.
- Name is mandatory.
- Piece Rate must be greater than zero.
- Disabled employees cannot receive assignments.

## Business Logic

Deleting employees is not allowed.

Employees with production history remain in the system permanently.

## Acceptance Criteria

- Employee can be created successfully.
- Duplicate Employee Code is rejected.
- Disabled employee is hidden from assignment list.

---

# 6. Job Card Management Module

## Purpose

Manage production Job Cards.

## Features

- Create Job Card
- Edit Job Card
- View Job Card
- Send To Cutting
- Status Tracking

## Job Card Details

- Job Card Number
- Design Code
- Priority
- Due Date
- Components
- Color
- Size
- Quantity

## Status

- Created
- Ready For Cutting
- Cutting In Progress
- Cutting Completed

## Business Logic

Only Owner can create Job Cards.

Only Owner can send Job Cards to Cutting.

Job Cards cannot be deleted after Cutting starts.

## Validation

- Job Card Number must be unique.
- Due Date is required.
- Quantity must be greater than zero.

---

# 7. Cutting Management Module

## Purpose

Track the cutting process.

## Features

- View Ready Queue
- Start Cutting
- Complete Cutting

## Business Logic

Only Job Cards with "Ready For Cutting" status are visible.

Cutting cannot be completed unless it has been started.

---

# 8. Work Assignment Module

## Purpose

Assign production bundles to employees.

## Features

- Select Bundle
- Select Employee
- Assign Quantity
- Edit Assignment
- Cancel Assignment
- Update Completed Quantity

## Business Logic

Assignment is based on Set Bundles.

One Bundle may be assigned to multiple employees.

Remaining Quantity is calculated automatically.

Assigned Quantity must never exceed Remaining Quantity.

Completed Quantity cannot exceed Assigned Quantity.

## Example

Bundle

Red

M

50 Sets

Assignments

Ramesh = 20

Suresh = 15

Mahesh = 15

Remaining = 0

---

# 9. Employee Ledger Module

Displays complete employee history.

Includes

- Personal Details
- Current Work
- Pending Work
- Completed Work
- Job History
- Salary History
- Advance History
- Payment History
- Monthly Summary

Employee Ledger is read-only.

---

# 10. Salary Management Module

Salary is automatically calculated.

Formula

Completed Quantity × Piece Rate

Features

- Monthly Salary
- Pending Salary
- Salary Summary
- Salary History

Salary cannot be edited manually.

---

# 11. Advance Management Module

Features

- Add Advance
- Edit Advance
- View History

Rules

Every advance requires:

- Date
- Amount
- Reason

Advance is deducted during salary payment.

---

# 12. Salary Payment Module

Features

- Full Payment
- Partial Payment
- Remaining Balance
- Payment History

Rules

Remaining Salary = Salary - Advance - Paid Amount

Negative payment is not allowed.

---

# 13. Reports Module

Available Reports

- Employee Productivity
- Salary Report
- Advance Report
- Payment Report
- Job Card Report
- Pending Work
- Completed Work
- Monthly Production

Reports should support:

- Search
- Filters
- Export (Excel/PDF)
- Printing

---

# 14. System-wide Functional Requirements

The system shall support:

- Role-Based Access Control
- Search
- Filtering
- Sorting
- Pagination
- Activity Logs
- Date Range Filters
- Export
- Print

---

# 15. Validation Rules

General validations:

- Required fields cannot be empty.
- Quantity cannot be negative.
- Completed Quantity ≤ Assigned Quantity.
- Assignment ≤ Remaining Quantity.
- Piece Rate > 0.
- Phone Number must be unique.
- Duplicate Job Card Numbers are not allowed.

---

# 16. Permission Matrix

| Feature | Owner | Cutting Master | Manager |
|----------|--------|----------------|----------|
| Dashboard | ✅ | ✅ | ✅ |
| Employees | ✅ | ❌ | ❌ |
| Job Cards | ✅ | ❌ | ❌ |
| Cutting | ❌ | ✅ | ❌ |
| Work Assignment | ❌ | ❌ | ✅ |
| Salary | ✅ | ❌ | ✅ |
| Reports | ✅ | ❌ | ✅ |

---

# 17. Status Flow

Job Card

Created

↓

Ready For Cutting

↓

Cutting In Progress

↓

Cutting Completed

↓

Assigned

↓

Completed

↓

Salary Calculated

↓

Paid

---

# 18. Acceptance Criteria

The system shall be considered functionally complete when:

- All modules operate according to business rules.
- Role permissions are enforced.
- Salary calculations are accurate.
- Bundle assignment prevents over-allocation.
- Reports reflect real-time data.
- Employee ledger displays complete history.