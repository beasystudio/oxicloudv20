/**
 * Supabase NOx Project Store - Production workflow
 * Replaces localStorage-based noxProjectStore with real database operations
 */

import { supabase } from '@/integrations/supabase/client';
import { OxiCloudProjectStatus, NoxSubStatus, PreEstimationData, PriceData, PaymentData, DetailedCalculationData, CalculationResults } from '@/types/oxicloud';

export interface NoxVersionEntry {
  version: string;
  createdAt: string;
  createdBy: string;
  status: string;
}

export interface NoxProjectData {
  id: string;
  project_id: string;
  user_id: string;
  status: OxiCloudProjectStatus;
  sub_status?: NoxSubStatus;
  quote_sent_date?: string;
  days_pending?: number;
  pre_estimation?: PreEstimationData;
  price_data?: PriceData;
  payment_data?: PaymentData;
  detailed_calculation?: DetailedCalculationData;
  calculation_results?: CalculationResults;
  commission_amount?: number;
  report_job_queued: boolean;
  current_version: string;
  version_history: NoxVersionEntry[];
  created_at: string;
  updated_at: string;
}

// Get commission rate for a company (from platform settings or default)
export async function getCommissionRateForCompany(companyId: string): Promise<number> {
  const { data } = await supabase
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', `commission_rate_${companyId}`)
    .maybeSingle();
  
  if (data?.setting_value) {
    return (data.setting_value as any).percentage ?? 30;
  }
  return 30; // Default 30%
}

// Helper to transform DB row to NoxProjectData
function transformDbRow(row: any): NoxProjectData {
  return {
    id: row.id,
    project_id: row.project_id,
    user_id: row.user_id,
    status: row.status as OxiCloudProjectStatus,
    sub_status: row.sub_status as NoxSubStatus | undefined,
    quote_sent_date: row.quote_sent_date,
    days_pending: row.days_pending,
    pre_estimation: row.pre_estimation as PreEstimationData | undefined,
    price_data: row.price_data as PriceData | undefined,
    payment_data: row.payment_data as PaymentData | undefined,
    detailed_calculation: row.detailed_calculation as DetailedCalculationData | undefined,
    calculation_results: row.calculation_results as CalculationResults | undefined,
    commission_amount: row.commission_amount,
    report_job_queued: row.report_job_queued,
    current_version: row.current_version || 'v0',
    version_history: (row.version_history as NoxVersionEntry[]) || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Get NOx data for a specific project
export async function getNoxDataByProjectId(projectId: string): Promise<NoxProjectData | null> {
  const { data, error } = await supabase
    .from('nox_project_data')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching NOx data:', error);
    return null;
  }
  
  return data ? transformDbRow(data) : null;
}

// Get all NOx data for current user's projects
export async function getAllNoxData(): Promise<NoxProjectData[]> {
  const { data, error } = await supabase
    .from('nox_project_data')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all NOx data:', error);
    return [];
  }
  
  return (data || []).map(transformDbRow);
}

