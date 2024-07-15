import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import config from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.api_key,
  api_secret: config.api_secret,
});

// Function to extract image name (public ID) from URL
const getImageNameFromUrl = (url: string) => {
  const parts = url.split('/');
  const versionAndId = parts[parts.length - 1];
  let publicId = versionAndId.split('.')[0]; // Remove the file extension
  publicId = decodeURIComponent(publicId); // Decode URL-encoded characters
  return publicId;
};

// Function to upload image to Cloudinary
export const sendImageToCloudinary = async (
  imageName: string,
  path: string,
) => {
  try {
    if (imageName && path) {
      const result = await cloudinary.uploader.upload(path, {
        public_id: imageName,
      });

      // Delete file from local storage
      fs.unlink(path, (err) => {
        if (err) {
          console.error('An error occurred:', err);
        } else {
          console.log('File deleted successfully!');
        }
      });

      return result?.secure_url;
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
  }
};

// Function to delete image from Cloudinary using URL
export const deleteImageFromCloudinaryByUrl = async (url: string) => {
  try {
    const imageName = getImageNameFromUrl(url);
    const result = await cloudinary.api.delete_resources([imageName]);
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Multer storage configuration
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

// Multer upload configuration
export const upload = multer({ storage });
