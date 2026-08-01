# MASTER PROJECT BLUEPRINT

## Project Information

**Project Name:** Worker Management ERP for Kurti Manufacturing Factory

**Version:** 1.0

**Status:** Final Blueprint

---

# 1. Project Vision

The Worker Management ERP is designed to digitize and simplify the production workflow of a Kurti manufacturing factory.

The application focuses only on production worker management.

This is NOT a complete ERP.

Inventory, Purchase, Sales, Accounts, Dispatch, Packing, Ironing, and Quality Control are intentionally excluded from Version 1.

The system should be scalable so these modules can be added in future versions without changing the existing architecture.

---

# 2. Project Objective

The application should help factory management:

- Manage Employees
- Create Job Cards
- Track Cutting
- Assign Production Work
- Calculate Salary Automatically
- Record Advances
- Record Salary Payments
- Generate Reports

The application should eliminate manual registers and Excel sheets.

---

# 3. Target Users

Primary Users

- Owner
- Cutting Master
- Manager

Workers do NOT use the application.

All production updates are performed by the Manager.

---

# 4. Factory Workflow

Employee Created

↓

Job Card Created

↓

Job Card Status = Created

↓

Owner Sends Job Card To Cutting

↓

Ready For Cutting

↓

Cutting Master Starts Cutting

↓

Cutting In Progress

↓

Cutting Completed

↓

Bundles Ready

↓

Manager Assigns Bundles

↓

Employees Complete Work

↓

Manager Updates Completed Quantity

↓

Salary Automatically Calculated

↓

Advance Entry

↓

Salary Payment

↓

Reports

---

# 5. User Roles

## Owner

Permissions

- Dashboard
- Employees
- Job Cards
- Reports
- Salary
- Payments
- Settings

---

## Cutting Master

Permissions

- Ready For Cutting
- Start Cutting
- Complete Cutting

---

## Manager

Permissions

- Work Assignment
- Employee Ledger
- Salary
- Advance
- Salary Payment
- Reports

---

# 6. Main Modules

1. Dashboard

2. Employee Management

3. Job Card Management

4. Cutting Management

5. Work Assignment

6. Employee Ledger

7. Salary Management

8. Advance Management

9. Salary Payment

10. Reports

---

# 7. Dashboard

Displays

- Employees
- Active Job Cards
- Ready For Cutting
- Cutting In Progress
- Cutting Completed
- Pending Assignment
- Pending Salary
- Recent Activities

---

# 8. Employee Management

Functions

- Add Employee
- Edit Employee
- Disable Employee
- Employee Profile
- Piece Rate
- Search
- Filter

---

# 9. Job Card

Contains

- Job Card Number
- Design Code
- Priority
- Due Date
- Components
- Color
- Size
- Quantity
- Status

Status Flow

Created

↓

Ready For Cutting

↓

Cutting In Progress

↓

Cutting Completed

---

# 10. Cutting

Functions

- Ready Queue
- Start Cutting
- Complete Cutting

Only Cutting Master can access.

---

# 11. Work Assignment

Assignment is based on Set Bundles.

Example

Bundle

Red

M

50 Sets

Assignments

Ramesh

30 Sets

Suresh

20 Sets

Remaining Quantity

0

Business Rules

- Cannot assign more than remaining quantity.
- One bundle can be assigned to multiple employees.
- Completed Quantity cannot exceed Assigned Quantity.

---

# 12. Employee Ledger

Displays

- Employee Details
- Current Work
- Pending Work
- Completed Work
- Salary Summary
- Advance History
- Payment History
- Job History

---

# 13. Salary

Formula

Completed Quantity × Piece Rate

Automatically calculated.

---

# 14. Advance

Functions

- Add Advance
- Edit Advance
- Delete Advance

Advance reduces payable salary.

---

# 15. Salary Payment

Supports

- Full Payment
- Partial Payment

Automatically calculates remaining balance.

---

# 16. Reports

Available Reports

- Employee Productivity
- Job Cards
- Salary
- Advance
- Payments
- Pending Work
- Completed Work
- Monthly Production

