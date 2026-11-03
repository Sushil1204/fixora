# Icon and SVG Sources
## Fixora - Icon, SVG, and Visual Asset Sources

### Recommended Default: Lucide
- **Website:** https://lucide.dev/
- **License:** ISC License (https://lucide.dev/license)
- **React Package:** `lucide-react`

Lucide is recommended because its icons share a consistent outline style, scale cleanly as SVG, and are available as framework components.

### Suggested Icon Mappings

| Use | Lucide Icon |
|---|---|
| Home | `House` |
| Services | `LayoutGrid` |
| Search | `Search` |
| Bookings | `CalendarDays` |
| Profile | `UserRound` |
| Notifications | `Bell` |
| Plumbing | `Droplet` |
| Electrical | `Zap` |
| AC/airflow | `Wind` or `Fan` |
| Appliance | `Refrigerator` |
| Mobile/device | `Smartphone` |
| Tools/repair | `Wrench` |
| Address | `MapPin` |
| Price | `IndianRupee` |
| Trust | `ShieldCheck` |
| Support | `CircleHelp` |
| Dispute | `MessageSquareWarning` |
| Technician assignment | `UserCheck` |
| Status history | `History` |
| Back | `ArrowLeft` |

---

### Alternative: Heroicons
- **Website:** https://heroicons.com/
- **License:** MIT License

### SVG Asset Rules
- Use SVG for logos, category illustrations, simple empty states, and simple diagrams.
- Keep decorative SVGs `aria-hidden="true"`; provide accessible text for meaningful illustrations.
- Use `viewBox`, preserve aspect ratio, and avoid hard-coded dimensions that prevent scaling.
- Use `currentColor` for monochrome interface icons where appropriate.