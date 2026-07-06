const multer = require("multer");
const path = require("path");

const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".csv"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Only CSV files are allowed"), false);
  }

  if (
    file.mimetype !== "text/csv" &&
    file.mimetype !== "application/vnd.ms-excel" &&
    file.mimetype !== "text/plain"
  ) {
    return cb(new Error("Invalid file type. Only CSV files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
