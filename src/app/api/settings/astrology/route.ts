import { NextResponse } from "next/server";
import { getAstrologyCompanyConfig, saveAstrologyCompanyConfig } from "@/lib/supabaseKundali";

export async function GET() {
  try {
    const config = await getAstrologyCompanyConfig();
    return NextResponse.json({ status: "success", config });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch config" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const success = await saveAstrologyCompanyConfig(body);
    if (success) {
      const updatedConfig = await getAstrologyCompanyConfig();
      return NextResponse.json({ status: "success", config: updatedConfig });
    }
    return NextResponse.json(
      { status: "error", message: "Failed to save company configuration" },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update config" },
      { status: 500 }
    );
  }
}
