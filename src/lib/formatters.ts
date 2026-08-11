import { format, parseISO } from 'date-fns';

/**
 * Format numbers as Indian Rupee (e.g. ₹1,00,000)
 */
export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Auto-format phone numbers as +91 XXXXX XXXXX
 */
export function formatPhoneIN(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  // If 10 digits, add 91
  let numStr = cleaned;
  if (cleaned.length === 10) {
    numStr = `91${cleaned}`;
  }
  
  if (numStr.length === 12 && numStr.startsWith('91')) {
    const part1 = numStr.slice(2, 7);
    const part2 = numStr.slice(7, 12);
    return `+91 ${part1} ${part2}`;
  }
  
  return phone.startsWith('+') ? phone : `+${phone}`;
}

/**
 * Extract clean numeric digits for WhatsApp link (e.g. 919876543210)
 */
export function getCleanPhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Format Date in Indian format (DD/MM/YYYY)
 */
export function formatDateIN(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const dateObj = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(dateObj, 'dd/MM/yyyy');
  } catch {
    return String(dateStr);
  }
}

/**
 * Format Date with Time (DD/MM/YYYY, hh:mm a)
 */
export function formatDateTimeIN(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const dateObj = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(dateObj, 'dd/MM/yyyy, hh:mm a');
  } catch {
    return String(dateStr);
  }
}
