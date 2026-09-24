import { NextResponse } from "next/server";
import { resolveLocation } from "@/lib/locationResolver";
import {
  computeReportHash,
  findCachedKundaliReport,
  saveKundaliReportPending,
  updateKundaliReportStatus,
  getAstrologyCompanyConfig,
} from "@/lib/supabaseKundali";
import { PDF_REPORT_TYPES } from "@/constants/astrologyConfig";

// Set max execution duration to 120 seconds to prevent timeouts on 98-page reports (e.g. Pro Numerology)
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// In-flight concurrency lock map: prevents duplicate concurrent API calls if admin clicks twice
const inFlightRequests = new Map<string, Promise<any>>();

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      name,
      gender = "male",
      day,
      month,
      year,
      hour,
      minute,
      place,
      lat,
      lon,
      tzone,
      language = "hi",
      report_type = "basic_horoscope_pdf",
      force_regenerate = false,
    } = body;

    // ----------------------------------------------------
    // 1. STRICT VALIDATION TO SAVE API CALLS & AVOID CHARGES
    // ----------------------------------------------------
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { status: "error", message: "Client full name is required (कृपया कम से कम 2 अक्षरों का नाम दर्ज करें)." },
        { status: 400 }
      );
    }

    const numDay = parseInt(String(day), 10);
    const numMonth = parseInt(String(month), 10);
    const numYear = parseInt(String(year), 10);

    if (isNaN(numDay) || numDay < 1 || numDay > 31) {
      return NextResponse.json(
        { status: "error", message: "Invalid Day of Birth (1-31)." },
        { status: 400 }
      );
    }

    if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
      return NextResponse.json(
        { status: "error", message: "Invalid Month of Birth (1-12)." },
        { status: 400 }
      );
    }

    if (isNaN(numYear) || numYear < 1900 || numYear > 2100) {
      return NextResponse.json(
        { status: "error", message: "Invalid Year of Birth (1900-2100)." },
        { status: 400 }
      );
    }

    // Validate calendar date
    const testDate = new Date(numYear, numMonth - 1, numDay);
    if (
      testDate.getFullYear() !== numYear ||
      testDate.getMonth() !== numMonth - 1 ||
      testDate.getDate() !== numDay
    ) {
      return NextResponse.json(
        { status: "error", message: "Invalid calendar date (e.g. Feb 30th does not exist)." },
        { status: 400 }
      );
    }

    const numHour = parseInt(String(hour ?? "0"), 10);
    const numMin = parseInt(String(minute ?? "0"), 10);

    if (isNaN(numHour) || numHour < 0 || numHour > 23) {
      return NextResponse.json(
        { status: "error", message: "Invalid Hour (0-23)." },
        { status: 400 }
      );
    }

    if (isNaN(numMin) || numMin < 0 || numMin > 59) {
      return NextResponse.json(
        { status: "error", message: "Invalid Minute (0-59)." },
        { status: 400 }
      );
    }

    const trimmedPlace = typeof place === "string" ? place.trim() : "";
    if (!trimmedPlace) {
      return NextResponse.json(
        { status: "error", message: "Birth place is required." },
        { status: 400 }
      );
    }

    const validGender = gender === "female" ? "female" : "male";
    const validLang = language === "en" ? "en" : "hi";

    // Match selected report_type or default to basic_horoscope_pdf
    const selectedType = PDF_REPORT_TYPES.find((r) => r.key === report_type) || PDF_REPORT_TYPES[0];
    const pdfEndpoint = selectedType.endpoint;
    const reportCost = selectedType.cost || 15;

    // Resolve location coordinates & timezone
    const resolvedLoc = await resolveLocation(
      trimmedPlace,
      lat !== undefined && lat !== null && lat !== "" ? parseFloat(String(lat)) : undefined,
      lon !== undefined && lon !== null && lon !== "" ? parseFloat(String(lon)) : undefined,
      tzone !== undefined && tzone !== null && tzone !== "" ? parseFloat(String(tzone)) : undefined
    );

    const finalLat = resolvedLoc.latitude;
    const finalLon = resolvedLoc.longitude;
    const finalTzone = resolvedLoc.timezone ?? 5.5;
    const finalPlace = resolvedLoc.placeName || trimmedPlace;

    // Get IP & User Agent
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    // Compute unique deterministic request hash for caching & deduplication
    const requestHash = computeReportHash({
      report_type: selectedType.key,
      name: trimmedName,
      gender: validGender,
      day: numDay,
      month: numMonth,
      year: numYear,
      hour: numHour,
      minute: numMin,
      lat: finalLat,
      lon: finalLon,
      language: validLang,
    });

    // ----------------------------------------------------
    // 2. CHECK CACHE: DON'T GENERATE SAME PDF TWICE!
    // ----------------------------------------------------
    if (!force_regenerate) {
      const cachedReport = await findCachedKundaliReport(requestHash);
      if (cachedReport && cachedReport.pdf_url) {
        console.log(`[AstrologyAPI Cache HIT] Reusing PDF for ${trimmedName} (${selectedType.name}). Cost saved: ₹${reportCost}`);
        return NextResponse.json({
          status: "success",
          dbRecordId: cachedReport.id,
          pdfUrl: cachedReport.pdf_url,
          reportType: selectedType,
          isCached: true,
          cost: 0,
          costSaved: reportCost,
          generationTimeMs: 0,
          message: `Report served from cache. You saved ₹${reportCost} in API costs!`,
          payload: {
            name: trimmedName,
            gender: validGender,
            dob: `${numYear}-${String(numMonth).padStart(2, "0")}-${String(numDay).padStart(2, "0")}`,
            time: `${String(numHour).padStart(2, "0")}:${String(numMin).padStart(2, "0")}`,
            place: finalPlace,
            language: validLang,
            reportType: selectedType.name,
            pages: selectedType.pages,
          },
        });
      }
    }

    // ----------------------------------------------------
    // 3. IN-FLIGHT DEDUPLICATION LOCK: AVOID MULTIPLE CALLS
    // ----------------------------------------------------
    if (inFlightRequests.has(requestHash)) {
      console.log(`[AstrologyAPI Lock] Joining existing in-flight generation for hash: ${requestHash}`);
      try {
        const result = await inFlightRequests.get(requestHash);
        return NextResponse.json(result);
      } catch (err: any) {
        // If the in-flight failed, proceed to try fresh below
      }
    }

    // Wrap the generation in a promise and store in inFlightRequests
    const generationPromise = (async () => {
      // Fetch dynamic company branding config (or default)
      const companyConfig = await getAstrologyCompanyConfig();

      // Step A: Save pending record in Supabase / Local Resilience Store
      const { id: dbRecordId } = await saveKundaliReportPending({
        name: trimmedName,
        gender: validGender,
        day: numDay,
        month: numMonth,
        year: numYear,
        hour: numHour,
        minute: numMin,
        place: finalPlace,
        lat: finalLat,
        lon: finalLon,
        tzone: finalTzone,
        language: validLang,
        report_type: selectedType.key,
        report_name: selectedType.name,
        cost: reportCost,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      // Step B: Authenticate Astrology API
      const apiKey = process.env.ASTROLOGY_API_KEY;
      const userId = process.env.ASTROLOGY_USER_ID;

      if (!apiKey) {
        const errMsg = "ASTROLOGY_API_KEY is missing in server environment (.env.local)";
        await updateKundaliReportStatus(dbRecordId, "failed", undefined, 0, 0, false, errMsg);
        throw new Error(errMsg);
      }

      // Step C: Prepare payload according to official AstrologyAPI spec
      // Documentation: https://astrologyapi.com/developers/v1/pdf/pro_numerology_report
      const payload: Record<string, any> = {
        name: trimmedName,
        gender: validGender,
        day: numDay,
        month: numMonth,
        year: numYear,
        hour: numHour,
        min: numMin, // AstrologyAPI uses 'min'
        lat: finalLat,
        lon: finalLon,
        tzone: finalTzone,
        place: finalPlace,
        language: validLang,
        chart_style: companyConfig.chart_style || "NORTH_INDIAN",
        footer_link: companyConfig.footer_link || "https://dharmikshree.com/",
        logo_url: companyConfig.logo_url || "https://neytabykygedayelyhvi.supabase.co/storage/v1/object/public/logo/ds_logo_500.png",
        company_name: companyConfig.company_name || "DharmikShree",
        company_info: (companyConfig.company_info || "DharmikShree 13th Gen Astrologer and Vastu Consultant").substring(0, 490),
        domain_url: companyConfig.domain_url || "https://dharmikshree.com/",
        company_email: companyConfig.company_email || "dharmikshree.connect@gmail.com",
        company_landline: companyConfig.company_landline || "+91 98765 43210",
        company_mobile: companyConfig.company_mobile || "+91 98765 43210",
      };

      const apiUrl = `https://pdf.astrologyapi.com/v1/${pdfEndpoint}`;

      // Build headers:
      // AstrologyAPI supports x-astrologyapi-key and Basic Auth (base64(userId:apiKey) or base64(apiKey:))
      const basicAuthToken = Buffer.from(
        userId ? `${userId}:${apiKey}` : `${apiKey}:`
      ).toString("base64");

      const apiHeaders: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-astrologyapi-key": apiKey,
        Authorization: `Basic ${basicAuthToken}`,
        Accept: "application/json",
      };

      // Convert payload to application/x-www-form-urlencoded format as per documentation curl
      const formBody = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          formBody.append(key, String(value));
        }
      }

      console.log(`[AstrologyAPI] Requesting ${pdfEndpoint} for ${trimmedName}...`);

      // Set 90-second timeout with AbortController for large 98-page reports
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      let apiRes: Response;
      try {
        apiRes = await fetch(apiUrl, {
          method: "POST",
          headers: apiHeaders,
          body: formBody.toString(),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const responseText = await apiRes.text();
      let apiData: any = null;
      try {
        apiData = JSON.parse(responseText);
      } catch {
        // If not valid JSON, check if it returned a plain URL or HTML error
        if (responseText.startsWith("http") && responseText.includes(".pdf")) {
          apiData = { status: true, pdf_url: responseText.trim() };
        }
      }

      // Robust extraction of pdf_url from any format
      const pdfUrl: string | null =
        apiData?.pdf_url ||
        apiData?.pdfUrl ||
        apiData?.response ||
        apiData?.data?.pdf_url ||
        apiData?.url ||
        (typeof apiData === "string" && apiData.startsWith("http") ? apiData : null);

      const isSuccess =
        apiRes.ok &&
        pdfUrl &&
        pdfUrl.startsWith("http") &&
        (apiData?.status === true || apiData?.status === 200 || apiData?.status === "success" || !("status" in (apiData || {})));

      if (!isSuccess) {
        const errMsg =
          apiData?.msg ||
          apiData?.message ||
          apiData?.error ||
          `Astrology API error (${pdfEndpoint}): Status ${apiRes.status}`;
        console.error(`[AstrologyAPI Error] ${pdfEndpoint}:`, responseText);

        const genTime = Date.now() - startTime;
        await updateKundaliReportStatus(dbRecordId, "failed", undefined, 0, genTime, false, errMsg);

        return {
          status: "error",
          message: errMsg,
          details: apiData || responseText,
        };
      }

      const generationTimeMs = Date.now() - startTime;
      console.log(`[AstrologyAPI Success] ${pdfEndpoint} generated in ${generationTimeMs}ms: ${pdfUrl}`);

      // Update status in Supabase & Local Cache
      await updateKundaliReportStatus(
        dbRecordId,
        "completed",
        pdfUrl,
        reportCost,
        generationTimeMs,
        false
      );

      return {
        status: "success",
        dbRecordId,
        pdfUrl,
        reportType: selectedType,
        isCached: false,
        cost: reportCost,
        costSaved: 0,
        generationTimeMs,
        message: `Generated fresh ${selectedType.name} (${selectedType.pages} pages) in ${(generationTimeMs / 1000).toFixed(1)}s!`,
        payload: {
          name: trimmedName,
          gender: validGender,
          dob: `${numYear}-${String(numMonth).padStart(2, "0")}-${String(numDay).padStart(2, "0")}`,
          time: `${String(numHour).padStart(2, "0")}:${String(numMin).padStart(2, "0")}`,
          place: finalPlace,
          language: validLang,
          reportType: selectedType.name,
          pages: selectedType.pages,
        },
      };
    })();

    // Register into inFlight map
    inFlightRequests.set(requestHash, generationPromise);

    try {
      const result = await generationPromise;
      if (result.status === "error") {
        return NextResponse.json(result, { status: 500 });
      }
      return NextResponse.json(result);
    } finally {
      // Clean up in-flight request lock
      inFlightRequests.delete(requestHash);
    }
  } catch (error: any) {
    console.error("CRM Generate PDF API Error:", error);
    const isTimeout = error.name === "AbortError" || error.message?.includes("aborted");
    const errMsg = isTimeout
      ? "Astrology API request timed out while generating the 98-page document. Please retry in a few moments."
      : error.message || "Internal server error";

    return NextResponse.json(
      { status: "error", message: errMsg },
      { status: 500 }
    );
  }
}
