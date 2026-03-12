// User data types for the User Settings module

export interface UserGeneral {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  phone: string;
  gsm: string;
  language: 'EN' | 'FR' | 'NL' | 'VI';
  nationality: string;
  avatarUrl: string | null;
  company: string;
  myProjectsOnly: boolean;
  isEmployee: boolean;
  responsibleForHR: boolean;
  crmAccess: boolean;
  financialDashboardAccess: boolean;
  settingsAccess?: boolean;
  leaveDays: number;
  extraLeaveDays: number;
}

export interface UserConfidential {
  street: string;
  number: string;
  bus: string;
  postalCode: string;
  city: string;
  country: string;
  idNumber: string;
  nationalNumber: string;
  personalEmail: string;
  personalPhone: string;
  birthdate: Date | null;
  startDate: Date | null;
}

export interface UserSubscription {
  contractType: 'Standard User' | 'Power User/Admin';
  workEmail: string;
  password: string;
  status: 'Active' | 'Pending';
}

export interface CostRate {
  id: string;
  costPerHour: number;
  effectiveFrom: Date;
  createdAt: Date;
}

export interface Break {
  id: string;
  from: string;
  to: string;
  description: string;
}

export interface UserAvailability {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  breaks: Break[];
}

export interface FullUser {
  id: string;
  general: UserGeneral;
  confidential: UserConfidential;
  subscription: UserSubscription;
  costRates: CostRate[];
  availability: UserAvailability;
  createdAt: Date;
  updatedAt: Date;
  isFormerEmployee: boolean;
  terminationDate: Date | null;
}

export const LANGUAGES = [
  { value: 'EN', label: 'English' },
  { value: 'FR', label: 'French' },
  { value: 'NL', label: 'Dutch' },
  { value: 'VI', label: 'Vietnamese' }
] as const;

export const COUNTRIES = [
  'Belgium', 'Netherlands', 'France', 'Germany', 'United Kingdom',
  'Spain', 'Italy', 'Portugal', 'Luxembourg', 'Switzerland',
  'Austria', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
  'Vietnam', 'United States', 'Canada', 'Australia'
].sort();

export const CONTRACT_TYPES = [
  { value: 'Standard User', label: 'Standard User' },
  { value: 'Power User/Admin', label: 'Power User/Admin' }
] as const;
