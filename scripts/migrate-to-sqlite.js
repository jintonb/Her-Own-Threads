import Database from 'better-sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'catalog.db');
const dataDir = path.join(process.cwd(), 'data');

async function migrate() {
  console.log('--- Starting SQLite Database Initialization & Migration ---');
  
  // Ensure data folder exists
  await fs.mkdir(dataDir, { recursive: true });

  const db = new Database(dbPath);
  // Enable Foreign Keys & Write-Ahead Logging for speed & safety
  db.pragma('journal_mode = WAL');

  // Create Categories Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT
    );
  `);

  // Create Products Table
  db.exec(`
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

  // Create Banners Table
  db.exec(`
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

  // Create Metadata Table (for auto-increment serial counter)
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  console.log('✓ SQLite tables created successfully.');

  // 1. Migrate Categories
  try {
    const catData = await fs.readFile(path.join(dataDir, 'categories.json'), 'utf8');
    const categories = JSON.parse(catData);
    const insertCat = db.prepare(`
      INSERT OR REPLACE INTO categories (id, name, description, image)
      VALUES (?, ?, ?, ?)
    `);

    const catTx = db.transaction((items) => {
      for (const item of items) {
        insertCat.run(item.id, item.name, item.description || '', item.image || '');
      }
    });
    catTx(categories);
    console.log(`✓ Migrated ${categories.length} categories.`);
  } catch (err) {
    console.log('Notice: No categories.json found or failed to parse.', err.message);
  }

  // 2. Migrate Products
  try {
    const prodData = await fs.readFile(path.join(dataDir, 'products.json'), 'utf8');
    const products = JSON.parse(prodData);
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
    console.log(`✓ Migrated ${products.length} products.`);
  } catch (err) {
    console.log('Notice: No products.json found or failed to parse.', err.message);
  }

  // 3. Migrate Banners
  try {
    const banData = await fs.readFile(path.join(dataDir, 'banners.json'), 'utf8');
    const banners = JSON.parse(banData);
    const insertBanner = db.prepare(`
      INSERT OR REPLACE INTO banners (id, title, subtitle, image, link, type, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const banTx = db.transaction((items) => {
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
    console.log(`✓ Migrated ${banners.length} banners.`);
  } catch (err) {
    console.log('Notice: No banners.json found or failed to parse.', err.message);
  }

  // 4. Migrate Metadata Counter
  try {
    let lastSerial = 1007; // Default highest
    try {
      const metaData = await fs.readFile(path.join(dataDir, 'metadata.json'), 'utf8');
      const meta = JSON.parse(metaData);
      if (meta.lastProductSerial) lastSerial = meta.lastProductSerial;
    } catch (e) {}

    const insertMeta = db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)
    `);
    insertMeta.run('last_product_serial', String(lastSerial));
    console.log(`✓ Migrated metadata last_product_serial = ${lastSerial}.`);
  } catch (err) {
    console.log('Notice: Metadata migration note.', err.message);
  }

  db.close();
  console.log('--- Migration Completed Successfully! SQLite database created at data/catalog.db ---');
}

migrate();
