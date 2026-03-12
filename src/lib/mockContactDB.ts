/**
 * Mock Database for Contacts Settings
 * Uses localStorage for persistence (mock only)
 */

import { Contact, ContactType, ProjectRole, ContactGroup, DEFAULT_TAXONOMY, DEFAULT_PROJECT_ROLES, TaxonomyContext } from '@/types/contact';

const STORAGE_KEYS = {
  CONTACTS: 'oxicloud_contacts',
  TAXONOMY: 'oxicloud_contact_taxonomy',
  PROJECT_ROLES: 'oxicloud_project_roles',
  CONTACT_GROUPS: 'oxicloud_contact_groups',
  ORGANIZATIONAL_LABELS: 'oxicloud_organizational_labels',
  PILOT_TAXONOMY: 'oxicloud_pilot_taxonomy',
  PILOT_CONTACTS: 'oxicloud_pilot_contacts',
  PILOT_PROJECT_ROLES: 'oxicloud_pilot_project_roles'
};

// ============ ORGANIZATIONAL LABELS ============

export interface OrganizationalLabel {
  id: string;
  name: string;
  isSystem: boolean;
  order: number;
}

const DEFAULT_ORGANIZATIONAL_LABELS: Omit<OrganizationalLabel, 'id'>[] = [
  { name: 'Employee', isSystem: true, order: 1 },
  { name: 'Clients', isSystem: true, order: 2 },
  { name: 'Legal / Permits', isSystem: false, order: 3 }
];

export function getAllOrganizationalLabels(): OrganizationalLabel[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS);
  if (stored) return JSON.parse(stored).sort((a: OrganizationalLabel, b: OrganizationalLabel) => a.order - b.order);
  
  const defaults: OrganizationalLabel[] = DEFAULT_ORGANIZATIONAL_LABELS.map(label => ({
    ...label,
    id: crypto.randomUUID()
  }));
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS, JSON.stringify(defaults));
  return defaults;
}

export function addOrganizationalLabel(name: string): OrganizationalLabel {
  const labels = getAllOrganizationalLabels();
  const existing = labels.find(l => l.name.toLowerCase() === name.toLowerCase());
  if (existing) throw new Error('Label already exists');
  
  const maxOrder = Math.max(...labels.map(l => l.order), 0);
  const newLabel: OrganizationalLabel = {
    id: crypto.randomUUID(),
    name,
    isSystem: false,
    order: maxOrder + 1
  };
  labels.push(newLabel);
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS, JSON.stringify(labels));
  return newLabel;
}

export function updateOrganizationalLabel(id: string, name: string): OrganizationalLabel | null {
  const labels = getAllOrganizationalLabels();
  const index = labels.findIndex(l => l.id === id);
  if (index === -1) return null;
  if (labels[index].isSystem) throw new Error('Cannot modify system labels');
  
  labels[index] = { ...labels[index], name };
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS, JSON.stringify(labels));
  return labels[index];
}

export function deleteOrganizationalLabel(id: string): boolean {
  const labels = getAllOrganizationalLabels();
  const label = labels.find(l => l.id === id);
  if (!label || label.isSystem) return false;
  
  const filtered = labels.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS, JSON.stringify(filtered));
  return true;
}

export function reorderOrganizationalLabels(labels: OrganizationalLabel[]): void {
  localStorage.setItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS, JSON.stringify(labels));
}

// ============ TAXONOMY CRUD ============

function seedDefaultTaxonomy(): ContactType[] {
  const defaults: ContactType[] = [];
  DEFAULT_TAXONOMY.forEach(t => {
    t.subtypes.forEach(sub => {
      defaults.push({
        id: `default_${t.hoofdtype}_${sub}`.toLowerCase().replace(/\s+/g, '_'),
        hoofdtype: t.hoofdtype,
        subtype: sub,
        is_locked: t.is_locked,
        is_default: t.is_default
      });
    });
  });
  return defaults;
}

