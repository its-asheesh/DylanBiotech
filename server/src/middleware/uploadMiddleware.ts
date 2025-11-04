// src/middleware/upload.ts
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import multer from 'multer';

import '../config/cloudinary';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<CloudinaryResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'auto', timeout: 60000 },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload returned no result'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;