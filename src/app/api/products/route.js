import { getProducts, saveProducts, generateNextProductCode } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { NextResponse } from 'next/server';

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

    // Filter by publish status: non-authenticated visitors ONLY see published items
    const authenticated = await isAuthorized(request);
    if (!authenticated) {
      filteredProducts = filteredProducts.filter(p => p.isPublished === true);
    } else {
      // Authenticated admins only see drafts if includeDrafts query parameter is explicitly set to true
      if (!includeDrafts) {
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

    // Optimize listing payload size: exclude full images/videos arrays for catalog listings
    const optimizedProducts = filteredProducts.map(p => ({
      ...p,
      images: [],
      videos: []
    }));

    return NextResponse.json(optimizedProducts);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Valid API Key or session required.' }, { status: 401 });
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
      code: generatedCode, // Assign system generated code
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
