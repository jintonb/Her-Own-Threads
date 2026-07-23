import { neon } from '@neondatabase/serverless';
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

async function removeDummyProducts() {
  await loadEnvLocal();
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

  if (!dbUrl) {
    console.error('Error: Please configure DATABASE_URL in your .env.local file first.');
    process.exit(1);
  }

  console.log('Connecting to Neon database to remove seeded dummy sarees...');
  const sql = neon(dbUrl);

  try {
    // 1. Delete products in the range HOT-1014 to HOT-1063
    console.log('Executing DELETE statement for dummy products...');
    const result = await sql.query(`
      DELETE FROM products 
      WHERE code >= 'HOT-1014' AND code <= 'HOT-1063'
    `);
    
    console.log('✓ Successfully removed dummy product records from products table.');

    // 2. Reset last_product_serial metadata key back to 1013
    console.log('Resetting product code auto-increment counter to 1013...');
    await sql.query(`
      INSERT INTO metadata (key, value) 
      VALUES ($1, $2) 
      ON CONFLICT (key) 
      DO UPDATE SET value = EXCLUDED.value
    `, ['last_product_serial', '1013']);
    
    console.log('✓ Counter reset successful.');
    console.log('\n🎉 ALL SEEDED DUMMY PRODUCTS REMOVED FROM NEON DB! 🎉');
  } catch (err) {
    console.error('Error removing dummy products:', err);
  }
}

removeDummyProducts();