Supports

- Search
- Filters
- PDF Export
- Excel Export
- Print

---

# 17. Mobile First UI

Primary Device

Android Mobile

Secondary

Tablet

Desktop

UI Principles

- Card Based
- Large Buttons
- Minimum Typing
- Touch Friendly
- Fast Navigation
- Bottom Navigation
- Responsive

---

# 18. Database Overview

Main Tables

- users
- employees
- job_cards
- job_card_items
- bundles
- assignments
- salary_ledgers
- advances
- salary_payments
- activity_logs

Relationships

Users

↓

Job Cards

↓

Job Card Items

↓

Bundles

↓

Assignments

↓

Salary Ledger

---

# 19. API Overview

Authentication

Employee APIs

Job Card APIs

Cutting APIs

Assignment APIs

Salary APIs

Advance APIs

Payment APIs

Report APIs

All APIs use

REST

JWT Authentication

JSON

---

# 20. Business Rules

- Employee Code must be unique.
- Job Card Number must be unique.
- Only Owner creates Job Cards.
- Only Owner sends Job Cards to Cutting.
- Cutting Master only sees Ready For Cutting.
- Manager only sees Cutting Completed.
- Assignment cannot exceed Remaining Quantity.
- Completed Quantity cannot exceed Assigned Quantity.
- Salary is calculated only from Completed Quantity.
- Advance reduces Salary.
- Payment cannot exceed Remaining Balance.

---

# 21. Development Order

Phase 1

Authentication

↓

Phase 2

Application Layout

↓

Phase 3

Dashboard

↓

Phase 4

Employee Module

↓

Phase 5

Job Card Module

↓

Phase 6

Cutting Module

↓

Phase 7

Work Assignment

↓

Phase 8

Employee Ledger

↓

Phase 9

Salary

↓

Phase 10

Advance

↓

Phase 11

Salary Payment

↓

Phase 12

Reports

↓

Phase 13

Testing

↓

Phase 14

Deployment

---

# 22. Tech Stack

Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Framer Motion

Backend

- Node.js
- Express.js

Database

- PostgreSQL

ORM

- Prisma

Authentication

- JWT

Storage

- Cloudinary (Future)

Deployment

Frontend

- Vercel

Backend

- Render

Database

- Supabase PostgreSQL

---

# 23. Coding Standards

- Use reusable components.
- Follow clean architecture.
- Use service layer.
- Use repository pattern where needed.
- Validate every request.
- Handle errors consistently.
- Never hardcode business logic in UI.
- Use role-based authorization.
- Keep modules independent for future ERP expansion.

---

# 24. Success Criteria

The project is considered successful when:

- Production workflow is fully digital.
- Employee management is centralized.
- Work assignments are accurate.
- Salary calculations are automatic.
- Reports are generated instantly.
- The application is easy to use on Android mobile devices.
- Future ERP modules can be added without major architectural changes.

---

# 25. Conclusion

The Worker Management ERP provides a scalable, production-ready foundation for managing workers in a Kurti manufacturing factory.

The architecture is intentionally modular, allowing future integration of Inventory, Purchase, Sales, Dispatch, Packing, Quality Control, Accounting, and other ERP modules without redesigning the core system.


# DEVELOPMENT ROADMAP

## Project Name

Worker Management ERP for Kurti Manufacturing Factory

Version: 1.0

Status: Development Plan

---

# Development Strategy

The project will be developed in small independent phases.

Each phase must be:

- Designed
- Developed
- Tested
- Reviewed

Only after successful completion should the next phase begin.

---

# P-001

## Project Setup

Objectives

- Create React Application
- Configure Vite
- Install Tailwind CSS
- Configure ESLint
- Configure Prettier
- Setup Folder Structure
- Configure React Router
- Configure Axios
- Configure Environment Variables

Deliverables

- Running Frontend
- Basic Folder Structure
- Routing Ready

Status

Development

---

# P-002

## Backend Setup

Objectives

