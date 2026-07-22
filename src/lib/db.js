import { neon } from '@neondatabase/serverless';
import { promises as fs } from 'fs';
import path from 'path';

const useNeon = Boolean(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
const sql = useNeon ? neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL) : null;

// JSON File Paths (For local development fallback if Neon is not set)
const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
const productsPath = path.join(process.cwd(), 'data', 'products.json');
const bannersPath = path.join(process.cwd(), 'data', 'banners.json');
const metadataPath = path.join(process.cwd(), 'data', 'metadata.json');

// Helper to safely read JSON
async function readJsonFile(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

// Helper to safely write JSON
async function writeJsonFile(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
}

// Helper to ensure tables exist in Neon Postgres
let tablesInitialized = false;
async function ensureTables() {
  if (!useNeon || tablesInitialized) return;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT
      );
    `);
    await sql(`
      CREATE TABLE IF NOT EXISTS products (
        code VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(12, 2),
        fabric VARCHAR(255),
        color VARCHAR(255),
        work TEXT,
        border VARCHAR(255),
        blouse_included BOOLEAN DEFAULT TRUE,
        length VARCHAR(100),
        weight VARCHAR(100),
        occasion VARCHAR(255),
        care TEXT,
        description TEXT,
        thumbnail TEXT,
        images JSONB DEFAULT '[]',
        videos JSONB DEFAULT '[]',
        is_published BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_new_arrival BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await sql(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        image TEXT NOT NULL,
        link TEXT,
        type VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    await sql(`
      CREATE TABLE IF NOT EXISTS metadata (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    tablesInitialized = true;
  } catch (err) {
    console.error('Error creating database tables on Neon Postgres:', err);
  }
}

// ---------------- CATEGORY HELPERS ----------------
export async function getCategories() {
  if (useNeon) {
    await ensureTables();
    const rows = await sql('SELECT * FROM categories ORDER BY name ASC');
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      image: r.image || ''
    }));
  }
  return await readJsonFile(categoriesPath, []);
}

export async function saveCategories(categories) {
  if (useNeon) {
    await ensureTables();
    await sql('DELETE FROM categories');
    for (const item of categories) {
      await sql(
        'INSERT INTO categories (id, name, description, image) VALUES ($1, $2, $3, $4)',
        [item.id, item.name, item.description || '', item.image || '']
      );
    }
    return true;
  }
  return await writeJsonFile(categoriesPath, categories);
}

// ---------------- PRODUCT HELPERS ----------------
export async function getProducts() {
  if (useNeon) {
    await ensureTables();
    const rows = await sql('SELECT * FROM products ORDER BY created_at DESC');
    return rows.map(r => ({
      code: r.code,
      name: r.name,
      category: r.category,
      price: r.price ? Number(r.price) : null,
      fabric: r.fabric || '',
      color: r.color || '',
      work: r.work || '',
      border: r.border || '',
      blouseIncluded: Boolean(r.blouse_included),
      length: r.length || '',
      weight: r.weight || '',
      occasion: r.occasion || '',
      care: r.care || '',
      description: r.description || '',
      thumbnail: r.thumbnail || '',
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
      videos: typeof r.videos === 'string' ? JSON.parse(r.videos) : (r.videos || []),
      isPublished: Boolean(r.is_published),
      isFeatured: Boolean(r.is_featured),
      isNewArrival: Boolean(r.is_new_arrival),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));
  }
  const products = await readJsonFile(productsPath, []);
  return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getProductByCode(code) {
  if (useNeon) {
    await ensureTables();
    const rows = await sql('SELECT * FROM products WHERE LOWER(code) = LOWER($1)', [code]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      code: r.code,
      name: r.name,
      category: r.category,
      price: r.price ? Number(r.price) : null,
      fabric: r.fabric || '',
      color: r.color || '',
      work: r.work || '',
      border: r.border || '',
      blouseIncluded: Boolean(r.blouse_included),
      length: r.length || '',
      weight: r.weight || '',
      occasion: r.occasion || '',
      care: r.care || '',
      description: r.description || '',
      thumbnail: r.thumbnail || '',
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []),
      videos: typeof r.videos === 'string' ? JSON.parse(r.videos) : (r.videos || []),
      isPublished: Boolean(r.is_published),
      isFeatured: Boolean(r.is_featured),
      isNewArrival: Boolean(r.is_new_arrival),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    };
  }
  const products = await getProducts();
  const found = products.find(p => p.code.toLowerCase() === code.toLowerCase());
  return found || null;
}

export async function saveProducts(products) {
  if (useNeon) {
    await ensureTables();
    await sql('DELETE FROM products');
    for (const item of products) {
      await sql(`
        INSERT INTO products (
          code, name, category, price, fabric, color, work, border,
          blouse_included, length, weight, occasion, care, description,
          thumbnail, images, videos, is_published, is_featured, is_new_arrival, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      `, [
        item.code,
        item.name,
        item.category,
        item.price || null,
        item.fabric || '',
        item.color || '',
        item.work || '',
        item.border || '',
        item.blouseIncluded ? true : false,
        item.length || '',
        item.weight || '',
        item.occasion || '',
        item.care || '',
        item.description || '',
        item.thumbnail || '',
        JSON.stringify(item.images || []),
        JSON.stringify(item.videos || []),
        item.isPublished ? true : false,
        item.isFeatured ? true : false,
        item.isNewArrival ? true : false,
        item.createdAt || new Date().toISOString()
      ]);
    }
    return true;
  }
  return await writeJsonFile(productsPath, products);
}

// ---------------- BANNER HELPERS ----------------
export async function getBanners() {
  if (useNeon) {
    await ensureTables();
    const rows = await sql('SELECT * FROM banners');
    return rows.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link || '',
      type: b.type,
      isActive: Boolean(b.is_active)
    }));
  }
  return await readJsonFile(bannersPath, []);
}

export async function saveBanners(banners) {
  if (useNeon) {
    await ensureTables();
    await sql('DELETE FROM banners');
    for (const item of banners) {
      await sql(
        'INSERT INTO banners (id, title, subtitle, image, link, type, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          item.id,
          item.title,
          item.subtitle || '',
          item.image,
          item.link || '',
          item.type,
          item.isActive ? true : false
        ]
      );
    }
    return true;
  }
  return await writeJsonFile(bannersPath, banners);
}

// ---------------- AUTO-INCREMENT CODE GENERATOR ----------------
export async function generateNextProductCode() {
  if (useNeon) {
    await ensureTables();
    let lastSerial = 1007;
    const metaRows = await sql('SELECT value FROM metadata WHERE key = $1', ['last_product_serial']);
    if (metaRows.length > 0) {
      lastSerial = parseInt(metaRows[0].value, 10);
    } else {
      const prodRows = await sql('SELECT code FROM products');
      const serials = prodRows
        .map(r => {
          const match = String(r.code).match(/VK-(\d+)/i);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(Boolean);
      if (serials.length > 0) {
        lastSerial = Math.max(...serials);
      }
    }

    const nextSerial = lastSerial + 1;
    await sql('INSERT INTO metadata (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [
      'last_product_serial',
      String(nextSerial)
    ]);
    return `VK-${nextSerial}`;
  }

  const metadata = await readJsonFile(metadataPath, {});
  let lastSerial = 1007;

  if (metadata.last_product_serial) {
    lastSerial = parseInt(metadata.last_product_serial, 10);
  } else {
    const products = await getProducts();
    const serials = products
      .map(p => {
        const match = String(p.code).match(/VK-(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(Boolean);
    if (serials.length > 0) {
      lastSerial = Math.max(...serials);
    }
  }

  const nextSerial = lastSerial + 1;
  metadata.last_product_serial = String(nextSerial);
  await writeJsonFile(metadataPath, metadata);

  return `VK-${nextSerial}`;
}
