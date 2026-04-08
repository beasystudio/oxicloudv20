// Admin Store - Feature flags, environment settings, and admin tools

export type Environment = 'production' | 'staging' | 'development';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForCompanies: string[]; // Empty = global, or specific company IDs
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyId: string | null;
  companyName: string | null;
  action: string;
  module: string;
  details: string;
}

export interface CompanyLicense {
  companyId: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  seats: number;
  usedSeats: number;
  startDate: string;
  expirationDate: string;
  status: 'active' | 'suspended' | 'expired' | 'trial';
  modules: string[];
  monthlyFee: number;
  autoRenew: boolean;
}

export interface ImpersonationSession {
  adminEmail: string;
  targetUserEmail: string;
  startedAt: string;
}

const FEATURE_FLAGS_KEY = 'oxicloud_feature_flags';
const ACTIVITY_LOGS_KEY = 'oxicloud_activity_logs';
const LICENSES_KEY = 'oxicloud_licenses';
const ENVIRONMENT_KEY = 'oxicloud_environment';
const IMPERSONATION_KEY = 'oxicloud_impersonation';

// Default feature flags
const defaultFeatureFlags: FeatureFlag[] = [
  {
    id: 'nox-module',
    name: 'NOx Calculator Module',
    description: 'Enable NOx emission calculations and compliance tracking',
    enabled: true,
    enabledForCompanies: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'financial-reports',
    name: 'Financial Reports',
    description: 'Advanced financial reporting and analytics',
    enabled: true,
    enabledForCompanies: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Deep analytics and insights dashboard',
    enabled: false,
    enabledForCompanies: ['4takt'],
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01'
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Enable REST API access for integrations',
    enabled: false,
    enabledForCompanies: [],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01'
  },
  {
    id: 'bulk-import',
    name: 'Bulk Import',
    description: 'Import projects and contacts from CSV/Excel',
    enabled: true,
    enabledForCompanies: [],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  }
];

// Default licenses for demo companies
const defaultLicenses: CompanyLicense[] = [
  {
    companyId: 'gdesign',
    plan: 'Professional',
    seats: 10,
    usedSeats: 0, // Will be calculated dynamically
    startDate: '2024-01-01',
    expirationDate: '2025-12-31',
    status: 'active',
    modules: ['projects', 'contacts', 'nox', 'financial'],
    monthlyFee: 299,
    autoRenew: true
  },
  {
    companyId: '4takt',
    plan: 'Enterprise',
    seats: 25,
    usedSeats: 0, // Will be calculated dynamically
    startDate: '2023-06-01',
    expirationDate: '2026-05-31',
    status: 'active',
    modules: ['projects', 'contacts', 'nox', 'financial', 'api', 'analytics'],
    monthlyFee: 799,
    autoRenew: true
  }
];

// Get actual used seats from employee data
export const getActualUsedSeats = (companyId: string): number => {
  const stored = localStorage.getItem('oxicloud_company_employees');
  if (!stored) return 0;
  const employees = JSON.parse(stored);
  return employees.filter((e: any) => e.companyId === companyId && e.isActive).length;
};

// Get license with actual used seats
export const getLicenseWithActualSeats = (companyId: string): CompanyLicense | undefined => {
  const license = getLicenseByCompany(companyId);
  if (!license) return undefined;
  return {
    ...license,
    usedSeats: getActualUsedSeats(companyId)
  };
};

// Get all licenses with actual used seats
export const getLicensesWithActualSeats = (): CompanyLicense[] => {
  return getLicenses().map(license => ({
    ...license,
    usedSeats: getActualUsedSeats(license.companyId)
  }));
};

