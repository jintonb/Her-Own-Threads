import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.warn('Warning: DATABASE_URL environment variable is missing. Connect your database to activate database queries.');
}

const sql = databaseUrl ? neon(databaseUrl) : null;

// Helper to ensure tables exist in Neon Postgres
let tablesInitialized = false;
async function ensureTables() {
  if (!sql || tablesInitialized) return;
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
  if (!sql) return [];
  try {
    await ensureTables();
    const rows = await sql('SELECT * FROM categories ORDER BY name ASC');
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      image: r.image || ''
    }));
  } catch (err) {
    console.error('getCategories Neon Error:', err);
    return [];
  }
}

export async function saveCategories(categories) {
  if (!sql) return false;
  try {
    await ensureTables();
    await sql('DELETE FROM categories');
    for (const item of categories) {
      await sql(
        'INSERT INTO categories (id, name, description, image) VALUES ($1, $2, $3, $4)',
        [item.id, item.name, item.description || '', item.image || '']
      );
    }
    return true;
  } catch (err) {
    console.error('saveCategories Neon Error:', err);
    return false;
  }
}

// ---------------- PRODUCT HELPERS ----------------
export async function getProducts() {
  if (!sql) return [];
  try {
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
  } catch (err) {
    console.error('getProducts Neon Error:', err);
    return [];
  }
}

export async function getProductByCode(code) {
  if (!sql) return null;
  try {
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
  } catch (err) {
    console.error('getProductByCode Neon Error:', err);
    return null;
  }
}

export async function saveProducts(products) {
  if (!sql) return false;
  try {
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
  } catch (err) {
    console.error('saveProducts Neon Error:', err);
    return false;
  }
}

// ---------------- BANNER HELPERS ----------------
export async function getBanners() {
  if (!sql) return [];
  try {
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
  } catch (err) {
    console.error('getBanners Neon Error:', err);
    return [];
  }
}

export async function saveBanners(banners) {
  if (!sql) return false;
  try {
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
  } catch (err) {
    console.error('saveBanners Neon Error:', err);
    return false;
  }
}

// ---------------- AUTO-INCREMENT CODE GENERATOR ----------------
export async function generateNextProductCode() {
  if (!sql) return 'VK-1008';
  try {
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
  } catch (err) {
    console.error('generateNextProductCode Neon Error:', err);
    return 'VK-1008';
  }
}
