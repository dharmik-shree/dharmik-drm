import { PujaRecord, PujaPackageRecord, PujaEnrollmentRecord, PujaEnrollmentPaymentStatus } from '@/types';
import { createAdminClient } from '@/lib/supabase/server';

// In-memory store fallback for offline/development if DB table not yet created
export const INITIAL_MOCK_PUJAS: PujaRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Sarva Pitru Shanti Mahapuja at Gaya Ji',
    slug: 'sarva-pitru-shanti-puja-gaya',
    subtitle: 'Ancestral peace, Pitru Dosh Nivaran and divine blessings across seven generations',
    short_description: 'Perform sacred Pitru Tarpana & Pind Daan at the holy Vishnu Pad in Gaya. Free your lineage from ancestral afflictions and invite generational peace, health & prosperity.',
    description: 'According to traditional Sanatan beliefs, Gaya is the ultimate sacred shrine for Pitru Mukti. Performing this Mahapuja with your Gotra and family names recited by Vedic Pandits brings complete Shanti to departed ancestors. Devotees will receive live streaming access, an uncut video recording of the ritual, and consecrated Tirth Prasad delivered directly to their doorstep.',
    banner_image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&q=80',
    ],
    event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    enrollment_end_date: new Date(Date.now() + (2 * 24 + 18) * 60 * 60 * 1000).toISOString(),
    location_name: 'Vishnu Pad Mandir, Gaya Ji, Bihar',
    tithi_details: 'Bhadrapada Shukla Purnima (Pitru Paksha Aarambh)',
    starting_price: 851,
    puja_status: 'upcoming',
    is_featured: true,
    is_active: true,
    meeting_link: 'https://meet.google.com/dharmik-gaya-puja',
    benefits: [
      { title: 'Pitru Dosh Nivaran', description: 'Dissolves karmic blocks hindering financial growth and mental peace.' },
      { title: 'Blessings for 7 Generations', description: 'Pacifies ancestral souls so they bestow perpetual protection.' },
      { title: 'Doorstep Tirth Prasad Delivery', description: 'Receive an authentic Aashirwad Box with sacred Falgu-Ganga Jal.' },
    ],
    process_steps: [
      {
        step: 1,
        title: 'Devotee Sankalp',
        description: 'Purohit recites your Name, Gotra, and wish before the sacred Falgu river altar.',
      },
      {
        step: 2,
        title: 'Pind Daan & Til Tarpana',
        description: 'Authentic Vedic offerings of Barley, Til, Honey, and Milk honoring your lineage.',
      },
      {
        step: 3,
        title: 'Maha Havan & Pitru Gayatri',
        description: 'Purifying sacred fire ceremony reciting 1008 Pitru Gayatri Mantras.',
      },
      {
        step: 4,
        title: 'WhatsApp Video & Prasad Dispatch',
        description: 'Full HD video recording shared on your WhatsApp and consecrated Prasad dispatched.',
      },
    ],
    faqs: [
      {
        question: 'Do I need to be physically present at Gaya?',
        answer: 'No. The Puja is performed on your behalf by authenticated Purohits using your Gotra and Name. You can watch live or view the complete uncut video recording sent to your WhatsApp.',
      },
      {
        question: 'What if I do not know my Gotra?',
        answer: 'In Sanatan Dharma traditions, if you do not know your Gotra, Panditji will take the universal Kashyap Gotra Sankalp on your behalf, which is fully valid and auspicious.',
      },
      {
        question: 'When and how will I receive the meeting link?',
        answer: 'On the morning of the Puja day, our team will send the personalized joining link to your registered WhatsApp number and Email.',
      },
      {
        question: 'How will I receive the consecrated Prasad?',
        answer: 'The consecrated Prasad and Aashirwad Box will be packed in a sacred sanctified container and dispatched via premium courier directly to your home address.',
      },
    ],
    display_order: 1,
    enrollments_count: 8,
    revenue_collected: 7858,
    packages: [
      {
        id: '22222222-1111-1111-1111-111111111111',
        puja_id: '11111111-1111-1111-1111-111111111111',
        name: 'Individual Puja',
        package_type: 'single',
        max_persons: 1,
        price: 851,
        original_price: 1250,
        inclusions: ['1 Person Name & Gotra recited', 'Pitru Tarpana & Pind Daan ritual', 'Complete HD video shared on WhatsApp'],
        display_order: 1,
        is_active: true,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        puja_id: '11111111-1111-1111-1111-111111111111',
        name: 'Individual Puja + Remedy Consultation',
        package_type: 'single',
        max_persons: 1,
        price: 951,
        original_price: 1500,
        badge_text: 'Recommended',
        inclusions: ['1 Person Name & Gotra', 'Pitru Shanti Havan', '1-on-1 Astrological Remedy Voice Note'],
        display_order: 2,
        is_active: true,
      },
      {
        id: '22222222-3333-3333-3333-333333333333',
        puja_id: '11111111-1111-1111-1111-111111111111',
        name: 'Partner / Couple Puja',
        package_type: 'couple',
        max_persons: 2,
        price: 1251,
        original_price: 1850,
        badge_text: 'Popular',
        inclusions: ['2 Persons Names & Gotra', 'Combined Dampati Sankalp', 'Free Aashirwad Box delivered'],
        display_order: 3,
        is_active: true,
      },
      {
        id: '22222222-4444-4444-4444-444444444444',
        puja_id: '11111111-1111-1111-1111-111111111111',
        name: 'Family Puja + Gau Seva',
        package_type: 'group',
        max_persons: 6,
        price: 2001,
        original_price: 2900,
        badge_text: 'Best Value',
        inclusions: ['Up to 6 Family Members', 'Pitru Tarpan & Sampoorna Havan', 'Gau Seva & Anna Daan'],
        display_order: 4,
        is_active: true,
      },
    ],
  },
  {
    id: '11111111-2222-2222-2222-222222222222',
    title: 'Maha Mrityunjaya & Rudrabhishek at Trimbakeshwar',
    slug: 'maha-mrityunjaya-rudrabhishek-trimbakeshwar',
    subtitle: 'Ayushya Vardhan, Health Protection & Relief from Graha Doshas at the Jyotirlinga',
    short_description: 'Experience the divine power of sacred Rudrabhishek chanted with 11 Vedic Pandits at Trimbakeshwar Jyotirlinga. Ward off untimely hurdles, illnesses, and negative energies.',
    description: 'Trimbakeshwar is the revered origin of Godavari and home to the three-faced Jyotirlinga representing Brahma, Vishnu, and Mahesh. The Maha Mrityunjaya Rudrabhishek recitation bestows divine longevity, mental serenity, and protection against malefic planetary impacts.',
    banner_image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
    gallery_images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80'],
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    enrollment_end_date: new Date(Date.now() + (6 * 24 + 12) * 60 * 60 * 1000).toISOString(),
    location_name: 'Trimbakeshwar Jyotirlinga, Nashik, Maharashtra',
    tithi_details: 'Shukla Trayodashi (Som Pradosh Vrat)',
    starting_price: 1100,
    puja_status: 'upcoming',
    is_featured: true,
    is_active: true,
    meeting_link: 'https://meet.google.com/dharmik-trimbak-puja',
    benefits: [
      { title: 'Arogya & Longevity', description: 'Invokes Lord Shiva for immunity and vital energy.' },
    ],
    process_steps: [
      { step: 1, title: 'Sankalp & Ganapati Puja', description: 'Opening blessings for removal of all obstacles.' },
      { step: 2, title: 'Laghu Rudra & Namakam', description: '11 Brahmins chant the supreme Vedic hymns on the Jyotirlinga.' },
      { step: 3, title: 'Maha Mrityunjaya Havan', description: '1008 oblations with Bilva leaves and holy herbs.' },
      { step: 4, title: 'Bhasma Prasad Dispatch', description: 'Holy Bhasma and consecrated Rudraksha sent to your address.' },
    ],
    faqs: [
      {
        question: 'Do I need to be physically present at the temple?',
        answer: 'No. The Puja is performed on your behalf by authenticated Purohits using your Gotra and Name. You can watch live or view the complete uncut video recording sent to your WhatsApp.',
      },
      {
        question: 'Can I enroll for my elderly parents?',
        answer: 'Yes, you can register in the name of parents or family members. Simply specify their names and relation in the enrollment form.',
      },
    ],
    display_order: 2,
    enrollments_count: 5,
    revenue_collected: 7200,
    packages: [
      {
        id: '22222222-5555-5555-5555-555555555555',
        puja_id: '11111111-2222-2222-2222-222222222222',
        name: 'Single Devotee Rudrabhishek',
        package_type: 'single',
        max_persons: 1,
        price: 1100,
        original_price: 1600,
        inclusions: ['1 Person Sankalp', 'Panchamrit Abhishek', 'WhatsApp Video Highlights'],
        display_order: 1,
        is_active: true,
      },
      {
        id: '22222222-6666-6666-6666-666666666666',
        puja_id: '11111111-2222-2222-2222-222222222222',
        name: 'Family Sampoorna Mahapuja + Rudraksha',
        package_type: 'group',
        max_persons: 5,
        price: 2500,
        original_price: 3500,
        badge_text: 'Recommended',
        inclusions: ['Up to 5 Family Members', 'Full Maha Mrityunjaya Havan', 'Consecrated Rudraksha'],
        display_order: 2,
        is_active: true,
      },
    ],
  },
];

