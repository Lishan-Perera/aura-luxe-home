import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

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

    // 1. If valid Cloudinary credentials exist (non-demo), upload to Cloudinary
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes('demo') &&
      process.env.CLOUDINARY_API_KEY !== '123456789012345';

    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await uploadToCloudinary(buffer, 'products');
        return NextResponse.json({
          success: true,
          storage: 'cloudinary',
          image: {
            url: uploadResult.url,
            public_id: uploadResult.public_id,
            alt: file.name,
            size: file.size,
            format: uploadResult.format || file.type.split('/')[1],
          },
        });
      } catch (cloudErr: any) {
        console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr.message);
      }
    }

    // 2. Real local storage: Write the file to public/uploads/products/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Sanitize filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1] || 'jpg'}`;
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `prod_${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/products/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      storage: 'local',
      image: {
        url: publicUrl,
        public_id: `local-${path.basename(uniqueFileName, ext)}`,
        alt: file.name,
        size: file.size,
        format: ext.replace('.', ''),
      },
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while uploading the product image' },
      { status: 500 }
    );
  }
}