- Create Express Application
- Configure Prisma
- Connect PostgreSQL
- Configure JWT
- Configure Error Handling
- Configure Validation
- Configure Logger

Deliverables

- Backend Running
- Database Connected
- Authentication Ready

---

# P-003

## Authentication

Pages

- Login

Features

- Login
- JWT Authentication
- Protected Routes
- Auto Logout
- Role Based Access

Database

- users

Testing

- Login Success
- Invalid Login
- Role Verification

---

# P-004

## Application Layout

Pages

- Mobile Layout
- Tablet Layout
- Desktop Layout

Components

- Header
- Bottom Navigation
- Sidebar
- Drawer
- Breadcrumb
- Page Layout

Testing

- Responsive Layout
- Navigation

---

# P-005

## Dashboard Module

Pages

Dashboard

Features

- Summary Cards
- Recent Activities
- Quick Actions
- Refresh Data

Database

- users
- employees
- job_cards

Testing

- Dashboard Data
- Navigation

---

# P-006

## Employee Module

Pages

- Employee List
- Add Employee
- Edit Employee
- Employee Profile

Database

- employees

Features

- CRUD
- Search
- Filter
- Disable Employee

Testing

- Validation
- CRUD
- Search

---

# P-007

## Job Card Module

Pages

- Job Card List
- Create Job Card
- Edit Job Card
- Details

Database

- job_cards
- job_card_items

Features

- Create
- Edit
- Status
- Components

Testing

- Validation
- Status Flow

---

# P-008

## Cutting Module

Pages

- Ready Queue

Features

- Start Cutting
- Complete Cutting

Database

- job_cards

Testing

- Status Change
- Permissions

---

# P-009

## Bundle Management

Pages

- Bundle List

Database

- bundles

Features

- Bundle Creation
- Bundle Details
- Remaining Quantity

Testing

- Quantity Calculation

---

# P-010

## Work Assignment

Pages

- Assignment Screen

Database

- assignments

Features

- Assign Employee
- Complete Assignment
- Remaining Quantity
- Multiple Employees

Testing

- Quantity Validation
- Assignment Rules

---

# P-011

## Employee Ledger

Pages

Employee Profile

Tabs

- Work
- Salary
- Advance
- Payment

Testing

- Data Accuracy

---

# P-012

## Salary Module

Database

- salary_ledgers

Features

- Salary Calculation
- Salary Summary
- Monthly Salary

Testing

- Salary Formula

---

# P-013

## Advance & Payment

Database

- advances
- salary_payments

Features

Advance

Salary Payment

Partial Payment

Remaining Balance

Testing

- Advance
- Payment

---

# P-014

## Reports

Reports

- Employee Productivity
- Salary
- Advance
- Payment
- Production

Features

- Search
- Filters
- Export PDF
- Export Excel
- Print

Testing

- Report Accuracy

---

# P-015

## Final Testing & Deployment

Testing

- Functional Testing
- UI Testing
- Mobile Testing
- Performance Testing
- Security Testing

Deployment

Frontend

Vercel

Backend

Render

Database

Supabase PostgreSQL

Deliverables

Production Ready Application

---

# Folder Structure

Frontend

src/

components/

layouts/

pages/

features/

hooks/

services/

contexts/

routes/

utils/

assets/

Backend

src/

controllers/

routes/

middleware/

services/

repositories/

validators/

prisma/

utils/

config/

Database

prisma/

schema.prisma

migrations/

seed/

---

# Technology Stack

Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- TanStack Query
- Axios
- Zod
- Framer Motion

Backend

- Node.js
- Express.js

Database

- PostgreSQL

ORM

- Prisma

Authentication

- JWT

Deployment

Frontend

- Vercel

Backend

- Render

Database

- Supabase PostgreSQL

---

# Project Completion Checklist

Project Setup

Authentication

Application Layout

Dashboard

Employee Module

Job Card Module

Cutting Module

Bundle Module

Work Assignment

Employee Ledger

Salary Module

Advance Module

Salary Payment

Reports

Testing

Deployment

Documentation

Production Release