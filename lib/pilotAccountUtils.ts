/**
 * Pilot Account Utilities
 * Handles the clean-slate experience for demo@oxicloud.be
 * 
 * IMPORTANT: Pilot account is COMPLETELY SEPARATE from GDesign/4TAKT demo data.
 * - Pilot = fresh first-time user with empty data everywhere
 * - GDesign/4TAKT = established users with demo data for showcasing features
 */

// Pilot account identifier
export const PILOT_EMAIL = 'demo@oxicloud.be';
export const PILOT_COMPANY_ID = 'pilot-demo';
export const PILOT_COMPANY_NAME = 'My Architecture Firm';
export const DEMO_ENVIRONMENT_EMAILS = ['jan@gdesign.be'] as const;

// Check if current user is pilot account
export const isPilotAccount = (email?: string): boolean => {
  return email?.toLowerCase() === PILOT_EMAIL;
};

export const isDemoEnvironmentUser = (email?: string): boolean => {
  return email ? DEMO_ENVIRONMENT_EMAILS.includes(email.toLowerCase() as typeof DEMO_ENVIRONMENT_EMAILS[number]) : false;
};

// Check if company is pilot company
export const isPilotCompany = (companyId?: string | null): boolean => {
  return companyId === PILOT_COMPANY_ID;
};

// Get empty company data for pilot account
export const getEmptyCompanyData = () => ({
  id: PILOT_COMPANY_ID,
  name: PILOT_COMPANY_NAME,
  logoUrl: undefined,
  address: '',
  vatNumber: '',
  plan: 'Professional' as const,
  createdAt: new Date().toISOString().split('T')[0],
});

export const getEmptyDashboardData = () => ({
  projectsSubmitted: 0,
  estimatedSettlement: 0,
  pendingReports: 0,
  completedReports: 0,
  typicalSettlementRange: { min: 280, max: 450 },
  commissionRate: 40,
});

export const getEmptyStats = () => ({
  totalEmployees: 0,
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalBudget: 0,
});

// Clear all onboarding-related localStorage for pilot
export const resetPilotOnboarding = () => {
  localStorage.removeItem('oxicloud_onboarding_completed');
  localStorage.removeItem('oxicloud_onboarding_checklist');
  localStorage.removeItem('oxicloud_onboarding_step');
};

// Onboarding step definitions for the multi-module flow
export type OnboardingModule = 'home' | 'settings-company' | 'settings-users' | 'settings-contacts' | 'projects';

export interface ModuleOnboardingStep {
  id: string;
  module: OnboardingModule;
  title: string;
  description: string;
  targetSelector: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  requireInteraction?: boolean;
  navigateTo?: string;
}

