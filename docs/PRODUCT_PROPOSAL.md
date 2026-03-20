## Product Proposal: Moments-to-Mail Automation

### One-line
An app that automatically prepares and sends personalized physical mail (cards/postcards/puzzle cards/letters) based on user-defined life events, with optional "auto-send" approval rules.

### Core promise
"Never miss a moment. Set it once; we'll handle the rest."

### Target users
- People with many relationships to maintain (family, long-distance friends, busy professionals)
- Gift-givers who want to look thoughtful without effort
- Optional later: teams (HR sending employee moments)

### Monetization (built into the requirements)
- Subscription
  - Event automation
  - Reminders
  - Address book
  - Premium templates
  - Scheduled campaigns
- Per-item margin
  - Print cost + postage cost + markup
- Add-ons (later or phased)
  - Handwriting font
  - Premium paper
  - Puzzles
  - International shipping
  - Gift bundles (explicitly out of MVP)

## MVP Scope (start small, still shippable)

### MVP must do
1. Users create contacts + addresses.
2. Users create "Moments" (event rules) that generate a mail item.
3. System generates a preview (template + personalization + optional photo).
4. Users approve and pay (or auto-send if rule allows).
5. Order is sent to a print partner and status is tracked.

### MVP should not do (avoid bloat)
- No AR
- No gift boxes
- No multi-item bundles
- No complex AI copywriting beyond short message suggestions (optional)
- No marketplace of creators (later)

## MVP Acceptance Criteria (end-to-end)
- A new user can reach a "ready" state in under 5 minutes with:
  - one contact
  - one moment rule
- The user can:
  - receive a draft email
  - approve
  - pay successfully
  - successfully submit a physical card order to the print partner
  - track order status to completion (or "failed/returned")

## Detailed Requirements

### 1) User accounts and onboarding
**Auth**
- Email/password for MVP, plus OAuth (Google/Apple) as a later extension or optional scope.
- Email verification.

**Onboarding flow**
- Add at least 1 contact
- Add at least 1 "moment rule"
- Pick default sender address
- Add payment method (optional until first checkout)

**Acceptance**
- Unverified users cannot place orders.

### 2) Contacts and address book
**Entities**
- `Contact`
  - name
  - relationship tag (family/friend/partner/work)
  - birthday (date-only for MVP)
  - timezone (optional)
  - notes
- `Address`
  - line1/line2/city/postcode/country
  - validation status

**Features**
- Add/edit/delete contacts
- Add multiple addresses per contact (primary + alternates)
- Address validation via provider API (optional but recommended to reduce returned mail)
- Duplicate contact prevention (email/name heuristic)
- Returned mail handling
  - mark address invalid
  - notify user

**Import**
- CSV import for MVP (Google Contacts later).

**Acceptance**
- Address must be valid before use in order.

### 3) Moments (automation rules)
A "Moment" is a rule that triggers a mail item.

**Moment types (MVP)**
- Fixed date yearly: birthdays, anniversaries
- Date range triggers: "between Dec 1–20 send holiday card"
- Relative reminders: "X days before event"
- One-off dates: "new home", "new job", "graduation"

**Moment rule configuration**
- Name (e.g., "Dad birthday")
- Target contact(s): one or many
- Trigger date logic
- Lead time: prepare X days before send date
- Delivery date preference: "arrive by" or "ship on"
- Template selection (design + layout)
- Message source:
  - manual message
  - dynamic message with variables (example: `{first_name}`)
  - optional AI suggestions (guardrailed, short, non-creative "assistant" behavior)
- Media:
  - optional photo upload
  - crop tool requirements (minimal crop for MVP)
- Approval mode:
  - MVP default: "Always ask me"
  - nice-to-have: "Auto-send under €X"
- Budget cap per month (nice-to-have)
- Shipping type: standard/priority (depending on provider capabilities)

**Acceptance**
- Creating a moment produces a scheduled item in a calendar/list view.
- User can snooze or skip an upcoming send.

### 4) Template and personalization system
**Template catalog**
- Template metadata: category, occasion, orientation, supported sizes, fields
- Versioning:
  - templates can evolve without breaking old previews

