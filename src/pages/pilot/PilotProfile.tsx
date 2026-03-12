import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getPilotSession, getPilotUser, getPilotCompany, updatePilotUser } from '@/lib/pilotSessionStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { User, Mail, Phone, Building2, Shield } from 'lucide-react';

export default function PilotProfile() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const nl = language === 'nl';
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (!session || !user) navigate('/pilot-demo');
  }, []);

  if (!session || !user || !company) return null;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSave = () => {
    updatePilotUser({ firstName, lastName, phone });
    toast.success(nl ? 'Profiel bijgewerkt' : 'Profile updated');
  };

  return (
    <>
      <Helmet>
        <title>{nl ? 'Profiel' : 'Profile'} - OxiCloud</title>
      </Helmet>

      <div className="min-h-screen bg-background overflow-y-auto flex flex-col">
        <PilotNavigation />

        <div className="max-w-[640px] mx-auto px-5 py-8 pb-16 w-full">
          <h1 className="text-lg font-semibold text-foreground mb-6">
            {nl ? 'Mijn profiel' : 'My Profile'}
          </h1>

          {/* Avatar & name header */}
          <Card className="p-6 mb-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg font-semibold">
                {getInitials(`${user.firstName} ${user.lastName}`)}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {nl ? 'Voornaam' : 'First name'}
                </Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {nl ? 'Achternaam' : 'Last name'}
                </Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  E-mail
                </Label>
                <Input value={email} disabled className="h-9 text-sm bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {nl ? 'Telefoon' : 'Phone'}
                </Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button onClick={handleSave} size="sm">
                {nl ? 'Opslaan' : 'Save'}
              </Button>
            </div>
          </Card>

          {/* Company info (read-only) */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">{nl ? 'Bedrijf' : 'Company'}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{nl ? 'Naam' : 'Name'}</p>
                <p className="text-foreground">{company.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{nl ? 'BTW-nummer' : 'VAT Number'}</p>
                <p className="text-foreground">{company.vatNumber || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-0.5">{nl ? 'Rol' : 'Role'}</p>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-primary" />
                  <span className="text-foreground">Owner / Zaakvoerder</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
