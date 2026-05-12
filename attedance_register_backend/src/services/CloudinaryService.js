const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer File buffer
 * @param {String} folder Cloudinary folder name
 * @returns {Promise} Cloudinary upload response
 */
const uploadToCloudinary = (buffer, folder = 'employees') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `hr_portal/${folder}`, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };
