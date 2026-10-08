'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  IndianRupee,
  Video,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  Loader2,
  X,
  ExternalLink,
  ChevronRight,
  Eye,
  Layers,
  Clock,
  Check,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { PujaRecord, PujaPackageRecord, PujaBenefitItem, PujaProcessStepItem, PujaFAQItem } from '@/types';

// Curated Royalty-Free Sacred Temple Presets
const SACRED_IMAGE_PRESETS = [
  {
    label: 'Surat Tapi River Ghat',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    location: 'Surat, Gujarat',
  },
  {
    label: 'Varanasi Ganga Ghat',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=80',
    location: 'Varanasi, UP',
  },
  {
    label: 'Trimbak Jyotirlinga',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
    location: 'Nashik, Maharashtra',
  },
  {
    label: 'Sacred Vedic Havan',
    url: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=1200&q=80',
    location: 'Vedic Yajna Shala',
  },
  {
    label: 'Temple Gopuram Darshan',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&q=80',
    location: 'Ancient Kshetra',
  },
  {
    label: 'Shiva Lingam Puja',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    location: 'Jyotirlinga Kshetra',
  },
];

// Pre-built authentic puja templates for 1-click loading
const PUJA_TEMPLATES = [
  {
    id: 'kashi-vishwanath',
    name: '🕉️ Kashi Vishwanath Mahadev Rudrabhishek',
    data: {
      title: 'Maha Rudrabhishek & Ganga Aarti at Kashi Vishwanath',
      subtitle: 'Invoke divine peace, remove obstacles & invite cosmic prosperity at Varanasi',
      locationName: 'Kashi Vishwanath Mandir, Varanasi, Uttar Pradesh',
      tithiDetails: 'Shukla Trayodashi (Som Pradosh Vrat)',
      startingPrice: 1100,
      bannerImageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=80',
      shortDescription:
        'Vedic Pandits perform the sacred Laghu Rudra Abhishek and Bilva Archana at the ancient Manikarnika-Vishwanath kshetra for health, vitality, and planetary peace.',
      description:
        'Kashi is the eternal city of Lord Shiva. Participating in this Rudrabhishek bestows liberation from malefic planetary afflictions (especially Rahu-Ketu and Saturn Sade Sati). Devotees receive individual Sankalp with Gotra chanting, WhatsApp uncut video proof, and consecrated Gangajal Bhasma Prasad delivered directly home.',
      meetingLink: 'https://meet.google.com/kashi-rudra-seva',
    },
  },
  {
    id: 'surat-tapi-pitru',
    name: '🪔 Surat Tapi River Sarva Pitru Shanti & Pind Daan',
    data: {
      title: 'Sarva Pitru Shanti Mahapuja on Holy Tapi River, Surat',
      subtitle: 'Ancestral peace, Pitru Dosh Nivaran and divine blessings on the banks of holy Surya-Putri Tapi',
      locationName: 'Holy Tapi River Ghat, Surat, Gujarat',
      tithiDetails: 'Amavasya / Bhadrapada Shukla Purnima',
      startingPrice: 851,
      bannerImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
      shortDescription:
        'Perform sacred Pitru Tarpana & Pind Daan on the sacred banks of River Tapi in Surat. Free your lineage from ancestral afflictions and invite generational peace, health & prosperity.',
      description:
        'In the holy Tapi Puran, river Tapi (Surya-putri) is renowned as a divine kshetra where sacred Tarpana grants liberation and peace to ancestors across generations. Performing this Mahapuja with your Gotra and family names recited by Vedic Pandits brings complete Shanti to departed souls. Devotees receive live streaming access, uncut video recording, and consecrated Prasad delivered directly to their doorstep.',
      meetingLink: 'https://meet.google.com/dharmik-surat-puja',
    },
  },
  {
    id: 'trimbak-mrityunjaya',
    name: '🔱 Trimbakeshwar Maha Mrityunjaya & Rudrabhishek',
    data: {
      title: 'Maha Mrityunjaya & Rudrabhishek at Trimbakeshwar',
      subtitle: 'Ayushya Vardhan, Health Protection & Relief from Graha Doshas at the Jyotirlinga',
      locationName: 'Trimbakeshwar Jyotirlinga, Nashik, Maharashtra',
      tithiDetails: 'Som Pradosh / Trayodashi Muhurat',
      startingPrice: 1100,
      bannerImageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
      shortDescription:
        'Experience the divine power of sacred Rudrabhishek chanted with 11 Vedic Pandits at Trimbakeshwar Jyotirlinga. Ward off untimely hurdles, illnesses, and negative energies.',
      description:
        'Trimbakeshwar is the revered origin of Godavari and home to the three-faced Jyotirlinga representing Brahma, Vishnu, and Mahesh. The Maha Mrityunjaya recitation bestows divine longevity, mental serenity, and protection against malefic planetary impacts.',
      meetingLink: 'https://meet.google.com/dharmik-trimbak-puja',
    },
  },
  {
    id: 'ujjain-kaalsarp',
    name: '⚡ Ujjain Mahakaleshwar Kaal Sarp & Shanti Havan',
    data: {
      title: 'Kaal Sarp & Rahu Shanti Havan at Ujjain Mahakal',
      subtitle: 'Overcome sudden life setbacks, career roadblocks and financial instability',
      locationName: 'Mahakaleshwar Kshetra, Ujjain, Madhya Pradesh',
      tithiDetails: 'Nag Panchami / Amavasya Muhurat',
      startingPrice: 1251,
      bannerImageUrl: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=1200&q=80',
      shortDescription:
        'Vedic Havan and Rahu-Ketu pacification rituals performed on the holy banks of Shipra near Mahakaleshwar Jyotirlinga to break karmic cycles.',
      description:
        'Lord Mahakala is the supreme master of time and destiny. Performing this Shanti ritual under authenticated Purohits dispels persistent Kaal Sarp and planetary doshas that impede career growth and family peace.',
      meetingLink: 'https://meet.google.com/ujjain-mahakal-puja',
    },
  },
];

