export type UserRole = 'super_admin' | 'admin' | 'team_member' | 'customer';

export type LeadSource = 
  | 'instagram' 
  | 'facebook' 
  | 'website' 
  | 'whatsapp' 
  | 'google_ads' 
  | 'meta_ads' 
  | 'referral' 
  | 'call' 
  | 'youtube' 
  | 'other';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

export type ServiceInterest = 
  | 'divine_consultation'
  | 'marriage_compatibility'
  | 'vastu_alignment'
  | 'baby_name_suggestion'
  | 'business_name_consultation'
  | 'corporate_family_mentorship'
  | 'baby_birth_date_selection'
  | 'garbh_sanskar'
  | 'group_consultation'
  | 'spiritual_mentorship'
  | 'other';

export type PipelineStage = 
  | 'new_lead'
  | 'form_filled'
  | 'qualified_hot'
  | 'qualified_warm'
  | 'payment_received'
  | 'slot_confirmed'
  | 'pre_consult_done'
  | 'consultation_done'
  | 'remedy_sent'
  | 'puja_booked'
  | 'puja_completed'
  | 'stone_delivered'
  | 'won_testimonial'
  | 'lost_nurture';

export type ConsultationMode = 'online' | 'offline';

export type PaymentStatus = 'unpaid' | 'token_paid' | 'full_paid';

export type PaymentType = 'token' | 'full' | 'partial' | 'refund';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';

export type ActivityType = 
  | 'note'
  | 'call_log'
  | 'stage_change'
  | 'payment_update'
  | 'reminder_sent'
  | 'whatsapp_sent'
  | 'email_sent'
  | 'file_uploaded'
  | 'checklist_update'
  | 'system';

export type ReminderType = 
  | 'pre_consult_15day'
  | 'pre_consult_5day'
  | 'pre_consult_1day'
  | 'payment_due'
  | 'follow_up'
  | 'puja_prep'
  | 'stone_followup'
  | 'testimonial'
  | 'custom';

export type ReminderChannel = 'whatsapp' | 'email' | 'sms' | 'manual_call';

export type ReminderStatus = 'pending' | 'sent' | 'done' | 'skipped' | 'failed';

export type RemedyStatus = 'not_sent' | 'sent' | 'accepted' | 'declined';
export type PujaStatus = 'not_booked' | 'booked' | 'in_progress' | 'completed';
export type StoneStatus = 'not_decided' | 'ordered' | 'dispatched' | 'delivered';
export type TestimonialStatus = 'not_collected' | 'collected' | 'published';

export type Gender = 'male' | 'female' | 'other';
export type CustomerRelation = 'self' | 'spouse' | 'child' | 'father' | 'mother' | 'business_partner' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'other';

export type Rashi = 
  | 'Mesha (Aries)'
  | 'Vrishabha (Taurus)'
  | 'Mithuna (Gemini)'
  | 'Karka (Cancer)'
  | 'Simha (Leo)'
  | 'Kanya (Virgo)'
  | 'Tula (Libra)'
  | 'Vrishchika (Scorpio)'
  | 'Dhanu (Sagittarius)'
  | 'Makara (Capricorn)'
  | 'Kumbha (Aquarius)'
  | 'Meena (Pisces)';

export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: ServiceInterest;
  description?: string;
  dakshina_amount: number;
  duration_minutes: number;
  mode: 'online' | 'offline' | 'both';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface StageChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

export interface StageChecklist {
  id: string;
  stage: PipelineStage;
  checklist_items: StageChecklistItem[];
  created_at: string;
}

