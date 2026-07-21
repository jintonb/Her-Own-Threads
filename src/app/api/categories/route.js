import { getCategories, saveCategories } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Valid API Key or session required.' }, { status: 401 });
  }

  try {
    const category = await request.json();
    if (!category.id || !category.name) {
      return NextResponse.json({ success: false, message: 'Missing Category ID or Name' }, { status: 400 });
    }

    const categories = await getCategories();
    
    const index = categories.findIndex(c => c.id.toLowerCase() === category.id.toLowerCase());
    if (index !== -1) {
      categories[index] = { ...categories[index], ...category };
    } else {
      categories.push(category);
    }

    await saveCategories(categories);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Valid API Key or session required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing Category ID' }, { status: 400 });
    }

    let categories = await getCategories();
    categories = categories.filter(c => c.id !== id);
    await saveCategories(categories);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