**Basic editor**
- Select template
- Insert name variables
- Edit message text
- Place photo (optional)
- Preview front/back

**Rendering**
- Render to print-ready PDF (CMYK when required by partner).
- Store preview artifact and final printable asset as immutable.
- Must respect partner bleed/safe-area constraints.

**Acceptance**
- Preview matches output (no unexpected crops/margins).
- Each print partner's safe-area constraints are respected.

### 5) Scheduling, reminders, notifications
**Reminder flow**
- When a moment is approaching, system creates a "Draft Send".
- Notify user via email (MVP).
- Push notifications can be later.

**Notification states**
- Draft ready for review
- Payment required
- Approved and queued
- Shipped
- Delivered (if partner provides)

**Important**
- Lead times depend on destination country and shipping type.
- System recommends ship date based on "arrive by" preference.
- Quiet hours supported.

**Acceptance**
- Moment generates drafts early enough to ship on time.

### 6) Checkout and payments
**Payments**
- Stripe recommended:
  - one-time payments per order
  - subscription tiers
  - saved payment methods
  - tax/VAT where applicable

**Checkout requirements**
- Clear cost breakdown:
  - print + shipping + taxes + service fee
- Confirm delivery address and sender address
- Optional tip (later)
- Receipt email

**Acceptance**
- Payment failure retries + user prompted to update payment method.
- Orders aren't sent to printing without successful payment.

### 7) Orders and fulfillment integration
**Order lifecycle**
- Draft -> Approved -> Paid -> Sent to print -> In production
-> Shipped -> Delivered/Completed -> Failed/Returned

**Fulfillment**
- Provider adapter:
  - create order
  - upload assets
  - submit shipment
  - handle webhooks (preferred) or polling fallback
  - international shipping support (only if provider supports MVP destinations)

**Operational requirements**
- Store provider request/response logs (redacted).
- Automatic retry on transient failures.
- Manual admin override panel (internal tool).

**Acceptance**
- Each order has a traceable provider reference ID.
- Failures produce actionable alerts.

### 8) Admin (internal)
- Manage templates (upload assets, define fields, safe areas).
- View users/orders (read-only for support).
- Refund flow (Stripe).
- Reprint/resend controls.
- Flag suspicious activity (fraud/spam).

### 9) Legal, compliance, safety
- Privacy policy and terms.
- GDPR basics:
  - data export + deletion
  - minimal data retention
  - DPA with vendors:
    - print provider
    - email provider
    - Stripe
- Content policy:
  - disallow abusive/threatening content
  - MVP filter for obvious prohibited content
- Address handling:
  - "return address" required depending on country/provider rules

## Non-Functional Requirements
- Reliability: draft generation must run on schedule (job system).
- Auditability:
  - immutable print assets per order
  - auditable order lifecycle transitions
- Security:
  - encrypt sensitive data at rest where possible
  - strict access control for admin
- Performance:
  - preview render typical < 5-10 seconds
- Observability:
  - structured logs
  - order funnel metrics
  - alerting

## Suggested Architecture (pragmatic, production-ready)

### Frontend
- Web app first (mobile-responsive)
- React + TypeScript
- Template preview:
  - server-rendered PDF preview + image thumbnails

### Backend
- Node.js (NestJS) or Python (FastAPI) (pick one early).
- DB: Postgres
- Background jobs:
  - BullMQ (Redis) or Celery/RQ
- File storage:
  - S3-compatible (PDFs/images)
- Email:
  - Postmark/SendGrid

### Key modules/services
1. Auth + users
2. Contacts + addresses
3. Moments rules engine
4. Draft generation service
5. Template rendering service (HTML->PDF pipeline)
6. Payments (Stripe)
7. Fulfillment adapter (provider API)
8. Notifications
9. Admin panel

### High-level data model
- `users`
- `contacts`
- `addresses`
- `moments` (rules)
- `drafts` (instances generated for a send window)
- `orders`
- `order_items` (front/back assets, sizing)
- `payments` (Stripe refs)
- `templates`
- `uploads` (photos/assets)
- `events` / `audit_logs`

