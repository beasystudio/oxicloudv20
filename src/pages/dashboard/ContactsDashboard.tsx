import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { TopNavigation } from '@/components/TopNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { seedDemoContacts, clearAllContacts } from '@/lib/mockContactDB';
import { getAllCompanyContacts, getAllCompanies, isCompanyDataSeeded, type CompanyContact, type Company } from '@/lib/mockCompanyDB';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { toast } from 'sonner';
import { Search, ChevronDown, ChevronRight, Download, Building2, User, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactDetailModal } from '@/components/contacts/ContactDetailModal';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

// Extended company type with employees and addresses
interface CompanyWithDetails {
  id: string;
  name: string;
  email: string;
  telephone: string;
  address: string;
  city: string;
  contactCategory: string;
  employees: {
    id: string;
    name: string;
    function: string;
    email: string;
    telephone: string;
  }[];
  addresses: {
    id: string;
    name: string;
    street: string;
    number: string;
    postcode: string;
    gemeente: string;
  }[];
}

// Extended contact type for person view
interface UnifiedContact {
  id: string;
  name: string;
  company: string;
  email: string;
  mobilePhone: string;
  workPhone: string;
  homePhone: string;
  contactCategory: string;
  companyId?: string;
  isCompany?: boolean;
}

// Contact type categories matching the reference structure
interface ContactTypeNode {
  id: string;
  label: string;
  children?: ContactTypeNode[];
}

// Demo contact type tree - only shown for non-pilot accounts
const DEMO_CONTACT_TYPE_TREE: ContactTypeNode[] = [{
  id: 'aannemers',
  label: 'Aannemers',
  children: [{
    id: 'afbraak',
    label: 'Afbraak'
  }, {
    id: 'afwerking',
    label: 'Afwerking'
  }, {
    id: 'alarm',
    label: 'Alarm'
  }, {
    id: 'algemeen-aannemer',
    label: 'Algemeen aannemer'
  }, {
    id: 'betonvloeren',
    label: 'Betonvloeren'
  }, {
    id: 'binnenschrijnwerk',
    label: 'Binnenschrijnwerk'
  }, {
    id: 'boskap',
    label: 'Boskap'
  }, {
    id: 'buitenschrijnwerk',
    label: 'Buitenschrijnwerk'
  }, {
    id: 'chape',
    label: 'Chape'
  }, {
    id: 'dakwerker',
    label: 'Dakwerker'
  }, {
    id: 'diamant-boringen',
    label: 'Diamant boringen'
  }, {
    id: 'droogzuiging',
    label: 'Droogzuiging'
  }, {
    id: 'elektricien',
    label: 'Elektricien'
  }, {
    id: 'gevelbekleding',
    label: 'Gevelbekleding'
  }]
}, {
  id: 'advies',
  label: 'Advies'
}, {
  id: 'algemeen',
  label: 'Algemeen'
}, {
  id: 'klanten-bedrijf',
  label: 'Klanten bedrijf'
}, {
  id: 'klanten-particulier',
  label: 'Klanten particulier'
}, {
  id: 'materialen',
  label: 'Materialen'
}, {
  id: 'openbare-instellingen',
  label: 'Openbare Instellingen'
}, {
  id: 'promotor',
  label: 'Promotor'
}, {
  id: 'prospect',
  label: 'Prospect'
}, {
  id: 'studiebureau',
  label: 'Studiebureau'
}];

