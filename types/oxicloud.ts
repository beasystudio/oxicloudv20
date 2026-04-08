export type OxiCloudProjectStatus = 
  | 'input_incomplete'
  | 'input_completed'
  | 'price_generated'
  | 'awaiting_payment'
  | 'paid'
  | 'report_in_progress'
  | 'report_delivered';

export interface MapFootprintData {
  distance: number;
  sitename: string;
  sitecode: string;
  kdw: number;
  footprintCoords: number[][][];
  plotCoordinates?: number[][];
  projectCoordinates: { lat: number; lon: number };
}

// ── Per-Project-Type entry (one per selected type) ──
export interface ProjectTypeEntry {
  projectTypeValue: string;       // e.g. 'eengezinswoningen'
  constructionType: string;       // e.g. 'nieuwbouw'
  gfa: number;                    // Gross Floor Area (m²)
  height: number;                 // Building height (m)
}

// Sloop-specific entry (no construction type needed)
export interface SloopEntry {
  demolitionArea: number;         // m²
  demolitionVolume: number;       // m³
  description: string;            // What is being demolished
}

export interface PreEstimationData {
  /** @deprecated Use projectTypeEntries instead */
  projectType: string;
  /** @deprecated Use projectTypeEntries instead */
  constructionType: string;
  groundFloorArea: number;
  numberOfFloors: number;
  demolitionVolume: number;
  whatDemolish: string;
  mapData?: MapFootprintData;
  // New multi-type structure
  projectTypeEntries?: ProjectTypeEntry[];
  sloopEntry?: SloopEntry;
  hasSloop?: boolean;
}

/**
 * Validates whether all required fields in the voorlopige form are filled.
 * Returns true only when the form is fully complete.
 */
export function isPreEstimationComplete(data?: PreEstimationData): boolean {
  if (!data) return false;

  // Must have at least one valid project type entry
  const entries = data.projectTypeEntries;
  if (!entries || entries.length === 0) return false;

  const allEntriesValid = entries.every(
    e => !!e.projectTypeValue && !!e.constructionType && e.gfa > 0 && e.height > 0
  );
  if (!allEntriesValid) return false;

  // Sloop validation (if enabled)
  if (data.hasSloop) {
    const sloop = data.sloopEntry;
    if (!sloop || sloop.demolitionVolume <= 0 || !sloop.description || sloop.description.length === 0) {
      return false;
    }
  }

  // Map data must be present (location selected)
  if (!data.mapData) return false;

  // Opdracht field must be filled
  if (!data.whatDemolish || data.whatDemolish.trim().length === 0) return false;

  return true;
}

/**
 * Checks if the user has started filling in any data (partial progress).
 */
export function hasPreEstimationProgress(data?: PreEstimationData): boolean {
  if (!data) return false;
  const entries = data.projectTypeEntries;
  if (entries && entries.length > 0) return true;
  if (data.hasSloop) return true;
  if (data.mapData) return true;
  if (data.whatDemolish && data.whatDemolish.trim().length > 0) return true;
  return false;
}

export interface PriceData {
  basePrice: number;
  vat: number;
  totalPrice: number;
  validUntil: string;
}

export interface PaymentData {
  paymentId: string;
  paymentDate: string;
  invoiceNumber: string;
  vatNumber?: string;
  billingDetails: {
    companyName: string;
    address: string;
    email: string;
  };
}

// Exploitation Phase - Heating/Cooling System Data
export interface ExploitationSystemData {
  // Q1: Has combustion-based system?
  hasCombustionSystem: boolean | null;
  // For Residential: specific type
  residentialSystemType?: 'fireplace' | 'wood_stove' | 'gas_boiler' | 'oil_boiler' | null;
  // For Industrial: system categories
  industrialSystemCategory?: 'combustion' | 'electric_renewable' | 'both' | null;
  // Q2: System usage
  isRegularOperation?: boolean | null; // Industrial
  annualUsageHours?: number; // Residential - check if > 100h
  isDecorativeOnly?: boolean; // Residential
  isBackupEmergency?: boolean; // Industrial
  // Q3: Detailed parameters
  fuelType?: 'wood' | 'natural_gas' | 'heating_oil' | 'biomass' | null;
  operatingHoursAnnual?: number;
  systemPowerKw?: number;
  // Exclusion flag
  excludeFromCalculation?: boolean;
  exclusionReason?: string;
}

