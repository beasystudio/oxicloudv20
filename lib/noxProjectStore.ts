/**
 * NOx Project Store - Syncs with Project Module
 * NOx only adds its own technical layer on top of existing projects
 */

import { getAllLocalProjects, LocalProject } from './mockLocalProjects';
import { OxiCloudProjectStatus, NoxSubStatus, PreEstimationData, PriceData, PaymentData, DetailedCalculationData, CalculationResults, isPreEstimationComplete } from '@/types/oxicloud';

const NOX_DATA_KEY = 'nox_project_data';
const COMMISSION_RATES_KEY = 'oxicloud_commission_rates';

export interface NoxVersionEntry {
  version: string; // 'v0', 'v1', 'v2', etc.
  createdAt: string;
  createdBy: string;
  status: OxiCloudProjectStatus;
  preEstimation?: PreEstimationData;
  priceData?: PriceData;
  paymentData?: PaymentData;
  detailedCalculation?: DetailedCalculationData;
  calculationResults?: CalculationResults;
  commissionAmount?: number;
}

export interface NoxProjectData {
  projectId: string; // Links to LocalProject.id
  status: OxiCloudProjectStatus;
  subStatus?: NoxSubStatus; // Secondary sub-status
  quoteSentDate?: string; // Date when quote was sent to customer
  daysPending?: number; // Computed: today - quoteSentDate
  preEstimation?: PreEstimationData;
  priceData?: PriceData;
  paymentData?: PaymentData;
  detailedCalculation?: DetailedCalculationData;
  calculationResults?: CalculationResults;
  commissionAmount?: number; // Calculated commission for client
  reportJobQueued: boolean;
  noxCreatedAt: string;
  noxUpdatedAt: string;
  // Versioning
  currentVersion: string; // 'v0', 'v1', etc.
  versionHistory: NoxVersionEntry[];
}

export interface NoxProject extends LocalProject {
  noxData?: NoxProjectData;
}

// Get commission rate for a company (from CommissionManagement settings)
export function getCommissionRateForCompany(companyId: string): number {
  const stored = localStorage.getItem(COMMISSION_RATES_KEY);
  if (!stored) return 30; // Default 30%
  const rates = JSON.parse(stored);
  const rate = rates.find((r: { companyId: string }) => r.companyId === companyId);
  return rate?.percentage ?? 30;
}

