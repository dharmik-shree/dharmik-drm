import { NextResponse } from "next/server";
import { resolveLocation } from "@/lib/locationResolver";
import { saveKundaliReportPending, updateKundaliReportStatus, getAstrologyCompanyConfig } from "@/lib/supabaseKundali";
import { PDF_REPORT_TYPES } from "@/constants/astrologyConfig";

export async function POST(request: Request) {
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
    } = body;

    // ----------------------------------------------------
    // 1. STRICT VALIDATION TO SAVE API & DB CALLS
    // ----------------------------------------------------
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      return NextResponse.json(
        { status: "error", message: "Client name is required (कृपया नाम दर्ज करें)." },
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
        { status: "error", message: "Invalid calendar date." },
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

    // Fetch dynamic company branding config (or default)
    const companyConfig = await getAstrologyCompanyConfig();

    // ----------------------------------------------------
    // STEP 1: SAVE USER DATA INTO OUR SUPABASE SERVER FIRST
    // ----------------------------------------------------
    const dbRecordId = await saveKundaliReportPending({
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
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    // ----------------------------------------------------
    // STEP 2: CALL ASTROLOGY API (pdfEndpoint)
    // ----------------------------------------------------
    const apiKey = process.env.ASTROLOGY_API_KEY;
    const userId = process.env.ASTROLOGY_USER_ID;

    if (!apiKey) {
      const errMsg = "ASTROLOGY_API_KEY is missing in server environment (.env.local)";
      await updateKundaliReportStatus(dbRecordId, "failed", undefined, errMsg);
      return NextResponse.json(
        { status: "error", message: errMsg },
        { status: 500 }
      );
    }

    let authHeaderValue = "";
    if (userId) {
      authHeaderValue = `Basic ${Buffer.from(`${userId}:${apiKey}`).toString("base64")}`;
    } else if (apiKey.startsWith("Basic ")) {
      authHeaderValue = apiKey;
    } else {
      authHeaderValue = `Basic ${apiKey}`;
    }

    const payload = {
      day: numDay,
      lat: finalLat,
      lon: finalLon,
      min: numMin,
      hour: numHour,
      name: trimmedName,
      year: numYear,
      month: numMonth,
      place: finalPlace,
      tzone: finalTzone,
      gender: validGender,
      language: validLang,
      logo_url: companyConfig.logo_url,
      domain_url: companyConfig.domain_url,
      chart_style: companyConfig.chart_style || "NORTH_INDIAN",
      footer_link: companyConfig.footer_link,
      company_info: companyConfig.company_info,
      company_name: companyConfig.company_name,
      company_email: companyConfig.company_email,
      pdf_api_name: pdfEndpoint,
      pdf_endpoint: pdfEndpoint,
    };

    const apiUrl = `https://pdf.astrologyapi.com/v1/${pdfEndpoint}`;

    let apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeaderValue,
      },
      body: JSON.stringify(payload),
    });

    let apiData = await apiRes.json().catch(() => null);

    // Fallback retry with base64 if standard basic auth fails
    if (!apiRes.ok || !apiData?.status || !apiData?.pdf_url) {
      if (!userId && !apiKey.startsWith("Basic ")) {
        const altAuth = `Basic ${Buffer.from(apiKey).toString("base64")}`;
        const retryRes = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: altAuth,
          },
          body: JSON.stringify(payload),
        });
        const retryData = await retryRes.json().catch(() => null);
        if (retryRes.ok && (retryData?.status || retryData?.pdf_url)) {
          apiRes = retryRes;
          apiData = retryData;
        }
      }
    }

    if (!apiRes.ok || (!apiData?.status && !apiData?.pdf_url)) {
      const errMsg = apiData?.msg || apiData?.message || `Astrology API error (${pdfEndpoint})`;
      console.error("Astrology API Error:", apiData);
      await updateKundaliReportStatus(dbRecordId, "failed", undefined, errMsg);

      return NextResponse.json(
        {
          status: "error",
          message: errMsg,
          details: apiData,
        },
        { status: 500 }
      );
    }

    const pdfUrl = apiData.pdf_url;

    // Update status in Supabase
    await updateKundaliReportStatus(dbRecordId, "completed", pdfUrl);

    return NextResponse.json({
      status: "success",
      dbRecordId,
      pdfUrl,
      reportType: selectedType,
      payload: {
        name: trimmedName,
        gender: validGender,
        dob: `${numYear}-${String(numMonth).padStart(2, "0")}-${String(numDay).padStart(2, "0")}`,
        time: `${String(numHour).padStart(2, "0")}:${String(numMin).padStart(2, "0")}`,
        place: finalPlace,
        language: validLang,
        reportType: selectedType.name,
      },
    });
  } catch (error: any) {
    console.error("CRM Generate PDF API Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
