# UI/UX Specification (Mobile First)

## Project Information

**Project Name:** Worker Management ERP for Kurti Manufacturing Factory

**Document Version:** 2.0

**Status:** Approved Draft

---

# 1. UI Design Philosophy

The application is designed primarily for Android mobile devices because factory owners, managers, and cutting masters spend most of their time on the production floor rather than sitting at a computer.

The interface should be simple, fast, touch-friendly, and require minimal training.

Priority Devices

1. Android Mobile (Primary)
2. Android Tablet
3. Desktop Web

---

# 2. Design Principles

The application should follow these principles.

- Mobile First
- Clean Interface
- Large Touch Buttons
- Card Based Design
- Easy Navigation
- Minimum Typing
- Fast Loading
- Factory Friendly
- Professional ERP Look
- Consistent UI

---

# 3. Application Layout

## Mobile Layout

--------------------------------

Top App Bar

--------------------------------

Page Content

--------------------------------

Bottom Navigation

Home

Job Cards

Assignment

Employees

Profile

--------------------------------

Floating Action Button (FAB)

Used for:

- Add Employee
- Create Job Card
- Add Advance
- Add Payment

---

## Tablet/Desktop Layout

--------------------------------

Sidebar

Header

Content

--------------------------------

---

# 4. Color Guidelines

Primary Color

Blue

Success

Green

Warning

Orange

Danger

Red

Background

Light Gray

Cards

White

Text

Dark Gray

Status Colors

Created

Gray

Ready For Cutting

Blue

Cutting In Progress

Orange

Cutting Completed

Green

Completed

Dark Green

Paid

Green

Pending

Red

---

# 5. Dashboard Screen

Purpose

Provide quick production overview.

Cards

- Total Employees
- Active Job Cards
- Ready For Cutting
- Cutting In Progress
- Cutting Completed
- Pending Assignment
- Pending Salary

Recent Activity

Latest activities.

Quick Actions

- Add Employee
- Create Job Card
- Assign Work

Layout

Cards should be stacked vertically on mobile.

---

# 6. Employee Module

Employee List

Each employee should appear as a card.

Employee Card

Employee Name

Employee Code

Phone Number

Piece Rate

Status

Buttons

View

Edit

Disable

Top Toolbar

Search

Status Filter

Sort

Floating Button

Add Employee

---

# 7. Employee Profile

Header

Employee Photo (Optional)

Employee Name

Employee Code

Piece Rate

Phone

Status

Tabs

Overview

Current Work

Completed Work

Salary

Advance

Payments

History

---

# 8. Job Card List

Each Job Card should appear as a card.

Card Information

Job Card Number

Design Code

Quantity

Priority

Due Date

Status

Buttons

View

Edit

Send To Cutting

Color indicators should display priority.

High

Red

Medium

Orange

Low

Green

---

# 9. Job Card Details

General Information

Job Card Number

Design Code

Due Date

Priority

Status

Bundle Information

Each Color/Size appears as a separate card.

Example

Red

Size M

Quantity

50 Sets

Component

Top

Pant

Top Aster

Buttons

Save

Edit

Send To Cutting

---

# 10. Cutting Module

Only Cutting Master can access.

Job Cards appear as cards.

Card Information

Job Card Number

Design

Quantity

Status

Buttons

Start Cutting

Complete Cutting

Completed Job Cards automatically disappear.

---

# 11. Work Assignment Module

This is the most important screen.

Layout

Bundle Card

Shows

Color

Size

Total Sets

Assigned

Remaining

Example

Color

Red

Size

M

Remaining

20 Sets

Employee List

Each employee appears as a card.

Employee Card

Employee Name

Piece Rate

Current Assigned Work

Assign Quantity Input

Assign Button

Assignment Summary

Employee

Assigned

Completed

Remaining

Status

Buttons

Edit

Complete

Cancel

Business Rules

Remaining Quantity updates automatically.

Assign Button becomes disabled if Remaining Quantity is zero.

The system must prevent assigning more than available quantity.

---

# 12. Employee Ledger

Sections

Employee Information

Current Assignment

Pending Work

Completed Work

Salary Summary

Advance History

Payment History

Monthly Summary

This page is read-only.

---

# 13. Salary Module

Employee Salary Card

Employee Name

Completed Quantity

Piece Rate

Gross Salary

Advance

Paid

Balance

Button

View Details

Month Filter

Search

---

# 14. Advance Module

Advance Card

Employee

Amount

Date

Reason

Buttons

Edit

Delete

Floating Button

Add Advance

---

# 15. Salary Payment Module

Payment Form

Employee

Salary

Advance

Remaining Balance

Payment Amount

Payment Method

Remarks

Buttons

Save Payment

Cancel

Payment History appears below.

---

# 16. Reports Module

Reports

Employee Productivity

Salary

Advance

Payment

Pending Work

Completed Work

Monthly Production

Features

Search

Date Filter

Export PDF

Export Excel

Print

---

# 17. Search

Every module should contain a search bar.

Search should be instant.

---

# 18. Filters

Filters should open as a Bottom Sheet on mobile.

Available Filters

Status

Date

Priority

Employee

Month

---

# 19. Forms

Large forms should be divided into multiple steps.

Step 1

Basic Information

↓

Step 2

Details

↓

Step 3

Confirmation

---

# 20. Buttons

Primary

Filled Blue

Secondary

Outlined

Danger

Red

Success

Green

Buttons should have a minimum height of 48px.

---

# 21. Loading States

Every page should display

Loading Skeleton

Every save action should display

Loading Spinner

---

# 22. Empty States

Example

No Employees Found

No Job Cards Found

No Assignment Available

Show an illustration with a helpful message.

---

# 23. Error Handling

Validation errors should appear below the input field.

System errors should appear as a Snackbar.

Success messages should appear as a Toast.

---

# 24. Responsive Rules

Mobile

360px+

Tablet

768px+

Desktop

1280px+

The same codebase should work across all devices.

---

# 25. UI Components

Reusable Components

- App Header
- Bottom Navigation
- Sidebar (Desktop)
- Search Bar
- Filter Bottom Sheet
- Card
- Table (Desktop Only)
- Modal
- Drawer
- Tabs
- Stepper
- Date Picker
- Status Badge
- Confirmation Dialog
- Empty State
- Loading Skeleton
- Toast Notification

---

# 26. UX Guidelines

- Maximum 3 taps to reach any important feature.
- Use cards instead of tables on mobile.
- Minimize typing by using dropdowns and date pickers.
- Show status with colors and icons.
- Keep all frequently used actions within thumb reach.
- Confirm destructive actions like delete or disable.
- Auto-save drafts where applicable.
- Maintain a consistent design language across all modules.