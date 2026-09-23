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
} from 'lucide-react';
import { PujaRecord, PujaPackageRecord } from '@/types';

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
