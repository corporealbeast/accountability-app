# Accountability App — Project Guidelines

## Theme

**Dark Wolf Gray** `#2C2F33` — primary background, sidebar dark areas, card bases
**Powder Blue** `#B0E0E6` — primary text, active states, accents, brand elements

### Derived palette
| Token | Hex | Use |
|---|---|---|
| `wolf-gray` | `#2C2F33` | Main background |
| `wolf-gray-light` | `#36393F` | Cards, elevated surfaces |
| `wolf-gray-dark` | `#23262A` | Sidebar, deep backgrounds |
| `powder-blue` | `#B0E0E6` | Primary text, active nav, headings |
| `powder-blue-dark` | `#8ACDD4` | Hover states, secondary accents |
| muted text | `#9aa5b0` | Body text, descriptions |
| dim text | `#7a8a95` | Placeholder, footer, disabled |

All new components must use these colors. Avoid introducing other accent colors without updating this document.

---

## Dashboard Sections

| Section | Route prefix | Purpose |
|---|---|---|
| **House of Power** | `/house-of-power` | Core goals and accountability tracking |
| **Strength Collective** | `/strength-collective` | Workout logging and progress |
| **PowerSource** | `/powersource` | Energy, nutrition, and recovery |
| **GrayRevenue** | `/gray-revenue` | Revenue streams and financial projections |
| **Health Monitor** | `/health-monitor` | Vitals, sleep, and health metrics |

---

## Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** (custom colors extended in `tailwind.config.ts`)
- React 19

## Conventions
- All components use `"use client"` only when client interactivity is needed.
- Inline `style` props are acceptable for one-off color overrides using the CSS variables above.
- Prefer `gap` and `space-*` Tailwind utilities over manual margin stacking.