export const INITIAL_MOCK_ENROLLMENTS: PujaEnrollmentRecord[] = [
  {
    id: 'enr-001',
    booking_number: 'PUJA-2026-4821',
    puja_id: '11111111-1111-1111-1111-111111111111',
    package_id: '22222222-2222-2222-2222-222222222222',
    package_name: 'Individual Puja + Remedy Consultation',
    package_type: 'single',
    package_price: 951,
    devotee_name: 'Vikramaditya Singh',
    phone: '9820012345',
    whatsapp: '9820012345',
    email: 'vikram.singh@gmail.com',
    gotra: 'Kashyap',
    family_members: [],
    sankalp_wish: 'Ancestral peace and guidance for child education',
    payment_status: 'paid',
    payment_amount_collected: 951,
    payment_mode: 'upi',
    payment_notes: 'Paid via GPay UPI ref: 8941038192',
    meeting_link_sent: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    puja: {
      title: 'Sarva Pitru Shanti Mahapuja at Gaya Ji',
      event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      meeting_link: 'https://meet.google.com/dharmik-gaya-puja',
      location_name: 'Vishnu Pad Mandir, Gaya Ji, Bihar',
    },
  },
  {
    id: 'enr-002',
    booking_number: 'PUJA-2026-4822',
    puja_id: '11111111-1111-1111-1111-111111111111',
    package_id: '22222222-4444-4444-4444-444444444444',
    package_name: 'Family Puja + Gau Seva',
    package_type: 'group',
    package_price: 2001,
    devotee_name: 'Sunita & Ramesh Sharma',
    phone: '9811122334',
    whatsapp: '9811122334',
    email: 'ramesh.sharma@yahoo.com',
    gotra: 'Bharadwaj',
    family_members: [{ name: 'Aarav Sharma' }, { name: 'Pooja Sharma' }],
    sankalp_wish: 'Peace for ancestors and health for parents',
    prasad_address: {
      house_street: 'B-402, Lotus Residency, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
    },
    payment_status: 'pending',
    payment_amount_collected: 0,
    payment_mode: 'pending',
    meeting_link_sent: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    puja: {
      title: 'Sarva Pitru Shanti Mahapuja at Gaya Ji',
      event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      meeting_link: 'https://meet.google.com/dharmik-gaya-puja',
      location_name: 'Vishnu Pad Mandir, Gaya Ji, Bihar',
    },
  },
  {
    id: 'enr-003',
    booking_number: 'PUJA-2026-4823',
    puja_id: '11111111-2222-2222-2222-222222222222',
    package_id: '22222222-6666-6666-6666-666666666666',
    package_name: 'Family Sampoorna Mahapuja + Rudraksha',
    package_type: 'group',
    package_price: 2500,
    devotee_name: 'Devendra Joshi',
    phone: '9920199201',
    whatsapp: '9920199201',
    email: 'djoshi@outlook.com',
    gotra: 'Vashishtha',
    family_members: [{ name: 'Meenakshi Joshi' }, { name: 'Kunal Joshi' }],
    sankalp_wish: 'Relief from chronic health problems and planetary peace',
    payment_status: 'verified',
    payment_amount_collected: 2500,
    payment_mode: 'bank_transfer',
    meeting_link_sent: true,
    meeting_link_sent_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    puja: {
      title: 'Maha Mrityunjaya & Rudrabhishek at Trimbakeshwar',
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      meeting_link: 'https://meet.google.com/dharmik-trimbak-puja',
      location_name: 'Trimbakeshwar Jyotirlinga, Nashik, Maharashtra',
    },
  },
];

