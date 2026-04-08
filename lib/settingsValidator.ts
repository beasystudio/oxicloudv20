/**
 * Settings Validation Utilities
 * Check if all 4 settings modules are complete before allowing project creation
 */

import { getAllProjectTypes, getAllProjectStatuses, getAllProjectPhases, getAllProjectSchedules, getAllEmployeeRoles } from './mockProjectSettingsDB';
import { getAllContacts, getAllTaxonomy, getAllProjectRoles } from './mockContactDB';

const COMPANY_SETTINGS_KEY = 'oxicloud_company_settings';
const USER_SETTINGS_KEY = 'oxicloud_users';

export interface SettingsStatus {
  company: boolean;
  users: boolean;
  contacts: boolean;
  projects: boolean;
  allComplete: boolean;
}

export function checkCompanySettings(): boolean {
  // Check both possible keys for company settings
  const stored = localStorage.getItem('oxicloud_company_settings') || localStorage.getItem('companySettings');
  if (!stored) return false;
  try {
    const data = JSON.parse(stored);
    // Check for either format
    return !!(data.companyName?.trim().length > 0 || data.name?.trim().length > 0);
  } catch {
    return false;
  }
}

export function checkUserSettings(): boolean {
  const stored = localStorage.getItem(USER_SETTINGS_KEY);
  if (!stored) return false;
  try {
    const users = JSON.parse(stored);
    return Array.isArray(users) && users.length > 0;
  } catch {
    return false;
  }
}

export function checkContactSettings(): boolean {
  const taxonomy = getAllTaxonomy();
  const roles = getAllProjectRoles();
  const contacts = getAllContacts();
  return taxonomy.length > 0 && roles.length > 0;
}

export function checkProjectSettings(): boolean {
  const types = getAllProjectTypes();
  const statuses = getAllProjectStatuses();
  const phases = getAllProjectPhases();
  const schedules = getAllProjectSchedules();
  // For demo mode, schedules might be empty but types/statuses/phases have defaults
  return types.length > 0 && statuses.length > 0 && phases.length > 0;
}

export function getSettingsStatus(): SettingsStatus {
  const company = checkCompanySettings();
  const users = checkUserSettings();
  const contacts = checkContactSettings();
  const projects = checkProjectSettings();
  
  return {
    company,
    users,
    contacts,
    projects,
    allComplete: company && users && contacts && projects
  };
}

export function getMissingSettings(): string[] {
  const status = getSettingsStatus();
  const missing: string[] = [];
  
  if (!status.company) missing.push('Company Settings');
  if (!status.users) missing.push('User Settings');
  if (!status.contacts) missing.push('Contacts Settings');
  if (!status.projects) missing.push('Project Settings');
  
  return missing;
}