export function getAllTaxonomy(): ContactType[] {
  const stored = localStorage.getItem(STORAGE_KEYS.TAXONOMY);
  if (stored) {
    const parsed: ContactType[] = JSON.parse(stored);
    // Migrate old entries that don't have is_locked/is_default
    let needsMigration = false;
    const migrated = parsed.map(entry => {
      if (entry.is_locked === undefined) {
        needsMigration = true;
        // Check if this matches a default entry
        const isDefault = DEFAULT_TAXONOMY.some(
          d => d.hoofdtype === entry.hoofdtype && d.subtypes.includes(entry.subtype)
        );
        return { ...entry, is_locked: isDefault, is_default: isDefault };
      }
      return entry;
    });
    // Ensure all locked defaults exist
    const defaults = seedDefaultTaxonomy();
    for (const def of defaults) {
      if (!migrated.some(m => m.hoofdtype === def.hoofdtype && m.subtype === def.subtype)) {
        migrated.push(def);
        needsMigration = true;
      }
    }
    if (needsMigration) {
      localStorage.setItem(STORAGE_KEYS.TAXONOMY, JSON.stringify(migrated));
    }
    return migrated;
  }
  
  // Initialize with defaults
  const defaults = seedDefaultTaxonomy();
  localStorage.setItem(STORAGE_KEYS.TAXONOMY, JSON.stringify(defaults));
  return defaults;
}

export function getHoofdtypes(): string[] {
  const taxonomy = getAllTaxonomy();
  return [...new Set(taxonomy.map(t => t.hoofdtype))];
}

export function getSubtypesByHoofdtype(hoofdtype: string): string[] {
  const taxonomy = getAllTaxonomy();
  return taxonomy.filter(t => t.hoofdtype === hoofdtype).map(t => t.subtype);
}

export function addTaxonomyEntry(hoofdtype: string, subtype: string): ContactType {
  const taxonomy = getAllTaxonomy();
  const existing = taxonomy.find(t => t.hoofdtype === hoofdtype && t.subtype === subtype);
  if (existing) throw new Error('Taxonomy entry already exists');
  
  const newEntry: ContactType = {
    id: crypto.randomUUID(),
    hoofdtype,
    subtype,
    is_locked: false,
    is_default: false
  };
  taxonomy.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.TAXONOMY, JSON.stringify(taxonomy));
  return newEntry;
}

export function updateTaxonomyEntry(id: string, hoofdtype: string, subtype: string): ContactType | null {
  const taxonomy = getAllTaxonomy();
  const index = taxonomy.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  // Locked entries: allow renaming hoofdtype but not deleting
  // (deletion is blocked separately)
  
  taxonomy[index] = { ...taxonomy[index], hoofdtype, subtype };
  localStorage.setItem(STORAGE_KEYS.TAXONOMY, JSON.stringify(taxonomy));
  return taxonomy[index];
}

export function deleteTaxonomyEntry(id: string): boolean {
  const taxonomy = getAllTaxonomy();
  const entry = taxonomy.find(t => t.id === id);
  
  // Reject locked entries
  if (entry?.is_locked) {
    throw new Error('Cannot delete locked taxonomy entries');
  }
  
  const filtered = taxonomy.filter(t => t.id !== id);
  if (filtered.length === taxonomy.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.TAXONOMY, JSON.stringify(filtered));
  return true;
}

// ============ CONTEXT-BASED TAXONOMY FILTERING (Level 2) ============

/**
 * Get taxonomy filtered by context:
 * - 'settings': Only Consultant + its subtypes (internal team)
 * - 'external': Everything EXCEPT Consultant (for + button, contacts module)
 * - 'project_creation': Only Opdrachtgever + Bouwheer (mandatory project contacts)
 */
export function getTaxonomyByContext(context: TaxonomyContext, isPilot = false): ContactType[] {
  const taxonomy = isPilot ? getPilotTaxonomy() : getAllTaxonomy();
  
  switch (context) {
    case 'settings':
      return taxonomy.filter(t => t.hoofdtype === 'Opdrachtnemer');
    case 'external':
      return taxonomy.filter(t => t.hoofdtype !== 'Opdrachtnemer');
    case 'project_creation':
      return taxonomy.filter(t => t.hoofdtype === 'Opdrachtgever');
    default:
      return taxonomy;
  }
}

export function getHoofdtypesByContext(context: TaxonomyContext, isPilot = false): string[] {
  const filtered = getTaxonomyByContext(context, isPilot);
  return [...new Set(filtered.map(t => t.hoofdtype))];
}

export function getSubtypesByContext(context: TaxonomyContext, hoofdtype: string, isPilot = false): string[] {
  const filtered = getTaxonomyByContext(context, isPilot);
  return filtered.filter(t => t.hoofdtype === hoofdtype).map(t => t.subtype);
}

// ============ PILOT ACCOUNT TAXONOMY ============