let inMemoryPujas = [...INITIAL_MOCK_PUJAS];
let inMemoryEnrollments = [...INITIAL_MOCK_ENROLLMENTS];

export async function fetchAdminPujas(): Promise<PujaRecord[]> {
  try {
    const supabase = createAdminClient();
    const { data: pujasData, error } = await supabase
      .from('pujas')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !pujasData || pujasData.length === 0) {
      return inMemoryPujas;
    }

    const pujaIds = pujasData.map((p) => p.id);

    // Fetch packages
    const { data: packagesData } = await supabase
      .from('puja_packages')
      .select('*')
      .in('puja_id', pujaIds)
      .order('display_order', { ascending: true });

    // Fetch enrollment stats
    const { data: enrollmentsData } = await supabase
      .from('puja_enrollments')
      .select('puja_id, payment_status, payment_amount_collected');

    return pujasData.map((puja) => {
      const relatedEnrollments = (enrollmentsData || []).filter((e) => e.puja_id === puja.id);
      const totalCollected = relatedEnrollments
        .filter((e) => e.payment_status === 'paid' || e.payment_status === 'verified')
        .reduce((sum, e) => sum + (Number(e.payment_amount_collected) || 0), 0);

      return {
        ...puja,
        packages: (packagesData || []).filter((pkg) => pkg.puja_id === puja.id),
        enrollments_count: relatedEnrollments.length,
        revenue_collected: totalCollected,
      };
    });
  } catch (err) {
    console.warn('Using in-memory admin pujas fallback:', err);
    return inMemoryPujas;
  }
}

