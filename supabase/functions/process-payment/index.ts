import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  quote_id: string;
  payment_method?: string;
  simulate_payment?: boolean;
}

interface WebhookPayload {
  quote_id: string;
  transaction_id: string;
  amount: number;
  status: "PAID" | "FAILED";
}

interface SendQuoteRequest {
  quote_id: string;
  end_client_name: string;
  end_client_email: string;
  project_name: string;
  gdesign_employee_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body = await req.json();
    const path = new URL(req.url).pathname;
    
    console.log("Request path:", path, "Body:", JSON.stringify(body));
    
    // Route: Send quote to end client
    if (path.includes("/send-quote")) {
      return await handleSendQuote(supabase, body as SendQuoteRequest, resendApiKey);
    }
    
    // Route: Initiate payment (mock)
    if (path.includes("/initiate")) {
      return await handlePaymentInitiation(supabase, body as PaymentRequest);
    }
    
    // Route: Payment webhook (called when payment succeeds)
    if (path.includes("/webhook")) {
      return await handlePaymentWebhook(supabase, body as WebhookPayload, resendApiKey);
    }
    
    // Route: Simulate payment success (for demo)
    if (path.includes("/simulate-success")) {
      return await handleSimulateSuccess(supabase, body, resendApiKey);
    }

    // Route: Check payment status
    if (path.includes("/status")) {
      return await handleStatusCheck(supabase, body);
    }
    
