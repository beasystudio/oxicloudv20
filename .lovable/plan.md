

## Plan: Multi-Area Improvements (Batch 2)

This plan covers 8 areas of changes across both Pilot and Production flows.

---

### 1. Remove VAT Search from "Join as Architecture Partner" Form

**Goal:** Simplify the partner registration form to reduce friction. VAT/KBO lookup stays only in the full account creation form.

**Changes:**
- **`src/pages/pilot/PilotRegister.tsx`**: Remove the entire VAT Lookup section (VAT input, Lookup button, address fields that appear after KBO lookup). Keep only: Company Name (free text), First Name, Last Name, Email, Phone. Remove `lookupVATNumber`, `validateBelgianVAT`, `formatVATNumber`, `KBOCompanyData` imports, `isLookingUp`, `kboLoaded`, `lookupError` state, and `handleVATLookup` function.
- **`src/pages/Register.tsx`**: No changes needed (this is the marketing page, not a form).

**VAT/KBO search stays in:**
- **`src/pages/pilot/PilotCreateAccount.tsx`** ("Maak uw gratis OxiCloud-account aan"): Already has company fields. Add a VAT/KBO search section here (import `lookupVATNumber` etc.) so users can either auto-fill via KBO or manually enter company details. Add a VAT input + Lookup button at the top of the "Bedrijfsgegevens" section.

---

### 2. Contact Person Form -- Firma Dropdown (No Free Text)

**Goal:** The "Firma" field in the Add Person dialog must be a dropdown of existing companies from the contacts module. No free text. Never show owning companies (GDesign, 4TAKT).

**Changes:**
- **`src/components/contacts/AddPersonDialog.tsx`**: Already uses a `Select` dropdown filtering out `INTERNAL_COMPANIES`. Verify the filter list matches owning companies. This is already correct.
- **`src/components/pilot/PilotAddPersonDialog.tsx`**: Already uses a `Select` dropdown filtering out the pilot's own company. Already correct.

No code changes needed -- both forms already enforce dropdown-only with internal company filtering.

---

### 3. Employee Form -- Firma Fixed to Owning Company

**Goal:** The "Firma" field for employees must be fixed to the owning company (e.g., GDesign). No free text, no changing.

**Changes:**
- **`src/components/users/UserFormDialogRedesigned.tsx`** (line 215-218): Replace the free-text `Input` for "Firma" with a read-only `Input` that displays the owning company name from `getSelectedCompany()`. Import `useMockAuth` (already imported) and use `getSelectedCompany()?.name` as the value. Set `readOnly` and `className="bg-muted/50"`.
- **`src/components/pilot/PilotAddEmployeeDialog.tsx`** (line 246-259): Already conditionally shows read-only for single company or dropdown for multiple companies. For consistency, if `availableCompanies` has only the owning company, it should always be read-only. This is already handled. No change needed.

---

### 4. Contact Detail Modal -- Separate Person View

**Goal:** When viewing a Person contact, the detail modal must NOT show: Bevestiging (Monitoring checkbox), Division, Peppol ID, VAT Number, KBO Number. These are company-only fields.

**Changes:**
- **`src/components/contacts/ContactDetailModal.tsx`**: 
  - Check `editedContact.isCompany` to conditionally render fields.
  - Hide the following when `!editedContact.isCompany`:
    - VAT Number field (line 256-257)
    - KBO field (line 257)
    - Peppol ID field (lines 259-276)
    - Monitoring checkbox (lines 306-316)
    - Billing Address section (lines 322-330) -- persons don't have billing addresses
    - Addresses section (lines 361-411) -- persons don't have multiple locations
  - For persons, show instead: First Name, Last Name, Company (read-only link), Email, Phone, Mobile, Nationality, Language.

---

### 5. Project Contacts Sync to Global Address Book

**Goal:** When a contact is added to a project, it must also appear in the global Contacts module.

