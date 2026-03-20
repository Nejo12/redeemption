## MVP GitHub Issue Backlog (Epics -> User Stories -> Tasks)

### Minimal label scheme

- `epic`
- `backend`
- `frontend`
- `infra`
- `payments`
- `fulfillment`
- `templates`
- `moments`
- `security`
- `compliance`
- `testing`

### Suggested milestones / phases

- Milestone `phase-0`: Vendor selection + lead-time + pricing + format decisions
- Milestone `phase-1`: Foundation (auth + admin + storage + CI)
- Milestone `phase-2`: Contacts + addresses
- Milestone `phase-3`: Templates + rendering
- Milestone `phase-4`: Moments + drafts + scheduler + review
- Milestone `phase-5`: Payments + order creation
- Milestone `phase-6`: Fulfillment integration + tracking
- Milestone `phase-7`: Hardening + GDPR + monitoring

---

## EPIC 1 — Auth & Core User Setup

### Epic issue: `EPIC-1: Enable verified users to reach checkout`

Summary:

- Ship end-to-end user auth with email verification so only verified users can place orders.
  Implementation notes:
- Use Postgres-backed auth for MVP.
- Email verification gates checkout/order creation.
  Acceptance criteria:
- User can sign up, verify email, log in, and access dashboard.
- Unverified users cannot place orders.
  Success metrics:
- Activation rate: signup -> verified -> dashboard access.

### US-1.1: `US-1.1: Implement signup, verification, login, and reset`

Summary:

- Provide email/password authentication with verification and password reset.
  Tasks:
- [ ] Email/password signup
- [ ] Email verification (token flow)
- [ ] Login/logout
- [ ] Password reset (request + confirm)
- [ ] Add auth middleware to protect order placement endpoints
      Acceptance criteria:
- User can sign up, verify email, log in, and access dashboard.
- Unverified users cannot place orders.
  Out of scope:
- Full OAuth rollout (only email/password for MVP).
  Dependencies:
- Postgres migrations
- Email provider integration (sandbox)

### US-1.2: `US-1.2: Add sender profile and onboarding to reach "ready"`

Summary:

- Collect sender identity + return address so checkout cannot proceed without it.
  Tasks:
- [ ] Sender name form
- [ ] Sender return address form
- [ ] Default currency + locale preferences
- [ ] Persist profile preferences
- [ ] Enforce "no checkout without sender address"
      Acceptance criteria:
- User cannot checkout without a sender address.
- Profile persists across sessions.
  Out of scope:
- Complex multi-sender management (only one default for MVP).
  Dependencies:
- US-1.1 auth

---

## EPIC 2 — Contacts & Addresses

### Epic issue: `EPIC-2: Build reliable contacts and validated addresses`

Summary:

- Provide CRUD for contacts and addresses plus CSV import for MVP usability.
  Acceptance criteria:
- User can manage contacts/addresses reliably.

### US-2.1: `US-2.1: Manage contacts with relationship tags and birthdays`

Summary:

- Allow users to create/edit/delete contacts and manage relationship metadata.
  Tasks:
- [ ] Contact CRUD
- [ ] Relationship tag (family/friend/partner/work)
- [ ] Birthday (date-only) and optional timezone
- [ ] Notes field
- [ ] List + search/filter UI
- [ ] Duplicate contact warning (non-blocking heuristic)
      Acceptance criteria:
- Contact appears immediately in list after create/update.
- Duplicate name warning is shown but does not block save.
  Out of scope:
- Google Contacts import.
  Dependencies:
- US-1.1 auth

### US-2.2: `US-2.2: Manage addresses with validation and multiple per contact`

Summary:

- Support multiple addresses per contact with basic required-field validation.
  Tasks:
- [ ] Address CRUD
- [ ] Assign addresses to contacts (primary + alternates)
- [ ] Basic validation for required fields
- [ ] Country dropdown
- [ ] Address validation status tracking (even if provider validation is stubbed)
      Acceptance criteria:
- Address must be valid before use in an order.
- Multiple addresses per contact supported.
  Out of scope:
- Full postal address validation provider integration (can be phase-optional).
  Dependencies:
- US-2.1 contacts

### US-2.3: `US-2.3: Add CSV import for contacts and addresses`

Summary:

- Enable import for MVP to reduce manual entry friction.
  Tasks:
- [ ] Upload CSV
- [ ] Map CSV fields to contact/address schema
- [ ] Preview parsed results
- [ ] Apply import with upsert/dedup heuristic
- [ ] Track import success rate and show errors per row
      Acceptance criteria:
