import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file was provided for upload' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported image format (${file.type}). Supported formats: JPG, PNG, WEBP, GIF, AVIF.`,
        },
        { status: 400 }
      );
    }

    // Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 10 MB.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Verify Cloudinary credentials are fully configured
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes('demo') &&
      process.env.CLOUDINARY_API_KEY !== '123456789012345'
    );

    if (!isCloudinaryConfigured) {
      return NextResponse.json(
        {
          error:
            'Cloudinary media storage is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables to enable persistent image uploads.',
        },
        { status: 503 }
      );
    }

    try {
      const uploadResult = await uploadToCloudinary(buffer, 'products');

      if (!uploadResult || !uploadResult.url) {
        throw new Error('Cloudinary response did not return a valid secure image URL.');
      }

      return NextResponse.json({
        success: true,
        storage: 'cloudinary',
        image: {
          url: uploadResult.url,
          public_id: uploadResult.public_id,
          alt: file.name,
          size: file.size,
          format: uploadResult.format || file.type.split('/')[1] || 'webp',
        },
      });
    } catch (cloudErr: any) {
      console.error('Cloudinary upload failure:', cloudErr);
      return NextResponse.json(
        {
          error: `Cloudinary upload failed: ${cloudErr.message || 'Unable to store image on cloud storage'}. Please verify your Cloudinary credentials and network access.`,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while uploading the product image' },
      { status: 500 }
    );
  }
}
