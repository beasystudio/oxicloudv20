import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, ChevronDown, ChevronRight, User, Users, X, Download, Clock, Play, ArrowRight, CreditCard, FileCheck, RefreshCw, Trash2, Plus, UserPlus, Building, Building2, ArrowDown, ArrowUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OxiCloudStatusBadge } from '@/components/oxicloud/OxiCloudStatusBadge';
import { NoxStatusDot } from '@/components/oxicloud/NoxStatusDot';
import { PreEstimationForm } from '@/components/oxicloud/PreEstimationForm';
import { PriceReviewScreen } from '@/components/oxicloud/PriceReviewScreen';
import { QuoteFlow } from '@/components/oxicloud/quote-flow/QuoteFlow';
import { NoxPaymentDemoFlow } from '@/components/oxicloud/NoxPaymentDemoFlow';
import { DetailedCalculationForm } from '@/components/oxicloud/DetailedCalculationForm';
import { OxiCloudResultScreen } from '@/components/oxicloud/OxiCloudResultScreen';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useToast } from '@/hooks/use-toast';
import { getAllLocalProjects, getProjectContacts, updateLocalProject, deleteLocalProject, type LocalProject, type ProjectContact } from '@/lib/mockLocalProjects';
import { getEmployeesByCompany, type CompanyEmployee } from '@/lib/mockCompanyDB';
import { getNoxDataByProjectId, getNoxProjects, initializeNoxProject, saveNoxPreEstimation, generateNoxPrice, setNoxAwaitingPayment, processNoxPayment, saveNoxDetailedCalculation, updateNoxSubStatus, updateNoxData, cloneNoxVersion, NoxProject } from '@/lib/noxProjectStore';
import { addNotification } from '@/lib/notificationStore';
import { OxiCloudProjectStatus, NoxSubStatus, STATUS_CONFIG, SUB_STATUS_OPTIONS, SUB_STATUS_CONFIG, PreEstimationData, DetailedCalculationData, OxiCloudProject } from '@/types/oxicloud';
import { getTranslatedStatusLabel } from '@/lib/statusLabels';
import { ProjectNoxStatusCard } from '@/components/oxicloud/ProjectNoxStatusCard';
import type { Contact } from '@/types/contact';
import { AddExistingContactDialog } from '@/components/projects/AddExistingContactDialog';
import { CreateProjectContactDialog } from '@/components/projects/CreateProjectContactDialog';
import { CreateNewProjectDialog } from '@/components/projects/CreateNewProjectDialog';
import { ProjectContactDetailModal, type ProjectContactData, type ProjectInfo } from '@/components/projects/ProjectContactDetailModal';
import { ProjectImagePreview } from '@/components/projects/ProjectImagePreview';
import { PaymentSuccessDialog } from '@/components/oxicloud/PaymentSuccessDialog';
import { ProjectLocationMap } from '@/components/projects/ProjectLocationMap';
import { NoxVersionHistory } from '@/components/projects/NoxVersionHistory';

import { getMonitorProjects, type MonitorProject } from '@/lib/monitorProjectStore';
import { MonitorValidationFlow } from '@/components/authority/MonitorValidationFlow';
import { MonitorAuditLog } from '@/components/authority/MonitorAuditLog';
import { MonitorProjectUploadDialog } from '@/components/authority/MonitorProjectUploadDialog';

// Admin product tab type
type AdminProductTab = 'oxicloud' | 'monitor';

// NOx flow step type
type NoxFlowStep = null | 'pre-estimation' | 'quote-flow' | 'awaiting-payment' | 'price-review' | 'payment' | 'detailed-calculation' | 'results';

// Adapter to convert NoxProject to OxiCloudProject format for existing components
function toOxiCloudProject(project: NoxProject): OxiCloudProject | null {
  if (!project.noxData) return null;
  return {
    id: project.id,
    userId: '',
    name: project.name,
    status: project.noxData.status,
    preEstimation: project.noxData.preEstimation,
    priceData: project.noxData.priceData,
    paymentData: project.noxData.paymentData,
    detailedCalculation: project.noxData.detailedCalculation,
    calculationResults: project.noxData.calculationResults,
    reportJobQueued: project.noxData.reportJobQueued,
    createdAt: project.noxData.noxCreatedAt,
    updatedAt: project.noxData.noxUpdatedAt
  };
}

// View states
type ViewState = 'default' | 'list' | 'binder';

// Extended contact interface for the binder view
interface BinderContact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile?: string;
  company: string;
  companyType: 'client' | 'team' | 'others';
  function?: string;
  vatNumber?: string;
  invoiceAddress?: string;
  workPhone?: string;
  isCompany?: boolean;
}

// Mock coordinates for demo projects
const projectCoordinates: Record<string, {
  lat: number;
  lng: number;
}> = {
  'proj-gdesign-001': {
    lat: 50.9297,
    lng: 4.4320
  },
  'proj-gdesign-002': {
    lat: 50.8503,
    lng: 4.3517
  },
  'proj-gdesign-003': {
    lat: 51.0259,
    lng: 4.4777
  },
  'proj-4takt-001': {
    lat: 51.0543,
    lng: 3.7174
  }
};

