// Monitor Project Store - Project data for OxiCloud Monitor (Government)

export interface EmissionSource {
  id: string;
  name: string;
  type: string;
  emissionRate?: number;
  unit?: string;
}

export interface MonitorProject {
  id: string;
  referenceNumber: string;
  projectName: string;
  projectType: string;
  projectSubtype: string;
  developer: string;
  architect: string;
  architectFirm: string;
  address: string;
  municipality: string;
  // KDW / Natura 2000
  natura2000Site: string;
  natura2000Code: string;
  spzH: string;
  closestDistanceToHabitat: number;
  // Emission sources (up to 6)
  emissionSources: EmissionSource[];
  // Validation
  validationStatus: 'pending' | 'processing' | 'validated' | 'not_validated' | 'conditional';
  validationLevel?: string;
  validationResult?: string;
  validationDate?: string;
  validatedBy?: string;
  // Confirmation
  confirmationNote?: string;
  confirmationSignedBy?: string;
  confirmationSignedDate?: string;
  pdfExported?: boolean;
  // Meta
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  uploadedFileName?: string;
  source: 'upload' | 'manual';
}

const STORE_KEY = 'oxicloud_monitor_projects';

const defaultProjects: MonitorProject[] = [
  {
    id: 'mon-001',
    referenceNumber: 'OMV-2025-0142',
    projectName: 'Sociale Woningen Aarschot-Zuid',
    projectType: 'Residential Development',
    projectSubtype: 'Social Housing',
    developer: 'Matexi NV',
    architect: 'Jan Vermeersch',
    architectFirm: 'GDesign Architects BVBA',
    address: 'Leuvensesteenweg 45, 3200 Aarschot',
    municipality: 'Aarschot',
    natura2000Site: 'Demervallei',
    natura2000Code: 'BE2400012',
    spzH: 'Zone A',
    closestDistanceToHabitat: 0.85,
    emissionSources: [
      { id: 'es1', name: 'Verwarming gasketel', type: 'Stationary', emissionRate: 12.4, unit: 'kg NOx/year' },
      { id: 'es2', name: 'Verkeer bouwfase', type: 'Mobile', emissionRate: 8.2, unit: 'kg NOx/year' },
    ],
    validationStatus: 'validated',
    validationLevel: 'Compliant - Below KDW threshold',
    validationResult: 'The NOx assessment for this project demonstrates compliance with current regulatory thresholds. The calculated impact percentage (0.42%) remains well below the 1% significance threshold for the nearest Natura 2000 habitat directive area.',
    validationDate: '2025-02-15',
    validatedBy: 'Koen Vandenberg',
    confirmationNote: 'De gemeente Aarschot bevestigt de beoordeling en validatie van het project sociale woningen door projectontwikkelaar Matexi NV, ontworpen door architectenbureau GDesign Architects BVBA.',
    confirmationSignedBy: 'Koen Vandenberg',
    confirmationSignedDate: '2025-02-16',
    pdfExported: true,
    createdAt: '2025-02-10',
    updatedAt: '2025-02-16',
    createdBy: 'Koen Vandenberg',
    source: 'upload',
    uploadedFileName: 'NOx_Report_Aarschot_Zuid.pdf',
  },
  {
    id: 'mon-002',
    referenceNumber: 'OMV-2025-0198',
    projectName: 'Kantoorgebouw Haven Antwerpen',
    projectType: 'Commercial Office',
    projectSubtype: 'Office Building',
    developer: 'Immobel SA',
    architect: 'Marie Claessens',
    architectFirm: 'BURO+ Architecture',
    address: 'Havenstraat 120, 2000 Antwerpen',
    municipality: 'Antwerpen',
    natura2000Site: 'Scheldevallei',
    natura2000Code: 'BE2300006',
    spzH: 'Zone B',
    closestDistanceToHabitat: 2.1,
    emissionSources: [
      { id: 'es1', name: 'HVAC systeem', type: 'Stationary', emissionRate: 18.6, unit: 'kg NOx/year' },
      { id: 'es2', name: 'Noodgenerator', type: 'Stationary', emissionRate: 5.3, unit: 'kg NOx/year' },
      { id: 'es3', name: 'Parkeerverkeer', type: 'Mobile', emissionRate: 22.1, unit: 'kg NOx/year' },
    ],
    validationStatus: 'pending',
    createdAt: '2025-03-01',
    updatedAt: '2025-03-01',
    createdBy: 'Els De Smedt',
    source: 'upload',
    uploadedFileName: 'NOx_Haven_Antwerpen.pdf',
  },
  {
    id: 'mon-003',
    referenceNumber: 'OMV-2025-0215',
    projectName: 'Renovatie Klooster Mechelen',
    projectType: 'Residential Renovation',
    projectSubtype: 'Heritage Renovation',
    developer: 'Stad Mechelen',
    architect: 'Peter Janssens',
    architectFirm: 'Janssens & Partners',
    address: 'Kloosterstraat 8, 2800 Mechelen',
    municipality: 'Mechelen',
    natura2000Site: 'Mechelse Heide',
    natura2000Code: 'BE2100024',
    spzH: 'Zone A',
    closestDistanceToHabitat: 0.6,
    emissionSources: [
      { id: 'es1', name: 'Gasketel renovatie', type: 'Stationary', emissionRate: 6.8, unit: 'kg NOx/year' },
    ],
    validationStatus: 'conditional',
    validationLevel: 'Conditional - Requires additional mitigation measures',
    validationResult: 'The project is located within 0.6 km of a Natura 2000 habitat. While the calculated NOx contribution (0.78%) is below the 1% threshold, the proximity warrants additional mitigation measures during the construction phase.',
    validationDate: '2025-03-05',
    validatedBy: 'Pieter De Groote',
    createdAt: '2025-03-02',
    updatedAt: '2025-03-05',
    createdBy: 'Pieter De Groote',
    source: 'manual',
  },
];

export function getMonitorProjects(): MonitorProject[] {
  const stored = localStorage.getItem(STORE_KEY);
  if (!stored) {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultProjects));
    return defaultProjects;
  }
  return JSON.parse(stored);
}

export function saveMonitorProjects(projects: MonitorProject[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(projects));
}

export function getMonitorProjectById(id: string): MonitorProject | undefined {
  return getMonitorProjects().find(p => p.id === id);
}

export function addMonitorProject(project: MonitorProject): void {
  const projects = getMonitorProjects();
  projects.unshift(project);
  saveMonitorProjects(projects);
}

export function updateMonitorProject(id: string, updates: Partial<MonitorProject>): void {
  const projects = getMonitorProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
    saveMonitorProjects(projects);
  }
}
