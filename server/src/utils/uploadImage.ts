// src/utils/uploadImage.ts

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  // For now: save locally
  return `/uploads/${file.filename}`;

  // Later: replace with Cloudinary or S3 logic
  // return await uploadToCloudinary(file); OR
  // return await uploadToS3(file);
};
