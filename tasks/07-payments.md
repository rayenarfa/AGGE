# Task 07: Payments

## Status
- **Status**: Completed
- **Completion Date**: 2026-07-10
- **Assigned to**: AI Assistant / Developer

## Objective
Integrate a payment gateway (e.g. Stripe or PayPal) to support membership transactions, event registrations, and education course enrollment fees.

## Requirements & Scope
1. **Payment Model Tracking**:
   - Save transactions inside the `Payment` table, linking them to membership activations, events, or courses.
2. **Checkout Integration**:
   - Implement backend endpoints to create payment intents/sessions.
   - Build a clean checkout experience on the client.
3. **Webhooks Handling**:
   - Receive webhook updates to verify transactions asynchronously.
   - Update subscription status to `ACTIVE` and register users automatically upon payment success.
