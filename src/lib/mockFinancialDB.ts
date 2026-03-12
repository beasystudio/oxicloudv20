// Mock Financial Database for company revenue tracking

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
  projects: number;
}

export interface FiscalYear {
  year: number;
  totalRevenue: number;
  subscriptionRevenue: number;
  projectRevenue: number;
  activeUsers: number;
  projectsCompleted: number;
  monthlyData: MonthlyRevenue[];
}

export interface CompanyFinancials {
  companyId: string;
  companyName: string;
  contractStartDate: string;
  currentPlan: 'Starter' | 'Professional' | 'Enterprise';
  monthlyFee: number;
  fiscalYears: FiscalYear[];
}

// Generate monthly data for a fiscal year
const generateMonthlyData = (baseRevenue: number, variance: number): MonthlyRevenue[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => {
    const seasonal = i >= 5 && i <= 8 ? 0.85 : 1; // Summer slowdown
    const growth = 1 + (i * 0.02); // Monthly growth
    const randomVariance = 1 + (Math.random() - 0.5) * variance;
    const revenue = Math.round(baseRevenue * seasonal * growth * randomVariance);
    return {
      month,
      revenue,
      subscriptions: Math.round(revenue * 0.4),
      projects: Math.round(revenue * 0.6),
    };
  });
};

// Demo data for GDesign Architecten - Growing company
const gdesignFinancials: CompanyFinancials = {
  companyId: 'gdesign',
  companyName: 'GDesign Architecten',
  contractStartDate: '2020-03-15',
  currentPlan: 'Professional',
  monthlyFee: 299,
  fiscalYears: [
    {
      year: 2020,
      totalRevenue: 2400,
      subscriptionRevenue: 2400,
      projectRevenue: 0,
      activeUsers: 2,
      projectsCompleted: 3,
      monthlyData: generateMonthlyData(200, 0.1),
    },
    {
      year: 2021,
      totalRevenue: 8500,
      subscriptionRevenue: 3588,
      projectRevenue: 4912,
      activeUsers: 4,
      projectsCompleted: 12,
      monthlyData: generateMonthlyData(700, 0.15),
    },
    {
      year: 2022,
      totalRevenue: 18200,
      subscriptionRevenue: 3588,
      projectRevenue: 14612,
      activeUsers: 6,
      projectsCompleted: 28,
      monthlyData: generateMonthlyData(1500, 0.2),
    },
    {
      year: 2023,
      totalRevenue: 32500,
      subscriptionRevenue: 3588,
      projectRevenue: 28912,
      activeUsers: 8,
      projectsCompleted: 45,
      monthlyData: generateMonthlyData(2700, 0.15),
    },
    {
      year: 2024,
      totalRevenue: 48600,
      subscriptionRevenue: 3588,
      projectRevenue: 45012,
      activeUsers: 12,
      projectsCompleted: 67,
      monthlyData: generateMonthlyData(4050, 0.1),
    },
  ],
};

// OxiCloud's own financials - revenue from client subscriptions
const oxicloudFinancials: CompanyFinancials = {
  companyId: 'oxicloud',
  companyName: 'OxiCloud',
  contractStartDate: '2019-01-01',
  currentPlan: 'Enterprise',
  monthlyFee: 0,
  fiscalYears: [
    {
      year: 2020,
      totalRevenue: 44400, // GDesign €2,400 + 4TAKT €42,000 subscriptions
      subscriptionRevenue: 10776, // €299*9 + €599*12
      projectRevenue: 0, // OxiCloud doesn't have project revenue, only subscriptions
      activeUsers: 2, // Number of client companies
      projectsCompleted: 0,
      monthlyData: generateMonthlyData(3700, 0.05),
    },
    {
      year: 2021,
      totalRevenue: 64500,
      subscriptionRevenue: 10776,
      projectRevenue: 0,
      activeUsers: 2,
      projectsCompleted: 0,
      monthlyData: generateMonthlyData(5375, 0.08),
    },
    {
      year: 2022,
      totalRevenue: 86200,
      subscriptionRevenue: 10776,
      projectRevenue: 0,
      activeUsers: 2,
      projectsCompleted: 0,
      monthlyData: generateMonthlyData(7183, 0.1),
    },
    {
      year: 2023,
      totalRevenue: 104500,
      subscriptionRevenue: 10776,
      projectRevenue: 0,
      activeUsers: 2,
      projectsCompleted: 0,
      monthlyData: generateMonthlyData(8708, 0.08),
    },
    {
      year: 2024,
      totalRevenue: 127100,
      subscriptionRevenue: 10776,
      projectRevenue: 0,
      activeUsers: 2,
      projectsCompleted: 0,
      monthlyData: generateMonthlyData(10592, 0.06),
    },
  ],
};

