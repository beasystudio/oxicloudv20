import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Bell, ChevronDown, LogOut, HelpCircle, Plus, BarChart, Loader, ArrowLeft } from 'lucide-react';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotOnboarding, clearAllPilotData, getPilotCompanyLogo } from '@/lib/pilotSessionStore';
import { useLanguage } from '@/i18n/LanguageContext';
interface PilotNavigationProps {
  onStartOnboarding?: (flow: 1 | 2 | 3) => void;
}
export function PilotNavigation({
  onStartOnboarding
}: PilotNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const user = getPilotUser();
  const company = getPilotCompany();
  const onboarding = getPilotOnboarding();
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
  const NavItem = ({
    to,
    label



  }: {to: string;label: string;}) => <Link to={to} className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200", isActive(to) ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary")}>
      <span className="hidden lg:inline text-xs">{label}</span>
    </Link>;
  return <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Company branding + Nav */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {companyLogo ?
              <img src={companyLogo} alt="Company logo" className="w-8 h-8 rounded-lg object-contain bg-muted border border-border" /> :

              <span className="font-semibold text-sm text-foreground">{company.name}</span>
              }
                

              
              </div>
            </div>

            {/* Nav items - matching production client nav */}
            <div className="hidden md:flex items-center gap-2">
              <NavItem to="/pilot-demo/dashboard" label={t('pilot.nav.home')} />
              <NavItem to="/pilot-demo/projects" label={t('pilot.nav.projects')} />
              <NavItem to="/pilot-demo/contacts" label={t('pilot.nav.contacts')} />
            </div>
          </div>

          {/* Right: Actions - matching production */}
          <div className="flex items-center gap-1">
            {/* Global Add Menu (+) - matching production */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-foreground text-[hsl(var(--neon-lime))] hover:bg-muted/60 hover:text-foreground transition-all duration-200">
                  <Plus className="h-3.5 w-3.5 text-primary" />
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

            {/* Setup Guide */}
            {onStartOnboarding && <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => onStartOnboarding(!onboarding.flow1Complete ? 1 : !onboarding.flow2Complete ? 2 : 3)}>
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('pilot.nav.setupGuide')}</span>
              </Button>}

            {/* Financial Dashboard */}
            <Button asChild variant="ghost" size="icon" className={cn("h-9 w-9", isActive('/pilot-demo/financial') && "bg-primary/10")}>
              <Link to="/pilot-demo/financial" title="Financial Dashboard">
                <BarChart className="h-4 w-4" />
              </Link>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>


            {/* Language Toggle */}
            <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => setLanguage(language === 'en' ? 'nl' : 'en')}>
            
              {language === 'en' ? 'EN' : 'NL'}
            </Button>

            {/* Settings */}
            <Button asChild variant="ghost" size="icon" className={cn("h-9 w-9", isActive('/pilot-demo/settings') && "bg-primary/10")}>
              <Link to="/pilot-demo/settings">
                <Loader className="h-4 w-4 bg-transparent text-primary" />
              </Link>
            </Button>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* User menu */}
            <DropdownMenu open={profileMenuOpen} onOpenChange={(open) => {setProfileMenuOpen(open);if (!open) setShowAccountSwitch(false);}}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-lg p-1.5 hover:bg-muted">
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                    {getInitials(`${user.firstName} ${user.lastName}`)}
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[240px] p-0">
                {!showAccountSwitch ?
              <>
                    <div className="px-4 py-3">
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <DropdownMenuItem asChild className="cursor-pointer text-xs h-8 px-3">
                        <Link to="/pilot-demo/settings">{t('pilot.nav.settings')}</Link>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs h-8 px-3 text-destructive">
                        <LogOut className="h-3.5 w-3.5 mr-2" />
                        {t('pilot.nav.signOut')}
                      </DropdownMenuItem>
                    </div>
                  </> :
              null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>;
}