function seedPilotTaxonomy(): ContactType[] {
  const seeded: ContactType[] = [];
  for (const group of DEFAULT_TAXONOMY) {
    for (const subtype of group.subtypes) {
      seeded.push({
        id: `default_${group.hoofdtype}_${subtype}`.toLowerCase().replace(/\s+/g, '_'),
        hoofdtype: group.hoofdtype,
        subtype,
        is_locked: group.is_locked,
        is_default: group.is_default
      });
    }
  }
  localStorage.setItem(STORAGE_KEYS.PILOT_TAXONOMY, JSON.stringify(seeded));
  return seeded;
}

export function getPilotTaxonomy(): ContactType[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PILOT_TAXONOMY);
  if (stored) {
    const parsed: ContactType[] = JSON.parse(stored);
    // Migrate old entries
    let needsMigration = false;
    const migrated = parsed.map(entry => {
      if (entry.is_locked === undefined) {
        needsMigration = true;
        const isDefault = DEFAULT_TAXONOMY.some(
          d => d.hoofdtype === entry.hoofdtype && d.subtypes.includes(entry.subtype)
        );
        return { ...entry, is_locked: isDefault, is_default: isDefault };
      }
      return entry;
    });
    const defaults = seedPilotTaxonomy();
    for (const def of defaults) {
      if (!migrated.some(m => m.hoofdtype === def.hoofdtype && m.subtype === def.subtype)) {
        migrated.push(def);
        needsMigration = true;
      }
    }
    if (needsMigration) {
      localStorage.setItem(STORAGE_KEYS.PILOT_TAXONOMY, JSON.stringify(migrated));
    }
    return migrated;
  }
  return seedPilotTaxonomy();
}

export function getPilotHoofdtypes(): string[] {
  const taxonomy = getPilotTaxonomy();
  return [...new Set(taxonomy.map(t => t.hoofdtype))];
}

export function addPilotTaxonomyEntry(hoofdtype: string, subtype: string): ContactType {
  const taxonomy = getPilotTaxonomy();
  const existing = taxonomy.find(t => t.hoofdtype === hoofdtype && t.subtype === subtype);
  if (existing) throw new Error('Taxonomy entry already exists');
  
  const newEntry: ContactType = {
    id: crypto.randomUUID(),
    hoofdtype,
    subtype,
    is_locked: false,
    is_default: false
  };
  taxonomy.push(newEntry);
  localStorage.setItem(STORAGE_KEYS.PILOT_TAXONOMY, JSON.stringify(taxonomy));
  return newEntry;
}

export function updatePilotTaxonomyEntry(id: string, hoofdtype: string, subtype: string): ContactType | null {
  const taxonomy = getPilotTaxonomy();
  const index = taxonomy.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  // Locked entries: allow renaming but not deleting
  
  taxonomy[index] = { ...taxonomy[index], hoofdtype, subtype };
  localStorage.setItem(STORAGE_KEYS.PILOT_TAXONOMY, JSON.stringify(taxonomy));
  return taxonomy[index];
}

export function deletePilotTaxonomyEntry(id: string): boolean {
  const taxonomy = getPilotTaxonomy();
  const entry = taxonomy.find(t => t.id === id);
  
  if (entry?.is_locked) {
    throw new Error('Cannot delete locked taxonomy entries');
  }
  
  const filtered = taxonomy.filter(t => t.id !== id);
  if (filtered.length === taxonomy.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PILOT_TAXONOMY, JSON.stringify(filtered));
  return true;
}

// ============ CONTACTS CRUD ============

export function getAllContacts(): Contact[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
      return value;
    });
  }
  return [];
}

export function getContactById(id: string): Contact | null {
  const contacts = getAllContacts();
  return contacts.find(c => c.id === id) || null;
}

export function createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
  const contacts = getAllContacts();
  const newContact: Contact = {
    ...contact,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  contacts.push(newContact);
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  return newContact;
}

export function updateContact(id: string, updates: Partial<Contact>): Contact | null {
  const contacts = getAllContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  contacts[index] = { ...contacts[index], ...updates, updatedAt: new Date() };
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  return contacts[index];
}

export function deleteContact(id: string): boolean {
  const contacts = getAllContacts();
  const filtered = contacts.filter(c => c.id !== id);
  if (filtered.length === contacts.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(filtered));
  return true;
}

// ============ PROJECT ROLES CRUD ============

