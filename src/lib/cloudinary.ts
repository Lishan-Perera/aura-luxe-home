import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

export async function uploadToCloudinary(
  fileBase64OrBuffer: string | Buffer,
  folder: string = 'auraluxe-catalog'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    // If it's base64 or a URI string
    if (typeof fileBase64OrBuffer === 'string') {
      cloudinary.uploader.upload(
        fileBase64OrBuffer,
        {
          folder: `auraluxe/${folder}`,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );
    } else {
      // If it's a buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `auraluxe/${folder}`,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );
      uploadStream.end(fileBase64OrBuffer);
    }
  });
}

export async function deleteFromCloudinary(public_id: string): Promise<boolean> {
  try {
    const res = await cloudinary.uploader.destroy(public_id);
    return res.result === 'ok';
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
    return false;
  }
}

export default cloudinary;

