import { getCleanPhoneForWhatsApp } from './formatters';

export interface WhatsAppSendMessageOptions {
  phone: string;
  message: string;
}

/**
 * Generate quick wa.me link for manual sending
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = getCleanPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Send WhatsApp via Meta Cloud API or return wa.me link fallback
 */
export async function sendWhatsAppMessage({ phone, message }: WhatsAppSendMessageOptions): Promise<{
  success: boolean;
  channel: 'api' | 'manual_link';
  link?: string;
  error?: string;
}> {
  const token = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_ID;
  const cleanPhone = getCleanPhoneForWhatsApp(phone);
  const waLink = generateWhatsAppLink(phone, message);

  // If no API keys configured, return wa.me fallback link
  if (!token || !phoneId) {
    return {
      success: true,
      channel: 'manual_link',
      link: waLink,
    };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return {
        success: false,
        channel: 'manual_link',
        link: waLink,
        error: errData.error?.message || 'Meta API request failed',
      };
    }

    return {
      success: true,
      channel: 'api',
    };
  } catch (err: any) {
    return {
      success: false,
      channel: 'manual_link',
      link: waLink,
      error: err.message || 'WhatsApp network error',
    };
  }
}