// Helper function to format phone numbers for readability
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+32') || cleaned.startsWith('0')) {
    const normalized = cleaned.startsWith('+32') ? cleaned.slice(3) : cleaned.slice(1);
    if (normalized.length >= 8) {
      return `0${normalized.slice(0, 2)} / ${normalized.slice(2, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7)}`;
    }
  }
  return phone;
};
const ProjectsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const {
    currentUser,
    selectedCompanyId,
    getSelectedCompany
  } = useMockAuth();
  const selectedCompany = getSelectedCompany();
  const {
    toast
  } = useToast();
  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const { language } = useLanguage();

  // Admin product tab
  const [adminProductTab, setAdminProductTab] = useState<AdminProductTab>('oxicloud');
  const [monitorUploadOpen, setMonitorUploadOpen] = useState(false);
  const [selectedMonitorProject, setSelectedMonitorProject] = useState<MonitorProject | null>(null);
  const [monitorRefreshKey, setMonitorRefreshKey] = useState(0);

  // Payment success dialog state
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [paymentProjectName, setPaymentProjectName] = useState('');

  // View state
  const [currentView, setCurrentView] = useState<ViewState>('default');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lastSelectedProjectId, setLastSelectedProjectId] = useState<string | null>(null);

  // NOx flow state
  const [noxFlowStep, setNoxFlowStep] = useState<NoxFlowStep>(null);
  const [noxProjectsRefreshKey, setNoxProjectsRefreshKey] = useState(0);
  const [quoteReference, setQuoteReference] = useState<string>('');

  // Refresh NOx data whenever the route changes (not just on handleNoxBack)
  useEffect(() => {
    setNoxProjectsRefreshKey((prev) => prev + 1);
  }, [location.pathname]);

  // Search & filter state
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [listSearchNumber, setListSearchNumber] = useState("");
  const [listSearchName, setListSearchName] = useState("");
  const [searchMyActiveProjects, setSearchMyActiveProjects] = useState(false);

  // Default view filter state
  const [defaultFilterNumber, setDefaultFilterNumber] = useState("");
  const [defaultFilterName, setDefaultFilterName] = useState("");
  const [defaultFilterPlot, setDefaultFilterPlot] = useState("");
  const [defaultFilterLocation, setDefaultFilterLocation] = useState("");
  const [defaultFilterManager, setDefaultFilterManager] = useState("");
  const [defaultFilterTeamMembers, setDefaultFilterTeamMembers] = useState("");
  const [defaultFilterCustom, setDefaultFilterCustom] = useState("");
  const [defaultFilterNoxStatus, setDefaultFilterNoxStatus] = useState<OxiCloudProjectStatus | "all">("all");

  // Binder state
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactFilter, setContactFilter] = useState<'all' | 'client' | 'team' | 'others'>('all');
  const [selectedContact, setSelectedContact] = useState<BinderContact | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [modalContact, setModalContact] = useState<ProjectContactData | null>(null);
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<LocalProject | null>(null);
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);

  // Delete project state
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Contact dialogs state
  const [isAddExistingContactOpen, setIsAddExistingContactOpen] = useState(false);
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [contactsRefreshKey, setContactsRefreshKey] = useState(0);
  const [noxSubStatusRefreshKey, setNoxSubStatusRefreshKey] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const canEditProject = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin';

  // Get current NoxProject for the selected project
  const currentNoxProject = useMemo((): NoxProject | null => {
    if (!selectedProjectId) return null;
    const noxProjects = getNoxProjects();
    return noxProjects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, noxProjectsRefreshKey]);

  // Handle navigation state (payment success, deep-link from dashboard Action Required)
  useEffect(() => {
    const state = location.state as {
      showPaymentSuccess?: boolean;
      projectName?: string;
      selectProjectId?: string;
      filterStatus?: string;
      highlightProjectId?: string;
      noxAction?: string;
    } | null;
    if (!state) return;

    if (state.showPaymentSuccess) {
      setShowPaymentSuccessDialog(true);
      setPaymentProjectName(state.projectName || '');
      if (state.selectProjectId) {
        setSelectedProjectId(state.selectProjectId);
        setCurrentView('binder');
      }
    }

    // Deep-link: select project and open the correct NOx flow step
    if (state.highlightProjectId) {
      setSelectedProjectId(state.highlightProjectId);
      setCurrentView('binder');

      if (state.noxAction) {
        // Small delay so project selection settles before opening flow
        setTimeout(() => {
          const noxData = getNoxDataByProjectId(state.highlightProjectId!);
          if (!noxData) {
            initializeNoxProject(state.highlightProjectId!);
            setNoxProjectsRefreshKey((prev) => prev + 1);
          }
          switch (state.noxAction) {
            case 'pre-estimation':
              setNoxFlowStep('pre-estimation');
              break;
            case 'payment':
              setNoxFlowStep(isAdmin ? 'price-review' : 'quote-flow');
              break;
            case 'pay':
              setNoxFlowStep(isAdmin ? 'payment' : 'awaiting-payment');
              break;
            case 'details':
              setNoxFlowStep('detailed-calculation');
              break;
            case 'results':
              setNoxFlowStep('results');
              break;
            case 'quote-flow':
              setNoxFlowStep('quote-flow');
              break;
            default:
              setNoxFlowStep('pre-estimation');
          }
        }, 100);
      }
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);

  // NOx workflow handlers
  const handleStartNoxFlow = (action: string) => {
    if (!selectedProjectId) return;

    // Initialize NOx data if not exists
    const noxData = getNoxDataByProjectId(selectedProjectId);
    if (!noxData) {
      initializeNoxProject(selectedProjectId);
      setNoxProjectsRefreshKey((prev) => prev + 1);
    }

    // Determine which step to go to based on action/status
    const currentNoxData = getNoxDataByProjectId(selectedProjectId);
    switch (action) {
      case 'start':
      case 'continue':{
          // Smart resume: route based on saved noxStatus + subStatus
          const status = currentNoxData?.status;
          const sub = currentNoxData?.subStatus;
          // Check subStatus first for quote-flow states
          if (sub === 'quote_sent_to_customer') {setNoxFlowStep('awaiting-payment');break;}
          if (sub === 'quote_drafted') {setNoxFlowStep('quote-flow');break;}
          // Then check primary status
          if (status === 'price_generated') {setNoxFlowStep('quote-flow');break;}
          if (status === 'awaiting_payment') {setNoxFlowStep('awaiting-payment');break;}
          if (status === 'paid') {setNoxFlowStep('detailed-calculation');break;}
          if (status === 'report_in_progress') {setNoxFlowStep('detailed-calculation');break;}
          if (status === 'report_delivered') {setNoxFlowStep('results');break;}
          // Default: pre-estimation
          setNoxFlowStep('pre-estimation');
          break;
        }
      case 'payment':
        // Admins can review full pricing; client users must never see totals
        if (currentNoxData?.subStatus === 'quote_drafted') {
          setNoxFlowStep('quote-flow');
          break;
        }
        setNoxFlowStep(isAdmin ? 'price-review' : 'quote-flow');
        break;
      case 'pay':
        // Admin demo flow (Pay Now) vs client view (awaiting payment status)
        setNoxFlowStep(isAdmin ? 'payment' : 'awaiting-payment');
        break;
      case 'details':
        setNoxFlowStep('detailed-calculation');
        break;
      case 'progress':
      case 'download':
        setNoxFlowStep('results');
        break;
      default:
        setNoxFlowStep('pre-estimation');
    }
  };
  const handlePreEstimationSubmit = (data: PreEstimationData) => {
    if (!selectedProjectId) return;
    saveNoxPreEstimation(selectedProjectId, data);
    generateNoxPrice(selectedProjectId);
    setNoxProjectsRefreshKey((prev) => prev + 1);

    // Admins can review full pricing; client users must never see totals
    if (isAdmin) {
      setNoxFlowStep('price-review');
      toast({
        title: t('dashboard.nox.priceGenerated'),
        description: t('dashboard.nox.priceReadyForReview')
      });
      return;
    }
    setQuoteReference(`QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
    // Persist sub-status so user can return to authorization step
    updateNoxData(selectedProjectId, { subStatus: 'quote_drafted' });
    setNoxFlowStep('quote-flow');
  };
  const handleQuoteSent = (quoteRef: string) => {
    if (!selectedProjectId) return;
    setQuoteReference(quoteRef);
    setNoxAwaitingPayment(selectedProjectId);
    updateNoxData(selectedProjectId, { subStatus: 'quote_sent_to_customer' });
    setNoxProjectsRefreshKey((prev) => prev + 1);
  };
  const handleClientPaymentReceived = () => {
    if (!selectedProjectId) return;

    // Get project name for notification
    const projectName = currentNoxProject?.name || 'Project';

    // Process the payment
    processNoxPayment(selectedProjectId);
    setNoxProjectsRefreshKey((prev) => prev + 1);

    // Add notification
    addNotification({
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment received for ${projectName}. Complete NOₓ Assessment and Settlement Claim to finalize your partner share.`,
      projectName
    });

    // Navigate to projects page with the project selected (binder view)
    navigate('/dashboard/projects', {
      state: {
        showPaymentSuccess: true,
        projectName,
        selectProjectId: selectedProjectId
      }
    });
  };
  const handleProceedToPayment = () => {
    if (!selectedProjectId) return;
    setNoxAwaitingPayment(selectedProjectId);
    setNoxProjectsRefreshKey((prev) => prev + 1);
    setNoxFlowStep('payment');
  };
  const handlePaymentComplete = (vatNumber?: string) => {
    if (!selectedProjectId) return;
    processNoxPayment(selectedProjectId, vatNumber);
    setNoxProjectsRefreshKey((prev) => prev + 1);
    setNoxFlowStep('detailed-calculation');
    toast({
      title: t('dashboard.nox.paymentSuccessful'),
      description: t('dashboard.nox.paymentProcessed')
    });
  };
  const handleDetailedCalculationSubmit = (data: DetailedCalculationData) => {
    if (!selectedProjectId) return;
    saveNoxDetailedCalculation(selectedProjectId, data);
    setNoxProjectsRefreshKey((prev) => prev + 1);
    setNoxFlowStep('results');
    toast({
      title: t('dashboard.nox.calculationComplete'),
      description: t('dashboard.nox.noxResultsReady')
    });
  };
  const handleNoxBack = () => {
    setNoxProjectsRefreshKey((prev) => prev + 1);
    setNoxFlowStep(null);
  };

  // Get projects filtered by selected company (admin sees ALL companies)
  const projects = useMemo(() => {
    const allProjects = getAllLocalProjects();
    if (isAdmin) return allProjects; // Admin sees all companies
    if (!selectedCompanyId) return [];
    return allProjects.filter((p) => p.companyId === selectedCompanyId);
  }, [selectedCompanyId, projectsRefreshKey, isAdmin]);

  // Filter projects for default view
  const defaultFilteredProjects = useMemo(() => {
    let result = projects;
    if (defaultFilterNumber) {
      result = result.filter((p) => p.projectNumber.toLowerCase().includes(defaultFilterNumber.toLowerCase()));
    }
    if (defaultFilterName) {
      result = result.filter((p) => p.name.toLowerCase().includes(defaultFilterName.toLowerCase()));
    }
    if (defaultFilterLocation) {
      result = result.filter((p) => p.location?.toLowerCase().includes(defaultFilterLocation.toLowerCase()));
    }
    if (defaultFilterManager) {
      result = result.filter((p) => p.managerName?.toLowerCase().includes(defaultFilterManager.toLowerCase()));
    }
    if (defaultFilterNoxStatus !== "all") {
      result = result.filter((p) => {
        const noxData = getNoxDataByProjectId(p.id);
        return noxData?.status === defaultFilterNoxStatus;
      });
    }
    return result;
  }, [projects, defaultFilterNumber, defaultFilterName, defaultFilterLocation, defaultFilterManager, defaultFilterNoxStatus]);

  // Filter projects for list view
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (listSearchNumber) {
      result = result.filter((p) => p.projectNumber.toLowerCase().includes(listSearchNumber.toLowerCase()));
    }
    if (listSearchName) {
      result = result.filter((p) => p.name.toLowerCase().includes(listSearchName.toLowerCase()));
    }
    if (searchMyActiveProjects && currentUser) {
      result = result.filter((p) => p.managerId === currentUser.email);
    }
    return result;
  }, [projects, listSearchNumber, listSearchName, searchMyActiveProjects, currentUser]);

  // Paginated projects for default view
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return defaultFilteredProjects.slice(start, start + itemsPerPage);
  }, [defaultFilteredProjects, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(defaultFilteredProjects.length / itemsPerPage);
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);
  const lastSelectedProject = useMemo(() => {
    return projects.find((p) => p.id === lastSelectedProjectId) || null;
  }, [projects, lastSelectedProjectId]);

  // Get team employees from the owning company
  const teamEmployees = useMemo(() => {
    if (!selectedCompanyId) return [];
    return getEmployeesByCompany(selectedCompanyId);
  }, [selectedCompanyId]);

  // Get project contacts
  const allContacts = useMemo((): BinderContact[] => {
    if (!selectedProjectId) return [];
    const projectContacts = getProjectContacts(selectedProjectId);
    const contacts: BinderContact[] = [];
    const seenEmails = new Set<string>();
    projectContacts.forEach((pc) => {
      const emailKey = (pc.email || '').toLowerCase();
      if (emailKey && seenEmails.has(emailKey)) return;
      if (emailKey) seenEmails.add(emailKey);
      const isClient = pc.contactType === 'client';
      const isTeam = pc.contactType === 'team' || pc.contactType === 'external_team';
      contacts.push({
        id: pc.id,
        firstName: pc.firstName || pc.contactName.split(' ')[0] || '',
        lastName: pc.lastName || pc.contactName.split(' ').slice(1).join(' ') || '',
        fullName: pc.contactName,
        email: pc.email,
        phone: pc.phone || '',
        mobile: pc.gsm,
        company: pc.company,
        companyType: isClient ? 'client' : isTeam ? 'team' : 'others',
        function: pc.function,
        vatNumber: pc.vatNumber,
        invoiceAddress: pc.invoiceAddress,
        workPhone: pc.workPhone
      });
    });
    return contacts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, contactsRefreshKey]);

  // Handler for when a contact is added/created
  const handleContactAdded = () => {
    setContactsRefreshKey((prev) => prev + 1);
  };

  // Handler for when a project is created
  const handleProjectCreated = () => {
    setProjectsRefreshKey((prev) => prev + 1);
    setIsCreateProjectOpen(false);
    toast({
      title: t('dashboard.projectsDashboard.projectCreated'),
      description: t('dashboard.projectsDashboard.projectCreatedDesc')
    });
  };

  // Filter contacts based on search and tab
  const filteredContacts = useMemo(() => {
    return allContacts.filter((contact) => {
      if (contactFilter !== 'all' && contact.companyType !== contactFilter) return false;
      if (contactSearchQuery) {
        const query = contactSearchQuery.toLowerCase();
        return contact.fullName.toLowerCase().includes(query) || contact.company.toLowerCase().includes(query) || contact.email.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allContacts, contactFilter, contactSearchQuery]);

  // Group contacts by company and create company-level contacts
  const groupedContacts = useMemo(() => {
    const groups: Record<string, {
      companyContact: BinderContact;
      persons: BinderContact[];
    }> = {};
    filteredContacts.forEach((contact) => {
      if (!groups[contact.company]) {
        // Create a company-level contact from the first contact of that company
        groups[contact.company] = {
          companyContact: {
            id: `company-${contact.company}`,
            firstName: '',
            lastName: '',
            fullName: contact.company,
            email: contact.email,
            phone: contact.phone,
            mobile: contact.mobile,
            company: contact.company,
            companyType: contact.companyType,
            vatNumber: contact.vatNumber,
            invoiceAddress: contact.invoiceAddress,
            workPhone: contact.workPhone,
            isCompany: true
          },
          persons: []
        };
      }
      // Add person to the group
      groups[contact.company].persons.push({
        ...contact,
        isCompany: false
      });

      // Update company contact with any available company-level data
      if (contact.vatNumber && !groups[contact.company].companyContact.vatNumber) {
        groups[contact.company].companyContact.vatNumber = contact.vatNumber;
      }
      if (contact.invoiceAddress && !groups[contact.company].companyContact.invoiceAddress) {
        groups[contact.company].companyContact.invoiceAddress = contact.invoiceAddress;
      }
    });
    return groups;
  }, [filteredContacts]);
  const toggleCompanyExpanded = (company: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) {
        next.delete(company);
      } else {
        next.add(company);
      }
      return next;
    });
  };
  const handleContactClick = (contact: BinderContact) => {
    setSelectedContact(contact);
  };
  const handleContactDoubleClick = (contact: BinderContact) => {
    // Convert BinderContact to ProjectContactData for the modal
    const projectContactData: ProjectContactData = {
      id: contact.id,
      name: contact.fullName,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      isCompany: contact.isCompany,
      function: contact.function,
      vatNumber: contact.vatNumber,
      billingStreet: contact.invoiceAddress,
      addresses: [],
      projects: []
    };
    setModalContact(projectContactData);
    setIsContactModalOpen(true);
  };
  const handleContactUpdated = (updatedContact: ProjectContactData) => {
    setSelectedContact((prev) => prev ? {
      ...prev,
      fullName: updatedContact.name,
      email: updatedContact.email,
      phone: updatedContact.phone,
      mobile: updatedContact.mobile
    } : null);
    setIsContactModalOpen(false);
  };

  // Get current project info for the modal
  const currentProjectInfo: ProjectInfo | undefined = selectedProject ? {
    id: selectedProject.id,
    projectNumber: selectedProject.projectNumber,
    projectName: selectedProject.name,
    status: selectedProject.status as 'Open' | 'In Progress' | 'On Hold' | 'Completed' || 'Open'
  } : undefined;
  const handleProjectFieldDoubleClick = () => {
    if (canEditProject && selectedProject) {
      setEditedProject({
        ...selectedProject
      });
      setIsProjectEditOpen(true);
    }
  };
  const handleSaveProject = () => {
    if (editedProject) {
      updateLocalProject(editedProject.id, {
        name: editedProject.name,
        projectNumber: editedProject.projectNumber,
        managerId: editedProject.managerId,
        managerName: editedProject.managerName,
        description: editedProject.description
      });
      setProjectsRefreshKey((prev) => prev + 1);
      toast({
        title: t('dashboard.projectsDashboard.projectUpdated'),
        description: t('dashboard.projectsDashboard.projectUpdatedDesc')
      });
    }
    setIsProjectEditOpen(false);
    setEditedProject(null);
  };
  const handleGlobalSearchClick = () => {
    setCurrentView('list');
  };
  const handleCloseListView = () => {
    setCurrentView('default');
    setListSearchNumber("");
    setListSearchName("");
  };
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setLastSelectedProjectId(projectId);
    setCurrentView('binder');
  };
  const handleBackToDefault = () => {
    setCurrentView('default');
    setSelectedProjectId(null);
  };

  // Delete project handler
  const handleDeleteProject = (projectId: string) => {
    setDeleteProjectId(projectId);
    setIsDeleteDialogOpen(true);
  };
  const confirmDeleteProject = () => {
    if (deleteProjectId) {
      const deleted = deleteLocalProject(deleteProjectId);
      if (deleted) {
        setProjectsRefreshKey((prev) => prev + 1);
        toast({
          title: t('dashboard.projectsDashboard.projectDeleted'),
          description: t('dashboard.projectsDashboard.projectDeletedDesc')
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setDeleteProjectId(null);
  };

  // Companies are collapsed by default - user expands as needed
  if (!currentUser) return null;

  // VIEW 1: Default View
  const renderDefaultView = () => <>
      {/* Global Search Bar */}
      <div className="relative mb-6 cursor-pointer" onClick={handleGlobalSearchClick}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder={t('dashboard.projectsDashboard.searchProjects')} className="pl-12 h-12 text-base bg-background cursor-pointer" readOnly />
      </div>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel: Search Field Preview */}
        <Card className="w-80 shrink-0 flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.projectsDashboard.searchFilters')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.searchByNumber')}</Label>
              <Input placeholder="bijv. 2025-001" className="h-8 text-sm" value={defaultFilterNumber} onChange={(e) => setDefaultFilterNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.searchByName')}</Label>
              <Input placeholder="bijv. Pauwels" className="h-8 text-sm" value={defaultFilterName} onChange={(e) => setDefaultFilterName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.noxStatus')}</Label>
              <Select value={defaultFilterNoxStatus} onValueChange={(v) => setDefaultFilterNoxStatus(v as OxiCloudProjectStatus | "all")}>
                <SelectTrigger className="h-8 text-sm bg-background">
                   <SelectValue placeholder={t('dashboard.projectsDashboard.allStatuses')} />
                 </SelectTrigger>
                 <SelectContent className="bg-background z-50">
                   <SelectItem value="all">
                     <span className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/40" />
                       {t('dashboard.projectsDashboard.allStatuses')}
                    </span>
                  </SelectItem>
                  {(Object.keys(STATUS_CONFIG) as OxiCloudProjectStatus[]).map((status) => <SelectItem key={status} value={status}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[status].color}`} />
                        {getTranslatedStatusLabel(status, t)}
                      </span>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.searchByPlot')}</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterPlot} onChange={(e) => setDefaultFilterPlot(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.location')}</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterLocation} onChange={(e) => setDefaultFilterLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.manager')}</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterManager} onChange={(e) => setDefaultFilterManager(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.teamMembers')}</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterTeamMembers} onChange={(e) => setDefaultFilterTeamMembers(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('dashboard.projectsDashboard.customFields')}</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterCustom} onChange={(e) => setDefaultFilterCustom(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 h-8 text-sm" onClick={() => {
              setDefaultFilterNumber("");
              setDefaultFilterName("");
              setDefaultFilterPlot("");
              setDefaultFilterLocation("");
              setDefaultFilterManager("");
              setDefaultFilterTeamMembers("");
              setDefaultFilterCustom("");
              setDefaultFilterNoxStatus("all");
            }}>
                {t('common.clear')}
              </Button>
              <Button variant="outline" className="h-8 text-sm">
                <Download className="h-3 w-3 mr-1" />
                {t('common.export')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Project Snapshot Table */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('dashboard.projectsDashboard.projectOverview')}</CardTitle>
            {!isAdmin &&
          <Button size="sm" onClick={() => setIsCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {t('dashboard.projectsDashboard.newProject')}
              </Button>
          }
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto min-h-0">
              {/* Table Header */}
               <div className={cn("gap-6 px-4 py-3 border-b border-border bg-background text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20 grid", isAdmin ? "grid-cols-[140px_1fr_160px_180px_1fr]" : "grid-cols-[140px_1fr_180px_1fr]")}>
                <div>N°</div>
                <div>{t('dashboard.projectsDashboard.name')}</div>
                {isAdmin && <div>{t('dashboard.projectsDashboard.company')}</div>}
                <div>{t('dashboard.projectsDashboard.manager')}</div>
                <div>{t('dashboard.projectsDashboard.location')}</div>
              </div>

              {/* Project Rows */}
              <div>
                {paginatedProjects.map((project) => <ContextMenu key={project.id}>
                    <ContextMenuTrigger asChild>
                      <div className={cn("gap-6 px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg group items-start relative grid", isAdmin ? "grid-cols-[140px_1fr_160px_180px_1fr]" : "grid-cols-[140px_1fr_180px_1fr]", "hover:shadow-md hover:shadow-foreground/20 hover:scale-[1.02] hover:z-10")} onClick={() => handleSelectProject(project.id)}>
                        <div className="flex items-center gap-2.5 pt-0.5">
                          <NoxStatusDot projectId={project.id} />
                          <span className="text-sm font-medium text-foreground group-hover:text-black transition-colors">{project.projectNumber}</span>
                        </div>
                        <div className="text-sm font-medium text-foreground group-hover:text-black transition-colors pt-0.5">{project.name}</div>
                        {isAdmin && <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors pt-0.5">{project.companyId === 'gdesign' ? 'GDesign' : project.companyId === '4takt' ? '4Takt' : project.companyId || '-'}</div>}
                        <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors pt-0.5">{project.managerName || '-'}</div>
                        <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors leading-relaxed">
                          {project.location || '-'}
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    {!isAdmin &&
                <ContextMenuContent>
                      <ContextMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('dashboard.projectsDashboard.deleteProject')}
                      </ContextMenuItem>
                    </ContextMenuContent>
                }
                  </ContextMenu>)}
                {paginatedProjects.length === 0 && <div className="text-center py-16 text-muted-foreground">
                    
                    <p className="text-base font-medium mb-2">{t('dashboard.projectsDashboard.noProjectsFound')}</p>
                    <p className="text-xs">{t('dashboard.projectsDashboard.adjustFilters')}</p>
                  </div>}
              </div>
            </div>

            {/* Pagination */}
            {defaultFilteredProjects.length > 0 && <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {defaultFilteredProjects.length} {t('dashboard.projectsDashboard.projectsFound')}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('common.show')}</span>
                    <Select value={String(itemsPerPage)} onValueChange={(v) => {
                  setItemsPerPage(Number(v));
                  setCurrentPage(1);
                }}>
                      <SelectTrigger className="w-16 h-8 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {totalPages > 1 && <div className="flex gap-1">
                      {Array.from({
                  length: totalPages
                }, (_, i) => i + 1).map((page) => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(page)}>
                          {page}
                        </Button>)}
                    </div>}
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>
    </>;

  // VIEW 2: Project List View
  const renderListView = () => <>
      {/* Top Bar with Global Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search projects…" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} onClick={() => setCurrentView('default')} className="pl-12 pr-12 h-12 text-base bg-background cursor-pointer" autoFocus />
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleCloseListView}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Last Selected Section */}
          {lastSelectedProject && <div className="mb-6 pb-4 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>Last selected</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors" onClick={() => handleSelectProject(lastSelectedProject.id)}>
                <span className="font-medium">{lastSelectedProject.projectNumber}</span>
                <span className="text-muted-foreground">—</span>
                <span>{lastSelectedProject.name}</span>
              </div>
            </div>}

          {/* Search Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Switch checked={searchMyActiveProjects} onCheckedChange={setSearchMyActiveProjects} id="my-projects" />
              <Label htmlFor="my-projects" className="text-sm cursor-pointer">
                {t('dashboard.projectsDashboard.searchInMyActive')}
              </Label>
            </div>
          </div>

          {/* Search Inputs Row */}
          

          {/* Search Results List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-0.5 p-2">
              {filteredProjects.map((project) => <div key={project.id} className={cn("flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group items-start relative", "hover:shadow-md hover:shadow-foreground/20 hover:scale-[1.02] hover:z-10")} onClick={() => handleSelectProject(project.id)}>
                  <span className="font-mono text-sm font-medium w-24 flex items-center gap-2 text-foreground group-hover:text-black transition-colors pt-0.5">
                    <NoxStatusDot projectId={project.id} />
                    {project.projectNumber}
                  </span>
                  <span className="text-sm text-foreground group-hover:text-black transition-colors pt-0.5">{project.name}</span>
                </div>)}
              {filteredProjects.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">{t('dashboard.projectsDashboard.noProjectsFound')}</p>
                </div>}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {filteredProjects.length > itemsPerPage && <div className="flex justify-center mt-4 pt-4 border-t">
              <div className="flex gap-1">
                {Array.from({
              length: totalPages
            }, (_, i) => i + 1).map((page) => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>)}
              </div>
            </div>}
        </CardContent>
      </Card>
    </>;

  // VIEW 3: Binder View (Project Details)
  const renderBinderView = () => {
    if (!selectedProject) return null;

    // Get NOx data for this project
    const noxData = getNoxDataByProjectId(selectedProject.id);
    const handleSubStatusChange = (subStatus: NoxSubStatus | undefined) => {
      updateNoxSubStatus(selectedProject.id, subStatus);
      setNoxSubStatusRefreshKey((prev) => prev + 1);
      setNoxProjectsRefreshKey((prev) => prev + 1);
      toast({
        title: "Sub-status updated",
        description: subStatus ? `Set to: ${subStatus.replace(/_/g, ' ')}` : "Sub-status cleared"
      });
    };
    const handleCTAClick = () => {
      if (!noxData) {
        handleStartNoxFlow('start');
        return;
      }
      switch (noxData.status) {
        case 'input_incomplete':
          handleStartNoxFlow('continue');
          break;
        case 'input_completed':
          handleStartNoxFlow('continue');
          break;
        case 'price_generated':
          handleStartNoxFlow('payment');
          break;
        case 'awaiting_payment':
          handleStartNoxFlow('pay');
          break;
        case 'paid':
          handleStartNoxFlow('details');
          break;
        case 'report_in_progress':
          handleStartNoxFlow('progress');
          break;
        case 'report_delivered':
          handleStartNoxFlow('download');
          break;
        default:
          handleStartNoxFlow('start');
      }
    };

    const handleCloneVersion = () => {
      const createdBy = currentUser?.name || 'User';
      const cloned = cloneNoxVersion(selectedProject.id, createdBy);
      if (!cloned) return;
      setNoxProjectsRefreshKey((prev) => prev + 1);
      toast({
        title: t('dashboard.projectsDashboard.newVersionCreated'),
        description: `${cloned.currentVersion} ${t('dashboard.projectsDashboard.newVersionDesc')}`
      });
      // After cloning, pre-estimation is kept so skip to quote-flow
      // Generate price first, then navigate to quote flow
      generateNoxPrice(selectedProject.id);
      setNoxProjectsRefreshKey((prev) => prev + 1);
      setQuoteReference(`QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
      updateNoxData(selectedProject.id, { subStatus: 'quote_drafted' });
      setNoxFlowStep('quote-flow');
    };

    const statusConfig = noxData ? STATUS_CONFIG[noxData.status] : null;
    const subStatusOptions = noxData ? SUB_STATUS_OPTIONS[noxData.status] || [] : [];
    const isWarningSubStatus = noxData?.subStatus && SUB_STATUS_CONFIG[noxData.subStatus]?.isWarning;
    return <>
        {/* Search Bar with current project - clickable to return to search */}
        <div className="relative mb-6 cursor-pointer" onClick={handleBackToDefault}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <div className="pl-12 h-12 text-base bg-background border rounded-md flex items-center">
            <NoxStatusDot projectId={selectedProject.id} className="mr-2" />
            <span className="font-medium font-mono">{selectedProject.projectNumber}</span>
            <span className="mx-2 text-muted-foreground">—</span>
            <span>{selectedProject.name}</span>
          </div>
        </div>

        {/* Two-Column Split Layout - Improved ratios */}
        <div className="flex gap-5 h-[calc(100vh-160px)]">
          
          {/* LEFT COLUMN: 30% width - Details + Werflocatie */}
          <div className="w-[30%] flex flex-col gap-4 overflow-auto">
            
            {/* Section 1: Details Card */}
            <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">{t('dashboard.projectsDashboard.details')}</CardTitle>
                {canEditProject}
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className={`space-y-2 ${canEditProject ? 'cursor-pointer hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors' : ''}`} onDoubleClick={handleProjectFieldDoubleClick}>
                  <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-xs">
                    <span className="text-muted-foreground">{t('dashboard.projectsDashboard.number')}</span>
                    <span className="font-medium">{selectedProject.projectNumber}</span>
                    
                    <span className="text-muted-foreground">{t('dashboard.projectsDashboard.name')}</span>
                    <span className="font-medium">{selectedProject.name}</span>
                    
                    <span className="text-muted-foreground">{t('dashboard.projectsDashboard.company')}</span>
                    <span className="font-medium">{isAdmin ? selectedProject.companyId === 'gdesign' ? 'GDesign Architecten' : selectedProject.companyId === '4takt' ? '4Takt Architecten' : selectedProject.companyId || '-' : selectedCompany?.name || '-'}</span>
                  </div>
                </div>
                
                <div className={`pt-2 border-t ${canEditProject ? 'cursor-pointer hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors' : ''}`} onDoubleClick={handleProjectFieldDoubleClick}>
                  <span className="text-xs font-medium text-muted-foreground">{t('dashboard.projectsDashboard.description')}</span>
                  <p className="text-xs mt-1">{selectedProject.description || 'Residential project for Pauwels NV in Herent'}</p>
                </div>
                
                {/* Project Render Image */}
                <ProjectImagePreview projectId={selectedProject.id} projectName={selectedProject.name} />
                
                {/* Werflocatie Section */}
                <div className="pt-2 border-t">
                  <span className="text-xs font-medium text-muted-foreground">{t('dashboard.projectsDashboard.siteLocation')}</span>
                  
                   <p className="text-xs mt-1.5 text-muted-foreground">
                     {selectedProject.location || t('dashboard.projectsDashboard.noLocation')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Version History + Clone CTA — shown when report delivered */}
            {noxData?.status === 'report_delivered' &&
          <NoxVersionHistory
            noxData={{
              status: noxData.status,
              currentVersion: noxData.currentVersion,
              versionHistory: noxData.versionHistory,
              noxCreatedAt: noxData.noxCreatedAt
            }}
            onCloneVersion={handleCloneVersion} />

          }

            {/* Audit Log Card — shown when versions exist */}
            {(noxData?.versionHistory?.length || 0) > 0 &&
          <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {[...(noxData?.versionHistory || []), {
                  version: noxData?.currentVersion || 'v0',
                  createdAt: noxData?.noxCreatedAt || new Date().toISOString(),
                  createdBy: currentUser?.name || 'User',
                  status: noxData?.status || 'input_incomplete'
                }].map((entry) =>
                <div key={entry.version} className="flex items-center justify-between py-1.5 px-2 rounded text-[10px] hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">{entry.version}</span>
                          <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white",
                      STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.color || 'bg-muted'
                    )}>
                            {STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.label || entry.status}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2">
                          <span>{new Date(entry.createdAt).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{entry.createdBy}</span>
                        </div>
                      </div>
                )}
                  </div>
                </CardContent>
              </Card>
          }
          </div>

          {/* RIGHT COLUMN: 70% width - NOx Status + Contacts */}
          <div className="w-[70%] flex flex-col gap-4 overflow-hidden">
            
            {/* Admin read-only: just show status overview, no interactive NOx flows */}
            {isAdmin ?
          <Card className="rounded-xl border bg-card text-card-foreground shadow-sm shrink-0">
                <CardHeader className="px-4 py-3 pb-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t('dashboard.projectsDashboard.noxAssessment')}</h3>
                    {noxData && statusConfig &&
                <Badge className={cn("text-[10px] font-medium px-2 py-0.5 text-white", statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                }
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3">
                  {noxData ?
              <>
                      {/* Progress bar (read-only) */}
                      <div className="mb-3">
                        <div className="flex items-center gap-0.5">
                          {['input_incomplete', 'input_completed', 'price_generated', 'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'].map((step, index) => {
                      const stepIndex = ['input_incomplete', 'input_completed', 'price_generated', 'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'].indexOf(noxData.status);
                      const isCompleted = index < stepIndex || index === stepIndex && step === 'report_delivered';
                      const isCurrent = index === stepIndex;
                      return (
                        <div key={step} className="flex items-center flex-1">
                                <div className={cn("h-1 flex-1 rounded-full transition-all", isCompleted ? "bg-primary" : isCurrent ? "bg-primary/60" : "bg-muted")} />
                              </div>);

                    })}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[9px] text-muted-foreground">{t('dashboard.projectsDashboard.input')}</span>
                          <span className="text-[9px] text-muted-foreground">{t('dashboard.projectsDashboard.delivered')}</span>
                        </div>
                      </div>
                      {/* Sub-status if any */}
                      {noxData.subStatus &&
                <div className="text-xs text-muted-foreground">
                          Sub-status: <span className="font-medium text-foreground">{noxData.subStatus.replace(/_/g, ' ')}</span>
                        </div>
                }
                      {/* Days pending */}
                      {noxData.status === 'awaiting_payment' && noxData.daysPending !== undefined && noxData.daysPending > 0 &&
                <div className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium mt-2 w-fit",
                noxData.daysPending > 14 ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300" :
                noxData.daysPending > 7 ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300" :
                "bg-muted text-muted-foreground"
                )}>
                          <Clock className="h-3 w-3" />
                          <span>{noxData.daysPending} {t('dashboard.projectsDashboard.daysAwaitingPayment')}</span>
                        </div>
                }
                    </> :

              <p className="text-xs text-muted-foreground">{language === 'nl' ? 'Nog niet gestart' : 'Not started yet'}</p>
              }
                </CardContent>
              </Card> : (

          /* Architect interactive NOx card */
          <>
            {(() => {
              // Check if project has required contacts (at least 1 client + 1 team)
              const hasClientContact = allContacts.some((c) => c.companyType === 'client');
              const hasTeamContact = allContacts.some((c) => c.companyType === 'team');
              const isNoxFrozen = !hasClientContact || !hasTeamContact;
              if (isNoxFrozen) {
                // Frozen state - show disabled card with warning
                return <Card className="rounded-xl border-muted-foreground/30 bg-muted/40 shadow-sm shrink-0 border border-dotted">
                    <CardHeader className="px-4 py-3 pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div>
                         <h3 className="text-sm font-semibold text-muted-foreground">{t('dashboard.projectsDashboard.noxAssessment')}</h3>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 text-muted-foreground border-muted-foreground/30">
                          {t('dashboard.projectsDashboard.setupRequired')}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-3 border-dotted">
                      {/* Warning message */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-3">
                        <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50">
                          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                             {t('dashboard.projectsDashboard.contactsRequired')}
                           </p>
                           <p className="text-[10px] text-amber-600 dark:text-amber-400" dangerouslySetInnerHTML={{ __html: t('dashboard.projectsDashboard.contactsRequiredDesc') }}>
                           </p>
                        </div>
                      </div>

                      {/* Missing contacts indicators */}
                      <div className="flex gap-2 mb-3">
                        
                        <div className={cn("flex-1 px-2.5 py-1.5 rounded-md border text-[10px] font-medium flex items-center gap-1.5", hasTeamContact ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300")}>
                           {hasTeamContact ? t('dashboard.projectsDashboard.teamAdded') : t('dashboard.projectsDashboard.teamMissing')}
                         </div>
                      </div>

                      {/* Disabled CTA */}
                      <Button className="w-full h-9 text-xs font-medium opacity-50" variant="secondary" disabled>
                        {t('dashboard.projectsDashboard.noxLocked')}
                      </Button>
                    </CardContent>
                  </Card>;
              }

              // Normal active state
              return <Card className={cn("rounded-xl border shadow-sm transition-all duration-200 shrink-0", isWarningSubStatus ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800" : "bg-card text-card-foreground")}>
                  <CardHeader className="px-4 py-3 pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <h3 className="text-sm font-semibold">{t('dashboard.projectsDashboard.noxAssessment')}</h3>
                        </div>
                      </div>
                      {statusConfig && <Badge className={cn("text-[10px] font-medium px-2 py-0.5 text-white", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-3">
                    {/* Progress Steps - Visual workflow indicator */}
                    {noxData && <div className="mb-4">
                        <div className="flex items-center gap-0.5">
                          {['input_incomplete', 'input_completed', 'price_generated', 'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'].map((step, index, arr) => {
                        const stepIndex = arr.indexOf(noxData.status);
                        const isCompleted = index < stepIndex || index === stepIndex && step === 'report_delivered';
                        const isCurrent = index === stepIndex;
                        return <div key={step} className="flex items-center flex-1">
                                <div className={cn("h-1 flex-1 rounded-full transition-all", isCompleted ? "bg-primary" : isCurrent ? "bg-primary/60" : "bg-muted")} />
                              </div>;
                      })}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[9px] text-muted-foreground">{t('dashboard.projectsDashboard.input')}</span>
                          <span className="text-[9px] text-muted-foreground">{t('dashboard.projectsDashboard.delivered')}</span>
                        </div>
                      </div>}

                    <div className="flex gap-3">
                      {/* Left: Main CTA Section */}
                      <div className="flex-1 space-y-2">
                        {/* CTA Button */}
                        {noxData ? <Button onClick={handleCTAClick} className="w-full h-9 text-xs font-medium" variant={noxData.status === 'paid' || noxData.status === 'report_in_progress' ? 'default' : 'secondary'}>
                            {noxData.status === 'input_incomplete' && <><Play className="h-3.5 w-3.5 mr-1.5" />{noxData.preEstimation ? t('dashboard.projectsDashboard.continueNox') : t('dashboard.nox.startInput')}</>}
                            {noxData.status === 'input_completed' && <><FileText className="h-3.5 w-3.5 mr-1.5" />{t('dashboard.projectsDashboard.generateQuote')}</>}
                            {noxData.status === 'price_generated' && <><CreditCard className="h-3.5 w-3.5 mr-1.5" />{t('dashboard.projectsDashboard.sendQuoteToClient')}</>}
                            {noxData.status === 'awaiting_payment' && <><Clock className="h-3.5 w-3.5 mr-1.5" />{t('dashboard.projectsDashboard.awaitingPayment')}</>}
                            {noxData.status === 'paid' && <><FileCheck className="h-3.5 w-3.5 mr-1.5" />{t('dashboard.projectsDashboard.continueNox')}</>}
                            {noxData.status === 'report_in_progress' && <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />{t('dashboard.projectsDashboard.continueNox')}</>}
                            {noxData.status === 'report_delivered' && <><Download className="h-3.5 w-3.5 mr-1.5" />{t('dashboard.projectsDashboard.viewReport')}</>}
                          </Button> : <Button className="w-full h-9 text-xs font-medium" onClick={() => handleStartNoxFlow('start')}>
                            <Play className="h-3.5 w-3.5 mr-1.5" />
                            {t('dashboard.projectsDashboard.startNox')}
                          </Button>}
                        
                        {/* Days Pending indicator */}
                        {noxData?.status === 'awaiting_payment' && noxData.daysPending !== undefined && noxData.daysPending > 0 && <div className={cn("flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium", noxData.daysPending > 14 ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300" : noxData.daysPending > 7 ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground")}>
                            <Clock className="h-3 w-3" />
                            <span>{noxData.daysPending} {t('dashboard.projectsDashboard.daysAwaitingPayment')}</span>
                          </div>}
                      </div>
                      
                      {/* Right: Sub-Status Section */}
                      
                    </div>
                  </CardContent>
                </Card>;
            })()}
            </>)
          }

            {/* Contacts Card - Matching Contacts Main Module Structure */}
            <Card className="rounded-xl border bg-card text-card-foreground shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
              <CardHeader className="px-4 py-2.5 flex flex-row items-center justify-between shrink-0 border-b">
                <CardTitle className="text-sm font-semibold">{t('dashboard.projectsDashboard.contacts')}</CardTitle>
                <div className="flex gap-1.5 items-center">
                  {/* Show All / Collapse All Buttons */}
                  <Button size="sm" variant="ghost" onClick={() => {
                  const allCompanies = Object.keys(groupedContacts);
                  setExpandedCompanies(new Set(allCompanies));
                }} disabled={expandedCompanies.size === Object.keys(groupedContacts).length} className="h-6 text-[10px] px-2 gap-1">
                    <ArrowDown className="h-3 w-3" />
                     {t('common.showAll')}
                   </Button>
                   <Button size="sm" variant="ghost" onClick={() => setExpandedCompanies(new Set())} disabled={expandedCompanies.size === 0} className="h-6 text-[10px] px-2 gap-1">
                     <ArrowUp className="h-3 w-3" />
                     {t('common.collapse')}
                   </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input placeholder={t('common.search') + '...'} value={contactSearchQuery} onChange={(e) => setContactSearchQuery(e.target.value)} className="pl-6 h-6 w-24 text-[10px] bg-background px-[104px]" />
                  </div>
                  <div className="flex bg-muted/50 rounded-md p-0.5">
                     {(['all', 'client', 'team', 'others'] as const).map((tab) => <button key={tab} onClick={() => setContactFilter(tab)} className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-all ${contactFilter === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                         {tab === 'all' ? t('common.all') : tab === 'client' ? t('dashboard.projectsDashboard.client') : tab === 'team' ? t('dashboard.projectsDashboard.team') : t('dashboard.projectsDashboard.other')}
                       </button>)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex-1 overflow-auto min-h-0 flex flex-col">
                {/* Empty state */}
                {allContacts.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="p-2.5 rounded-full bg-muted mb-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                     <h3 className="text-xs font-medium mb-1">{t('dashboard.projectsDashboard.noContactsLinked')}</h3>
                     <p className="text-[10px] text-muted-foreground mb-3 max-w-xs">
                       {isAdmin ? language === 'nl' ? 'Geen contacten gekoppeld aan dit project.' : 'No contacts linked to this project.' : t('dashboard.projectsDashboard.addContactsDesc')}
                     </p>
                     {!isAdmin &&
                <div className="flex gap-2">
                         <Button size="sm" variant="outline" onClick={() => setIsAddExistingContactOpen(true)} className="h-7 text-[10px]">
                           <Plus className="h-3 w-3 mr-1" />
                           {t('dashboard.projectsDashboard.addExisting')}
                         </Button>
                         <Button size="sm" onClick={() => setIsCreateContactOpen(true)} className="h-7 text-[10px]">
                           <UserPlus className="h-3 w-3 mr-1" />
                           {t('dashboard.projectsDashboard.createNew')}
                         </Button>
                       </div>
                }
                   </div> : <>
                    {/* Table Header - Sticky */}
                     <div className="grid grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_100px_minmax(160px,1fr)] gap-3 px-4 py-2 bg-background border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                       <div>{t('dashboard.projectsDashboard.company')}</div>
                       <div>{t('dashboard.contactsDashboard.email')}</div>
                       <div>{t('dashboard.projectsDashboard.phone')}</div>
                       <div>{t('dashboard.contactsDashboard.address')}</div>
                     </div>
                    
                    {/* Company Rows - Gradient hover with white text */}
                    <div className="p-1.5 flex-1 overflow-auto">
                      {Object.entries(groupedContacts).map(([company, {
                    companyContact,
                    persons
                  }]) => <div key={company} className={cn("group/company", expandedCompanies.has(company) && "bg-muted/20 rounded-xl my-0.5 shadow-sm")}>
                          {/* Main Company Row - Lime green hover with black text */}
                          <div className={cn("grid grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_100px_minmax(160px,1fr)] gap-3 px-4 py-2 my-0.5 cursor-pointer transition-all duration-200 rounded-lg group relative", expandedCompanies.has(company) ? "bg-[hsl(var(--neon-lime))]/90 rounded-b-none" : "hover:shadow-md hover:shadow-foreground/20 hover:scale-[1.02] hover:z-10")} onClick={() => toggleCompanyExpanded(company)} onDoubleClick={() => handleContactDoubleClick(persons[0] || companyContact as any)}>
                            <div className="flex items-center gap-2">
                              
                              <span className={cn("font-medium text-xs truncate transition-colors", expandedCompanies.has(company) ? "text-black" : "text-foreground group-hover:text-foreground")}>{company}</span>
                            </div>
                            <div className={cn("text-xs truncate transition-colors", expandedCompanies.has(company) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>{companyContact.email || '—'}</div>
                            <div className={cn("text-xs transition-colors", expandedCompanies.has(company) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>{companyContact.phone ? formatPhoneNumber(companyContact.phone) : '—'}</div>
                            <div className={cn("text-xs truncate transition-colors", expandedCompanies.has(company) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>
                              {companyContact.invoiceAddress || 'Brussels'}
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {expandedCompanies.has(company) && persons.length > 0 && <div className="bg-background/60 rounded-b-xl mx-0.5">
                              {/* CONTACTPERSONEN Section */}
                              <div className="px-4 py-3 ml-6 border-l-2 border-primary/30">
                                <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider mb-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-primary dark:bg-transparent dark:text-primary">
                                    {t('dashboard.projectsDashboard.contactPersons')}
                                    <span className="px-1.5 py-0.5 bg-primary/15 rounded-full text-[8px] font-bold">{persons.length}</span>
                                  </span>
                                </div>
                                 <div className="grid grid-cols-[minmax(100px,1fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_90px] gap-2 text-[9px] font-medium text-muted-foreground mb-1.5 pb-1.5 border-b border-border/40">
                                   <div>{t('dashboard.projectsDashboard.name')}</div>
                                   <div>{t('dashboard.projectsDashboard.function')}</div>
                                   <div>{t('dashboard.contactsDashboard.email')}</div>
                                   <div>{t('dashboard.projectsDashboard.phone')}</div>
                                </div>
                                <div className="space-y-0">
                                  {persons.map((contact) => <div key={contact.id} className={cn("grid grid-cols-[minmax(100px,1fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_90px] gap-2 py-1.5 px-2 -mx-2 text-xs rounded-lg cursor-pointer transition-all group/person relative", "hover:shadow-sm hover:shadow-foreground/20 hover:scale-[1.01] hover:z-10", selectedContact?.id === contact.id && "bg-[hsl(var(--neon-lime))]/50")} onClick={() => handleContactClick(contact)} onDoubleClick={() => handleContactDoubleClick(contact)}>
                                      <div className="font-medium text-foreground truncate group-hover/person:text-foreground">{contact.fullName}</div>
                                      <div className="text-muted-foreground truncate group-hover/person:text-foreground/70">{contact.function || '-'}</div>
                                      <div className="text-muted-foreground truncate group-hover/person:text-foreground/70">{contact.email || '-'}</div>
                                      <div className="text-muted-foreground group-hover/person:text-foreground/70">{contact.phone ? formatPhoneNumber(contact.phone) : '-'}</div>
                                    </div>)}
                                </div>
                              </div>

                              {/* VESTIGINGEN / ADRESSEN Section */}
                              <div className={cn("px-4 py-3 ml-6 border-l-2 border-primary/30", persons.length > 0 && "border-t border-border/30")}>
                                <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider mb-2">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-primary dark:bg-transparent dark:text-primary">
                                    VESTIGINGEN / ADRESSEN
                                    <span className="px-1.5 py-0.5 bg-primary/15 rounded-full text-[8px] font-bold">1</span>
                                  </span>
                                </div>
                                 <div className="grid grid-cols-[minmax(80px,1fr)_minmax(100px,1fr)_50px_60px_minmax(90px,1fr)] gap-2 text-[9px] font-medium text-muted-foreground mb-1.5 pb-1.5 border-b border-border/40">
                                   <div>Naam</div>
                                   <div>Straat</div>
                                   <div>Nr</div>
                                   <div>Code</div>
                                   <div>Gemeente</div>
                                </div>
                                <div className="grid grid-cols-[minmax(80px,1fr)_minmax(100px,1fr)_50px_60px_minmax(90px,1fr)] gap-2 py-1.5 px-2 -mx-2 text-xs rounded-lg cursor-pointer transition-all group/address hover:scale-[1.01] hover:z-10">
                                  <div className="font-medium text-foreground truncate group-hover/address:text-foreground">{company.split(' ')[0]}</div>
                                  <div className="text-muted-foreground truncate group-hover/address:text-foreground/70">Herkenrodestraat</div>
                                  <div className="text-muted-foreground group-hover/address:text-foreground/70">25</div>
                                  <div className="text-muted-foreground group-hover/address:text-foreground/70">3210</div>
                                  <div className="text-muted-foreground truncate group-hover/address:text-foreground/70">Glabbeek</div>
                                </div>
                              </div>
                            </div>}
                        </div>)}
                      
                      {Object.keys(groupedContacts).length === 0 && allContacts.length > 0 && <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <User className="h-6 w-6 mb-2 opacity-30" />
                          <p className="text-xs">Geen contacten gevonden voor dit filter</p>
                        </div>}
                    </div>
                  </>}
              </CardContent>
            </Card>
          </div>
        </div>
      </>;
  };
  // Monitor projects for admin
  const monitorProjects = useMemo(() => getMonitorProjects(), [monitorRefreshKey]);

  const renderMonitorView = () =>
  <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">{language === 'nl' ? 'Monitor Projecten' : 'Monitor Projects'}</h2>
          <p className="text-xs text-muted-foreground">{monitorProjects.length} {language === 'nl' ? 'gemeenteprojecten' : 'municipality projects'}</p>
        </div>
        <Button size="sm" onClick={() => setMonitorUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {language === 'nl' ? 'Project Aanmaken' : 'Create Project'}
        </Button>
      </div>

      {monitorProjects.length === 0 ?
    <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <p className="font-semibold">{language === 'nl' ? 'Geen monitorprojecten' : 'No monitor projects'}</p>
          <p className="text-sm mt-1">{language === 'nl' ? 'Projecten verschijnen hier wanneer gemeenten ze aanmaken.' : 'Projects will appear here when municipalities create them.'}</p>
        </div> :

    <div className="space-y-2">
          {monitorProjects.map((project) =>
      <div
        key={project.id}
        onClick={() => setSelectedMonitorProject(project)}
        className={cn(
          "rounded-2xl border p-4 cursor-pointer transition-colors hover:bg-muted/20",
          selectedMonitorProject?.id === project.id ? "border-primary bg-primary/5" : "border-border"
        )}>
        
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{project.projectName}</span>
                    <Badge variant="outline" className="text-[10px]">{project.referenceNumber}</Badge>
                    <Badge
                variant="outline"
                className={cn("text-[10px]",
                project.validationStatus === 'validated' ? 'text-primary border-primary/30' :
                project.validationStatus === 'conditional' ? 'text-muted-foreground' :
                project.validationStatus === 'not_validated' ? 'text-destructive border-destructive/30' :
                'text-muted-foreground'
                )}>
                
                      {project.validationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {project.municipality} · {project.architectFirm} · {project.projectType}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{project.createdAt?.split('T')[0]}</span>
              </div>
            </div>
      )}
        </div>
    }

      {selectedMonitorProject &&
    <div className="space-y-4">
          <div className="rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold mb-3">{selectedMonitorProject.projectName}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-muted-foreground">{language === 'nl' ? 'Type' : 'Type'}: </span>{selectedMonitorProject.projectType}</div>
              <div><span className="text-muted-foreground">{language === 'nl' ? 'Gemeente' : 'Municipality'}: </span>{selectedMonitorProject.municipality}</div>
              <div><span className="text-muted-foreground">Natura 2000: </span>{selectedMonitorProject.natura2000Site} ({selectedMonitorProject.natura2000Code})</div>
              <div><span className="text-muted-foreground">{language === 'nl' ? 'Afstand' : 'Distance'}: </span>{selectedMonitorProject.closestDistanceToHabitat} km</div>
              <div><span className="text-muted-foreground">{language === 'nl' ? 'Architect' : 'Architect'}: </span>{selectedMonitorProject.architect}</div>
              <div><span className="text-muted-foreground">{language === 'nl' ? 'Bureau' : 'Firm'}: </span>{selectedMonitorProject.architectFirm}</div>
            </div>
          </div>
          <MonitorValidationFlow
        project={selectedMonitorProject}
        onUpdate={(updated) => {setSelectedMonitorProject(updated);setMonitorRefreshKey((k) => k + 1);}}
        userName={currentUser?.name || 'Admin'}
        municipality={selectedMonitorProject.municipality} />
      
          <MonitorAuditLog projectId={selectedMonitorProject.id} />
        </div>
    }

      <MonitorProjectUploadDialog
      open={monitorUploadOpen}
      onOpenChange={setMonitorUploadOpen}
      onProjectCreated={() => {setMonitorRefreshKey((k) => k + 1);setMonitorUploadOpen(false);}}
      userName={currentUser?.name || 'Admin'}
      municipality="OxiCloud Admin" />
    
    </div>;


  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <main className="container mx-auto py-6 px-4">
        {/* Admin product tabs */}
        {isAdmin &&
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
            <button
          onClick={() => setAdminProductTab('oxicloud')}
          className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all",
          adminProductTab === 'oxicloud' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}>
          
              OxiCloud
            </button>
            <button
          onClick={() => setAdminProductTab('monitor')}
          className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all",
          adminProductTab === 'monitor' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}>
          
              Monitor
            </button>
          </div>
      }


        {/* Monitor tab for admin */}
        {isAdmin && adminProductTab === 'monitor' ? renderMonitorView() : <>
        {/* Render NOx flow or current view — admins never enter NOx flows */}
        {!isAdmin && noxFlowStep && currentNoxProject ? (() => {
          const oxiProject = toOxiCloudProject(currentNoxProject);
          if (!oxiProject && noxFlowStep !== 'pre-estimation') return null;
          switch (noxFlowStep) {
            case 'pre-estimation':
              return <PreEstimationForm initialData={currentNoxProject.noxData?.preEstimation} initialAddress={currentNoxProject.location || undefined} onSubmit={handlePreEstimationSubmit} onBack={handleNoxBack} onAutoSave={(data) => {
                if (selectedProjectId) {
                  saveNoxPreEstimation(selectedProjectId, data);
                  setNoxProjectsRefreshKey((prev) => prev + 1);
                }
              }} />;
            case 'quote-flow':
              const clientContact = allContacts.find((c) => c.companyType === 'client');
              return <QuoteFlow projectName={currentNoxProject.name} partnerShareAmount={currentNoxProject.noxData?.commissionAmount || 0} recipientInfo={{
                name: clientContact?.company || clientContact?.fullName || 'Onbekend',
                email: clientContact?.email || '',
                vatNumber: clientContact?.vatNumber,
                billingAddress: clientContact?.invoiceAddress
              }} quoteReference={quoteReference || undefined} initialStep="authorization" isPaid={currentNoxProject.noxData?.status === 'paid'} isPilotMode={currentUser?.email === 'demo@oxicloud.be'} onBack={handleNoxBack} onQuoteSent={handleQuoteSent} onPaymentReceived={handleClientPaymentReceived} onNavigateToNox={() => setNoxFlowStep('detailed-calculation')} onNavigateToSettlement={() => toast({
                title: 'Settlement Claim',
                description: 'Navigate to Financial Dashboard to submit your invoice.'
              })} onSettlementComplete={() => toast({
                title: 'Settlement Complete',
                description: 'Your partner share invoice has been submitted.'
              })} onBackToProject={handleNoxBack} />;
            case 'awaiting-payment':
              const clientContact2 = allContacts.find((c) => c.companyType === 'client');
              return <QuoteFlow projectName={currentNoxProject.name} partnerShareAmount={currentNoxProject.noxData?.commissionAmount || 0} recipientInfo={{
                name: clientContact2?.company || clientContact2?.fullName || 'Onbekend',
                email: clientContact2?.email || '',
                vatNumber: clientContact2?.vatNumber,
                billingAddress: clientContact2?.invoiceAddress
              }} quoteReference={quoteReference || `QT-${currentNoxProject.id.slice(0, 4).toUpperCase()}`} initialStep="awaiting-payment" isPaid={currentNoxProject.noxData?.status === 'paid'} isPilotMode={currentUser?.email === 'demo@oxicloud.be'} onBack={handleNoxBack} onQuoteSent={handleQuoteSent} onPaymentReceived={handleClientPaymentReceived} onNavigateToNox={() => setNoxFlowStep('detailed-calculation')} onNavigateToSettlement={() => toast({
                title: 'Settlement Claim',
                description: 'Navigate to Financial Dashboard to submit your invoice.'
              })} onSettlementComplete={() => toast({
                title: 'Settlement Complete',
                description: 'Your partner share invoice has been submitted.'
              })} onBackToProject={handleNoxBack} />;
            case 'price-review':
              return oxiProject ? <PriceReviewScreen project={oxiProject} onProceedToPayment={handleProceedToPayment} onBackToEdit={() => setNoxFlowStep('pre-estimation')} /> : null;
            case 'payment':
              return oxiProject ? <NoxPaymentDemoFlow project={oxiProject} onPaymentComplete={handlePaymentComplete} onBack={() => setNoxFlowStep('price-review')} /> : null;
            case 'detailed-calculation':
              return oxiProject ? <DetailedCalculationForm project={oxiProject} onSubmit={handleDetailedCalculationSubmit} onBack={handleNoxBack} /> : null;
            case 'results':
              return oxiProject ? <OxiCloudResultScreen project={oxiProject} onBack={() => setNoxFlowStep('detailed-calculation')} onRecalculate={() => setNoxFlowStep('pre-estimation')} onBackToDashboard={handleNoxBack} /> : null;
            default:
              return null;
          }
        })() : <>
            {currentView === 'default' && renderDefaultView()}
            {currentView === 'list' && renderListView()}
            {currentView === 'binder' && renderBinderView()}
          </>}
        </>}
      </main>

      {/* Contact Detail Modal */}
      <ProjectContactDetailModal open={isContactModalOpen} onOpenChange={setIsContactModalOpen} contact={modalContact} currentProject={currentProjectInfo} onContactUpdated={handleContactUpdated} />

      {/* Project Edit Sheet */}
      <Sheet open={isProjectEditOpen} onOpenChange={setIsProjectEditOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader className="shrink-0">
            <SheetTitle>Projectgegevens bewerken</SheetTitle>
          </SheetHeader>
          {editedProject && <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="mt-6 space-y-4 pb-6">
                <div className="space-y-2">
                  <Label>Projectnummer</Label>
                  <Input value={editedProject.projectNumber} onChange={(e) => setEditedProject({
                ...editedProject,
                projectNumber: e.target.value
              })} />
                </div>
                
                <div className="space-y-2">
                  <Label>Projectnaam</Label>
                  <Input value={editedProject.name} onChange={(e) => setEditedProject({
                ...editedProject,
                name: e.target.value
              })} />
                </div>
                
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <Select value={editedProject.managerId || ''} onValueChange={(value) => {
                const selectedEmployee = teamEmployees.find((e) => e.id === value);
                setEditedProject({
                  ...editedProject,
                  managerId: value,
                  managerName: selectedEmployee?.name || ''
                });
              }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecteer manager" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {teamEmployees.map((employee) => <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Beschrijving</Label>
                  <Input value={editedProject.description || ''} onChange={(e) => setEditedProject({
                ...editedProject,
                description: e.target.value
              })} placeholder="Projectbeschrijving..." />
                </div>
                
                 <div className="flex gap-2 pt-4">
                   <Button onClick={handleSaveProject} className="flex-1">
                     Opslaan
                   </Button>
                   <Button variant="outline" onClick={() => setIsProjectEditOpen(false)}>
                     Annuleren
                  </Button>
                </div>
              </div>
            </ScrollArea>}
        </SheetContent>
      </Sheet>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <AlertDialogTitle>Project verwijderen</AlertDialogTitle>
             <AlertDialogDescription>
               Weet u zeker dat u dit project wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Annuleren</AlertDialogCancel>
             <AlertDialogAction onClick={confirmDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
               Verwijderen
             </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Existing Contact Dialog */}
      {selectedProjectId && <AddExistingContactDialog open={isAddExistingContactOpen} onOpenChange={setIsAddExistingContactOpen} projectId={selectedProjectId} onContactLinked={handleContactAdded} />}
      
      {/* Create New Contact Dialog */}
      {selectedProjectId && <CreateProjectContactDialog open={isCreateContactOpen} onOpenChange={setIsCreateContactOpen} projectId={selectedProjectId} onContactCreated={handleContactAdded} />}

      {/* Create New Project Dialog */}
      {selectedCompanyId && <CreateNewProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} onProjectCreated={handleProjectCreated} companyId={selectedCompanyId} useProduction={true} />}

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog open={showPaymentSuccessDialog} onOpenChange={setShowPaymentSuccessDialog} projectName={paymentProjectName} />
    </div>;
};
export default ProjectsDashboard;