- At least 90% successful parsing for valid CSV.
  Out of scope:
- Google Contacts later.
  Dependencies:
- US-2.1 and US-2.2 data models

---

## EPIC 3 — Templates & Editor

### Epic issue: `EPIC-3: Deliver real template previews and a print-ready pipeline`

Summary:

- Seed templates, let users edit messages/photos, render print-ready previews, and keep output immutable later.
  Acceptance criteria:
- A template can be previewed and produces correct print output.

### US-3.1: `US-3.1: Seed template catalog and enable preview browsing`

Summary:

- Store template metadata and allow users to browse/preview before selecting.
  Tasks:
- [ ] Template DB schema (metadata, fields, sizing, orientation)
- [ ] Seed 5–10 MVP templates (birthday/general/holiday)
- [ ] Template list + search (optional)
- [ ] Load templates < 1s in UI (target)
- [ ] Provide a lightweight preview UI (thumbnail)
      Acceptance criteria:
- Templates load < 1s (target, measure in dev).
- User can preview before selecting.
  Out of scope:
- Full template marketplace.
  Dependencies:
- Postgres and storage setup

### US-3.2: `US-3.2: Implement MVP editor with variables and photo placement`

Summary:

- Let users enter message content with variables and optionally attach one photo.
  Tasks:
- [ ] Text editor with variables (e.g., `{first_name}`)
- [ ] Image upload (max 1 image)
- [ ] Basic positioning controls (center/fit)
- [ ] Live preview (front/back thumbnail or overlay)
- [ ] Template field binding from catalog metadata
      Acceptance criteria:
- Preview reflects final output within tolerance (defined in rendering service tests).
- User can edit and re-preview instantly.
  Out of scope:
- Multi-image layouts and advanced typography.
  Dependencies:
- US-3.1 template catalog

### US-3.3: `US-3.3: Build template rendering service (HTML -> print-ready PDF)`

Summary:

- Render templates with user personalization and optional photos into a print-ready PDF.
  Tasks:
- [ ] HTML/CSS template engine for each template version
- [ ] PDF generation pipeline
- [ ] Safe-area + bleed support from partner constraints
- [ ] Rendered file storage (S3-compatible)
- [ ] Immutability:
  - lock the output for an order once created
- [ ] Add golden snapshot tests for rendering correctness
      Acceptance criteria:
- Generated PDF matches template layout exactly (validated by golden snapshots + manual proof checks).
- File is immutable after order creation.
  Out of scope:
- Vector-first tooling (HTML->PDF for MVP).
  Dependencies:
- US-3.2 editor preview data contract

---

## EPIC 4 — Moments (Automation Engine)

### Epic issue: `EPIC-4: Turn moments rules into scheduled drafts with approvals`

Summary:

- Create moments rules, compute next occurrences, generate drafts at lead time, and manage draft approval.
  Acceptance criteria:
- Creating a moment reliably generates a draft on schedule.

### US-4.1: `US-4.1: Create moment rule UI (trigger logic + delivery preference)`

Summary:

- Let users configure moments: target contacts, trigger date logic, template, message, and delivery preferences.
  Tasks:
- [ ] Moment form with:
  - contact(s) selection
  - event type (fixed yearly/date range/relative/one-off)
  - trigger date logic
  - lead time X days before send
  - delivery preference (`arrive by` / `ship on`)
- [ ] Template selection and message editing
- [ ] Optional photo upload and crop requirements (minimal MVP crop)
- [ ] Approval mode:
  - MVP default: always ask
  - optional under-budget auto-send stub (feature flag)
- [ ] Save schedules and show next scheduled draft time
      Acceptance criteria:
- Saving creates a "next scheduled draft".
- UI shows upcoming send date.
  Out of scope:
- Complex budgeting/multi-campaign orchestration.
  Dependencies:
- Contacts/addresses (US-2.1/US-2.2)
- Templates/editor (US-3.1/US-3.2)

### US-4.2: `US-4.2: Implement scheduler and draft generation at lead time`

Summary:

- Background job generates drafts X days before computed send date and stores rendered previews.
  Tasks:
- [ ] Rules engine: compute next occurrence(s) from moment config
- [ ] Background job / cron:
  - generate drafts at lead time
- [ ] Persist draft entity and link to moment + contact targets
- [ ] Render draft preview using template/personalization inputs
- [ ] Idempotency:
  - prevent duplicate drafts for the same scheduled occurrence
    Acceptance criteria:
