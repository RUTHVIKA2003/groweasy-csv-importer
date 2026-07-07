import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@/lib/csvParser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are allowed" }, { status: 400 });
    }

    const content = await file.text();
    const { headers, records } = parseCSV(content);

    return NextResponse.json({
      success: true,
      filename: file.name,
      totalRecords: records.length,
      headers,
      preview: records.slice(0, 100),
      allRecords: records,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse CSV file" },
      { status: 400 }
    );
  }
}
