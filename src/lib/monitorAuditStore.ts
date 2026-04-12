// Monitor Audit Store - Full action logging for OxiCloud Monitor

export interface MonitorAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  municipality: string;
  action: 'file_upload' | 'project_created' | 'data_entry' | 'validation_started' | 'validation_completed' | 'confirmation_signed' | 'pdf_exported' | 'project_viewed' | 'field_updated';
  category: 'upload' | 'project' | 'validation' | 'confirmation' | 'export' | 'general';
  details: string;
  projectId?: string;
  projectName?: string;
  metadata?: Record<string, unknown>;
}

const STORE_KEY = 'oxicloud_monitor_audit_log';

export function getMonitorAuditLog(): MonitorAuditEntry[] {
  const stored = localStorage.getItem(STORE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addMonitorAuditEntry(entry: Omit<MonitorAuditEntry, 'id' | 'timestamp'>): MonitorAuditEntry {
  const logs = getMonitorAuditLog();
  const newEntry: MonitorAuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newEntry);
  // Keep max 1000 entries
  localStorage.setItem(STORE_KEY, JSON.stringify(logs.slice(0, 1000)));
  return newEntry;
}

export function getAuditLogByProject(projectId: string): MonitorAuditEntry[] {
  return getMonitorAuditLog().filter(e => e.projectId === projectId);
}

export function getAuditLogByCategory(category: MonitorAuditEntry['category']): MonitorAuditEntry[] {
  return getMonitorAuditLog().filter(e => e.category === category);
}

export function clearMonitorAuditLog(): void {
  localStorage.removeItem(STORE_KEY);
}