export interface DetailedCalculationData {
  // Ruwbouw winddicht – duur (maanden)
  shellWindtightMonths: number;
  // Omtrek van het nieuwe gebouw (m)
  buildingPerimeter: number;
  // Oppervlakte bestaande asfaltverharding die wordt afgebroken (m²)
  removedAsphaltArea: number;
  // Individual pavement areas (m²)
  asphaltArea: number;
  concreteArea: number;
  naturalStoneArea: number;
  looseMaterialsArea: number;
  permeableGreenArea: number;
  // Diepte bouwput (m)
  excavationDepth: number;
  // Grondwerkvolume (m³) - auto calculated
  groundworkVolume: number;
  // Terreinophoging oppervlakte (m²)
  terrainRaisingSurfaceArea: number;
  // Terreinophoging volume (m³)
  terrainRaisingVolume: number;
  // Geprefabriceerd materiaal (0-80%)
  prefabricatedPercentage: number;
  // Aantal parkeerplaatsen
  parkingSpaces: number;
  // Toegang tot elektriciteitsnet
  electricityAccess: 'yes' | 'no';
  // Exploitation phase data
  exploitationSystem?: ExploitationSystemData;
}

export interface CalculationResults {
  calculatedAt: string;
  
  // Puntbronnen (Stationary Sources)
  max_nox_stationary: number;
  project_nox_stationary: number;
  percent_stationary: number;
  
  // Lijnbronnen – Construction Phase
  max_light_construction: number;
  project_light_construction: number;
  percent_light_construction: number;
  max_heavy_construction: number;
  project_heavy_construction: number;
  percent_heavy_construction: number;
  total_movements_construction: number;
  
  // Lijnbronnen – Operation Phase
  max_light_operation: number;
  project_light_operation: number;
  percent_light_operation: number;
  max_heavy_operation: number;
  project_heavy_operation: number;
  percent_heavy_operation: number;
  total_movements_operation: number;
  
  // Global Result
  overall_max_percent: number;
  dominant_phase: 'puntbronnen' | 'lijnbronnen_construction' | 'lijnbronnen_operation';
  compliance_status: 'compliant' | 'exceeds_threshold';
}

