// Mock toggle removed per design refresh. Exports kept as inert no-ops to
// preserve import compatibility across the codebase.

export type MockOutcome = 'auto' | 'pass' | 'fail';

export const MOCK_COMPLIANCE_EVENT = 'mock-compliance-outcome-change';

export function getMockComplianceOutcome(): MockOutcome {
  return 'auto';
}

export function applyMockOutcome(
  defaultStatus: 'compliant' | 'exceeds_threshold'
): 'compliant' | 'exceeds_threshold' {
  return defaultStatus;
}

export function MockComplianceToggle() {
  return null;
}