- Draft is created automatically on schedule.
- Draft includes rendered preview artifact reference.
  Out of scope:
- Reprocessing historical drafts with new template versions (can be admin tool later).
  Dependencies:
- US-4.1 moment persistence
- US-3.3 rendering service

### US-4.3: `US-4.3: Manage drafts (approve/edit/skip/snooze)`

Summary:

- Provide a user workflow to review drafts and either approve, snooze, or skip.
  Tasks:
- [ ] Draft list/calendar view for upcoming drafts
- [ ] Approve draft -> transition to "order-ready" state
- [ ] Edit draft contents (message/photo) with re-render if needed
- [ ] Skip draft:
  - mark occurrence as skipped
  - ensure it does not regenerate for the same event occurrence
- [ ] Snooze:
  - e.g., +3 days
    Acceptance criteria:
- Approved draft becomes order-ready.
- Skipped draft does not regenerate for the same event.
  Out of scope:
- Complex rescheduling across multiple carriers/countries.
  Dependencies:
- US-4.2 drafts created

---

## EPIC 5 — Notifications

### Epic issue: `EPIC-5: Email notifications for draft/payment/shipping states`

Summary:

- Notify users on key state transitions with deep links to relevant pages.
  Acceptance criteria:
- Email arrives within 1 minute of trigger (target).

### US-5.1: `US-5.1: Implement email notifications for lifecycle states`

Summary:

- Send emails for draft ready, payment required, shipped, and failed orders.
  Tasks:
- [ ] "Draft ready for review" email with link to draft approval page
- [ ] "Payment required" email
- [ ] "Approved and queued" email (optional for MVP, can be implicit)
- [ ] "Order shipped" email
- [ ] "Order failed" email with actionable guidance
- [ ] Quiet hours logic (configurable window)
      Acceptance criteria:
- Email arrives within 1 minute of trigger.
- Email includes deep link to the relevant page.
  Out of scope:
- Push notifications.
  Dependencies:
- US-4.3 draft states
- US-6.x/US-7.x order statuses

---

## EPIC 6 — Checkout & Payments

### Epic issue: `EPIC-6: Convert approved drafts into paid orders`

Summary:

- Implement pricing engine and Stripe checkout/webhooks so payment is required before fulfillment.
  Acceptance criteria:
- Successful payment creates an order with correct totals and receipt.

### US-6.1: `US-6.1: Implement pricing engine (print + shipping + taxes + margin)`

Summary:

- Calculate final cost shown at checkout with clear breakdown.
  Tasks:
- [ ] Define base prices per format (MVP: postcard, folded card if included)
- [ ] Shipping cost per destination country and shipping type
- [ ] Taxes/VAT handling (basic where applicable)
- [ ] Service fee/margin configuration
- [ ] Return a fully itemized total for checkout UI
      Acceptance criteria:
- Price shown before checkout is final (no surprises).
  Out of scope:
- Complex tax rules per jurisdiction beyond MVP baseline.
  Dependencies:
- Template/order item format definitions

### US-6.2: `US-6.2: Integrate Stripe checkout and webhooks`

Summary:

- Create one-time checkout and convert it into paid orders via webhook.
  Tasks:
- [ ] Stripe one-time payment flow for drafts/orders
- [ ] Store saved payment method reference (optional MVP)
- [ ] Stripe webhooks:
  - payment succeeded
  - payment failed
- [ ] Retry policy for transient webhook/processing failures
- [ ] Idempotency for webhook processing
      Acceptance criteria:
- Successful payment creates order in "paid" state.
- Failed payment returns user to retry.
- Orders are not sent to printing without successful payment.
  Out of scope:
- Advanced subscription upsells (subscription can be phase-optional).
  Dependencies:
- US-6.1 pricing outputs
- US-7.1 order conversion

---

## EPIC 7 — Orders & Fulfillment

### Epic issue: `EPIC-7: Fulfill paid orders and track delivery status`

Summary:

- Integrate provider order creation, upload assets, and synchronize shipment status.
  Acceptance criteria:
- End-to-end: user approves -> pays -> provider prints -> shipment tracked.

### US-7.1: `US-7.1: Convert approved drafts into paid orders`

Summary:

- Transition from approved draft to an order, attach immutable printable assets, and update order status.
  Tasks:
- [ ] Draft -> order conversion
- [ ] Attach PDF asset references (front/back if applicable)
- [ ] Assign order status: `pending fulfillment`
- [ ] Store order metadata needed for provider submission
      Acceptance criteria:
