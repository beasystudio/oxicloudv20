/**
 * Pilot Session Store
 * Manages temporary session-based data for Pilot Mode
 * All data is isolated and automatically cleared on logout/session expiration
 */

// Session timeout in milliseconds (60 minutes)
const SESSION_TIMEOUT = 60 * 60 * 1000;

import { applyMockOutcome } from '@/components/dev/MockComplianceToggle';

// Storage keys
const PILOT_SESSION_KEY = 'pilot_session';
const PILOT_USER_KEY = 'pilot_user';
const PILOT_COMPANY_KEY = 'pilot_company';
const PILOT_CONTACTS_KEY = 'pilot_contacts';
const PILOT_PROJECTS_KEY = 'pilot_projects';
const PILOT_QUOTES_KEY = 'pilot_quotes';
const PILOT_REPORTS_KEY = 'pilot_reports';
const PILOT_EMPLOYEES_KEY = 'pilot_employees';
const PILOT_ONBOARDING_KEY = 'pilot_onboarding';
const PILOT_COMPANY_LOGO_KEY = 'pilot_company_logo';

// Session interface
export interface PilotSession {
  id: string;
  createdAt: string;
  lastActivityAt: string;
  authToken: string;
}

// Pilot User interface
export interface PilotUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: 'pilot_owner';
  createdAt: string;
}

// Pilot Company interface
export interface PilotCompany {
  id: string;
  name: string;
  vatNumber: string;
  legalAddress: string;
  postalCode: string;
  city: string;
  country: string;
  peppolId: string;
  legalForm?: string;
  createdAt: string;
}

// Pilot Contact interface
export interface PilotContact {
  id: string;
  type: 'company' | 'person';
  companyId?: string;
  companyName?: string;
  vatNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  function?: string;
  contactType?: string; // e.g., 'opdrachtgever', 'bouwheer'
  street?: string;
  number?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  peppolId?: string;
  legalForm?: string;
  createdAt: string;
}

// Pilot Project interface
export interface PilotNoxVersionEntry {
  version: string; // 'v0', 'v1', 'v2', etc.
  createdAt: string;
  createdBy: string;
  status: import('@/types/oxicloud').OxiCloudProjectStatus;
  preEstimation?: import('@/types/oxicloud').PreEstimationData;
  priceData?: import('@/types/oxicloud').PriceData;
  paymentData?: import('@/types/oxicloud').PaymentData;
  detailedCalculation?: import('@/types/oxicloud').DetailedCalculationData;
  calculationResults?: import('@/types/oxicloud').CalculationResults;
  commissionAmount?: number;
}

export interface PilotProject {
  id: string;
  name: string;
  projectNumber: string;
  projectLeaderId: string;
  clientCompanyId?: string;
  bouwheerContactId?: string;
  teamMemberIds: string[];
  siteAddress?: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
  };
  projectType?: string;
  projectGoal?: string;
  constructionType?: string;
  status: 'draft' | 'active' | 'quoted' | 'paid' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'simulated';
  createdAt: string;
  poNummer?: string; // Purchase order number (optional)
  // NOx assessment data (mirrors NoxProjectData from production)
  noxStatus?: import('@/types/oxicloud').OxiCloudProjectStatus;
  preEstimation?: import('@/types/oxicloud').PreEstimationData;
  priceData?: import('@/types/oxicloud').PriceData;
  paymentData?: import('@/types/oxicloud').PaymentData;
  detailedCalculation?: import('@/types/oxicloud').DetailedCalculationData;
  calculationResults?: import('@/types/oxicloud').CalculationResults;
  commissionAmount?: number;
  reportJobQueued?: boolean;
  noxSubStatus?: import('@/types/oxicloud').NoxSubStatus;
  // Versioning
  currentVersion?: string; // 'v0', 'v1', etc.
  versionHistory?: PilotNoxVersionEntry[];
}

// Pilot Quote interface
export interface PilotQuote {
  id: string;
  projectId: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'paid';
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
}

// Pilot Report interface
export interface PilotReport {
  id: string;
  projectId: string;
  quoteId: string;
  type: 'nox_screening' | 'detailed_nox' | 'passende_beoordeling';
  status: 'pending' | 'processing' | 'completed';
  result?: 'pass' | 'exceedance';
  pdfUrl?: string;
  createdAt: string;
  completedAt?: string;
}

