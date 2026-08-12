import { Reminder, Lead, PipelineStage } from '@/types';
import { DEFAULT_WHATSAPP_TEMPLATES } from './constants';
import { formatDateIN } from './formatters';

/**
 * Generate 3 pre-consultation reminders (15 days, 5 days, 1 day) when a consultation date is set/updated
 */
export function generatePreConsultReminders(lead: Partial<Lead>, consultationDateStr: string): Partial<Reminder>[] {
  const consultDate = new Date(consultationDateStr);
  const clientName = lead.full_name || 'Client';
  const serviceName = lead.service_interest || 'Divine Consultation';
  const modeStr = lead.consultation_mode === 'offline' ? 'Offline (In-Person)' : 'Online (Zoom/Meet)';
  const formattedDate = formatDateIN(consultationDateStr);

  const calculateDate = (daysBefore: number) => {
    const d = new Date(consultDate.getTime());
    d.setDate(d.getDate() - daysBefore);
    // Set default reminder time to 9:00 AM IST
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      lead_id: lead.id,
      reminder_type: 'pre_consult_15day',
      scheduled_for: calculateDate(15),
      channel: 'whatsapp',
      status: 'pending',
      message_template: DEFAULT_WHATSAPP_TEMPLATES.pre_consult_15day
        .replace('{{name}}', clientName)
        .replace('{{service}}', serviceName)
        .replace('{{date}}', formattedDate),
      notes: `15-day pre-consult reminder for ${clientName}`,
      assigned_to: lead.assigned_to,
    },
    {
      lead_id: lead.id,
      reminder_type: 'pre_consult_5day',
      scheduled_for: calculateDate(5),
      channel: 'whatsapp',
      status: 'pending',
      message_template: DEFAULT_WHATSAPP_TEMPLATES.pre_consult_5day
        .replace('{{name}}', clientName)
        .replace('{{service}}', serviceName)
        .replace('{{date}}', formattedDate)
        .replace('{{mode}}', modeStr),
      notes: `5-day pre-consult reminder for ${clientName}`,
      assigned_to: lead.assigned_to,
    },
    {
      lead_id: lead.id,
      reminder_type: 'pre_consult_1day',
      scheduled_for: calculateDate(1),
      channel: 'whatsapp',
      status: 'pending',
      message_template: DEFAULT_WHATSAPP_TEMPLATES.pre_consult_1day
        .replace('{{name}}', clientName)
        .replace('{{date}}', formattedDate),
      notes: `1-day pre-consult final confirmation for ${clientName}`,
      assigned_to: lead.assigned_to,
    },
  ];
}

/**
 * Generate stage-triggered reminders
 */
export function generateStageTriggeredReminders(lead: Partial<Lead>, newStage: PipelineStage): Partial<Reminder>[] {
  const reminders: Partial<Reminder>[] = [];
  const now = new Date();
  const clientName = lead.full_name || 'Client';

  const addDays = (days: number) => {
    const d = new Date(now.getTime());
    d.setDate(d.getDate() + days);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  switch (newStage) {
    case 'payment_received':
      reminders.push({
        lead_id: lead.id,
        reminder_type: 'custom',
        scheduled_for: now.toISOString(),
        channel: 'whatsapp',
        status: 'pending',
        message_template: DEFAULT_WHATSAPP_TEMPLATES.protocol_sent.replace('{{name}}', clientName),
        notes: `Send Protocol Message to ${clientName}`,
        assigned_to: lead.assigned_to,
      });
      break;

    case 'consultation_done':
      reminders.push({
        lead_id: lead.id,
        reminder_type: 'follow_up',
        scheduled_for: addDays(1),
        channel: 'whatsapp',
        status: 'pending',
        message_template: `नमस्ते ${clientName} 🙏 Consultation notes & suggested remedy details have been logged. Team Dharmikshree will share the final PDF shortly.`,
        notes: `Send Remedy/Puja Suggestion to ${clientName}`,
        assigned_to: lead.assigned_to,
      });
      break;

    case 'puja_completed':
      reminders.push({
        lead_id: lead.id,
        reminder_type: 'puja_prep',
        scheduled_for: addDays(3),
        channel: 'whatsapp',
        status: 'pending',
        message_template: `नमस्ते ${clientName} 🙏 Mahapuja follow-up check. Hope you are experiencing peace and harmony.`,
        notes: `Puja post-completion follow-up with ${clientName}`,
        assigned_to: lead.assigned_to,
      });
      break;

    case 'stone_delivered':
      reminders.push({
        lead_id: lead.id,
        reminder_type: 'stone_followup',
        scheduled_for: addDays(7),
        channel: 'manual_call',
        status: 'pending',
        message_template: `Check gemstone wearing experience with ${clientName}`,
        notes: `Gemstone 7-day delivery check call with ${clientName}`,
        assigned_to: lead.assigned_to,
      });
      break;

    case 'won_testimonial':
      reminders.push({
        lead_id: lead.id,
        reminder_type: 'testimonial',
        scheduled_for: addDays(2),
        channel: 'whatsapp',
        status: 'pending',
        message_template: DEFAULT_WHATSAPP_TEMPLATES.testimonial.replace('{{name}}', clientName).replace('{{link}}', `https://dharmikshree.com/reviews`),
        notes: `Collect testimonial & Google review from ${clientName}`,
        assigned_to: lead.assigned_to,
      });
      break;

    default:
      break;
  }

  return reminders;
}
