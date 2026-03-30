const cloudinary = require("../config/cloudinary");

const uploadImage = async (file, folder = "digipandit") => {
  if (!file) {
    return null;
  }

  if (!cloudinary.config().cloud_name) {
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

module.exports = { uploadImage };