export function getAllProjectRoles(): ProjectRole[] {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_ROLES);
  if (stored) {
    return JSON.parse(stored, (key, value) => {
      if (key === 'createdAt') return new Date(value);
      return value;
    });
  }
  
  const defaults: ProjectRole[] = DEFAULT_PROJECT_ROLES.map(name => ({
    id: crypto.randomUUID(),
    name,
    isDefault: true,
    createdAt: new Date()
  }));
  localStorage.setItem(STORAGE_KEYS.PROJECT_ROLES, JSON.stringify(defaults));
  return defaults;
}

export function addProjectRole(name: string): ProjectRole {
  const roles = getAllProjectRoles();
  const newRole: ProjectRole = {
    id: crypto.randomUUID(),
    name,
    isDefault: false,
    createdAt: new Date()
  };
  roles.push(newRole);
  localStorage.setItem(STORAGE_KEYS.PROJECT_ROLES, JSON.stringify(roles));
  return newRole;
}

export function updateProjectRole(id: string, name: string): ProjectRole | null {
  const roles = getAllProjectRoles();
  const index = roles.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  roles[index] = { ...roles[index], name };
  localStorage.setItem(STORAGE_KEYS.PROJECT_ROLES, JSON.stringify(roles));
  return roles[index];
}

export function deleteProjectRole(id: string): boolean {
  const roles = getAllProjectRoles();
  const filtered = roles.filter(r => r.id !== id);
  if (filtered.length === roles.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PROJECT_ROLES, JSON.stringify(filtered));
  return true;
}

// ============ CONTACT GROUPS CRUD ============

export function getAllContactGroups(): ContactGroup[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CONTACT_GROUPS);
  if (stored) return JSON.parse(stored);
  
  const defaults: ContactGroup[] = [
    { id: crypto.randomUUID(), name: 'Fixed Staff', contactIds: [], order: 1 },
    { id: crypto.randomUUID(), name: 'Fixed Clients', contactIds: [], order: 2 },
    { id: crypto.randomUUID(), name: 'Legal / Permits', contactIds: [], order: 3 }
  ];
  localStorage.setItem(STORAGE_KEYS.CONTACT_GROUPS, JSON.stringify(defaults));
  return defaults;
}

export function updateContactGroups(groups: ContactGroup[]): void {
  localStorage.setItem(STORAGE_KEYS.CONTACT_GROUPS, JSON.stringify(groups));
}

// ============ DEMO DATA ============

