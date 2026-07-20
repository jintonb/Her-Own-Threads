import { cookies } from 'next/headers';
import { getProducts, saveProducts } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper to check admin authentication
async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('vasthra_admin_session');
  return session && session.value === 'authenticated';
}

export async function PUT(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await params;
    const updatedFields = await request.json();

    const products = await getProducts();
    const index = products.findIndex(p => p.code.toLowerCase() === code.toLowerCase());

    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Keep createdAt, but overwrite other fields
    products[index] = {
      ...products[index],
      ...updatedFields,
      code: updatedFields.code || products[index].code, // Ensure code is updated if changed (though code should usually remain key)
    };

    await saveProducts(products);
    return NextResponse.json({ success: true, product: products[index] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await params;
    const products = await getProducts();
    const filteredProducts = products.filter(p => p.code.toLowerCase() !== code.toLowerCase());

    if (products.length === filteredProducts.length) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await saveProducts(filteredProducts);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