// Comprehensive demo companies with employees and addresses from all demo projects
const DEMO_COMPANIES: CompanyWithDetails[] = [
// GDesign Architecten (Internal)
{
  id: 'gdesign',
  name: 'GDesign Architecten',
  email: 'info@gdesign.be',
  telephone: '+32 16 234 567',
  address: 'Bondgenotenlaan 120',
  city: '3000 Leuven',
  contactCategory: 'studiebureau',
  employees: [{
    id: 'gd1',
    name: 'Jan Vermeersch',
    function: 'Managing Director',
    email: 'jan@gdesign.be',
    telephone: '+32 16 123 456'
  }, {
    id: 'gd2',
    name: 'Maria Peeters',
    function: 'Office Manager',
    email: 'maria@gdesign.be',
    telephone: '+32 16 123 457'
  }, {
    id: 'gd3',
    name: 'Lisa De Smet',
    function: 'Junior Architect',
    email: 'lisa@gdesign.be',
    telephone: '+32 16 123 458'
  }, {
    id: 'gd4',
    name: 'Thomas Janssen',
    function: 'Senior Architect',
    email: 'thomas@gdesign.be',
    telephone: '+32 16 123 459'
  }, {
    id: 'gd5',
    name: 'Emma Van Damme',
    function: 'Project Coordinator',
    email: 'emma@gdesign.be',
    telephone: '+32 16 123 460'
  }, {
    id: 'gd6',
    name: 'Pieter Maes',
    function: 'Technical Draftsman',
    email: 'pieter@gdesign.be',
    telephone: '+32 16 123 461'
  }],
  addresses: [{
    id: 'gd-addr1',
    name: 'Hoofdkantoor Leuven',
    street: 'Bondgenotenlaan',
    number: '120',
    postcode: '3000',
    gemeente: 'Leuven'
  }]
},
// 4TAKT (Internal)
{
  id: '4takt',
  name: '4TAKT',
  email: 'info@4takt.be',
  telephone: '+32 3 456 789',
  address: 'Meir 25',
  city: '2000 Antwerpen',
  contactCategory: 'studiebureau',
  employees: [{
    id: '4t1',
    name: 'Sophie Willems',
    function: 'Managing Director',
    email: 'sophie@4takt.be',
    telephone: '+32 478 456 789'
  }, {
    id: '4t2',
    name: 'Tom Peeters',
    function: 'Senior Architect',
    email: 'tom@4takt.be',
    telephone: '+32 479 567 890'
  }],
  addresses: [{
    id: '4t-addr1',
    name: 'Kantoor Antwerpen',
    street: 'Meir',
    number: '25',
    postcode: '2000',
    gemeente: 'Antwerpen'
  }]
},
// Client Companies from Demo Projects
{
  id: 'pauwels-vastgoed',
  name: 'Pauwels Vastgoed NV',
  email: 'contact@pauwelsvastgoed.be',
  telephone: '+32 16 456 789',
  address: 'Tiensestraat 45',
  city: '3000 Leuven',
  contactCategory: 'klanten-bedrijf',
  employees: [{
    id: 'pv1',
    name: 'Frank Pauwels',
    function: 'CEO',
    email: 'frank@pauwelsvastgoed.be',
    telephone: '+32 475 111 222'
  }, {
    id: 'pv2',
    name: 'Els Mertens',
    function: 'Project Coordinator',
    email: 'els@pauwelsvastgoed.be',
    telephone: '+32 476 222 333'
  }],
  addresses: [{
    id: 'pv-addr1',
    name: 'Hoofdkantoor',
    street: 'Tiensestraat',
    number: '45',
    postcode: '3000',
    gemeente: 'Leuven'
  }, {
    id: 'pv-addr2',
    name: 'Project Site Herent',
    street: 'Mechelsesteenweg',
    number: '120',
    postcode: '3020',
    gemeente: 'Herent'
  }]
}, {
  id: 'bouwgroep-vandijk',
  name: 'Bouwgroep Van Dijk',
  email: 'info@vandijkbouw.be',
  telephone: '+32 3 789 012',
  address: 'Industrielaan 88',
  city: '2800 Mechelen',
  contactCategory: 'aannemers',
  employees: [{
    id: 'vd1',
    name: 'Peter Van Dijk',
    function: 'Zaakvoerder',
    email: 'peter@vandijkbouw.be',
    telephone: '+32 477 333 444'
  }, {
    id: 'vd2',
    name: 'An Claessens',
    function: 'Werfleider',
    email: 'an@vandijkbouw.be',
    telephone: '+32 478 444 555'
  }, {
    id: 'vd3',
    name: 'Kris Bogaerts',
    function: 'Calculator',
    email: 'kris@vandijkbouw.be',
    telephone: '+32 479 555 666'
  }],
  addresses: [{
    id: 'vd-addr1',
    name: 'Hoofdzetel Mechelen',
    street: 'Industrielaan',
    number: '88',
    postcode: '2800',
    gemeente: 'Mechelen'
  }, {
    id: 'vd-addr2',
    name: 'Depot Kontich',
    street: 'Groeningenlei',
    number: '14',
    postcode: '2550',
    gemeente: 'Kontich'
  }]
}, {
  id: 'elektricien-nv',
  name: '2B-Safe Elektro',
  email: 'info@2b-safe.be',
  telephone: '+32 16 810 174',
  address: 'Herkenrodestraat 25',
  city: '3210 Glabbeek',
  contactCategory: 'aannemers',
  employees: [{
    id: 'e1',
    name: 'Saartje Verjans',
    function: 'Dienst Administratie',
    email: 'saartje.verjans@2b-safe.be',
    telephone: '+32 16 810 174'
  }, {
    id: 'e2',
    name: 'Ivo Verjans',
    function: 'Bestuurder',
    email: 'ivo.verjans@2b-safe.be',
    telephone: '+32 16 810 174'
  }, {
    id: 'e3',
    name: 'Lydia Lambrechts',
    function: 'Diensthoofd administratie',
    email: 'lydia.lambrechts@2b-safe.be',
    telephone: '+32 478 332 189'
  }, {
    id: 'e4',
    name: 'Kristof Berchmans',
    function: 'CEO',
    email: 'kristof@2b-safe.be',
    telephone: '+32 16 303 010'
  }],
  addresses: [{
    id: 'a1',
    name: '2b-Safe Glabbeek',
    street: 'Herkenrodestraat',
    number: '25',
    postcode: '3210',
    gemeente: 'Glabbeek - Zuurbemde'
  }]
}, {
  id: 'dakwerken-peeters',
  name: 'Dakwerken Peeters BVBA',
  email: 'info@dakwerkenpeeters.be',
  telephone: '+32 15 234 567',
  address: 'Nijverheidsstraat 12',
  city: '2220 Heist-op-den-Berg',
  contactCategory: 'aannemers',
  employees: [{
    id: 'dp1',
    name: 'Johan Peeters',
    function: 'Zaakvoerder',
    email: 'johan@dakwerkenpeeters.be',
    telephone: '+32 475 666 777'
  }, {
    id: 'dp2',
    name: 'Bart Hermans',
    function: 'Dakdekker',
    email: 'bart@dakwerkenpeeters.be',
    telephone: '+32 476 777 888'
  }],
  addresses: [{
    id: 'dp-addr1',
    name: 'Hoofdkantoor',
    street: 'Nijverheidsstraat',
    number: '12',
    postcode: '2220',
    gemeente: 'Heist-op-den-Berg'
  }]
}, {
  id: 'stabiliteit-partners',
  name: 'Stabiliteit & Partners',
  email: 'contact@stabiliteit.be',
  telephone: '+32 2 567 890',
  address: 'Wetstraat 155',
  city: '1040 Brussel',
  contactCategory: 'studiebureau',
  employees: [{
    id: 'sp1',
    name: 'Dr. Marc Vanden Berghe',
    function: 'Hoofdingenieur',
    email: 'marc@stabiliteit.be',
    telephone: '+32 477 888 999'
  }, {
    id: 'sp2',
    name: 'Liesbeth Aerts',
    function: 'Stabiliteitsingenieur',
    email: 'liesbeth@stabiliteit.be',
    telephone: '+32 478 999 000'
  }],
  addresses: [{
    id: 'sp-addr1',
    name: 'Kantoor Brussel',
    street: 'Wetstraat',
    number: '155',
    postcode: '1040',
    gemeente: 'Brussel'
  }]
}, {
  id: 'hvac-solutions',
  name: 'HVAC Solutions NV',
  email: 'info@hvacsolutions.be',
  telephone: '+32 11 345 678',
  address: 'Kanaalweg 67',
  city: '3500 Hasselt',
  contactCategory: 'aannemers',
  employees: [{
    id: 'hv1',
    name: 'Dirk Vandeput',
    function: 'Technical Director',
    email: 'dirk@hvacsolutions.be',
    telephone: '+32 479 000 111'
  }, {
    id: 'hv2',
    name: 'Nathalie Goossens',
    function: 'Sales Manager',
    email: 'nathalie@hvacsolutions.be',
    telephone: '+32 475 111 000'
  }],
  addresses: [{
    id: 'hv-addr1',
    name: 'Hoofdkantoor Hasselt',
    street: 'Kanaalweg',
    number: '67',
    postcode: '3500',
    gemeente: 'Hasselt'
  }]
}, {
  id: 'gemeente-leuven',
  name: 'Stad Leuven - Dienst Stedenbouw',
  email: 'stedenbouw@leuven.be',
  telephone: '+32 16 272 000',
  address: 'Professor Van Overstraetenplein 1',
  city: '3000 Leuven',
  contactCategory: 'openbare-instellingen',
  employees: [{
    id: 'gl1',
    name: 'Koen Vandenberghe',
    function: 'Diensthoofd Stedenbouw',
    email: 'koen.vandenberghe@leuven.be',
    telephone: '+32 16 272 001'
  }, {
    id: 'gl2',
    name: 'Sarah De Keersmaecker',
    function: 'Vergunningsambtenaar',
    email: 'sarah.dekeersmaecker@leuven.be',
    telephone: '+32 16 272 002'
  }],
  addresses: [{
    id: 'gl-addr1',
    name: 'Stadskantoor',
    street: 'Professor Van Overstraetenplein',
    number: '1',
    postcode: '3000',
    gemeente: 'Leuven'
  }]
}, {
  id: 'artebeau',
  name: 'Artebeau BV',
  email: 'contact@artebeau.be',
  telephone: '+32 16 450 123',
  address: 'Leuvensesteenweg 276',
  city: '3200 Aarschot',
  contactCategory: 'aannemers',
  employees: [{
    id: 'ab1',
    name: 'Thomas Artois',
    function: 'Zaakvoerder',
    email: 'thomas@artebeau.be',
    telephone: '+32 476 123 456'
  }],
  addresses: [{
    id: 'ab-addr1',
    name: 'Atelier Aarschot',
    street: 'Leuvensesteenweg',
    number: '276',
    postcode: '3200',
    gemeente: 'Aarschot'
  }]
}, {
  id: 'immo-invest',
  name: 'Immo Invest Group',
  email: 'info@immoinvest.be',
  telephone: '+32 2 890 123',
  address: 'Louizalaan 500',
  city: '1050 Elsene',
  contactCategory: 'promotor',
  employees: [{
    id: 'ii1',
    name: 'Philippe Wouters',
    function: 'Managing Partner',
    email: 'philippe@immoinvest.be',
    telephone: '+32 475 222 111'
  }, {
    id: 'ii2',
    name: 'Anne-Sophie Lambert',
    function: 'Investment Manager',
    email: 'annesophie@immoinvest.be',
    telephone: '+32 476 333 222'
  }, {
    id: 'ii3',
    name: 'Stijn Verstraeten',
    function: 'Project Developer',
    email: 'stijn@immoinvest.be',
    telephone: '+32 477 444 333'
  }],
  addresses: [{
    id: 'ii-addr1',
    name: 'Hoofdkantoor Brussel',
    street: 'Louizalaan',
    number: '500',
    postcode: '1050',
    gemeente: 'Elsene'
  }]
}, {
  id: 'familie-de-winter',
  name: 'Familie De Winter',
  email: 'dewinter.familie@gmail.com',
  telephone: '+32 475 555 666',
  address: 'Dennenlaan 8',
  city: '3090 Overijse',
  contactCategory: 'klanten-particulier',
  employees: [{
    id: 'dw1',
    name: 'Marc De Winter',
    function: 'Eigenaar',
    email: 'marc.dewinter@gmail.com',
    telephone: '+32 475 555 666'
  }, {
    id: 'dw2',
    name: 'Katrien De Winter',
    function: 'Eigenaar',
    email: 'katrien.dewinter@gmail.com',
    telephone: '+32 476 666 555'
  }],
  addresses: [{
    id: 'dw-addr1',
    name: 'Woning Overijse',
    street: 'Dennenlaan',
    number: '8',
    postcode: '3090',
    gemeente: 'Overijse'
  }]
}];

