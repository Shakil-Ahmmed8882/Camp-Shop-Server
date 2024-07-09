import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';

export const sendImageToCloudinary = async (
  imageName: string,
  path: string,
) => {
  try {
    if(imageName && path){
      // Configuration
    cloudinary.config({
      cloud_name: 'dmg3ltri6',
      api_key: '158728717455331',
      api_secret: 'kqVAqjjHbXdhryWMxYfwtwyev4g', // variable
    });

    const result = await cloudinary.uploader.upload(path, {
      public_id: imageName,
    });

    // Delete file named 'exampleFile.txt'
    fs.unlink(path, (err) => {
      if (err) {
        console.error('An error occurred:', err);
      } else {
        console.log('File deleted successfully!');
      }
    });

    

    return result?.secure_url
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
  }
};

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({ storage });
