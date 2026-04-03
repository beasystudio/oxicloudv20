import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Bell, ChevronDown, LogOut, Plus, BarChart, Settings2, Moon, Sun, Ellipsis } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotOnboarding, clearAllPilotData, getPilotCompanyLogo } from '@/lib/pilotSessionStore';
import { useLanguage } from '@/i18n/LanguageContext';
import oxiLogoLight from '@/assets/oxicloud-logo-light.png';
import oxiLogoDark from '@/assets/oxicloud-logo-dark.png';

interface PilotNavigationProps {
  onStartOnboarding?: (flow: 1 | 2 | 3) => void;
}

export function PilotNavigation({ onStartOnboarding }: PilotNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const user = getPilotUser();
  const company = getPilotCompany();
  const companyLogo = getPilotCompanyLogo();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);

  if (!user || !company) return null;

  const isActive = (path: string) => location.pathname === path;
  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const handleLogout = () => {
    clearAllPilotData();
    navigate('/');
  };

  const NavItem = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
        isActive(to)
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-transparent border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: OxiCloud logo + Nav */}
          <div className="flex items-center gap-6">
            <Link to="/pilot-demo/dashboard" className="shrink-0">
              <img src={theme === 'dark' ? oxiLogoLight : oxiLogoDark} alt="OxiCloud" className="h-7 w-7" />
            </Link>

            {/* Nav items - matching production client nav */}
            <div className="hidden md:flex items-center gap-2">
              <NavItem to="/pilot-demo/projects" label={t('pilot.nav.projects')} />
              <NavItem to="/pilot-demo/projects" label={t('pilot.nav.projects')} />
              <NavItem to="/pilot-demo/contacts" label={t('pilot.nav.contacts')} />
            </div>
          </div>

          {/* Right: Actions - matching production TopNavigation */}
          <div className="flex items-center gap-1">
            {/* Global Add Menu (+) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-foreground text-background dark:bg-primary dark:text-primary-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/pilot-demo/contacts?action=add-company')}>
                  {t('pilot.nav.addCompany')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pilot-demo/contacts?action=add-person')}>
                  {t('pilot.nav.addPerson')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pilot-demo/projects?action=create')}>
                  {t('pilot.nav.addProject')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grouped: Financial + Settings + Theme + Language in "More" dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                  <Link to="/pilot-demo/financial">
                    <BarChart className="h-3.5 w-3.5" />
                    {t('dashboard.nav.financial') || 'Financial'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                  <Link to="/pilot-demo/settings">
                    <Settings2 className="h-3.5 w-3.5" />
                    {t('dashboard.nav.settings') || 'Settings'}
                  </Link>
                </DropdownMenuItem>
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
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* User menu */}
            <DropdownMenu open={profileMenuOpen} onOpenChange={(open) => { setProfileMenuOpen(open); if (!open) setShowAccountSwitch(false); }}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-lg p-1.5 hover:bg-muted">
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                    {getInitials(`${user.firstName} ${user.lastName}`)}
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[240px] p-0">
                {!showAccountSwitch ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <DropdownMenuItem asChild className="cursor-pointer text-xs h-8 px-3">
                        <Link to="/pilot-demo/profile">{language === 'nl' ? 'Profiel' : 'Profile'}</Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs h-8 px-3 text-destructive">
                        <LogOut className="h-3.5 w-3.5 mr-2" />
                        {t('pilot.nav.signOut')}
                      </DropdownMenuItem>
                    </div>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Company name/logo - separate from avatar */}
            <div className="hidden sm:flex items-center">
              {companyLogo ? (
                <img src={companyLogo} alt="Company logo" className="h-6 w-6 rounded object-contain" />
              ) : (
                <span className="text-xs font-medium text-muted-foreground max-w-[140px] truncate">{company.name}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
