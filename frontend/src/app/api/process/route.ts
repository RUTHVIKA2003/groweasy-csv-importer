import { NextRequest, NextResponse } from "next/server";
import { extractWithAI, CRM_FIELDS } from "@/lib/aiExtractor";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

export async function POST(request: NextRequest) {
  try {
    const { records, headers } = await request.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "No records provided" }, { status: 400 });
    }

    if (!headers || !Array.isArray(headers)) {
      return NextResponse.json({ error: "Headers are required" }, { status: 400 });
    }

    console.log(`Processing ${records.length} records with AI...`);

    const { extracted, skipped } = await extractWithAI(records, headers);

    return NextResponse.json({
      success: true,
      data: {
        extracted,
        skipped,
        summary: {
          totalProcessed: records.length,
          totalImported: extracted.length,
          totalSkipped: skipped.length,
        },
        crmFields: CRM_FIELDS,
      },
    });
  } catch (error: any) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process records" },
      { status: 500 }
    );
  }
}
