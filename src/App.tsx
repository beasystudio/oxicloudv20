import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransition } from "./components/PageTransition";
import { DarkModeWrapper } from "./components/DarkModeWrapper";

import { MockAuthProvider } from "./contexts/MockAuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Activation from "./pages/Activation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { ForArchitectsPage } from "./components/landing/ForArchitectsPage";
import { ForAuthoritiesPage } from "./components/landing/ForAuthoritiesPage";
import PartnerHome from "./pages/dashboard/PartnerHome";
import PartnershipProgram from "./pages/dashboard/PartnershipProgram";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CompanyLicenseManager from "./pages/dashboard/CompanyLicenseManager";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import DemoDashboard from "./pages/dashboard/DemoDashboard";
import ProjectsDashboard from "./pages/dashboard/ProjectsDashboard";
import ContactsDashboard from "./pages/dashboard/ContactsDashboard";
import MailDashboard from "./pages/dashboard/MailDashboard";
import NoxDashboard from "./pages/dashboard/NoxDashboard";
import FinancialDashboard from "./pages/dashboard/FinancialDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/dashboard/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
// Authority pages
import AuthorityHome from "./pages/dashboard/authority/AuthorityHome";
import AuthorityProjects from "./pages/dashboard/authority/AuthorityProjects";
import AuthorityRegulatoryHub from "./pages/dashboard/authority/AuthorityRegulatoryHub";
import AuthoritySpatialAnalysis from "./pages/dashboard/authority/AuthoritySpatialAnalysis";
import AuthoritySettings from "./pages/dashboard/authority/AuthoritySettings";
// Pilot Demo pages (now Production Workspace flow)
import PilotLanding from "./pages/pilot/PilotLanding";
import PilotActivationSent from "./pages/pilot/PilotActivationSent";
import PilotCreateAccount from "./pages/pilot/PilotCreateAccount";
import PilotLogin from "./pages/pilot/PilotLogin";
import PilotForgotPassword from "./pages/pilot/PilotForgotPassword";
import PilotDashboard from "./pages/pilot/PilotDashboard";
import PilotProjects from "./pages/pilot/PilotProjects";
import PilotContacts from "./pages/pilot/PilotContacts";
import PilotFinancial from "./pages/pilot/PilotFinancial";
import PilotSettings from "./pages/pilot/PilotSettings";
import PilotProfile from "./pages/pilot/PilotProfile";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  return (
    <Routes>
        {/* Public / Auth pages — Light mode */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/activation" element={<PageTransition><Activation /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/for-architects" element={<PageTransition><ForArchitectsPage /></PageTransition>} />
        <Route path="/for-authorities" element={<PageTransition><ForAuthoritiesPage /></PageTransition>} />
        <Route path="/book-a-demo" element={<Navigate to="/pilot-demo" replace />} />
        
        {/* Pilot Auth — Light mode */}
        <Route path="/pilot-demo" element={<Navigate to="/pilot-demo/create-account" replace />} />
        <Route path="/pilot-demo/register" element={<Navigate to="/pilot-demo/create-account" replace />} />
        <Route path="/pilot-demo/activation-sent" element={<PageTransition><PilotActivationSent /></PageTransition>} />
        <Route path="/pilot-demo/create-account" element={<PageTransition><PilotCreateAccount /></PageTransition>} />
        <Route path="/pilot-demo/login" element={<PageTransition><PilotLogin /></PageTransition>} />
        <Route path="/pilot-demo/forgot-password" element={<PageTransition><PilotForgotPassword /></PageTransition>} />

        {/* Pilot Dashboard — Dark mode */}
        <Route path="/pilot-demo/dashboard" element={<DarkModeWrapper><PageTransition><PilotDashboard /></PageTransition></DarkModeWrapper>} />
        <Route path="/pilot-demo/projects" element={<DarkModeWrapper><PageTransition><PilotProjects /></PageTransition></DarkModeWrapper>} />
        <Route path="/pilot-demo/contacts" element={<DarkModeWrapper><PageTransition><PilotContacts /></PageTransition></DarkModeWrapper>} />
        <Route path="/pilot-demo/financial" element={<DarkModeWrapper><PageTransition><PilotFinancial /></PageTransition></DarkModeWrapper>} />
        <Route path="/pilot-demo/settings" element={<DarkModeWrapper><PageTransition><PilotSettings /></PageTransition></DarkModeWrapper>} />
        <Route path="/pilot-demo/profile" element={<DarkModeWrapper><PageTransition><PilotProfile /></PageTransition></DarkModeWrapper>} />
        <Route path="/pilot-demo/partnership-program" element={<DarkModeWrapper><PageTransition><PartnershipProgram /></PageTransition></DarkModeWrapper>} />
        
        {/* Workspace registration redirect */}
        <Route path="/register/workspace" element={<Navigate to="/pilot-demo/create-account" replace />} />
        
        {/* Demo Dashboard — Dark mode */}
        <Route path="/dashboard/demo" element={<DarkModeWrapper><PageTransition><ClientDashboard /></PageTransition></DarkModeWrapper>} />
        
        {/* Dashboard Routes — Dark mode */}
        <Route path="/dashboard/partner" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['client_owner', 'client_admin', 'client_user']}><PageTransition><PartnerHome /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/admin" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/licenses" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin']}><PageTransition><CompanyLicenseManager /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/lm" element={<Navigate to="/dashboard/licenses" replace />} />
        <Route path="/dashboard/client/home" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'client_owner', 'client_admin', 'client_user']}><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/partnership-program" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['client_owner', 'client_admin', 'client_user']}><PageTransition><PartnershipProgram /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/profile" element={<DarkModeWrapper><ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/settings" element={<DarkModeWrapper><ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/projects" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'client_owner', 'client_admin', 'client_user']}><PageTransition><ProjectsDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/nox-settings" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin']}><PageTransition><NoxDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/nox" element={<Navigate to="/dashboard/nox-settings" replace />} />
        <Route path="/dashboard/authority" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'authority', 'authority_standard']}><PageTransition><AuthorityHome /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/authority/projects" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'authority', 'authority_standard']}><PageTransition><AuthorityProjects /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/authority/regulatory" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'authority', 'authority_standard']}><PageTransition><AuthorityRegulatoryHub /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/authority/spatial" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'authority', 'authority_standard']}><PageTransition><AuthoritySpatialAnalysis /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/authority/settings" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'authority']}><PageTransition><AuthoritySettings /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/contacts" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'client_owner', 'client_admin', 'client_user']}><PageTransition><ContactsDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/mail" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['client_owner', 'client_admin', 'client_user']}><PageTransition><MailDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/dashboard/project-binder" element={<Navigate to="/dashboard/projects" replace />} />
        <Route path="/dashboard/financial" element={<DarkModeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'client_owner', 'client_admin']}><PageTransition><FinancialDashboard /></PageTransition></ProtectedRoute></DarkModeWrapper>} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/projects" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>);
};

const App = () =>
<QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </MockAuthProvider>
  </QueryClientProvider>;


export default App;