export const ONBOARDING_STEPS: ModuleOnboardingStep[] = [
  // HOME MODULE STEPS
  {
    id: 'home-welcome',
    module: 'home',
    title: 'Your Partner Account Is Active',
    description: 'You can now submit project data for compliance review and become eligible for partner settlement on every approved report.',
    targetSelector: '[data-onboarding="settlement-card"]',
    placement: 'bottom',
  },
  {
    id: 'home-settlement',
    module: 'home',
    title: 'Partner Settlement Preview',
    description: 'For a typical residential project, you\'ll earn €280-€450 per approved report. This is your 40% commission on report fees.',
    targetSelector: '[data-onboarding="settlement-preview"]',
    placement: 'right',
  },
  {
    id: 'home-kpi',
    module: 'home',
    title: 'Your Business KPIs',
    description: 'Track your projects submitted and estimated settlement this quarter. These are your professional performance metrics.',
    targetSelector: '[data-onboarding="kpi-section"]',
    placement: 'bottom',
  },
  {
    id: 'home-to-settings',
    module: 'home',
    title: 'Let\'s Set Up Your Company',
    description: 'Before creating projects, you need to configure your company details, team members, and contact types.',
    targetSelector: '[data-onboarding="settings-link"]',
    placement: 'right',
    requireInteraction: true,
    navigateTo: '/dashboard/settings',
  },
  
  // SETTINGS - COMPANY TAB
  {
    id: 'settings-company-intro',
    module: 'settings-company',
    title: 'Company Information',
    description: 'Add your company details here. You can manage up to 2 companies. Fill in all required fields marked with *.',
    targetSelector: '[data-onboarding="company-form"]',
    placement: 'right',
  },
  {
    id: 'settings-company-vat',
    module: 'settings-company',
    title: 'VAT & Billing Info',
    description: 'Your VAT number and billing address are essential for generating invoices and processing your partner settlement.',
    targetSelector: '[data-onboarding="company-billing"]',
    placement: 'bottom',
  },
  {
    id: 'settings-to-users',
    module: 'settings-company',
    title: 'Next: Add Team Members',
    description: 'Now let\'s add your colleagues and assign them the appropriate license type.',
    targetSelector: '[data-onboarding="users-tab"]',
    placement: 'bottom',
    requireInteraction: true,
  },

  // SETTINGS - USERS TAB
  {
    id: 'settings-users-intro',
    module: 'settings-users',
    title: 'Team Management',
    description: 'Add your company employees here. Assign each user a license type: Power User (admin access) or Standard User.',
    targetSelector: '[data-onboarding="users-list"]',
    placement: 'right',
  },
  {
    id: 'settings-users-add',
    module: 'settings-users',
    title: 'Add Your First Colleague',
    description: 'Click here to invite a team member. They\'ll receive access to manage projects.',
    targetSelector: '[data-onboarding="add-user-btn"]',
    placement: 'left',
  },
  {
    id: 'settings-to-contacts',
    module: 'settings-users',
    title: 'Next: Contact Types',
    description: 'Set up your contact taxonomy to organize clients, contractors, and consultants.',
    targetSelector: '[data-onboarding="contacts-tab"]',
    placement: 'bottom',
    requireInteraction: true,
  },

  // SETTINGS - CONTACTS TAB
  {
    id: 'settings-contacts-intro',
    module: 'settings-contacts',
    title: 'Contact Type Taxonomy',
    description: 'Define categories for your contacts: clients, contractors, consultants, etc. This helps organize your project dossiers.',
    targetSelector: '[data-onboarding="contact-types"]',
    placement: 'right',
  },
  {
    id: 'settings-contacts-done',
    module: 'settings-contacts',
    title: 'Settings Complete!',
    description: 'Great job! Your settings are configured. Now let\'s create your first project.',
    targetSelector: '[data-onboarding="create-project-nav"]',
    placement: 'bottom',
    requireInteraction: true,
    navigateTo: '/dashboard/projects',
  },

  // PROJECTS MODULE
  {
    id: 'projects-intro',
    module: 'projects',
    title: 'Project Dossiers',
    description: 'This is where you manage all your project submissions. Each project can earn you partner settlement.',
    targetSelector: '[data-onboarding="projects-list"]',
    placement: 'bottom',
  },
  {
    id: 'projects-create',
    module: 'projects',
    title: 'Create Your First Project',
    description: 'Click here to start your first project dossier. Fill in the project details to begin.',
    targetSelector: '[data-onboarding="create-project-btn"]',
    placement: 'left',
    requireInteraction: true,
  },
  {
    id: 'projects-contacts-info',
    module: 'projects',
    title: 'Project Contacts',
    description: 'After creating a project, add contacts: your Team (colleagues), Client (end customer who pays), and Others (contractors, consultants).',
    targetSelector: '[data-onboarding="project-contacts"]',
    placement: 'right',
  },
  {
    id: 'projects-estimation',
    module: 'projects',
    title: 'Pre-Estimation Form',
    description: 'Complete the pre-estimation form to receive a quote. Once your client pays, you earn your 40% commission!',
    targetSelector: '[data-onboarding="pre-estimation"]',
    placement: 'top',
  },
];

// Get steps for a specific module
export const getStepsForModule = (module: OnboardingModule): ModuleOnboardingStep[] => {
  return ONBOARDING_STEPS.filter(step => step.module === module);
};

// Get current onboarding progress
export const getOnboardingProgress = (): { currentModule: OnboardingModule; stepIndex: number } => {
  const stored = localStorage.getItem('oxicloud_onboarding_step');
  if (stored) {
    return JSON.parse(stored);
  }
  return { currentModule: 'home', stepIndex: 0 };
};

// Save onboarding progress
export const saveOnboardingProgress = (module: OnboardingModule, stepIndex: number) => {
  localStorage.setItem('oxicloud_onboarding_step', JSON.stringify({ currentModule: module, stepIndex }));
};

// Check if onboarding is complete
export const isOnboardingComplete = (): boolean => {
  return localStorage.getItem('oxicloud_onboarding_completed') === 'true';
};

// Mark onboarding as complete
export const completeOnboarding = () => {
  localStorage.setItem('oxicloud_onboarding_completed', 'true');
};
