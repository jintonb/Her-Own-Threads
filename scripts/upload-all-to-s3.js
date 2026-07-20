import Database from 'better-sqlite3';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';

async function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = await fs.readFile(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const val = valueParts.join('=').trim();
        process.env[key.trim()] = val;
      }
    }
  } catch (err) {
    console.log('Notice: .env.local reading note:', err.message);
  }
}

await loadEnvLocal();

const region = process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const dbPath = path.join(process.cwd(), 'data', 'catalog.db');
const db = new Database(dbPath);

async function uploadBufferToS3(buffer, subfolder, filename, contentType = 'image/jpeg') {
  const key = `saree-catalog/${subfolder}/${filename.toLowerCase()}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  console.log(`✓ Uploaded to S3 (${subfolder}): ${s3Url}`);
  return s3Url;
}

async function processImageSource(imageSrc, subfolder, filenamePrefix) {
  if (!imageSrc) return imageSrc;

  try {
    let buffer;
    let extension = '.jpg';
    let contentType = 'image/jpeg';

    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      console.log(`Fetching remote URL: ${imageSrc.substring(0, 60)}...`);
      const res = await fetch(imageSrc);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${imageSrc}`);
      const arrayBuf = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      
      const cType = res.headers.get('content-type');
      if (cType) {
        contentType = cType;
        if (cType.includes('png')) extension = '.png';
        else if (cType.includes('webp')) extension = '.webp';
        else if (cType.includes('mp4')) extension = '.mp4';
      }
    } else {
      const localFilePath = path.join(process.cwd(), 'public', imageSrc.replace(/^\//, ''));
      console.log(`Reading local file: ${localFilePath}`);
      buffer = await fs.readFile(localFilePath);
      
      extension = path.extname(localFilePath) || '.jpg';
      if (extension === '.png') contentType = 'image/png';
      else if (extension === '.webp') contentType = 'image/webp';
      else if (extension === '.mp4') contentType = 'video/mp4';
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    const filename = `${filenamePrefix}-${uniqueSuffix}${extension}`;
    return await uploadBufferToS3(buffer, subfolder, filename, contentType);
  } catch (err) {
    console.error(`Failed to process image ${imageSrc}:`, err.message);
    return imageSrc;
  }
}

async function migrateAllImagesToS3() {
  console.log('--- Starting Subfolder Re-organization of Database Media to AWS S3 ---');
  console.log(`Target S3 Bucket: ${bucketName} (${region})`);

  // 1. Categories -> saree-catalog/categories/
  console.log('\n--- 1. Processing Categories Images ---');
  const categories = db.prepare('SELECT * FROM categories').all();
  for (const cat of categories) {
    if (cat.image) {
      const s3Url = await processImageSource(cat.image, 'categories', `cat-${cat.id}`);
      db.prepare('UPDATE categories SET image = ? WHERE id = ?').run(s3Url, cat.id);
    }
  }

  // 2. Banners -> saree-catalog/banners/
  console.log('\n--- 2. Processing Banners Images into "banners" folder ---');
  const banners = db.prepare('SELECT * FROM banners').all();
  for (const ban of banners) {
    if (ban.image) {
      const s3Url = await processImageSource(ban.image, 'banners', `banner-${ban.id}`);
      db.prepare('UPDATE banners SET image = ? WHERE id = ?').run(s3Url, ban.id);
    }
  }

  // 3. Products -> saree-catalog/products/
  console.log('\n--- 3. Processing Products Thumbnails & Galleries into "products" folder ---');
  const products = db.prepare('SELECT * FROM products').all();
  for (const prod of products) {
    console.log(`\nProcessing Saree ${prod.code}: ${prod.name}`);
    
    // Thumbnail
    let newThumb = prod.thumbnail;
    if (prod.thumbnail) {
      newThumb = await processImageSource(prod.thumbnail, 'products', `thumb-${prod.code}`);
    }

    // Additional Images Array
    let newImages = [];
    if (prod.images) {
      const imgList = JSON.parse(prod.images);
      for (let i = 0; i < imgList.length; i++) {
        const s3Img = await processImageSource(imgList[i], 'products', `img-${prod.code}-${i + 1}`);
        newImages.push(s3Img);
      }
    }

    // Additional Videos Array
    let newVideos = [];
    if (prod.videos) {
      const vidList = JSON.parse(prod.videos);
      for (let i = 0; i < vidList.length; i++) {
        const s3Vid = await processImageSource(vidList[i], 'products', `vid-${prod.code}-${i + 1}`);
        newVideos.push(s3Vid);
      }
    }

    db.prepare(`
      UPDATE products 
      SET thumbnail = ?, images = ?, videos = ? 
      WHERE code = ?
    `).run(newThumb, JSON.stringify(newImages), JSON.stringify(newVideos), prod.code);
  }

  console.log('\n--- All Database Images & Videos organized into S3 subfolders & SQLite DB updated! ---');
  db.close();
}

migrateAllImagesToS3();