// Export OxiCloud financials for internal use
export const getOxiCloudFinancials = (): CompanyFinancials => {
  return oxicloudFinancials;
};

// Demo data for 4TAKT - Stable established company
const fourTaktFinancials: CompanyFinancials = {
  companyId: '4takt',
  companyName: '4TAKT',
  contractStartDate: '2019-01-10',
  currentPlan: 'Enterprise',
  monthlyFee: 599,
  fiscalYears: [
    {
      year: 2020,
      totalRevenue: 42000,
      subscriptionRevenue: 7188,
      projectRevenue: 34812,
      activeUsers: 15,
      projectsCompleted: 52,
      monthlyData: generateMonthlyData(3500, 0.1),
    },
    {
      year: 2021,
      totalRevenue: 56000,
      subscriptionRevenue: 7188,
      projectRevenue: 48812,
      activeUsers: 18,
      projectsCompleted: 68,
      monthlyData: generateMonthlyData(4650, 0.12),
    },
    {
      year: 2022,
      totalRevenue: 68000,
      subscriptionRevenue: 7188,
      projectRevenue: 60812,
      activeUsers: 22,
      projectsCompleted: 85,
      monthlyData: generateMonthlyData(5650, 0.15),
    },
    {
      year: 2023,
      totalRevenue: 72000,
      subscriptionRevenue: 7188,
      projectRevenue: 64812,
      activeUsers: 24,
      projectsCompleted: 92,
      monthlyData: generateMonthlyData(6000, 0.1),
    },
    {
      year: 2024,
      totalRevenue: 78500,
      subscriptionRevenue: 7188,
      projectRevenue: 71312,
      activeUsers: 28,
      projectsCompleted: 108,
      monthlyData: generateMonthlyData(6540, 0.08),
    },
  ],
};

// Storage key
const STORAGE_KEY = 'mockFinancialData';

// Initialize or get financial data
export const getFinancialData = (): CompanyFinancials[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const initialData = [gdesignFinancials, fourTaktFinancials];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Get financial data for a specific company
export const getCompanyFinancials = (companyId: string): CompanyFinancials | undefined => {
  const data = getFinancialData();
  return data.find(c => c.companyId === companyId);
};

// Get financial data by company name
export const getFinancialsByCompanyName = (companyName: string): CompanyFinancials | undefined => {
  const data = getFinancialData();
  return data.find(c => c.companyName.toLowerCase().includes(companyName.toLowerCase()));
};

// Seed demo financial data
export const seedFinancialData = () => {
  const initialData = [gdesignFinancials, fourTaktFinancials];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Clear all financial data
export const clearFinancialData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get aggregated stats across all companies
export const getAggregatedStats = () => {
  const data = getFinancialData();
  const currentYear = 2024;
  
  let totalRevenue = 0;
  let totalActiveUsers = 0;
  let totalProjects = 0;
  
  data.forEach(company => {
    const currentYearData = company.fiscalYears.find(fy => fy.year === currentYear);
    if (currentYearData) {
      totalRevenue += currentYearData.totalRevenue;
      totalActiveUsers += currentYearData.activeUsers;
      totalProjects += currentYearData.projectsCompleted;
    }
  });
  
  return {
    totalRevenue,
    totalActiveUsers,
    totalProjects,
    totalCompanies: data.length,
  };
};

// Calculate growth percentage
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
};
