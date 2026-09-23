-- ============================================================================
-- MIGRATION: 20260923000000_create_puja_module.sql
-- Description: Create Service / Puja Module tables, relations, RLS, and seed data.
-- ============================================================================

-- 1. PUJAS TABLE
CREATE TABLE IF NOT EXISTS public.pujas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  short_description TEXT,
  description TEXT,
  banner_image_url TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  event_date TIMESTAMPTZ NOT NULL,
  enrollment_end_date TIMESTAMPTZ NOT NULL,
  location_name TEXT NOT NULL,
  tithi_details TEXT,
  starting_price NUMERIC(10,2) NOT NULL DEFAULT 851.00,
  puja_status TEXT CHECK (puja_status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  is_featured BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  meeting_link TEXT,
  benefits JSONB DEFAULT '[]'::jsonb,
  process_steps JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying active & featured pujas
CREATE INDEX IF NOT EXISTS idx_pujas_active_featured ON public.pujas (is_active, is_featured, event_date);
CREATE INDEX IF NOT EXISTS idx_pujas_slug ON public.pujas (slug);

-- 2. PUJA PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.puja_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puja_id UUID NOT NULL REFERENCES public.pujas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  package_type TEXT CHECK (package_type IN ('single', 'couple', 'family', 'group')) DEFAULT 'single',
  max_persons INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  badge_text TEXT,
  description TEXT,
  inclusions JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puja_packages_puja_id ON public.puja_packages (puja_id, display_order);

-- 3. PUJA ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS public.puja_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  puja_id UUID NOT NULL REFERENCES public.pujas(id) ON DELETE RESTRICT,
  package_id UUID REFERENCES public.puja_packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL DEFAULT 'single',
  package_price NUMERIC(10,2) NOT NULL,
  devotee_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  gotra TEXT DEFAULT 'Kashyap',
  family_members JSONB DEFAULT '[]'::jsonb,
  sankalp_wish TEXT,
  prasad_address JSONB DEFAULT '{}'::jsonb,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'verified', 'cancelled')) DEFAULT 'pending',
  payment_amount_collected NUMERIC(10,2) DEFAULT 0,
  payment_mode TEXT DEFAULT 'pending',
  payment_notes TEXT,
  meeting_link_sent BOOLEAN DEFAULT false,
  meeting_link_sent_at TIMESTAMPTZ,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puja_enrollments_puja ON public.puja_enrollments (puja_id);
CREATE INDEX IF NOT EXISTS idx_puja_enrollments_status ON public.puja_enrollments (payment_status);
CREATE INDEX IF NOT EXISTS idx_puja_enrollments_phone ON public.puja_enrollments (phone, whatsapp);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.pujas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puja_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puja_enrollments ENABLE ROW LEVEL SECURITY;

-- Pujas: Public can read active pujas
CREATE POLICY "Allow public read active pujas"
  ON public.pujas FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow service role all on pujas"
  ON public.pujas FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Packages: Public can read active packages
CREATE POLICY "Allow public read active packages"
  ON public.puja_packages FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow service role all on packages"
  ON public.puja_packages FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Enrollments: Public can insert new enrollments
CREATE POLICY "Allow public insert enrollments"
  ON public.puja_enrollments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow service role all on enrollments"
  ON public.puja_enrollments FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 5. INITIAL SEED DATA
