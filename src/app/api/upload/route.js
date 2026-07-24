import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Valid API Key or session required.' }, { status: 401 });
  }

  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  const isS3Configured = Boolean(accessKeyId && secretAccessKey && bucketName && region);
  const isVercel = Boolean(process.env.VERCEL);

  try {
    const { searchParams } = new URL(request.url);
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Determine target subfolder (default: 'products', 'banners' for banners)
    let folder = searchParams.get('folder') || formData.get('folder') || 'products';
    folder = folder.replace(/[^a-zA-Z0-9_-]/g, '');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe, unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.name;
    const fileExtension = path.extname(originalName) || '.jpg';
    const baseName = path.basename(originalName, fileExtension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 30);
    const filename = `${baseName}-${uniqueSuffix}${fileExtension}`.toLowerCase();

    // 1. Upload to AWS S3 if credentials are provided
    if (isS3Configured) {
      const s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const contentType = file.type || (fileExtension.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
      const s3Key = `your-own-threads/${folder}/${filename}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);

      const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

      return NextResponse.json({
        success: true,
        url: s3Url,
        name: filename,
        folder: folder,
        storage: 's3',
      });
    }

    // If running on Vercel and S3 is not configured, local file writes are blocked by Vercel Lambda read-only file system
    if (isVercel) {
      return NextResponse.json({
        success: false,
        message: 'AWS S3 environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME) are missing in Vercel Project Settings.'
      }, { status: 400 });
    }

    // 2. Fallback to local disk storage on local dev environment
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${folder}/${filename}`,
      name: filename,
      folder: folder,
      storage: 'local',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'File upload failed' 
    }, { status: 500 });
  }
}
