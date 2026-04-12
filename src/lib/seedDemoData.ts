/**
 * Centralized Demo Data Seeder
 * Seeds all settings modules with demo data for testing
 */

import { seedDemoUsers as seedUsers } from './mockUserDB';
import { seedDemoContacts } from './mockContactDB';
import { seedDemoProjectSettings } from './mockProjectSettingsDB';
import { seedDemoLocalProject } from './mockLocalProjects';
import type { NoxProjectData } from './noxProjectStore';

// ============ COMPANY SETTINGS ============
export function seedCompanySettings(): void {
  const existing = localStorage.getItem('companiesList');
  if (existing) return; // Don't overwrite existing

  const companies = [
    {
      id: "company-1",
      name: "GDesign Architecten",
      vatNumber: "BE0123456789",
      street: "Architectenstraat",
      number: "42",
      postalCode: "3000",
      city: "Leuven",
      country: "Belgium",
      legalName: "GDesign Architecten BV",
      branchAddress: "Koningsstraat 100, 1000 Brussels",
      divisions: ["Architecture", "Interior Design", "Urban Planning"],
      logoUrl: ""
    },
    {
      id: "company-2",
      name: "4TAKT",
      vatNumber: "BE0987654321",
      street: "Mechelsesteenweg",
      number: "180",
      postalCode: "2018",
      city: "Antwerp",
      country: "Belgium",
      legalName: "4TAKT BVBA",
      branchAddress: "",
      divisions: ["Industrial Design", "Product Development"],
      logoUrl: ""
    }
  ];

  localStorage.setItem('companiesList', JSON.stringify(companies));
  
  // Also set for settings validator
  localStorage.setItem('oxicloud_company_settings', JSON.stringify({ companyName: companies[0].name }));
}

// ============ INTERNAL COST SETTINGS ============
export function seedInternalCostSettings(): void {
  const existing = localStorage.getItem('internalCostSettings');
  if (existing) return;

  const configs = [
    {
      year: 2025,
      overheadEnabled: true,
      overheadAmount: 15000,
      overheadDate: new Date('2025-01-01').toISOString(),
      marginPerUserEnabled: true,
      marginPerUserPercent: 12.5,
      fixedMarginEnabled: false,
      fixedMarginAmount: 0
    },
    {
      year: 2024,
      overheadEnabled: true,
      overheadAmount: 12000,
      overheadDate: new Date('2024-01-01').toISOString(),
      marginPerUserEnabled: true,
      marginPerUserPercent: 10,
      fixedMarginEnabled: true,
      fixedMarginAmount: 500
    }
  ];

  localStorage.setItem('internalCostSettings', JSON.stringify(configs));
}

// ============ UNITS AND PERFORMANCE TYPES ============
export function seedUnitsAndPerformance(): void {
  const existingUnits = localStorage.getItem('units');
  const existingPerf = localStorage.getItem('performanceTypes');
  
  if (!existingUnits) {
    const units = [
      { id: 'unit-1', name: 'hour', internalCost: 75, externalCost: 125 },
      { id: 'unit-2', name: 'm²', internalCost: 25, externalCost: 45 },
      { id: 'unit-3', name: 'piece', internalCost: 50, externalCost: 85 },
      { id: 'unit-4', name: 'day', internalCost: 600, externalCost: 950 }
    ];
    localStorage.setItem('units', JSON.stringify(units));
  }

  if (!existingPerf) {
    const performanceTypes = [
      { id: 'perf-1', name: 'Design Concept', active: true, unitId: 'unit-1', overheadEnabled: true, marginEnabled: true, costOverride: false, overrideCost: 0 },
      { id: 'perf-2', name: 'Technical Drawings', active: true, unitId: 'unit-1', overheadEnabled: true, marginEnabled: true, costOverride: false, overrideCost: 0 },
      { id: 'perf-3', name: 'Site Visit', active: true, unitId: 'unit-4', overheadEnabled: false, marginEnabled: true, costOverride: true, overrideCost: 750 },
      { id: 'perf-4', name: 'Project Management', active: true, unitId: 'unit-1', overheadEnabled: true, marginEnabled: true, costOverride: false, overrideCost: 0 },
      { id: 'perf-5', name: 'Floor Plan Design', active: true, unitId: 'unit-2', overheadEnabled: true, marginEnabled: false, costOverride: false, overrideCost: 0 },
      { id: 'perf-6', name: 'Client Meeting', active: true, unitId: 'unit-1', overheadEnabled: false, marginEnabled: false, costOverride: false, overrideCost: 0 },
      { id: 'perf-7', name: 'Permit Application', active: false, unitId: 'unit-3', overheadEnabled: true, marginEnabled: true, costOverride: true, overrideCost: 350 }
    ];
    localStorage.setItem('performanceTypes', JSON.stringify(performanceTypes));
  }
}