// Get all NOx data records
function getAllNoxData(): NoxProjectData[] {
  const stored = localStorage.getItem(NOX_DATA_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save NOx data
function saveNoxData(data: NoxProjectData[]): void {
  localStorage.setItem(NOX_DATA_KEY, JSON.stringify(data));
}

// Get NOx data for a specific project
export function getNoxDataByProjectId(projectId: string): NoxProjectData | undefined {
  return getAllNoxData().find(d => d.projectId === projectId);
}

// Get all projects synced with NOx data (from Project Module)
// Optionally filter by companyId
export function getNoxProjects(companyId?: string): NoxProject[] {
  let localProjects = getAllLocalProjects();
  
  // Filter by company if provided
  if (companyId) {
    localProjects = localProjects.filter(p => p.companyId === companyId);
  }
  
  const noxDataList = getAllNoxData();
  
  return localProjects.map(project => {
    const noxData = noxDataList.find(d => d.projectId === project.id);
    return { ...project, noxData };
  });
}

// Initialize NOx data for a project (first time entering NOx workflow)
export function initializeNoxProject(projectId: string): NoxProjectData {
  const allData = getAllNoxData();
  const existing = allData.find(d => d.projectId === projectId);
  
  if (existing) return existing;
  
  const newData: NoxProjectData = {
    projectId,
    status: 'input_incomplete',
    reportJobQueued: false,
    noxCreatedAt: new Date().toISOString(),
    noxUpdatedAt: new Date().toISOString(),
    currentVersion: 'v0',
    versionHistory: [],
  };
  
  allData.push(newData);
  saveNoxData(allData);
  return newData;
}

// Clone current version to create a new version (v1, v2, etc.)
export function cloneNoxVersion(projectId: string, createdBy: string): NoxProjectData | null {
  const allData = getAllNoxData();
  const index = allData.findIndex(d => d.projectId === projectId);
  if (index === -1) return null;
  
  const current = allData[index];
  
  // Archive current version
  const currentVersionEntry: NoxVersionEntry = {
    version: current.currentVersion || 'v0',
    createdAt: current.noxCreatedAt,
    createdBy,
    status: current.status,
    preEstimation: current.preEstimation,
    priceData: current.priceData,
    paymentData: current.paymentData,
    detailedCalculation: current.detailedCalculation,
    calculationResults: current.calculationResults,
    commissionAmount: current.commissionAmount,
  };
  
  const history = [...(current.versionHistory || []), currentVersionEntry];
  const nextVersionNum = history.length;
  const nextVersion = `v${nextVersionNum}`;
  
  // Create new version - pre-estimation and map data are preserved, but payment/calc data reset
  allData[index] = {
    ...current,
    status: 'input_completed', // Pre-estimation is kept, so start from input_completed
    subStatus: undefined,
    quoteSentDate: undefined,
    daysPending: undefined,
    priceData: undefined,
    paymentData: undefined,
    detailedCalculation: undefined,
    calculationResults: undefined,
    commissionAmount: undefined,
    reportJobQueued: false,
    currentVersion: nextVersion,
    versionHistory: history,
    noxUpdatedAt: new Date().toISOString(),
  };
  
  saveNoxData(allData);
  return allData[index];
}

// Update NOx data for a project
export function updateNoxData(projectId: string, updates: Partial<NoxProjectData>): NoxProjectData | null {
  const allData = getAllNoxData();
  const index = allData.findIndex(d => d.projectId === projectId);
  
  if (index === -1) return null;
  
  // If primary status changes, reset sub-status
  if (updates.status && updates.status !== allData[index].status) {
    updates.subStatus = undefined;
    updates.quoteSentDate = undefined;
    updates.daysPending = undefined;
  }
  
  // If sub-status is set to 'quote_sent_to_customer', store the current date
  if (updates.subStatus === 'quote_sent_to_customer' && !allData[index].quoteSentDate) {
    updates.quoteSentDate = new Date().toISOString();
  }
  
  // Compute days pending if we have a quote sent date and status is awaiting_payment
  const finalStatus = updates.status || allData[index].status;
  const quoteSentDate = updates.quoteSentDate || allData[index].quoteSentDate;
  if (quoteSentDate && finalStatus === 'awaiting_payment') {
    const sentDate = new Date(quoteSentDate);
    const today = new Date();
    updates.daysPending = Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  allData[index] = {
    ...allData[index],
    ...updates,
    noxUpdatedAt: new Date().toISOString(),
  };
  
  saveNoxData(allData);
  return allData[index];
}

// Update sub-status specifically
export function updateNoxSubStatus(projectId: string, subStatus: NoxSubStatus | undefined): NoxProjectData | null {
  return updateNoxData(projectId, { subStatus });
}

// Save pre-estimation (auto-determines status based on completeness)
// IMPORTANT: Never downgrade status if already past input_completed (e.g. price_generated, awaiting_payment, etc.)
export function saveNoxPreEstimation(projectId: string, data: PreEstimationData): NoxProjectData | null {
  const currentData = getNoxDataByProjectId(projectId);
  const newStatus: OxiCloudProjectStatus = isPreEstimationComplete(data) ? 'input_completed' : 'input_incomplete';
  
  // Status progression order - never go backwards
  const STATUS_ORDER: OxiCloudProjectStatus[] = [
    'input_incomplete', 'input_completed', 'price_generated',
    'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'
  ];
  const currentIndex = currentData ? STATUS_ORDER.indexOf(currentData.status) : -1;
  const newIndex = STATUS_ORDER.indexOf(newStatus);
  
  // Only update status if it would advance (or stay the same), never downgrade
  const shouldUpdateStatus = currentIndex <= newIndex;
  
  return updateNoxData(projectId, {
    preEstimation: data,
    ...(shouldUpdateStatus ? { status: newStatus } : {}),
  });
}

// Generate price and calculate commission
export function generateNoxPrice(projectId: string, companyId?: string): NoxProjectData | null {
  const basePrice = Math.floor(Math.random() * 2000) + 1500;
  const vat = basePrice * 0.21;
  const totalPrice = basePrice + vat;
  
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);
  
  const priceData: PriceData = {
    basePrice,
    vat,
    totalPrice,
    validUntil: validUntil.toISOString(),
  };
  
  // Calculate commission for the client company
  const commissionRate = companyId ? getCommissionRateForCompany(companyId) : 30;
  const commissionAmount = totalPrice * (commissionRate / 100);
  
  return updateNoxData(projectId, {
    priceData,
    commissionAmount,
    status: 'price_generated',
  });
}

// Set awaiting payment
export function setNoxAwaitingPayment(projectId: string): NoxProjectData | null {
  return updateNoxData(projectId, {
    status: 'awaiting_payment',
  });
}

// Process payment
export function processNoxPayment(projectId: string, vatNumber?: string): NoxProjectData | null {
  const noxData = getNoxDataByProjectId(projectId);
  if (!noxData) return null;
  
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
  
  return updateNoxData(projectId, {
    paymentData,
    status: 'paid',
    reportJobQueued: true,
  });
}

// Save detailed calculation
export function saveNoxDetailedCalculation(projectId: string, data: DetailedCalculationData): NoxProjectData | null {
  // Calculate total paved area
  const totalPavedArea = data.asphaltArea + data.concreteArea + data.naturalStoneArea + 
    data.looseMaterialsArea + data.permeableGreenArea;
  
  // More realistic calculation - smaller projects can be compliant
  // Base values are much smaller, scaling factors adjusted
  const baseStationary = 0.15 + (data.shellWindtightMonths * 0.08);
  const baseHeavyConstruction = 0.12 + (data.groundworkVolume * 0.00008);
  const baseLightConstruction = 0.05 + (totalPavedArea * 0.00015);
  const baseOperation = 0.03 + (data.parkingSpaces * 0.003);
  
  // Find the maximum percentage across all phases
  const overallMaxPercent = Math.max(baseStationary, baseHeavyConstruction, baseLightConstruction, baseOperation);
  
  // Determine dominant phase
  let dominantPhase: 'puntbronnen' | 'lijnbronnen_construction' | 'lijnbronnen_operation' = 'puntbronnen';
  if (overallMaxPercent === baseHeavyConstruction || overallMaxPercent === baseLightConstruction) {
    dominantPhase = 'lijnbronnen_construction';
  } else if (overallMaxPercent === baseOperation) {
    dominantPhase = 'lijnbronnen_operation';
  }
  
  const calculationResults: CalculationResults = {
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
    compliance_status: overallMaxPercent <= 1 ? 'compliant' : 'exceeds_threshold',
  };
  
  // Auto-set status to report_delivered if compliant
  const status = calculationResults.compliance_status === 'compliant' 
    ? 'report_delivered' 
    : 'report_in_progress';
  
  return updateNoxData(projectId, {
    detailedCalculation: data,
    calculationResults,
    status,
  });
}

// Mark report as delivered
export function markNoxReportDelivered(projectId: string): NoxProjectData | null {
  return updateNoxData(projectId, {
    status: 'report_delivered',
  });
}

// Get project stats (optionally filter by companyId)
export function getNoxProjectStats(companyId?: string) {
  const projects = getNoxProjects(companyId);
  const projectsWithNox = projects.filter(p => p.noxData);
  
  return {
    totalProjects: projects.length,
    projectsWithNoxData: projectsWithNox.length,
    activeProjects: projectsWithNox.filter(p => 
      p.noxData && ['input_incomplete', 'input_completed', 'price_generated', 'paid', 'report_in_progress'].includes(p.noxData.status)
    ).length,
    awaitingPayment: projectsWithNox.filter(p => p.noxData?.status === 'awaiting_payment').length,
    reportsInProgress: projectsWithNox.filter(p => p.noxData?.status === 'report_in_progress').length,
    reportsDelivered: projectsWithNox.filter(p => p.noxData?.status === 'report_delivered').length,
    totalSpendThisMonth: projectsWithNox
      .filter(p => p.noxData?.paymentData && new Date(p.noxData.paymentData.paymentDate).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + (p.noxData?.priceData?.totalPrice || 0), 0),
  };
}
