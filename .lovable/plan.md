## Non-Compliant NOx Flow Updates

### Current State
When results are non-compliant, the exceedance screen shows options (Sandbox, Split Phase, Passende Beoordeling). After any of these, the flow goes directly to a detailed report screen.

### Changes

#### 1. Sandbox & Split Phase → Compliant Report + Payment Wall
- After Sandbox or Split Phase achieves compliance, show a **"Report Ready - Held"** screen
- The report values are **blurred** (same as current payment wall behavior)
- Message: "Your NOx report is compliant. Once your client pays the original quote, the report will be released for download."
- **Simulate payment received** button (dev simulation) to unblur and enable download
- This reuses the existing report-held/released pattern from the compliant flow

#### 2. Passende Beoordeling → New Quote Flow
- When user selects Passende Beoordeling, a **new quote** is generated (overrides old quote)
- The new quote is auto-sent to the client email (same pattern as original quote)
- Show "Quote sent to [email] - awaiting signature" screen
- **Simulate client signed** → client signs the new PB quote
- **Simulate payment received** → client pays
- After payment, A-Spine team works on the PB report (status: "In Progress")
- Team delivers report to portal → architect can download
- Status flow: `PB Quote Sent → Awaiting Signature → Client Signed → In Progress → Report Ready - Held → Released`

#### 3. Status & UI Updates
- Update exceedance screen to clearly show all 3 options with descriptions
- Passende Beoordeling option notes that a new quote will be required
- i18n labels for all new screens (EN + NL)

### What stays the same
- Sandbox UI and calculation logic
- Split Phase flow logic
- Pre-estimation and original quote flow
- Dashboard layout and design system
