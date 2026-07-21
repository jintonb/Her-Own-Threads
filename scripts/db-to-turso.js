import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';

async function migrateLocalToTurso() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('Error: Please configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables first.');
    process.exit(1);
  }

  console.log('--- Migrating Local SQLite Database to Turso Cloud ---');
  console.log(`Target Turso DB: ${tursoUrl}`);

  // 1. Connect to Local SQLite
  const localDbPath = path.join(process.cwd(), 'data', 'catalog.db');
  const localDb = new Database(localDbPath);

  // 2. Connect to Turso Cloud SQLite
  const tursoDb = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  try {
    // 3. Re-create tables on Turso Cloud
    console.log('Initializing tables on Turso...');
    await tursoDb.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT
      );
    `);
    await tursoDb.execute(`
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
    await tursoDb.execute(`
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
    await tursoDb.execute(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 4. Migrate Categories
    console.log('Migrating categories...');
    const categories = localDb.prepare('SELECT * FROM categories').all();
    for (const cat of categories) {
      await tursoDb.execute({
        sql: 'INSERT OR REPLACE INTO categories (id, name, description, image) VALUES (?, ?, ?, ?)',
        args: [cat.id, cat.name, cat.description, cat.image]
      });
    }
    console.log(`✓ Migrated ${categories.length} categories.`);

    // 5. Migrate Banners
    console.log('Migrating banners...');
    const banners = localDb.prepare('SELECT * FROM banners').all();
    for (const ban of banners) {
      await tursoDb.execute({
        sql: 'INSERT OR REPLACE INTO banners (id, title, subtitle, image, link, type, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [ban.id, ban.title, ban.subtitle, ban.image, ban.link, ban.type, ban.is_active]
      });
    }
    console.log(`✓ Migrated ${banners.length} banners.`);

    // 6. Migrate Products
    console.log('Migrating products...');
    const products = localDb.prepare('SELECT * FROM products').all();
    for (const prod of products) {
      await tursoDb.execute({
        sql: `INSERT OR REPLACE INTO products (
          code, name, category, price, fabric, color, work, border,
          blouse_included, length, weight, occasion, care, description,
          thumbnail, images, videos, is_published, is_featured, is_new_arrival, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          prod.code,
          prod.name,
          prod.category,
          prod.price,
          prod.fabric,
          prod.color,
          prod.work,
          prod.border,
          prod.blouse_included,
          prod.length,
          prod.weight,
          prod.occasion,
          prod.care,
          prod.description,
          prod.thumbnail,
          prod.images,
          prod.videos,
          prod.is_published,
          prod.is_featured,
          prod.is_new_arrival,
          prod.created_at
        ]
      });
    }
    console.log(`✓ Migrated ${products.length} products.`);

    // 7. Migrate Metadata
    console.log('Migrating metadata...');
    const metadata = localDb.prepare('SELECT * FROM metadata').all();
    for (const meta of metadata) {
      await tursoDb.execute({
        sql: 'INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)',
        args: [meta.key, meta.value]
      });
    }
    console.log(`✓ Migrated metadata.`);

    console.log('\n🎉 ALL DATABASE RECORDS SUCCESSFULLY MIGRATED TO TURSO CLOUD DB! 🎉');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    localDb.close();
  }
}

migrateLocalToTurso();
