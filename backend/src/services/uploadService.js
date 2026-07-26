const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

const uploadImage = async (file, folder = "digipandit") => {
  if (!file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "An image file is required");
  }

  if (!cloudinary.config().cloud_name) {
    if (env.isProduction) {
      throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Image storage is not configured");
    }

    return {
      url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      publicId: null,
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(file.buffer);
  });
};

const uploadAudio = async (file, folder = "digipandit/mantras") => {
  if (!file) throw new ApiError(StatusCodes.BAD_REQUEST, "An MP3, M4A, OGG, WAV, or WebM audio file is required");
  if (!cloudinary.config().cloud_name) {
    if (env.isProduction) throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Audio storage is not configured");
    return { url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`, publicId: null };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "video", format: file.mimetype === "audio/mpeg" ? "mp3" : undefined },
      (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id, duration: result.duration })
    );
    stream.end(file.buffer);
  });
};

module.exports = { uploadImage, uploadAudio };