// Initialize NOx data for a project
export async function initializeNoxProject(projectId: string): Promise<NoxProjectData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if already exists
  const existing = await getNoxDataByProjectId(projectId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('nox_project_data')
    .insert({
      project_id: projectId,
      user_id: user.id,
      status: 'input_completed',
      report_job_queued: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing NOx project:', error);
    return null;
  }

  return transformDbRow(data);
}

// Update NOx data for a project
export async function updateNoxData(projectId: string, updates: Partial<NoxProjectData>): Promise<NoxProjectData | null> {
  // Remove id and project_id from updates to prevent conflicts
  const { id, project_id, user_id, ...safeUpdates } = updates as any;
  
  // Get existing data first
  const existing = await getNoxDataByProjectId(projectId);
  
  // If primary status changes, reset sub-status
  if (safeUpdates.status && existing && safeUpdates.status !== existing.status) {
    safeUpdates.sub_status = null;
    safeUpdates.quote_sent_date = null;
    safeUpdates.days_pending = null;
  }

  // If sub-status is set to 'quote_sent_to_customer', store the current date
  if (safeUpdates.sub_status === 'quote_sent_to_customer' && !existing?.quote_sent_date) {
    safeUpdates.quote_sent_date = new Date().toISOString();
  }

  // Compute days pending if we have a quote sent date and status is awaiting_payment
  const finalStatus = safeUpdates.status || existing?.status;
  const quoteSentDate = safeUpdates.quote_sent_date || existing?.quote_sent_date;
  if (quoteSentDate && finalStatus === 'awaiting_payment') {
    const sentDate = new Date(quoteSentDate);
    const today = new Date();
    safeUpdates.days_pending = Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const { data, error } = await supabase
    .from('nox_project_data')
    .update(safeUpdates)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating NOx data:', error);
    return null;
  }

  return transformDbRow(data);
}

// Save pre-estimation
export async function saveNoxPreEstimation(projectId: string, preEstimation: PreEstimationData): Promise<NoxProjectData | null> {
  return updateNoxData(projectId, {
    pre_estimation: preEstimation,
    status: 'input_completed',
  } as any);
}

// Generate price and calculate commission
export async function generateNoxPrice(projectId: string, companyId?: string): Promise<NoxProjectData | null> {
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
  const commissionRate = companyId ? await getCommissionRateForCompany(companyId) : 30;
  const commissionAmount = totalPrice * (commissionRate / 100);

  return updateNoxData(projectId, {
    price_data: priceData,
    commission_amount: commissionAmount,
    status: 'awaiting_payment',
  } as any);
}

// Set awaiting payment
export async function setNoxAwaitingPayment(projectId: string): Promise<NoxProjectData | null> {
  return updateNoxData(projectId, {
    status: 'awaiting_payment',
  } as any);
}

// Process payment
export async function processNoxPayment(projectId: string, vatNumber?: string): Promise<NoxProjectData | null> {
  const noxData = await getNoxDataByProjectId(projectId);
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
    payment_data: paymentData,
    status: 'paid',
    report_job_queued: true,
  } as any);
}

// Save detailed calculation
export async function saveNoxDetailedCalculation(projectId: string, detailedCalculation: DetailedCalculationData): Promise<NoxProjectData | null> {
  // Calculate total paved area
  const totalPavedArea = detailedCalculation.asphaltArea + detailedCalculation.concreteArea + 
    detailedCalculation.naturalStoneArea + detailedCalculation.looseMaterialsArea + 
    detailedCalculation.permeableGreenArea;

  // Calculation logic
  const baseStationary = 0.15 + (detailedCalculation.shellWindtightMonths * 0.08);
  const baseHeavyConstruction = 0.12 + (detailedCalculation.groundworkVolume * 0.00008);
  const baseLightConstruction = 0.05 + (totalPavedArea * 0.00015);
  const baseOperation = 0.03 + (detailedCalculation.parkingSpaces * 0.003);

  const overallMaxPercent = Math.max(baseStationary, baseHeavyConstruction, baseLightConstruction, baseOperation);

  let dominantPhase: 'puntbronnen' | 'lijnbronnen_construction' | 'lijnbronnen_operation' = 'puntbronnen';
  if (overallMaxPercent === baseHeavyConstruction || overallMaxPercent === baseLightConstruction) {
    dominantPhase = 'lijnbronnen_construction';
  } else if (overallMaxPercent === baseOperation) {
    dominantPhase = 'lijnbronnen_operation';
  }

  const calculationResults: CalculationResults = {
    calculatedAt: new Date().toISOString(),
    max_nox_stationary: 938,
    project_nox_stationary: 14.1 + (detailedCalculation.shellWindtightMonths * 0.75),
    percent_stationary: baseStationary,
    max_light_construction: 2538000,
    project_light_construction: 1270 + (totalPavedArea * 0.38),
    percent_light_construction: baseLightConstruction,
    max_heavy_construction: 345000,
    project_heavy_construction: 414 + (detailedCalculation.groundworkVolume * 0.028),
    percent_heavy_construction: baseHeavyConstruction,
    total_movements_construction: 1684 + (totalPavedArea * 0.38) + (detailedCalculation.groundworkVolume * 0.028),
    max_light_operation: 2538000,
    project_light_operation: 762 + (detailedCalculation.parkingSpaces * 76),
    percent_light_operation: baseOperation,
    max_heavy_operation: 345000,
    project_heavy_operation: 12,
    percent_heavy_operation: 0.003,
    total_movements_operation: 774 + (detailedCalculation.parkingSpaces * 76),
    overall_max_percent: overallMaxPercent,
    dominant_phase: dominantPhase,
    compliance_status: overallMaxPercent <= 1 ? 'compliant' : 'exceeds_threshold',
  };

  const status = calculationResults.compliance_status === 'compliant' 
    ? 'report_delivered' 
    : 'report_in_progress';

  return updateNoxData(projectId, {
    detailed_calculation: detailedCalculation,
    calculation_results: calculationResults,
    status,
  } as any);
}

