import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  seedCompanyData, 
  getCompaniesForUser, 
  setupMultiCompanyUser, 
  isCompanyDataSeeded,
  type Company 
} from '@/lib/mockCompanyDB';
import { seedAdminData } from '@/lib/adminStore';
import { seedDemoLocalProject } from '@/lib/mockLocalProjects';
import { seedAllDemoData } from '@/lib/seedDemoData';
import { getUserByEmail as getDbUserByEmail } from '@/lib/mockUserDB';
import { isDemoEnvironmentUser } from '@/lib/pilotAccountUtils';

export type UserRole = 'owner' | 'admin' | 'client_owner' | 'client_admin' | 'client_user' | 'authority' | 'authority_standard';

export interface MockUser {
  email: string;
  password: string | null;
  role: UserRole;
  activated: boolean;
  activationPending: boolean;
  activationToken: string | null;
  name: string;
  company: string;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  payload: any;
  status: 'success' | 'error';
}

interface MockAuthContextType {
  currentUser: MockUser | null;
  users: MockUser[];
  apiLogs: ApiLog[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  activateAccount: (token: string, password: string) => { success: boolean; error?: string };
  sendActivationEmail: (email: string) => { success: boolean; error?: string; token?: string };
  createAdmin: (email: string, name: string) => { success: boolean; error?: string; token?: string };
  createClient: (companyName: string, ownerEmail: string, ownerName: string) => { success: boolean; error?: string; token?: string };
  createClientUser: (email: string, name: string, companyName: string) => { success: boolean; error?: string };
  deleteUser: (email: string) => { success: boolean; error?: string };
  canDelete: (targetEmail: string) => boolean;
  forceActivate: (email: string) => { success: boolean; error?: string };
  runDemoSetup: () => void;
  updateProfile: (name: string) => { success: boolean; error?: string };
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  logApiCall: (method: string, endpoint: string, payload: any) => void;
  switchToUser: (email: string) => { success: boolean; error?: string };
  companyLogo: string | null;
  setCompanyLogo: (logo: string | null) => void;
  companyDisplayName: string | null;
  setCompanyDisplayName: (name: string) => void;
  // Multi-company support
  userCompanies: Company[];
  selectedCompanyId: string | null;
  setSelectedCompanyId: (companyId: string) => void;
  getSelectedCompany: () => Company | null;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

// Pre-seeded demo users - all activated and ready to use
const initialUsers: MockUser[] = [
  {
    email: 'jan@gdesign.be',
    password: 'demo123',
    role: 'client_owner',
    activated: true,
    activationPending: false,
    activationToken: null,
    name: 'Jan Vermeersch',
    company: 'GDesign Architecten',
    createdAt: new Date().toISOString()
  },
  // Pilot account - clean slate for onboarding experience
  // IMPORTANT: This account is COMPLETELY SEPARATE from GDesign/4TAKT demo data
  // Pilot = first-time user with empty data everywhere
  {
    email: 'demo@oxicloud.be',
    password: 'demo123',
    role: 'client_owner',
    activated: true,
    activationPending: false,
    activationToken: null,
    name: 'Demo User',
    company: 'My Architecture Firm', // Matches PILOT_COMPANY_NAME in pilotAccountUtils
    createdAt: new Date().toISOString()
  }
];

const generateToken = () => 'TOKEN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

const addApiLog = (method: string, endpoint: string, payload: any, status: 'success' | 'error' = 'success'): ApiLog => {
  return {
    id: Math.random().toString(36),
    timestamp: new Date().toISOString(),
    method,
    endpoint,
    payload,
    status
  };
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string>>({});
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string | null>(null);

  // Load user's companies when user changes
  useEffect(() => {
    if (currentUser) {
      const companies = getCompaniesForUser(currentUser.email);
      setUserCompanies(companies);
      
      // Restore selected company from localStorage or default to first
      const storedSelectedCompany = localStorage.getItem('selectedCompanyId');
      if (storedSelectedCompany && companies.some(c => c.id === storedSelectedCompany)) {
        setSelectedCompanyIdState(storedSelectedCompany);
      } else if (companies.length > 0) {
        setSelectedCompanyIdState(companies[0].id);
        localStorage.setItem('selectedCompanyId', companies[0].id);
      }
    } else {
      setUserCompanies([]);
      setSelectedCompanyIdState(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('mockUsers');
    const storedCurrentUser = localStorage.getItem('mockCurrentUser');
    const storedApiLogs = localStorage.getItem('mockApiLogs');
    const storedCompanyLogos = localStorage.getItem('mockCompanyLogos');
    const storedCompanyNames = localStorage.getItem('mockCompanyNames');
    
    if (storedUsers) {
      // Merge stored users with initialUsers to pick up name changes AND add new initial users
      const parsedUsers: MockUser[] = JSON.parse(storedUsers);
      
      // Update existing users with any name changes from initialUsers
      const mergedUsers = parsedUsers.map(storedUser => {
        const initialUser = initialUsers.find(u => u.email === storedUser.email);
        if (initialUser) {
          return { ...storedUser, name: initialUser.name };
        }
        return storedUser;
      });
      
      // Add any new initial users that aren't in stored data (like the pilot account)
      const newInitialUsers = initialUsers.filter(
        initialUser => !parsedUsers.some(stored => stored.email === initialUser.email)
      );
      
      const finalUsers = [...mergedUsers, ...newInitialUsers];
      setUsers(finalUsers);
      localStorage.setItem('mockUsers', JSON.stringify(finalUsers));
      
      // Also update current user if logged in
      if (storedCurrentUser) {
        const parsedCurrentUser: MockUser = JSON.parse(storedCurrentUser);
        const initialUser = initialUsers.find(u => u.email === parsedCurrentUser.email);
        if (initialUser) {
          const updatedCurrentUser = { ...parsedCurrentUser, name: initialUser.name };
          setCurrentUser(updatedCurrentUser);
          localStorage.setItem('mockCurrentUser', JSON.stringify(updatedCurrentUser));
        } else {
          setCurrentUser(parsedCurrentUser);
        }
      }
    } else {
      setUsers(initialUsers);
      localStorage.setItem('mockUsers', JSON.stringify(initialUsers));
      
      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    }

    if (storedApiLogs) {
      setApiLogs(JSON.parse(storedApiLogs));
    }

    if (storedCompanyLogos) {
      setCompanyLogos(JSON.parse(storedCompanyLogos));
    }

    if (storedCompanyNames) {
      setCompanyNames(JSON.parse(storedCompanyNames));
    }
  }, []);

  const setSelectedCompanyId = (companyId: string) => {
    setSelectedCompanyIdState(companyId);
    localStorage.setItem('selectedCompanyId', companyId);
  };

  const getSelectedCompany = (): Company | null => {
    return userCompanies.find(c => c.id === selectedCompanyId) || null;
  };

  const updateUsers = (newUsers: MockUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('mockUsers', JSON.stringify(newUsers));
  };

  const addLog = (method: string, endpoint: string, payload: any, status: 'success' | 'error' = 'success') => {
    const log = addApiLog(method, endpoint, payload, status);
    const newLogs = [log, ...apiLogs].slice(0, 50);
    setApiLogs(newLogs);
    localStorage.setItem('mockApiLogs', JSON.stringify(newLogs));
  };

  const logApiCall = (method: string, endpoint: string, payload: any) => {
    addLog(method, endpoint, payload, 'success');
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    addLog('POST', '/api/mock/login', { email });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.activationPending || !user.activated) {
      return { success: false, error: 'Account not activated. Please activate your account first.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // Merge with initialUsers data to get latest company name and other fields
    const initialUser = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const mergedUser = initialUser ? { ...user, company: initialUser.company, name: initialUser.name } : user;

    if (isDemoEnvironmentUser(mergedUser.email)) {
      sessionStorage.removeItem('oxicloud_demo_welcome_dismissed');
    }

    setCurrentUser(mergedUser);
    localStorage.setItem('mockCurrentUser', JSON.stringify(mergedUser));

    // Always ensure demo data is seeded on every login — synchronous so dashboard sees it immediately
    if (!isCompanyDataSeeded()) {
      seedCompanyData();
    }
    setupMultiCompanyUser();
    seedAdminData();
    seedAllDemoData();

    return { success: true };
  };

  const switchToUser = (email: string) => {
    let targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!targetUser) {
      const dbUser = getDbUserByEmail(email);
      if (!dbUser) {
        return { success: false, error: 'Gebruiker niet gevonden' };
      }
      
      const isPU = dbUser.subscription?.contractType === 'Power User/Admin';
      const role: UserRole = isPU ? 'client_admin' : 'client_user';
      
      targetUser = {
        email: dbUser.general.workEmail,
        password: 'demo123',
        role,
        activated: true,
        activationPending: false,
        activationToken: null,
        name: `${dbUser.general.firstName} ${dbUser.general.lastName}`,
        company: currentUser?.company || '',
        createdAt: new Date().toISOString()
      };
      
      updateUsers([...users, targetUser]);
    }
    
    setCurrentUser(targetUser);
    localStorage.setItem('mockCurrentUser', JSON.stringify(targetUser));
    addLog('POST', '/api/mock/switch-user', { email });
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mockCurrentUser');
    addLog('POST', '/api/mock/logout', {});
  };

  const activateAccount = (token: string, password: string) => {
    const userIndex = users.findIndex(u => u.activationToken === token);
    
    if (userIndex === -1) {
      addLog('POST', '/api/mock/activate', { token }, 'error');
      return { success: false, error: 'Invalid activation token' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password,
      activated: true,
      activationPending: false,
      activationToken: null
    };

    updateUsers(updatedUsers);
    addLog('POST', '/api/mock/activate', { token, email: updatedUsers[userIndex].email });
    return { success: true };
  };

  const sendActivationEmail = (email: string) => {
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    const token = generateToken();
    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      activationToken: token
    };

    updateUsers(updatedUsers);
    addLog('POST', '/api/mock/send-activation', { email, token });
    return { success: true, token };
  };

  const createAdmin = (email: string, name: string) => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'User already exists' };
    }

    const token = generateToken();
    const newUser: MockUser = {
      email,
      password: null,
      role: 'admin',
      activated: false,
      activationPending: true,
      activationToken: token,
      name,
      company: 'OxiCloud',
      createdAt: new Date().toISOString()
    };

    updateUsers([...users, newUser]);
    addLog('POST', '/api/mock/create-admin', { email, name, token });
    return { success: true, token };
  };

  const createClient = (companyName: string, ownerEmail: string, ownerName: string) => {
    if (users.find(u => u.email.toLowerCase() === ownerEmail.toLowerCase())) {
      return { success: false, error: 'User already exists' };
    }

    const token = generateToken();
    const newUser: MockUser = {
      email: ownerEmail,
      password: null,
      role: 'client_owner',
      activated: false,
      activationPending: true,
      activationToken: token,
      name: ownerName,
      company: companyName,
      createdAt: new Date().toISOString()
    };

    updateUsers([...users, newUser]);
    addLog('POST', '/api/mock/create-client', { companyName, ownerEmail, ownerName, token });
    return { success: true, token };
  };

  const createClientUser = (email: string, name: string, companyName: string) => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'User already exists' };
    }

    // Client users are auto-activated
    const newUser: MockUser = {
      email,
      password: 'temppass123',
      role: 'client_user',
      activated: true,
      activationPending: false,
      activationToken: null,
      name,
      company: companyName,
      createdAt: new Date().toISOString()
    };

    updateUsers([...users, newUser]);
    addLog('POST', '/api/mock/create-user', { email, name, company: companyName });
    return { success: true };
  };

  const canDelete = (targetEmail: string): boolean => {
    if (!currentUser) return false;
    
    const target = users.find(u => u.email === targetEmail);
    if (!target) return false;

    // Role hierarchy: owner > admin > client_owner > client_admin > client_user
    const roleHierarchy: Record<UserRole, number> = { owner: 5, admin: 4, client_owner: 3, client_admin: 2, client_user: 1, authority: 3, authority_standard: 2 };
    const currentRoleLevel = roleHierarchy[currentUser.role];
    const targetRoleLevel = roleHierarchy[target.role];

    // Can only delete users with lower role level
    return currentRoleLevel > targetRoleLevel;
  };

  const deleteUser = (email: string) => {
    if (!canDelete(email)) {
      return { success: false, error: 'Permission denied - cannot delete this user' };
    }

    const updatedUsers = users.filter(u => u.email !== email);
    updateUsers(updatedUsers);
    addLog('DELETE', '/api/mock/delete-user', { email });
    return { success: true };
  };

  const forceActivate = (email: string) => {
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: 'demo123',
      activated: true,
      activationPending: false,
      activationToken: null
    };

    updateUsers(updatedUsers);
    addLog('POST', '/api/mock/force-activate', { email });
    return { success: true };
  };

  const runDemoSetup = () => {
    // Seed company data first
    seedCompanyData();
    setupMultiCompanyUser(); // Add Jan to both companies
    seedAdminData(); // Seed feature flags, licenses, activity logs
    seedDemoLocalProject(); // Seed demo projects for NOx module
    
    let demoUsers = [...users];
    
    // Activate Paul
    const paulIndex = demoUsers.findIndex(u => u.email === 'paul@oxicloud.com');
    if (paulIndex !== -1) {
      demoUsers[paulIndex] = {
        ...demoUsers[paulIndex],
        password: 'demo123',
        activated: true,
        activationPending: false,
        activationToken: null
      };
    } else {
      // Create Paul if not exists
      demoUsers.push({
        email: 'paul@oxicloud.com',
        password: 'demo123',
        role: 'owner',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Paul',
        company: 'OxiCloud',
        createdAt: new Date().toISOString()
      });
    }

    // Create and activate Christine (Admin)
    if (!demoUsers.find(u => u.email === 'christine@oxicloud.com')) {
      demoUsers.push({
        email: 'christine@oxicloud.com',
        password: 'demo123',
        role: 'admin',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Christine',
        company: 'OxiCloud',
        createdAt: new Date().toISOString()
      });
    }

    // Create and activate Client Owner (Jan - belongs to both GDesign and 4TAKT)
    if (!demoUsers.find(u => u.email === 'jan@gdesign.be')) {
      demoUsers.push({
        email: 'jan@gdesign.be',
        password: 'demo123',
        role: 'client_owner',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Jan Vermeersch',
        company: 'GDesign Architecten',
        createdAt: new Date().toISOString()
      });
    }

    // Create Client Admin
    if (!demoUsers.find(u => u.email === 'maria@gdesign.be')) {
      demoUsers.push({
        email: 'maria@gdesign.be',
        password: 'demo123',
        role: 'client_admin',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Maria Peeters',
        company: 'GDesign Architecten',
        createdAt: new Date().toISOString()
      });
    }

    // Create Client User (auto-activated)
    if (!demoUsers.find(u => u.email === 'lisa@gdesign.be')) {
      demoUsers.push({
        email: 'lisa@gdesign.be',
        password: 'demo123',
        role: 'client_user',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Lisa De Smet',
        company: 'GDesign Architecten',
        createdAt: new Date().toISOString()
      });
    }

    // Create Authority Users (permit officers)
    // Power User - has access to Settings
    if (!demoUsers.find(u => u.email === 'koen@antwerpen.be')) {
      demoUsers.push({
        email: 'koen@antwerpen.be',
        password: 'demo123',
        role: 'authority',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Koen Van den Berg',
        company: 'Stad Antwerpen',
        createdAt: new Date().toISOString()
      });
    }
    
    // Standard User - no access to Settings
    if (!demoUsers.find(u => u.email === 'els@antwerpen.be')) {
      demoUsers.push({
        email: 'els@antwerpen.be',
        password: 'demo123',
        role: 'authority_standard',
        activated: true,
        activationPending: false,
        activationToken: null,
        name: 'Els Peeters',
        company: 'Stad Antwerpen',
        createdAt: new Date().toISOString()
      });
    }

    updateUsers(demoUsers);
    
    // Refresh user companies if currently logged in
    if (currentUser) {
      const companies = getCompaniesForUser(currentUser.email);
      setUserCompanies(companies);
      if (companies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(companies[0].id);
      }
    }
    
    addLog('POST', '/api/mock/demo-setup', { usersCreated: demoUsers.length, companiesSeeded: true });
  };

  const updateProfile = (name: string) => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    if (name.trim().length === 0) {
      return { success: false, error: 'Name cannot be empty' };
    }

    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      name: name.trim()
    };

    const updatedUser = updatedUsers[userIndex];
    updateUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('mockCurrentUser', JSON.stringify(updatedUser));
    
    return { success: true };
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    if (currentUser.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword
    };

    const updatedUser = updatedUsers[userIndex];
    updateUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('mockCurrentUser', JSON.stringify(updatedUser));
    
    return { success: true };
  };

  // Get current user's company logo - keyed by selectedCompanyId for per-company logos
  const logoKey = selectedCompanyId || currentUser?.company || '';
  const companyLogo = currentUser ? companyLogos[logoKey] || null : null;

  // Set company logo (only for client_owner/client_admin) - keyed by selectedCompanyId
  const setCompanyLogo = (logo: string | null) => {
    if (!currentUser || (currentUser.role !== 'client_owner' && currentUser.role !== 'client_admin')) return;
    
    const key = selectedCompanyId || currentUser.company;
    const newLogos = { ...companyLogos };
    if (logo) {
      newLogos[key] = logo;
    } else {
      delete newLogos[key];
    }
    setCompanyLogos(newLogos);
    localStorage.setItem('mockCompanyLogos', JSON.stringify(newLogos));
    addLog('POST', '/api/mock/company-logo', { company: key, hasLogo: !!logo });
  };

  // Get current user's company display name
  const companyDisplayName = currentUser ? companyNames[currentUser.company] || null : null;

  // Set company display name (only for client_owner)
  const setCompanyDisplayName = (name: string) => {
    if (!currentUser || currentUser.role !== 'client_owner') return;
    
    const newNames = { ...companyNames };
    newNames[currentUser.company] = name;
    setCompanyNames(newNames);
    localStorage.setItem('mockCompanyNames', JSON.stringify(newNames));
    addLog('POST', '/api/mock/company-name', { company: currentUser.company, displayName: name });
  };

  return (
    <MockAuthContext.Provider value={{ 
      currentUser, 
      users, 
      apiLogs,
      login, 
      logout, 
      activateAccount,
      sendActivationEmail,
      createAdmin,
      createClient,
      createClientUser,
      deleteUser,
      canDelete,
      forceActivate,
      runDemoSetup,
      updateProfile,
      changePassword,
      logApiCall,
      switchToUser,
      companyLogo,
      setCompanyLogo,
      companyDisplayName,
      setCompanyDisplayName,
      // Multi-company support
      userCompanies,
      selectedCompanyId,
      setSelectedCompanyId,
      getSelectedCompany
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};
