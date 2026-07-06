const { parse } = require("csv-parse/sync");

/**
 * Parse CSV buffer into records with headers
 * @param {Buffer} buffer - CSV file buffer
 * @returns {{ headers: string[], records: object[] }}
 */
function parseCSV(buffer) {
  const content = buffer.toString("utf-8");

  const records = parse(content, {
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

module.exports = { parseCSV };
