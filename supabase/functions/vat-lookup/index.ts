/**
 * VAT Lookup Edge Function
 * Fetches Belgian company data from CBEAPI
 * 
 * CBEAPI uses simple header authentication with X-API-ID and X-API-KEY
 * Falls back to mock data if API is unreachable
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CompanyData {
  success: boolean;
  data?: {
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
  };
  error?: string;
  source?: string;
}

/**
 * Generate realistic mock data
 */
function generateMockCompanyData(enterpriseNumber: string): CompanyData {
  const hash = enterpriseNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Special case mapping for known VAT numbers
  const knownCompanies: Record<string, CompanyData['data']> = {
    '0885703733': {
      companyName: 'GDesign Architecten',
      legalName: 'GDesign Architecten BV',
      legalForm: 'BV',
      vatNumber: 'BE0885703733',
      kboNumber: '0885.703.733',
      peppolId: '0208:0885703733',
      street: 'Leuvensesteenweg',
      number: '276',
      postalCode: '3200',
      city: 'Aarschot',
      country: 'Belgium',
      status: 'Active',
      startDate: '2006-12-15',
      naceCode: '71111',
      naceDescription: 'Architectenactiviteiten',
      director: {
        firstName: 'Paul',
        lastName: 'Gijsemans',
        role: 'Bestuurder',
      },
    },
    '0428759497': {
      companyName: 'COLRUYT GROUP',
      legalName: 'COLRUYT GROUP NV',
      legalForm: 'NV',
      vatNumber: 'BE0428759497',
      kboNumber: '0428.759.497',
      peppolId: '0208:0428759497',
      street: 'Edingensesteenweg',
      number: '196',
      postalCode: '1500',
      city: 'Halle',
      country: 'Belgium',
      status: 'Active',
      startDate: '1972-01-01',
      naceCode: '47111',
      naceDescription: 'Retail sale in non-specialised stores',
    },
  };

  if (knownCompanies[enterpriseNumber]) {
    return {
      success: true,
      source: 'mock',
      data: knownCompanies[enterpriseNumber],
    };
  }

  const mockCompanies = [
    { name: 'Architectenbureau Janssen', form: 'BV', street: 'Grote Markt', city: 'Antwerpen', postalCode: '2000', nace: '71111', naceDesc: 'Architectenactiviteiten' },
    { name: 'Studio Moderne', form: 'NV', street: 'Korenmarkt', city: 'Gent', postalCode: '9000', nace: '71111', naceDesc: 'Architectenactiviteiten' },
    { name: 'Bouwkundig Atelier', form: 'BV', street: 'Bondgenotenlaan', city: 'Leuven', postalCode: '3000', nace: '71111', naceDesc: 'Architectenactiviteiten' },
    { name: 'Architectengroep Vlaanderen', form: 'CV', street: 'Markt', city: 'Brugge', postalCode: '8000', nace: '71111', naceDesc: 'Architectenactiviteiten' },
    { name: 'Kust Architecten', form: 'BV', street: 'Zeedijk', city: 'Oostende', postalCode: '8400', nace: '71111', naceDesc: 'Architectenactiviteiten' },
  ];
  
  const mock = mockCompanies[hash % mockCompanies.length];
  const houseNum = (parseInt(enterpriseNumber.slice(4, 6), 10) % 150) + 1;
  
  return {
    success: true,
    source: 'mock',
    data: {
      companyName: mock.name,
      legalName: `${mock.name} ${mock.form}`,
      legalForm: mock.form,
      vatNumber: `BE${enterpriseNumber}`,
      kboNumber: enterpriseNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3'),
      peppolId: `0208:${enterpriseNumber}`,
      street: mock.street,
      number: String(houseNum),
      postalCode: mock.postalCode,
      city: mock.city,
      country: 'Belgium',
      status: 'Active',
      startDate: '2018-03-15',
      naceCode: mock.nace,
      naceDescription: mock.naceDesc,
    },
  };
}

/**
 * Query CBEAPI with header authentication
 */
async function queryCompanyFromCBEAPI(
  enterpriseNumber: string,
  appId: string,
  apiKey: string
): Promise<CompanyData | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
  
  try {
    // CBEAPI endpoint format
    const apiUrl = `https://api.cbeapi.be/v1/enterprises/${enterpriseNumber}`;
    console.log('Querying CBEAPI:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-ID': appId,
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 404) {
      return { success: false, error: `No company found for VAT BE${enterpriseNumber}` };
    }
    
    if (response.status === 401 || response.status === 403) {
      console.error('CBEAPI auth failed:', response.status);
      return null; // Will fallback to mock
    }

    if (!response.ok) {
      console.error('CBEAPI error:', response.status);
      return null;
    }

    const apiData = await response.json();
    console.log('CBEAPI response:', JSON.stringify(apiData).substring(0, 200));
    
    // Parse CBEAPI response format
    const companyName = apiData.name || apiData.companyName || apiData.denomination || '';
    
    if (!companyName) {
      console.log('No company name in response, returning null');
      return null;
    }

    // Handle address - could be object or nested
    const address = apiData.address || apiData.addresses?.[0] || {};
    
    return {
      success: true,
      source: 'cbeapi',
      data: {
        companyName,
        legalName: apiData.legalName || companyName,
        legalForm: apiData.legalForm || apiData.juridicalForm || '',
        vatNumber: `BE${enterpriseNumber}`,
        kboNumber: enterpriseNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3'),
        peppolId: `0208:${enterpriseNumber}`,
        street: address.street || '',
        number: address.number || address.houseNumber || '',
        postalCode: address.postalCode || address.zipCode || '',
        city: address.city || address.municipality || '',
        country: address.country || 'Belgium',
        status: apiData.status || 'Active',
        startDate: apiData.startDate || '',
        naceCode: apiData.naceCode || '',
        naceDescription: apiData.naceDescription || '',
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('CBEAPI query failed:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vatNumber, useMock } = await req.json();

    if (!vatNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'VAT number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize: remove BE prefix, spaces, dots
    let normalizedVat = vatNumber.replace(/[\s.]/g, '').toUpperCase();
    if (normalizedVat.startsWith('BE')) {
      normalizedVat = normalizedVat.substring(2);
    }

    // Validate format (10 digits, starts with 0 or 1)
    const vatRegex = /^[01]\d{9}$/;
    if (!vatRegex.test(normalizedVat)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Belgian VAT format. Use BE0XXX.XXX.XXX (10 digits starting with 0 or 1)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If mock mode requested, return mock immediately
    if (useMock === true) {
      console.log('Mock mode for:', normalizedVat);
      const mockResult = generateMockCompanyData(normalizedVat);
      return new Response(
        JSON.stringify(mockResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appId = Deno.env.get('CBEAPI_APP_ID');
    const apiKey = Deno.env.get('CBEAPI_SECRET');
    
    if (!appId || !apiKey) {
      console.log('No CBEAPI credentials, using mock');
      const mockResult = generateMockCompanyData(normalizedVat);
      return new Response(
        JSON.stringify(mockResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up:', normalizedVat);

    // Try CBEAPI
    const result = await queryCompanyFromCBEAPI(normalizedVat, appId, apiKey);
    
    if (result) {
      if (result.success) {
        console.log('CBEAPI success:', normalizedVat);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // API returned but company not found
      return new Response(
        JSON.stringify(result),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback to mock
    console.log('Falling back to mock for:', normalizedVat);
    const mockResult = generateMockCompanyData(normalizedVat);
    return new Response(
      JSON.stringify(mockResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('VAT lookup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unable to retrieve company data. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
