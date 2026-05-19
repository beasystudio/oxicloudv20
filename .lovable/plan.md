## Goal

Make the **Pilot Demo** and **Production Dashboard** look and behave like one product. Same cards, same buttons, same layout, same micro-interactions — only the underlying data source differs (pilotSessionStore vs. Supabase / noxProjectStore).

Login screen polish (new background images, right-aligned, logo + wordmark merged) is already shipped in this turn.

## What's actually different today

After diffing `src/pages/dashboard/ProjectsDashboard.tsx` (1552 lines) and `src/pages/pilot/PilotProjects.tsx` (960 lines), and the Contacts equivalents:

**Project module — NOx Assessment card**
- Dashboard: richer status visualization, larger CTA, status badge, sub-status pill, "Continue / Generate Quote / Send to Client / View Report" buttons keyed off `noxData.status` from `noxProjectStore`.
- Pilot: smaller card, fewer states, slightly different button labels and icons, uses `selectedProject.noxStatus` directly.
- Result: same project in the same state shows two different cards.

**Project module — surrounding layout**
- Dashboard binder view: 3-column layout, version-history panel, contacts panel, action-required strip.
- Pilot binder view: 2-column 30/70 split, simplified version history, no action-required strip.

**Contact module**
- Dashboard: tabbed Companies / People / Team, bulk actions, taxonomy table, detail modal with project links.
- Pilot: single list with filter chips, no taxonomy view, simpler detail modal.

## Plan

### Step 1 — Extract shared presentation components
Create `src/components/oxicloud/shared/` with pure, data-agnostic components used by both the pilot and the dashboard. Each takes plain props (no store imports).

- `NoxAssessmentCard.tsx` — the card + CTA matrix (all 7 status states, icons, labels).
- `ProjectBinderLayout.tsx` — the 3-column binder shell (details / NOx / contacts + version history).
- `ProjectListRow.tsx` — list-view row with status dot, number, name, location, manager.
- `ProjectFiltersBar.tsx` — the filter inputs row.
- `ContactListShell.tsx` — Companies / People / Team tabbed list.
- `ContactDetailPanel.tsx` — right-side detail panel.

These accept handlers like `onStartNox`, `onGenerateQuote`, `onSendToClient`, `onViewReport`, etc., so each host wires them to its own store.

### Step 2 — Refactor `ProjectsDashboard.tsx`
Replace its inline NOx card / binder JSX with the new shared components. Wire CTA handlers to existing `noxProjectStore` functions. No behavioral change for production users.

### Step 3 — Refactor `PilotProjects.tsx`
Replace its inline NOx card and binder JSX with the same shared components. Map pilot-store fields → component props (`pilotProject.noxStatus` → `status`, etc.). Wire CTA handlers to `clonePilotNoxVersion` and the existing pilot flows. The pilot card now matches the dashboard pixel-for-pixel.

### Step 4 — Refactor Contacts modules the same way
- `ContactsDashboard.tsx` and `PilotContacts.tsx` both render `ContactListShell` + `ContactDetailPanel`.
- Add the missing tabs / taxonomy view to the pilot side via the shared components.
- Wire pilot data-source adapters.

### Step 5 — Visual QA
Walk both routes side-by-side at desktop and mobile widths and confirm:
- NOx card looks identical in every status
- Project binder layout matches
- Contact list, filters, and detail panel match
- Buttons use the same labels, icons, variants

### Out of scope
- No route changes — `/pilot-demo/*` and `/dashboard/*` stay separate.
- No auth changes — `ProtectedRoute` stays on dashboard, pilot stays open.
- No data-model changes — pilot still uses `pilotSessionStore`, production still uses Supabase.

## Technical notes
- Shared components live in `src/components/oxicloud/shared/` and import only from `@/components/ui/*`, `lucide-react`, `@/types/oxicloud`, and `@/lib/statusLabels`.
- Status → label/icon/variant mapping centralizes in a single `noxCtaConfig.ts` so both hosts get the same button text.
- All copy uses `useLanguage()` t-keys already present in the dashboard version.
- Estimated diff: ~600 new lines (shared), ~400 lines removed from each host file.

## Deliverable
After approval I will execute Steps 1–5 in one pass and verify visually.
