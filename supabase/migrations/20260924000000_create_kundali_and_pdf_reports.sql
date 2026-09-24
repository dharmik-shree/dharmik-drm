-- Migration: Create kundali_reports table with full caching, cost tracking, and timing metrics
CREATE TABLE IF NOT EXISTS public.kundali_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_type TEXT NOT NULL DEFAULT 'basic_horoscope_pdf',
  report_name TEXT,
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
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'pending'
  cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  generation_time_ms INT DEFAULT 0,
  is_cached BOOLEAN NOT NULL DEFAULT false,
  request_hash TEXT NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Ensure columns exist if table was already partially created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'report_type') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN report_type TEXT NOT NULL DEFAULT 'basic_horoscope_pdf';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'report_name') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN report_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'cost') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN cost NUMERIC(10,2) NOT NULL DEFAULT 0.00;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'generation_time_ms') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN generation_time_ms INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'is_cached') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN is_cached BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'request_hash') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN request_hash TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'kundali_reports' AND column_name = 'updated_at') THEN
    ALTER TABLE public.kundali_reports ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- Indexes for lightning fast cache lookups and cost reporting
CREATE INDEX IF NOT EXISTS idx_kundali_reports_hash ON public.kundali_reports (request_hash);
CREATE INDEX IF NOT EXISTS idx_kundali_reports_type_name ON public.kundali_reports (report_type, lower(trim(name)));
CREATE INDEX IF NOT EXISTS idx_kundali_reports_created_at ON public.kundali_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kundali_reports_status ON public.kundali_reports (status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.kundali_reports ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Allow service role full access on kundali_reports" ON public.kundali_reports;
CREATE POLICY "Allow service role full access on kundali_reports"
  ON public.kundali_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admin users to read reports
DROP POLICY IF EXISTS "Allow authenticated read on kundali_reports" ON public.kundali_reports;
CREATE POLICY "Allow authenticated read on kundali_reports"
  ON public.kundali_reports
  FOR SELECT
  TO authenticated
  USING (true);