const DEFAULT_BENEFITS: PujaBenefitItem[] = [
  {
    title: 'Personalized Vedic Sankalp',
    description: 'Qualified Teerth Purohits chant your Gotra, Nakshatra, and Family names during Ahuti.',
  },
  {
    title: 'Graha Shanti & Protection',
    description: 'Dissolves malefic planetary blocks hindering health, financial growth, and family peace.',
  },
  {
    title: 'Doorstep Consecrated Prasad',
    description: 'Receive an authentic Aashirwad Box with sacred Tirth Jal and sanctified Temple Prasad.',
  },
  {
    title: 'Full WhatsApp Video Proof',
    description: 'Live broadcast access link and uncut personalized video of the ritual sent to your phone.',
  },
];

const DEFAULT_PROCESS_STEPS: PujaProcessStepItem[] = [
  {
    step: 1,
    title: 'Devotee Sankalp',
    description: 'Purohit recites your Name, Gotra, and wish before the sacred temple altar.',
  },
  {
    step: 2,
    title: 'Vedic Ahuti & Havan',
    description: 'Purifying sacred fire ceremony reciting 1008 Vedic Mantras honoring the deity.',
  },
  {
    step: 3,
    title: 'Live Darshan & Aarti',
    description: 'Special deep daan and maha aarti broadcast live to all enrolled devotees.',
  },
  {
    step: 4,
    title: 'WhatsApp Video & Prasad Dispatch',
    description: 'Complete HD video recording shared on WhatsApp and sanctified Prasad dispatched to your address.',
  },
];

const DEFAULT_FAQS: PujaFAQItem[] = [
  {
    question: 'Do I need to be physically present at the temple?',
    answer:
      'No. The Puja is performed on your behalf by authenticated Purohits using your Gotra and Name. You can watch live or view the complete uncut video recording sent to your WhatsApp.',
  },
  {
    question: 'What if I do not know my Gotra?',
    answer:
      'In Sanatan Dharma traditions, if you do not know your Gotra, Panditji will take the universal Kashyap Gotra Sankalp on your behalf, which is fully valid and auspicious.',
  },
  {
    question: 'When and how will I receive the meeting link?',
    answer:
      'On the morning of the Puja day, our team will send the personalized joining link to your registered WhatsApp number and Email.',
  },
  {
    question: 'How will I receive the consecrated Prasad?',
    answer:
      'The consecrated Prasad and Aashirwad Box will be packed in a sacred sanctified container and dispatched via premium courier directly to your home address.',
  },
];

