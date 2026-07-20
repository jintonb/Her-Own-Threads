import { cookies } from 'next/headers';
import { getBanners, saveBanners } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper to check admin authentication
async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('vasthra_admin_session');
  return session && session.value === 'authenticated';
}

export async function GET() {
  const banners = await getBanners();
  return NextResponse.json(banners);
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const banner = await request.json();
    if (!banner.id || !banner.title || !banner.image) {
      return NextResponse.json({ success: false, message: 'Missing Banner ID, Title, or Image' }, { status: 400 });
    }

    const banners = await getBanners();
    
    // Check if exists, update or add
    const index = banners.findIndex(b => b.id.toLowerCase() === banner.id.toLowerCase());
    if (index !== -1) {
      banners[index] = { ...banners[index], ...banner };
    } else {
      banners.push(banner);
    }

    await saveBanners(banners);
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing Banner ID' }, { status: 400 });
    }

    let banners = await getBanners();
    banners = banners.filter(b => b.id !== id);
    await saveBanners(banners);

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
