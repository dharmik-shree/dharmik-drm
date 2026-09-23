'use client';

import React, { useState } from 'react';
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
  ListOrdered,
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { PujaRecord, PujaPackageRecord, PujaProcessStepItem, PujaFAQItem } from '@/types';

const DEFAULT_PROCESS_STEPS: PujaProcessStepItem[] = [
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
];

const DEFAULT_FAQS: PujaFAQItem[] = [
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
];

interface PujaFormProps {
  initialPuja?: PujaRecord;
  isEdit?: boolean;
}

export default function PujaForm({ initialPuja, isEdit = false }: PujaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Puja Basic Fields
  const [title, setTitle] = useState(initialPuja?.title || '');
  const [slug, setSlug] = useState(initialPuja?.slug || '');
  const [subtitle, setSubtitle] = useState(initialPuja?.subtitle || '');
  const [shortDescription, setShortDescription] = useState(initialPuja?.short_description || '');
  const [description, setDescription] = useState(initialPuja?.description || '');
  const [bannerImageUrl, setBannerImageUrl] = useState(
    initialPuja?.banner_image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80'
  );
  const [locationName, setLocationName] = useState(initialPuja?.location_name || '');
  const [tithiDetails, setTithiDetails] = useState(initialPuja?.tithi_details || '');
  const [startingPrice, setStartingPrice] = useState(initialPuja?.starting_price || 851);
  const [meetingLink, setMeetingLink] = useState(
    initialPuja?.meeting_link || 'https://meet.google.com/dharmik-live'
  );
  const [pujaStatus, setPujaStatus] = useState<string>(initialPuja?.puja_status || 'upcoming');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialPuja?.is_featured ?? true);
  const [isActive, setIsActive] = useState<boolean>(initialPuja?.is_active ?? true);

  // Dates formatted for <input type="datetime-local" />
  const formatForInput = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const defaultEventDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const defaultEndDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();

  const [eventDate, setEventDate] = useState(formatForInput(initialPuja?.event_date || defaultEventDate));
  const [enrollmentEndDate, setEnrollmentEndDate] = useState(
    formatForInput(initialPuja?.enrollment_end_date || defaultEndDate)
  );

  // Packages Builder
  const [packages, setPackages] = useState<Partial<PujaPackageRecord>[]>(
    initialPuja?.packages && initialPuja.packages.length > 0
      ? initialPuja.packages
      : [
          {
            id: 'pkg-1',
            name: 'Individual Puja',
            package_type: 'single',
            max_persons: 1,
            price: 851,
            original_price: 1250,
            inclusions: ['1 Person Gotra & Name recited', 'Pitru/Vedic Ahuti', 'WhatsApp Video Proof'],
            display_order: 1,
            is_active: true,
          },
          {
            id: 'pkg-2',
            name: 'Partner / Couple Puja',
            package_type: 'couple',
            max_persons: 2,
            price: 1251,
            original_price: 1850,
            badge_text: 'Popular',
            inclusions: ['2 Persons Names & Gotra', 'Joint Sankalp', 'Doorstep Prasad Delivery'],
            display_order: 2,
            is_active: true,
          },
          {
            id: 'pkg-3',
            name: 'Family Puja + Gau Seva',
            package_type: 'group',
            max_persons: 6,
            price: 2001,
            original_price: 2900,
            badge_text: 'Best Value',
            inclusions: ['Up to 6 Family Members', 'Complete Havan', 'Gau Seva & Anna Daan'],
            display_order: 3,
            is_active: true,
          },
        ]
  );

  // Vedic Process Steps Builder
  const [processSteps, setProcessSteps] = useState<PujaProcessStepItem[]>(
    initialPuja?.process_steps && initialPuja.process_steps.length > 0
      ? initialPuja.process_steps
      : DEFAULT_PROCESS_STEPS
  );

  // FAQs Builder (Sensible fixed defaults loaded, fully customizable per puja)
  const [faqs, setFaqs] = useState<PujaFAQItem[]>(
    initialPuja?.faqs && initialPuja.faqs.length > 0
      ? initialPuja.faqs
      : DEFAULT_FAQS
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleAddPackage = () => {
    setPackages([
      ...packages,
      {
        id: `pkg-${Date.now()}`,
        name: 'New Custom Package',
        package_type: 'single',
        max_persons: 1,
        price: 999,
        inclusions: ['Gotra Recitation', 'WhatsApp Video Recording'],
        display_order: packages.length + 1,
        is_active: true,
      },
    ]);
  };

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  // Process Steps Handlers
  const handleAddProcessStep = () => {
    setProcessSteps([
      ...processSteps,
      {
        step: processSteps.length + 1,
        title: '',
        description: '',
      },
    ]);
  };

  const handleRemoveProcessStep = (index: number) => {
    const updated = processSteps.filter((_, i) => i !== index);
    setProcessSteps(updated.map((s, idx) => ({ ...s, step: idx + 1 })));
  };

  const handleProcessStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    setProcessSteps(updated);
  };

  const handleMoveProcessStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === processSteps.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...processSteps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setProcessSteps(updated.map((s, idx) => ({ ...s, step: idx + 1 })));
  };

  const handleResetProcessSteps = () => {
    if (confirm('Reset Vedic process steps to the standard 4-step template?')) {
      setProcessSteps(DEFAULT_PROCESS_STEPS);
    }
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs([
      ...faqs,
      {
        question: '',
        answer: '',
      },
    ]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === faqs.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setFaqs(updated);
  };

  const handleResetFaqs = () => {
    if (confirm('Reset FAQs to standard fixed defaults?')) {
      setFaqs(DEFAULT_FAQS);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        subtitle,
        short_description: shortDescription,
        description,
        banner_image_url: bannerImageUrl,
        location_name: locationName,
        tithi_details: tithiDetails,
        starting_price: Number(startingPrice),
        meeting_link: meetingLink,
        puja_status: pujaStatus,
        is_featured: isFeatured,
        is_active: isActive,
        event_date: new Date(eventDate).toISOString(),
        enrollment_end_date: new Date(enrollmentEndDate).toISOString(),
        process_steps: processSteps.filter((s) => s.title.trim() !== ''),
        faqs: faqs.filter((f) => f.question.trim() !== ''),
        packages: packages.map((pkg, idx) => ({
          ...pkg,
          price: Number(pkg.price),
          original_price: pkg.original_price ? Number(pkg.original_price) : undefined,
          display_order: idx + 1,
        })),
      };

      const url = isEdit ? `/api/admin/pujas/${initialPuja?.id}` : '/api/admin/pujas';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save puja');

      router.push('/admin/pujas');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong saving the puja.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif-heading text-slate-900">
              {isEdit ? 'Edit Puja Event' : 'Create New Puja Event'}
            </h1>
            <p className="text-xs text-slate-500">
              Set event dates, live meeting stream link, pricing, and package options.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/admin/pujas')}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: Core Puja Details */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Flame className="w-4 h-4 text-orange-600" />
          <span>Basic Puja Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Puja Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Sarva Pitru Shanti Mahapuja at Gaya Ji"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Slug (Unique Path) *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="sarva-pitru-shanti-puja-gaya"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">Live URL: /puja/{slug || 'slug'}</p>
          </div>

          {/* Starting Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Starting Dakshina (₹) *
            </label>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))}
              placeholder="851"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Subtitle */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subtitle / Tagline
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ancestral peace and divine blessings across seven generations"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Temple & Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Temple & Sacred Location *
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Vishnu Pad Mandir, Gaya Ji, Bihar"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Tithi / Muhurat Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tithi / Muhurat Badge
            </label>
            <input
              type="text"
              value={tithiDetails}
              onChange={(e) => setTithiDetails(e.target.value)}
              placeholder="Bhadrapada Shukla Purnima (Pitru Paksha)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Banner Image URL */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Banner Image URL *
            </label>
            <input
              type="url"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Short Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Summary (Shows in cards)
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
              placeholder="Brief 1-2 sentence overview of the ritual..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Full Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complete Spiritual Description & Significance
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detailed spiritual background, Vedic mantras, and benefits of participating..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Dates, Status & Live Meeting Stream */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Timing, Live Stream Link & Visibility</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Event Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Puja Event Date & Time *
            </label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Enrollment End Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enrollment Deadline (Countdown Timer Ends) *
            </label>
            <input
              type="datetime-local"
              value={enrollmentEndDate}
              onChange={(e) => setEnrollmentEndDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Live Meeting Stream Link */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Live Meeting / Stream Link (Sent to Devotees on Puja Day)
            </label>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-blue-600">
              <span className="bg-slate-100 px-3 py-2.5 text-xs text-slate-600 flex items-center gap-1 border-r border-slate-300">
                <Video className="w-3.5 h-3.5 text-purple-600" /> Meet / Zoom:
              </span>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xyz-abc or YouTube Live link"
                className="w-full px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This link is sent with 1 click to verified devotees via WhatsApp and Email on the day of the Puja.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Puja Status
            </label>
            <select
              value={pujaStatus}
              onChange={(e) => setPujaStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing (Live Today)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Feature on Website Hero Banner Slider</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Active & Published</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: Dynamic Packages Builder */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>Puja Packages & Pricing</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define Single Person, Couple, and Family packages shown on the website (Screenshot 1).
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddPackage}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Package
          </button>
        </div>

        <div className="space-y-4">
          {packages.map((pkg, idx) => (
            <div
              key={pkg.id || idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-left relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Package #{idx + 1}
                </span>
                {packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePackage(idx)}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    title="Remove Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={pkg.name || ''}
                    onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Individual Puja"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* Package Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Type
                  </label>
                  <select
                    value={pkg.package_type || 'single'}
                    onChange={(e) => handlePackageChange(idx, 'package_type', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="single">Single Person (1)</option>
                    <option value="couple">Couple / Partner (2)</option>
                    <option value="family">Family (3-5)</option>
                    <option value="group">Group (5+)</option>
                  </select>
                </div>

                {/* Max Persons */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Max Persons
                  </label>
                  <input
                    type="number"
                    value={pkg.max_persons || 1}
                    onChange={(e) => handlePackageChange(idx, 'max_persons', Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Dakshina Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={pkg.price || 0}
                    onChange={(e) => handlePackageChange(idx, 'price', Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-emerald-700"
                  />
                </div>

                {/* Original Strikethrough Price */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pkg.original_price || ''}
                    onChange={(e) => handlePackageChange(idx, 'original_price', Number(e.target.value))}
                    placeholder="1250"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* Badge Text */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={pkg.badge_text || ''}
                    onChange={(e) => handlePackageChange(idx, 'badge_text', e.target.value)}
                    placeholder="e.g. Recommended, Best Value, Popular"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                {/* Inclusions */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Inclusions (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : ''}
                    onChange={(e) =>
                      handlePackageChange(
                        idx,
                        'inclusions',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="1 Person Gotra & Name recited, WhatsApp Video, Free Aashirwad Box"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Vedic Process Steps Builder ("How the Puja is Performed Step-by-Step") */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-[#B88E4B]" />
              <span>Vedic Process Steps (&ldquo;How the Puja is Performed Step-by-Step&rdquo;)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These steps are displayed under the Vedic Process tab on the website (Screenshot 1). You can add, edit, reorder, or delete steps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetProcessSteps}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
              title="Reset to 4 standard Vedic ritual steps"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Template</span>
            </button>
            <button
              type="button"
              onClick={handleAddProcessStep}
              className="px-3 py-1.5 bg-[#B88E4B] hover:bg-[#a67d3d] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processSteps.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
              No steps defined. Click &ldquo;Add Step&rdquo; or &ldquo;Reset Template&rdquo; to add standard Vedic ritual steps.
            </div>
          ) : (
            processSteps.map((stepItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-left relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#B88E4B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Step #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveProcessStep(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === processSteps.length - 1}
                      onClick={() => handleMoveProcessStep(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProcessStep(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1 ml-1"
                      title="Remove Step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Step Title *
                    </label>
                    <input
                      type="text"
                      value={stepItem.title}
                      onChange={(e) => handleProcessStepChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Devotee Sankalp"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Step Description / Vedic Action *
                    </label>
                    <textarea
                      value={stepItem.description}
                      onChange={(e) => handleProcessStepChange(idx, 'description', e.target.value)}
                      placeholder="e.g. Purohit recites your Name, Gotra, and wish before the sacred Falgu river altar."
                      rows={2}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 5: Frequently Asked Questions (FAQs) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Frequently Asked Questions (FAQs)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fixed standard temple defaults are automatically pre-populated (Screenshot 2). Admin can edit, add, or delete questions according to needs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFaqs}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
              title="Reset to fixed standard default FAQs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default FAQs</span>
            </button>
            <button
              type="button"
              onClick={handleAddFaq}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
              No FAQs defined. Click &ldquo;Add FAQ&rdquo; or &ldquo;Reset Default FAQs&rdquo; to load fixed temple questions.
            </div>
          ) : (
            faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-left relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-amber-600 text-amber-700 font-bold text-xs flex items-center justify-center bg-amber-50">
                      ?
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      FAQ #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveFaq(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === faqs.length - 1}
                      onClick={() => handleMoveFaq(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1 ml-1"
                      title="Remove FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                      placeholder="e.g. Do I need to be physically present at Gaya?"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600 font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Answer *
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                      placeholder="e.g. No. The Puja is performed on your behalf by authenticated Purohits..."
                      rows={3}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/admin/pujas')}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Save & Publish Puja Event'}</span>
        </button>
      </div>
    </form>
  );
}