- Order appears in dashboard immediately.
  Out of scope:
- Complex admin-driven order splitting.
  Dependencies:
- US-4.3 draft approval states
- US-6.2 payment webhook events

### US-7.2: `US-7.2: Integrate print provider order creation`

Summary:

- Implement provider adapter for API order creation and asset upload.
  Tasks:
- [ ] Provider API client wrapper
- [ ] Submit order to provider
- [ ] Upload PDF asset(s)
- [ ] Store provider order reference ID
- [ ] Persist provider request/response logs (redacted)
- [ ] Automatic retry on transient errors
      Acceptance criteria:
- Order successfully created in provider system.
  Out of scope:
- Advanced provider-specific features (gift bags, complex bundles).
  Dependencies:
- Chosen print provider from phase-0
- US-7.1 order records

### US-7.3: `US-7.3: Track fulfillment status via webhooks/polling`

Summary:

- Keep order status in sync from provider and surface it to the user.
  Tasks:
- [ ] Webhook endpoint implementation (preferred)
- [ ] Polling job fallback (if webhooks fail/for early MVP)
- [ ] Map provider statuses -> internal lifecycle states
- [ ] Update user-visible status timeline
- [ ] Failure handling + alerts/notifications
- [ ] Admin view: inspect provider reference ID and raw events (redacted)
      Acceptance criteria:
- Status visible to user.
- Failures trigger alert + notification.
  Out of scope:
- Fully automated "return to sender" workflow.
  Dependencies:
- US-7.2 provider submission

---

## EPIC 8 — Admin (Internal)

### Epic issue: `EPIC-8: Give support tooling to resolve order issues`

Summary:

- Provide read-only views for users/orders plus operational controls for resend/reprint and template management.
  Acceptance criteria:
- Support can resolve issues without DB access.

### US-8.1: `US-8.1: Implement internal order dashboard with resend controls`

Summary:

- Let admin/support find orders, view details, and trigger resend/reprint actions.
  Tasks:
- [ ] Order search (by user/email/order id)
- [ ] Order detail page (address, status, provider ref id)
- [ ] Resend/reprint control (provider API call)
- [ ] Read-only audit logs view
      Acceptance criteria:
- Support can resolve issues without DB access.
  Out of scope:
- Full admin analytics.
  Dependencies:
- US-7.x order status updates

### US-8.2: `US-8.2: Basic admin template management`

Summary:

- Allow uploading/updating template assets and defining template fields for future use.
  Tasks:
- [ ] Template asset upload UI
- [ ] Define/validate template fields and safe-area constraints
- [ ] Store new template versions
- [ ] Ensure runtime supports new templates without redeploy
      Acceptance criteria:
- New template usable without redeploy.
  Out of scope:
- Fine-grained role permissions (basic admin auth only).
  Dependencies:
- US-3.x template metadata and rendering contracts

---

## EPIC 9 — Compliance & Safety

### Epic issue: `EPIC-9: GDPR basics and content safety for order generation`

Summary:

- Provide minimal GDPR compliance flows and basic content filtering to block obvious abuse.
  Acceptance criteria:
- User can delete account and all personal data removed.
- Blocked content cannot proceed to order.

### US-9.1: `US-9.1: Implement GDPR export + deletion`

Summary:

- Support export of user data and deletion of personal data with minimal retention.
  Tasks:
- [ ] "Export my data" endpoint/job
- [ ] "Delete my account" flow
- [ ] Privacy policy page
- [ ] Ensure deletion removes personal data while preserving required audit/order fields (as allowed)
      Acceptance criteria:
- User can delete account and all personal data removed.
  Out of scope:
- Complex DPA/legal automation.
  Dependencies:
- US-1.x user data model

### US-9.2: `US-9.2: Add MVP content filtering for abusive messages`

Summary:

- Block obvious abusive/threatening content from proceeding to order creation.
  Tasks:
- [ ] Keyword/heuristic filter for abusive content (MVP)
- [ ] Flag suspicious usage for admin review
- [ ] Enforce blocking in the draft->order transition pipeline
- [ ] Test blocked vs allowed content scenarios
      Acceptance criteria:
- Blocked content cannot proceed to order.
- User receives clear error messaging.
  Out of scope:
- Advanced ML-based moderation and appeals workflow.
  Dependencies:
- US-4.3 draft management / US-7.1 order creation enforcement point
