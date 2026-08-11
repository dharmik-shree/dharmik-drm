'use client';

import React from 'react';
import { FolderCheck, FileText, Download, Sparkles } from 'lucide-react';
import { formatDateIN } from '@/lib/formatters';

export default function CustomerDocumentsPage() {
  const documents = [
    {
      id: 'doc-1',
      title: 'Personalized Vedic Remedy & Gemstone Prescription',
      category: 'Remedy Guide',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      size: '1.2 MB',
    },
    {
      id: 'doc-2',
      title: 'Mahapuja Vidhi & Sankalp Instructions',
      category: 'Puja Guide',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      size: '850 KB',
    },
  ];

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

            <button
              onClick={() => alert(`Downloading ${doc.title}`)}
              className="w-full py-2.5 bg-[#1A3C5E] hover:bg-[#15304b] text-amber-300 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF Document ({doc.size})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