export interface LeadChecklistProgressItem {
  id: string;
  text: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  // Kundali & Profiling Fields
  date_of_birth?: string;
  time_of_birth?: string;
  birth_place?: string;
  gender?: Gender;
  relation?: CustomerRelation;
  address?: string;
  pincode?: string;
  marital_status?: MaritalStatus;
  gotra?: string;
  rashi?: string;
  occupation?: string;
  kundali_notes?: string;
  // Lead Details
  lead_source: LeadSource;
  lead_temperature: LeadTemperature;
  service_interest: ServiceInterest;
  consultation_mode: ConsultationMode;
  stage: PipelineStage;
  assigned_to?: string;
  assigned_to_user?: UserProfile;
  date_of_consultation?: string;
  rescheduled: boolean;
  reschedule_count: number;
  payment_status: PaymentStatus;
  payment_mode?: PaymentMode;
  token_amount: number;
  full_amount: number;
  amount_paid: number;
  amount_due: number;
  protocol_message_sent: boolean;
  pre_consult_5day_done: boolean;
  pre_consult_3day_done: boolean;
  conclusion_notes?: string;
  remedy_status: RemedyStatus;
  puja_status: PujaStatus;
  stone_status: StoneStatus;
  stone_certificate_no?: string;
  courier_tracking_no?: string;
  testimonial_status: TestimonialStatus;
  internal_notes?: string;
  tags: string[];
  is_converted: boolean;
  converted_customer_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  deleted_at?: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  content: string;
  old_value?: string;
  new_value?: string;
  is_internal: boolean;
  created_by?: string;
  created_by_user?: UserProfile;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  lead_id?: string;
  customer_id?: string;
  lead_name?: string;
  service: string;
  payment_type: PaymentType;
  amount: number;
  payment_mode: PaymentMode;
  payment_date: string;
  reference_no?: string;
  receipt_url?: string;
  notes?: string;
  recorded_by?: string;
  recorded_by_user?: UserProfile;
  created_at: string;
}

export interface Reminder {
  id: string;
  lead_id: string;
  lead_name?: string;
  lead_phone?: string;
  service_name?: string;
  date_of_consultation?: string;
  consultation_mode?: string;
  amount_due?: number;
  reminder_type: ReminderType;
  scheduled_for: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  message_template?: string;
  assigned_to?: string;
  assigned_to_user?: UserProfile;
  notes?: string;
  sent_at?: string;
  created_at: string;
}

export interface CustomerRecord {
  id: string;
  lead_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  // Kundali & Profiling Fields
  date_of_birth?: string;
  time_of_birth?: string;
  birth_place?: string;
  gender?: Gender;
  relation?: CustomerRelation;
  address?: string;
  pincode?: string;
  marital_status?: MaritalStatus;
  gotra?: string;
  rashi?: string;
  occupation?: string;
  kundali_notes?: string;
  // Business fields
  customer_since: string;
  total_spent: number;
  total_sessions: number;
  notes?: string;
  tags: string[];
}

export interface ConsultationTimelineItem {
  id: string;
  customer_id: string;
  lead_id?: string;
  service: string;
  consultation_date?: string;
  mode?: string;
  summary?: string;
  remedy_shared?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface TeamActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// --- PUJA & SPIRITUAL EVENT MODULE TYPES ---
export type PujaEventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type PujaPackageType = 'single' | 'couple' | 'family' | 'group';
export type PujaEnrollmentPaymentStatus = 'pending' | 'paid' | 'verified' | 'cancelled';

export interface PujaBenefitItem {
  title: string;
  description: string;
  icon?: string;
}

export interface PujaProcessStepItem {
  step: number;
  title: string;
  description: string;
}

export interface PujaFAQItem {
  question: string;
  answer: string;
}

export interface PujaPackageRecord {
  id: string;
  puja_id: string;
  name: string;
  package_type: PujaPackageType;
  max_persons: number;
  price: number;
  original_price?: number;
  badge_text?: string;
  description?: string;
  inclusions: string[];
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface PujaRecord {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  short_description?: string;
  description?: string;
  banner_image_url: string;
  gallery_images: string[];
  event_date: string;
  enrollment_end_date: string;
  location_name: string;
  tithi_details?: string;
  starting_price: number;
  puja_status: PujaEventStatus;
  is_featured: boolean;
  is_active: boolean;
  meeting_link?: string;
  benefits?: PujaBenefitItem[];
  process_steps?: PujaProcessStepItem[];
  faqs?: PujaFAQItem[];
  display_order: number;
  created_at?: string;
  updated_at?: string;
  packages?: PujaPackageRecord[];
  enrollments_count?: number;
  revenue_collected?: number;
}

export interface PujaEnrollmentRecord {
  id: string;
  booking_number: string;
  puja_id: string;
  package_id?: string;
  package_name: string;
  package_type: PujaPackageType;
  package_price: number;
  devotee_name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  gotra: string;
  family_members?: Array<{ name: string; relation?: string }>;
  sankalp_wish?: string;
  prasad_address?: {
    house_street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  payment_status: PujaEnrollmentPaymentStatus;
  payment_amount_collected: number;
  payment_mode?: string;
  payment_notes?: string;
  meeting_link_sent: boolean;
  meeting_link_sent_at?: string;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
  puja?: {
    title: string;
    event_date: string;
    meeting_link?: string;
    location_name?: string;
  };
}
