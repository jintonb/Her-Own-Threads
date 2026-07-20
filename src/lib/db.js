import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'catalog.db');

// Helper to open DB connection
function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

// ---------------- CATEGORY HELPERS ----------------
export async function getCategories() {
  const db = getDb();
  try {
    const rows = db.prepare('SELECT * FROM categories').all();
    return rows;
  } finally {
    db.close();
  }
}

export async function saveCategories(categories) {
  const db = getDb();
  try {
    const insertCat = db.prepare(`
      INSERT OR REPLACE INTO categories (id, name, description, image)
      VALUES (?, ?, ?, ?)
    `);

    const catTx = db.transaction((items) => {
      db.prepare('DELETE FROM categories').run();
      for (const item of items) {
        insertCat.run(item.id, item.name, item.description || '', item.image || '');
      }
    });
    catTx(categories);
    return true;
  } finally {
    db.close();
  }
}

// ---------------- PRODUCT HELPERS ----------------
export async function getProducts() {
  const db = getDb();
  try {
    const rows = db.prepare('SELECT * FROM products ORDER BY datetime(created_at) DESC').all();
    return rows.map(r => ({
      code: r.code,
      name: r.name,
      category: r.category,
      price: r.price,
      fabric: r.fabric,
      color: r.color,
      work: r.work,
      border: r.border,
      blouseIncluded: r.blouse_included === 1,
      length: r.length,
      weight: r.weight,
      occasion: r.occasion,
      care: r.care,
      description: r.description,
      thumbnail: r.thumbnail,
      images: r.images ? JSON.parse(r.images) : [],
      videos: r.videos ? JSON.parse(r.videos) : [],
      isPublished: r.is_published === 1,
      isFeatured: r.is_featured === 1,
      isNewArrival: r.is_new_arrival === 1,
      createdAt: r.created_at,
    }));
  } finally {
    db.close();
  }
}

export async function getProductByCode(code) {
  const db = getDb();
  try {
    const r = db.prepare('SELECT * FROM products WHERE LOWER(code) = LOWER(?)').get(code);
    if (!r) return null;
    return {
      code: r.code,
      name: r.name,
      category: r.category,
      price: r.price,
      fabric: r.fabric,
      color: r.color,
      work: r.work,
      border: r.border,
      blouseIncluded: r.blouse_included === 1,
      length: r.length,
      weight: r.weight,
      occasion: r.occasion,
      care: r.care,
      description: r.description,
      thumbnail: r.thumbnail,
      images: r.images ? JSON.parse(r.images) : [],
      videos: r.videos ? JSON.parse(r.videos) : [],
      isPublished: r.is_published === 1,
      isFeatured: r.is_featured === 1,
      isNewArrival: r.is_new_arrival === 1,
      createdAt: r.created_at,
    };
  } finally {
    db.close();
  }
}

export async function saveProducts(products) {
  const db = getDb();
  try {
    const insertProd = db.prepare(`
      INSERT OR REPLACE INTO products (
        code, name, category, price, fabric, color, work, border,
        blouse_included, length, weight, occasion, care, description,
        thumbnail, images, videos, is_published, is_featured, is_new_arrival, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const prodTx = db.transaction((items) => {
      db.prepare('DELETE FROM products').run();
      for (const item of items) {
        insertProd.run(
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
        );
      }
    });
    prodTx(products);
    return true;
  } finally {
    db.close();
  }
}

// ---------------- BANNER HELPERS ----------------
export async function getBanners() {
  const db = getDb();
  try {
    const rows = db.prepare('SELECT * FROM banners').all();
    return rows.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      link: b.link,
      type: b.type,
      isActive: b.is_active === 1
    }));
  } finally {
    db.close();
  }
}

export async function saveBanners(banners) {
  const db = getDb();
  try {
    const insertBanner = db.prepare(`
      INSERT OR REPLACE INTO banners (id, title, subtitle, image, link, type, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const banTx = db.transaction((items) => {
      db.prepare('DELETE FROM banners').run();
      for (const item of items) {
        insertBanner.run(
          item.id,
          item.title,
          item.subtitle || '',
          item.image,
          item.link || '',
          item.type,
          item.isActive ? 1 : 0
        );
      }
    });
    banTx(banners);
    return true;
  } finally {
    db.close();
  }
}

// ---------------- AUTO-INCREMENT CODE GENERATOR ----------------
export async function generateNextProductCode() {
  const db = getDb();
  try {
    let lastSerial = 1007;
    const metaRow = db.prepare('SELECT value FROM metadata WHERE key = ?').get('last_product_serial');
    if (metaRow) {
      lastSerial = parseInt(metaRow.value, 10);
    } else {
      const rows = db.prepare('SELECT code FROM products').all();
      const serials = rows
        .map(r => {
          const match = r.code.match(/VK-(\d+)/i);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter(Boolean);
      if (serials.length > 0) {
        lastSerial = Math.max(...serials);
      }
    }

    const nextSerial = lastSerial + 1;
    db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run('last_product_serial', String(nextSerial));
    return `VK-${nextSerial}`;
  } finally {
    db.close();
  }
}
