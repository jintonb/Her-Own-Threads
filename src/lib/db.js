import { createClient } from '@libsql/client';
import path from 'path';

const isVercel = Boolean(process.env.VERCEL);

// Local SQLite database file path bundled via next.config.mjs outputFileTracingIncludes
const dbFilePath = path.join(process.cwd(), 'data', 'catalog.db');
const defaultFileUrl = `file:${dbFilePath}`;

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || defaultFileUrl;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken,
});

// Helper to ensure tables exist if running on a new DB
let tablesInitialized = false;
async function ensureTables() {
  if (tablesInitialized || isVercel) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL,
        fabric TEXT,
        color TEXT,
        work TEXT,
        border TEXT,
        blouse_included INTEGER DEFAULT 1,
        length TEXT,
        weight TEXT,
        occasion TEXT,
        care TEXT,
        description TEXT,
        thumbnail TEXT,
        images TEXT,
        videos TEXT,
        is_published INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        is_new_arrival INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        image TEXT NOT NULL,
        link TEXT,
        type TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
      );
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    tablesInitialized = true;
  } catch (err) {
    console.error('Error initializing DB tables:', err);
  }
}

// ---------------- CATEGORY HELPERS ----------------
export async function getCategories() {
  try {
    await ensureTables();
    const res = await db.execute('SELECT * FROM categories');
    return res.rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      description: String(r.description || ''),
      image: String(r.image || '')
    }));
  } catch (err) {
    console.error('getCategories DB Error:', err);
    return [];
  }
}

