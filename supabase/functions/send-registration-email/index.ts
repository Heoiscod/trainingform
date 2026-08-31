import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('EMAIL_FROM') ?? 'Pickle Social <noreply@yourdomain.com>';

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set.');
    }

    const emailTo = payload.email;
    const day = payload.preferred_day ?? 'Not selected';
    const timeSlot = payload.preferred_time_slot ?? 'Not selected';
    const packageType = payload.package_type ?? 'Not selected';
    const participant = payload.solo_name || payload.player_1_name || 'Guest';

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #d81b60;">Pickle Social Cebu - Reservation Confirmed</h2>
        <p>Hello <strong>${participant}</strong>,</p>
        <p>Your registration has been received successfully.</p>
        <p><strong>Schedule:</strong> ${day}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
        <p><strong>Package:</strong> ${packageType}</p>
        <p><strong>Payment Method:</strong> ${payload.payment_method ?? 'Not selected'}</p>
        <p>We look forward to seeing you at the session.</p>
        <p>Thank you,<br />Pickle Social Cebu</p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [emailTo],
        subject: 'Pickle Social Cebu - Reservation Confirmation',
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || 'Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      },
    );
  }
});
