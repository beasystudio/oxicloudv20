import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { getPilotSession, getPilotUser, updatePilotUser } from '@/lib/pilotSessionStore';

export default function PilotProfile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const session = getPilotSession();
  const user = getPilotUser();

  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  useEffect(() => {
    if (!session || !user) navigate('/pilot-demo');
  }, []);

  if (!session || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const parts = name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    updatePilotUser({ firstName, lastName });
    toast({ title: t('dashboard.profilePage.title'), description: "Your profile information has been updated successfully." });
    setIsUpdatingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    toast({ title: t('dashboard.profilePage.changePassword'), description: "Your password has been changed successfully." });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setIsChangingPassword(false);
  };

  const handleSavePreferences = () => {
    toast({ title: t('dashboard.profilePage.preferences'), description: "Your notification preferences have been updated." });
  };

  return (
    <div className="min-h-screen bg-background">
      <PilotNavigation />
      <div className="container mx-auto py-6 px-4 max-w-3xl">
        <div className="mb-6">
          <h1 className="font-semibold text-foreground text-base">{t('dashboard.profilePage.title')}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.profilePage.personalInfo')}
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="py-4 px-5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">{t('dashboard.profilePage.personalInfo')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">{t('dashboard.profilePage.email')}</Label>
                  <Input id="email" type="email" value={user.email} disabled className="bg-muted h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">{t('dashboard.profilePage.name')}</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
                </div>
                <Button type="submit" size="sm" className="text-xs h-8" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? t('dashboard.profilePage.updating') : t('dashboard.profilePage.updateProfile')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 px-5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">{t('dashboard.profilePage.changePassword')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs">{t('dashboard.profilePage.currentPassword')}</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs">{t('dashboard.profilePage.newPassword')}</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs">{t('dashboard.profilePage.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-8 text-sm" />
                </div>
                <Button type="submit" size="sm" className="text-xs h-8" disabled={isChangingPassword}>
                  {isChangingPassword ? t('dashboard.profilePage.changingPassword') : t('dashboard.profilePage.changePasswordBtn')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4 px-5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">{t('dashboard.profilePage.preferences')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-xs">{t('dashboard.profilePage.emailNotifications')}</Label>
                  <p className="text-[11px] text-muted-foreground">{t('dashboard.profilePage.emailNotificationsDesc')}</p>
                </div>
                <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-xs">{t('dashboard.profilePage.pushNotifications')}</Label>
                  <p className="text-[11px] text-muted-foreground">{t('dashboard.profilePage.pushNotificationsDesc')}</p>
                </div>
                <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-report" className="text-xs">{t('dashboard.profilePage.weeklyReport')}</Label>
                  <p className="text-[11px] text-muted-foreground">{t('dashboard.profilePage.weeklyReportDesc')}</p>
                </div>
                <Switch id="weekly-report" checked={weeklyReport} onCheckedChange={setWeeklyReport} />
              </div>
              <Button onClick={handleSavePreferences} size="sm" className="text-xs h-8 mt-2">
                {t('dashboard.profilePage.updateProfile')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
