/**
 * Mock Database for Project Settings
 * Uses localStorage for persistence (mock only)
 */

import { 
  ProjectType, 
  ProjectStatus, 
  ProjectPhase, 
  ProjectSchedule, 
  SchedulePhase,
  EmployeeRole,
  DEFAULT_PROJECT_TYPES,
  DEFAULT_PROJECT_STATUSES,
  DEFAULT_PROJECT_PHASES
} from '@/types/projectSettings';

const STORAGE_KEYS = {
  PROJECT_TYPES: 'oxicloud_project_types',
  PROJECT_STATUSES: 'oxicloud_project_statuses',
  PROJECT_PHASES: 'oxicloud_project_phases',
  PROJECT_SCHEDULES: 'oxicloud_project_schedules',
  EMPLOYEE_ROLES: 'oxicloud_employee_roles'
};

// ============ PROJECT TYPES CRUD ============

export function getAllProjectTypes(): ProjectType[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_TYPES);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    });
  }
  
  // Initialize with defaults
  const defaults: ProjectType[] = DEFAULT_PROJECT_TYPES.map(t => ({
    ...t,
    id: crypto.randomUUID(),
    createdAt: new Date()
  }));
  localStorage.setItem(STORAGE_KEYS.PROJECT_TYPES, JSON.stringify(defaults));
  return defaults;
}

export function createProjectType(type: Omit<ProjectType, 'id' | 'createdAt'>): ProjectType {
  const types = getAllProjectTypes();
  const newType: ProjectType = {
    ...type,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  types.push(newType);
  localStorage.setItem(STORAGE_KEYS.PROJECT_TYPES, JSON.stringify(types));
  return newType;
}

export function updateProjectType(id: string, updates: Partial<ProjectType>): ProjectType | null {
  const types = getAllProjectTypes();
  const index = types.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  types[index] = { ...types[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PROJECT_TYPES, JSON.stringify(types));
  return types[index];
}

export function deleteProjectType(id: string): boolean {
  const types = getAllProjectTypes();
  const filtered = types.filter(t => t.id !== id);
  if (filtered.length === types.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PROJECT_TYPES, JSON.stringify(filtered));
  return true;
}

// ============ PROJECT STATUSES CRUD ============

export function getAllProjectStatuses(): ProjectStatus[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_STATUSES);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    });
  }
  
  const defaults: ProjectStatus[] = DEFAULT_PROJECT_STATUSES.map(s => ({
    ...s,
    id: crypto.randomUUID(),
    createdAt: new Date()
  }));
  localStorage.setItem(STORAGE_KEYS.PROJECT_STATUSES, JSON.stringify(defaults));
  return defaults;
}

export function createProjectStatus(status: Omit<ProjectStatus, 'id' | 'createdAt'>): ProjectStatus {
  const statuses = getAllProjectStatuses();
  const newStatus: ProjectStatus = {
    ...status,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  statuses.push(newStatus);
  localStorage.setItem(STORAGE_KEYS.PROJECT_STATUSES, JSON.stringify(statuses));
  return newStatus;
}

export function updateProjectStatus(id: string, updates: Partial<ProjectStatus>): ProjectStatus | null {
  const statuses = getAllProjectStatuses();
  const index = statuses.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  statuses[index] = { ...statuses[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PROJECT_STATUSES, JSON.stringify(statuses));
  return statuses[index];
}

export function deleteProjectStatus(id: string): boolean {
  const statuses = getAllProjectStatuses();
  const filtered = statuses.filter(s => s.id !== id);
  if (filtered.length === statuses.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PROJECT_STATUSES, JSON.stringify(filtered));
  return true;
}

// ============ PROJECT PHASES CRUD ============

export function getAllProjectPhases(): ProjectPhase[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_PHASES);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    });
  }
  
  const defaults: ProjectPhase[] = DEFAULT_PROJECT_PHASES.map(p => ({
    ...p,
    id: crypto.randomUUID(),
    createdAt: new Date()
  }));
  localStorage.setItem(STORAGE_KEYS.PROJECT_PHASES, JSON.stringify(defaults));
  return defaults;
}

export function createProjectPhase(phase: Omit<ProjectPhase, 'id' | 'createdAt'>): ProjectPhase {
  const phases = getAllProjectPhases();
  const newPhase: ProjectPhase = {
    ...phase,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  phases.push(newPhase);
  localStorage.setItem(STORAGE_KEYS.PROJECT_PHASES, JSON.stringify(phases));
  return newPhase;
}

export function updateProjectPhase(id: string, updates: Partial<ProjectPhase>): ProjectPhase | null {
  const phases = getAllProjectPhases();
  const index = phases.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  phases[index] = { ...phases[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PROJECT_PHASES, JSON.stringify(phases));
  return phases[index];
}

export function deleteProjectPhase(id: string): boolean {
  const phases = getAllProjectPhases();
  const filtered = phases.filter(p => p.id !== id);
  if (filtered.length === phases.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PROJECT_PHASES, JSON.stringify(filtered));
  return true;
}

// ============ PROJECT SCHEDULES CRUD ============

export function getAllProjectSchedules(): ProjectSchedule[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_SCHEDULES);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt' || key === 'startDate' || key === 'endDate') {
        return value ? new Date(value) : null;
      }
      return value;
    });
  }
  return [];
}