## Build Plan (Phased Implementation)

### Phase 0: Discovery and vendor selection (1–2 weeks)
Deliverables
- Choose print provider (API quality + cost + countries + formats)
- Define product formats for MVP (postcard 4x6 and/or folded card)
- Finalize lead-time rules per destination
- Subscription tiers + per-item pricing model

Exit criteria
- Create and submit a test item via provider API to yourself.

### Phase 1: Foundation (Week 1–2)
Build
- Repo setup, CI, environments (dev/staging/prod)
- DB schema + migrations
- Auth + user profile
- Basic admin authentication
- Storage bucket setup

Exit criteria
- User can sign up/login and see an empty dashboard.

### Phase 2: Contacts + addresses (Week 2–3)
Build
- CRUD contacts and addresses
- CSV import
- Basic list/search/filter

Exit criteria
- User can manage contacts/addresses reliably.

### Phase 3: Templates + preview rendering (Week 3–5)
Build
- Template metadata model
- Template selection UI
- Simple editor (text + variables + optional photo)
- Rendering pipeline to print-ready PDF
- Preview thumbnails + downloadable proof

Exit criteria
- A template can be previewed and produces correct print output.

### Phase 4: Moments + draft generation + scheduler (Week 5–7)
Build
- Moments rule creation UI
- Rules engine that computes next occurrences
- Background job creates drafts at lead time
- Draft review screen + skip/snooze
- Email notifications: "Draft ready"

Exit criteria
- Creating a moment reliably generates a draft on schedule.

### Phase 5: Payments + orders (Week 7–8)
Build
- Stripe integration:
  - subscription products
  - checkout for one-offs
- Draft -> order conversion
- Store immutable print assets for the order

Exit criteria
- Paid order is created with correct totals and receipt.

### Phase 6: Fulfillment integration + tracking (Week 8–10)
Build
- Provider adapter:
  - create order
  - upload assets
  - submit
- Status sync (webhooks preferred; polling fallback)
- Failure handling + retries
- Admin order view + resend/reprint controls

Exit criteria
- End-to-end: approve -> pay -> provider prints -> shipment tracked.

### Phase 7: Hardening + launch readiness (Week 10–12)
Build
- Monitoring/alerting
- Rate limiting + abuse controls
- GDPR flows: export/delete
- Support tooling: order lookup, refunds
- Copy, onboarding polish, pricing page

Exit criteria
- Failures don't require DB manual fixes.
- Support can answer "Where is my order?" in < 30 seconds.

## Testing Strategy (must-have)
- Unit tests
  - Moment date calculations (DST/timezones)
  - Pricing calculations
  - Template rendering correctness:
    - golden snapshots
- Integration tests
  - Stripe webhooks
  - print provider API sandbox
- E2E tests
  - contact -> moment -> approve -> pay -> order submitted

## Risks and Mitigations
1. Fulfillment provider limitations
  - validate API + formats early (Phase 0)
2. On-time delivery expectations
  - conservative lead times + clear "arrive by" disclaimers
3. Preview mismatch
  - safe-area overlays + print proof tests
4. Fraud/abuse
  - payment required + content filtering + rate limits
5. Unit economics uncertainty
  - lock pricing rules early + measure margin per order from day 1

## Completion Definition ("Done")
- A new user can:
  - add a contact and address
  - create a birthday moment
  - receive a draft email
  - approve, pay, and send a physical card
  - track status to completion
- Admin can:
  - find user/order
  - refund if needed
  - trigger resend if provider failed
- Metrics dashboard exists for:
  - activation
  - draft-to-approval conversion
  - paid orders
  - margin per order
  - delivery failures/returns rate

## What to Build First (strict priority)
1. Contacts + addresses
2. Template preview (must feel real)
3. Manual order (automation later)
4. Payment
5. Fulfillment
6. Moments automation

## Notes on the current repository
This repo is currently empty (no `package.json` or build tooling yet). After scaffolding exists, ensure lint, prettier, build, and tests pass per the project rules.
