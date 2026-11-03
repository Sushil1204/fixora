# Product Brief
## Client Demo Product Brief & Frontend Experience Specification

- **Document type:** Product brief / frontend demo specification
- **Product:** Fixora — trusted home-repair booking experience
- **Market context:** India
- **Release intent:** High-fidelity client demonstration, not production launch
- **Scope:** Frontend experience only; mock data and simulated interactions
- **Status:** Refined working specification
- **Related documents:** `design.md`, `wireframes.md`, `competitor-research.md`, `asset-sources.md`, `demo-script.md`

---

## 1. Executive Summary

Fixora is a home-services marketplace concept that helps customers discover, compare, schedule, and manage trusted repair services through a polished, mobile-first Progressive Web App. The demonstration should communicate a credible service brand, transparent pricing, dependable technician workflows, and clear operational oversight.

The demo is intended to help a prospective client evaluate the product vision, user experience, interface quality, and business workflows. It must look and behave like a coherent product—not a student project, static landing page, or disconnected collection of dashboard screens.

The experience will demonstrate three role-based surfaces:
1. **Customer portal:** Discover a repair service, understand the offer, select a slot and address, review a price estimate, simulate a booking, and track the booking.
2. **Technician portal:** Review assigned work, inspect job details, update simulated progress, and see earnings summaries.
3. **Admin portal:** Review platform activity, bookings, technician verification, disputes, and key operational indicators.

The demo is frontend-only. It must clearly distinguish simulated data and actions from real integrations.

---

## 2. Product Vision and Positioning

### Vision
Make home repairs feel straightforward, transparent, and dependable from finding the right service to knowing what happens next.

### Positioning Statement
For households that need reliable repair help, Fixora is a service-booking experience that brings service discovery, clear estimates, appointment scheduling, technician progress, and after-service support into one organized place.

### Product Principles
- **Trust before conversion:** Explain what is included, what is excluded, and when an estimate can change.
- **Clarity over decoration:** Every screen should have a clear primary task and readable hierarchy.
- **Progress visibility:** Customers should understand booking status and next steps.
- **Professional, not corporate-heavy:** Use calm surfaces, confident typography, useful illustrations, and precise spacing.
- **Mobile-first, desktop-capable:** The customer journey must feel natural on a phone; operations views should use desktop space well.
- **Honest simulation:** Demo interactions may be simulated, but must never imply that a real payment, dispatch, message, or verification occurred.

---

## 3. Goals and Non-Goals

### Demo Goals
- Present a believable home-services marketplace to prospective clients.
- Demonstrate the end-to-end customer booking journey.
- Show a consistent visual system across customer, technician, and admin surfaces.
- Make trust signals, pricing, status, and support easy to understand.
- Demonstrate responsive behavior across mobile, tablet, and desktop.
- Use realistic seeded data to make the product feel operational.
- Provide a stable click-through demo with complete loading, empty, success, and error states where relevant.

### Explicit Non-Goals for This Phase
- No backend implementation.
- No production authentication or authorization.
- No live technician dispatch or GPS tracking.
- No real payment processing, refunds, SMS, email, WhatsApp, or push delivery.
- No real identity verification or document storage.
- No real customer personal data.
- No claim of legal, tax, security, or operational readiness.
- No database schema, API contract, or infrastructure buildout in this deliverable.

All demo data should be fictional and clearly isolated in a mock-data layer. The interface should make it easy to replace mock services with real integrations later.

---

## 4. Audience and Primary Personas

### Persona A: The Busy Homeowner
- **Needs:** Find a reliable technician, understand approximate cost, book a convenient slot, and know who is coming.
- **Concerns:** Hidden charges, missed appointments, inconsistent service quality, unclear cancellation terms.
- **UX Response:** Clear service scope, transparent estimate, appointment confirmation, status timeline, support access.

### Persona B: The Technician
- **Needs:** Understand the job, customer notes, location, time, required actions, and expected earnings.
- **Concerns:** Incomplete job information, unclear changes, untracked additional work, confusing job statuses.
- **UX Response:** Task-focused dashboard, readable job cards, explicit status transitions, visible quote approval state.

### Persona C: The Operations Manager
- **Needs:** Quickly understand booking volume, exceptions, technician readiness, unresolved disputes, and payment issues.
- **Concerns:** Hidden operational problems, inconsistent status reporting, unclear ownership of cases.
- **UX Response:** Prioritized operational metrics, actionable queues, filters, clear ownership, audit-friendly detail views.

---

## 5. Product Scope by Portal

### 5.1 Public and Customer Portal

#### Public Landing Page
- Clear value proposition and primary "Book a repair" action.
- Service category discovery.
- Trust and process explanation.
- Transparent estimate and approval principles.
- Featured/popular services using realistic demo content.
- Social proof only when data is explicitly marked as illustrative.
- Responsive footer with support, policies, and company links.

