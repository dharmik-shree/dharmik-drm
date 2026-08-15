import { EnquiryForm } from '@/components/public/EnquiryForm';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata = {
  title: `Enquiry & Guidance Form | ${BUSINESS_INFO.name}`,
  description: 'Book your Vedic Astrology consultation, Vastu space assessment, or life mentorship session with Dharmikshree.',
};

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const isEmbed = resolvedSearchParams?.embed === 'true';

  if (isEmbed) {
    return (
      <div className="bg-transparent p-2">
        <EnquiryForm isEmbedded={true} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-[#1A3C5E] to-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Branding Header */}
        <div className="text-center text-white space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading tracking-wide text-amber-300">
            {BUSINESS_INFO.name}
          </h2>
          <p className="text-amber-100/80 text-sm tracking-wider uppercase font-medium">
            {BUSINESS_INFO.title}
          </p>
        </div>

        {/* Enquiry Card */}
        <EnquiryForm />

        {/* Footer info */}
        <div className="text-center text-slate-400 text-xs space-y-1">
          <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.</p>
          <p>{BUSINESS_INFO.website} | Direct Support: {BUSINESS_INFO.whatsapp}</p>
        </div>
      </div>
    </main>
  );
}
