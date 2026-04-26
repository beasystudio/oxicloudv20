import { OxiCloudProject, OxiCloudProjectStatus, PreEstimationData, PriceData, PaymentData, DetailedCalculationData, AssessmentRequest, AssessmentRequestStatus } from '@/types/oxicloud';
import { applyMockOutcome } from '@/components/dev/MockComplianceToggle';

const STORAGE_KEY = 'oxicloud_projects';
const ASSESSMENT_STORAGE_KEY = 'oxicloud_assessment_requests';

export function getOxiCloudProjects(): OxiCloudProject[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getOxiCloudProjectsByUser(userId: string): OxiCloudProject[] {
  return getOxiCloudProjects().filter(p => p.userId === userId);
}

export function getOxiCloudProjectById(id: string): OxiCloudProject | undefined {
  return getOxiCloudProjects().find(p => p.id === id);
}

export function createOxiCloudProject(userId: string, name?: string): OxiCloudProject {
  const projects = getOxiCloudProjects();
  const newProject: OxiCloudProject = {
    id: crypto.randomUUID(),
    userId,
    name: name || `Project ${projects.filter(p => p.userId === userId).length + 1}`,
    status: 'input_completed',
    reportJobQueued: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return newProject;
}

export function updateOxiCloudProject(id: string, updates: Partial<OxiCloudProject>): OxiCloudProject | null {
  const projects = getOxiCloudProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}

export function savePreEstimation(projectId: string, data: PreEstimationData): OxiCloudProject | null {
  return updateOxiCloudProject(projectId, {
    preEstimation: data,
    status: 'input_completed',
  });
}

export function generatePrice(projectId: string): OxiCloudProject | null {
  // Mock price engine
  const basePrice = Math.floor(Math.random() * 2000) + 1500; // €1500-3500
  const vat = basePrice * 0.21;
  const totalPrice = basePrice + vat;
  
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14); // 14 days validity
  
  const priceData: PriceData = {
    basePrice,
    vat,
    totalPrice,
    validUntil: validUntil.toISOString(),
  };
  
  return updateOxiCloudProject(projectId, {
    priceData,
    status: 'price_generated',
  });
}

export function setAwaitingPayment(projectId: string): OxiCloudProject | null {
  return updateOxiCloudProject(projectId, {
    status: 'awaiting_payment',
  });
}

export function processPayment(projectId: string, vatNumber?: string): OxiCloudProject | null {
  const project = getOxiCloudProjectById(projectId);
  if (!project) return null;
  
  const paymentData: PaymentData = {
    paymentId: `PAY-${Date.now()}`,
    paymentDate: new Date().toISOString(),
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    vatNumber,
    billingDetails: {
      companyName: 'Company Name',
      address: '123 Business Street',
      email: 'billing@company.com',
    },
  };
  
  return updateOxiCloudProject(projectId, {
    paymentData,
    status: 'paid',
    reportJobQueued: true,
  });
}

export function saveDetailedCalculation(projectId: string, data: DetailedCalculationData): OxiCloudProject | null {
  // Calculate total paved area
  const totalPavedArea = data.asphaltArea + data.concreteArea + data.naturalStoneArea + 
    data.looseMaterialsArea + data.permeableGreenArea;
  
  // Realistic calculation - smaller projects can be compliant (pass below 1 = 100%)
  // These represent fractions of the 1% de minimis threshold
  const percentStationary = 0.15 + (data.shellWindtightMonths * 0.08);
  const percentHeavyConstruction = 0.12 + (data.groundworkVolume * 0.00008);
  const percentLightConstruction = 0.05 + (totalPavedArea * 0.00015);
  const percentOperation = 0.03 + (data.parkingSpaces * 0.003);
  
  // Find the maximum percentage across all phases
  const overallMaxPercent = Math.max(percentStationary, percentHeavyConstruction, percentLightConstruction, percentOperation);
  
  // Determine dominant phase
  let dominantPhase: 'puntbronnen' | 'lijnbronnen_construction' | 'lijnbronnen_operation' = 'puntbronnen';
  if (overallMaxPercent === percentHeavyConstruction || overallMaxPercent === percentLightConstruction) {
    dominantPhase = 'lijnbronnen_construction';
  } else if (overallMaxPercent === percentOperation) {
    dominantPhase = 'lijnbronnen_operation';
  }
  
  const calculationResults = {
    calculatedAt: new Date().toISOString(),
    
    // Puntbronnen (Stationary Sources) - VITO 1
    max_nox_stationary: 938,
    project_nox_stationary: 14.1 + (data.shellWindtightMonths * 0.75),
    percent_stationary: percentStationary,
    
    // Lijnbronnen - Construction Phase
    max_light_construction: 2538000,
    project_light_construction: 1270 + (totalPavedArea * 0.38),
    percent_light_construction: percentLightConstruction,
    max_heavy_construction: 345000,
    project_heavy_construction: 414 + (data.groundworkVolume * 0.028),
    percent_heavy_construction: percentHeavyConstruction,
    total_movements_construction: 1684 + (totalPavedArea * 0.38) + (data.groundworkVolume * 0.028),
    
    // Lijnbronnen - Operation Phase
    max_light_operation: 2538000,
    project_light_operation: 762 + (data.parkingSpaces * 76),
    percent_light_operation: percentOperation,
    max_heavy_operation: 345000,
    project_heavy_operation: 12,
    percent_heavy_operation: 0.003,
    total_movements_operation: 774 + (data.parkingSpaces * 76),
    
    // Global Result - compliance if overall max < 1 (100% of threshold)
    overall_max_percent: overallMaxPercent,
    dominant_phase: dominantPhase,
    // MOCKUP RULE (testability): shellWindtightMonths < 12 → PASS, else FAIL → full remediation flow.
    compliance_status: applyMockOutcome(data.shellWindtightMonths < 12 ? 'compliant' : 'exceeds_threshold'),
  };
  
  // Auto-set status to report_delivered if compliant
  const status = calculationResults.compliance_status === 'compliant' 
    ? 'report_delivered' 
    : 'report_in_progress';
  
  return updateOxiCloudProject(projectId, {
    detailedCalculation: data,
    calculationResults,
    status,
  });
}

export function getProjectStats(userId: string) {
  const projects = getOxiCloudProjectsByUser(userId);
  
  return {
    activeProjects: projects.filter(p => 
      ['input_completed', 'price_generated', 'paid', 'report_in_progress'].includes(p.status)
    ).length,
    awaitingPayment: projects.filter(p => p.status === 'awaiting_payment').length,
    reportsInProgress: projects.filter(p => p.status === 'report_in_progress').length,
    reportsDelivered: projects.filter(p => p.status === 'report_delivered').length,
    totalSpendThisMonth: projects
      .filter(p => p.paymentData && new Date(p.paymentData.paymentDate).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + (p.priceData?.totalPrice || 0), 0),
  };
}

export function deleteOxiCloudProject(id: string): boolean {
  const projects = getOxiCloudProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// ============================================
// Assessment Request (Passende Beoordeling) Functions
// ============================================

export function getAssessmentRequests(): AssessmentRequest[] {
  const stored = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getAssessmentRequestByProjectId(projectId: string): AssessmentRequest | undefined {
  return getAssessmentRequests().find(r => r.projectId === projectId);
}

export function getAssessmentRequestsByArchitect(architectId: string): AssessmentRequest[] {
  return getAssessmentRequests().filter(r => r.architectId === architectId);
}

export function createAssessmentRequest(
  projectId: string, 
  architectId: string,
  opdrachtgeverEmail?: string,
  opdrachtgeverName?: string
): AssessmentRequest {
  const requests = getAssessmentRequests();
  
  // Check if request already exists for this project
  const existing = requests.find(r => r.projectId === projectId);
  if (existing) {
    return existing;
  }
  
  const newRequest: AssessmentRequest = {
    id: crypto.randomUUID(),
    projectId,
    architectId,
    opdrachtgeverEmail,
    opdrachtgeverName,
    status: 'requested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  requests.push(newRequest);
  localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(requests));
  return newRequest;
}

export function updateAssessmentRequest(
  id: string, 
  updates: Partial<AssessmentRequest>
): AssessmentRequest | null {
  const requests = getAssessmentRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  requests[index] = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(requests));
  return requests[index];
}

export function updateAssessmentStatus(
  id: string, 
  status: AssessmentRequestStatus
): AssessmentRequest | null {
  return updateAssessmentRequest(id, { status });
}