// ============ ENHANCED USER SEEDING ============
// Now delegates to the canonical user list in mockUserDB (Jan, Maria, Lisa, etc.)
export function seedEnhancedUsers(): void {
  const existing = localStorage.getItem('oxicloud_users');
  if (existing && JSON.parse(existing).length > 0) return;

  // Use the canonical demo users from mockUserDB
  seedUsers();
}

// ============ NOX DEMO DATA ============
export function seedNoxDemoData(): void {
  const existing = localStorage.getItem('nox_project_data');
  if (existing) {
    const parsed = JSON.parse(existing);
    // Check if our demo projects already exist with price data
    const hasDemo001 = parsed.some((d: any) => d.projectId === 'proj-gdesign-001' && d.priceData);
    const hasDemo002 = parsed.some((d: any) => d.projectId === 'proj-gdesign-002' && d.priceData);
    if (hasDemo001 && hasDemo002) return; // Already seeded
  }

  const now = new Date().toISOString();
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();

  const noxData: NoxProjectData[] = [
    {
      projectId: 'proj-gdesign-001',
      status: 'awaiting_payment',
      subStatus: 'quote_sent_to_customer',
      quoteSentDate: fiveDaysAgo,
      daysPending: 5,
      preEstimation: {
        projectType: 'eengezinswoningen',
        constructionType: 'nieuwbouw',
        groundFloorArea: 180,
        numberOfFloors: 2,
        demolitionVolume: 0,
        whatDemolish: '',
      },
      priceData: {
        basePrice: 1850,
        vat: 388.50,
        totalPrice: 2238.50,
        validUntil: new Date(Date.now() + 9 * 86400000).toISOString(),
      },
      reportJobQueued: false,
      noxCreatedAt: fiveDaysAgo,
      noxUpdatedAt: now,
      currentVersion: 'v0',
      versionHistory: [],
    },
    {
      projectId: 'proj-gdesign-002',
      status: 'awaiting_payment',
      subStatus: 'quote_sent_to_customer',
      quoteSentDate: twoDaysAgo,
      daysPending: 2,
      preEstimation: {
        projectType: 'kantoorgebouwen',
        constructionType: 'nieuwbouw',
        groundFloorArea: 2400,
        numberOfFloors: 8,
        demolitionVolume: 500,
        whatDemolish: 'Existing parking structure',
      },
      priceData: {
        basePrice: 3200,
        vat: 672,
        totalPrice: 3872,
        validUntil: new Date(Date.now() + 12 * 86400000).toISOString(),
      },
      reportJobQueued: false,
      noxCreatedAt: twoDaysAgo,
      noxUpdatedAt: now,
      currentVersion: 'v0',
      versionHistory: [],
    },
  ];

  // Merge with existing data - add demo entries, don't remove user data
  const existingParsed: any[] = existing ? JSON.parse(existing) : [];
  const otherEntries = existingParsed.filter(
    (d: any) => d.projectId !== 'proj-gdesign-001' && d.projectId !== 'proj-gdesign-002'
  );
  localStorage.setItem('nox_project_data', JSON.stringify([...otherEntries, ...noxData]));
}

// ============ MAIN SEED FUNCTION ============
export function seedAllDemoData(): void {
  // 1. Company Settings
  seedCompanySettings();
  
  // 2. Internal Costs
  seedInternalCostSettings();
  
  // 3. Units & Performance Types
  seedUnitsAndPerformance();
  
  // 4. Users (current + former employees)
  seedEnhancedUsers();
  
  // 5. Contacts (from existing mockContactDB)
  seedDemoContacts();
  
  // 6. Project Settings (types, statuses, phases, schedules)
  seedDemoProjectSettings();
  
  // 7. Demo project (force reseed to update contacts with team members)
  // Clear project contacts first to ensure fresh team data
  localStorage.removeItem('oxicloud_project_contacts');
  seedDemoLocalProject(true);

  // 8. NOx demo data (quotes awaiting payment for GDesign)
  seedNoxDemoData();
}

// ============ CLEAR ALL DATA ============
export function clearAllDemoData(): void {
  const keysToRemove = [
    'companiesList',
    'companySettings',
    'oxicloud_company_settings',
    'internalCostSettings',
    'units',
    'performanceTypes',
    'oxicloud_users',
    'oxicloud_contacts',
    'oxicloud_contact_taxonomy',
    'oxicloud_project_roles',
    'oxicloud_contact_groups',
    'oxicloud_organizational_labels',
    'oxicloud_project_types',
    'oxicloud_project_statuses',
    'oxicloud_project_phases',
    'oxicloud_project_schedules',
    'oxicloud_employee_roles',
    'oxicloud_local_projects',
    'oxicloud_project_contacts',
    // Company module data
    'oxicloud_companies',
    'oxicloud_company_employees',
    'oxicloud_company_projects',
    'oxicloud_company_contacts',
    // NOx module data
    'nox_project_data'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