export async function fetchAdminPujaById(id: string): Promise<PujaRecord | null> {
  try {
    const supabase = createAdminClient();
    const { data: puja, error } = await supabase
      .from('pujas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !puja) {
      return inMemoryPujas.find((p) => p.id === id) || null;
    }

    const { data: packages } = await supabase
      .from('puja_packages')
      .select('*')
      .eq('puja_id', id)
      .order('display_order', { ascending: true });

    return {
      ...puja,
      packages: packages || [],
    };
  } catch (err) {
    return inMemoryPujas.find((p) => p.id === id) || null;
  }
}

export async function saveAdminPuja(data: Partial<PujaRecord>, packages: Partial<PujaPackageRecord>[] = []): Promise<PujaRecord> {
  const isNew = !data.id;
  const pujaId = data.id || `puja-${Date.now()}`;

  const pujaPayload = {
    ...data,
    id: pujaId,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createAdminClient();

    if (isNew) {
      const { data: insertedPuja, error: pErr } = await supabase
        .from('pujas')
        .insert([{ ...pujaPayload, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (pErr) throw pErr;

      // Insert packages
      if (packages.length > 0) {
        const pkgInserts = packages.map((pkg, idx) => ({
          ...pkg,
          puja_id: pujaId,
          display_order: idx + 1,
        }));
        await supabase.from('puja_packages').insert(pkgInserts);
      }

      return insertedPuja;
    } else {
      const { data: updatedPuja, error: uErr } = await supabase
        .from('pujas')
        .update(pujaPayload)
        .eq('id', pujaId)
        .select()
        .single();

      if (uErr) throw uErr;

      // Delete existing packages and re-insert
      await supabase.from('puja_packages').delete().eq('puja_id', pujaId);
      if (packages.length > 0) {
        const pkgInserts = packages.map((pkg, idx) => ({
          ...pkg,
          id: pkg.id?.startsWith('pkg-') ? undefined : pkg.id,
          puja_id: pujaId,
          display_order: idx + 1,
        }));
        await supabase.from('puja_packages').insert(pkgInserts);
      }

      return updatedPuja;
    }
  } catch (err) {
    console.warn('Saving puja to in-memory fallback:', err);
    // In-memory update
    const record: PujaRecord = {
      ...(pujaPayload as PujaRecord),
      packages: packages.map((pkg, i) => ({
        id: pkg.id || `pkg-${Date.now()}-${i}`,
        puja_id: pujaId,
        name: pkg.name || 'Individual Puja',
        package_type: pkg.package_type || 'single',
        max_persons: pkg.max_persons || 1,
        price: Number(pkg.price) || 851,
        inclusions: pkg.inclusions || [],
        display_order: i + 1,
        is_active: pkg.is_active !== false,
      })),
      enrollments_count: 0,
      revenue_collected: 0,
    };

    if (isNew) {
      inMemoryPujas.push(record);
    } else {
      const idx = inMemoryPujas.findIndex((p) => p.id === pujaId);
      if (idx !== -1) inMemoryPujas[idx] = record;
    }

    return record;
  }
}

export async function deleteAdminPuja(id: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    await supabase.from('pujas').delete().eq('id', id);
  } catch (err) {
    console.warn('Deleting from in-memory store:', err);
  }
  inMemoryPujas = inMemoryPujas.filter((p) => p.id !== id);
  return true;
}

export async function fetchAdminEnrollments(filters?: {
  puja_id?: string;
  payment_status?: string;
  search?: string;
}): Promise<PujaEnrollmentRecord[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('puja_enrollments')
      .select('*, puja:pujas(title, event_date, meeting_link, location_name)')
      .order('created_at', { ascending: false });

    if (filters?.puja_id && filters.puja_id !== 'all') {
      query = query.eq('puja_id', filters.puja_id);
    }
    if (filters?.payment_status && filters.payment_status !== 'all') {
      query = query.eq('payment_status', filters.payment_status);
    }

    const { data: enrollments, error } = await query;

    if (error || !enrollments || enrollments.length === 0) {
      let filtered = [...inMemoryEnrollments];
      if (filters?.puja_id && filters.puja_id !== 'all') {
        filtered = filtered.filter((e) => e.puja_id === filters.puja_id);
      }
      if (filters?.payment_status && filters.payment_status !== 'all') {
        filtered = filtered.filter((e) => e.payment_status === filters.payment_status);
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.devotee_name.toLowerCase().includes(s) ||
            e.phone.includes(s) ||
            e.booking_number.toLowerCase().includes(s)
        );
      }
      return filtered;
    }

    return enrollments;
  } catch (err) {
    return inMemoryEnrollments;
  }
}

