

## Plan: Relabel Demo Environment + Production Workspace

### What the user wants

The existing **Jan/Maria/Lisa mock accounts** (which currently show the full ClientDashboard with TopNavigation) should be labeled as the **"Demo Environment"**. All existing functionality stays identical -- only add a "Demo Environment" badge/banner and the two conversion elements (Partner Program card, Workspace CTA) to the ClientDashboard.

The existing **Pilot Demo Mode** (PilotDashboard, PilotNavigation, etc.) should be relabeled as **"Production Workspace"**. No functionality changes, only rename references.

### Changes Required

#### 1. ClientDashboard -- Add Demo Environment elements
**File:** `src/pages/dashboard/ClientDashboard.tsx`

- Add a persistent **"Demo Environment"** banner at the top of the dashboard (similar to the one in DemoDashboard) with the message: "You are currently exploring the OxiCloud Demo Environment" and two CTAs: "Create my Workspace" and "Invite my manager"
- Add a **Partner Program card** (prominent, explaining commission mechanics) below the banner
- Add a **Workspace Prompt card** (permanently pinned, never disappears) with "Create my Workspace" and "Invite my manager" buttons
- Import and wire up the existing `InviteManagerDialog` component
- "Create my Workspace" navigates to `/register/workspace` (existing route)

#### 2. TopNavigation -- Add Demo badge
**File:** `src/components/TopNavigation.tsx`

- Add a small "Demo Environment" badge next to the logo/nav when the user is a mock auth user (Jan/Maria/Lisa/etc.)

#### 3. Rename Pilot Demo Mode to Production Workspace
**Files:** Multiple pilot files -- label/text changes only

- `PilotNavigation.tsx` -- Change any "Pilot" or "Demo" labels to "Workspace"
- `PilotDashboard.tsx` -- Update heading text references
- `PilotLanding.tsx` -- Update copy
- Translation files (`en.ts`, `nl.ts`) -- Update `pilot.*` translation keys where they say "Pilot Demo" to "Production Workspace"

#### 4. DemoDashboard stays as-is
The `/dashboard/demo` route (for real Supabase auth users without a workspace) remains unchanged. It already has the correct elements.

### Summary
- ~4 files modified significantly (ClientDashboard, TopNavigation, PilotNavigation, PilotDashboard)
- ~2 translation files updated for relabeling
- No routing changes, no functionality changes
- Existing demo mock accounts (Jan/Maria/Lisa) see "Demo Environment" branding + conversion cards on their dashboard

