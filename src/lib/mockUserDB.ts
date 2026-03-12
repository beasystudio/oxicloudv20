// Mock database for User Settings
// All data stored in localStorage with persistence across reloads

import { FullUser } from '@/types/user';
import { getAllEmployees, getEmployeesByCompany } from './mockCompanyDB';

const STORAGE_KEY = 'oxicloud_users';

// Initialize storage
const getUsers = (): FullUser[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveUsers = (users: FullUser[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// CRUD Operations

export const createUser = (user: FullUser): FullUser => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: user.id || crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isFormerEmployee: false,
    terminationDate: null
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<FullUser>): FullUser | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date()
  };
  saveUsers(users);
  return users[index];
};

export const deleteUser = (id: string, moveToFormer: boolean = false): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;

  if (moveToFormer) {
    // Move to former employees
    users[index].isFormerEmployee = true;
    users[index].terminationDate = new Date();
    saveUsers(users);
  } else {
    // Delete permanently
    users.splice(index, 1);
    saveUsers(users);
  }
  return true;
};

export const getUserById = (id: string): FullUser | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

export const getUserByEmail = (email: string): FullUser | null => {
  const users = getUsers();
  return users.find(u => u.general.workEmail.toLowerCase() === email.toLowerCase()) || null;
};

export const getAllActiveUsers = (): FullUser[] => {
  return getUsers().filter(u => !u.isFormerEmployee);
};

export const getAllFormerEmployees = (): FullUser[] => {
  return getUsers().filter(u => u.isFormerEmployee);
};

export const checkEmailUnique = (email: string, excludeId?: string): boolean => {
  const users = getUsers();
  return !users.some(u => 
    u.general.workEmail.toLowerCase() === email.toLowerCase() && 
    u.id !== excludeId &&
    !u.isFormerEmployee
  );
};

// Get users by company
export const getUsersByCompany = (companyId: string): FullUser[] => {
  return getUsers().filter(u => u.general.company === companyId && !u.isFormerEmployee);
};