export async function saveCategories(categories) {
  await ensureTables();
  const tx = await db.transaction('write');
  try {
    await tx.execute('DELETE FROM categories');
    for (const item of categories) {
      await tx.execute({
        sql: `INSERT INTO categories (id, name, description, image) VALUES (?, ?, ?, ?)`,
        args: [item.id, item.name, item.description || '', item.image || '']
      });
    }
    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ---------------- PRODUCT HELPERS ----------------
export async function getProducts() {
  try {
    await ensureTables();
    const res = await db.execute('SELECT * FROM products ORDER BY datetime(created_at) DESC');
    return res.rows.map(r => ({
      code: String(r.code),
      name: String(r.name),
      category: String(r.category),
      price: r.price ? Number(r.price) : null,
      fabric: String(r.fabric || ''),
      color: String(r.color || ''),
      work: String(r.work || ''),
      border: String(r.border || ''),
      blouseIncluded: Number(r.blouse_included) === 1,
      length: String(r.length || ''),
      weight: String(r.weight || ''),
      occasion: String(r.occasion || ''),
      care: String(r.care || ''),
      description: String(r.description || ''),
      thumbnail: String(r.thumbnail || ''),
      images: r.images ? JSON.parse(String(r.images)) : [],
      videos: r.videos ? JSON.parse(String(r.videos)) : [],
      isPublished: Number(r.is_published) === 1,
      isFeatured: Number(r.is_featured) === 1,
      isNewArrival: Number(r.is_new_arrival) === 1,
      createdAt: String(r.created_at || new Date().toISOString()),
    }));
  } catch (err) {
    console.error('getProducts DB Error:', err);
    return [];
  }
}

export async function getProductByCode(code) {
  try {
    await ensureTables();
    const res = await db.execute({
      sql: 'SELECT * FROM products WHERE LOWER(code) = LOWER(?)',
      args: [code]
    });
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      code: String(r.code),
      name: String(r.name),
      category: String(r.category),
      price: r.price ? Number(r.price) : null,
      fabric: String(r.fabric || ''),
      color: String(r.color || ''),
      work: String(r.work || ''),
      border: String(r.border || ''),
      blouseIncluded: Number(r.blouse_included) === 1,
      length: String(r.length || ''),
      weight: String(r.weight || ''),
      occasion: String(r.occasion || ''),
      care: String(r.care || ''),
      description: String(r.description || ''),
      thumbnail: String(r.thumbnail || ''),
      images: r.images ? JSON.parse(String(r.images)) : [],
      videos: r.videos ? JSON.parse(String(r.videos)) : [],
      isPublished: Number(r.is_published) === 1,
      isFeatured: Number(r.is_featured) === 1,
      isNewArrival: Number(r.is_new_arrival) === 1,
      createdAt: String(r.created_at || new Date().toISOString()),
    };
  } catch (err) {
    console.error('getProductByCode DB Error:', err);
    return null;
  }
}

export async function saveProducts(products) {
  await ensureTables();
  const tx = await db.transaction('write');
  try {
    await tx.execute('DELETE FROM products');
    for (const item of products) {
      await tx.execute({
        sql: `INSERT INTO products (
          code, name, category, price, fabric, color, work, border,
          blouse_included, length, weight, occasion, care, description,
          thumbnail, images, videos, is_published, is_featured, is_new_arrival, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.code,
          item.name,
          item.category,
          item.price || null,
          item.fabric || '',
          item.color || '',
          item.work || '',
          item.border || '',
          item.blouseIncluded ? 1 : 0,
          item.length || '',
          item.weight || '',
          item.occasion || '',
          item.care || '',
          item.description || '',
          item.thumbnail || '',
          JSON.stringify(item.images || []),
          JSON.stringify(item.videos || []),
          item.isPublished ? 1 : 0,
          item.isFeatured ? 1 : 0,
          item.isNewArrival ? 1 : 0,
          item.createdAt || new Date().toISOString()
        ]
      });
    }
    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ---------------- BANNER HELPERS ----------------
export async function getBanners() {
  try {
    await ensureTables();
    const res = await db.execute('SELECT * FROM banners');
    return res.rows.map(b => ({
      id: String(b.id),
      title: String(b.title),
      subtitle: String(b.subtitle || ''),
      image: String(b.image || ''),
      link: String(b.link || ''),
      type: String(b.type),
      isActive: Number(b.is_active) === 1
    }));
  } catch (err) {
    console.error('getBanners DB Error:', err);
    return [];
  }
}

export async function saveBanners(banners) {
  await ensureTables();
  const tx = await db.transaction('write');
  try {
    await tx.execute('DELETE FROM banners');
    for (const item of banners) {
      await tx.execute({
        sql: `INSERT INTO banners (id, title, subtitle, image, link, type, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          item.title,
          item.subtitle || '',
          item.image,
          item.link || '',
          item.type,
          item.isActive ? 1 : 0
        ]
      });
    }
    await tx.commit();
    return true;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

// ---------------- AUTO-INCREMENT CODE GENERATOR ----------------
export async function generateNextProductCode() {
  await ensureTables();
  let lastSerial = 1007;
  try {
    const metaRes = await db.execute({
      sql: 'SELECT value FROM metadata WHERE key = ?',
      args: ['last_product_serial']
    });
    
    if (metaRes.rows.length > 0) {
      lastSerial = parseInt(metaRes.rows[0].value, 10);
    } else {
      const prodRes = await db.execute('SELECT code FROM products');
      const serials = prodRes.rows
        .map(r => {
          const match = String(r.code).match(/VK-(\d+)/i);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(Boolean);
      if (serials.length > 0) {
        lastSerial = Math.max(...serials);
      }
    }
  } catch (err) {
    console.error('generateNextProductCode DB error:', err);
  }

  const nextSerial = lastSerial + 1;
  try {
    const tx = await db.transaction('write');
    await tx.execute({
      sql: 'DELETE FROM metadata WHERE key = ?',
      args: ['last_product_serial']
    });
    await tx.execute({
      sql: 'INSERT INTO metadata (key, value) VALUES (?, ?)',
      args: ['last_product_serial', String(nextSerial)]
    });
    await tx.commit();
  } catch (e) {}

  return `VK-${nextSerial}`;
}