// Comprehensive demo persons (flattened from all company employees)
interface PersonContact {
  id: string;
  name: string;
  company: string;
  function: string;
  email: string;
  telephone: string;
}
const DEMO_PERSONS: PersonContact[] = [
// GDesign Architecten
{
  id: 'gd1',
  name: 'Vermeersch Jan',
  company: 'GDesign Architecten',
  function: 'Managing Director',
  email: 'jan@gdesign.be',
  telephone: '+32 16 123 456'
}, {
  id: 'gd2',
  name: 'Peeters Maria',
  company: 'GDesign Architecten',
  function: 'Office Manager',
  email: 'maria@gdesign.be',
  telephone: '+32 16 123 457'
}, {
  id: 'gd3',
  name: 'De Smet Lisa',
  company: 'GDesign Architecten',
  function: 'Junior Architect',
  email: 'lisa@gdesign.be',
  telephone: '+32 16 123 458'
}, {
  id: 'gd4',
  name: 'Janssen Thomas',
  company: 'GDesign Architecten',
  function: 'Senior Architect',
  email: 'thomas@gdesign.be',
  telephone: '+32 16 123 459'
}, {
  id: 'gd5',
  name: 'Van Damme Emma',
  company: 'GDesign Architecten',
  function: 'Project Coordinator',
  email: 'emma@gdesign.be',
  telephone: '+32 16 123 460'
}, {
  id: 'gd6',
  name: 'Maes Pieter',
  company: 'GDesign Architecten',
  function: 'Technical Draftsman',
  email: 'pieter@gdesign.be',
  telephone: '+32 16 123 461'
},
// 4TAKT
{
  id: '4t1',
  name: 'Willems Sophie',
  company: '4TAKT',
  function: 'Managing Director',
  email: 'sophie@4takt.be',
  telephone: '+32 478 456 789'
}, {
  id: '4t2',
  name: 'Peeters Tom',
  company: '4TAKT',
  function: 'Senior Architect',
  email: 'tom@4takt.be',
  telephone: '+32 479 567 890'
},
// Pauwels Vastgoed
{
  id: 'pv1',
  name: 'Pauwels Frank',
  company: 'Pauwels Vastgoed NV',
  function: 'CEO',
  email: 'frank@pauwelsvastgoed.be',
  telephone: '+32 475 111 222'
}, {
  id: 'pv2',
  name: 'Mertens Els',
  company: 'Pauwels Vastgoed NV',
  function: 'Project Coordinator',
  email: 'els@pauwelsvastgoed.be',
  telephone: '+32 476 222 333'
},
// Bouwgroep Van Dijk
{
  id: 'vd1',
  name: 'Van Dijk Peter',
  company: 'Bouwgroep Van Dijk',
  function: 'Zaakvoerder',
  email: 'peter@vandijkbouw.be',
  telephone: '+32 477 333 444'
}, {
  id: 'vd2',
  name: 'Claessens An',
  company: 'Bouwgroep Van Dijk',
  function: 'Werfleider',
  email: 'an@vandijkbouw.be',
  telephone: '+32 478 444 555'
}, {
  id: 'vd3',
  name: 'Bogaerts Kris',
  company: 'Bouwgroep Van Dijk',
  function: 'Calculator',
  email: 'kris@vandijkbouw.be',
  telephone: '+32 479 555 666'
},
// 2B-Safe
{
  id: 'e1',
  name: 'Verjans Saartje',
  company: '2B-Safe Elektro',
  function: 'Dienst Administratie',
  email: 'saartje.verjans@2b-safe.be',
  telephone: '+32 16 810 174'
}, {
  id: 'e2',
  name: 'Verjans Ivo',
  company: '2B-Safe Elektro',
  function: 'Bestuurder',
  email: 'ivo.verjans@2b-safe.be',
  telephone: '+32 16 810 174'
}, {
  id: 'e3',
  name: 'Lambrechts Lydia',
  company: '2B-Safe Elektro',
  function: 'Diensthoofd administratie',
  email: 'lydia.lambrechts@2b-safe.be',
  telephone: '+32 478 332 189'
}, {
  id: 'e4',
  name: 'Berchmans Kristof',
  company: '2B-Safe Elektro',
  function: 'CEO',
  email: 'kristof@2b-safe.be',
  telephone: '+32 16 303 010'
},
// Dakwerken Peeters
{
  id: 'dp1',
  name: 'Peeters Johan',
  company: 'Dakwerken Peeters BVBA',
  function: 'Zaakvoerder',
  email: 'johan@dakwerkenpeeters.be',
  telephone: '+32 475 666 777'
}, {
  id: 'dp2',
  name: 'Hermans Bart',
  company: 'Dakwerken Peeters BVBA',
  function: 'Dakdekker',
  email: 'bart@dakwerkenpeeters.be',
  telephone: '+32 476 777 888'
},
// Stabiliteit & Partners
{
  id: 'sp1',
  name: 'Vanden Berghe Marc',
  company: 'Stabiliteit & Partners',
  function: 'Hoofdingenieur',
  email: 'marc@stabiliteit.be',
  telephone: '+32 477 888 999'
}, {
  id: 'sp2',
  name: 'Aerts Liesbeth',
  company: 'Stabiliteit & Partners',
  function: 'Stabiliteitsingenieur',
  email: 'liesbeth@stabiliteit.be',
  telephone: '+32 478 999 000'
},
// HVAC Solutions
{
  id: 'hv1',
  name: 'Vandeput Dirk',
  company: 'HVAC Solutions NV',
  function: 'Technical Director',
  email: 'dirk@hvacsolutions.be',
  telephone: '+32 479 000 111'
}, {
  id: 'hv2',
  name: 'Goossens Nathalie',
  company: 'HVAC Solutions NV',
  function: 'Sales Manager',
  email: 'nathalie@hvacsolutions.be',
  telephone: '+32 475 111 000'
},
// Stad Leuven
{
  id: 'gl1',
  name: 'Vandenberghe Koen',
  company: 'Stad Leuven - Dienst Stedenbouw',
  function: 'Diensthoofd Stedenbouw',
  email: 'koen.vandenberghe@leuven.be',
  telephone: '+32 16 272 001'
}, {
  id: 'gl2',
  name: 'De Keersmaecker Sarah',
  company: 'Stad Leuven - Dienst Stedenbouw',
  function: 'Vergunningsambtenaar',
  email: 'sarah.dekeersmaecker@leuven.be',
  telephone: '+32 16 272 002'
},
// Artebeau
{
  id: 'ab1',
  name: 'Artois Thomas',
  company: 'Artebeau BV',
  function: 'Zaakvoerder',
  email: 'thomas@artebeau.be',
  telephone: '+32 476 123 456'
},
// Immo Invest
{
  id: 'ii1',
  name: 'Wouters Philippe',
  company: 'Immo Invest Group',
  function: 'Managing Partner',
  email: 'philippe@immoinvest.be',
  telephone: '+32 475 222 111'
}, {
  id: 'ii2',
  name: 'Lambert Anne-Sophie',
  company: 'Immo Invest Group',
  function: 'Investment Manager',
  email: 'annesophie@immoinvest.be',
  telephone: '+32 476 333 222'
}, {
  id: 'ii3',
  name: 'Verstraeten Stijn',
  company: 'Immo Invest Group',
  function: 'Project Developer',
  email: 'stijn@immoinvest.be',
  telephone: '+32 477 444 333'
},
// Familie De Winter
{
  id: 'dw1',
  name: 'De Winter Marc',
  company: 'Familie De Winter',
  function: 'Eigenaar',
  email: 'marc.dewinter@gmail.com',
  telephone: '+32 475 555 666'
}, {
  id: 'dw2',
  name: 'De Winter Katrien',
  company: 'Familie De Winter',
  function: 'Eigenaar',
  email: 'katrien.dewinter@gmail.com',
  telephone: '+32 476 666 555'
}];
// Import pilot account utils
import { isPilotAccount, isPilotCompany } from '@/lib/pilotAccountUtils';
import { getMonitorSubscriptions, type MonitorSubscription } from '@/lib/monitorSubscriptionStore';

