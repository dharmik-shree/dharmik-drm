import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { DEFAULT_ASTROLOGY_CONFIG, AstrologyCompanyConfig, PDF_REPORT_TYPES } from "@/constants/astrologyConfig";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://neytabykygedayelyhvi.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

// Local persistent cache fallback path so cache ALWAYS works even before Supabase table is created
const LOCAL_CACHE_DIR = path.join(process.cwd(), ".data");
const LOCAL_CACHE_FILE = path.join(LOCAL_CACHE_DIR, "kundali_reports_cache.json");

export interface KundaliReportRecord {
  id: string;
  created_at: string;
  updated_at?: string;
  report_type: string;
  report_name?: string;
  name: string;
  gender: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  place: string;
  lat: number;
  lon: number;
  tzone: number;
  language: string;
  pdf_url?: string | null;
  status: "completed" | "failed" | "pending";
  cost: number;
  generation_time_ms: number;
  is_cached: boolean;
  request_hash: string;
  error_message?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface SaveReportParams {
  name: string;
  gender: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  place: string;
  lat: number;
  lon: number;
  tzone: number;
  language: string;
  report_type: string;
  report_name?: string;
  cost?: number;
  ip_address?: string;
  user_agent?: string;
}

// Ensure local cache directory and file exist
function getLocalCache(): KundaliReportRecord[] {
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_CACHE_FILE)) {
      fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify([]), "utf8");
      return [];
    }
    const data = fs.readFileSync(LOCAL_CACHE_FILE, "utf8");
    return JSON.parse(data) || [];
  } catch (err) {
    console.error("Error reading local report cache:", err);
    return [];
  }
}

function saveLocalCache(records: KundaliReportRecord[]): void {
  try {
    if (!fs.existsSync(LOCAL_CACHE_DIR)) {
      fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CACHE_FILE, JSON.stringify(records, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to local report cache:", err);
  }
}

/**
 * Computes a deterministic SHA-256 hash for a report request.
 * Any admin request with the exact same inputs will produce the exact same hash.
 */
export function computeReportHash(params: {
  report_type: string;
  name: string;
  gender: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  lat: number;
  lon: number;
  language: string;
}): string {
  const normName = params.name.trim().toLowerCase();
  const normGender = params.gender.trim().toLowerCase();
  const normDate = `${params.year}-${String(params.month).padStart(2, "0")}-${String(params.day).padStart(2, "0")}`;
  const normTime = `${String(params.hour).padStart(2, "0")}:${String(params.minute).padStart(2, "0")}`;
  const normLat = Number(params.lat).toFixed(4);
  const normLon = Number(params.lon).toFixed(4);
  const normLang = params.language.trim().toLowerCase();
  const normType = params.report_type.trim().toLowerCase();

  const rawString = `${normType}|${normName}|${normGender}|${normDate}|${normTime}|${normLat},${normLon}|${normLang}`;
  return crypto.createHash("sha256").update(rawString).digest("hex");
}

/**
 * Check if an identical report was already generated and has a valid PDF URL.
 * Checks Supabase first, falls back to local cache if Supabase table is not yet created.
 */
export async function findCachedKundaliReport(requestHash: string): Promise<KundaliReportRecord | null> {
  // 1. Try Supabase
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("kundali_reports")
        .select("*")
        .eq("request_hash", requestHash)
        .eq("status", "completed")
        .not("pdf_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        if (row.pdf_url && row.pdf_url.startsWith("http")) {
          return {
            id: row.id,
            created_at: row.created_at,
            report_type: row.report_type,
            report_name: row.report_name,
            name: row.name,
            gender: row.gender,
            day: row.day,
            month: row.month,
            year: row.year,
            hour: row.hour,
            minute: row.minute,
            place: row.place,
            lat: Number(row.lat),
            lon: Number(row.lon),
            tzone: Number(row.tzone),
            language: row.language,
            pdf_url: row.pdf_url,
            status: row.status,
            cost: Number(row.cost || 0),
            generation_time_ms: Number(row.generation_time_ms || 0),
            is_cached: true,
            request_hash: row.request_hash,
          };
        }
      }
    } catch {
      // Supabase table might not exist yet, fallback to local cache
    }
  }

  // 2. Fallback to Local Persistent File Cache
  const localList = getLocalCache();
  const match = localList.find(
    (r) => r.request_hash === requestHash && r.status === "completed" && r.pdf_url && r.pdf_url.startsWith("http")
  );

  return match || null;
}

/**
 * Saves a pending report record before calling the API.
 */
