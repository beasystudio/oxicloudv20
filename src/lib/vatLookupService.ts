/**
 * VAT Lookup Service
 * Calls the Belgian KBO API via secure edge function
 * 
 * For Pilot Mode: Uses realistic mock data for demonstration
 * For Production: Calls real CBEAPI via edge function
 */

import { supabase } from '@/integrations/supabase/client';

export interface KBOCompanyData {
  companyName: string;
  legalName: string;
  legalForm: string;
  vatNumber: string;
  kboNumber: string;
  peppolId: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
  status: string;
  startDate?: string;
  naceCode?: string;
  naceDescription?: string;
  director?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  email?: string;
  phone?: string;
}

export interface VATLookupResult {
  success: boolean;
  data?: KBOCompanyData;
  error?: string;
}

/**
 * Validate Belgian VAT number format and checksum
 */
export function validateBelgianVAT(vatNumber: string): { valid: boolean; normalized: string; error?: string } {
  // Clean the input
  let cleaned = vatNumber.replace(/[\s.]/g, '').toUpperCase();
  
  // Add BE prefix if missing
  if (!cleaned.startsWith('BE')) {
    cleaned = 'BE' + cleaned;
  }
  
  // Check format: BE + 10 digits (first digit is 0 or 1)
  const vatRegex = /^BE[01]\d{9}$/;
  if (!vatRegex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: 'Ongeldig BTW-nummer formaat. Gebruik BE0XXX.XXX.XXX (10 cijfers beginnend met 0 of 1)',
    };
  }
  
  // Validate Belgian VAT checksum (mod 97)
  const numberPart = cleaned.substring(2); // Remove 'BE'
  const base = parseInt(numberPart.substring(0, 8), 10);
  const check = parseInt(numberPart.substring(8, 10), 10);
  const expectedCheck = 97 - (base % 97);
  
  if (check !== expectedCheck) {
    return {
      valid: false,
      normalized: cleaned,
      error: 'Ongeldige BTW-controlesom. Controleer het nummer.',
    };
  }
  
  return {
    valid: true,
    normalized: cleaned,
  };
}

/**
 * Generate mock company data for demo/pilot mode
 * Uses VAT number to consistently map to realistic Belgian companies
 */
function generateMockCompanyData(vatNumber: string): KBOCompanyData {
  const vatClean = vatNumber.replace('BE', '');
  
  // 10 realistic Belgian architecture/engineering firms for demo
  const mockCompanies = [
    { 
      name: 'Architectenbureau Van Der Berg BV', form: 'BV', street: 'Lange Nieuwstraat', city: 'Antwerpen', postalCode: '2000',
      director: { firstName: 'Jan', lastName: 'Van Der Berg', role: 'Zaakvoerder' },
      email: 'info@vanderberg-arch.be', phone: '+32 3 225 14 78'
    },
    { 
      name: 'Studio Bouwmeester', form: 'BV', street: 'Korenmarkt', city: 'Gent', postalCode: '9000',
      director: { firstName: 'Sophie', lastName: 'Claes', role: 'Zaakvoerder' },
      email: 'info@studiobouwmeester.be', phone: '+32 9 233 56 12'
    },
    { 
      name: 'Atelier Moderne Architecten', form: 'NV', street: 'Bondgenotenlaan', city: 'Leuven', postalCode: '3000',
      director: { firstName: 'Thomas', lastName: 'Willems', role: 'Gedelegeerd Bestuurder' },
      email: 'contact@ateliermoderne.be', phone: '+32 16 30 22 90'
    },
    { 
      name: 'Design & Build Partners', form: 'BV', street: 'Meir', city: 'Antwerpen', postalCode: '2000',
      director: { firstName: 'Emma', lastName: 'Peeters', role: 'Zaakvoerder' },
      email: 'emma@designbuild.be', phone: '+32 3 201 44 55'
    },
    { 
      name: 'Vlaams Architectencollectief', form: 'CV', street: 'Grote Markt', city: 'Brugge', postalCode: '8000',
      director: { firstName: 'Pieter', lastName: 'Maes', role: 'Bestuurder' },
      email: 'secretariaat@vlaarchi.be', phone: '+32 50 34 18 63'
    },
    { 
      name: 'Architectengroep Limburg', form: 'BV', street: 'Kunstlaan', city: 'Hasselt', postalCode: '3500',
      director: { firstName: 'Lien', lastName: 'Hendricks', role: 'Zaakvoerder' },
      email: 'info@archgroep-limburg.be', phone: '+32 11 28 73 40'
    },
    { 
      name: 'Kust Architecten', form: 'BV', street: 'Zeedijk', city: 'Oostende', postalCode: '8400',
      director: { firstName: 'Marc', lastName: 'Dubois', role: 'Zaakvoerder' },
      email: 'marc@kustarchitecten.be', phone: '+32 59 70 22 15'
    },
    { 
      name: 'Bureau Duurzaam Bouwen', form: 'BV', street: 'Stationsstraat', city: 'Mechelen', postalCode: '2800',
      director: { firstName: 'Inge', lastName: 'Wouters', role: 'Zaakvoerder' },
      email: 'inge@duurzaambouwen.be', phone: '+32 15 41 88 30'
    },
    { 
      name: 'Architectuurstudio Schelde', form: 'NV', street: 'Scheldelaan', city: 'Antwerpen', postalCode: '2000',
      director: { firstName: 'Bart', lastName: 'Janssen', role: 'Gedelegeerd Bestuurder' },
      email: 'bart@studioschelde.be', phone: '+32 3 238 90 11'
    },
    { 
      name: 'Groep Ruimte & Ontwerp', form: 'BV', street: 'Diestsestraat', city: 'Leuven', postalCode: '3000',
      director: { firstName: 'An', lastName: 'De Bruyn', role: 'Zaakvoerder' },
      email: 'an@ruimteontwerp.be', phone: '+32 16 23 45 67'
    },
  ];
  
  // Pick randomly so repeated lookups don't always return the same company
  const index = Math.floor(Math.random() * mockCompanies.length);
  const mock = mockCompanies[index];
  const houseNum = Math.floor(Math.random() * 150) + 1;
  
  return {
    companyName: mock.name,
    legalName: mock.name,
    legalForm: mock.form,
    vatNumber: vatNumber,
    kboNumber: vatClean.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3'),
    peppolId: `0208:${vatClean}`,
    street: mock.street,
    number: String(houseNum),
    postalCode: mock.postalCode,
    city: mock.city,
    country: 'Belgium',
    status: 'Active',
    startDate: '2018-03-15',
    naceCode: '71111',
    naceDescription: 'Architectenactiviteiten',
    director: mock.director,
  };
}

