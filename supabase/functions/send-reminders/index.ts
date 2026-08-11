import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN') || '';
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID') || '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all pending reminders scheduled for today or earlier
    const now = new Date().toISOString();
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*, leads(full_name, phone, whatsapp, service_interest)')
      .eq('status', 'pending')
      .lte('scheduled_for', now);

    if (error) throw error;

    const results = [];

    for (const reminder of reminders || []) {
      const recipientPhone = reminder.leads?.whatsapp || reminder.leads?.phone;
      let sentSuccess = false;
      let logDetail = '';

      if (reminder.channel === 'whatsapp' && whatsappToken && whatsappPhoneId && recipientPhone) {
        // Send via Meta Cloud API
        const cleanPhone = recipientPhone.replace(/\D/g, '');
        const res = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`,
            type: 'text',
            text: { body: reminder.message_template || 'Namaste from Dharmikshree!' },
          }),
        });

        sentSuccess = res.ok;
        logDetail = await res.text();
      } else {
        // Manual call or fallback - mark processed
        sentSuccess = true;
        logDetail = 'Queued for manual action';
      }

      if (sentSuccess && reminder.channel !== 'manual_call') {
        await supabase
          .from('reminders')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', reminder.id);
      }

      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: reminder.lead_id,
        activity_type: reminder.channel === 'whatsapp' ? 'whatsapp_sent' : 'reminder_sent',
        content: `Reminder triggered (${reminder.reminder_type}): ${reminder.notes || 'Auto notification'}`,
        is_internal: true,
      });

      results.push({ id: reminder.id, status: sentSuccess ? 'processed' : 'failed', logDetail });
    }

    return new Response(JSON.stringify({ success: true, count: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