**Changes:**
- **`src/pages/dashboard/ContactsDashboard.tsx`**: Currently uses hardcoded `DEMO_COMPANIES` and `DEMO_PERSONS` arrays. Ensure all demo project contacts are included in these arrays. Currently they already include contacts from demo projects (Pauwels Vastgoed, Bouwgroep Van Dijk, etc.). Verify completeness against project data.
- This is a data completeness check -- ensure every contact from `mockLocalProjects` demo data appears in `DEMO_COMPANIES` / `DEMO_PERSONS`.

---

### 6. Contact Visibility -- Hide Owning Companies

**Goal:** GDesign and 4TAKT must never appear in the Contacts main module. They are only visible in Settings.

**Changes:**
- **`src/pages/dashboard/ContactsDashboard.tsx`**: 
  - Filter `DEMO_COMPANIES` to exclude entries with ids `'gdesign'` and `'4takt'` (or names matching owning companies).
  - Filter `DEMO_PERSONS` to exclude employees of GDesign and 4TAKT.
  - Add a filter constant: `const INTERNAL_COMPANY_IDS = ['gdesign', '4takt'];`
  - Apply filter in `useEffect` when loading companies: `setCompanies(DEMO_COMPANIES.filter(c => !INTERNAL_COMPANY_IDS.includes(c.id)));`
  - Apply filter to persons: render `DEMO_PERSONS.filter(p => !['GDesign Architecten', '4TAKT'].includes(p.company))`.

---

### 7. Settings -- Contact Types (Already Working)

**Goal:** Allow users to add more contact types and subtypes in Settings > Contacts.

**Status:** The `ContactTaxonomyTable` component already supports:
- Adding new hoofdtypes and subtypes via the "Type toevoegen" button
- Creating new hoofdtypes via the "+ Nieuw type aanmaken" toggle
- Editing unlocked entries via double-click
- Deleting unlocked entries

No changes needed -- this functionality is already implemented.

---

### 8. Home Dashboard Redesign -- Bento Grid Layout

**Goal:** Redesign both `ClientDashboard` and `PilotDashboard` with a Bento grid layout inspired by Framer's minimal style.

**Changes for both `src/pages/dashboard/ClientDashboard.tsx` and `src/pages/pilot/PilotDashboard.tsx`:**

Replace the current linear card stack with a CSS grid Bento layout:

```text
+-------------------+-------------------+
|                   |                   |
|   Welcome +       |   Stats (3 mini   |
|   Summary         |   cards)          |
|                   |                   |
+-------------------+-------------------+
|         |                   |         |
| Pending |   Quick Actions   | Partner |
| Actions |   / Setup         | 40%     |
|         |                   |         |
+---------+-------------------+---------+
|                                       |
|         Recent Projects               |
|                                       |
+---------------------------------------+
```

- Use `grid grid-cols-4 gap-4` with `col-span-*` and `row-span-*` for the Bento effect.
- Each tile: `rounded-2xl border border-border/50 p-5` with subtle hover states.
- Stats tiles: individual small cards (team, projects, NOx reports) in a vertical stack or mini-grid.
- Welcome tile: spans 2 columns, minimal greeting + date.
- Pending Actions: tall card spanning 2 rows if actions exist.
- Quick Actions: centered grid tile.
- Partnership Program: accent card with the 40% highlight.
- Recent Projects: full-width bottom row.
- Remove `max-w-5xl` constraint -- Bento grids work better with more width (`max-w-6xl`).
- Clean, minimal typography. No gradients on cards -- just subtle borders and bg-muted tones.

---

### Technical Summary

| # | Area | Files Changed |
|---|------|---------------|
| 1 | Remove VAT from partner form | `PilotRegister.tsx`, `PilotCreateAccount.tsx` |
| 2 | Firma dropdown (person) | Already correct -- no changes |
| 3 | Firma fixed (employee) | `UserFormDialogRedesigned.tsx` |
| 4 | Person detail modal | `ContactDetailModal.tsx` |
| 5 | Project contacts sync | `ContactsDashboard.tsx` (data verification) |
| 6 | Hide owning companies | `ContactsDashboard.tsx` |
| 7 | Settings contact types | Already working -- no changes |
| 8 | Bento dashboard | `ClientDashboard.tsx`, `PilotDashboard.tsx` |

