import { cookies } from 'next/headers';
import { getProducts, saveProducts, generateNextProductCode } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper to check admin authentication
async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('vasthra_admin_session');
  return session && session.value === 'authenticated';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    const products = await getProducts();
    let filteredProducts = [...products];

    // Filter by publish status (non-admins only see published)
    const authenticated = await isAdmin();
    if (!authenticated && !includeDrafts) {
      filteredProducts = filteredProducts.filter(p => p.isPublished === true);
    } else if (!includeDrafts) {
      // By default, if not explicitly requested, show only published to visitors
      // If includeDrafts is specified and user is admin, show all
      if (!authenticated) {
        filteredProducts = filteredProducts.filter(p => p.isPublished === true);
      }
    }

    // Category Filter
    if (category) {
      filteredProducts = filteredProducts.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Featured Filter
    if (featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.isFeatured === true);
    }

    // New Arrival Filter
    if (newArrival === 'true') {
      filteredProducts = filteredProducts.filter(p => p.isNewArrival === true);
    }

    // Search Query Filter
    if (search) {
      const q = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.occasion?.toLowerCase().includes(q)
      );
    }

    // Sort by default: latest created first
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(filteredProducts);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newProduct = await request.json();
    
    if (!newProduct.name || !newProduct.category) {
      return NextResponse.json(
        { success: false, message: 'Missing product name or category' },
        { status: 400 }
      );
    }

    // System generates the unique product code automatically
    const generatedCode = await generateNextProductCode();
    const products = await getProducts();

    const product = {
      ...newProduct,
      code: generatedCode, // Override or assign system generated code
      createdAt: new Date().toISOString(),
    };

    products.push(product);
    await saveProducts(products);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('API Error saving product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