export async function updateEnrollmentPayment(
  enrollmentId: string,
  payment_status: PujaEnrollmentPaymentStatus,
  amount_collected?: number,
  payment_mode?: string,
  payment_notes?: string
): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const updateData: Record<string, any> = {
      payment_status,
      updated_at: new Date().toISOString(),
    };
    if (amount_collected !== undefined) updateData.payment_amount_collected = amount_collected;
    if (payment_mode !== undefined) updateData.payment_mode = payment_mode;
    if (payment_notes !== undefined) updateData.payment_notes = payment_notes;

    const { error } = await supabase
      .from('puja_enrollments')
      .update(updateData)
      .eq('id', enrollmentId);

    if (error) throw error;
  } catch (err) {
    console.warn('Updating enrollment payment in in-memory store:', err);
    const item = inMemoryEnrollments.find((e) => e.id === enrollmentId);
    if (item) {
      item.payment_status = payment_status;
      if (amount_collected !== undefined) item.payment_amount_collected = amount_collected;
      if (payment_mode !== undefined) item.payment_mode = payment_mode;
      if (payment_notes !== undefined) item.payment_notes = payment_notes;
    }
  }

  return true;
}

export async function markMeetingLinkSent(enrollmentId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    await supabase
      .from('puja_enrollments')
      .update({
        meeting_link_sent: true,
        meeting_link_sent_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId);
  } catch (err) {
    console.warn('Marking link sent in in-memory store:', err);
    const item = inMemoryEnrollments.find((e) => e.id === enrollmentId);
    if (item) {
      item.meeting_link_sent = true;
      item.meeting_link_sent_at = new Date().toISOString();
    }
  }
  return true;
}
