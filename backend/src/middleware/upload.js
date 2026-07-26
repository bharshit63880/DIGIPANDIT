const multer = require("multer");

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    callback(null, allowedMimeTypes.has(file.mimetype));
  },
});

upload.audio = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    callback(null, new Set(["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm"]).has(file.mimetype));
  },
});

module.exports = upload;
