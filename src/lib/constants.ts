import { PipelineStage, LeadSource, LeadTemperature, ServiceInterest } from '@/types';

export const BUSINESS_INFO = {
  name: 'Dharmikshree',
  title: '13th Generation Vedic Astrologer & Vastu Consultant',
  website: 'dharmikshree.com',
  crmUrl: 'admin-dharmikshree.vercel.com',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'connect@dharmikshree.com',
  address: 'Mumbai / Ahmedabad, India',
};

export const PIPELINE_STAGES: { key: PipelineStage; label: string; step: number; color: string }[] = [
  { key: 'new_lead', label: 'New Lead', step: 1, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { key: 'form_filled', label: 'Form Filled', step: 2, color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { key: 'qualified_hot', label: 'Qualified Hot', step: 3, color: 'bg-red-100 text-red-800 border-red-300' },
  { key: 'qualified_warm', label: 'Qualified Warm', step: 4, color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { key: 'payment_received', label: 'Payment Received', step: 5, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { key: 'slot_confirmed', label: 'Slot Confirmed', step: 6, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { key: 'pre_consult_done', label: 'Pre-Consult Ready', step: 7, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { key: 'consultation_done', label: 'Consultation Done', step: 8, color: 'bg-violet-100 text-violet-800 border-violet-300' },
  { key: 'remedy_sent', label: 'Remedy Sent', step: 9, color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { key: 'puja_booked', label: 'Puja Booked', step: 10, color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { key: 'puja_completed', label: 'Puja Completed', step: 11, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { key: 'stone_delivered', label: 'Stone Delivered', step: 12, color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { key: 'won_testimonial', label: 'Won & Testimonial', step: 13, color: 'bg-green-100 text-green-800 border-green-300' },
  { key: 'lost_nurture', label: 'Lost / Nurture', step: 14, color: 'bg-gray-100 text-gray-800 border-gray-300' },
];

export const SERVICE_OPTIONS: { key: ServiceInterest; label: string; price: number }[] = [
  { key: 'divine_consultation', label: 'Divine Consultation', price: 9900 },
  { key: 'marriage_compatibility', label: 'Marriage Compatibility', price: 7200 },
  { key: 'vastu_alignment', label: 'Vastu & Space Alignment', price: 72000 },
  { key: 'baby_name_suggestion', label: 'Baby Name Suggestion', price: 9900 },
  { key: 'business_name_consultation', label: 'Business Name Consultation', price: 18000 },
  { key: 'corporate_family_mentorship', label: 'Corporate & Family Mentorship', price: 45000 },
  { key: 'baby_birth_date_selection', label: 'Baby Birth Date & Time Selection', price: 7200 },
  { key: 'garbh_sanskar', label: 'Garbh Sanskar Program', price: 7200 },
  { key: 'group_consultation', label: 'Group Consultation', price: 15000 },
  { key: 'spiritual_mentorship', label: 'Spiritual Mentorship', price: 25000 },
  { key: 'other', label: 'Other Special Request', price: 0 },
];

export const LEAD_SOURCES: { key: LeadSource; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'website', label: 'Website Enquiry' },
  { key: 'whatsapp', label: 'Direct WhatsApp' },
  { key: 'google_ads', label: 'Google Ads' },
  { key: 'meta_ads', label: 'Meta Ads' },
  { key: 'referral', label: 'Client Referral' },
  { key: 'call', label: 'Direct Phone Call' },
  { key: 'youtube', label: 'YouTube Channel' },
  { key: 'other', label: 'Other Source' },
];

export const LEAD_TEMPERATURES: { key: LeadTemperature; label: string; badgeClass: string; icon: string }[] = [
  { key: 'hot', label: 'Hot Lead', badgeClass: 'bg-red-500/10 text-red-600 border-red-200', icon: '🔴' },
  { key: 'warm', label: 'Warm Lead', badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: '🟡' },
  { key: 'cold', label: 'Cold Lead', badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: '🔵' },
];

export const GENDER_OPTIONS = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
];

export const RELATION_OPTIONS = [
  { key: 'self', label: 'Self (Myself)' },
  { key: 'spouse', label: 'Spouse (Husband/Wife)' },
  { key: 'child', label: 'Child (Son/Daughter)' },
  { key: 'father', label: 'Father' },
  { key: 'mother', label: 'Mother' },
  { key: 'business_partner', label: 'Business Partner' },
  { key: 'other', label: 'Other Relative' },
];

export const MARITAL_STATUS_OPTIONS = [
  { key: 'single', label: 'Single / Unmarried' },
  { key: 'married', label: 'Married' },
  { key: 'divorced', label: 'Divorced' },
  { key: 'widowed', label: 'Widowed' },
  { key: 'other', label: 'Other' },
];

export const RASHI_OPTIONS = [
  'Mesha (Aries)',
  'Vrishabha (Taurus)',
  'Mithuna (Gemini)',
  'Karka (Cancer)',
  'Simha (Leo)',
  'Kanya (Virgo)',
  'Tula (Libra)',
  'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)',
  'Makara (Capricorn)',
  'Kumbha (Aquarius)',
  'Meena (Pisces)',
];

export const DEFAULT_WHATSAPP_TEMPLATES = {
  pre_consult_15day: `नमस्ते {{name}} 🙏 Dharmikshree की तरफ से आपको याद दिलाना चाहते हैं कि आपकी {{service}} consultation {{date}} को scheduled है। किसी भी प्रश्न के लिए हमसे संपर्क करें। — Team Dharmikshree`,
  pre_consult_5day: `नमस्ते {{name}} 🙏 आपकी {{service}} consultation 5 दिन बाद — {{date}} को scheduled है। कृपया हमें confirm करें। Mode: {{mode}}. — Team Dharmikshree`,
  pre_consult_1day: `नमस्ते {{name}} 🙏 Reminder: आपकी consultation कल {{date}} को है। Online link/details team द्वारा जल्द share की जाएगी। — Team Dharmikshree`,
  payment_due: `नमस्ते {{name}} 🙏 आपकी service {{service}} के लिए ₹{{amount}} की pending payment है। Payment receipt & slot confirmation के लिए कृपया जल्द complete करें। — Team Dharmikshree`,
  protocol_sent: `नमस्ते {{name}} 🙏 Payment received! आपकी consultation details capture हो गई हैं। Team Dharmikshree जल्द आपसे slot finalization के लिए coordinate करेगी।`,
  puja_prep: `नमस्ते {{name}} 🙏 आपकी Mahapuja {{date}} को scheduled है। कृपया puja Vidhi & prep items note करें। — Team Dharmikshree`,
  stone_followup: `नमस्ते {{name}} 🙏 आपका Gemstone dispatch हो गया है (Tracking: {{tracking}})। Wearing Muhurat details साथ में attached हैं। — Team Dharmikshree`,
  testimonial: `नमस्ते {{name}} 🙏 Asha hai ki aapki consultation helpful rahi. Kripya apna anubhav share karein: {{link}} — Dharmikshree`,
};