/**
 * Lookup company data from Belgian KBO registry
 * 
 * @param vatNumber - Belgian VAT number (with or without BE prefix)
 * @param useMock - If true, returns mock data (for pilot/demo mode)
 */
export async function lookupVATNumber(vatNumber: string, useMock = false): Promise<VATLookupResult> {
  // Validate format (but skip checksum for mock mode to allow any correctly-formatted number)
  const validation = validateBelgianVAT(vatNumber);
  
  if (useMock) {
    // For mock/demo: accept ANY input — always return fake data
    let cleaned = vatNumber.replace(/[\s.]/g, '').toUpperCase();
    if (!cleaned.startsWith('BE')) cleaned = 'BE' + cleaned;
    // Pad or trim to 12 chars (BE + 10 digits) for consistent mock data generation
    const digits = cleaned.replace(/\D/g, '');
    const paddedDigits = (digits + '0000000000').slice(0, 10);
    const normalizedVat = 'BE' + paddedDigits;
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
    return {
      success: true,
      data: generateMockCompanyData(normalizedVat),
    };
  }
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }
  
  // Call real API via edge function
  try {
    const { data, error } = await supabase.functions.invoke('vat-lookup', {
      body: { vatNumber: validation.normalized },
    });
    
    if (error) {
      console.error('VAT lookup error:', error);
      return {
        success: false,
        error: 'Kan bedrijfsgegevens niet ophalen. Probeer opnieuw.',
      };
    }
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Bedrijf niet gevonden in de Belgische KBO databank',
      };
    }
    
    return {
      success: true,
      data: data.data,
    };
  } catch (err) {
    console.error('VAT lookup exception:', err);
    return {
      success: false,
      error: 'Kan bedrijfsgegevens niet ophalen. Probeer opnieuw.',
    };
  }
}

/**
 * Format VAT number for display (BE 0XXX.XXX.XXX)
 */
export function formatVATNumber(vatNumber: string): string {
  const cleaned = vatNumber.replace(/[\s.]/g, '').toUpperCase();
  const withoutBE = cleaned.replace(/^BE/, '');
  
  if (withoutBE.length !== 10) {
    return vatNumber; // Return as-is if not valid length
  }
  
  return `BE ${withoutBE.slice(0, 4)}.${withoutBE.slice(4, 7)}.${withoutBE.slice(7)}`;
}

/**
 * Parse a formatted VAT number to normalized format
 */
export function parseVATNumber(formatted: string): string {
  return formatted.replace(/[\s.]/g, '').toUpperCase();
}
