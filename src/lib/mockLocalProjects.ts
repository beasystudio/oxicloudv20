/**
 * Mock Local Projects Database
 * Uses localStorage for persistence (demo mode)
 */

export interface LocalProject {
  id: string;
  name: string;
  code: string;
  projectNumber: string;
  status: string;
  statusId: string;
  managerId: string;
  managerName: string;
  managerRole: string;
  projectType: string;
  projectTypeId: string;
  phaseId: string;
  phaseName: string;
  mission: string;
  description: string;
  location: string;
  photoUrl: string | null;
  scheduleId: string;
  scheduleName: string;
  phaseHours: PhaseHours[];
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
}

export interface PhaseHours {
  phaseId: string;
  phaseName: string;
  abbreviation: string;
  color: string;
  currentHours: number;
  maxHours: number;
}

export interface ProjectContact {
  id: string;
  projectId: string;
  contactId: string;
  contactName: string;
  contactType: 'client' | 'team' | 'external_team' | 'contractor' | 'others';
  company: string;
  phone: string;
  gsm: string;
  email: string;
  firstName?: string;
  lastName?: string;
  invoiceAddress?: string;
  correspondenceAddress?: string;
  otherAddress?: string;
  function?: string;
  vatNumber?: string;
  workPhone?: string;
}

const STORAGE_KEY = 'oxicloud_local_projects';
const PROJECT_CONTACTS_KEY = 'oxicloud_project_contacts';

export function getAllLocalProjects(): LocalProject[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
      return value;
    });
  }
  return [];
}

export function getLocalProjectById(id: string): LocalProject | null {
  const projects = getAllLocalProjects();
  return projects.find(p => p.id === id) || null;
}

