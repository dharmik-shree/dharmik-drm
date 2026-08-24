'use client';

import React, { useEffect, useState } from 'react';
import { FolderCheck, FileText, Download, Sparkles } from 'lucide-react';
import { formatDateIN } from '@/lib/formatters';

export default function CustomerDocumentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/me')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error('Failed to fetch documents:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-serif space-y-2">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-amber-500" />
        <p>Loading your documents & remedies...</p>
      </div>
    );
  }

  const profile = data?.profile || {};
  const lead = data?.lead || {};

  const documents: any[] = [
    {
      id: 'doc-1',
      title: 'Personalized Vedic Remedy & Gemstone Prescription',
      category: 'Remedy Guide',
      date: lead.updated_at || lead.created_at || new Date().toISOString(),
      size: 'PDF Document',
      details: profile.conclusion_notes || 'Personalized Kundali remedy guide prescribed by Dharmikshree.',
    },
  ];

  if (profile.stone_certificate_no) {
    documents.push({
      id: 'doc-2',
      title: `Gemstone Lab Certificate (No: ${profile.stone_certificate_no})`,
      category: 'Certificate',
      date: lead.updated_at || new Date().toISOString(),
      size: 'PDF Document',
      details: 'Authentic lab certification for prescribed natural gemstone.',
    });
  }

  if (profile.puja_status === 'booked' || profile.puja_status === 'completed') {
    documents.push({
      id: 'doc-3',
      title: 'Mahapuja Vidhi & Sankalp Guide',
      category: 'Puja Guide',
      date: lead.updated_at || new Date().toISOString(),
      size: 'PDF Document',
      details: 'Instructions and auspicious Muhurat details for Mahapuja.',
    });
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="border-b border-amber-200 pb-4">
        <h1 className="text-2xl font-bold font-serif-heading text-[#1A3C5E]">
          Shared Documents & Spiritual Remedies
        </h1>
        <p className="text-xs text-slate-600 font-serif">
          Access your consultation remedy guides, Puja Sankalp documents, and gemstone certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <FileText className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full">
                  {doc.category}
                </span>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{formatDateIN(doc.date)}</p>
              </div>
            </div>

            <h3 className="font-bold text-sm text-[#1A3C5E] font-serif-heading leading-tight">{doc.title}</h3>
            {doc.details && <p className="text-xs text-slate-600 font-serif leading-relaxed">{doc.details}</p>}

            <button
              onClick={() => alert(`Accessing ${doc.title}`)}
              className="w-full py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> View / Download Document ({doc.size})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
