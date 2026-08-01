# Worker Management ERP
# MASTER_WORKFLOW.md

# Project Vision

Build a production-ready Worker Management ERP for a Kurti Manufacturing Factory.

This software is NOT a complete ERP.

The purpose of this software is to manage:

- Employees
- Job Cards
- Cutting
- Bundle Generation
- Work Assignment
- Salary
- Advance
- Payments
- Reports

Inventory, Purchase, Sales, Dispatch, Packing, QC and Accounts are NOT included in Version 1.

Future ERP modules will integrate with this architecture.

---

# User Roles

## Owner

- Full System Access
- Create Employees
- Create Job Cards
- Send Job Cards to Cutting
- View Reports
- Manage Salary
- Manage Payments

---

## Cutting Master

- View Ready For Cutting Job Cards
- Start Cutting
- Complete Component Cutting
- Generate Bundles

---

## Manager

- View Generated Bundles
- Assign Bundles
- Update Work Progress
- Complete Work
- Manage Salary
- Add Advance
- Add Payments

---

# Employee Rules

Employees DO NOT login.

Workers never use the software.

Only Owner, Manager and Cutting Master use the system.

---

# Employee Business Rules

Employee has

- Name
- Phone
- Joining Date
- Status
- Notes

Employee DOES NOT have Piece Rate.

Piece Rate is NOT stored inside Employee.

---

# Job Card Workflow

Owner

↓

Create Job Card

↓

Job Card contains

- Job Card Number
- Design Code
- Components
- Stitching Rate
- Color-wise Quantity
- Size-wise Quantity
- Priority
- Due Date
- Notes

↓

Status

Created

↓

Owner clicks

Send To Cutting

↓

Status

Ready For Cutting

---

# Components

Components belong to the Job Card.

Example

- Top
- Pant
- Top Aster
- Pant Aster
- Dupatta
- Other

Components are selected ONLY ONCE.

Components are NOT selected for every Color.

---

# Stitching Rate

Every Job Card contains

One Stitching Rate.

Example

₹110 / Piece

This rate is used later for Salary Calculation.

Employees do NOT have rates.

---

# Color & Size Structure

Example

Red

M = 20

L = 10

XL = 10

Blue

M = 10

L = 10

XL = 10

XXL = 10

System automatically calculates Total Quantity.

---

# Cutting Workflow

Only Cutting Master can access Cutting Module.

Cutting is performed Component-wise.

NOT Color-wise.

NOT Size-wise.

Example

Top

↓

Completed

Pant

↓

Completed

Top Aster

↓

Completed

Pant Aster

↓

Completed

Only after ALL Components are completed

Bundle Generation becomes available.

---

# Bundle Generation

Bundles are generated automatically.

Bundles are generated

Color-wise

AND

Size-wise.

Example

Red

M

20 Pieces

↓

Bundle

2001-RD-M

20 Pieces

----------------

Red

L

10 Pieces

↓

Bundle

2001-RD-L

10 Pieces

----------------

Blue

XL

10 Pieces

↓

Bundle

2001-BL-XL

10 Pieces

Every Color + Size combination becomes one Bundle.

---

# Work Assignment

Manager assigns Bundles.

Manager NEVER assigns Job Cards.

Manager NEVER assigns Colors.

Manager ONLY assigns Bundles.

Example

Bundle

2001-RD-M

20 Pieces

↓

Assign

Ramesh

Assigned Qty

20

---

# Work Completion

Workers stitch the COMPLETE garment.

One Finished Piece includes

- Top
- Pant
- Top Aster
- Pant Aster

Workers do NOT stitch individual components.

Manager updates completion.

---

# Salary Calculation

Salary Formula

Completed Pieces

×

Job Card Stitching Rate

=

Gross Salary

-

Advance

=

Net Salary

Employee Piece Rate is NEVER used.

---

# Employee Workspace

Each Employee Profile shows

- Employee Information
- Active Bundles
- Completed Bundles
- Monthly Completed Pieces
- Salary Summary
- Advance Summary
- Payment Summary
- Activity Timeline

---

# Module Order

P-001

Project Foundation

↓

P-002

Authentication

↓

P-003

Application Layout

↓

P-004

Dashboard

↓

P-005

Employee Management

↓

P-006

Job Card Management

↓

P-007

Cutting Management

↓

P-008

Bundle Generation

↓

P-009

Work Assignment

↓

P-010

Employee Workspace

↓

P-011

Payroll Management

↓

P-012

Reports

↓

P-013

Settings

↓

P-014

Final Testing & Deployment

---

# Database Rules

Use

Supabase PostgreSQL

Use

Prisma ORM

Never use SQLite.

Never create dev.db.

---

# Development Rules

Use JavaScript ONLY.

Never generate

TypeScript

.ts

.tsx

Use

.js

.jsx

Reuse existing components.

Never rewrite working modules.

Read all Markdown documentation before every phase.

---

# Final Architecture

Employee

↓

Job Card

↓

Component Cutting

↓

All Components Completed

↓

Bundle Generation

(Color + Size)

↓

Work Assignment

↓

Work Completion

↓

Salary Calculation

↓

Advance

↓

Payment

↓

Reports

This workflow is the Single Source of Truth for the Worker Management ERP.