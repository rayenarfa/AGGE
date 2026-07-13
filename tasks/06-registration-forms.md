# Task 06: Registration Forms

## Status
- **Status**: Completed
- **Completion Date**: 2026-07-10
- **Assigned to**: AI Assistant / Developer

## Objective
Implement dynamic forms and structured user submission processing (e.g. membership joins, competition entries, contact forms) backed by database validation.

## Requirements & Scope
1. **Dynamic Form Definitions**:
   - Save form configurations using the `FormDefinition` database model utilizing PostgreSQL's native `Json` capabilities.
2. **Form Submission Engine**:
   - `POST /api/forms/:key/submit`: Handle forms submitted by guests or logged-in members.
   - Use `zod` dynamically or statically to validate incoming request data against defined schemas.
   - Save submission results inside the `FormSubmission` table.
3. **Admin Submissions Panel**:
   - Provide views for administrators to inspect form submissions, download CSV lists, and update statuses (e.g., pending review, approved, rejected).
4. **General Contact Forms**:
   - Implement simpler contact and support message logging inside the `ContactMessage` model.