// Pilot Employee interface
export interface PilotEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  function?: string; // Free-text job title (e.g. "Zaakvoerder")
  contactSubtype?: string; // Taxonomy subtype (e.g. "Architect") from Settings > Contacts
  employeeType: 'employee' | 'freelancer';
  companyId: string;
  createdAt: string;
}

// Onboarding state
export interface PilotOnboarding {
  flow1Complete: boolean;
  flow2Complete: boolean;
  flow3Complete: boolean;
  currentFlow: 1 | 2 | 3 | null;
  currentStep: number;
}

// Generate unique ID
const generateId = (): string => {
  return 'pilot_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now().toString(36);
};

// Generate auth token
const generateAuthToken = (): string => {
  return 'PAT_' + Math.random().toString(36).substr(2, 16).toUpperCase();
};

// Session management
export const createPilotSession = (): PilotSession => {
  const session: PilotSession = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    authToken: generateAuthToken(),
  };
  sessionStorage.setItem(PILOT_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getPilotSession = (): PilotSession | null => {
  const stored = sessionStorage.getItem(PILOT_SESSION_KEY);
  if (!stored) return null;
  
  const session: PilotSession = JSON.parse(stored);
  
  // Check session expiration
  const lastActivity = new Date(session.lastActivityAt).getTime();
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    clearAllPilotData();
    return null;
  }
  
  return session;
};

export const updateSessionActivity = (): void => {
  const session = getPilotSession();
  if (session) {
    session.lastActivityAt = new Date().toISOString();
    sessionStorage.setItem(PILOT_SESSION_KEY, JSON.stringify(session));
  }
};

export const isPilotMode = (): boolean => {
  return getPilotSession() !== null;
};

// User management
export const createPilotUser = (user: Omit<PilotUser, 'id' | 'role' | 'createdAt'>): PilotUser => {
  const pilotUser: PilotUser = {
    ...user,
    id: generateId(),
    role: 'pilot_owner',
    createdAt: new Date().toISOString(),
  };
  sessionStorage.setItem(PILOT_USER_KEY, JSON.stringify(pilotUser));
  updateSessionActivity();
  return pilotUser;
};

