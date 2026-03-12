import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, fileName } = await req.json();

    if (!pdfText) {
      return new Response(
        JSON.stringify({ error: 'No PDF text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert at extracting structured data from NOx (nitrogen oxide) assessment reports for construction projects in Belgium/Flanders.

Extract the following information from the provided PDF text. If a field cannot be found, use reasonable defaults or "Not specified".

Return the data using the extract_report_data function.`;

    const userPrompt = `Extract project information from this NOx report:

File name: ${fileName}

Report content:
${pdfText.substring(0, 15000)}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_report_data',
              description: 'Extract structured project data from a NOx assessment report',
              parameters: {
                type: 'object',
                properties: {
                  projectName: {
                    type: 'string',
                    description: 'The name of the project or development'
                  },
                  projectCode: {
                    type: 'string',
                    description: 'The project code, reference number, or dossier number'
                  },
                  architect: {
                    type: 'string',
                    description: 'Name of the architect or design firm'
                  },
                  company: {
                    type: 'string',
                    description: 'The architecture firm or company submitting the report'
                  },
                  address: {
                    type: 'string',
                    description: 'The address of the construction site'
                  },
                  submissionDate: {
                    type: 'string',
                    description: 'The date the report was submitted or created (YYYY-MM-DD format)'
                  },
                  natura2000Site: {
                    type: 'string',
                    description: 'The name of the nearest Natura 2000 / SBZ (Special Protection Zone) site'
                  },
                  natura2000Code: {
                    type: 'string',
                    description: 'The official code of the Natura 2000 site (e.g., BE2400014)'
                  },
                  distanceToHabitat: {
                    type: 'number',
                    description: 'Distance in kilometers to the nearest protected habitat'
                  },
                  projectType: {
                    type: 'string',
                    description: 'Type of project (Residential, Commercial, Industrial, Mixed Use, etc.)'
                  },
                  constructionType: {
                    type: 'string',
                    description: 'Type of construction (New Construction, Renovation, Extension, Demolition, etc.)'
                  },
                  groundFloorArea: {
                    type: 'number',
                    description: 'Ground floor area in square meters'
                  },
                  numberOfFloors: {
                    type: 'number',
                    description: 'Number of floors in the building'
                  },
                  parkingSpaces: {
                    type: 'number',
                    description: 'Number of parking spaces'
                  },
                  constructionDuration: {
                    type: 'number',
                    description: 'Estimated construction duration in months'
                  },
                  noxEmission: {
                    type: 'number',
                    description: 'Calculated NOx emission value if available'
                  },
                  complianceStatus: {
                    type: 'string',
                    description: 'Whether the project passes NOx compliance (PASS, NOT PASS, PENDING)'
                  }
                },
                required: ['projectName', 'projectType', 'constructionType'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_report_data' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_report_data') {
      throw new Error('AI did not return expected structured data');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

    // Generate ID and ensure required fields have defaults
    const reportData = {
      id: `auth-${Date.now()}`,
      fileName,
      projectName: extractedData.projectName || fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
      projectCode: extractedData.projectCode || `2025-${String(Math.floor(Math.random() * 900) + 100)}`,
      architect: extractedData.architect || 'Not specified',
      company: extractedData.company || 'Not specified',
      address: extractedData.address || 'Address not found',
      submissionDate: extractedData.submissionDate || new Date().toISOString().split('T')[0],
      natura2000Site: extractedData.natura2000Site || 'Not specified',
      natura2000Code: extractedData.natura2000Code || 'Not specified',
      distanceToHabitat: extractedData.distanceToHabitat || 0,
      projectType: extractedData.projectType || 'Not specified',
      constructionType: extractedData.constructionType || 'New Construction',
      technicalParams: {
        groundFloorArea: extractedData.groundFloorArea || 0,
        numberOfFloors: extractedData.numberOfFloors || 0,
        parkingSpaces: extractedData.parkingSpaces || 0,
        constructionDuration: extractedData.constructionDuration || 0,
        noxEmission: extractedData.noxEmission || null,
        complianceStatus: extractedData.complianceStatus || 'PENDING'
      }
    };

    return new Response(
      JSON.stringify({ success: true, data: reportData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing NOx report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
