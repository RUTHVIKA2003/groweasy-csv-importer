import { parse } from "csv-parse/sync";

export function parseCSV(content: string): {
  headers: string[];
  records: Record<string, string>[];
} {
  const records: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });

  if (records.length === 0) {
    throw new Error("CSV file is empty or contains no valid records");
  }

  const headers = Object.keys(records[0]);
  return { headers, records };
}