export const getPilotUser = (): PilotUser | null => {
  const stored = sessionStorage.getItem(PILOT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const updatePilotUser = (updates: Partial<PilotUser>): PilotUser | null => {
  const user = getPilotUser();
  if (!user) return null;
  
  const updated = { ...user, ...updates };
  sessionStorage.setItem(PILOT_USER_KEY, JSON.stringify(updated));
  updateSessionActivity();
  return updated;
};

// Company management
export const createPilotCompany = (company: Omit<PilotCompany, 'id' | 'createdAt'>): PilotCompany => {
  const pilotCompany: PilotCompany = {
    ...company,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  sessionStorage.setItem(PILOT_COMPANY_KEY, JSON.stringify(pilotCompany));
  updateSessionActivity();
  return pilotCompany;
};

export const getPilotCompany = (): PilotCompany | null => {
  const stored = sessionStorage.getItem(PILOT_COMPANY_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const updatePilotCompany = (updates: Partial<PilotCompany>): PilotCompany | null => {
  const company = getPilotCompany();
  if (!company) return null;
  
  const updated = { ...company, ...updates };
  sessionStorage.setItem(PILOT_COMPANY_KEY, JSON.stringify(updated));
  updateSessionActivity();
  return updated;
};

// Contacts management
export const getPilotContacts = (): PilotContact[] => {
  const stored = sessionStorage.getItem(PILOT_CONTACTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addPilotContact = (contact: Omit<PilotContact, 'id' | 'createdAt'>): PilotContact => {
  const contacts = getPilotContacts();
  const newContact: PilotContact = {
    ...contact,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  contacts.push(newContact);
  sessionStorage.setItem(PILOT_CONTACTS_KEY, JSON.stringify(contacts));
  updateSessionActivity();
  return newContact;
};

export const updatePilotContact = (id: string, updates: Partial<PilotContact>): PilotContact | null => {
  const contacts = getPilotContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  contacts[index] = { ...contacts[index], ...updates };
  sessionStorage.setItem(PILOT_CONTACTS_KEY, JSON.stringify(contacts));
  updateSessionActivity();
  return contacts[index];
};

export const findPilotContactByVat = (vatNumber: string): PilotContact | undefined => {
  return getPilotContacts().find(c => c.vatNumber === vatNumber);
};

// Projects management
export const getPilotProjects = (): PilotProject[] => {
  const stored = sessionStorage.getItem(PILOT_PROJECTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addPilotProject = (project: Omit<PilotProject, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): PilotProject => {
  const projects = getPilotProjects();
  const newProject: PilotProject = {
    ...project,
    id: generateId(),
    status: 'draft',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
  };
  projects.push(newProject);
  sessionStorage.setItem(PILOT_PROJECTS_KEY, JSON.stringify(projects));
  updateSessionActivity();
  return newProject;
};

export const updatePilotProject = (id: string, updates: Partial<PilotProject>): PilotProject | null => {
  const projects = getPilotProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  projects[index] = { ...projects[index], ...updates };
  sessionStorage.setItem(PILOT_PROJECTS_KEY, JSON.stringify(projects));
  updateSessionActivity();
  return projects[index];
};

export const getPilotProjectById = (id: string): PilotProject | undefined => {
  return getPilotProjects().find(p => p.id === id);
};

// Quotes management
export const getPilotQuotes = (): PilotQuote[] => {
  const stored = sessionStorage.getItem(PILOT_QUOTES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addPilotQuote = (quote: Omit<PilotQuote, 'id' | 'createdAt' | 'status'>): PilotQuote => {
  const quotes = getPilotQuotes();
  const newQuote: PilotQuote = {
    ...quote,
    id: generateId(),
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  quotes.push(newQuote);
  sessionStorage.setItem(PILOT_QUOTES_KEY, JSON.stringify(quotes));
  updateSessionActivity();
  return newQuote;
};

export const updatePilotQuote = (id: string, updates: Partial<PilotQuote>): PilotQuote | null => {
  const quotes = getPilotQuotes();
  const index = quotes.findIndex(q => q.id === id);
  if (index === -1) return null;
  
  quotes[index] = { ...quotes[index], ...updates };
  sessionStorage.setItem(PILOT_QUOTES_KEY, JSON.stringify(quotes));
  updateSessionActivity();
  return quotes[index];
};

// Reports management
export const getPilotReports = (): PilotReport[] => {
  const stored = sessionStorage.getItem(PILOT_REPORTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addPilotReport = (report: Omit<PilotReport, 'id' | 'createdAt' | 'status'>): PilotReport => {
  const reports = getPilotReports();
  const newReport: PilotReport = {
    ...report,
    id: generateId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  reports.push(newReport);
  sessionStorage.setItem(PILOT_REPORTS_KEY, JSON.stringify(reports));
  updateSessionActivity();
  return newReport;
};

export const updatePilotReport = (id: string, updates: Partial<PilotReport>): PilotReport | null => {
  const reports = getPilotReports();
  const index = reports.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  reports[index] = { ...reports[index], ...updates };
  sessionStorage.setItem(PILOT_REPORTS_KEY, JSON.stringify(reports));
  updateSessionActivity();
  return reports[index];
};

// Employees management
export const getPilotEmployees = (): PilotEmployee[] => {
  const stored = sessionStorage.getItem(PILOT_EMPLOYEES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addPilotEmployee = (employee: Omit<PilotEmployee, 'id' | 'createdAt'>): PilotEmployee => {
  const employees = getPilotEmployees();
  const newEmployee: PilotEmployee = {
    ...employee,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  employees.push(newEmployee);
  sessionStorage.setItem(PILOT_EMPLOYEES_KEY, JSON.stringify(employees));
  updateSessionActivity();
  return newEmployee;
};

export const updatePilotEmployee = (id: string, updates: Partial<PilotEmployee>): PilotEmployee | null => {
  const employees = getPilotEmployees();
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  employees[index] = { ...employees[index], ...updates };
  sessionStorage.setItem(PILOT_EMPLOYEES_KEY, JSON.stringify(employees));
  updateSessionActivity();
  return employees[index];
};

// Company logo management
export const getPilotCompanyLogo = (): string | null => {
  return sessionStorage.getItem(PILOT_COMPANY_LOGO_KEY);
};

export const setPilotCompanyLogo = (logoDataUrl: string | null): void => {
  if (logoDataUrl) {
    sessionStorage.setItem(PILOT_COMPANY_LOGO_KEY, logoDataUrl);
  } else {
    sessionStorage.removeItem(PILOT_COMPANY_LOGO_KEY);
  }
};

// Onboarding state management
export const getPilotOnboarding = (): PilotOnboarding => {
  const stored = sessionStorage.getItem(PILOT_ONBOARDING_KEY);
  return stored ? JSON.parse(stored) : {
    flow1Complete: false,
    flow2Complete: false,
    flow3Complete: false,
    currentFlow: null,
    currentStep: 0,
  };
};

export const updatePilotOnboarding = (updates: Partial<PilotOnboarding>): PilotOnboarding => {
  const current = getPilotOnboarding();
  const updated = { ...current, ...updates };
  sessionStorage.setItem(PILOT_ONBOARDING_KEY, JSON.stringify(updated));
  updateSessionActivity();
  return updated;
};

export const startOnboardingFlow = (flow: 1 | 2 | 3): void => {
  updatePilotOnboarding({ currentFlow: flow, currentStep: 0 });
};

export const completeOnboardingFlow = (flow: 1 | 2 | 3): void => {
  const updates: Partial<PilotOnboarding> = { currentFlow: null, currentStep: 0 };
  if (flow === 1) updates.flow1Complete = true;
  if (flow === 2) updates.flow2Complete = true;
  if (flow === 3) updates.flow3Complete = true;
  updatePilotOnboarding(updates);
};

// Simulate payment
export const simulatePilotPayment = (projectId: string, quoteId: string): boolean => {
  const project = updatePilotProject(projectId, { 
    paymentStatus: 'simulated',
    status: 'paid'
  });
  
  const quote = updatePilotQuote(quoteId, {
    status: 'paid',
    paidAt: new Date().toISOString()
  });
  
  return project !== null && quote !== null;
};

// --- Pilot NOx Flow Helpers (mirror noxProjectStore for pilot session) ---

export const initializePilotNox = (projectId: string): PilotProject | null => {
  return updatePilotProject(projectId, {
    noxStatus: 'input_incomplete',
    reportJobQueued: false,
    currentVersion: 'v0',
    versionHistory: [],
  });
};

export const savePilotPreEstimation = (projectId: string, data: import('@/types/oxicloud').PreEstimationData): PilotProject | null => {
  // Validate completeness inline (mirrors isPreEstimationComplete from oxicloud types)
  const entries = data.projectTypeEntries;
  const entriesValid = entries && entries.length > 0 && entries.every(
    (e: any) => !!e.projectTypeValue && !!e.constructionType && e.gfa > 0 && e.height > 0
  );
  const sloopValid = !data.hasSloop || (data.sloopEntry && data.sloopEntry.demolitionVolume > 0 && data.sloopEntry.description && data.sloopEntry.description.length > 0);
  const mapValid = !!data.mapData;
  const opdrachtValid = !!data.whatDemolish && data.whatDemolish.trim().length > 0;
  const isComplete = entriesValid && sloopValid && mapValid && opdrachtValid;

  const newStatus = (isComplete ? 'input_completed' : 'input_incomplete') as import('@/types/oxicloud').OxiCloudProjectStatus;

  // Status progression guard - never downgrade status (mirrors noxProjectStore logic)
  const STATUS_ORDER: import('@/types/oxicloud').OxiCloudProjectStatus[] = [
    'input_incomplete', 'input_completed', 'price_generated',
    'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'
  ];
  const current = getPilotProjectById(projectId);
  const currentIndex = current?.noxStatus ? STATUS_ORDER.indexOf(current.noxStatus) : -1;
  const newIndex = STATUS_ORDER.indexOf(newStatus);
  const shouldUpdateStatus = currentIndex <= newIndex;

  return updatePilotProject(projectId, {
    preEstimation: data,
    ...(shouldUpdateStatus ? { noxStatus: newStatus } : {}),
  });
};

export const generatePilotNoxPrice = (projectId: string): PilotProject | null => {
  const basePrice = Math.floor(Math.random() * 2000) + 1500;
  const vat = basePrice * 0.21;
  const totalPrice = basePrice + vat;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);

  return updatePilotProject(projectId, {
    priceData: { basePrice, vat, totalPrice, validUntil: validUntil.toISOString() },
    commissionAmount: totalPrice * 0.3,
    noxStatus: 'price_generated',
    status: 'quoted',
  });
};

export const processPilotNoxPayment = (projectId: string, vatNumber?: string): PilotProject | null => {
  const paymentData: import('@/types/oxicloud').PaymentData = {
    paymentId: `PAY-${Date.now()}`,
    paymentDate: new Date().toISOString(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    vatNumber,
    billingDetails: { companyName: 'Pilot Company', address: 'Demo Address', email: 'demo@pilot.com' },
  };
  return updatePilotProject(projectId, {
    paymentData,
    noxStatus: 'paid',
    status: 'paid',
    paymentStatus: 'paid',
    reportJobQueued: true,
  });
};

export const savePilotDetailedCalculation = (projectId: string, data: import('@/types/oxicloud').DetailedCalculationData): PilotProject | null => {
  const existingProject = getPilotProjectById(projectId);
  const totalPavedArea = data.asphaltArea + data.concreteArea + data.naturalStoneArea + data.looseMaterialsArea + data.permeableGreenArea;
  const baseStationary = 0.15 + (data.shellWindtightMonths * 0.08);
  const baseHeavyConstruction = 0.12 + (data.groundworkVolume * 0.00008);
  const baseLightConstruction = 0.05 + (totalPavedArea * 0.00015);
  const baseOperation = 0.03 + (data.parkingSpaces * 0.003);
  const overallMaxPercent = Math.max(baseStationary, baseHeavyConstruction, baseLightConstruction, baseOperation);

  let dominantPhase: 'puntbronnen' | 'lijnbronnen_construction' | 'lijnbronnen_operation' = 'puntbronnen';
  if (overallMaxPercent === baseHeavyConstruction || overallMaxPercent === baseLightConstruction) dominantPhase = 'lijnbronnen_construction';
  else if (overallMaxPercent === baseOperation) dominantPhase = 'lijnbronnen_operation';

  const calculationResults: import('@/types/oxicloud').CalculationResults = {
    calculatedAt: new Date().toISOString(),
    max_nox_stationary: 938,
    project_nox_stationary: 14.1 + (data.shellWindtightMonths * 0.75),
    percent_stationary: baseStationary,
    max_light_construction: 2538000,
    project_light_construction: 1270 + (totalPavedArea * 0.38),
    percent_light_construction: baseLightConstruction,
    max_heavy_construction: 345000,
    project_heavy_construction: 414 + (data.groundworkVolume * 0.028),
    percent_heavy_construction: baseHeavyConstruction,
    total_movements_construction: 1684 + (totalPavedArea * 0.38) + (data.groundworkVolume * 0.028),
    max_light_operation: 2538000,
    project_light_operation: 762 + (data.parkingSpaces * 76),
    percent_light_operation: baseOperation,
    max_heavy_operation: 345000,
    project_heavy_operation: 12,
    percent_heavy_operation: 0.003,
    total_movements_operation: 774 + (data.parkingSpaces * 76),
    overall_max_percent: overallMaxPercent,
    dominant_phase: dominantPhase,
    // MOCKUP RULE (testability): shellWindtightMonths < 12 → PASS, else FAIL. Override via floating Mock toggle.
    compliance_status: applyMockOutcome(data.shellWindtightMonths < 12 ? 'compliant' : 'exceeds_threshold'),
  };

  const noxStatus = calculationResults.compliance_status === 'compliant' ? 'report_delivered' : 'report_in_progress';
  return updatePilotProject(projectId, {
    detailedCalculation: data,
    calculationResults,
    noxStatus: noxStatus as import('@/types/oxicloud').OxiCloudProjectStatus,
    status: 'completed',
    currentVersion: existingProject?.currentVersion || 'v0',
  });
};

/**
 * Clone the current NOx version to create a new one (v1, v2, etc.)
 * Archives current version in history, resets calculation/payment data, keeps pre-estimation & werflocatie.
 */
export const clonePilotNoxVersion = (projectId: string, createdByName: string): PilotProject | null => {
  const project = getPilotProjectById(projectId);
  if (!project) return null;

  const currentVersion = project.currentVersion || 'v0';
  
  // Archive current version
  const archivedEntry: PilotNoxVersionEntry = {
    version: currentVersion,
    createdAt: project.createdAt,
    createdBy: createdByName,
    status: project.noxStatus || 'input_incomplete',
    preEstimation: project.preEstimation,
    priceData: project.priceData,
    paymentData: project.paymentData,
    detailedCalculation: project.detailedCalculation,
    calculationResults: project.calculationResults,
    commissionAmount: project.commissionAmount,
  };

  const history = [...(project.versionHistory || []), archivedEntry];
  const nextVersion = `v${history.length}`;

  // Reset payment/calc data but keep pre-estimation + werflocatie
  return updatePilotProject(projectId, {
    noxStatus: 'input_completed', // Pre-estimation is preserved
    noxSubStatus: undefined,
    priceData: undefined,
    paymentData: undefined,
    detailedCalculation: undefined,
    calculationResults: undefined,
    commissionAmount: undefined,
    reportJobQueued: false,
    currentVersion: nextVersion,
    versionHistory: history,
    status: 'active',
    paymentStatus: 'pending',
  });
};

export const pilotProjectToOxiCloud = (project: PilotProject): import('@/types/oxicloud').OxiCloudProject => ({
  id: project.id,
  userId: project.projectLeaderId,
  name: project.name,
  status: project.noxStatus || 'input_incomplete',
  preEstimation: project.preEstimation,
  priceData: project.priceData,
  paymentData: project.paymentData,
  detailedCalculation: project.detailedCalculation,
  calculationResults: project.calculationResults,
  reportJobQueued: project.reportJobQueued || false,
  createdAt: project.createdAt,
  updatedAt: project.createdAt,
});

// Clear all pilot data
export const clearAllPilotData = (): void => {
  sessionStorage.removeItem(PILOT_SESSION_KEY);
  sessionStorage.removeItem(PILOT_USER_KEY);
  sessionStorage.removeItem(PILOT_COMPANY_KEY);
  sessionStorage.removeItem(PILOT_PROJECTS_KEY);
  sessionStorage.removeItem(PILOT_CONTACTS_KEY);
  sessionStorage.removeItem(PILOT_QUOTES_KEY);
  sessionStorage.removeItem(PILOT_REPORTS_KEY);
  sessionStorage.removeItem(PILOT_EMPLOYEES_KEY);
  sessionStorage.removeItem(PILOT_ONBOARDING_KEY);
  sessionStorage.removeItem(PILOT_COMPANY_LOGO_KEY);
  // Also clear onboarding checklist localStorage
  localStorage.removeItem('oxicloud_onboarding_v2');
  localStorage.removeItem('oxicloud_onboarding_completed');
  localStorage.removeItem('oxicloud_onboarding_checklist');
  localStorage.removeItem('oxicloud_onboarding_step');
};
// Reset pilot demo (clears everything and starts fresh)
export const resetPilotDemo = (): void => {
  clearAllPilotData();
};

// Get pilot stats for dashboard
export const getPilotStats = () => {
  const projects = getPilotProjects();
  const quotes = getPilotQuotes();
  const employees = getPilotEmployees();
  // Deduplicate by email to avoid counting the owner twice
  const uniqueEmails = new Set(employees.map(e => e.email.toLowerCase()));
  const uniqueCount = uniqueEmails.size;
  
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    pendingQuotes: quotes.filter(q => q.status === 'sent').length,
    paidQuotes: quotes.filter(q => q.status === 'paid').length,
    totalRevenue: quotes.filter(q => q.status === 'paid').reduce((sum, q) => sum + q.totalAmount, 0),
    teamSize: uniqueCount || 1, // At least 1 (the owner)
  };
};