// Demo activity logs
const generateDemoActivityLogs = (): ActivityLog[] => {
  const logs: ActivityLog[] = [];
  const actions = [
    { action: 'Created project', module: 'Projects' },
    { action: 'Updated contact', module: 'Contacts' },
    { action: 'Generated NOx report', module: 'NOx' },
    { action: 'Viewed financial dashboard', module: 'Financial' },
    { action: 'Added team member', module: 'Users' },
    { action: 'Updated project status', module: 'Projects' },
    { action: 'Exported data', module: 'Reports' },
    { action: 'Logged in', module: 'Auth' }
  ];
  
  const users = [
    { email: 'jan@gdesign.be', name: 'Jan Vermeersch', companyId: 'gdesign', companyName: 'GDesign Architecten' },
    { email: 'thomas@gdesign.be', name: 'Thomas Janssen', companyId: 'gdesign', companyName: 'GDesign Architecten' },
  ];

  // Generate 50 random activity logs over the past 30 days
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const activity = actions[Math.floor(Math.random() * actions.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    logs.push({
      id: `log-${i}`,
      timestamp: date.toISOString(),
      userId: `user-${user.email}`,
      userEmail: user.email,
      userName: user.name,
      companyId: user.companyId,
      companyName: user.companyName,
      action: activity.action,
      module: activity.module,
      details: `${activity.action} in ${activity.module} module`
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Feature Flags
export const getFeatureFlags = (): FeatureFlag[] => {
  const stored = localStorage.getItem(FEATURE_FLAGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const setFeatureFlags = (flags: FeatureFlag[]) => {
  localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
};

export const toggleFeatureFlag = (flagId: string, enabled: boolean) => {
  const flags = getFeatureFlags();
  const index = flags.findIndex(f => f.id === flagId);
  if (index !== -1) {
    flags[index].enabled = enabled;
    flags[index].updatedAt = new Date().toISOString();
    setFeatureFlags(flags);
  }
};

export const isFeatureEnabled = (flagId: string, companyId?: string): boolean => {
  const flags = getFeatureFlags();
  const flag = flags.find(f => f.id === flagId);
  if (!flag) return false;
  
  // Check global enable
  if (flag.enabled && flag.enabledForCompanies.length === 0) return true;
  
  // Check company-specific enable
  if (companyId && flag.enabledForCompanies.includes(companyId)) return true;
  
  return flag.enabled;
};

// Licenses
export const getLicenses = (): CompanyLicense[] => {
  const stored = localStorage.getItem(LICENSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getLicenseByCompany = (companyId: string): CompanyLicense | undefined => {
  return getLicenses().find(l => l.companyId === companyId);
};

export const setLicenses = (licenses: CompanyLicense[]) => {
  localStorage.setItem(LICENSES_KEY, JSON.stringify(licenses));
};

export const updateLicense = (companyId: string, updates: Partial<CompanyLicense>) => {
  const licenses = getLicenses();
  const index = licenses.findIndex(l => l.companyId === companyId);
  if (index !== -1) {
    licenses[index] = { ...licenses[index], ...updates };
    setLicenses(licenses);
  }
};

export const createLicense = (license: CompanyLicense) => {
  const licenses = getLicenses();
  licenses.push(license);
  setLicenses(licenses);
};

// Activity Logs
export const getActivityLogs = (): ActivityLog[] => {
  const stored = localStorage.getItem(ACTIVITY_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
};

// Environment
export const getCurrentEnvironment = (): Environment => {
  const stored = localStorage.getItem(ENVIRONMENT_KEY);
  return (stored as Environment) || 'production';
};

export const setEnvironment = (env: Environment) => {
  localStorage.setItem(ENVIRONMENT_KEY, env);
};

// Impersonation
export const getImpersonationSession = (): ImpersonationSession | null => {
  const stored = localStorage.getItem(IMPERSONATION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const startImpersonation = (adminEmail: string, targetUserEmail: string) => {
  const session: ImpersonationSession = {
    adminEmail,
    targetUserEmail,
    startedAt: new Date().toISOString()
  };
  localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));
};

export const endImpersonation = () => {
  localStorage.removeItem(IMPERSONATION_KEY);
};

// Seed admin data
export const seedAdminData = () => {
  if (!localStorage.getItem(FEATURE_FLAGS_KEY)) {
    setFeatureFlags(defaultFeatureFlags);
  }
  if (!localStorage.getItem(LICENSES_KEY)) {
    setLicenses(defaultLicenses);
  }
  if (!localStorage.getItem(ACTIVITY_LOGS_KEY)) {
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(generateDemoActivityLogs()));
  }
};

// Clear admin data
export const clearAdminData = () => {
  localStorage.removeItem(FEATURE_FLAGS_KEY);
  localStorage.removeItem(ACTIVITY_LOGS_KEY);
  localStorage.removeItem(LICENSES_KEY);
  localStorage.removeItem(ENVIRONMENT_KEY);
  localStorage.removeItem(IMPERSONATION_KEY);
};

// Platform statistics
export const getPlatformStats = () => {
  const licenses = getLicensesWithActualSeats();
  const logs = getActivityLogs();
  
  const totalCompanies = licenses.length;
  const activeCompanies = licenses.filter(l => l.status === 'active').length;
  const totalSeats = licenses.reduce((sum, l) => sum + l.seats, 0);
  const usedSeats = licenses.reduce((sum, l) => sum + l.usedSeats, 0);
  const monthlyRevenue = licenses
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyFee, 0);
  
  // Module usage from logs
  const moduleUsage: Record<string, number> = {};
  logs.forEach(log => {
    moduleUsage[log.module] = (moduleUsage[log.module] || 0) + 1;
  });

  // Activity by day (last 7 days)
  const activityByDay: Record<string, number> = {};
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  logs
    .filter(l => new Date(l.timestamp) >= sevenDaysAgo)
    .forEach(log => {
      const day = new Date(log.timestamp).toLocaleDateString();
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    });

  return {
    totalCompanies,
    activeCompanies,
    totalSeats,
    usedSeats,
    monthlyRevenue,
    annualRevenue: monthlyRevenue * 12,
    moduleUsage,
    activityByDay,
    recentActivity: logs.slice(0, 20)
  };
};