export async function saveKundaliReportPending(params: SaveReportParams): Promise<{ id: string; hash: string }> {
  const hash = computeReportHash({
    report_type: params.report_type,
    name: params.name,
    gender: params.gender,
    day: params.day,
    month: params.month,
    year: params.year,
    hour: params.hour,
    minute: params.minute,
    lat: params.lat,
    lon: params.lon,
    language: params.language,
  });

  const reportOption = PDF_REPORT_TYPES.find((r) => r.key === params.report_type);
  const reportCost = params.cost ?? (reportOption ? reportOption.cost : 15);
  const reportName = params.report_name || (reportOption ? reportOption.name : params.report_type);

  const fallbackId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  const record: KundaliReportRecord = {
    id: fallbackId,
    created_at: nowIso,
    updated_at: nowIso,
    report_type: params.report_type,
    report_name: reportName,
    name: params.name,
    gender: params.gender,
    day: params.day,
    month: params.month,
    year: params.year,
    hour: params.hour,
    minute: params.minute,
    place: params.place,
    lat: params.lat,
    lon: params.lon,
    tzone: params.tzone,
    language: params.language,
    pdf_url: null,
    status: "pending",
    cost: reportCost,
    generation_time_ms: 0,
    is_cached: false,
    request_hash: hash,
    ip_address: params.ip_address || null,
    user_agent: params.user_agent || null,
  };

  // Try Supabase first
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("kundali_reports")
        .insert([record])
        .select("id")
        .single();

      if (!error && data?.id) {
        record.id = data.id;
      }
    } catch {
      // Use fallbackId
    }
  }

  // Also persist in local cache
  const localList = getLocalCache();
  localList.unshift(record);
  saveLocalCache(localList.slice(0, 500)); // Keep last 500 records

  return { id: record.id, hash };
}

/**
 * Updates status, PDF URL, generation time, and cost for a report record.
 */
export async function updateKundaliReportStatus(
  reportId: string,
  status: "completed" | "failed",
  pdfUrl?: string,
  cost?: number,
  generationTimeMs?: number,
  isCached: boolean = false,
  errorMessage?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
    is_cached: isCached,
  };
  if (pdfUrl) updateData.pdf_url = pdfUrl;
  if (cost !== undefined) updateData.cost = cost;
  if (generationTimeMs !== undefined) updateData.generation_time_ms = generationTimeMs;
  if (errorMessage) updateData.error_message = errorMessage;

  // Update Supabase
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from("kundali_reports").update(updateData).eq("id", reportId);
    } catch {
      // ignore
    }
  }

  // Update local cache
  const localList = getLocalCache();
  const idx = localList.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    localList[idx] = {
      ...localList[idx],
      ...updateData,
    };
    saveLocalCache(localList);
  }
}

/**
 * Get report generation history and aggregate cost/time statistics.
 */
export async function getKundaliReportsHistory(limit = 50, offset = 0) {
  let reports: KundaliReportRecord[] = [];

  // Try Supabase first
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("kundali_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && Array.isArray(data) && data.length > 0) {
        reports = data.map((r: any) => ({
          id: r.id,
          created_at: r.created_at,
          report_type: r.report_type || "basic_horoscope_pdf",
          report_name: r.report_name || "Horoscope PDF",
          name: r.name,
          gender: r.gender,
          day: r.day,
          month: r.month,
          year: r.year,
          hour: r.hour,
          minute: r.minute,
          place: r.place,
          lat: Number(r.lat),
          lon: Number(r.lon),
          tzone: Number(r.tzone),
          language: r.language,
          pdf_url: r.pdf_url,
          status: r.status,
          cost: Number(r.cost || 0),
          generation_time_ms: Number(r.generation_time_ms || 0),
          is_cached: Boolean(r.is_cached),
          request_hash: r.request_hash,
          error_message: r.error_message,
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback to local cache if Supabase returned nothing or table missing
  if (reports.length === 0) {
    const local = getLocalCache();
    reports = local.slice(offset, offset + limit);
  }

  // Compute aggregate stats across local & Supabase
  const allRecords = reports.length > 0 ? reports : getLocalCache();
  const completed = allRecords.filter((r) => r.status === "completed");
  const cachedCount = completed.filter((r) => r.is_cached).length;
  const newlyGenerated = completed.filter((r) => !r.is_cached);

  const totalCost = newlyGenerated.reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalSaved = cachedCount * 30; // avg estimated savings per cache hit
  const avgTimeMs =
    newlyGenerated.length > 0
      ? Math.round(newlyGenerated.reduce((sum, r) => sum + (r.generation_time_ms || 0), 0) / newlyGenerated.length)
      : 0;

  return {
    reports,
    stats: {
      totalGenerated: completed.length,
      newlyGeneratedCount: newlyGenerated.length,
      cachedCount,
      totalCost,
      totalSaved,
      avgTimeMs,
    },
  };
}

// Memory cache for dynamic company config
let cachedCompanyConfig: AstrologyCompanyConfig | null = null;

export async function getAstrologyCompanyConfig(): Promise<AstrologyCompanyConfig> {
  if (cachedCompanyConfig) return cachedCompanyConfig;

  if (!supabaseAdmin) return DEFAULT_ASTROLOGY_CONFIG;

  try {
    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "astrology_company_config")
      .single();

    if (!error && data?.value) {
      const resolved = { ...DEFAULT_ASTROLOGY_CONFIG, ...data.value };
      cachedCompanyConfig = resolved;
      return resolved;
    }
  } catch {
    // fallback to defaults if system_settings table doesn't have key yet
  }

  return DEFAULT_ASTROLOGY_CONFIG;
}

export async function saveAstrologyCompanyConfig(config: Partial<AstrologyCompanyConfig>): Promise<boolean> {
  const newConfig = { ...(cachedCompanyConfig || DEFAULT_ASTROLOGY_CONFIG), ...config };
  cachedCompanyConfig = newConfig;

  if (!supabaseAdmin) return true;

  try {
    const { error } = await supabaseAdmin.from("system_settings").upsert(
      {
        key: "astrology_company_config",
        value: newConfig,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.error("Error saving astrology company config to Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error saving company config:", err);
    return false;
  }
}