#### Customer Home
- Location context and serviceability entry point.
- Search services.
- Service category grid.
- Popular services with starting prices and estimated durations.
- "How it works" / trust strip.
- Upcoming booking summary when demo user is signed in.
- Bottom navigation on mobile: Home, Services, Bookings, Profile.

#### Service Discovery
- Category list and category detail.
- Search and simple filters.
- Service cards with name, short description, starting price, duration, and relevant trust cues.
- Empty state when no service matches.

#### Service Details
- Service-specific hero illustration or photo.
- Service title, price basis, estimated duration.
- Scope and included work.
- Exclusions and possible additional charges.
- Cancellation and warranty summary.
- Trust cues without unsupported claims.
- Primary "Choose a time" / "Book service" action.

#### Booking Flow
A compact, guided flow with clear progress:
1. **Address:** Choose saved address or add a demo address.
2. **Schedule:** Choose an available date and time.
3. **Issue details:** Add notes and optionally attach a demo image.
4. **Estimate:** Review service charge, fees, tax line, and estimate disclaimer.
5. **Payment preference:** Select a simulated option.
6. **Review and confirm:** Summarize the request and confirm a simulated booking.

*Requirements:*
- Preserve entered data when moving between steps.
- Display inline validation.
- Show the selected service, address, date/time, and estimated total before confirmation.
- Confirmation creates a mock booking and navigates to the booking detail.
- Do not represent a demo payment as processed.

#### Bookings
- Tabs or filters for Upcoming, Completed, and Cancelled.
- Booking card with service, date/time, reference, status, and next action.
- Booking detail with address, estimate breakdown, status timeline, and cancellation/support actions appropriate to the simulated state.
- Meaningful empty state and retryable error state.

#### Profile
- Customer name and contact summary.
- Edit profile.
- Saved addresses.
- Notifications.
- Help and support.
- Legal/policy links.
- Sign out demo action.
- Destructive actions must be visually separated and confirmed.

#### Notifications and Support
- Notification list with read/unread styling.
- Support entry point with topic selection and booking reference.
- Demo ticket creation shows a clearly simulated success state.

---

### 5.2 Technician Portal
The technician experience should be task-oriented and optimized for a phone.

#### Technician Dashboard
- Greeting and availability status.
- Today's assigned jobs.
- Upcoming jobs.
- Outstanding actions.
- Earnings snapshot.
- Clear "Open job" actions.

#### Job Detail
- Booking reference, service, schedule, and permitted customer/job details.
- Customer notes and address summary.
- Navigation link presented as a demo affordance only.
- Job checklist and required evidence placeholders.
- Clear job status and next permitted action.
- Additional-work quote area with itemized line items and a simulated customer approval state.

#### Job Workflow
Demonstrate only valid transitions in the UI:
- `Assigned` → `Accepted`
- `Accepted` → `On the way`
- `On the way` → `Arrived`
- `Arrived` → `In progress`
- `In progress` → `Awaiting customer approval` (if a quote is raised) or `Completed`
- Completed jobs become read-only except for permitted notes.

*The demo must not imply that the backend enforces these transitions.*

#### Earnings
- Completed job count.
- Gross value, illustrative commission, and net estimate.
- Pending and paid settlement examples.
- Label values as demo data.

#### Technician Profile
- Profile summary, skill categories, coverage area, availability, and verification status.
- Verification must be presented as a demo status, not a real check.

---

### 5.3 Admin / Operations Portal
The admin experience should feel like a focused operations workspace, not a customer page stretched to desktop.

#### Operations Overview
- Booking volume and status summary.
- Illustrative gross booking value and platform commission.
- Pending technician approvals.
- Payment issue queue.
- Open disputes and support cases.
- Recent bookings and operational alerts.
- Date-range selector with a clear selected period.
- Every metric should have a label and useful contextual explanation.

#### Booking Operations
- Search by reference, service, customer, technician, and status.
- Status filters and date filters.
- Booking detail drawer/page.
- Assignment/reassignment simulated action.
- Clear history/timeline.

#### Technician Management
- Technician list with skills, coverage, demo verification state, and activity.
- Review profile and demo documents represented by safe placeholders.
- Approve/reject buttons simulate state changes and show confirmation.

#### Disputes and Support
- Prioritized queue with status, owner, age, and linked booking.
- Filter by priority/status/owner.
- Case detail with issue summary, timeline, evidence placeholders, and internal notes visually separated from customer-visible content.
- Assignment and resolution actions show confirmation and update mock state.

#### Service Catalogue
- Categories and services with image, price basis, availability, and publication status.
- Demo edit/add/archive interactions only if they can be completed coherently.
- Destructive actions require confirmation.

---

## 6. Information Architecture

### Customer
- `/` — public landing / customer home
- `/services` — service catalogue
- `/services/[slug]` — service detail
- `/book/[serviceSlug]` — booking flow
- `/bookings` — booking list
- `/bookings/[bookingId]` — booking detail
- `/notifications` — notification centre
- `/profile` — profile overview
- `/profile/edit` — edit profile
- `/profile/addresses` — saved addresses
- `/support` — help and support