-- Sarva Pitru Shanti Mahapuja at Gaya Ji
INSERT INTO public.pujas (
  id,
  title,
  slug,
  subtitle,
  short_description,
  description,
  banner_image_url,
  gallery_images,
  event_date,
  enrollment_end_date,
  location_name,
  tithi_details,
  starting_price,
  puja_status,
  is_featured,
  is_active,
  meeting_link,
  benefits,
  process_steps,
  faqs,
  display_order
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Sarva Pitru Shanti Mahapuja at Gaya Ji',
  'sarva-pitru-shanti-puja-gaya',
  'Ancestral peace, Pitru Dosh Nivaran and divine blessings across seven generations',
  'Perform sacred Pitru Tarpana & Pind Daan at the holy Vishnu Pad in Gaya. Free your lineage from ancestral afflictions and invite generational peace, health & prosperity.',
  'According to traditional Sanatan beliefs, Gaya is the ultimate sacred shrine for Pitru Mukti. Performing this Mahapuja with your Gotra and family names recited by Vedic Pandits brings complete Shanti to departed ancestors. Devotees will receive live streaming access, an uncut video recording of the ritual, and consecrated Tirth Prasad delivered directly to their doorstep.',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&q=80',
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80'
  ],
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '2 days 18 hours',
  'Vishnu Pad Mandir, Gaya Ji, Bihar',
  'Bhadrapada Shukla Purnima (Pitru Paksha Aarambh)',
  851.00,
  'upcoming',
  true,
  true,
  'https://meet.google.com/dharmik-gaya-puja',
  '[
    {"title": "Pitru Dosh Nivaran", "description": "Dissolves karmic blocks hindering financial growth, marriage prospects, and mental peace."},
    {"title": "Blessings for 7 Generations", "description": "Pacifies ancestral souls so they bestow perpetual protection, health, and progeny harmony."},
    {"title": "Doorstep Tirth Prasad Delivery", "description": "Receive an authentic Aashirwad Box with sacred Ganga-Falgu Jal, Til, and Temple Prasad."},
    {"title": "Personalized Vedic Sankalp", "description": "Qualified Teerth Purohits chant your Gotra, Nakshatra, and Family names during Ahuti."}
  ]'::jsonb,
  '[
    {"step": 1, "title": "Devotee Sankalp", "description": "Purohit recites your Name, Gotra, and wish before the sacred Falgu river altar."},
    {"step": 2, "title": "Pind Daan & Til Tarpana", "description": "Authentic Vedic offerings of Barley, Til, Honey, and Milk honoring your lineage."},
    {"step": 3, "title": "Maha Havan & Pitru Gayatri", "description": "Purifying sacred fire ceremony reciting 1008 Pitru Gayatri Mantras."},
    {"step": 4, "title": "WhatsApp Video & Prasad Dispatch", "description": "Full HD video recording shared on your WhatsApp and consecrated Prasad dispatched."}
  ]'::jsonb,
  '[
    {"question": "Do I need to be physically present at Gaya?", "answer": "No. The Puja is performed on your behalf by authenticated Purohits using your Gotra and Name. You can watch live or view the complete uncut video recording sent to your WhatsApp."},
    {"question": "What if I do not know my Gotra?", "answer": "In Sanatan Dharma traditions, if you do not know your Gotra, Panditji will take the universal Kashyap Gotra Sankalp on your behalf, which is fully valid and auspicious."},
    {"question": "When and how will I receive the meeting link?", "answer": "On the morning of the Puja day, our team will send the personalized joining link to your registered WhatsApp number and Email."}
  ]'::jsonb,
  1
) ON CONFLICT (id) DO NOTHING;

-- Packages for Gaya Puja
INSERT INTO public.puja_packages (
  id, puja_id, name, package_type, max_persons, price, original_price, badge_text, description, inclusions, display_order
) VALUES
(
  '22222222-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Individual Puja',
  'single',
  1,
  851.00,
  1250.00,
  NULL,
  'Sankalp for 1 person with Gotra recitation, Til Tarpana, and video updates on WhatsApp.',
  '["1 Person Name & Gotra recited", "Pitru Tarpana & Pind Daan ritual", "Complete HD video shared on WhatsApp", "Live broadcast access link"]'::jsonb,
  1
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Individual Puja + Remedy Consultation',
  'single',
  1,
  951.00,
  1500.00,
  'Recommended',
  'Complete Pitru Puja with personal astrological remedy voice note from Acharya Dharmikshree.',
  '["1 Person Name & Gotra recited", "Pitru Shanti Tarpana & Havan", "1-on-1 Astrological Remedy Voice Note", "Free Aashirwad Box with Prasad", "Full WhatsApp video recording"]'::jsonb,
  2
),
(
  '22222222-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Partner / Couple Puja',
  'couple',
  2,
  1251.00,
  1850.00,
  'Popular',
  'Joint Sankalp for Husband & Wife to bring mutual prosperity, peace of mind, and family harmony.',
  '["2 Persons Names & Gotra recited", "Combined Dampati Sankalp", "Special Deep Daan in couple name", "Free Aashirwad Box delivered to home", "Live stream link & uncut video"]'::jsonb,
  3
),
(
  '22222222-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Family Puja + Gau Seva',
  'group',
  6,
  2001.00,
  2900.00,
  'Best Value',
  'Complete Family Sankalp for up to 6 members with Gau Seva, Anna Daan, and consecrated Prasad.',
  '["Up to 6 Family Members recited", "Pitru Tarpan & Sampoorna Havan", "Special Gau Grass & Anna Daan seva", "Premium Aashirwad Box with Falgu Jal", "Full WhatsApp video & photos proof"]'::jsonb,
  4
) ON CONFLICT (id) DO NOTHING;

