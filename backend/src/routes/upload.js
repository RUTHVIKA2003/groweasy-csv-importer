const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadCSV, processRecords } = require("../controllers/uploadController");

// POST /api/upload - Upload and parse CSV file
router.post("/upload", upload.single("file"), uploadCSV);

// POST /api/process - Process records through AI
router.post("/process", processRecords);

module.exports = router;