export interface OxiCloudProject {
  id: string;
  userId: string;
  name: string;
  status: OxiCloudProjectStatus;
  preEstimation?: PreEstimationData;
  priceData?: PriceData;
  paymentData?: PaymentData;
  detailedCalculation?: DetailedCalculationData;
  calculationResults?: CalculationResults;
  reportJobQueued: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Hierarchical Project Types for Flanders ──
export interface ProjectTypeCategory {
  value: string;
  label: string;
  tooltip?: string;
  subtypes: { value: string; label: string }[];
}

export const PROJECT_TYPE_CATEGORIES: ProjectTypeCategory[] = [
  {
    value: 'sloop',
    label: 'Sloop',
    tooltip: 'Afbraak van bestaande constructies.',
    subtypes: [], // Sloop has no subtypes – it's a standalone type
  },
  {
    value: 'residentieel',
    label: 'Residentiële Gebouwen (Woningbouw)',
    tooltip: 'Gebouwen bestemd voor bewoning.',
    subtypes: [
      { value: 'eengezinswoningen', label: '1.1 Eengezinswoningen' },
      { value: 'meergezinswoningen', label: '1.2 Meergezinswoningen' },
      { value: 'sociale_woningbouw', label: '1.3 Sociale woningbouw' },
      { value: 'collectieve_woonvormen', label: '1.4 Collectieve woonvormen' },
    ],
  },
  {
    value: 'utiliteitsbouw',
    label: 'Utiliteitsbouw (Niet-residentieel)',
    tooltip: 'Gebouwen voor publieke of private dienstverlening.',
    subtypes: [
      { value: 'kantoren', label: '2.1 Kantoren en administratieve gebouwen' },
      { value: 'onderwijsgebouwen', label: '2.2 Onderwijsgebouwen' },
      { value: 'gezondheidszorg', label: '2.3 Gezondheidszorggebouwen' },
      { value: 'handelsgebouwen', label: '2.4 Handelsgebouwen' },
      { value: 'cultuur_vrijetijd', label: '2.5 Cultuur- en vrijetijdsgebouwen' },
    ],
  },
  {
    value: 'industrieel_agrarisch',
    label: 'Industriële en Agrarische Gebouwen',
    tooltip: 'Gebouwen voor industriële productie, opslag of agrarische activiteiten.',
    subtypes: [
      { value: 'industriele_gebouwen', label: '3.1 Industriële gebouwen' },
      { value: 'opslaggebouwen', label: '3.2 Opslaggebouwen' },
      { value: 'agrarische_gebouwen', label: '3.3 Agrarische gebouwen' },
    ],
  },
  {
    value: 'specifieke_projecttypes',
    label: 'Specifieke Projecttypes (Ruimtelijke Ordening)',
    tooltip: 'Speciale projecten binnen ruimtelijke ordening en publieke ontwikkeling.',
    subtypes: [
      { value: 'complexe_projecten', label: '4.1 Complexe projecten' },
      { value: 'openbare_werken', label: '4.2 Openbare werken' },
    ],
  },
];

// Flat list for backward compatibility and quick lookups
export const PROJECT_TYPES = PROJECT_TYPE_CATEGORIES.flatMap(cat =>
  cat.subtypes.length > 0
    ? cat.subtypes.map(sub => ({ value: sub.value, label: sub.label, category: cat.label }))
    : [{ value: cat.value, label: cat.label, category: cat.label }]
);

export const CONSTRUCTION_TYPES = [
  { value: 'nieuwbouw', label: 'Nieuwbouw' },
  { value: 'renovatie', label: 'Renovatie' },
  { value: 'bijbouw', label: 'Bijbouw' },
];

export const PAVEMENT_TYPES = [
  { value: 'asphalt', label: 'Asfaltverharding – wegen, parking, paden' },
  { value: 'concrete', label: 'Betonverharding – Grasdallen, gewapend beton, betonklinkers, betonstraatstenen' },
  { value: 'natural_stone', label: 'Natuursteen & baksteen – klinkers (baksteen)' },
  { value: 'loose_materials', label: 'Losse & halfgebonden materialen – steenslag / grind, halfverharding' },
  { value: 'permeable_green', label: 'Permeabele & "groene" verharding' },
];

export const STATUS_CONFIG: Record<OxiCloudProjectStatus, { label: string; color: string }> = {
  input_incomplete: { label: 'Draft', color: 'bg-gray-500' },
  input_completed: { label: 'Draft', color: 'bg-gray-500' },
  price_generated: { label: 'Quote Sent', color: 'bg-blue-500' },
  awaiting_payment: { label: 'Quote Sent', color: 'bg-blue-500' },
  paid: { label: 'Signed', color: 'bg-indigo-500' },
  report_in_progress: { label: 'Report Held', color: 'bg-amber-500' },
  report_delivered: { label: 'Released', color: 'bg-emerald-600' },
};

// Secondary Sub-Status types based on Primary Status
export type NoxSubStatus = 
  // Input Incomplete sub-statuses
  | 'not_started'
  | 'partially_completed'
  // Input Completed sub-statuses
  | 'data_under_review'
  | 'calculation_pending'
  | 'waiting_for_missing_information'
  | 'ready_for_pricing'
  // Price Generated sub-statuses
  | 'quote_drafted'
  | 'quote_sent_to_customer'
  | 'awaiting_confirmation'
  | 'customer_reviewing'
  // Awaiting Payment sub-statuses
  | 'invoice_issued'
  | 'reminder_sent_1st'
  | 'reminder_sent_2nd'
  | 'overdue'
  | 'payment_dispute'
  // Paid sub-statuses
  | 'payment_received'
  | 'payment_verification'
  | 'ready_for_reporting'
  // Report in Progress sub-statuses
  | 'drafting_report'
  | 'technical_validation'
  | 'internal_review'
  | 'preparing_delivery'
  // Report Delivered sub-statuses
  | 'delivered_to_client'
  | 'client_acknowledged'
  | 'client_follow_up_pending'
  | 'archived';

// Mapping of primary status to allowed sub-statuses
export const SUB_STATUS_OPTIONS: Record<OxiCloudProjectStatus, { value: NoxSubStatus; label: string }[]> = {
  input_incomplete: [
    { value: 'not_started', label: 'Not started' },
    { value: 'partially_completed', label: 'Partially completed' },
  ],
  input_completed: [
    { value: 'data_under_review', label: 'Data under review' },
    { value: 'calculation_pending', label: 'Calculation pending' },
    { value: 'waiting_for_missing_information', label: 'Waiting for missing information' },
    { value: 'ready_for_pricing', label: 'Ready for pricing' },
  ],
  price_generated: [
    { value: 'quote_drafted', label: 'Quote drafted' },
    { value: 'quote_sent_to_customer', label: 'Quote sent to customer' },
    { value: 'awaiting_confirmation', label: 'Awaiting confirmation' },
    { value: 'customer_reviewing', label: 'Customer reviewing' },
  ],
  awaiting_payment: [
    { value: 'invoice_issued', label: 'Invoice issued' },
    { value: 'reminder_sent_1st', label: 'Reminder sent (1st)' },
    { value: 'reminder_sent_2nd', label: 'Reminder sent (2nd)' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'payment_dispute', label: 'Payment dispute' },
  ],
  paid: [
    { value: 'payment_received', label: 'Payment received' },
    { value: 'payment_verification', label: 'Payment verification' },
    { value: 'ready_for_reporting', label: 'Ready for reporting' },
  ],
  report_in_progress: [
    { value: 'drafting_report', label: 'Drafting report' },
    { value: 'technical_validation', label: 'Technical validation' },
    { value: 'internal_review', label: 'Internal review' },
    { value: 'preparing_delivery', label: 'Preparing delivery' },
  ],
  report_delivered: [
    { value: 'delivered_to_client', label: 'Delivered to client' },
    { value: 'client_acknowledged', label: 'Client acknowledged' },
    { value: 'client_follow_up_pending', label: 'Client follow-up pending' },
    { value: 'archived', label: 'Archived' },
  ],
};

// Sub-status configuration with labels and colors
export const SUB_STATUS_CONFIG: Record<NoxSubStatus, { label: string; color: string; isWarning?: boolean }> = {
  // Input Incomplete
  not_started: { label: 'Not started', color: 'bg-slate-400' },
  partially_completed: { label: 'Partially completed', color: 'bg-slate-500' },
  // Input Completed
  data_under_review: { label: 'Data under review', color: 'bg-slate-400' },
  calculation_pending: { label: 'Calculation pending', color: 'bg-slate-500' },
  waiting_for_missing_information: { label: 'Waiting for missing info', color: 'bg-amber-500', isWarning: true },
  ready_for_pricing: { label: 'Ready for pricing', color: 'bg-green-500' },
  // Price Generated
  quote_drafted: { label: 'Quote drafted', color: 'bg-blue-400' },
  quote_sent_to_customer: { label: 'Quote sent to customer', color: 'bg-blue-500' },
  awaiting_confirmation: { label: 'Awaiting confirmation', color: 'bg-blue-600' },
  customer_reviewing: { label: 'Customer reviewing', color: 'bg-indigo-500' },
  // Awaiting Payment
  invoice_issued: { label: 'Invoice issued', color: 'bg-orange-400' },
  reminder_sent_1st: { label: 'Reminder sent (1st)', color: 'bg-orange-500' },
  reminder_sent_2nd: { label: 'Reminder sent (2nd)', color: 'bg-orange-600', isWarning: true },
  overdue: { label: 'Overdue', color: 'bg-red-500', isWarning: true },
  payment_dispute: { label: 'Payment dispute', color: 'bg-red-600', isWarning: true },
  // Paid
  payment_received: { label: 'Payment received', color: 'bg-green-500' },
  payment_verification: { label: 'Payment verification', color: 'bg-green-400' },
  ready_for_reporting: { label: 'Ready for reporting', color: 'bg-green-600' },
  // Report in Progress
  drafting_report: { label: 'Drafting report', color: 'bg-purple-400' },
  technical_validation: { label: 'Technical validation', color: 'bg-purple-500' },
  internal_review: { label: 'Internal review', color: 'bg-purple-600' },
  preparing_delivery: { label: 'Preparing delivery', color: 'bg-violet-500' },
  // Report Delivered
  delivered_to_client: { label: 'Delivered to client', color: 'bg-emerald-500' },
  client_acknowledged: { label: 'Client acknowledged', color: 'bg-emerald-600' },
  client_follow_up_pending: { label: 'Follow-up pending', color: 'bg-amber-500', isWarning: true },
  archived: { label: 'Archived', color: 'bg-slate-500' },
};

// Passende Beoordeling (Expert Assessment) Types
export type AssessmentRequestStatus = 
  | 'requested'           // Architect initiated, quotation pending
  | 'quotation_sent'      // Quote sent to opdrachtgever
  | 'quotation_accepted'  // Opdrachtgever accepted, awaiting payment
  | 'paid'                // Payment received, assessment in preparation
  | 'in_progress'         // Expert assessment underway
  | 'completed'           // Final report delivered
  | 'cancelled';          // Request cancelled

export interface AssessmentRequest {
  id: string;
  projectId: string;
  architectId: string;           // User who initiated
  opdrachtgeverId?: string;      // End client
  opdrachtgeverEmail?: string;
  opdrachtgeverName?: string;
  status: AssessmentRequestStatus;
  quotationAmount?: number;
  quotationValidUntil?: string;
  paymentDate?: string;
  reportUrl?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export const ASSESSMENT_STATUS_CONFIG: Record<AssessmentRequestStatus, { label: string; color: string; description: string }> = {
  requested: { 
    label: 'Quotation Pending', 
    color: 'bg-amber-500',
    description: 'Your request has been received. A quotation is being prepared.'
  },
  quotation_sent: { 
    label: 'Awaiting Client Decision', 
    color: 'bg-blue-500',
    description: 'A quotation has been sent to the opdrachtgever.'
  },
  quotation_accepted: { 
    label: 'Awaiting Payment', 
    color: 'bg-orange-500',
    description: 'The opdrachtgever has accepted. Awaiting payment.'
  },
  paid: { 
    label: 'Assessment in Preparation', 
    color: 'bg-purple-500',
    description: 'Payment received. The Passende Beoordeling is now being prepared.'
  },
  in_progress: { 
    label: 'Assessment in Progress', 
    color: 'bg-indigo-500',
    description: 'Our experts are conducting the detailed assessment.'
  },
  completed: { 
    label: 'Report Delivered', 
    color: 'bg-emerald-600',
    description: 'The Passende Beoordeling report is ready.'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-gray-500',
    description: 'This assessment request was cancelled.'
  },
};