// Mark report as delivered
export async function markNoxReportDelivered(projectId: string): Promise<NoxProjectData | null> {
  return updateNoxData(projectId, {
    status: 'report_delivered',
  } as any);
}

// Clone current version to create a new one (archives current, resets payment/calc data, keeps pre-estimation)
export async function cloneNoxVersion(projectId: string, createdByName?: string): Promise<NoxProjectData | null> {
  const existing = await getNoxDataByProjectId(projectId);
  if (!existing) return null;

  // Archive the current version
  const archivedEntry: NoxVersionEntry = {
    version: existing.current_version || 'v0',
    createdAt: existing.created_at,
    createdBy: createdByName || 'User',
    status: existing.status,
  };

  const newHistory = [...(existing.version_history || []), archivedEntry];
  const versionNum = newHistory.length;
  const newVersion = `v${versionNum}`;

  const { data, error } = await supabase
    .from('nox_project_data')
    .update({
      status: 'input_completed',
      sub_status: null,
      quote_sent_date: null,
      days_pending: null,
      price_data: null,
      payment_data: null,
      detailed_calculation: null,
      calculation_results: null,
      commission_amount: null,
      report_job_queued: false,
      current_version: newVersion,
      version_history: newHistory as unknown as any,
    })
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error cloning NOx version:', error);
    return null;
  }

  return transformDbRow(data);
}

// Create a quote in the database
export async function createQuote(params: {
  projectId: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  clientContactName: string;
  clientContactEmail: string;
  companyId: string;
}): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);

  const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      user_id: user.id,
      project_id: params.projectId,
      quote_number: quoteNumber,
      amount: params.amount,
      vat_amount: params.vatAmount,
      total_amount: params.totalAmount,
      client_contact_name: params.clientContactName,
      client_contact_email: params.clientContactEmail,
      company_id: params.companyId,
      valid_until: validUntil.toISOString(),
      status: 'pending',
      nox_status: 'awaiting_payment',
    })
    .select('quote_number')
    .single();

  if (error) {
    console.error('Error creating quote:', error);
    return null;
  }

  return data.quote_number;
}

// Update quote status when sent
export async function markQuoteSent(quoteNumber: string): Promise<boolean> {
  const { error } = await supabase
    .from('quotes')
    .update({ status: 'sent' })
    .eq('quote_number', quoteNumber);

  if (error) {
    console.error('Error marking quote as sent:', error);
    return false;
  }
  return true;
}

// Record payment in the database
export async function recordPayment(quoteNumber: string, amount: number): Promise<boolean> {
  // Get the quote
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, company_id')
    .eq('quote_number', quoteNumber)
    .single();

  if (!quote) return false;

  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      quote_id: quote.id,
      amount,
      transaction_id: transactionId,
      payment_method: 'card',
      payment_provider: 'stripe',
    })
    .select('id')
    .single();

  if (paymentError) {
    console.error('Error recording payment:', paymentError);
    return false;
  }

  // Update quote status
  await supabase
    .from('quotes')
    .update({ status: 'paid', nox_status: 'paid' })
    .eq('id', quote.id);

  return true;
}
