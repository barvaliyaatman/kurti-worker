# Database Design & ER Architecture

## Project Information

**Project Name:** Worker Management ERP for Kurti Manufacturing Factory

**Document Version:** 1.0

**Status:** Draft

---

# Table of Contents

1. Database Overview
2. Design Principles
3. Database Relationships
4. Tables
5. Primary Keys
6. Foreign Keys
7. Status Values
8. Naming Convention
9. Audit Fields
10. Soft Delete Strategy
11. Index Strategy

---

# 1. Database Overview

The Worker Management ERP database is designed using a normalized relational model.

The database should:

- Prevent duplicate records.
- Maintain data consistency.
- Support future ERP modules.
- Be easy to maintain.
- Be scalable.

Recommended Database

- PostgreSQL

Recommended ORM

- Prisma ORM

---

# 2. Design Principles

The database should follow these principles.

- Every table has a UUID Primary Key.
- Foreign Keys maintain relationships.
- Avoid duplicate data.
- Use lookup tables where required.
- Never store calculated values unless necessary.
- Maintain audit information.
- Support future ERP expansion.

---

# 3. Main Database Tables

The system contains the following primary tables.

1. users
2. employees
3. job_cards
4. job_card_items
5. bundles
6. assignments
7. salary_ledgers
8. advances
9. salary_payments
10. activity_logs

---

# 4. Table Details

---

## users

Purpose

Stores system login users.

Roles

- Owner
- Cutting Master
- Manager

Columns

- id
- full_name
- email
- password_hash
- role
- status
- last_login
- created_at
- updated_at

---

## employees

Purpose

Stores production workers.

Columns

- id
- employee_code
- employee_name
- phone
- piece_rate
- joining_date
- status
- notes
- created_at
- updated_at

Business Rules

- Employee Code must be unique.
- Piece Rate must be greater than zero.
- Disabled employees cannot receive assignments.

---

## job_cards

Purpose

Stores production orders.

Columns

- id
- job_card_number
- design_code
- priority
- due_date
- status
- remarks
- created_by
- created_at
- updated_at

Status

- Created
- Ready For Cutting
- Cutting In Progress
- Cutting Completed

---

## job_card_items

Purpose

Stores color-wise and size-wise production details.

Columns

- id
- job_card_id
- component
- color
- size
- quantity

Example

Component : Top

Color : Red

Size : M

Quantity : 50

---

## bundles

Purpose

Stores production bundles created after cutting.

Columns

- id
- job_card_item_id
- bundle_number
- color
- size
- total_sets
- assigned_sets
- completed_sets
- remaining_sets
- status

Business Rules

Remaining Quantity =

Total Sets

-

Assigned Sets

---

## assignments

Purpose

Stores employee work assignments.

Columns

- id
- bundle_id
- employee_id
- assigned_quantity
- completed_quantity
- assignment_date
- status

Business Rules

Completed Quantity

≤

Assigned Quantity

---

## salary_ledgers

Purpose

Stores automatically calculated salary entries.

Columns

- id
- employee_id
- assignment_id
- completed_quantity
- piece_rate
- salary_amount
- salary_month

Formula

Completed Quantity × Piece Rate

---

## advances

Purpose

Stores employee advance payments.

Columns

- id
- employee_id
- amount
- advance_date
- reason
- remarks

---

## salary_payments

Purpose

Stores salary payments.

Columns

- id
- employee_id
- payment_date
- gross_salary
- advance_amount
- paid_amount
- remaining_balance
- remarks

---

## activity_logs

Purpose

Stores important user activities.

Columns

- id
- user_id
- module
- action
- record_id
- created_at

Examples

Employee Created

Job Card Updated

Bundle Assigned

Salary Paid

---

# 5. Relationships

users

↓

creates

↓

job_cards

job_cards

↓

contains

↓

job_card_items

job_card_items

↓

creates

↓

bundles

bundles

↓

assigned_to

↓

employees

employees

↓

has

↓

assignments

assignments

↓

creates

↓

salary_ledgers

employees

↓

has_many

↓

advances

employees

↓

has_many

↓

salary_payments

---

# 6. Foreign Keys

job_cards.created_by

→ users.id

job_card_items.job_card_id

→ job_cards.id

bundles.job_card_item_id

→ job_card_items.id

assignments.bundle_id

→ bundles.id

assignments.employee_id

→ employees.id

salary_ledgers.employee_id

→ employees.id

salary_ledgers.assignment_id

→ assignments.id

advances.employee_id

→ employees.id

salary_payments.employee_id

→ employees.id

activity_logs.user_id

→ users.id

---

# 7. Status Values

Employee

- Active
- Inactive

Job Card

- Created
- Ready For Cutting
- Cutting In Progress
- Cutting Completed

Assignment

- Assigned
- In Progress
- Completed

Salary

- Pending
- Partially Paid
- Paid

---

# 8. Naming Convention

Tables

snake_case

Example

employees

job_cards

salary_payments

Columns

snake_case

Example

employee_code

piece_rate

created_at

Primary Keys

id

Foreign Keys

table_name_id

Example

employee_id

bundle_id

job_card_id

---

# 9. Audit Fields

Every table should include

- created_at
- updated_at

Optional

- created_by
- updated_by

---

# 10. Soft Delete Strategy

The system should never permanently delete important production data.

Instead, use

status

or

deleted_at

for soft deletion where appropriate.

---

# 11. Index Strategy

Indexes should be created on:

- employee_code
- phone
- job_card_number
- design_code
- status
- due_date
- bundle_number
- assignment_date
- salary_month

These indexes will improve search performance.