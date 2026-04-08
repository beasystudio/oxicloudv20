import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { ChevronDown, Bell, Home, FolderKanban, Building2, Moon, Sun, Users, BarChart, Settings2, Trash2, CheckCircle2, CreditCard, ArrowLeft, LogOut, Ellipsis, FileText, Check } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { getUserByEmail, getUsersByCompany } from "@/lib/mockUserDB";
import { getAvatarUrl } from "@/lib/avatarMap";
import { GlobalAddMenu } from "./GlobalAddMenu";
import { cn } from "@/lib/utils";
import { getNotifications, deleteNotification, markAsRead, getUnreadCount, type Notification } from "@/lib/notificationStore";
import { ScrollArea } from "./ui/scroll-area";
import { useLanguage, type Language } from "@/i18n/LanguageContext";
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import oxiLogoLight from '@/assets/oxicloud-logo-light.png';
import oxiLogoDark from '@/assets/oxicloud-logo-dark.png';

export const TopNavigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const {
    currentUser, logout, companyLogo, setCompanyLogo,
    userCompanies, selectedCompanyId, setSelectedCompanyId,
    getSelectedCompany, switchToUser
  } = useMockAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const [isDemoDataSetup, setIsDemoDataSetup] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    };
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('notifications-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const checkDemoData = () => {
      const hasCompanies = localStorage.getItem('companiesList');
      setIsDemoDataSetup(!!hasCompanies);
    };
    checkDemoData();
    window.addEventListener('storage', checkDemoData);
    return () => window.removeEventListener('storage', checkDemoData);
  }, []);

  if (!currentUser) return null;
  const selectedCompany = getSelectedCompany();
  const displayName = selectedCompany?.name || currentUser.company;

  const settingsLogoUrl = (() => {
    if (!selectedCompanyId) return null;
    const storageKey = `companiesList_${selectedCompanyId}`;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    try {
      const companies = JSON.parse(saved);
      if (Array.isArray(companies) && companies.length > 0 && companies[0].logoUrl) {
        return companies[0].logoUrl;
      }
    } catch {/* ignore */}
    return null;
  })();

  const effectiveLogo = companyLogo || settingsLogoUrl;
  const isActive = (path: string) => location.pathname === path;
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();
  const isOwnerOrAdmin = currentUser.role === 'owner' || currentUser.role === 'admin';
  const isClientOwnerOrAdmin = currentUser.role === 'client_owner' || currentUser.role === 'client_admin';
  const isClientUser = currentUser.role === 'client_user';
  const isAuthority = currentUser.role === 'authority' || currentUser.role === 'authority_standard';
  const isClientRole = isClientOwnerOrAdmin || isClientUser;

  const isPowerUser = (() => {
    const userRecord = getUserByEmail(currentUser.email);
    return userRecord?.subscription?.contractType === 'Power User/Admin';
  })();

  const teamMembers = isPowerUser && selectedCompanyId ? getUsersByCompany(selectedCompanyId) : [];

  const handleSwitchAccount = (email: string) => {
    const result = switchToUser(email);
    if (result.success) {
      toast({ title: t('dashboard.nav.accountSwitched'), description: `${t('dashboard.nav.accountSwitchedDesc')} ${email}` });
      setProfileMenuOpen(false);
      setShowAccountSwitch(false);
    }
  };

  const hasFinancialAccess = () => {
    if (currentUser.role === 'owner') return true;
    if (currentUser.role === 'admin') {
      const staffSettingsKey = 'oxicloud_staff_settings';
      const stored = localStorage.getItem(staffSettingsKey);
      if (stored) {
        const staffSettings = JSON.parse(stored);
        const staffMember = staffSettings.find((s: { email: string }) => s.email === currentUser.email);
        if (staffMember) return staffMember.financialDashboardAccess ?? false;
      }
      return false;
    }
    if (currentUser.role === 'client_owner') return true;
    const userRecord = getUserByEmail(currentUser.email);
    return userRecord?.general?.financialDashboardAccess ?? false;
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCompanyLogo(e.target?.result as string);
      toast({ title: "Logo uploaded", description: "Company logo has been updated" });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    toast({ title: "Logo removed", description: "Company logo has been removed" });
  };

  const handleSelectCompany = (companyId: string, companyName: string) => {
    setSelectedCompanyId(companyId);
    toast({ title: "Company switched", description: `Now viewing ${companyName}` });
  };

  const handleSignOut = async () => {
    logout();
    try { await supabase.auth.signOut(); } finally { window.location.href = '/login'; }
  };

  // Navigation item
  const NavItem = ({ to, icon: Icon, label, isActiveRoute }: { to: string; icon: React.ElementType; label: string; isActiveRoute: boolean }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
        isActiveRoute
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-transparent border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      <span>{label}</span>
    </Link>
  );

  // Branding
  const renderBranding = () => {
    if (isOwnerOrAdmin) return;
    if (effectiveLogo) {
      if (userCompanies.length > 1 && isClientRole) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <img src={effectiveLogo} alt="Company logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-border p-0.5" />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px] bg-popover border border-border shadow-lg z-50">
              {userCompanies.map((company) => (
                <DropdownMenuItem key={company.id} onClick={() => handleSelectCompany(company.id, company.name)} className={cn("cursor-pointer", selectedCompanyId === company.id && "bg-primary/10 text-foreground")}>
                  {company.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      return <div className="flex items-center"><img src={effectiveLogo} alt="Company logo" className="w-8 h-8 rounded-lg object-contain bg-white border border-border p-0.5" /></div>;
    }
    return <div className="flex items-center gap-3">{renderCompanySelector()}</div>;
  };

  const renderCompanySelector = () => {
    if (!isDemoDataSetup) {
      return <span className="text-xs text-muted-foreground">{t('dashboard.nav.setupRequired')}</span>;
    }
    if (userCompanies.length > 1 && isClientRole) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <span className="font-semibold text-sm text-foreground">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px] bg-popover border border-border shadow-lg z-50">
            {userCompanies.map((company) => (
              <DropdownMenuItem key={company.id} onClick={() => handleSelectCompany(company.id, company.name)} className={cn("cursor-pointer", selectedCompanyId === company.id && "bg-primary/10 text-foreground")}>
                {company.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return <span className="font-semibold text-sm text-foreground">{displayName}</span>;
  };

  // Navigation links
  const renderNavigation = () => {
    if (isOwnerOrAdmin) {
      return (
        <div className="flex items-center gap-2">
          <NavItem to="/dashboard/licenses" icon={Building2} label={t('dashboard.nav.licenses')} isActiveRoute={isActive('/dashboard/licenses') || isActive('/dashboard/lm')} />
          <NavItem to="/dashboard/projects" icon={FolderKanban} label={t('dashboard.nav.projects')} isActiveRoute={isActive('/dashboard/projects')} />
          <NavItem to="/dashboard/contacts" icon={Users} label={t('dashboard.nav.contacts')} isActiveRoute={isActive('/dashboard/contacts')} />
        </div>
      );
    }
    if (isClientRole) {
      return (
        <div className="flex items-center gap-2">
          <NavItem to="/dashboard/projects" icon={FolderKanban} label={t('dashboard.nav.projects')} isActiveRoute={isActive('/dashboard/projects')} />
          <NavItem to="/dashboard/contacts" icon={Users} label={t('dashboard.nav.contacts')} isActiveRoute={isActive('/dashboard/contacts')} />
        </div>
      );
    }
    return null;
  };

  // Action buttons - grouped for clarity
  const renderActions = () => {
    const showFinancialMenu = hasFinancialAccess();
    const clientAdminHasSettingsAccess = currentUser.role === 'client_admin' ? getUserByEmail(currentUser.email)?.general?.settingsAccess ?? false : false;
    const showSettings = isOwnerOrAdmin || currentUser.role === 'client_owner' || clientAdminHasSettingsAccess;
    const settingsLink = isOwnerOrAdmin ? "/dashboard/nox-settings" : "/dashboard/settings";

    return (
      <div className="flex items-center gap-1">
        {/* Global Add - for client_owner and client_admin */}
        {(currentUser.role === 'client_owner' || currentUser.role === 'client_admin') && selectedCompanyId && (
          <GlobalAddMenu companyId={selectedCompanyId} />
        )}

        {/* Grouped: Financial + Settings + Theme in a "More" dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {showFinancialMenu && (
              <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                <Link to="/dashboard/financial">
                  <BarChart className="h-3.5 w-3.5" />
                  {t('dashboard.nav.financial') || 'Financial'}
                </Link>
              </DropdownMenuItem>
            )}
            {showSettings && (
              <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                <Link to={settingsLink}>
                  <Settings2 className="h-3.5 w-3.5" />
                  {t('dashboard.nav.settings') || 'Settings'}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer text-xs gap-2">
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              {theme === 'light' ? 'Dark mode' : 'Light mode'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage(language === 'en' ? 'nl' : 'en')} className="cursor-pointer text-xs gap-2">
              <span className="h-3.5 w-3.5 flex items-center justify-center text-[10px] font-bold">{language === 'en' ? 'NL' : 'EN'}</span>
              {language === 'en' ? 'Switch to Dutch' : 'Switch to English'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications - stays visible */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0 bg-background border border-border shadow-xl rounded-xl overflow-hidden" onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">{t('dashboard.nav.notifications')}</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground">{unreadCount} unread</span>
              )}
            </div>
            <div className="max-h-[340px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-6 w-6 text-muted-foreground/25 mb-2" />
                  <p className="text-xs text-muted-foreground">{t('dashboard.nav.noNotifications')}</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification, idx) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "px-4 py-3.5",
                        idx < notifications.length - 1 && "border-b border-border/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-full shrink-0 flex items-center justify-center",
                          notification.type === 'nox_complete' ? "bg-primary/8 text-primary" :
                          notification.type === 'settlement_complete' ? "bg-muted text-foreground" :
                          notification.type === 'payment_success' ? "bg-primary/8 text-primary" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {notification.type === 'nox_complete' ? (
                            <FileText className="h-3.5 w-3.5" />
                          ) : notification.type === 'payment_success' ? (
                            <CreditCard className="h-3.5 w-3.5" />
                          ) : notification.type === 'settlement_complete' ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Bell className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-[13px] leading-snug", !notification.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>{notification.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{notification.message}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1.5 tabular-nums">
                            {new Date(notification.createdAt).toLocaleString('nl-BE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {!notification.read && (
                            <button
                              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground border border-border rounded-md px-2.5 py-1 hover:bg-muted transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                                setNotifications(getNotifications());
                                setUnreadCount(getUnreadCount());
                              }}
                            >
                              <Check className="h-3 w-3" />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User menu */}
        <DropdownMenu open={profileMenuOpen} onOpenChange={(open) => { setProfileMenuOpen(open); if (!open) setShowAccountSwitch(false); }}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-lg p-1.5 hover:bg-muted">
              <div className="relative h-7 w-7 shrink-0 rounded-full bg-muted">
                {getAvatarUrl({ email: currentUser.email, name: currentUser.name }) ? (
                  <img
                    src={getAvatarUrl({ email: currentUser.email, name: currentUser.name })}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full object-cover"
                    loading="eager"
                    decoding="sync"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs font-medium rounded-full">
                    {getInitials(currentUser.name)}
                  </div>
                )}
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[280px] p-0">
            {!showAccountSwitch ? (
              <>
                <div className="px-4 py-3">
                  <p className="font-medium text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem asChild className="cursor-pointer text-xs h-8 px-3">
                    <Link to="/profile">{t('dashboard.nav.profile')}</Link>
                  </DropdownMenuItem>
                  {isPowerUser && (
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setShowAccountSwitch(true); }} className="cursor-pointer text-xs h-8 px-3">
                      {t('dashboard.nav.switchAccount')}
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-xs h-8 px-3 text-destructive">
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    {t('dashboard.nav.signOut')}
                  </DropdownMenuItem>
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-3 flex items-center gap-2 border-b">
                  <button onClick={() => setShowAccountSwitch(false)} className="p-0.5 hover:bg-muted rounded">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">{t('dashboard.nav.switchAccount')}</span>
                </div>
                <div className={cn(
                  "max-h-80 overflow-y-auto p-1.5 overscroll-contain",
                  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  "hover:[scrollbar-width:thin] hover:[&::-webkit-scrollbar]:block hover:[&::-webkit-scrollbar]:w-1.5 hover:[&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80 hover:[&::-webkit-scrollbar-track]:bg-transparent"
                )}>
                  {teamMembers.map((member) => {
                    const isCurrentUser = currentUser.email === member.general.workEmail;
                    return (
                      <DropdownMenuItem
                        key={member.id}
                        onSelect={() => handleSwitchAccount(member.general.workEmail)}
                        className={cn("cursor-pointer px-3 py-2.5 rounded-lg", isCurrentUser && "bg-primary/10")}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="h-9 w-9 rounded-full bg-muted overflow-hidden shrink-0">
                            {getAvatarUrl({ email: member.general.workEmail }) ? (
                              <img src={getAvatarUrl({ email: member.general.workEmail })} alt={`${member.general.firstName} ${member.general.lastName}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                                {getInitials(`${member.general.firstName} ${member.general.lastName}`)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.general.firstName} {member.general.lastName}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.general.workEmail}</p>
                          </div>
                          {isCurrentUser && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Company name/logo - separate from avatar */}
        {!isOwnerOrAdmin && (
          <div className="hidden sm:flex items-center">
            {effectiveLogo ? (
              <img src={effectiveLogo} alt="Company logo" className="h-6 w-6 rounded object-contain bg-white p-0.5" />
            ) : (
              <span className="text-xs font-medium text-muted-foreground max-w-[140px] truncate">{displayName}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: OxiCloud logo + Nav */}
          <div className="flex items-center gap-6">
            <Link to={isOwnerOrAdmin ? '/dashboard/admin' : '/dashboard/client/home'} className="shrink-0">
              <img src={theme === 'dark' ? oxiLogoLight : oxiLogoDark} alt="OxiCloud" className="h-7 w-7" />
            </Link>
            <div className="hidden md:flex">
              {renderNavigation()}
            </div>
          </div>
          {renderActions()}
        </div>
      </div>
    </nav>
  );
};