// Create a project with optional specified ID (for demo seeding)
export function createLocalProject(project: Omit<LocalProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): LocalProject {
  const projects = getAllLocalProjects();
  
  // Check for unique project number
  if (projects.some(p => p.projectNumber === project.projectNumber)) {
    throw new Error('Project number must be unique');
  }
  
  const newProject: LocalProject = {
    ...project,
    id: project.id || crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return newProject;
}

export function updateLocalProject(id: string, updates: Partial<LocalProject>): LocalProject | null {
  const projects = getAllLocalProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  projects[index] = { ...projects[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}

export function deleteLocalProject(id: string): boolean {
  const projects = getAllLocalProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Project Contacts
export function getProjectContacts(projectId: string): ProjectContact[] {
  const stored = localStorage.getItem(PROJECT_CONTACTS_KEY);
  if (stored) {
    const all = JSON.parse(stored) as ProjectContact[];
    return all.filter(c => c.projectId === projectId);
  }
  return [];
}

export function addProjectContact(contact: Omit<ProjectContact, 'id'>): ProjectContact {
  const stored = localStorage.getItem(PROJECT_CONTACTS_KEY);
  const contacts: ProjectContact[] = stored ? JSON.parse(stored) : [];
  
  const newContact: ProjectContact = {
    ...contact,
    id: crypto.randomUUID()
  };
  contacts.push(newContact);
  localStorage.setItem(PROJECT_CONTACTS_KEY, JSON.stringify(contacts));
  return newContact;
}

export function updateProjectPhaseHours(projectId: string, phaseId: string, hours: number): void {
  const projects = getAllLocalProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index === -1) return;
  
  const phaseIndex = projects[index].phaseHours.findIndex(ph => ph.phaseId === phaseId);
  if (phaseIndex !== -1) {
    projects[index].phaseHours[phaseIndex].currentHours = hours;
    projects[index].updatedAt = new Date();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
}

// Seed demo projects with stable IDs (synced with mockCompanyDB.ts)
export function seedDemoLocalProject(forceReseed: boolean = false): void {
  // Always clean up removed demo projects from cached data
  const existingProjects = getAllLocalProjects();
  const removedIds = ['proj-gdesign-demo-empty'];
  const cleaned = existingProjects.filter(p => !removedIds.includes(p.id));
  if (cleaned.length !== existingProjects.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    // Also clean up nox data for removed projects
    const noxKey = 'nox_project_data';
    const noxStored = localStorage.getItem(noxKey);
    if (noxStored) {
      const noxData = JSON.parse(noxStored);
      const cleanedNox = noxData.filter((d: any) => !removedIds.includes(d.projectId));
      localStorage.setItem(noxKey, JSON.stringify(cleanedNox));
    }
  }

  const projects = getAllLocalProjects();
  if (projects.length > 0 && !forceReseed) return;
  
  // Clear existing data if reseeding
  if (forceReseed) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROJECT_CONTACTS_KEY);
  }
  
  // 4 demo projects: 3 for GDesign, 1 for 4TAKT
  // IDs match mockCompanyDB.ts for cross-module consistency
  const demoProjects: (Omit<LocalProject, 'createdAt' | 'updatedAt'>)[] = [
    {
      id: 'proj-gdesign-001',
      name: 'Pauwels Herent',
      code: 'Standard Residential',
      projectNumber: '2025-001',
      status: 'Open',
      statusId: '',
      managerId: '',
      managerName: 'Geoffrey Draelants',
      managerRole: 'Project Manager',
      projectType: 'Residential',
      projectTypeId: '',
      phaseId: '',
      phaseName: 'Voorstudie',
      mission: 'New residential building with planning permit and technical drawings',
      description: 'Residential project for Pauwels NV in Herent',
      location: 'Luchthavenlaan 16-18, 1800 Vilvoorde, Belgium',
      photoUrl: null,
      scheduleId: '',
      scheduleName: 'Standard Residential',
      companyId: 'gdesign',
      phaseHours: [
        { phaseId: '1', phaseName: 'Voorstudie', abbreviation: 'VST', color: '#3b82f6', currentHours: 25, maxHours: 30 },
        { phaseId: '2', phaseName: 'Voorontwerp', abbreviation: 'VOO', color: '#8b5cf6', currentHours: 10, maxHours: 45 },
        { phaseId: '3', phaseName: 'Aanbesteding', abbreviation: 'ABT', color: '#ec4899', currentHours: 0, maxHours: 30 },
        { phaseId: '4', phaseName: 'Uitvoering', abbreviation: 'UTV', color: '#f97316', currentHours: 0, maxHours: 150 },
        { phaseId: '5', phaseName: 'Oplevering', abbreviation: 'OPL', color: '#22c55e', currentHours: 0, maxHours: 45 }
      ]
    },
    {
      id: 'proj-gdesign-002',
      name: 'Office Tower Brussels',
      code: 'Commercial Large',
      projectNumber: '2025-002',
      status: 'In Progress',
      statusId: '',
      managerId: '',
      managerName: 'Marie Peeters',
      managerRole: 'Senior Project Manager',
      projectType: 'Commercial',
      projectTypeId: '',
      phaseId: '',
      phaseName: 'Uitvoering',
      mission: 'High-rise office building with sustainable design and BREEAM certification',
      description: 'Modern office tower development in Brussels business district',
      location: 'Boulevard du Roi Albert II 30, 1000 Brussels, Belgium',
      photoUrl: null,
      scheduleId: '',
      scheduleName: 'Commercial Large',
      companyId: 'gdesign',
      phaseHours: [
        { phaseId: '1', phaseName: 'Voorstudie', abbreviation: 'VST', color: '#3b82f6', currentHours: 50, maxHours: 50 },
        { phaseId: '2', phaseName: 'Voorontwerp', abbreviation: 'VOO', color: '#8b5cf6', currentHours: 80, maxHours: 80 },
        { phaseId: '3', phaseName: 'Aanbesteding', abbreviation: 'ABT', color: '#ec4899', currentHours: 40, maxHours: 40 },
        { phaseId: '4', phaseName: 'Uitvoering', abbreviation: 'UTV', color: '#f97316', currentHours: 120, maxHours: 300 },
        { phaseId: '5', phaseName: 'Oplevering', abbreviation: 'OPL', color: '#22c55e', currentHours: 0, maxHours: 60 }
      ]
    },
    {
      id: 'proj-gdesign-003',
      name: 'Renovatie Villa Mechelen',
      code: 'Renovation Heritage',
      projectNumber: '2025-003',
      status: 'On Hold',
      statusId: '',
      managerId: '',
      managerName: 'Thomas Willems',
      managerRole: 'Project Manager',
      projectType: 'Renovation',
      projectTypeId: '',
      phaseId: '',
      phaseName: 'Voorontwerp',
      mission: 'Heritage villa restoration with modern amenities preservation',
      description: 'Careful renovation of protected heritage villa from 1920s',
      location: 'Koningin Astridlaan 45, 2800 Mechelen, Belgium',
      photoUrl: null,
      scheduleId: '',
      scheduleName: 'Renovation Standard',
      companyId: 'gdesign',
      phaseHours: [
        { phaseId: '1', phaseName: 'Voorstudie', abbreviation: 'VST', color: '#3b82f6', currentHours: 35, maxHours: 35 },
        { phaseId: '2', phaseName: 'Voorontwerp', abbreviation: 'VOO', color: '#8b5cf6', currentHours: 20, maxHours: 60 },
        { phaseId: '3', phaseName: 'Aanbesteding', abbreviation: 'ABT', color: '#ec4899', currentHours: 0, maxHours: 25 },
        { phaseId: '4', phaseName: 'Uitvoering', abbreviation: 'UTV', color: '#f97316', currentHours: 0, maxHours: 200 },
        { phaseId: '5', phaseName: 'Oplevering', abbreviation: 'OPL', color: '#22c55e', currentHours: 0, maxHours: 40 }
      ]
    },
    {
      id: 'proj-4takt-001',
      name: 'School Campus Gent',
      code: 'Public Infrastructure',
      projectNumber: '2024-015',
      status: 'Completed',
      statusId: '',
      managerId: '',
      managerName: 'Lisa Van den Berg',
      managerRole: 'Lead Architect',
      projectType: 'Public',
      projectTypeId: '',
      phaseId: '',
      phaseName: 'Oplevering',
      mission: 'New primary school with sports facilities and playground',
      description: 'Public school campus with sustainable energy systems',
      location: 'Schoolstraat 12, 9000 Gent, Belgium',
      photoUrl: null,
      scheduleId: '',
      scheduleName: 'Public Project',
      companyId: '4takt',
      phaseHours: [
        { phaseId: '1', phaseName: 'Voorstudie', abbreviation: 'VST', color: '#3b82f6', currentHours: 45, maxHours: 45 },
        { phaseId: '2', phaseName: 'Voorontwerp', abbreviation: 'VOO', color: '#8b5cf6', currentHours: 70, maxHours: 70 },
        { phaseId: '3', phaseName: 'Aanbesteding', abbreviation: 'ABT', color: '#ec4899', currentHours: 35, maxHours: 35 },
        { phaseId: '4', phaseName: 'Uitvoering', abbreviation: 'UTV', color: '#f97316', currentHours: 250, maxHours: 250 },
        { phaseId: '5', phaseName: 'Oplevering', abbreviation: 'OPL', color: '#22c55e', currentHours: 50, maxHours: 50 }
      ]
    }
  ];
  
  // Create all projects with their stable IDs
  demoProjects.forEach(project => {
    const { id, ...rest } = project;
    createLocalProject({ ...rest, id });
  });
  
  // Add contacts to all projects
  const createdProjects = getAllLocalProjects();
  createdProjects.forEach((project, index) => {
    seedProjectContactsForProject(project.id, index);
  });
}

// Seed contacts for each project with variety
// Includes internal team members from the owning company (GDesign or 4TAKT)
function seedProjectContactsForProject(projectId: string, projectIndex: number): void {
  const contactSets: Omit<ProjectContact, 'id'>[][] = [
    // Project 1: Pauwels Herent - Residential (GDesign)
    [
      // Internal GDesign Team
      { projectId, contactId: 'gd-1', contactName: 'Jan Vermeersch', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 456', gsm: '+32 475 123 001', email: 'jan@gdesign.be', firstName: 'Jan', lastName: 'Vermeersch', function: 'Managing Director' },
      { projectId, contactId: 'gd-4', contactName: 'Thomas Janssen', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 459', gsm: '+32 475 123 004', email: 'thomas@gdesign.be', firstName: 'Thomas', lastName: 'Janssen', function: 'Senior Architect' },
      { projectId, contactId: 'gd-3', contactName: 'Lisa De Smet', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 458', gsm: '+32 475 123 003', email: 'lisa@gdesign.be', firstName: 'Lisa', lastName: 'De Smet', function: 'Junior Architect' },
      // External contacts
      { projectId, contactId: 'artebeau-1', contactName: 'Vincent Meerschaert', contactType: 'client', company: 'Artebeau BV', phone: '+32 2 123 456', gsm: '+32 475 123 456', email: 'vincent@artebeau.be', firstName: 'Vincent', lastName: 'Meerschaert', invoiceAddress: 'Client Avenue 10, 1000 Brussels', function: 'Project Owner', vatNumber: 'BE0987654321' },
      { projectId, contactId: 'artebeau-2', contactName: 'Steven Broos', contactType: 'client', company: 'Artebeau BV', phone: '+32 2 123 457', gsm: '+32 475 123 457', email: 'steven.broos@artebeau.be', firstName: 'Steven', lastName: 'Broos', function: 'Technical Manager' },
      { projectId, contactId: 'elektricien-1', contactName: 'Jan Pieters', contactType: 'contractor', company: 'Elektricien NV', phone: '+32 3 123 456', gsm: '+32 479 123 456', email: 'jan@elektricien.be', firstName: 'Jan', lastName: 'Pieters', invoiceAddress: 'Volt Street 100, 2000 Antwerp', function: 'Electrician', vatNumber: 'BE0555666777' },
    ],
    // Project 2: Office Tower Brussels - Commercial (GDesign)
    [
      // Internal GDesign Team
      { projectId, contactId: 'gd-2', contactName: 'Maria Peeters', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 457', gsm: '+32 475 123 002', email: 'maria@gdesign.be', firstName: 'Maria', lastName: 'Peeters', function: 'Office Manager' },
      { projectId, contactId: 'gd-5', contactName: 'Emma Van Damme', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 460', gsm: '+32 475 123 005', email: 'emma@gdesign.be', firstName: 'Emma', lastName: 'Van Damme', function: 'Project Coordinator' },
      // External contacts
      { projectId, contactId: 'immobel-1', contactName: 'Immobel SA', contactType: 'client', company: 'Immobel SA', phone: '+32 2 422 5511', gsm: '+32 470 111 222', email: 'projects@immobel.be', invoiceAddress: 'Rue de la Régence 58, 1000 Brussels', function: 'Developer', vatNumber: 'BE0405966675' },
      { projectId, contactId: 'jaspers-1', contactName: 'Jaspers-Eyers Architects', contactType: 'external_team', company: 'Jaspers-Eyers Architects', phone: '+32 2 640 6070', gsm: '+32 471 222 333', email: 'office@jaspers-eyers.be', function: 'Lead Architect', vatNumber: 'BE0427243449' },
      { projectId, contactId: 'besix-1', contactName: 'BESIX Group', contactType: 'contractor', company: 'BESIX SA', phone: '+32 2 402 6211', gsm: '+32 472 333 444', email: 'info@besix.com', invoiceAddress: 'Avenue des Communautés 100, 1200 Brussels', function: 'General Contractor', vatNumber: 'BE0400378530' },
      { projectId, contactId: 'tractebel-1', contactName: 'Tractebel Engineering', contactType: 'external_team', company: 'Tractebel Engineering SA', phone: '+32 2 773 9111', gsm: '+32 473 444 555', email: 'info@tractebel.engie.com', function: 'MEP Engineer', vatNumber: 'BE0412639681' },
    ],
    // Project 3: Renovatie Villa Mechelen - Renovation (GDesign)
    [
      // Internal GDesign Team
      { projectId, contactId: 'gd-4-p3', contactName: 'Thomas Janssen', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 459', gsm: '+32 475 123 004', email: 'thomas@gdesign.be', firstName: 'Thomas', lastName: 'Janssen', function: 'Senior Architect' },
      { projectId, contactId: 'gd-6', contactName: 'Pieter Maes', contactType: 'team', company: 'GDesign Architecten', phone: '+32 16 123 461', gsm: '+32 475 123 006', email: 'pieter@gdesign.be', firstName: 'Pieter', lastName: 'Maes', function: 'Technical Draftsman' },
      // External contacts
      { projectId, contactId: 'heritage-1', contactName: 'Erfgoed Vlaanderen', contactType: 'others', company: 'Agentschap Onroerend Erfgoed', phone: '+32 2 553 1650', gsm: '', email: 'info@onroerenderfgoed.be', function: 'Heritage Authority' },
      { projectId, contactId: 'vandenberghe-1', contactName: 'Familie Van den Berghe', contactType: 'client', company: 'Private Owner', phone: '+32 15 123 456', gsm: '+32 475 666 777', email: 'vandenberghe.family@gmail.com', function: 'Property Owner' },
      { projectId, contactId: 'resto-1', contactName: 'Restoration Experts BVBA', contactType: 'contractor', company: 'Restoration Experts BVBA', phone: '+32 15 789 012', gsm: '+32 476 777 888', email: 'info@restoexperts.be', invoiceAddress: 'Ambachtstraat 25, 2800 Mechelen', function: 'Restoration Contractor', vatNumber: 'BE0654321987' },
      { projectId, contactId: 'historic-1', contactName: 'Historic Interiors', contactType: 'external_team', company: 'Historic Interiors NV', phone: '+32 15 345 678', gsm: '+32 477 888 999', email: 'design@historicinteriors.be', function: 'Interior Designer' },
    ],
    // Project 4: School Campus Gent - Public (4TAKT)
    [
      // Internal 4TAKT Team
      { projectId, contactId: '4t-1', contactName: 'Karel Wouters', contactType: 'team', company: '4TAKT', phone: '+32 15 789 001', gsm: '+32 478 789 001', email: 'karel@4takt.be', firstName: 'Karel', lastName: 'Wouters', function: 'CEO' },
      { projectId, contactId: '4t-4', contactName: 'Inge Willems', contactType: 'team', company: '4TAKT', phone: '+32 15 789 004', gsm: '+32 478 789 004', email: 'inge@4takt.be', firstName: 'Inge', lastName: 'Willems', function: 'Lead Engineer' },
      { projectId, contactId: '4t-6', contactName: 'Eva Martens', contactType: 'team', company: '4TAKT', phone: '+32 15 789 006', gsm: '+32 478 789 006', email: 'eva@4takt.be', firstName: 'Eva', lastName: 'Martens', function: 'Project Manager' },
      // External contacts
      { projectId, contactId: 'stadgent-1', contactName: 'Stad Gent - Dienst Facility', contactType: 'client', company: 'Stad Gent', phone: '+32 9 266 7000', gsm: '', email: 'facility@gent.be', invoiceAddress: 'Botermarkt 1, 9000 Gent', function: 'Public Client' },
      { projectId, contactId: 'vanhout-1', contactName: 'Van Hout NV', contactType: 'contractor', company: 'Van Hout NV', phone: '+32 14 26 99 00', gsm: '+32 478 999 000', email: 'info@vanhout.be', invoiceAddress: 'Lammerdries 12, 2440 Geel', function: 'General Contractor', vatNumber: 'BE0425089688' },
      { projectId, contactId: 'abscis-1', contactName: 'Abscis Architecten', contactType: 'external_team', company: 'Abscis Architecten BVBA', phone: '+32 9 233 0826', gsm: '+32 479 000 111', email: 'info@abscis.be', function: 'Architect', vatNumber: 'BE0474215397' },
      { projectId, contactId: 'studiebureau-1', contactName: 'Studiebureau Boydens', contactType: 'external_team', company: 'Boydens Engineering NV', phone: '+32 9 267 0800', gsm: '+32 470 111 222', email: 'info@boydens.be', function: 'Structural Engineer', vatNumber: 'BE0425710728' },
      { projectId, contactId: 'schooldir-1', contactName: 'Jan Claessens', contactType: 'others', company: 'GO! Onderwijs', phone: '+32 9 111 2222', gsm: '+32 471 222 333', email: 'jan.claessens@g-o.be', firstName: 'Jan', lastName: 'Claessens', function: 'School Director' },
    ]
  ];
  
  const contacts = contactSets[projectIndex] || [];
  contacts.forEach(contact => addProjectContact(contact));
}
