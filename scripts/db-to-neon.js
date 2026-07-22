import { neon } from '@neondatabase/serverless';
import { promises as fs } from 'fs';
import path from 'path';

async function migrateJsonToNeon() {
  const neonUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

  if (!neonUrl) {
    console.error('Error: Please configure DATABASE_URL in your .env.local file first.');
    process.exit(1);
  }

  console.log('--- Migrating Local JSON Database to Neon Postgres ---');
  console.log(`Connecting to: ${neonUrl}`);

  const sql = neon(neonUrl);

  try {
    // 1. Create tables if they do not exist
    console.log('Creating tables in Neon...');
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

    // 2. Migrate Categories
    console.log('Migrating categories...');
    const catData = await fs.readFile(path.join(process.cwd(), 'data', 'categories.json'), 'utf8');
    const categories = JSON.parse(catData);
    await sql('DELETE FROM categories');
    for (const item of categories) {
      await sql(
        'INSERT INTO categories (id, name, description, image) VALUES ($1, $2, $3, $4)',
        [item.id, item.name, item.description || '', item.image || '']
      );
    }
    console.log(`✓ Migrated ${categories.length} categories.`);

    // 3. Migrate Banners
    console.log('Migrating banners...');
    const bannerData = await fs.readFile(path.join(process.cwd(), 'data', 'banners.json'), 'utf8');
    const banners = JSON.parse(bannerData);
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
    console.log(`✓ Migrated ${banners.length} banners.`);

    // 4. Migrate Products
    console.log('Migrating products...');
    const productData = await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf8');
    const products = JSON.parse(productData);
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
    console.log(`✓ Migrated ${products.length} products.`);

    // 5. Migrate Metadata
    console.log('Migrating metadata...');
    const metaData = await fs.readFile(path.join(process.cwd(), 'data', 'metadata.json'), 'utf8');
    const metadata = JSON.parse(metaData);
    await sql('DELETE FROM metadata');
    for (const [key, value] of Object.entries(metadata)) {
      await sql('INSERT INTO metadata (key, value) VALUES ($1, $2)', [key, String(value)]);
    }
    console.log(`✓ Migrated metadata.`);

    console.log('\n🎉 ALL DATA RECORDS SUCCESSFULLY MIGRATED TO NEON DB! 🎉');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrateJsonToNeon();