// Seed demo users from Company employees (GDesign + 4TAKT)
export const seedDemoUsers = (): void => {
  // Clear existing users first
  localStorage.removeItem(STORAGE_KEY);
  
  const demoUsers: FullUser[] = [
    // GDesign Employees
    {
      id: 'gd-1',
      general: {
        id: 'gd-1',
        firstName: 'Jan',
        lastName: 'Vermeersch',
        workEmail: 'jan@gdesign.be',
        jobTitle: 'Managing Director',
        phone: '+32 16 123 456',
        gsm: '+32 475 11 22 33',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: 'gdesign',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: true,
        crmAccess: true,
        financialDashboardAccess: true,
        leaveDays: 25,
        extraLeaveDays: 5
      },
      confidential: {
        street: 'Architect Street',
        number: '42',
        bus: '',
        postalCode: '3000',
        city: 'Leuven',
        country: 'Belgium',
        idNumber: 'BE123456789',
        nationalNumber: '85.03.15-123.45',
        personalEmail: 'jan.vermeersch@gmail.com',
        personalPhone: '+32 486 99 88 77',
        birthdate: new Date('1985-03-15'),
        startDate: new Date('2020-03-15')
      },
      subscription: { contractType: 'Power User/Admin', workEmail: 'jan@gdesign.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-gd1', costPerHour: 95, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 6, breaks: [] },
      createdAt: new Date('2020-03-15'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: 'gd-2',
      general: {
        id: 'gd-2',
        firstName: 'Maria',
        lastName: 'Peeters',
        workEmail: 'maria@gdesign.be',
        jobTitle: 'Office Manager',
        phone: '+32 16 123 457',
        gsm: '+32 475 22 33 44',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: 'gdesign',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: true,
        crmAccess: true,
        financialDashboardAccess: true,
        leaveDays: 22,
        extraLeaveDays: 3
      },
      confidential: {
        street: 'Parkstraat',
        number: '18',
        bus: 'A',
        postalCode: '3000',
        city: 'Leuven',
        country: 'Belgium',
        idNumber: 'BE234567890',
        nationalNumber: '88.07.22-234.56',
        personalEmail: 'maria.peeters@outlook.com',
        personalPhone: '+32 487 11 22 33',
        birthdate: new Date('1988-07-22'),
        startDate: new Date('2020-06-01')
      },
      subscription: { contractType: 'Power User/Admin', workEmail: 'maria@gdesign.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-gd2', costPerHour: 75, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2020-06-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: 'gd-3',
      general: {
        id: 'gd-3',
        firstName: 'Lisa',
        lastName: 'De Smet',
        workEmail: 'lisa@gdesign.be',
        jobTitle: 'Junior Architect',
        phone: '+32 16 123 458',
        gsm: '+32 475 33 44 55',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: 'gdesign',
        myProjectsOnly: true,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: false,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Naamsestraat',
        number: '55',
        bus: '',
        postalCode: '3000',
        city: 'Leuven',
        country: 'Belgium',
        idNumber: 'BE345678901',
        nationalNumber: '96.11.08-345.67',
        personalEmail: 'lisa.desmet@hotmail.com',
        personalPhone: '+32 488 22 33 44',
        birthdate: new Date('1996-11-08'),
        startDate: new Date('2021-09-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'lisa@gdesign.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-gd3', costPerHour: 55, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2021-09-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: 'gd-4',
      general: {
        id: 'gd-4',
        firstName: 'Thomas',
        lastName: 'Janssen',
        workEmail: 'thomas@gdesign.be',
        jobTitle: 'Senior Architect',
        phone: '+32 16 123 459',
        gsm: '+32 475 44 55 66',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: 'gdesign',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: false,
        leaveDays: 25,
        extraLeaveDays: 2
      },
      confidential: {
        street: 'Bondgenotenlaan',
        number: '112',
        bus: '',
        postalCode: '3000',
        city: 'Leuven',
        country: 'Belgium',
        idNumber: 'BE456789012',
        nationalNumber: '82.04.30-456.78',
        personalEmail: 'thomas.janssen@gmail.com',
        personalPhone: '+32 489 33 44 55',
        birthdate: new Date('1982-04-30'),
        startDate: new Date('2020-04-15')
      },
      subscription: { contractType: 'Standard User', workEmail: 'thomas@gdesign.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-gd4', costPerHour: 85, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 6, breaks: [] },
      createdAt: new Date('2020-04-15'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: 'gd-5',
      general: {
        id: 'gd-5',
        firstName: 'Emma',
        lastName: 'Van Damme',
        workEmail: 'emma@gdesign.be',
        jobTitle: 'Project Coordinator',
        phone: '+32 16 123 460',
        gsm: '+32 475 55 66 77',
        language: 'EN',
        nationality: 'Belgium',
        avatarUrl: null,
        company: 'gdesign',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 1
      },
      confidential: {
        street: 'Diestsestraat',
        number: '78',
        bus: 'B',
        postalCode: '3000',
        city: 'Leuven',
        country: 'Belgium',
        idNumber: 'BE567890123',
        nationalNumber: '91.09.12-567.89',
        personalEmail: 'emma.vandamme@yahoo.com',
        personalPhone: '+32 490 44 55 66',
        birthdate: new Date('1991-09-12'),
        startDate: new Date('2022-01-10')
      },
      subscription: { contractType: 'Standard User', workEmail: 'emma@gdesign.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-gd5', costPerHour: 65, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2022-01-10'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: 'gd-6',
      general: {
        id: 'gd-6',
        firstName: 'Pieter',
        lastName: 'Maes',
        workEmail: 'pieter@gdesign.be',
        jobTitle: 'Technical Draftsman',
        phone: '+32 16 123 461',
        gsm: '+32 475 66 77 88',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: 'gdesign',
        myProjectsOnly: true,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: false,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Tiensestraat',
        number: '200',
        bus: '',
        postalCode: '3000',
        city: 'Leuven',
        country: 'Belgium',
        idNumber: 'BE678901234',
        nationalNumber: '93.02.18-678.90',
        personalEmail: 'pieter.maes@gmail.com',
        personalPhone: '+32 491 55 66 77',
        birthdate: new Date('1993-02-18'),
        startDate: new Date('2021-03-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'pieter@gdesign.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-gd6', costPerHour: 50, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2021-03-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    // 4TAKT Employees
    {
      id: '4t-1',
      general: {
        id: '4t-1',
        firstName: 'Karel',
        lastName: 'Wouters',
        workEmail: 'karel@4takt.be',
        jobTitle: 'CEO',
        phone: '+32 15 789 001',
        gsm: '+32 476 11 22 33',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: true,
        crmAccess: true,
        financialDashboardAccess: true,
        leaveDays: 30,
        extraLeaveDays: 5
      },
      confidential: {
        street: 'Industrieweg',
        number: '88',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE789012345',
        nationalNumber: '75.08.05-789.01',
        personalEmail: 'karel.wouters@gmail.com',
        personalPhone: '+32 492 66 77 88',
        birthdate: new Date('1975-08-05'),
        startDate: new Date('2019-01-10')
      },
      subscription: { contractType: 'Power User/Admin', workEmail: 'karel@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t1', costPerHour: 120, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 6, breaks: [] },
      createdAt: new Date('2019-01-10'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-2',
      general: {
        id: '4t-2',
        firstName: 'Sophie',
        lastName: 'Hendricks',
        workEmail: 'sophie@4takt.be',
        jobTitle: 'Operations Director',
        phone: '+32 15 789 002',
        gsm: '+32 476 22 33 44',
        language: 'EN',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: true,
        crmAccess: true,
        financialDashboardAccess: true,
        leaveDays: 25,
        extraLeaveDays: 3
      },
      confidential: {
        street: 'Grote Markt',
        number: '15',
        bus: 'A',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE890123456',
        nationalNumber: '80.12.20-890.12',
        personalEmail: 'sophie.hendricks@outlook.com',
        personalPhone: '+32 493 77 88 99',
        birthdate: new Date('1980-12-20'),
        startDate: new Date('2019-02-15')
      },
      subscription: { contractType: 'Power User/Admin', workEmail: 'sophie@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t2', costPerHour: 95, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2019-02-15'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-3',
      general: {
        id: '4t-3',
        firstName: 'Bart',
        lastName: 'Claes',
        workEmail: 'bart@4takt.be',
        jobTitle: 'Finance Manager',
        phone: '+32 15 789 003',
        gsm: '+32 476 33 44 55',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: true,
        leaveDays: 22,
        extraLeaveDays: 2
      },
      confidential: {
        street: 'Bruul',
        number: '50',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE901234567',
        nationalNumber: '78.05.10-901.23',
        personalEmail: 'bart.claes@hotmail.com',
        personalPhone: '+32 494 88 99 00',
        birthdate: new Date('1978-05-10'),
        startDate: new Date('2019-03-01')
      },
      subscription: { contractType: 'Power User/Admin', workEmail: 'bart@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t3', costPerHour: 85, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2019-03-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-4',
      general: {
        id: '4t-4',
        firstName: 'Inge',
        lastName: 'Willems',
        workEmail: 'inge@4takt.be',
        jobTitle: 'Lead Engineer',
        phone: '+32 15 789 004',
        gsm: '+32 476 44 55 66',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: false,
        leaveDays: 22,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Stationsstraat',
        number: '22',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE012345678',
        nationalNumber: '85.09.25-012.34',
        personalEmail: 'inge.willems@gmail.com',
        personalPhone: '+32 495 99 00 11',
        birthdate: new Date('1985-09-25'),
        startDate: new Date('2019-06-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'inge@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t4', costPerHour: 80, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2019-06-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-5',
      general: {
        id: '4t-5',
        firstName: 'Marc',
        lastName: 'Dubois',
        workEmail: 'marc@4takt.be',
        jobTitle: 'Senior Consultant',
        phone: '+32 15 789 005',
        gsm: '+32 476 55 66 77',
        language: 'FR',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: false,
        leaveDays: 22,
        extraLeaveDays: 1
      },
      confidential: {
        street: 'Korenmarkt',
        number: '8',
        bus: 'B',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE123456780',
        nationalNumber: '79.11.03-123.45',
        personalEmail: 'marc.dubois@outlook.be',
        personalPhone: '+32 496 00 11 22',
        birthdate: new Date('1979-11-03'),
        startDate: new Date('2020-01-15')
      },
      subscription: { contractType: 'Standard User', workEmail: 'marc@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t5', costPerHour: 90, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 6, breaks: [] },
      createdAt: new Date('2020-01-15'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-6',
      general: {
        id: '4t-6',
        firstName: 'Eva',
        lastName: 'Martens',
        workEmail: 'eva@4takt.be',
        jobTitle: 'Project Manager',
        phone: '+32 15 789 006',
        gsm: '+32 476 66 77 88',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Hoogstraat',
        number: '100',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE234567891',
        nationalNumber: '87.06.18-234.56',
        personalEmail: 'eva.martens@yahoo.com',
        personalPhone: '+32 497 11 22 33',
        birthdate: new Date('1987-06-18'),
        startDate: new Date('2020-04-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'eva@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t6', costPerHour: 75, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2020-04-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-7',
      general: {
        id: '4t-7',
        firstName: 'Luc',
        lastName: 'Peeters',
        workEmail: 'luc@4takt.be',
        jobTitle: 'Technical Lead',
        phone: '+32 15 789 007',
        gsm: '+32 476 77 88 99',
        language: 'NL',
        nationality: 'Netherlands',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: false,
        financialDashboardAccess: false,
        leaveDays: 22,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Veemarkt',
        number: '35',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE345678902',
        nationalNumber: '83.01.28-345.67',
        personalEmail: 'luc.peeters@gmail.com',
        personalPhone: '+32 498 22 33 44',
        birthdate: new Date('1983-01-28'),
        startDate: new Date('2020-09-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'luc@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t7', costPerHour: 85, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2020-09-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-8',
      general: {
        id: '4t-8',
        firstName: 'Nina',
        lastName: 'Jacobs',
        workEmail: 'nina@4takt.be',
        jobTitle: 'Quality Analyst',
        phone: '+32 15 789 008',
        gsm: '+32 476 88 99 00',
        language: 'EN',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: true,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: false,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Dijlepad',
        number: '5',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE456789013',
        nationalNumber: '92.04.15-456.78',
        personalEmail: 'nina.jacobs@outlook.com',
        personalPhone: '+32 499 33 44 55',
        birthdate: new Date('1992-04-15'),
        startDate: new Date('2021-02-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'nina@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t8', costPerHour: 60, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2021-02-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-9',
      general: {
        id: '4t-9',
        firstName: 'Kevin',
        lastName: 'Mertens',
        workEmail: 'kevin@4takt.be',
        jobTitle: 'Junior Consultant',
        phone: '+32 15 789 009',
        gsm: '+32 476 99 00 11',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: true,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: false,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Zandpoortvest',
        number: '60',
        bus: 'C',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE567890124',
        nationalNumber: '97.08.30-567.89',
        personalEmail: 'kevin.mertens@gmail.com',
        personalPhone: '+32 470 44 55 66',
        birthdate: new Date('1997-08-30'),
        startDate: new Date('2022-06-01')
      },
      subscription: { contractType: 'Standard User', workEmail: 'kevin@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t9', costPerHour: 50, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2022-06-01'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    },
    {
      id: '4t-10',
      general: {
        id: '4t-10',
        firstName: 'An',
        lastName: 'De Bruyn',
        workEmail: 'an@4takt.be',
        jobTitle: 'Business Analyst',
        phone: '+32 15 789 010',
        gsm: '+32 476 00 11 22',
        language: 'NL',
        nationality: 'Belgium',
        avatarUrl: null,
        company: '4takt',
        myProjectsOnly: false,
        isEmployee: true,
        responsibleForHR: false,
        crmAccess: true,
        financialDashboardAccess: false,
        leaveDays: 20,
        extraLeaveDays: 0
      },
      confidential: {
        street: 'Haverwerf',
        number: '12',
        bus: '',
        postalCode: '2800',
        city: 'Mechelen',
        country: 'Belgium',
        idNumber: 'BE678901235',
        nationalNumber: '95.12.10-678.90',
        personalEmail: 'an.debruyn@hotmail.com',
        personalPhone: '+32 471 55 66 77',
        birthdate: new Date('1995-12-10'),
        startDate: new Date('2023-01-15')
      },
      subscription: { contractType: 'Standard User', workEmail: 'an@4takt.be', password: '', status: 'Active' },
      costRates: [{ id: 'rate-4t10', costPerHour: 55, effectiveFrom: new Date('2024-01-01'), createdAt: new Date('2024-01-01') }],
      availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date(),
      isFormerEmployee: false,
      terminationDate: null
    }
  ];

  saveUsers(demoUsers);
};

export const clearAllUsers = () => {
  localStorage.removeItem(STORAGE_KEY);
};
