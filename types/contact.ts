// Contact data types for the Contact Settings module

export interface ContactType {
  id: string;
  hoofdtype: string;
  subtype: string;
  is_locked: boolean;
  is_default: boolean;
}

export interface Contact {
  id: string;
  hoofdtypeId: string;
  subtypeId: string;
  name: string;
  contactType: 'company' | 'individual';
  companyName?: string;
  linkedCompanyId?: string;
  vatNumber?: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  gsm: string;
  email: string;
  linkedProjectId?: string;
  organizationalLabelId?: string;
  avatarUrl?: string;
  status: 'Active' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRole {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface ContactGroup {
  id: string;
  name: string;
  contactIds: string[];
  order: number;
}

// Fixed default taxonomy - these are locked and cannot be edited/deleted
export const DEFAULT_TAXONOMY: { hoofdtype: string; subtypes: string[]; is_locked: boolean; is_default: boolean }[] = [
  {
    hoofdtype: 'Opdrachtnemer',
    subtypes: ['Architect', 'Facturatie', 'Studiebureau'],
    is_locked: true,
    is_default: true
  },
  {
    hoofdtype: 'Opdrachtgever',
    subtypes: ['Bouwheer', 'Facturatie'],
    is_locked: true,
    is_default: true
  }
];

export const DEFAULT_PROJECT_ROLES: string[] = [
  'Project Owner',
  'Contractor',
  'Billing',
  'Technical Lead',
  'Site Manager'
];

export const COUNTRIES = [
  'Belgium', 'Netherlands', 'France', 'Germany', 'United Kingdom',
  'Spain', 'Italy', 'Portugal', 'Luxembourg', 'Switzerland',
  'Austria', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
  'Vietnam', 'United States', 'Canada', 'Australia'
].sort();

// Context types for taxonomy filtering (Level 2 rules)
export type TaxonomyContext = 'settings' | 'external' | 'project_creation';
