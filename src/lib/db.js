import { promises as fs } from 'fs';
import path from 'path';

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

// ---------------- CATEGORY HELPERS ----------------
export async function getCategories() {
  return await readJsonFile(categoriesPath, []);
}

export async function saveCategories(categories) {
  return await writeJsonFile(categoriesPath, categories);
}

// ---------------- PRODUCT HELPERS ----------------
export async function getProducts() {
  const products = await readJsonFile(productsPath, []);
  return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getProductByCode(code) {
  const products = await getProducts();
  const found = products.find(p => p.code.toLowerCase() === code.toLowerCase());
  return found || null;
}

export async function saveProducts(products) {
  return await writeJsonFile(productsPath, products);
}

// ---------------- BANNER HELPERS ----------------
export async function getBanners() {
  return await readJsonFile(bannersPath, []);
}

export async function saveBanners(banners) {
  return await writeJsonFile(bannersPath, banners);
}

// ---------------- AUTO-INCREMENT CODE GENERATOR ----------------
export async function generateNextProductCode() {
  const metadata = await readJsonFile(metadataPath, {});
  let lastSerial = 1007;

  if (metadata.last_product_serial) {
    lastSerial = parseInt(metadata.last_product_serial, 10);
  } else {
    // Fallback: search in existing products
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