### Technician
- `/pro` — technician dashboard
- `/pro/jobs` — job list
- `/pro/jobs/[jobId]` — job detail
- `/pro/earnings` — earnings
- `/pro/profile` — technician profile

### Admin
- `/admin` — operations overview
- `/admin/bookings` — booking operations
- `/admin/technicians` — technician management
- `/admin/disputes` — dispute queue
- `/admin/services` — service catalogue
- `/admin/customers` — customer list

---

## 7. Demo Data and Content Rules

- Use fictional names, addresses, phone numbers, and booking references.
- Never use a real person's private information.
- Mark demo metrics and financial values as illustrative where a viewer could mistake them for live data.
- Use consistent Indian English conventions and INR formatting.
  - Example price display: From ₹499.
  - Example estimate: Estimated total ₹637.82 with an explicit note that final charges depend on inspection and customer approval.
- Use one terminology set throughout: "booking", "technician", "estimate", "service charge", "additional work", "support case".
- Avoid unsupported phrases such as "guaranteed", "100% safe", "best in India", or "verified" unless explicitly framed as an illustrative demo state.
- Use realistic, concise microcopy rather than filler text or lorem ipsum.

---

## 8. UX Quality Requirements

- Every screen has one clear primary action.
- Page title and key task are visible immediately.
- Important information appears before secondary detail.
- Cards use a consistent information order.
- Status badges always include text, not color alone.
- Long names and titles wrap instead of losing meaning.
- Forms preserve progress and provide inline errors.
- Destructive actions require a confirmation step.
- No visible button is inert: all demo controls must navigate, open a dialog, update mock state, or be clearly disabled with an explanation.
- Loading, empty, error, success, and disabled states are designed—not left to browser defaults.
- Mobile fixed navigation never covers page content.
- Horizontal scrolling is intentional and discoverable.
- The interface works at 320px through wide desktop viewports.

---

## 9. Frontend Demo Architecture (No Backend)

Use the repository's existing stack. If starting from a blank project, recommended frontend choices are:
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Existing component primitives or shadcn/ui where already present
- Lucide React for interface icons
- Local mock data and small client-side state store for demo interactions

### Suggested Frontend Organization
```text
src/
├── app/
│   ├── (public)/
│   ├── (customer)/
│   ├── (technician)/
│   └── (admin)/
├── components/
│   ├── app-shell/
│   ├── navigation/
│   ├── typography/
│   ├── feedback/
│   ├── forms/
│   ├── services/
│   ├── bookings/
│   ├── technician/
│   └── admin/
├── features/
│   ├── booking/
│   ├── profile/
│   ├── notifications/
│   ├── technician-jobs/
│   └── admin-operations/
├── lib/
│   ├── demo-data/
│   ├── demo-state/
│   ├── formatting/
│   └── validation/
├── styles/
├── public/
│   ├── icons/
│   └── images/
└── docs/
    ├── product.md
    ├── design.md
    ├── wireframes.md
    ├── competitor-research.md
    ├── asset-sources.md
    └── demo-script.md
```

### Guidelines
- Keep mock data separate from UI components.
- Use typed domain models for services, bookings, technician jobs, disputes, and notifications.
- Use reusable layout and semantic typography components.
- Prefer server components for static presentation; use client components for interactive demo state.
- Do not add fake API calls or backend scaffolding.
- If persistence is useful, use a simple, clearly documented browser-only demo store. Avoid storing sensitive data.
- Provide a "Reset demo data" action in a discreet developer/demo menu if useful.

---

## 10. Demo Acceptance Criteria

### Customer
- A visitor can explore categories and open a service detail.
- A user can complete a simulated booking flow.
- The new booking appears in the booking list and booking detail.
- The status timeline and estimate are readable on mobile.
- Profile and saved address screens are navigable.

### Technician
- The technician dashboard shows assigned jobs.
- A job can move through the intended demo states.
- Additional work can be proposed and shown as awaiting customer approval.
- Earnings use consistent illustrative calculations and labels.

### Admin
- The operations overview has coherent mock metrics.
- Booking and dispute filters work.
- Admin can simulate assignment and case status updates.
- The selected state visibly updates in the interface.

### Quality
- No horizontal overflow at 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, and 1440px.
- No development overlays in the customer-facing UI.
- No broken images, dead links, or nonfunctional primary actions.
- No unexplained mock values that appear to be live production metrics.
- Lint, type-check, and build pass when scripts are available.
- Primary flows have been visually inspected in a browser.

---

## 11. Delivery Approach

1. Review `design.md` and wireframes.
2. Build the shared shell and token layer.
3. Build customer home and service discovery.
4. Build service details and booking flow.
5. Build booking list/detail and profile.
6. Build technician dashboard and job detail.
7. Build admin operations overview and disputes.
8. Add all states and interactions.
9. Run responsive and functional QA.
10. Prepare the demo using `demo-script.md`.

**Release Definition:** A polished, navigable, frontend-only client demo that communicates a credible product experience while being explicit about simulated data and unimplemented integrations.