-- Maha Mrityunjaya & Rudrabhishek Mahapuja at Trimbakeshwar Jyotirlinga
INSERT INTO public.pujas (
  id,
  title,
  slug,
  subtitle,
  short_description,
  description,
  banner_image_url,
  gallery_images,
  event_date,
  enrollment_end_date,
  location_name,
  tithi_details,
  starting_price,
  puja_status,
  is_featured,
  is_active,
  meeting_link,
  benefits,
  process_steps,
  faqs,
  display_order
) VALUES (
  '11111111-2222-2222-2222-222222222222',
  'Maha Mrityunjaya & Rudrabhishek at Trimbakeshwar',
  'maha-mrityunjaya-rudrabhishek-trimbakeshwar',
  'Ayushya Vardhan, Health Protection & Relief from Graha Doshas at the Jyotirlinga',
  'Experience the divine power of sacred Rudrabhishek chanted with 11 Vedic Pandits at Trimbakeshwar Jyotirlinga. Ward off untimely hurdles, illnesses, and negative energies.',
  'Trimbakeshwar is the revered origin of Godavari and home to the three-faced Jyotirlinga representing Brahma, Vishnu, and Mahesh. The Maha Mrityunjaya Rudrabhishek recitation bestows divine longevity, mental serenity, and protection against malefic planetary impacts.',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80'
  ],
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '6 days 12 hours',
  'Trimbakeshwar Jyotirlinga, Nashik, Maharashtra',
  'Shukla Trayodashi (Som Pradosh Vrat)',
  1100.00,
  'upcoming',
  true,
  true,
  'https://meet.google.com/dharmik-trimbak-puja',
  '[
    {"title": "Arogya & Longevity", "description": "Invokes Lord Shiva for immunity, recovery from chronic ailments, and spiritual vitality."},
    {"title": "Protection from Balarishta & Rahu", "description": "Subdues sharp planetary doshas like Kaal Sarp and Rahu-Ketu transit afflictions."},
    {"title": "Panchamrit Abhishek", "description": "Ritual bath with Milk, Curd, Ghee, Honey, and Gangajal while chanting Sri Rudram."}
  ]'::jsonb,
  '[
    {"step": 1, "title": "Sankalp & Ganapati Puja", "description": "Opening blessings for removal of all obstacles."},
    {"step": 2, "title": "Laghu Rudra & Namakam", "description": "11 Brahmins chant the supreme Vedic hymns on the Jyotirlinga."},
    {"step": 3, "title": "Maha Mrityunjaya Havan", "description": "1008 oblations with Bilva leaves and holy herbs."},
    {"step": 4, "title": "Bhasma Prasad Dispatch", "description": "Holy Bhasma and consecrated Rudraksha sent to your address."}
  ]'::jsonb,
  '[
    {"question": "Can I enroll for my elderly parents?", "answer": "Yes, you can register in the name of parents or family members. Simply specify their names and relation in the enrollment form."}
  ]'::jsonb,
  2
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.puja_packages (
  id, puja_id, name, package_type, max_persons, price, original_price, badge_text, description, inclusions, display_order
) VALUES
(
  '22222222-5555-5555-5555-555555555555',
  '11111111-2222-2222-2222-222222222222',
  'Single Devotee Rudrabhishek',
  'single',
  1,
  1100.00,
  1600.00,
  NULL,
  'Personalized Rudrabhishek with your Name and Gotra.',
  '["1 Person Sankalp", "Panchamrit Abhishek", "WhatsApp Video Highlights", "Live stream link"]'::jsonb,
  1
),
(
  '22222222-6666-6666-6666-666666666666',
  '11111111-2222-2222-2222-222222222222',
  'Family Sampoorna Mahapuja + Rudraksha',
  'group',
  5,
  2500.00,
  3500.00,
  'Recommended',
  'Family protection ritual with consecrated 5-Mukhi Rudraksha and Bhasma prasad.',
  '["Up to 5 Family Members", "Full Maha Mrityunjaya Havan", "Consecrated 5-Mukhi Rudraksha sent by courier", "Full video proof & WhatsApp updates"]'::jsonb,
  2
) ON CONFLICT (id) DO NOTHING;
