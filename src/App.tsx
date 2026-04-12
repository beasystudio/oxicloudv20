import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageTransition } from "./components/PageTransition";
import { ThemeWrapper } from "./components/DarkModeWrapper";

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
import PartnerHome from "./pages/dashboard/PartnerHome";
import PartnershipProgram from "./pages/dashboard/PartnershipProgram";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import DemoDashboard from "./pages/dashboard/DemoDashboard";
import ProjectsDashboard from "./pages/dashboard/ProjectsDashboard";
import ContactsDashboard from "./pages/dashboard/ContactsDashboard";
import MailDashboard from "./pages/dashboard/MailDashboard";

import FinancialDashboard from "./pages/dashboard/FinancialDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/dashboard/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

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
        {/* Public / Auth pages - theme-aware */}
        <Route path="/" element={<ThemeWrapper><PageTransition><Index /></PageTransition></ThemeWrapper>} />
        <Route path="/login" element={<ThemeWrapper><PageTransition><Login /></PageTransition></ThemeWrapper>} />
        <Route path="/forgot-password" element={<ThemeWrapper><PageTransition><ForgotPassword /></PageTransition></ThemeWrapper>} />
        <Route path="/reset-password" element={<ThemeWrapper><PageTransition><ResetPassword /></PageTransition></ThemeWrapper>} />
        <Route path="/register" element={<ThemeWrapper><PageTransition><Register /></PageTransition></ThemeWrapper>} />
        <Route path="/activation" element={<ThemeWrapper><PageTransition><Activation /></PageTransition></ThemeWrapper>} />
        <Route path="/about" element={<ThemeWrapper><PageTransition><About /></PageTransition></ThemeWrapper>} />
        <Route path="/contact" element={<ThemeWrapper><PageTransition><Contact /></PageTransition></ThemeWrapper>} />
        <Route path="/for-architects" element={<ThemeWrapper><PageTransition><ForArchitectsPage /></PageTransition></ThemeWrapper>} />
        <Route path="/for-authorities" element={<Navigate to="/" replace />} />
        <Route path="/government-register" element={<Navigate to="/" replace />} />
        <Route path="/book-a-demo" element={<Navigate to="/pilot-demo" replace />} />
        
        {/* Pilot Auth - theme-aware */}
        <Route path="/pilot-demo" element={<Navigate to="/pilot-demo/create-account" replace />} />
        <Route path="/pilot-demo/register" element={<Navigate to="/pilot-demo/create-account" replace />} />
        <Route path="/pilot-demo/activation-sent" element={<ThemeWrapper><PageTransition><PilotActivationSent /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/create-account" element={<ThemeWrapper><PageTransition><PilotCreateAccount /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/login" element={<ThemeWrapper><PageTransition><PilotLogin /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/forgot-password" element={<ThemeWrapper><PageTransition><PilotForgotPassword /></PageTransition></ThemeWrapper>} />

        {/* Pilot Dashboard - theme-aware */}
        <Route path="/pilot-demo/dashboard" element={<ThemeWrapper><PageTransition><PilotDashboard /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/projects" element={<ThemeWrapper><PageTransition><PilotProjects /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/contacts" element={<ThemeWrapper><PageTransition><PilotContacts /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/financial" element={<ThemeWrapper><PageTransition><PilotFinancial /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/settings" element={<ThemeWrapper><PageTransition><PilotSettings /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/profile" element={<ThemeWrapper><PageTransition><PilotProfile /></PageTransition></ThemeWrapper>} />
        <Route path="/pilot-demo/partnership-program" element={<ThemeWrapper><PageTransition><PartnershipProgram /></PageTransition></ThemeWrapper>} />
        
        <Route path="/register/workspace" element={<Navigate to="/pilot-demo/create-account" replace />} />
        
        {/* Dashboard - theme-aware */}
        <Route path="/dashboard/demo" element={<ThemeWrapper><PageTransition><DemoDashboard /></PageTransition></ThemeWrapper>} />
        <Route path="/dashboard/partner" element={<ThemeWrapper><ProtectedRoute allowedRoles={['client_owner', 'client_admin', 'client_user']}><PageTransition><PartnerHome /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/admin" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/licenses" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/lm" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/client/home" element={<ThemeWrapper><ProtectedRoute><PageTransition><ClientDashboard /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/partnership-program" element={<ThemeWrapper><ProtectedRoute><PageTransition><PartnershipProgram /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/profile" element={<ThemeWrapper><ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/settings" element={<ThemeWrapper><ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/projects" element={<ThemeWrapper><ProtectedRoute><PageTransition><ProjectsDashboard /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/nox-settings" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/nox" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/authority" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/authority/*" element={<Navigate to="/dashboard/client/home" replace />} />
        <Route path="/dashboard/contacts" element={<ThemeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'client_owner', 'client_admin', 'client_user']}><PageTransition><ContactsDashboard /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/mail" element={<ThemeWrapper><ProtectedRoute allowedRoles={['client_owner', 'client_admin', 'client_user']}><PageTransition><MailDashboard /></PageTransition></ProtectedRoute></ThemeWrapper>} />
        <Route path="/dashboard/project-binder" element={<Navigate to="/dashboard/projects" replace />} />
        <Route path="/dashboard/financial" element={<ThemeWrapper><ProtectedRoute allowedRoles={['owner', 'admin', 'client_owner', 'client_admin']}><PageTransition><FinancialDashboard /></PageTransition></ProtectedRoute></ThemeWrapper>} />
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
