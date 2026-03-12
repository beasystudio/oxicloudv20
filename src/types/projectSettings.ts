// Project Settings data types

export interface ProjectType {
  id: string;
  name: string;
  employeeCost: boolean;
  overhead: boolean;
  profitMargin: boolean;
  management: boolean;
  companyOverhead: boolean;
  createdAt: Date;
}

export interface ProjectStatus {
  id: string;
  name: string;
  color: string;
  employeeCost: boolean;
  overhead: boolean;
  profit: boolean;
  management: boolean;
  companyOverhead: boolean;
  visible: boolean;
  workHours: boolean;
  createdAt: Date;
}

export interface ProjectPhase {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  color: string;
  admin: boolean;
  invoice: boolean;
  type: 'percentage' | 'fixed' | 'regie' | 'na';
  value: number;
  inServiceFee: boolean;
  order: number;
  createdAt: Date;
}

export interface SchedulePhase {
  id: string;
  phaseId: string;
  admin: boolean;
  invoice: boolean;
  type: 'percentage' | 'fixed' | 'regie' | 'na';
  value: number;
  inServiceFee: boolean;
  startDate: Date | null;
  endDate: Date | null;
  order: number;
}

export interface ProjectSchedule {
  id: string;
  name: string;
  phases: SchedulePhase[];
  createdAt: Date;
}

export interface EmployeeRole {
  id: string;
  companyId: string;
  companyName: string;
  roleName: string;
  dailyRate: number;
  effectiveFrom: Date;
  createdAt: Date;
}

export interface EmployeeRoleHistory {
  id: string;
  employeeRoleId: string;
  dailyRate: number;
  effectiveFrom: Date;
  createdAt: Date;
}

// Default project types
export const DEFAULT_PROJECT_TYPES: Omit<ProjectType, 'id' | 'createdAt'>[] = [
  { name: 'Residential', employeeCost: true, overhead: true, profitMargin: true, management: true, companyOverhead: true },
  { name: 'Commercial', employeeCost: true, overhead: true, profitMargin: true, management: true, companyOverhead: true },
  { name: 'Expertise', employeeCost: true, overhead: false, profitMargin: false, management: false, companyOverhead: false },
  { name: 'Internal', employeeCost: false, overhead: false, profitMargin: false, management: false, companyOverhead: false }
];

// Default project statuses
export const DEFAULT_PROJECT_STATUSES: Omit<ProjectStatus, 'id' | 'createdAt'>[] = [
  { name: 'Open', color: '#22c55e', employeeCost: true, overhead: true, profit: true, management: true, companyOverhead: true, visible: true, workHours: true },
  { name: 'Expertise', color: '#eab308', employeeCost: true, overhead: true, profit: false, management: false, companyOverhead: true, visible: true, workHours: true },
  { name: 'Pre-study', color: '#3b82f6', employeeCost: true, overhead: false, profit: false, management: false, companyOverhead: false, visible: true, workHours: true },
  { name: 'Pending', color: '#f97316', employeeCost: false, overhead: false, profit: false, management: false, companyOverhead: false, visible: true, workHours: false },
  { name: 'Closed', color: '#6b7280', employeeCost: false, overhead: false, profit: false, management: false, companyOverhead: false, visible: false, workHours: false }
];

// Default project phases
export const DEFAULT_PROJECT_PHASES: Omit<ProjectPhase, 'id' | 'createdAt'>[] = [
  { name: 'Voorstudie', abbreviation: 'VST', description: 'Preliminary study phase', color: '#3b82f6', admin: true, invoice: true, type: 'percentage', value: 10, inServiceFee: true, order: 1 },
  { name: 'Voorontwerp', abbreviation: 'VOO', description: 'Preliminary design', color: '#8b5cf6', admin: true, invoice: true, type: 'percentage', value: 15, inServiceFee: true, order: 2 },
  { name: 'Aanbesteding', abbreviation: 'ABT', description: 'Tendering phase', color: '#ec4899', admin: true, invoice: true, type: 'percentage', value: 10, inServiceFee: false, order: 3 },
  { name: 'Uitvoering', abbreviation: 'UTV', description: 'Execution phase', color: '#f97316', admin: true, invoice: true, type: 'percentage', value: 50, inServiceFee: true, order: 4 },
  { name: 'Oplevering', abbreviation: 'OPL', description: 'Delivery phase', color: '#22c55e', admin: true, invoice: true, type: 'percentage', value: 15, inServiceFee: false, order: 5 }
];

export const PHASE_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'regie', label: 'Regie' },
  { value: 'na', label: 'N/A' }
] as const;
