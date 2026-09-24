import { NextResponse } from "next/server";
import { getKundaliReportsHistory } from "@/lib/supabaseKundali";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const data = await getKundaliReportsHistory(limit, offset);

    return NextResponse.json({
      status: "success",
      ...data,
    });
  } catch (error: any) {
    console.error("Error fetching kundali history:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch reports history" },
      { status: 500 }
    );
  }
}
