// Mock Company Database - Central company management

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  address: string;
  vatNumber: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  createdAt: string;
}

export interface CompanyEmployee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  phone: string;
  startDate: string;
  isActive: boolean;
}

export interface CompanyProject {
  id: string;
  companyId: string;
  name: string;
  projectNumber: string;
  status: 'Open' | 'In Progress' | 'On Hold' | 'Completed';
  manager: string;
  projectType: string;
  location: string;
  startDate: string;
  budget: number;
  progress: number;
}

export interface CompanyContact {
  id: string;
  companyId: string;
  name: string;
  contactType: 'Client' | 'Contractor' | 'Consultant' | 'Supplier' | 'Partner';
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

const COMPANIES_KEY = 'oxicloud_companies';
const EMPLOYEES_KEY = 'oxicloud_company_employees';
const COMPANY_PROJECTS_KEY = 'oxicloud_company_projects';
const COMPANY_CONTACTS_KEY = 'oxicloud_company_contacts';

import { PILOT_COMPANY_ID, PILOT_COMPANY_NAME, PILOT_EMAIL, isPilotCompany } from './pilotAccountUtils';

// Demo companies (GDesign and 4TAKT have demo data, Pilot is empty)
const demoCompanies: Company[] = [
  {
    id: 'gdesign',
    name: 'GDesign Architecten',
    logoUrl: undefined,
    address: 'Architect Street 42, 3000 Leuven, Belgium',
    vatNumber: 'BE0123456789',
    plan: 'Professional',
    createdAt: '2020-03-15'
  },
  {
    id: '4takt',
    name: '4TAKT',
    logoUrl: undefined,
    address: 'Industrieweg 88, 2800 Mechelen, Belgium',
    vatNumber: 'BE0987654321',
    plan: 'Enterprise',
    createdAt: '2019-01-10'
  },
  // Pilot company - always empty, for demo@oxicloud.be first-time user experience
  {
    id: PILOT_COMPANY_ID,
    name: PILOT_COMPANY_NAME,
    logoUrl: undefined,
    address: '',
    vatNumber: '',
    plan: 'Professional',
    createdAt: new Date().toISOString().split('T')[0]
  }
];

// Demo employees for GDesign
const gdesignEmployees: CompanyEmployee[] = [
  { id: 'gd-1', companyId: 'gdesign', name: 'Jan Vermeersch', email: 'jan@gdesign.be', role: 'client_owner', jobTitle: 'Managing Director', phone: '+32 16 123 456', startDate: '2020-03-15', isActive: true },
  { id: 'gd-4', companyId: 'gdesign', name: 'Thomas Janssen', email: 'thomas@gdesign.be', role: 'client_user', jobTitle: 'Senior Architect', phone: '+32 16 123 459', startDate: '2020-04-15', isActive: true },
  { id: 'gd-5', companyId: 'gdesign', name: 'Emma Van Damme', email: 'emma@gdesign.be', role: 'client_user', jobTitle: 'Project Coordinator', phone: '+32 16 123 460', startDate: '2022-01-10', isActive: true },
  { id: 'gd-6', companyId: 'gdesign', name: 'Pieter Maes', email: 'pieter@gdesign.be', role: 'client_user', jobTitle: 'Technical Draftsman', phone: '+32 16 123 461', startDate: '2021-03-01', isActive: true },
];

// Demo employees for 4TAKT
const fourTaktEmployees: CompanyEmployee[] = [
  { id: '4t-1', companyId: '4takt', name: 'Karel Wouters', email: 'karel@4takt.be', role: 'client_owner', jobTitle: 'CEO', phone: '+32 15 789 001', startDate: '2019-01-10', isActive: true },
  { id: '4t-2', companyId: '4takt', name: 'Sophie Hendricks', email: 'sophie@4takt.be', role: 'client_admin', jobTitle: 'Operations Director', phone: '+32 15 789 002', startDate: '2019-02-15', isActive: true },
  { id: '4t-3', companyId: '4takt', name: 'Bart Claes', email: 'bart@4takt.be', role: 'client_admin', jobTitle: 'Finance Manager', phone: '+32 15 789 003', startDate: '2019-03-01', isActive: true },
  { id: '4t-4', companyId: '4takt', name: 'Inge Willems', email: 'inge@4takt.be', role: 'client_user', jobTitle: 'Lead Engineer', phone: '+32 15 789 004', startDate: '2019-06-01', isActive: true },
  { id: '4t-5', companyId: '4takt', name: 'Marc Dubois', email: 'marc@4takt.be', role: 'client_user', jobTitle: 'Senior Consultant', phone: '+32 15 789 005', startDate: '2020-01-15', isActive: true },
  { id: '4t-6', companyId: '4takt', name: 'Eva Martens', email: 'eva@4takt.be', role: 'client_user', jobTitle: 'Project Manager', phone: '+32 15 789 006', startDate: '2020-04-01', isActive: true },
  { id: '4t-7', companyId: '4takt', name: 'Luc Peeters', email: 'luc@4takt.be', role: 'client_user', jobTitle: 'Technical Lead', phone: '+32 15 789 007', startDate: '2020-09-01', isActive: true },
  { id: '4t-8', companyId: '4takt', name: 'Nina Jacobs', email: 'nina@4takt.be', role: 'client_user', jobTitle: 'Quality Analyst', phone: '+32 15 789 008', startDate: '2021-02-01', isActive: true },
  { id: '4t-9', companyId: '4takt', name: 'Kevin Mertens', email: 'kevin@4takt.be', role: 'client_user', jobTitle: 'Junior Consultant', phone: '+32 15 789 009', startDate: '2022-06-01', isActive: true },
  { id: '4t-10', companyId: '4takt', name: 'An De Bruyn', email: 'an@4takt.be', role: 'client_user', jobTitle: 'Business Analyst', phone: '+32 15 789 010', startDate: '2023-01-15', isActive: true },
];

// Pilot employee (owner of pilot company - empty/fresh state)
const pilotEmployee: CompanyEmployee = {
  id: 'pilot-1',
  companyId: PILOT_COMPANY_ID,
  name: 'Demo User',
  email: PILOT_EMAIL,
  role: 'client_owner',
  jobTitle: 'Architect',
  phone: '',
  startDate: new Date().toISOString().split('T')[0],
  isActive: true
};

// Demo projects for GDesign (synced with mockLocalProjects.ts)
// These use the same IDs and data as the Project module
const gdesignProjects: CompanyProject[] = [
  { id: 'proj-gdesign-001', companyId: 'gdesign', name: 'Pauwels Herent', projectNumber: '2025-001', status: 'Open', manager: 'Geoffrey Draelants', projectType: 'Residential', location: 'Luchthavenlaan 16-18, 1800 Vilvoorde, Belgium', startDate: '2025-01-15', budget: 45000, progress: 35 },
  { id: 'proj-gdesign-002', companyId: 'gdesign', name: 'Office Tower Brussels', projectNumber: '2025-002', status: 'In Progress', manager: 'Marie Peeters', projectType: 'Commercial', location: 'Boulevard du Roi Albert II 30, 1000 Brussels, Belgium', startDate: '2024-06-01', budget: 320000, progress: 61 },
  { id: 'proj-gdesign-003', companyId: 'gdesign', name: 'Renovatie Villa Mechelen', projectNumber: '2025-003', status: 'On Hold', manager: 'Thomas Willems', projectType: 'Renovation', location: 'Koningin Astridlaan 45, 2800 Mechelen, Belgium', startDate: '2024-03-15', budget: 85000, progress: 25 },
];

// Demo projects for 4TAKT (synced with mockLocalProjects.ts)
const fourTaktProjects: CompanyProject[] = [
  { id: 'proj-4takt-001', companyId: '4takt', name: 'School Campus Gent', projectNumber: '2024-015', status: 'Completed', manager: 'Lisa Van den Berg', projectType: 'Public', location: 'Schoolstraat 12, 9000 Gent, Belgium', startDate: '2024-01-10', budget: 450000, progress: 100 },
];

// Demo contacts for GDesign (synced with mockLocalProjects.ts project contacts)
const gdesignContacts: CompanyContact[] = [
  // Project 1: Pauwels Herent - Residential
  { id: 'gd-c1', companyId: 'gdesign', name: 'Artebeau BV', contactType: 'Client', company: 'Artebeau BV', email: 'contact@artebeau.be', phone: '+32 2 123 456', address: 'Client Avenue 10, 1000 Brussels', status: 'Active' },
  { id: 'gd-c2', companyId: 'gdesign', name: 'Elektricien NV', contactType: 'Contractor', company: 'Elektricien NV', email: 'info@elektricien.be', phone: '+32 3 123 456', address: 'Volt Street 100, 2000 Antwerp', status: 'Active' },
  // Project 2: Office Tower Brussels - Commercial
  { id: 'gd-c3', companyId: 'gdesign', name: 'Immobel SA', contactType: 'Client', company: 'Immobel SA', email: 'projects@immobel.be', phone: '+32 2 422 5511', address: 'Rue de la Régence 58, 1000 Brussels', status: 'Active' },
  { id: 'gd-c4', companyId: 'gdesign', name: 'Jaspers-Eyers Architects', contactType: 'Consultant', company: 'Jaspers-Eyers Architects', email: 'office@jaspers-eyers.be', phone: '+32 2 640 6070', address: 'Brussels, Belgium', status: 'Active' },
  { id: 'gd-c5', companyId: 'gdesign', name: 'BESIX Group', contactType: 'Contractor', company: 'BESIX SA', email: 'info@besix.com', phone: '+32 2 402 6211', address: 'Avenue des Communautés 100, 1200 Brussels', status: 'Active' },
  { id: 'gd-c6', companyId: 'gdesign', name: 'Tractebel Engineering', contactType: 'Consultant', company: 'Tractebel Engineering SA', email: 'info@tractebel.engie.com', phone: '+32 2 773 9111', address: 'Brussels, Belgium', status: 'Active' },
  // Project 3: Renovatie Villa Mechelen - Renovation
  { id: 'gd-c7', companyId: 'gdesign', name: 'Familie Van den Berghe', contactType: 'Client', company: 'Private Owner', email: 'vandenberghe.family@gmail.com', phone: '+32 15 123 456', address: 'Mechelen, Belgium', status: 'Active' },
  { id: 'gd-c8', companyId: 'gdesign', name: 'Restoration Experts BVBA', contactType: 'Contractor', company: 'Restoration Experts BVBA', email: 'info@restoexperts.be', phone: '+32 15 789 012', address: 'Ambachtstraat 25, 2800 Mechelen', status: 'Active' },
  { id: 'gd-c9', companyId: 'gdesign', name: 'Historic Interiors', contactType: 'Consultant', company: 'Historic Interiors NV', email: 'design@historicinteriors.be', phone: '+32 15 345 678', address: 'Mechelen, Belgium', status: 'Active' },
];

// Demo contacts for 4TAKT (synced with mockLocalProjects.ts project contacts)
const fourTaktContacts: CompanyContact[] = [
  // Project 4: School Campus Gent - Public
  { id: '4t-c1', companyId: '4takt', name: 'Stad Gent - Dienst Facility', contactType: 'Client', company: 'Stad Gent', email: 'facility@gent.be', phone: '+32 9 266 7000', address: 'Botermarkt 1, 9000 Gent', status: 'Active' },
  { id: '4t-c2', companyId: '4takt', name: 'Van Hout NV', contactType: 'Contractor', company: 'Van Hout NV', email: 'info@vanhout.be', phone: '+32 14 26 99 00', address: 'Lammerdries 12, 2440 Geel', status: 'Active' },
  { id: '4t-c3', companyId: '4takt', name: 'Abscis Architecten', contactType: 'Consultant', company: 'Abscis Architecten BVBA', email: 'info@abscis.be', phone: '+32 9 233 0826', address: 'Gent, Belgium', status: 'Active' },
  { id: '4t-c4', companyId: '4takt', name: 'Studiebureau Boydens', contactType: 'Consultant', company: 'Boydens Engineering NV', email: 'info@boydens.be', phone: '+32 9 267 0800', address: 'Gent, Belgium', status: 'Active' },
];

// Get contacts by company
export const getContactsByCompany = (companyId: string): CompanyContact[] => {
  const stored = localStorage.getItem(COMPANY_CONTACTS_KEY);
  if (!stored) return [];
  const all: CompanyContact[] = JSON.parse(stored);
  return all.filter(c => c.companyId === companyId);
};

// Get all contacts
export const getAllCompanyContacts = (): CompanyContact[] => {
  const stored = localStorage.getItem(COMPANY_CONTACTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get all companies
export const getAllCompanies = (): Company[] => {
  const stored = localStorage.getItem(COMPANIES_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

// Get company by ID
export const getCompanyById = (id: string): Company | undefined => {
  return getAllCompanies().find(c => c.id === id);
};

// Get employees by company
export const getEmployeesByCompany = (companyId: string): CompanyEmployee[] => {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  if (!stored) return [];
  const all: CompanyEmployee[] = JSON.parse(stored);
  return all.filter(e => e.companyId === companyId);
};

// Get all employees
export const getAllEmployees = (): CompanyEmployee[] => {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get projects by company
export const getProjectsByCompany = (companyId: string): CompanyProject[] => {
  const stored = localStorage.getItem(COMPANY_PROJECTS_KEY);
  if (!stored) return [];
  const all: CompanyProject[] = JSON.parse(stored);
  return all.filter(p => p.companyId === companyId);
};

// Get all projects
export const getAllCompanyProjects = (): CompanyProject[] => {
  const stored = localStorage.getItem(COMPANY_PROJECTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get companies for a user (by email match or explicit assignment)
export const getCompaniesForUser = (userEmail: string): Company[] => {
  const companies = getAllCompanies();
  const employees = getAllEmployees();
  
  // Find which companies this user belongs to
  const userCompanyIds = employees
    .filter(e => e.email.toLowerCase() === userEmail.toLowerCase())
    .map(e => e.companyId);
  
  return companies.filter(c => userCompanyIds.includes(c.id));
};

// Seed demo data
export const seedCompanyData = () => {
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(demoCompanies));
  // Include pilot employee along with demo employees
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...gdesignEmployees, ...fourTaktEmployees, pilotEmployee]));
  localStorage.setItem(COMPANY_PROJECTS_KEY, JSON.stringify([...gdesignProjects, ...fourTaktProjects]));
  // Note: Pilot company has NO projects, contacts, or other data - completely empty
  localStorage.setItem(COMPANY_CONTACTS_KEY, JSON.stringify([...gdesignContacts, ...fourTaktContacts]));
};

// Clear all company data
export const clearCompanyData = () => {
  localStorage.removeItem(COMPANIES_KEY);
  localStorage.removeItem(EMPLOYEES_KEY);
  localStorage.removeItem(COMPANY_PROJECTS_KEY);
  localStorage.removeItem(COMPANY_CONTACTS_KEY);
};

// Check if data is seeded
export const isCompanyDataSeeded = (): boolean => {
  return localStorage.getItem(COMPANIES_KEY) !== null;
};

// Add Jan to both companies (for demo purposes)
export const setupMultiCompanyUser = () => {
  const employees = getAllEmployees();
  
  // Check if Jan already exists in 4TAKT
  const janIn4TAKT = employees.find(e => e.email === 'jan@gdesign.be' && e.companyId === '4takt');
  
  if (!janIn4TAKT) {
    // Add Jan as a consultant in 4TAKT as well
    const janAsConsultant: CompanyEmployee = {
      id: '4t-jan',
      companyId: '4takt',
      name: 'Jan Vermeersch',
      email: 'jan@gdesign.be',
      role: 'client_owner',
      jobTitle: 'External Consultant',
      phone: '+32 16 123 456',
      startDate: '2023-06-01',
      isActive: true
    };
    
    employees.push(janAsConsultant);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }
};

// Get company stats
export const getCompanyStats = (companyId: string) => {
  const employees = getEmployeesByCompany(companyId);
  const projects = getProjectsByCompany(companyId);
  
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Open').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  
  return {
    totalEmployees: employees.filter(e => e.isActive).length,
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    totalBudget,
  };
};
