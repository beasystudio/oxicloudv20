export type EntityType = 'enterprise' | 'authority' | null;
export type RegistrationStatus = 'select' | 'contact' | 'email-sent' | 'detailed-form' | 'pending' | 'approved';
export interface RegistrationData {
  entityType: EntityType;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
  companyName?: string;
  companyAddress?: string;
  bankAccount?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  privateEmail?: string;
  organizationType?: 'municipality' | 'province' | 'federal' | 'regional' | 'other';
  organizationName?: string;
  officialDomain?: string;
  employeeName?: string;
  workEmail?: string;
  employeeId?: string;
  department?: string;
  verificationDocument?: File | null;
}
