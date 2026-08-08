/**
 * server/config/cloudinary.js
 *
 * Configures Cloudinary SDK and exports a multer-storage-cloudinary
 * storage engine factory.  Used by any route that needs file uploads.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * createStorage(folder, opts)
 * Returns a CloudinaryStorage instance scoped to the given folder.
 *
 * @param {string} folder   - Cloudinary folder name (e.g. 'tws/products')
 * @param {object} opts     - Extra params passed to Cloudinary (e.g. { resource_type, format })
 */
function createStorage(folder, opts = {}) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: opts.allowed_formats || ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resource_type: opts.resource_type || 'auto',
      ...opts,
    },
  });
}

/**
 * deleteFromCloudinary(publicId)
 * Removes a file from Cloudinary by its public_id.
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('[Cloudinary] Delete error:', err.message);
  }
}

module.exports = { cloudinary, createStorage, deleteFromCloudinary };