type AdminProductTab = 'oxicloud' | 'monitor';

const ContactsDashboard = () => {
  const { t, language } = useLanguage();
  const {
    currentUser,
    selectedCompanyId,
    getSelectedCompany
  } = useMockAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([]);
  const [adminProductTab, setAdminProductTab] = useState<AdminProductTab>('oxicloud');
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedCompanies, setExpandedCompanies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('lastname-asc');
  const [showCount, setShowCount] = useState('24');
  const [viewMode, setViewMode] = useState<'company' | 'person'>('company');

  // Edit dialog state
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isClientOwnerOrAdmin = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin';
  const selectedCompany = getSelectedCompany();

  // Check if this is the pilot account - they should see empty data
  const isPilot = isPilotAccount(currentUser?.email) || isPilotCompany(selectedCompanyId);

  // Contact type tree - empty for pilot, demo data for others
  const contactTypeTree = isPilot ? [] : DEMO_CONTACT_TYPE_TREE;

  // Internal company IDs to hide from contacts module
  const INTERNAL_COMPANY_IDS = ['gdesign', '4takt'];
  const INTERNAL_COMPANY_NAMES = ['GDesign Architecten', '4TAKT'];

  // Company-scoped contacts: GDesign and 4TAKT should see completely separate contact pools
  const getCompanyScopedCompanies = () => {
    if (isPilot) return [];

    // Admin sees ALL companies' contacts
    if (isOwnerOrAdmin) {
      return DEMO_COMPANIES;
    }

    // Filter out the user's own company and other internal companies
    const isGDesign = selectedCompanyId === 'gdesign';
    const is4Takt = selectedCompanyId === '4takt';

    return DEMO_COMPANIES.filter((c) => {
      if (INTERNAL_COMPANY_IDS.includes(c.id)) return false;
      if (isGDesign) {
        const gdesignClients = ['pauwels-vastgoed', 'bouwgroep-vandijk', 'elektricien-nv', 'dakwerken-peeters', 'stabiliteit-partners', 'gemeente-leuven', 'artebeau'];
        return gdesignClients.includes(c.id);
      }
      if (is4Takt) {
        const taktClients = ['hvac-solutions', 'immo-invest', 'familie-de-winter', 'bouwgroep-vandijk', 'stabiliteit-partners'];
        return taktClients.includes(c.id);
      }
      return true;
    });
  };

  // Load demo companies - company-scoped
  useEffect(() => {
    setCompanies(getCompanyScopedCompanies());
  }, [refreshKey, isPilot, selectedCompanyId]);
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]);
  };
  const toggleTypeSelection = (typeId: string) => {
    setSelectedTypes((prev) => prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]);
  };
  const toggleCompanyExpand = (companyId: string) => {
    setExpandedCompanies((prev) => prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]);
  };

  // Handle double-click to edit contact
  const handleContactDoubleClick = (company: CompanyWithDetails) => {
    const contact: UnifiedContact = {
      id: company.id,
      name: company.name,
      company: company.name,
      email: company.email,
      mobilePhone: '',
      workPhone: company.telephone,
      homePhone: '',
      contactCategory: company.contactCategory,
      isCompany: true
    };
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  // Handle double-click on employee row to open detail modal
  const handleEmployeeDoubleClick = (emp: CompanyWithDetails['employees'][0], company: CompanyWithDetails) => {
    const contact: UnifiedContact = {
      id: emp.id,
      name: emp.name,
      company: company.name,
      email: emp.email,
      mobilePhone: '',
      workPhone: emp.telephone,
      homePhone: '',
      contactCategory: company.contactCategory,
      companyId: company.id,
      isCompany: false
    };
    setSelectedContact(contact);
    setIsEditDialogOpen(true);
  };

  // Handle contact update
  const handleContactUpdated = (updatedContact: UnifiedContact) => {
    setSelectedContact(null);
  };

  // Filter and sort companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = !searchTerm || company.name.toLowerCase().includes(searchTerm.toLowerCase()) || company.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'lastname-asc':
        return a.name.localeCompare(b.name);
      case 'lastname-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  }).slice(0, parseInt(showCount) || 24);
  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };
  // Monitor contacts for admin
  const monitorSubscriptions = isOwnerOrAdmin ? getMonitorSubscriptions() : [];

  const renderMonitorContacts = () =>
  <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">{language === 'nl' ? 'Monitor Contacten' : 'Monitor Contacts'}</h2>
        <p className="text-xs text-muted-foreground">{monitorSubscriptions.length} {language === 'nl' ? 'gemeenten' : 'municipalities'}</p>
      </div>
      <div className="space-y-2">
        {monitorSubscriptions.map((sub) =>
      <div key={sub.id} className="rounded-2xl border border-border p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{sub.municipalityName}</h3>
                  <Badge variant="outline" className="text-[10px]">{sub.plan}</Badge>
                  <Badge variant={sub.status === 'active' ? 'default' : 'outline'} className="text-[10px]">{sub.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{sub.contactName} · {sub.contactEmail}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{sub.province}</p>
                <p>{sub.contactPhone}</p>
              </div>
            </div>
          </div>
      )}
        {monitorSubscriptions.length === 0 &&
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p>{language === 'nl' ? 'Geen gemeentecontacten' : 'No municipality contacts'}</p>
          </div>
      }
      </div>
    </div>;


  return <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-6">
        {/* Admin product tabs */}
        {isOwnerOrAdmin &&
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

        {isOwnerOrAdmin && adminProductTab === 'monitor' ? renderMonitorContacts() : <>

        {/* Search & Filter Bar with Company/Person toggle */}
        <Card className="mb-4">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode('company')}
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === 'company' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}>
                  
                  {t('dashboard.contactsDashboard.company')}
                </button>
                <button
                  onClick={() => setViewMode('person')}
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-l",
                  viewMode === 'person' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}>
                  
                  {t('dashboard.contactsDashboard.person')}
                </button>
              </div>
              <div className="flex-1">
                <Input placeholder={t('dashboard.contactsDashboard.searchContacts')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                 <Label htmlFor="advanced-search" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                   {t('common.advanced')}
                </Label>
                <Switch id="advanced-search" checked={advancedSearch} onCheckedChange={setAdvancedSearch} />
              </div>
              <Button variant="outline" className="h-8 text-sm" onClick={() => {
                setSearchTerm("");
                setSelectedTypes([]);
              }}>
                {t('common.clear')}
              </Button>
              <Button variant="outline" className="h-8 text-sm" onClick={handleExport}>
                <Download className="h-3 w-3 mr-1" />
                 {t('common.export')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Full Width */}
        <div className="h-[calc(100vh-230px)]">
          <Card className="h-full flex flex-col min-h-0">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex items-center justify-between">
                
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44 h-8 text-xs bg-background">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                       <SelectItem value="lastname-asc">{t('dashboard.contactsDashboard.sortNameAZ')}</SelectItem>
                       <SelectItem value="lastname-desc">{t('dashboard.contactsDashboard.sortNameZA')}</SelectItem>
                       <SelectItem value="company-asc">{t('dashboard.contactsDashboard.sortCompanyAZ')}</SelectItem>
                       <SelectItem value="company-desc">{t('dashboard.contactsDashboard.sortCompanyZA')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Expand All / Collapse All Buttons */}
                  {viewMode === 'company' && <>
                      <Button variant="outline" size="sm" onClick={() => setExpandedCompanies(filteredCompanies.map((c) => c.id))} disabled={expandedCompanies.length === filteredCompanies.length} className="h-8 gap-1.5 text-xs">
                        <ArrowDown className="h-3 w-3" />
                        {t('common.showAll')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setExpandedCompanies([])} disabled={expandedCompanies.length === 0} className="h-8 gap-1.5 text-xs">
                        <ArrowUp className="h-3 w-3" />
                        ​
                      </Button>
                    </>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-auto min-h-0">
              {viewMode === 'person' ? (/* Person View */
                <div>
                  {/* Table Header */}
                   <div className="grid grid-cols-[minmax(180px,1.5fr)_minmax(160px,1.2fr)_minmax(200px,1.5fr)_minmax(140px,1fr)] gap-4 px-6 py-3 border-b border-border bg-background text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                     <div>{t('dashboard.contactsDashboard.name')}</div>
                     <div>{t('dashboard.contactsDashboard.company')}</div>
                     <div>{t('dashboard.contactsDashboard.email')}</div>
                     <div>{t('dashboard.contactsDashboard.phone')}</div>
                  </div>

                  {/* Person Rows - filter by company scope */}
                  {(() => {
                    const scopedCompanyNames = getCompanyScopedCompanies().map((c) => c.name);
                    const filteredPersons = isPilot ? [] : DEMO_PERSONS.filter((p) => scopedCompanyNames.includes(p.company));
                    return filteredPersons.length === 0 ? <div className="text-center py-16 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-40" />
                       <p className="text-base font-medium mb-2">{t('dashboard.contactsDashboard.noContactsFound')}</p>
                       <p className="text-xs">{t('dashboard.contactsDashboard.noPersonsAvailable')}</p>
                    </div> : filteredPersons.map((person, index) => <div key={person.id} className={cn("grid grid-cols-[minmax(180px,1.5fr)_minmax(160px,1.2fr)_minmax(200px,1.5fr)_minmax(140px,1fr)] gap-4 px-6 py-3 cursor-pointer transition-all duration-200 group rounded-lg", "hover:bg-muted/60 hover:backdrop-blur-md hover:shadow-lg hover:shadow-[hsl(var(--neon-lime))]/20 hover:scale-[1.02] hover:z-10 relative hover:ring-2 hover:ring-[hsl(var(--neon-lime))]/50 hover:ring-offset-1")} onDoubleClick={() => {
                      const contact: UnifiedContact = {
                        id: person.id,
                        name: person.name,
                        company: person.company,
                        email: person.email,
                        mobilePhone: '',
                        workPhone: person.telephone,
                        homePhone: '',
                        contactCategory: 'algemeen',
                        isCompany: false
                      };
                      setSelectedContact(contact);
                      setIsEditDialogOpen(true);
                    }}>
                      <div className="text-sm font-medium text-foreground group-hover:text-black transition-colors">{person.name}</div>
                      <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors">{person.company}</div>
                      <div className="text-muted-foreground text-xs truncate group-hover:text-foreground/80 transition-colors">{person.email}</div>
                      <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors">{person.telephone}</div>
                    </div>);
                  })()} </div>) : (/* Company View */
                companies.length === 0 ? <div className="text-center py-16 text-muted-foreground">
                     <p className="text-base font-medium mb-2">{t('dashboard.contactsDashboard.noContactsFound')}</p>
                     <p className="text-xs">{t('dashboard.contactsDashboard.noCompaniesAvailable')}</p>
                  </div> : <div className="py-2">
                    {/* Table Header */}
                     <div className="grid grid-cols-[minmax(220px,1.3fr)_minmax(200px,1fr)_130px_minmax(220px,1.2fr)] gap-6 px-6 py-3 bg-background border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                       <div>{t('dashboard.contactsDashboard.company')}</div>
                       <div>{t('dashboard.contactsDashboard.email')}</div>
                       <div>{t('dashboard.contactsDashboard.phone')}</div>
                       <div>{t('dashboard.contactsDashboard.address')}</div>
                    </div>

                    {/* Company Rows */}
                    {filteredCompanies.map((company, index) => <div key={company.id} className={cn("group/company", expandedCompanies.includes(company.id) && "bg-muted/20 rounded-xl my-1 shadow-sm")}>
                        {/* Main Company Row - Shell */}
                        <div className={cn("grid grid-cols-[minmax(220px,1.3fr)_minmax(200px,1fr)_130px_minmax(220px,1.2fr)] gap-6 px-6 py-3 my-0.5 cursor-pointer transition-all duration-200 rounded-lg group relative", expandedCompanies.includes(company.id) ? "bg-[hsl(var(--neon-lime))]/90 backdrop-blur-md shadow-lg shadow-[hsl(var(--neon-lime))]/20 ring-2 ring-[hsl(var(--neon-lime))]/50 rounded-b-none" : "hover:bg-muted/60")} onClick={() => toggleCompanyExpand(company.id)} onDoubleClick={() => handleContactDoubleClick(company)}>
                          <div className="flex items-center gap-3">
                            
                            <div className="flex items-center gap-2">
                              <span className={cn("text-sm font-medium transition-colors", expandedCompanies.includes(company.id) ? "text-black" : "text-foreground group-hover:text-foreground")}>{company.name}</span>
                            </div>
                          </div>
                          <div className={cn("text-xs truncate transition-colors", expandedCompanies.includes(company.id) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>{company.email || '—'}</div>
                          <div className={cn("text-xs transition-colors", expandedCompanies.includes(company.id) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>{company.telephone || '—'}</div>
                          <div className={cn("text-xs truncate transition-colors", expandedCompanies.includes(company.id) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>
                            {company.address ? `${company.address}, ${company.city}` : company.city || '—'}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedCompanies.includes(company.id) && (company.employees.length > 0 || company.addresses.length > 0) && <div className="bg-background/60 rounded-b-xl mx-1">
                            {/* CONTACTPERSONEN Section */}
                            {company.employees.length > 0 && <div className="px-6 py-4 ml-8 border-l-2 border-primary/30">
                                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider mb-3">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-primary dark:bg-transparent dark:text-primary">
                                    {t('dashboard.contactsDashboard.contactPersons')}
                                    <span className="px-1.5 py-0.5 bg-primary/15 rounded-full text-[9px] font-bold">{company.employees.length}</span>
                                  </span>
                                </div>
                                 <div className="grid grid-cols-[minmax(160px,1fr)_minmax(220px,1.2fr)_130px] gap-4 text-[10px] font-medium text-muted-foreground mb-2 pb-2 border-b border-border/40">
                                   <div>{t('dashboard.contactsDashboard.name')}</div>
                                   <div>{t('dashboard.contactsDashboard.email')}</div>
                                   <div>{t('dashboard.contactsDashboard.phone')}</div>
                                </div>
                                <div className="space-y-0.5">
                                  {company.employees.map((emp) => <div key={emp.id} className="grid grid-cols-[minmax(160px,1fr)_minmax(220px,1.2fr)_130px] gap-4 py-2 px-3 -mx-3 text-xs rounded-lg hover:bg-muted/50 cursor-pointer transition-all group/emp relative hover:z-10 hover:ring-1 hover:ring-[hsl(var(--neon-lime))]/40" onDoubleClick={() => handleEmployeeDoubleClick(emp, company)}>
                                      <div className="font-medium text-foreground group-hover/emp:text-foreground">{emp.name}</div>
                                      <div className="text-muted-foreground truncate group-hover/emp:text-foreground/70">{emp.email}</div>
                                      <div className="text-muted-foreground group-hover/emp:text-foreground/70">{emp.telephone}</div>
                                    </div>)}
                                </div>
                              </div>}

                            {/* VESTIGINGEN / ADRESSEN Section */}
                            {company.addresses.length > 0 && <div className={cn("px-6 py-4 ml-8 border-l-2 border-primary/30", company.employees.length > 0 && "border-t border-border/30")}>
                                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider mb-3">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-primary dark:bg-transparent dark:text-primary">
                                    {t('dashboard.contactsDashboard.branchesAddresses')}
                                    <span className="px-1.5 py-0.5 bg-primary/15 rounded-full text-[9px] font-bold">{company.addresses.length}</span>
                                  </span>
                                </div>
                                 <div className="grid grid-cols-[minmax(130px,1fr)_minmax(160px,1.2fr)_80px_90px_minmax(140px,1fr)] gap-4 text-[10px] font-medium text-muted-foreground mb-2 pb-2 border-b border-border/40">
                                   <div>{t('dashboard.contactsDashboard.name')}</div>
                                   <div>{t('dashboard.contactsDashboard.street')}</div>
                                   <div>{t('dashboard.contactsDashboard.nr')}</div>
                                   <div>{t('dashboard.contactsDashboard.postalCode')}</div>
                                   <div>{t('dashboard.contactsDashboard.municipality')}</div>
                                </div>
                                <div className="space-y-0.5">
                                  {company.addresses.map((addr) => <div key={addr.id} className="grid grid-cols-[minmax(130px,1fr)_minmax(160px,1.2fr)_80px_90px_minmax(140px,1fr)] gap-4 py-2 px-3 -mx-3 text-xs rounded-lg hover:bg-muted/50 cursor-pointer transition-all group/addr relative hover:z-10 hover:ring-1 hover:ring-[hsl(var(--neon-lime))]/40">
                                      <div className="font-medium text-foreground group-hover/addr:text-foreground">{addr.name}</div>
                                      <div className="text-muted-foreground group-hover/addr:text-foreground/70">{addr.street}</div>
                                      <div className="text-muted-foreground group-hover/addr:text-foreground/70">{addr.number}</div>
                                      <div className="text-muted-foreground group-hover/addr:text-foreground/70">{addr.postcode}</div>
                                      <div className="text-muted-foreground group-hover/addr:text-foreground/70">{addr.gemeente}</div>
                                    </div>)}
                                </div>
                              </div>}
                          </div>}
                      </div>)}
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
        </>}
      </div>

      {/* Contact Detail Modal */}
      <ContactDetailModal open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} contact={selectedContact} onContactUpdated={handleContactUpdated} />
    </div>;
};
export default ContactsDashboard;