interface PujaFormProps {
  initialPuja?: PujaRecord;
  isEdit?: boolean;
}

export default function PujaForm({ initialPuja, isEdit = false }: PujaFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basics' | 'packages' | 'vedic'>('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{
    slug: string;
    title: string;
  } | null>(null);

  // Helper date generators for default future dates (+7 days for event, +6 days for enrollment end)
  const getDefaultEventDate = () => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    d.setHours(9, 30, 0, 0);
    return d.toISOString();
  };

  const getDefaultEndDate = () => {
    const d = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    d.setHours(23, 59, 0, 0);
    return d.toISOString();
  };

  const formatForInput = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  // Form State
  const [title, setTitle] = useState(initialPuja?.title || '');
  const [slug, setSlug] = useState(initialPuja?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(Boolean(initialPuja?.slug));
  const [subtitle, setSubtitle] = useState(initialPuja?.subtitle || '');
  const [locationName, setLocationName] = useState(initialPuja?.location_name || '');
  const [tithiDetails, setTithiDetails] = useState(initialPuja?.tithi_details || '');
  const [startingPrice, setStartingPrice] = useState<number>(initialPuja?.starting_price || 851);
  const [shortDescription, setShortDescription] = useState(initialPuja?.short_description || '');
  const [description, setDescription] = useState(initialPuja?.description || '');
  const [bannerImageUrl, setBannerImageUrl] = useState(
    initialPuja?.banner_image_url || SACRED_IMAGE_PRESETS[0].url
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    Array.isArray(initialPuja?.gallery_images) ? initialPuja.gallery_images : []
  );

  const [eventDate, setEventDate] = useState(formatForInput(initialPuja?.event_date || getDefaultEventDate()));
  const [enrollmentEndDate, setEnrollmentEndDate] = useState(
    formatForInput(initialPuja?.enrollment_end_date || getDefaultEndDate())
  );
  const [pujaStatus, setPujaStatus] = useState<string>(initialPuja?.puja_status || 'upcoming');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialPuja?.is_featured ?? true);
  const [isActive, setIsActive] = useState<boolean>(initialPuja?.is_active ?? true);
  const [meetingLink, setMeetingLink] = useState(
    initialPuja?.meeting_link || 'https://meet.google.com/dharmik-puja-live'
  );

  // Upload & Storage States
  const [isUploadingBanner, setIsUploadingBanner] = useState<boolean>(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);
  const [isDeletingImage, setIsDeletingImage] = useState<boolean>(false);
  const [uploadFeedback, setUploadFeedback] = useState<string>('');

  // Packages State - Pre-loaded with 3 standard packages
  const defaultInitialPackages: Partial<PujaPackageRecord>[] = [
    {
      id: 'pkg-default-1',
      name: 'Single Devotee Sankalp',
      package_type: 'single',
      max_persons: 1,
      price: startingPrice || 851,
      original_price: Math.round((startingPrice || 851) * 1.4),
      badge_text: '',
      description: 'Personalized Sankalp for 1 person with Gotra recitation & WhatsApp HD video proof.',
      inclusions: ['1 Person Name & Gotra recited', 'Vedic Sankalp & Ahuti', 'WhatsApp uncut video recording', 'Live stream access link'],
      display_order: 1,
      is_active: true,
    },
    {
      id: 'pkg-default-2',
      name: 'Couple / Dampati Sankalp',
      package_type: 'couple',
      max_persons: 2,
      price: Math.round((startingPrice || 851) * 1.5),
      original_price: Math.round((startingPrice || 851) * 2),
      badge_text: 'Popular',
      description: 'Joint Sankalp for Husband & Wife to invite marital peace and family harmony.',
      inclusions: ['2 Persons Names & Gotra recited', 'Joint Dampati Vedic Sankalp', 'Doorstep Tirth Prasad Delivery', 'Full WhatsApp HD video proof'],
      display_order: 2,
      is_active: true,
    },
    {
      id: 'pkg-default-3',
      name: 'Family Sampoorna Seva + Prasad',
      package_type: 'group',
      max_persons: 6,
      price: Math.round((startingPrice || 851) * 2.3),
      original_price: Math.round((startingPrice || 851) * 3.2),
      badge_text: 'Best Value',
      description: 'Complete family ritual with consecrated Prasad and Aashirwad Box sent to your home.',
      inclusions: ['Up to 6 Family Members recited', 'Full Maha Havan & Tarpana', 'Consecrated Aashirwad Prasad Box by courier', 'Full video proof & photo album'],
      display_order: 3,
      is_active: true,
    },
  ];

  const [packages, setPackages] = useState<Partial<PujaPackageRecord>[]>(
    initialPuja?.packages && initialPuja.packages.length > 0 ? initialPuja.packages : defaultInitialPackages
  );

  // Benefits, Process Steps & FAQs
  const [benefits, setBenefits] = useState<PujaBenefitItem[]>(
    initialPuja?.benefits && initialPuja.benefits.length > 0 ? initialPuja.benefits : DEFAULT_BENEFITS
  );
  const [processSteps, setProcessSteps] = useState<PujaProcessStepItem[]>(
    initialPuja?.process_steps && initialPuja.process_steps.length > 0
      ? initialPuja.process_steps
      : DEFAULT_PROCESS_STEPS
  );
  const [faqs, setFaqs] = useState<PujaFAQItem[]>(
    initialPuja?.faqs && initialPuja.faqs.length > 0 ? initialPuja.faqs : DEFAULT_FAQS
  );

  // Title change with auto-slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  // Date helper buttons
  const applyDatePreset = (daysAhead: number) => {
    const ev = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    ev.setHours(9, 30, 0, 0);
    const end = new Date(ev.getTime() - 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 0, 0);
    setEventDate(formatForInput(ev.toISOString()));
    setEnrollmentEndDate(formatForInput(end.toISOString()));
  };

  // Template loader
  const handleSelectTemplate = (templateId: string) => {
    const tmpl = PUJA_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    setTitle(tmpl.data.title);
    if (!isEdit) {
      setSlug(
        tmpl.data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
    setSubtitle(tmpl.data.subtitle);
    setLocationName(tmpl.data.locationName);
    setTithiDetails(tmpl.data.tithiDetails);
    setStartingPrice(tmpl.data.startingPrice);
    setBannerImageUrl(tmpl.data.bannerImageUrl);
    setShortDescription(tmpl.data.shortDescription);
    setDescription(tmpl.data.description);
    setMeetingLink(tmpl.data.meetingLink);

    // Update package prices to match template starting price
    setPackages((prev) =>
      prev.map((pkg, idx) => {
        if (idx === 0) return { ...pkg, price: tmpl.data.startingPrice };
        if (idx === 1) return { ...pkg, price: Math.round(tmpl.data.startingPrice * 1.5) };
        if (idx === 2) return { ...pkg, price: Math.round(tmpl.data.startingPrice * 2.3) };
        return pkg;
      })
    );
  };

  // Upload single banner image to Supabase
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setUploadFeedback('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/pujas/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');
      if (data.url) {
        setBannerImageUrl(data.url);
        setUploadFeedback('Banner photo uploaded to Supabase "pujas" bucket successfully!');
      }
    } catch (err: any) {
      setUploadFeedback(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  // Delete banner image from Supabase backend storage
  const handleDeleteBannerImage = async () => {
    if (!bannerImageUrl) return;
    setIsDeletingImage(true);
    try {
      if (bannerImageUrl.includes('/storage/v1/object/') || bannerImageUrl.includes('/pujas/')) {
        await fetch('/api/admin/pujas/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: bannerImageUrl }),
        });
      }
      setBannerImageUrl('');
      setUploadFeedback('Banner photo removed and deleted from Supabase storage.');
    } catch (err: any) {
      console.warn('Error deleting banner image from backend:', err);
      setBannerImageUrl('');
    } finally {
      setIsDeletingImage(false);
    }
  };

  // Upload multiple gallery photos to Supabase
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    setUploadFeedback('');
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append(`file_${i}`, files[i]);
      }
      const res = await fetch('/api/admin/pujas/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload gallery photos');
      if (Array.isArray(data.urls) && data.urls.length > 0) {
        setGalleryImages((prev) => [...prev, ...data.urls]);
        setUploadFeedback(`${data.urls.length} gallery photo(s) uploaded to Supabase storage!`);
      }
    } catch (err: any) {
      setUploadFeedback(`Gallery upload error: ${err.message}`);
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Delete single gallery image from Supabase backend storage
  const handleDeleteGalleryImage = async (imgUrl: string, index: number) => {
    try {
      if (imgUrl.includes('/storage/v1/object/') || imgUrl.includes('/pujas/')) {
        await fetch('/api/admin/pujas/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imgUrl }),
        });
      }
      setGalleryImages((prev) => prev.filter((_, i) => i !== index));
      setUploadFeedback('Gallery photo removed and deleted from Supabase storage.');
    } catch (err: any) {
      console.warn('Error deleting gallery photo from storage:', err);
      setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a Puja Title.');
      setActiveTab('basics');
      return;
    }

    if (!locationName.trim()) {
      setErrorMsg('Please specify the Temple & Sacred Location.');
      setActiveTab('basics');
      return;
    }

    if (!bannerImageUrl.trim()) {
      setErrorMsg('Please select or upload a Featured Banner Image.');
      setActiveTab('basics');
      return;
    }

    const finalSlug = (slug.trim() || title.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setIsSubmitting(true);

    try {
      // Ensure at least 1 active package
      const activePackages = packages.filter((p) => p.is_active !== false);
      const finalPackages =
        activePackages.length > 0
          ? activePackages.map((pkg, idx) => ({
              ...pkg,
              name: pkg.name?.trim() || `Package #${idx + 1}`,
              price: Math.max(1, Number(pkg.price) || startingPrice || 851),
              original_price: pkg.original_price ? Number(pkg.original_price) : undefined,
              display_order: idx + 1,
            }))
          : defaultInitialPackages;

      const payload = {
        id: initialPuja?.id,
        title: title.trim(),
        slug: finalSlug,
        subtitle: subtitle.trim(),
        short_description: shortDescription.trim() || description.slice(0, 150),
        description: description.trim() || shortDescription.trim(),
        banner_image_url: bannerImageUrl.trim(),
        gallery_images: galleryImages.filter((img) => Boolean(img?.trim())),
        location_name: locationName.trim(),
        tithi_details: tithiDetails.trim(),
        starting_price: Number(startingPrice) || 851,
        meeting_link: meetingLink.trim(),
        puja_status: pujaStatus,
        is_featured: isFeatured,
        is_active: isActive,
        event_date: eventDate ? new Date(eventDate).toISOString() : getDefaultEventDate(),
        enrollment_end_date: enrollmentEndDate ? new Date(enrollmentEndDate).toISOString() : getDefaultEndDate(),
        benefits: benefits.filter((b) => Boolean(b.title.trim())),
        process_steps: processSteps.filter((s) => Boolean(s.title.trim())),
        faqs: faqs.filter((f) => Boolean(f.question.trim())),
        packages: finalPackages,
      };

      const url = isEdit ? `/api/admin/pujas/${initialPuja?.id}` : '/api/admin/pujas';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save puja event');

      setSuccessResult({
        slug: data.puja?.slug || finalSlug,
        title: data.puja?.title || title,
      });
    } catch (err: any) {
      console.error('Save puja error:', err);
      setErrorMsg(err.message || 'Something went wrong saving the puja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPreviewDate = useMemo(() => {
    try {
      return new Date(eventDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Upcoming Date';
    }
  }, [eventDate]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* SUCCESS MODAL OVERLAY */}
      {successResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif-heading text-2xl font-bold text-slate-900">
                {isEdit ? 'Puja Updated Successfully!' : 'Puja Published Successfully!'}
              </h3>
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">{successResult.title}</strong> is now live on the devotee website.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 truncate">
              Live Path: /puja/{successResult.slug}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`http://localhost:3000/puja/${successResult.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>View Live on Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  router.push('/admin/pujas');
                  router.refresh();
                }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Back to Pujas List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/pujas')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-serif-heading text-slate-900">
                {isEdit ? 'Edit Puja Event' : 'Create New Puja'}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Fast & Frictionless
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill essentials or pick a 1-click template. Changes sync directly to the devotee portal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push('/admin/pujas')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Portal...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Update Puja' : 'Publish Puja'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* 1-CLICK TEMPLATE PICKER (Hidden in Edit mode) */}
      {!isEdit && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>1-Click Sacred Puja Templates (Instant Pre-fill):</span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Click any to auto-fill everything</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PUJA_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl.id)}
                className="px-3 py-1.5 bg-white hover:bg-amber-100/60 text-slate-800 border border-amber-300/80 rounded-xl text-xs font-medium transition-all shadow-xs hover:border-amber-500 hover:scale-[1.02] flex items-center gap-1.5"
              >
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WORKFLOW TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('basics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'basics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>1. Essential Details & Photo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'packages'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>2. Packages & Pricing ({packages.filter((p) => p.is_active !== false).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vedic')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'vedic'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>3. Ritual Info, Steps & Live Link</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN FORM CONTAINER (7 COLS ON DESKTOP) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: ESSENTIAL DETAILS */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              {/* Card 1: Title & Location */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>Puja Title & Sacred Temple Location</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Puja Title * <span className="text-slate-400 font-normal">(Devotee heading)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Sarva Pitru Shanti Mahapuja on Holy Tapi River, Surat"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temple & Location *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="Holy Tapi River Ghat, Surat, Gujarat"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Starting Dakshina (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="number"
                        min="1"
                        value={startingPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setStartingPrice(val);
                          // Auto update package 1 price
                          setPackages((prev) =>
                            prev.map((pkg, i) => (i === 0 ? { ...pkg, price: val } : pkg))
                          );
                        }}
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tithi / Muhurat Badge
                    </label>
                    <input
                      type="text"
                      value={tithiDetails}
                      onChange={(e) => setTithiDetails(e.target.value)}
                      placeholder="e.g. Shukla Trayodashi (Som Pradosh)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">URL Slug</label>
                      <button
                        type="button"
                        onClick={() => setIsSlugManual(!isSlugManual)}
                        className="text-[10px] text-amber-700 hover:underline"
                      >
                        {isSlugManual ? 'Auto-sync from title' : 'Edit slug'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      readOnly={!isSlugManual}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="sarva-pitru-shanti-puja-surat"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                        isSlugManual
                          ? 'border-slate-300 bg-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subtitle / One-line Blessing
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Ancestral peace and divine blessings across seven generations"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Overview Summary <span className="text-slate-400 font-normal">(Shows in catalog cards)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief overview of the ritual, its sacred significance, and what devotees receive..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Dates with Fast Helper Buttons */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Puja Date & Enrollment Window</span>
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Quick Dates:</span>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(3)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(7)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(14)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                    >
                      +14 Days
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Event Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enrollment Closing Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={enrollmentEndDate}
                      onChange={(e) => setEnrollmentEndDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Sacred Images & Media (Banner & Gallery) */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>Sacred Images & Media</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload high-resolution images stored securely in your Supabase &quot;pujas&quot; storage bucket.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1 self-start sm:self-auto">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Supabase Storage Connected</span>
                  </span>
                </div>

                {/* 1. FEATURED BANNER PHOTO */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Featured Banner Photo *</span>
                      <span className="text-slate-400 font-normal">(Hero slider & catalog image)</span>
                    </label>
                    {bannerImageUrl && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active Banner Selected</span>
                      </span>
                    )}
                  </div>

                  {/* PREVIEW OF SELECTED BANNER */}
                  {bannerImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-md group">
                      <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full max-h-72 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bannerImageUrl}
                          alt="Selected banner preview"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      {/* Overlay Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Banner</span>
                        </span>
                        {bannerImageUrl.includes('supabase.co') ? (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-900/80 backdrop-blur-md text-blue-200 text-[11px] font-semibold border border-blue-400/30 flex items-center gap-1">
                            ☁️ Stored in Supabase Bucket
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-900/80 backdrop-blur-md text-amber-200 text-[11px] font-semibold border border-amber-400/30 flex items-center gap-1">
                            🏛️ Temple Preset / Web
                          </span>
                        )}
                      </div>

                      {/* Overlay Actions */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-white/80 font-mono truncate max-w-[260px] sm:max-w-md hidden sm:inline-block bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                          {bannerImageUrl}
                        </span>
                        <div className="flex items-center gap-2 ml-auto">
                          <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors">
                            <Upload className="w-3.5 h-3.5 text-purple-600" />
                            <span>Change Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingBanner || isDeletingImage}
                              onChange={handleBannerUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleDeleteBannerImage}
                            disabled={isUploadingBanner || isDeletingImage}
                            className="px-3 py-1.5 bg-red-600/90 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors backdrop-blur-xs"
                            title="Remove image and delete from Supabase storage backend"
                          >
                            {isDeletingImage ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* EMPTY STATE DROPZONE */
                    <label className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-purple-50/20 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {isUploadingBanner ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-800 mb-1">
                        {isUploadingBanner ? 'Uploading to Supabase Storage...' : 'Upload Featured Banner Photo'}
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mb-3">
                        Click here to select a photo from your computer. Automatically stored in your Supabase &quot;pujas&quot; bucket.
                      </p>
                      <span className="px-3.5 py-1.5 rounded-lg bg-purple-700 group-hover:bg-purple-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Device Photo</span>
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingBanner}
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Presets & URL Options */}
                  <div className="pt-2 flex flex-col gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Or Choose from Sacred Temple Presets:
                        </span>
                        <span className="text-[11px] text-slate-400">Click any photo to select</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {SACRED_IMAGE_PRESETS.map((p, idx) => {
                          const isSelected = bannerImageUrl === p.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setBannerImageUrl(p.url);
                                setUploadFeedback(`Selected preset: ${p.label}`);
                              }}
                              className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
                                isSelected
                                  ? 'border-amber-600 ring-2 ring-amber-400 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/45 flex items-end p-1.5 text-[10px] text-white font-medium leading-tight text-left">
                                {p.label}
                              </div>
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500 whitespace-nowrap">Or Direct Image URL:</span>
                      <input
                        type="url"
                        value={bannerImageUrl}
                        onChange={(e) => setBannerImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. PUJA GALLERY PHOTOS */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Devotional Gallery Photos (Optional)</span>
                        <span className="text-slate-400 font-normal">({galleryImages.length} uploaded)</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Additional photos shown in the devotee gallery slider (temple sanctum, sacred havan, tapi river ghats).
                      </p>
                    </div>
                    <label className="cursor-pointer px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-purple-200">
                      {isUploadingGallery ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Upload Gallery Photos</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={isUploadingGallery}
                        onChange={handleGalleryUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Gallery Grid */}
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {galleryImages.map((imgUrl, gIdx) => (
                        <div
                          key={gIdx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt={`Gallery photo ${gIdx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                            #{gIdx + 1}
                          </div>
                          {imgUrl.includes('supabase.co') && (
                            <div className="absolute bottom-1 left-1 px-1 rounded bg-blue-900/80 text-blue-200 text-[8px] font-medium">
                              Supabase
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(imgUrl, gIdx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-xs"
                            title="Remove and delete photo from Supabase backend"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400">
                      No additional gallery photos added yet. Click &quot;+ Upload Gallery Photos&quot; above to select multiple photos from device.
                    </div>
                  )}
                </div>

                {uploadFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGES & PRICING */}
          {activeTab === 'packages' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Devotee Packages & Dakshina Options</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pre-populated with 3 authentic packages. You can customize prices or toggle any package on/off.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPackages([
                      ...packages,
                      {
                        id: `pkg-${Date.now()}`,
                        name: 'Custom Puja Package',
                        package_type: 'single',
                        max_persons: 1,
                        price: 999,
                        inclusions: ['Personalized Sankalp', 'WhatsApp Video Recording'],
                        display_order: packages.length + 1,
                        is_active: true,
                      },
                    ])
                  }
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Package</span>
                </button>
              </div>

              <div className="space-y-4">
                {packages.map((pkg, idx) => (
                  <div
                    key={pkg.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      pkg.is_active !== false
                        ? 'bg-slate-50/50 border-slate-200'
                        : 'bg-slate-100/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={pkg.name || ''}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setPackages(updated);
                          }}
                          placeholder="Package Name"
                          className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-amber-600 px-1 py-0.5 flex-1 max-w-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkg.is_active !== false}
                            onChange={(e) => {
                              const updated = [...packages];
                              updated[idx] = { ...updated[idx], is_active: e.target.checked };
                              setPackages(updated);
                            }}
                            className="rounded text-emerald-600"
                          />
                          <span className="text-[11px] font-medium">
                            {pkg.is_active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </label>

                        {packages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPackages(packages.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-slate-500 block mb-1">Dakshina Price (₹)</label>
                        <input
                          type="number"
                          value={pkg.price || ''}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          value={pkg.original_price || ''}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...updated[idx], original_price: Number(e.target.value) };
                            setPackages(updated);
                          }}
                          placeholder="MRP"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1">Max Devotees</label>
                        <input
                          type="number"
                          min="1"
                          value={pkg.max_persons || 1}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...updated[idx], max_persons: Number(e.target.value) };
                            setPackages(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={pkg.badge_text || ''}
                          onChange={(e) => {
                            const updated = [...packages];
                            updated[idx] = { ...updated[idx], badge_text: e.target.value };
                            setPackages(updated);
                          }}
                          placeholder="e.g. Best Value"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white"
                        />
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
                      <label className="text-slate-500 block mb-1">Inclusions (What Devotee Receives):</label>
                      <input
                        type="text"
                        value={Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : ''}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx] = {
                            ...updated[idx],
                            inclusions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          };
                          setPackages(updated);
                        }}
                        placeholder="Comma separated: Gotra Recitation, Video Proof, Prasad Box"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VEDIC DETAILS & LIVE LINK */}
          {activeTab === 'vedic' && (
            <div className="space-y-6">
              {/* Meeting Link & Status */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Live Stream & Event Settings</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Live Stream Meeting Link <span className="text-slate-400 font-normal">(Sent to devotees)</span>
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Puja Status</label>
                    <select
                      value={pujaStatus}
                      onChange={(e) => setPujaStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none"
                    >
                      <option value="upcoming">Upcoming (Accepting Bookings)</option>
                      <option value="ongoing">Ongoing (Puja Happening Live)</option>
                      <option value="completed">Completed (Ritual Finished)</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Featured on Homepage Banner</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>Active & Listed</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Full Spiritual Significance Description */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Complete Spiritual Description & Significance
                </h2>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed spiritual history of the temple, Vedic mantras recited, and benefits of participating..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Benefits */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">Key Spiritual Benefits ({benefits.length})</h2>
                  <button
                    type="button"
                    onClick={() =>
                      setBenefits([...benefits, { title: 'New Blessing', description: 'Description of blessing' }])
                    }
                    className="text-xs text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Benefit
                  </button>
                </div>

                <div className="space-y-3">
                  {benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-1 space-y-2 text-xs">
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const updated = [...benefits];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setBenefits(updated);
                          }}
                          placeholder="Benefit Title"
                          className="w-full font-semibold px-2 py-1 bg-white rounded border border-slate-200"
                        />
                        <textarea
                          rows={2}
                          value={b.description}
                          onChange={(e) => {
                            const updated = [...benefits];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setBenefits(updated);
                          }}
                          placeholder="Benefit description..."
                          className="w-full px-2 py-1 bg-white rounded border border-slate-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR: DEVOTEE LIVE PREVIEW CARD (4 COLS ON DESKTOP) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Devotee Card Live Preview</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">As shown on website</span>
          </div>

          {/* Actual Replica Card */}
          <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-lg flex flex-col justify-between">
            <div>
              {/* Banner */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                {bannerImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerImageUrl}
                    alt="Card Preview"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Image Selected
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] uppercase font-semibold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Stream
                </div>

                {galleryImages.length > 0 && (
                  <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-amber-300 flex items-center gap-1 border border-amber-400/30">
                    <ImageIcon className="w-3 h-3 text-amber-400" />
                    <span>+{galleryImages.length} Photos</span>
                  </div>
                )}

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <span className="text-xs font-medium flex items-center gap-1 text-amber-300 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{locationName || 'Sacred Temple'}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {tithiDetails && (
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded inline-block">
                    {tithiDetails}
                  </div>
                )}

                <h3 className="font-serif-heading text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {title || 'Untitled Sacred Puja'}
                </h3>

                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {shortDescription || subtitle || description || 'Spiritual ritual conducted by Vedic Pandits.'}
                </p>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Event Date: <strong>{formattedPreviewDate}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Dakshina */}
            <div className="p-4 pt-0">
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 tracking-wider block">Dakshina</span>
                  <span className="font-bold text-base text-amber-700 font-serif-heading">
                    ₹{startingPrice} <span className="text-[10px] font-normal text-slate-500">onwards</span>
                  </span>
                </div>

                <div className="px-3.5 py-1.5 bg-slate-900 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs">
                  <span>Participate</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-time Sync Active</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Upon clicking &quot;Publish&quot;, this event is immediately visible to visitors on{' '}
              <span className="font-semibold text-slate-700">/puja</span> and homepage banner slider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
