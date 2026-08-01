# Business Requirement Specification (BRS)

## Project Information

**Project Name:** Worker Management ERP for Kurti Manufacturing Factory

**Document Version:** 1.0

**Document Status:** Draft

**Prepared By:** Business Analysis Team

**Project Type:** Manufacturing Worker Management ERP

---

# Table of Contents

1. Introduction
2. Project Overview
3. Business Background
4. Problem Statement
5. Business Objectives
6. Project Scope
7. Out of Scope
8. Stakeholders
9. User Roles & Responsibilities
10. Factory Production Workflow
11. Business Rules
12. Module Overview
13. Assumptions
14. Constraints
15. Success Criteria
16. Future Scope
17. Conclusion

---

# 1. Introduction

## Purpose

The purpose of this document is to define the complete business requirements for the Worker Management ERP system.

This document serves as the foundation of the project and provides a clear understanding of the business process before software design and development begin.

This document is intended for:

- Business Owner
- Project Manager
- Business Analyst
- UI/UX Designer
- Software Architect
- Database Architect
- Frontend Developer
- Backend Developer
- QA Engineer

This document focuses only on business requirements and intentionally excludes technical implementation details such as database schema, APIs, UI design, and source code.

---

# 2. Project Overview

Worker Management ERP is a desktop-first web application designed specifically for Kurti manufacturing factories.

The primary objective of the system is to digitize the production workflow and simplify worker management after a Job Card has been created.

Instead of maintaining production information using paper registers, notebooks, Excel sheets, or WhatsApp messages, factory management will use one centralized application.

Version 1 focuses only on worker management and production execution.

Future ERP modules such as Inventory, Purchase, Sales, Dispatch, Quality Control, Packing, Accounting, and CRM will be added later.

---

# 3. Business Background

Most garment manufacturing factories still manage production manually.

Common business problems include:

- Paper-based Job Cards
- Manual worker assignment
- No centralized production tracking
- Incorrect salary calculations
- Difficult remaining quantity calculation
- No employee history
- Poor production visibility
- Manual report preparation
- Advance payment records maintained separately
- Difficult payment tracking

These problems reduce operational efficiency and increase the possibility of human error.

The Worker Management ERP aims to replace manual processes with a centralized digital production management system.

---

# 4. Problem Statement

The factory currently does not have a centralized system for managing worker production activities.

Current challenges include:

- No digital employee management
- Manual Job Card tracking
- No real-time cutting progress
- Manual bundle assignment
- Incorrect remaining quantity calculation
- Difficult worker productivity tracking
- Manual salary calculation
- No centralized employee ledger
- Difficult report generation

The software should eliminate these issues.

---

# 5. Business Objectives

The main objectives of this project are:

- Digitize the production workflow.
- Reduce paperwork.
- Improve production visibility.
- Standardize Job Card management.
- Simplify worker assignment.
- Prevent over-assignment of production bundles.
- Automatically calculate worker salary.
- Maintain complete employee history.
- Record advances and salary payments.
- Generate accurate production reports.
- Build a scalable foundation for future ERP modules.

---

# 6. Project Scope

Version 1 includes the following modules.

## Dashboard

Provides a real-time overview of factory operations.

Features

- Total Employees
- Active Job Cards
- Ready For Cutting
- Cutting In Progress
- Cutting Completed
- Pending Assignments
- Completed Work Today
- Pending Salary
- Recent Activities
- Quick Navigation

---

## Employee Management

Manages all production employees.

Features

- Add Employee
- Edit Employee
- Disable Employee
- View Employee Profile
- Piece Rate Configuration
- Employee Search
- Employee Filter
- Employee History

---

## Job Card Management

Manages production Job Cards.

Features

- Create Job Card
- Edit Job Card
- View Job Card
- Delete Draft Job Card
- Send To Cutting
- Status Tracking
- Priority Management
- Due Date Management
- Component Details
- Color-wise Quantity
- Size-wise Quantity

---

## Cutting Management

Used by the Cutting Master.

Features

- Ready For Cutting Queue
- Start Cutting
- Complete Cutting
- Cutting Progress
- Production Queue

---

## Work Assignment

Assigns production bundles to employees.

Features

- Bundle Selection
- Employee Selection
- Assign Quantity
- Multi Employee Assignment
- Remaining Quantity Calculation
- Edit Assignment
- Cancel Assignment
- Mark Completed Quantity
- Partial Completion

Example

Bundle

Color : Red

Size : M

Total Sets : 50

Assignments

- Ramesh = 20 Sets
- Suresh = 15 Sets
- Mahesh = 15 Sets

Remaining Quantity

0 Sets

The system must never allow assigning more than the available quantity.

---

## Employee Ledger

Provides complete employee history.

Includes

- Employee Details
- Current Assigned Work
- Pending Work
- Completed Work
- Job Card History
- Salary History
- Advance History
- Payment History
- Monthly Summary

---

## Salary Management

Automatically calculates salary.

Features

- Piece Rate
- Completed Quantity
- Monthly Salary
- Pending Salary
- Salary Summary
- Salary History

Formula

Completed Quantity × Piece Rate

---

## Advance Management

Manages employee advances.

Features

- Add Advance
- Edit Advance
- Delete Advance
- Advance History
- Monthly Advance Summary

---

## Salary Payment

Records salary payments.

Features

- Full Payment
- Partial Payment
- Outstanding Balance
- Payment History
- Payment Remarks

---

## Reports

