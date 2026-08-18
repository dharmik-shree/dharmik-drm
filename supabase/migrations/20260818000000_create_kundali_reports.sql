-- Migration: Create kundali_reports table for tracking horoscope PDF generation requests
CREATE TABLE IF NOT EXISTS public.kundali_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'male',
  day INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  hour INT NOT NULL,
  minute INT NOT NULL,
  place TEXT NOT NULL,
  lat NUMERIC(10,6) NOT NULL,
  lon NUMERIC(10,6) NOT NULL,
  tzone NUMERIC(4,2) NOT NULL DEFAULT 5.5,
  language TEXT NOT NULL DEFAULT 'hi',
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.kundali_reports ENABLE ROW LEVEL SECURITY;

-- Allow full access for service_role
CREATE POLICY "Allow service role full access on kundali_reports"
  ON public.kundali_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