export function seedDemoContacts(): void {
  getAllTaxonomy();
  getAllProjectRoles();
  getAllContactGroups();
  
  const taxonomy = getAllTaxonomy();
  
  const findTaxonomyId = (hoofdtype: string, subtype: string) => {
    const entry = taxonomy.find(t => t.hoofdtype === hoofdtype && t.subtype === subtype);
    return entry?.id || '';
  };
  
  const demoContacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      name: 'Artebeau BV',
      contactType: 'company',
      companyName: 'Artebeau BV',
      vatNumber: 'BE0987654321',
      street: 'Client Avenue', number: '10', postalCode: '1000', city: 'Brussels', country: 'Belgium',
      phone: '+32 2 123 456', gsm: '+32 475 123 456', email: 'contact@artebeau.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      name: 'Immobel SA',
      contactType: 'company',
      companyName: 'Immobel SA',
      vatNumber: 'BE0405966675',
      street: 'Rue de la Régence', number: '58', postalCode: '1000', city: 'Brussels', country: 'Belgium',
      phone: '+32 2 422 5511', gsm: '+32 470 111 222', email: 'projects@immobel.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Projectontwikkelaar'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Projectontwikkelaar'),
      name: 'Matexi Group',
      contactType: 'company',
      companyName: 'Matexi Group NV',
      vatNumber: 'BE0434407720',
      street: 'Franklin Rooseveltlaan', number: '180', postalCode: '8790', city: 'Waregem', country: 'Belgium',
      phone: '+32 56 62 74 00', gsm: '+32 471 333 444', email: 'info@matexi.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Projectontwikkelaar'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Projectontwikkelaar'),
      name: 'ION',
      contactType: 'company',
      companyName: 'ION NV',
      vatNumber: 'BE0439819279',
      street: 'Koningsstraat', number: '60', postalCode: '1000', city: 'Brussels', country: 'Belgium',
      phone: '+32 2 210 02 00', gsm: '+32 472 444 555', email: 'info@ion.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      name: 'Willemen Groep',
      contactType: 'company',
      companyName: 'Willemen Groep NV',
      vatNumber: 'BE0400377368',
      street: 'Boerenkrijglaan', number: '60', postalCode: '2600', city: 'Berchem', country: 'Belgium',
      phone: '+32 3 360 84 00', gsm: '+32 473 555 666', email: 'info@willemen.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Bouwheer'),
      name: 'Besix Group',
      contactType: 'company',
      companyName: 'Besix Group SA',
      vatNumber: 'BE0400378080',
      street: 'Avenue des Communautés', number: '100', postalCode: '1200', city: 'Brussels', country: 'Belgium',
      phone: '+32 2 402 62 11', gsm: '+32 474 666 777', email: 'info@besix.com', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Opdrachtgever', 'Projectontwikkelaar'),
      subtypeId: findTaxonomyId('Opdrachtgever', 'Projectontwikkelaar'),
      name: 'Cordeel',
      contactType: 'company',
      companyName: 'Cordeel Group NV',
      vatNumber: 'BE0405928820',
      street: 'Eurolaan', number: '7', postalCode: '2660', city: 'Hoboken', country: 'Belgium',
      phone: '+32 3 829 44 00', gsm: '+32 475 777 888', email: 'info@cordeel.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Overheid', 'Gemeente'),
      subtypeId: findTaxonomyId('Overheid', 'Gemeente'),
      name: 'Stad Antwerpen',
      contactType: 'company',
      companyName: 'Stad Antwerpen',
      vatNumber: 'BE0207500123',
      street: 'Grote Markt', number: '1', postalCode: '2000', city: 'Antwerpen', country: 'Belgium',
      phone: '+32 3 338 12 11', gsm: '', email: 'info@antwerpen.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Overheid', 'Gemeente'),
      subtypeId: findTaxonomyId('Overheid', 'Gemeente'),
      name: 'Stad Gent',
      contactType: 'company',
      companyName: 'Stad Gent',
      vatNumber: 'BE0207451227',
      street: 'Botermarkt', number: '1', postalCode: '9000', city: 'Gent', country: 'Belgium',
      phone: '+32 9 266 70 40', gsm: '', email: 'info@stad.gent', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Consultant', 'Architect'),
      subtypeId: findTaxonomyId('Consultant', 'Architect'),
      name: 'Jaspers-Eyers Architects',
      contactType: 'company',
      companyName: 'Jaspers-Eyers Architects',
      vatNumber: 'BE0427243449',
      street: 'Brussels', number: '', postalCode: '1000', city: 'Brussels', country: 'Belgium',
      phone: '+32 2 640 6070', gsm: '+32 471 222 333', email: 'office@jaspers-eyers.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Consultant', 'Architect'),
      subtypeId: findTaxonomyId('Consultant', 'Architect'),
      name: 'Abscis Architecten',
      contactType: 'company',
      companyName: 'Abscis Architecten BVBA',
      vatNumber: 'BE0474215397',
      street: 'Gent', number: '', postalCode: '9000', city: 'Gent', country: 'Belgium',
      phone: '+32 9 233 0826', gsm: '+32 479 000 111', email: 'info@abscis.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Consultant', 'Ingenieur stabiliteit'),
      subtypeId: findTaxonomyId('Consultant', 'Ingenieur stabiliteit'),
      name: 'BAS nv',
      contactType: 'company',
      companyName: 'BAS Engineering nv',
      vatNumber: 'BE0415222111',
      street: 'Industriepark', number: '22', postalCode: '3001', city: 'Heverlee', country: 'Belgium',
      phone: '+32 16 39 80 00', gsm: '+32 476 888 999', email: 'info@bas-engineering.be', status: 'Active'
    },
    {
      hoofdtypeId: findTaxonomyId('Consultant', 'EPB-verslaggever'),
      subtypeId: findTaxonomyId('Consultant', 'EPB-verslaggever'),
      name: 'E-Consult',
      contactType: 'company',
      companyName: 'E-Consult BVBA',
      vatNumber: 'BE0512345678',
      street: 'Leuvensesteenweg', number: '45', postalCode: '3010', city: 'Kessel-Lo', country: 'Belgium',
      phone: '+32 16 44 55 66', gsm: '+32 477 111 222', email: 'info@econsult.be', status: 'Active'
    }
  ];
  
  demoContacts.forEach(contact => createContact(contact));
}

export function clearAllContacts(): void {
  localStorage.removeItem(STORAGE_KEYS.CONTACTS);
  localStorage.removeItem(STORAGE_KEYS.TAXONOMY);
  localStorage.removeItem(STORAGE_KEYS.PROJECT_ROLES);
  localStorage.removeItem(STORAGE_KEYS.CONTACT_GROUPS);
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATIONAL_LABELS);
}