    return new Response(
      JSON.stringify({ error: "Unknown endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Error in process-payment function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Send quote email to end client with full pricing
async function handleSendQuote(
  supabase: any, 
  body: SendQuoteRequest,
  resendApiKey?: string
): Promise<Response> {
  const { quote_id, end_client_name, end_client_email, project_name, gdesign_employee_email } = body;
  
  console.log("Sending quote to end client:", { quote_id, end_client_email });
  
  // Get quote details
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quote_id)
    .single();
  
  if (quoteError || !quote) {
    console.error("Quote not found:", quoteError);
    return new Response(
      JSON.stringify({ error: "Quote not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Generate payment link
  const paymentLink = `https://mock-payment.oxicloud.be/pay/${quote_id}`;
  
  // Update quote with status and payment link
  const { error: updateError } = await supabase
    .from("quotes")
    .update({ 
      status: "sent",
      nox_status: "awaiting_payment",
      payment_link: paymentLink,
      client_contact_name: end_client_name,
      client_contact_email: end_client_email
    })
    .eq("id", quote_id);
  
  if (updateError) {
    console.error("Failed to update quote:", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to update quote" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Log audit event
  await logAuditEvent(supabase, {
    event_type: "quote_sent",
    quote_id,
    company_id: quote.company_id,
    event_data: { 
      payment_link: paymentLink,
      end_client_email,
      end_client_name 
    }
  });
  
  // Send email to end client with full quote (they see total price)
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const validUntil = new Date(quote.valid_until).toLocaleDateString('nl-BE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      await resend.emails.send({
        from: "OxiCloud <noreply@oxicloud.be>",
        to: [end_client_email],
        subject: `Offerte ${quote.quote_number} - Stikstofberekening ${project_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
            <div style="background: #000; padding: 30px; text-align: center;">
              <h1 style="color: #CBFC08; margin: 0; font-size: 28px;">OxiCloud</h1>
              <p style="color: #888; margin: 10px 0 0;">Stikstofberekening Platform</p>
            </div>
            
            <div style="padding: 30px;">
              <p style="font-size: 16px;">Beste ${end_client_name},</p>
              
              <p>Hierbij ontvangt u de offerte voor de stikstofberekening van uw project <strong>${project_name}</strong>.</p>
              
              <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h2 style="margin: 0 0 20px; color: #333;">Offerte ${quote.quote_number}</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee;">Stikstofberekening</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">€${Number(quote.amount).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee;">BTW (21%)</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">€${Number(quote.vat_amount).toFixed(2)}</td>
                  </tr>
                  <tr style="font-size: 18px; font-weight: bold;">
                    <td style="padding: 15px 0;">Totaal</td>
                    <td style="padding: 15px 0; text-align: right; color: #000;">€${Number(quote.total_amount).toFixed(2)}</td>
                  </tr>
                </table>
                
                <p style="color: #666; font-size: 14px; margin: 15px 0 0;">
                  <strong>Geldig tot:</strong> ${validUntil}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${paymentLink}" style="display: inline-block; background: #CBFC08; color: #000; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Betaal Nu
                </a>
              </div>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px; color: #1976d2;">Betaalmethoden</h3>
                <p style="margin: 0; color: #333;">
                  ✓ Bancontact<br>
                  ✓ Kredietkaart (Visa, Mastercard)<br>
                  ✓ iDEAL
                </p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Na betaling wordt de stikstofberekening automatisch opgestart en ontvangt u het rapport via e-mail.
              </p>
            </div>
            
            <div style="background: #000; padding: 20px; text-align: center;">
              <p style="color: #888; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} OxiCloud - Stikstofberekening Platform
              </p>
            </div>
          </div>
        `,
      });
      
      console.log("Quote email sent to end client:", end_client_email);
      
    } catch (emailError) {
      console.error("Failed to send quote email:", emailError);
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      payment_link: paymentLink,
      quote_number: quote.quote_number,
      message: "Quote sent to end client"
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handlePaymentInitiation(supabase: any, body: PaymentRequest): Promise<Response> {
  const { quote_id } = body;
  
  // Get quote details
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quote_id)
    .single();
  
  if (quoteError || !quote) {
    console.error("Quote not found:", quoteError);
    return new Response(
      JSON.stringify({ error: "Quote not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Generate mock payment link
  const paymentLink = `https://mock-payment.oxicloud.be/pay/${quote_id}`;
  
  // Update quote with payment link and status
  const { error: updateError } = await supabase
    .from("quotes")
    .update({ 
      status: "sent",
      nox_status: "awaiting_payment",
      payment_link: paymentLink 
    })
    .eq("id", quote_id);
  
  if (updateError) {
    console.error("Failed to update quote:", updateError);
    return new Response(
      JSON.stringify({ error: "Failed to update quote" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Log audit event
  await logAuditEvent(supabase, {
    event_type: "quote_sent",
    quote_id,
    company_id: quote.company_id,
    event_data: { payment_link: paymentLink }
  });
  
  console.log("Payment initiated for quote:", quote_id);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      payment_link: paymentLink,
      quote_number: quote.quote_number
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleStatusCheck(supabase: any, body: { quote_id: string }): Promise<Response> {
  const { quote_id } = body;
  
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("id, status, nox_status, quote_number")
    .eq("id", quote_id)
    .single();
  
  if (error || !quote) {
    return new Response(
      JSON.stringify({ error: "Quote not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Check if there's a commission for this quote
  const { data: commission } = await supabase
    .from("commissions")
    .select("id, commission_amount, status")
    .eq("quote_id", quote_id)
    .single();
  
  return new Response(
    JSON.stringify({ 
      quote_id: quote.id,
      quote_number: quote.quote_number,
      status: quote.status,
      nox_status: quote.nox_status,
      commission: commission ? {
        id: commission.id,
        amount: commission.commission_amount,
        status: commission.status
      } : null
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleSimulateSuccess(supabase: any, body: any, resendApiKey?: string): Promise<Response> {
  const { quote_id } = body;
  
  // Get quote details
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quote_id)
    .single();
  
  if (quoteError || !quote) {
    return new Response(
      JSON.stringify({ error: "Quote not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  const webhookPayload: WebhookPayload = {
    quote_id,
    transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: Number(quote.total_amount),
    status: "PAID"
  };
  
  return await handlePaymentWebhook(supabase, webhookPayload, resendApiKey);
}

async function handlePaymentWebhook(
  supabase: any, 
  payload: WebhookPayload,
  resendApiKey?: string
): Promise<Response> {
  const { quote_id, transaction_id, amount, status } = payload;
  
  console.log("Processing payment webhook:", payload);
  
  if (status !== "PAID") {
    console.log("Payment not successful, status:", status);
    return new Response(
      JSON.stringify({ success: false, message: "Payment not successful" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Get quote with company info
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quote_id)
    .single();
  
  if (quoteError || !quote) {
    console.error("Quote not found:", quoteError);
    return new Response(
      JSON.stringify({ error: "Quote not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // 1. Update quote status to PAID and nox_status to paid
  const { error: quoteUpdateError } = await supabase
    .from("quotes")
    .update({ 
      status: "paid",
      nox_status: "paid"
    })
    .eq("id", quote_id);
  
  if (quoteUpdateError) {
    console.error("Failed to update quote:", quoteUpdateError);
  }
  
  // 2. Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      quote_id,
      transaction_id,
      amount,
      payment_method: "mock",
      payment_provider: "mock"
    })
    .select()
    .single();
  
  if (paymentError) {
    console.error("Failed to create payment:", paymentError);
    return new Response(
      JSON.stringify({ error: "Failed to record payment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Log payment received
  await logAuditEvent(supabase, {
    event_type: "payment_webhook_received",
    quote_id,
    payment_id: payment.id,
    company_id: quote.company_id,
    event_data: { transaction_id, amount }
  });
  
  await logAuditEvent(supabase, {
    event_type: "quote_paid",
    quote_id,
    payment_id: payment.id,
    company_id: quote.company_id,
    event_data: { transaction_id, amount }
  });
  
  // 3. Get commission percentage from platform settings
  const { data: commissionSetting } = await supabase
    .from("platform_settings")
    .select("setting_value")
    .eq("setting_key", "commission_percentage")
    .single();
  
  const commissionPercentage = commissionSetting?.setting_value?.value || 30;
  const commissionAmount = (amount * commissionPercentage) / 100;
  const invoiceReference = `COM-${quote.quote_number}-${Date.now().toString(36).toUpperCase()}`;
  
  // 4. Create commission record with claimable status
  const { data: commission, error: commissionError } = await supabase
    .from("commissions")
    .insert({
      payment_id: payment.id,
      company_id: quote.company_id,
      quote_id,
      commission_percentage: commissionPercentage,
      commission_amount: commissionAmount,
      status: "pending_invoice",
      invoice_reference: invoiceReference
    })
    .select()
    .single();
  
  if (commissionError) {
    console.error("Failed to create commission:", commissionError);
  }
  
  // Log calculation unlocked
  await logAuditEvent(supabase, {
    event_type: "calculation_unlocked",
    quote_id,
    payment_id: payment.id,
    company_id: quote.company_id,
    event_data: { project_id: quote.project_id }
  });
  
  // 5. Get company billing info for email
  const { data: billingInfo } = await supabase
    .from("company_billing_info")
    .select("*")
    .eq("company_id", quote.company_id)
    .single();
  
  // 6. Send TWO emails: payment confirmation + commission claim
  if (resendApiKey && billingInfo?.email) {
    try {
      const resend = new Resend(resendApiKey);
      
      // Email 1: Payment Received - Start Calculation
      await resend.emails.send({
        from: "OxiCloud <noreply@oxicloud.be>",
        to: [billingInfo.email],
        subject: `✅ Betaling ontvangen - ${quote.quote_number} - Start NOₓ Berekening`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000; padding: 30px; text-align: center;">
              <h1 style="color: #CBFC08; margin: 0;">OxiCloud</h1>
            </div>
            
            <div style="padding: 30px; background: #e8f5e9;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">✅</span>
                <h2 style="color: #2e7d32; margin: 10px 0;">Betaling Ontvangen</h2>
              </div>
              
              <p>De betaling voor offerte <strong>${quote.quote_number}</strong> is succesvol ontvangen.</p>
              
              <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Wat gebeurt er nu?</h3>
                <ul style="padding-left: 20px;">
                  <li>De NOₓ berekeningsmodule is <strong>ontgrendeld</strong></li>
                  <li>U kunt nu de gedetailleerde berekening starten</li>
                  <li>Het rapport wordt automatisch gegenereerd na voltooiing</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://oxicloud.be/dashboard/projects" style="display: inline-block; background: #CBFC08; color: #000; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: bold;">
                  Start NOₓ Berekening
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; background: #000; color: #888; text-align: center;">
              <p style="margin: 0; font-size: 12px;">© ${new Date().getFullYear()} OxiCloud</p>
            </div>
          </div>
        `,
      });
      
      // Email 2: Commission Claim Notification
      await resend.emails.send({
        from: "OxiCloud <noreply@oxicloud.be>",
        to: [billingInfo.email],
        subject: `💼 Commissie beschikbaar - €${commissionAmount.toFixed(2)} - ${quote.quote_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000; padding: 30px; text-align: center;">
              <h1 style="color: #CBFC08; margin: 0;">OxiCloud</h1>
              <p style="color: #888; margin: 10px 0 0;">Commissie Notificatie</p>
            </div>
            
            <div style="padding: 30px; background: #f5f5f5;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 48px;">💼</span>
                <h2 style="margin: 10px 0;">Uw Commissie is Beschikbaar</h2>
              </div>
              
              <div style="background: #fff; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="color: #666; margin: 0 0 10px;">Commissie bedrag</p>
                <p style="font-size: 36px; font-weight: bold; color: #2e7d32; margin: 0;">
                  €${commissionAmount.toFixed(2)}
                </p>
                <p style="color: #999; font-size: 14px; margin: 10px 0 0;">
                  ${commissionPercentage}% commissie op offerte ${quote.quote_number}
                </p>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px; color: #856404;">📋 Om uw commissie te ontvangen:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #333;">
                  <li style="margin-bottom: 10px;">Maak een factuur aan voor <strong>€${commissionAmount.toFixed(2)}</strong></li>
                  <li style="margin-bottom: 10px;">Vermeld referentie: <strong>${invoiceReference}</strong></li>
                  <li style="margin-bottom: 10px;">Stuur naar: <strong>invoices@oxicloud.be</strong></li>
                </ol>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #1976d2; font-size: 14px;">
                  <strong>💡 Tip:</strong> U kunt de commissie claimen onafhankelijk van de NOₓ berekening. 
                  De betaling wordt verwerkt binnen 14 werkdagen na ontvangst van uw factuur.
                </p>
              </div>
            </div>
            
            <div style="padding: 20px; background: #000; color: #888; text-align: center;">
              <p style="margin: 0; font-size: 12px;">
                Transactie ID: ${transaction_id}<br>
                © ${new Date().getFullYear()} OxiCloud
              </p>
            </div>
          </div>
        `,
      });
      
      console.log("Payment confirmation + commission emails sent:", billingInfo.email);
      
      // Update commission with email sent timestamp
      await supabase
        .from("commissions")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", commission.id);
      
      await logAuditEvent(supabase, {
        event_type: "commission_email_sent",
        quote_id,
        payment_id: payment.id,
        commission_id: commission.id,
        company_id: quote.company_id,
        event_data: { 
          recipient: billingInfo.email, 
          commission_amount: commissionAmount,
          invoice_reference: invoiceReference
        }
      });
      
    } catch (emailError) {
      console.error("Failed to send emails:", emailError);
    }
  } else {
    console.log("Email not sent - missing API key or billing email");
  }
  
  return new Response(
    JSON.stringify({ 
      success: true,
      payment_id: payment.id,
      commission_id: commission?.id,
      invoice_reference: invoiceReference,
      commission_amount: commissionAmount,
      calculation_unlocked: true,
      nox_status: "paid"
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function logAuditEvent(supabase: any, event: {
  event_type: string;
  quote_id?: string;
  payment_id?: string;
  commission_id?: string;
  user_id?: string;
  company_id?: string;
  event_data?: any;
}): Promise<void> {
  try {
    await supabase.from("payment_audit_log").insert(event);
    console.log("Audit event logged:", event.event_type);
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

serve(handler);