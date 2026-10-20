const multer = require("multer");

// Use Memory Storage to bypass Vercel's read-only file system
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF allowed"), false);
  }
};

exports.upload = multer({ storage, fileFilter });