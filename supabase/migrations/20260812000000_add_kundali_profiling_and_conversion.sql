-- Migration: 20260812000000_add_kundali_profiling_and_conversion.sql
-- Add Kundali & Customer Profiling fields to leads, users, and customers tables

-- 1. Extend LEADS table with Kundali & Profiling fields
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS time_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS relation TEXT CHECK (relation IN ('self', 'spouse', 'child', 'father', 'mother', 'business_partner', 'other')) DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other')),
  ADD COLUMN IF NOT EXISTS gotra TEXT,
  ADD COLUMN IF NOT EXISTS rashi TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS kundali_notes TEXT;

-- 2. Extend USERS table with Kundali & Profiling fields
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS time_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS relation TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS gotra TEXT,
  ADD COLUMN IF NOT EXISTS rashi TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS kundali_notes TEXT;

-- 3. Extend CUSTOMERS table with Kundali & Profiling fields
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS time_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS relation TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS gotra TEXT,
  ADD COLUMN IF NOT EXISTS rashi TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS kundali_notes TEXT;

-- Indexes for efficient querying by phone, email, rashi, and conversion status
CREATE INDEX IF NOT EXISTS idx_leads_is_converted ON public.leads(is_converted);
CREATE INDEX IF NOT EXISTS idx_leads_rashi ON public.leads(rashi);
CREATE INDEX IF NOT EXISTS idx_customers_lead_id ON public.customers(lead_id);
