export type QuoteStatus = 'pending' | 'sent' | 'paid' | 'expired' | 'cancelled';
export type CommissionStatus = 'pending_invoice' | 'invoice_received' | 'paid' | 'disputed';
export type AuditEventType = 
  | 'quote_created' 
  | 'quote_sent' 
  | 'quote_paid' 
  | 'quote_expired' 
  | 'quote_cancelled'
  | 'calculation_unlocked' 
  | 'commission_email_sent' 
  | 'invoice_received' 
  | 'commission_paid'
  | 'payment_webhook_received';

export interface CompanyBillingInfo {
  id: string;
  company_id: string;
  company_name: string;
  email: string;
  vat_number?: string;
  peppol_id?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  project_id: string;
  user_id: string;
  company_id: string;
  client_contact_name: string;
  client_contact_email: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: QuoteStatus;
  valid_until: string;
  payment_link?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  quote_id: string;
  transaction_id: string;
  amount: number;
  payment_method?: string;
  payment_provider: string;
  paid_at: string;
  created_at: string;
}

export interface Commission {
  id: string;
  payment_id: string;
  company_id: string;
  quote_id: string;
  commission_percentage: number;
  commission_amount: number;
  status: CommissionStatus;
  email_sent_at?: string;
  invoice_received_at?: string;
  invoice_reference?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentAuditLog {
  id: string;
  event_type: AuditEventType;
  quote_id?: string;
  payment_id?: string;
  commission_id?: string;
  user_id?: string;
  company_id?: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Quote creation payload
export interface CreateQuotePayload {
  project_id: string;
  project_name: string;
  company_id: string;
  client_contact_name: string;
  client_contact_email: string;
  amount: number;
}
