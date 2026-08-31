export interface AstrologyCompanyConfig {
  logo_url: string;
  domain_url: string;
  chart_style: string;
  footer_link: string;
  company_info: string;
  company_name: string;
  company_email: string;
  default_report_type: string;
}

export interface PdfReportTypeOption {
  key: string;
  endpoint: string;
  name: string;
  nameHi: string;
  description: string;
}

export const PDF_REPORT_TYPES: PdfReportTypeOption[] = [
  {
    key: "basic_horoscope_pdf",
    endpoint: "basic_horoscope_pdf",
    name: "Basic Horoscope PDF",
    nameHi: "बेसिक कुण्डली (Basic Horoscope)",
    description: "Standard Vedic horoscope PDF with birth details, charts, basic planetary positions & predictions.",
  },
  {
    key: "mini_horoscope_pdf",
    endpoint: "mini_horoscope_pdf",
    name: "Mini Horoscope PDF",
    nameHi: "मिनी कुण्डली (Mini Horoscope)",
    description: "Concise summary horoscope report for quick readings and highlights.",
  },
  {
    key: "pro_horoscope_pdf",
    endpoint: "pro_horoscope_pdf",
    name: "Professional Horoscope PDF",
    nameHi: "प्रोफेशनल कुण्डली (Pro Horoscope)",
    description: "In-depth comprehensive report featuring full planetary analyses, vimshottari dasha, and remedies.",
  },
  {
    key: "match_making_pdf",
    endpoint: "match_making_pdf",
    name: "Match Making PDF",
    nameHi: "गुण मिलान व कुण्डली मिलान (Match Making)",
    description: "Ashtakoot & Dashakoot compatibility report for marriage and relationship analysis.",
  },
  {
    key: "pro_numerology_report",
    endpoint: "pro_numerology_report",
    name: "Pro Numerology Report PDF",
    nameHi: "प्रो न्यूमरोलॉजी रिपोर्ट (Pro Numerology)",
    description: "Comprehensive numerology analysis featuring life path, destiny, and personality numbers.",
  },
];

export const DEFAULT_ASTROLOGY_CONFIG: AstrologyCompanyConfig = {
  logo_url: "https://neytabykygedayelyhvi.supabase.co/storage/v1/object/public/logo/dharmik_logo.png",
  domain_url: "https://dharmikshree.com/",
  chart_style: "NORTH_INDIAN",
  footer_link: "https://dharmikshree.com/",
  company_info: "DharmikShree 13th Gen Astrologer and Vastu Consultant ",
  company_name: "DhamirkShree",
  company_email: "dharmikshree.connect@gmail.com",
  default_report_type: "basic_horoscope_pdf",
};
