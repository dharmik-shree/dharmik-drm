-- Seed Services
INSERT INTO public.services (name, slug, description, dakshina_amount, duration_minutes, mode, display_order)
VALUES
  ('Divine Consultation', 'divine_consultation', 'Complete horoscope and life guidance by Dharmikshree', 9900.00, 45, 'both', 1),
  ('Marriage Compatibility', 'marriage_compatibility', 'Detailed Ashtakoota & Guna Milan with Kundali matching', 7200.00, 45, 'both', 2),
  ('Vastu & Space Alignment', 'vastu_alignment', 'Comprehensive home or commercial Vastu assessment & energy correction', 72000.00, 90, 'both', 3),
  ('Baby Name Suggestion', 'baby_name_suggestion', 'Auspicious name selection based on Janma Nakshatra and Sound Vibrations', 9900.00, 30, 'online', 4),
  ('Business Name Consultation', 'business_name_consultation', 'Brand name alignment with owner''s chart and numerological balance', 18000.00, 45, 'both', 5),
  ('Corporate & Family Mentorship', 'corporate_family_mentorship', 'Ongoing monthly spiritual & strategic mentorship for high-net-worth families', 45000.00, 60, 'both', 6),
  ('Baby Birth Date & Time Selection', 'baby_birth_date_selection', 'Selecting auspicious Muhurat windows for planned delivery', 7200.00, 30, 'online', 7),
  ('Garbh Sanskar Program', 'garbh_sanskar', 'Spiritual prenatal guidance & monthly planetary alignment for expecting mothers', 7200.00, 45, 'online', 8)
ON CONFLICT (slug) DO UPDATE 
SET dakshina_amount = EXCLUDED.dakshina_amount, description = EXCLUDED.description;

-- Seed Stage Checklists
INSERT INTO public.stage_checklists (stage, checklist_items)
VALUES
  ('new_lead', '[
    {"id": "nl_1", "text": "Acknowledge enquiry within 1 hour", "required": true},
    {"id": "nl_2", "text": "Verify WhatsApp number (+91)", "required": true},
    {"id": "nl_3", "text": "Assign lead to team member", "required": false}
  ]'::jsonb),
  ('form_filled', '[
    {"id": "ff_1", "text": "Review birth details & city", "required": true},
    {"id": "ff_2", "text": "Confirm preferred consultation mode (Online/Offline)", "required": true}
  ]'::jsonb),
  ('qualified_hot', '[
    {"id": "qh_1", "text": "Send Dakshina payment details link", "required": true},
    {"id": "qh_2", "text": "Explain consultation protocol & expectations", "required": true}
  ]'::jsonb),
  ('qualified_warm', '[
    {"id": "qw_1", "text": "Send follow-up WhatsApp message", "required": true},
    {"id": "qw_2", "text": "Share testimonial / video link", "required": false}
  ]'::jsonb),
  ('payment_received', '[
    {"id": "pr_1", "text": "Record payment entry with reference number", "required": true},
    {"id": "pr_2", "text": "Issue official PDF receipt to client", "required": true},
    {"id": "pr_3", "text": "Send Protocol Message on WhatsApp", "required": true}
  ]'::jsonb),
  ('slot_confirmed', '[
    {"id": "sc_1", "text": "Lock consultation date & time in calendar", "required": true},
    {"id": "sc_2", "text": "Trigger 15-day, 5-day, 3-day & 1-day reminders", "required": true}
  ]'::jsonb),
  ('pre_consult_done', '[
    {"id": "pc_1", "text": "Verify birth chart data preparation complete", "required": true},
    {"id": "pc_2", "text": "Send Zoom/Google Meet link or address for offline", "required": true}
  ]'::jsonb),
  ('consultation_done', '[
    {"id": "cd_1", "text": "Log session summary in internal notes", "required": true},
    {"id": "cd_2", "text": "Draft suggested Remedies / Pujas / Gemstones", "required": true}
  ]'::jsonb),
  ('remedy_sent', '[
    {"id": "rs_1", "text": "Send Remedy PDF via WhatsApp to client", "required": true},
    {"id": "rs_2", "text": "Confirm client received and understood remedies", "required": true}
  ]'::jsonb),
  ('puja_booked', '[
    {"id": "pb_1", "text": "Schedule Puja date with pandits", "required": true},
    {"id": "pb_2", "text": "Send Puja prep instructions to client", "required": true}
  ]'::jsonb),
  ('puja_completed', '[
    {"id": "pcom_1", "text": "Share Mahapuja video/photos with client", "required": true},
    {"id": "pcom_2", "text": "Schedule 7-day follow-up sequence", "required": true}
  ]'::jsonb),
  ('stone_delivered', '[
    {"id": "sd_1", "text": "Verify courier tracking status", "required": true},
    {"id": "sd_2", "text": "Share Gemstone wearing Muhurat & ritual notes", "required": true}
  ]'::jsonb),
  ('won_testimonial', '[
    {"id": "wt_1", "text": "Collect feedback / testimonial review", "required": true},
    {"id": "wt_2", "text": "Invite client to Customer Portal", "required": true}
  ]'::jsonb),
  ('lost_nurture', '[
    {"id": "ln_1", "text": "Log reason for lost opportunity", "required": true},
    {"id": "ln_2", "text": "Add to quarterly broadcast nurture tag", "required": false}
  ]'::jsonb)
ON CONFLICT (stage) DO UPDATE 
SET checklist_items = EXCLUDED.checklist_items;
