const { parseCSV } = require("../services/csvParser");
const { extractWithAI, CRM_FIELDS } = require("../services/aiExtractor");

/**
 * Handle CSV file upload and return preview data
 */
async function uploadCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { headers, records } = parseCSV(req.file.buffer);

    res.json({
      success: true,
      filename: req.file.originalname,
      totalRecords: records.length,
      headers,
      preview: records.slice(0, 100), // Send up to 100 rows for preview
      allRecords: records, // Send all records for processing
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(400).json({
      error: error.message || "Failed to parse CSV file",
    });
  }
}

/**
 * Process records through AI extraction
 */
async function processRecords(req, res) {
  try {
    const { records, headers } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "No records provided" });
    }

    if (!headers || !Array.isArray(headers)) {
      return res.status(400).json({ error: "Headers are required" });
    }

    console.log(`Processing ${records.length} records with AI...`);

    const { extracted, skipped } = await extractWithAI(
      records,
      headers,
      (progress) => {
        console.log(
          `Progress: Batch ${progress.batchIndex}/${progress.totalBatches} ` +
            `(${progress.processed}/${progress.total} records)`
        );
      }
    );

    res.json({
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
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: error.message || "Failed to process records",
    });
  }
}

module.exports = { uploadCSV, processRecords };