export function createProjectSchedule(schedule: Omit<ProjectSchedule, 'id' | 'createdAt'>): ProjectSchedule {
  const schedules = getAllProjectSchedules();
  const newSchedule: ProjectSchedule = {
    ...schedule,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  schedules.push(newSchedule);
  localStorage.setItem(STORAGE_KEYS.PROJECT_SCHEDULES, JSON.stringify(schedules));
  return newSchedule;
}

export function updateProjectSchedule(id: string, updates: Partial<ProjectSchedule>): ProjectSchedule | null {
  const schedules = getAllProjectSchedules();
  const index = schedules.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  schedules[index] = { ...schedules[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PROJECT_SCHEDULES, JSON.stringify(schedules));
  return schedules[index];
}

export function deleteProjectSchedule(id: string): boolean {
  const schedules = getAllProjectSchedules();
  const filtered = schedules.filter(s => s.id !== id);
  if (filtered.length === schedules.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PROJECT_SCHEDULES, JSON.stringify(filtered));
  return true;
}

// ============ EMPLOYEE ROLES CRUD ============

export function getAllEmployeeRoles(): EmployeeRole[] {
  const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEE_ROLES);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt' || key === 'effectiveFrom') return new Date(value);
      return value;
    });
  }
  return [];
}

export function createEmployeeRole(role: Omit<EmployeeRole, 'id' | 'createdAt'>): EmployeeRole {
  const roles = getAllEmployeeRoles();
  const newRole: EmployeeRole = {
    ...role,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  roles.push(newRole);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEE_ROLES, JSON.stringify(roles));
  return newRole;
}

export function updateEmployeeRole(id: string, updates: Partial<EmployeeRole>): EmployeeRole | null {
  const roles = getAllEmployeeRoles();
  const index = roles.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  roles[index] = { ...roles[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.EMPLOYEE_ROLES, JSON.stringify(roles));
  return roles[index];
}

export function deleteEmployeeRole(id: string): boolean {
  const roles = getAllEmployeeRoles();
  const filtered = roles.filter(r => r.id !== id);
  if (filtered.length === roles.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.EMPLOYEE_ROLES, JSON.stringify(filtered));
  return true;
}

// ============ SETTINGS CHECK ============

export function areProjectSettingsComplete(): boolean {
  const types = getAllProjectTypes();
  const statuses = getAllProjectStatuses();
  const phases = getAllProjectPhases();
  
  return types.length > 0 && statuses.length > 0 && phases.length > 0;
}

// ============ DEMO DATA ============

export function seedDemoProjectSettings(): void {
  // Types, statuses, phases are auto-initialized with defaults
  getAllProjectTypes();
  getAllProjectStatuses();
  getAllProjectPhases();
  
  // Create demo schedule
  const phases = getAllProjectPhases();
  const schedulePhases: SchedulePhase[] = phases.map((p, index) => ({
    id: crypto.randomUUID(),
    phaseId: p.id,
    admin: p.admin,
    invoice: p.invoice,
    type: p.type,
    value: p.value,
    inServiceFee: p.inServiceFee,
    startDate: null,
    endDate: null,
    order: index + 1
  }));
  
  createProjectSchedule({
    name: 'Standard Residential',
    phases: schedulePhases
  });
  
  createProjectSchedule({
    name: 'Matexi Schedule',
    phases: schedulePhases.map(p => ({ ...p, id: crypto.randomUUID() }))
  });
  
  // Create demo employee roles
  createEmployeeRole({
    companyId: 'gdesign',
    companyName: 'GDesign Architecten',
    roleName: 'Senior Architect',
    dailyRate: 650,
    effectiveFrom: new Date()
  });
  
  createEmployeeRole({
    companyId: 'gdesign',
    companyName: 'GDesign Architecten',
    roleName: 'Project Manager',
    dailyRate: 750,
    effectiveFrom: new Date()
  });
  
  createEmployeeRole({
    companyId: 'gdesign',
    companyName: 'GDesign Architecten',
    roleName: 'Junior Architect',
    dailyRate: 450,
    effectiveFrom: new Date()
  });
}

export function clearAllProjectSettings(): void {
  localStorage.removeItem(STORAGE_KEYS.PROJECT_TYPES);
  localStorage.removeItem(STORAGE_KEYS.PROJECT_STATUSES);
  localStorage.removeItem(STORAGE_KEYS.PROJECT_PHASES);
  localStorage.removeItem(STORAGE_KEYS.PROJECT_SCHEDULES);
  localStorage.removeItem(STORAGE_KEYS.EMPLOYEE_ROLES);
}
