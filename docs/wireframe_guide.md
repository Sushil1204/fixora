# Wireframe Guide
## Screen Inventory & Wireframe Notes

This document describes the accompanying editable SVG wireframes in `wireframes/`. The SVGs are original layout references, not production-ready screen assets. Use them to align page hierarchy before implementing final responsive components.

---

## Included Wireframes

1. `wireframes/customer-home.svg` — Customer home / service discovery
2. `wireframes/service-detail.svg` — Service detail and pricing scope
3. `wireframes/booking-flow.svg` — Booking schedule, estimate, and confirmation summary
4. `wireframes/customer-bookings.svg` — Bookings list and status hierarchy
5. `wireframes/technician-dashboard.svg` — Technician work queue
6. `wireframes/admin-operations.svg` — Operations dashboard and exceptions

---

## Design Rationale

### Customer Home
- Brand and location context first.
- Search and category discovery above promotional content.
- Popular services expose price context.
- Mobile navigation remains visible without overlapping content.

### Service Detail
- Service identity, price basis, and duration form the first decision group.
- Included/excluded scope is easy to scan.
- Additional work and estimate conditions are disclosed before booking.

### Booking Flow
- Step progress indicator clearly visible.
- Address, slot, and estimate summarized before confirmation.
- Estimate disclaimer positioned near the amount.

### Customer Bookings
- Status, service, appointment, and next action are consistently positioned.
- Card titles wrap gracefully without clipping.

### Technician Dashboard
- Immediate work takes priority over secondary metrics.
- Status changes are explicit and actionable.

### Admin Operations
- Exception queues prioritized above decorative analytics.
- Desktop uses a collapsible sidebar workspace; narrow screens convert tables into structured cards.