Generates production reports.

Available Reports

- Employee Productivity Report
- Job Card Report
- Salary Report
- Advance Report
- Payment Report
- Pending Work Report
- Completed Work Report
- Monthly Production Report

---

# 7. Out of Scope

Version 1 does not include:

- Inventory Management
- Raw Material Management
- Purchase Management
- Supplier Management
- Customer Management
- Sales Management
- Dispatch
- Packing
- Ironing
- Quality Control
- Accounting
- GST
- Barcode Management
- Attendance
- Worker Login
- Mobile Application

---

# 8. Stakeholders

## Primary Stakeholders

- Factory Owner
- Cutting Master
- Manager

## Future Stakeholders

- Accountant
- Inventory Manager
- Sales Team
- Purchase Team

---

# 9. User Roles & Responsibilities

## Owner

Responsibilities

- Manage Employees
- Create Job Cards
- Edit Job Cards
- Send Job Cards To Cutting
- View Reports
- Manage Salary
- Manage Payments
- Configure System Settings

---

## Cutting Master

Responsibilities

- View Ready For Cutting Job Cards
- Start Cutting
- Complete Cutting

Restrictions

- Cannot Create Job Cards
- Cannot Edit Employees
- Cannot Manage Salary

---

## Manager

Responsibilities

- View Cutting Completed Job Cards
- Assign Work
- Update Completed Quantity
- Record Advance
- Record Salary Payment
- View Employee Ledger

Restrictions

- Cannot Create Job Cards
- Cannot Send Job Cards To Cutting

---

# 10. Factory Production Workflow

1. Create Employee

2. Create Job Card

3. Job Card Status = Created

4. Owner Sends Job Card To Cutting

5. Status = Ready For Cutting

6. Cutting Master Starts Cutting

7. Status = Cutting In Progress

8. Cutting Master Completes Cutting

9. Status = Cutting Completed

10. Manager Assigns Bundle To Employees

11. Employees Complete Assigned Work

12. Manager Updates Completed Quantity

13. Salary Automatically Calculated

14. Advance Recorded

15. Salary Payment

16. Reports Generated

---

# 11. Business Rules

### Employee Rules

- Every employee must have a unique Employee Code.
- Every employee must have one Piece Rate.
- Disabled employees cannot receive new assignments.
- Employee history must never be deleted.

### Job Card Rules

- Only Owner can create Job Cards.
- Only Owner can send Job Cards to Cutting.
- Every Job Card Number must be unique.
- Job Cards cannot be deleted after production starts.

### Cutting Rules

- Cutting Master only sees Ready For Cutting Job Cards.
- Cutting must be started before completion.
- Completed Cutting cannot be reopened in Version 1.

### Work Assignment Rules

- Assignment is always based on Set Bundles.
- One bundle can be assigned to multiple employees.
- Remaining Quantity is calculated automatically.
- Assigned Quantity cannot exceed Remaining Quantity.
- Completed Quantity cannot exceed Assigned Quantity.

### Salary Rules

- Salary is calculated only from Completed Quantity.
- Piece Rate is defined per employee.
- Salary updates automatically.
- Salary cannot become negative.

### Advance Rules

- Advance reduces payable salary.
- Every advance must include Date, Amount, and Reason.

### Payment Rules

- Salary can be paid fully or partially.
- Remaining Balance is calculated automatically.
- Payment history must never be deleted.

---

# 12. Module Overview

| Module | Description |
|---------|-------------|
| Dashboard | Production Overview |
| Employee Management | Employee Information |
| Job Card Management | Production Order Management |
| Cutting Management | Cutting Workflow |
| Work Assignment | Bundle Assignment |
| Employee Ledger | Employee Work History |
| Salary Management | Automatic Salary Calculation |
| Advance Management | Employee Advance Records |
| Salary Payment | Salary Settlement |
| Reports | Production & Salary Reports |

---

# 13. Assumptions

- The factory has desktop computers.
- Managers update production data regularly.
- Workers do not use the application.
- Internet connection is available.
- Piece Rate is predefined.
- The factory follows a standard production process.

---

# 14. Constraints

- Desktop-first application
- No Worker Login
- No Attendance
- No Inventory
- No Purchase
- No Sales
- No Accounts
- Single Factory Support
- English User Interface

---

# 15. Success Criteria

The project will be considered successful when:

- All Job Cards are digitally managed.
- Production status is visible in real time.
- Bundle assignments are accurate.
- Salary calculations are automatic.
- Employee history is complete.
- Reports are accurate.
- Manual registers and Excel sheets are no longer required.

---

# 16. Future Scope

Future ERP modules may include:

- Inventory Management
- Raw Material Management
- Purchase Orders
- Supplier Management
- Sales Orders
- Customer Management
- Packing
- Ironing
- Dispatch
- Quality Control
- Accounting
- Barcode / QR Code
- Worker Mobile Application
- Attendance System
- Multi-Factory Support
- Multi-Company Support

---

# 17. Conclusion

The Worker Management ERP is designed to simplify and standardize the production workflow of Kurti manufacturing factories.

By digitizing employee management, Job Cards, cutting, work assignments, salary calculations, advances, and payments, the system will improve operational efficiency, reduce manual errors, and provide factory management with real-time production visibility.

This Business Requirement Specification (BRS) serves as the foundation for the next phases of the project:

- Functional Requirement Specification (FRS)
- Database Design
- UI/UX Design
- API Design
- Development
- Testing
- Deployment