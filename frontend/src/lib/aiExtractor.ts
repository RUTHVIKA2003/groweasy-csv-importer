import { getAIProvider } from "./aiProviders";

export const CRM_FIELDS = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

const SYSTEM_PROMPT = `You are a data extraction AI that maps CSV records to GrowEasy CRM format.

## CRM Fields
${CRM_FIELDS.map((f) => `- ${f}`).join("\n")}

## Rules

1. **CRM Status** - ONLY use one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. If unsure, use GOOD_LEAD_FOLLOW_UP.

2. **Data Source** - ONLY use one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. If none match confidently, leave blank.

3. **Date Format** - created_at must be a valid JS Date string (e.g., "2026-05-13 14:20:48"). If no date found, use current timestamp.

4. **CRM Notes** - Put remarks, follow-up notes, extra phone numbers, extra emails, and any useful info that doesn't fit elsewhere into crm_note.

5. **Multiple Emails** - Use the first email for the email field. Append remaining emails to crm_note.

6. **Multiple Mobile Numbers** - Use the first mobile for mobile_without_country_code. Append remaining numbers to crm_note.

7. **Skip Invalid Records** - If a record has NEITHER an email NOR a mobile number, mark it as skipped by setting "_skip": true and "_skip_reason": "No email or mobile number found".

8. **Country Code** - Extract country code separately (e.g., "+91", "+1"). If a full phone number includes the country code, split it.

9. **Field Mapping** - Intelligently map CSV columns to CRM fields even if column names differ. For example:
   - "Phone" or "Contact" → mobile_without_country_code
   - "Full Name" or "First Name + Last Name" → name
   - "Email Address" or "E-mail" → email
   - "Organization" or "Business" → company
   - "Location" → city/state/country
   - "Status" or "Lead Status" → crm_status
   - "Notes" or "Comments" or "Remarks" → crm_note
   - "Source" or "Campaign" or "Channel" → data_source
   - "Owner" or "Assigned To" or "Agent" → lead_owner

10. **Output Format** - Return a JSON array of objects. Each object must have all CRM fields (use empty string for missing). Include "_skip": true and "_skip_reason" for invalid records.

11. **No Line Breaks in Values** - Ensure no value contains unescaped newlines. Use \\n if needed.

12. **Be Intelligent** - Use context clues to determine field mappings. A column labeled "Mob" is likely a mobile number. A column with email-like patterns is likely an email field.`;

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;

export interface ExtractResult {
  extracted: Record<string, string>[];
  skipped: { original: Record<string, string>; reason: string }[];
}

export async function extractWithAI(
  records: Record<string, string>[],
  headers: string[]
): Promise<ExtractResult> {
  const aiProvider = getAIProvider();
  const batches: Record<string, string>[][] = [];

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }

  const extracted: Record<string, string>[] = [];
  const skipped: { original: Record<string, string>; reason: string }[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    let result: any[] | null = null;
    let retries = 0;

    while (retries < MAX_RETRIES && result === null) {
      try {
        result = await processBatch(aiProvider, batch, headers);
      } catch (error: any) {
        retries++;
        console.error(`Batch ${i + 1} attempt ${retries} failed:`, error.message);
        if (retries >= MAX_RETRIES) {
          batch.forEach((record) => {
            skipped.push({
              original: record,
              reason: `AI processing failed after ${MAX_RETRIES} retries: ${error.message}`,
            });
          });
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
    }

    if (result) {
      result.forEach((item: any, idx: number) => {
        if (item._skip) {
          skipped.push({
            original: batch[idx] || item,
            reason: item._skip_reason || "Invalid record",
          });
        } else {
          const cleaned: Record<string, string> = {};
          CRM_FIELDS.forEach((field) => {
            cleaned[field] = item[field] || "";
          });
          extracted.push(cleaned);
        }
      });
    }
  }

  return { extracted, skipped };
}

async function processBatch(
  aiProvider: any,
  batch: Record<string, string>[],
  headers: string[]
): Promise<any[]> {
  const userPrompt = `Map the following CSV records to GrowEasy CRM format.

CSV Headers: ${JSON.stringify(headers)}

Records (JSON):
${JSON.stringify(batch, null, 2)}

Return ONLY a valid JSON array of mapped CRM records. No markdown, no explanation.`;

  const responseText = await aiProvider.chat(SYSTEM_PROMPT, userPrompt);

  let jsonStr = responseText.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  // Handle case where response is wrapped in an object
  let parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    // Try to find an array property
    const keys = Object.keys(parsed);
    for (const key of keys) {
      if (Array.isArray(parsed[key])) {
        parsed = parsed[key];
        break;
      }
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not a JSON array");
  }

  return parsed;
}
