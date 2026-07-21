import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminApiKey, isAuthorized } from '@/lib/auth';

const ADMIN_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'vasthra123';
const SESSION_COOKIE = 'vasthra_admin_session';

export async function GET(request) {
  if (await isAuthorized(request)) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, apiKey } = body;
    const configuredApiKey = getAdminApiKey();

    // Check if valid API key is passed directly or if credentials match
    const isValidApiKey = (apiKey && apiKey === configuredApiKey) ||
                          (request.headers.get('x-api-key') === configuredApiKey);
                          
    const isValidCredentials = (username === ADMIN_USERNAME || !username) &&
                               (password === configuredApiKey || password === DEFAULT_PASSWORD);

    if (isValidApiKey || isValidCredentials) {
      const response = NextResponse.json({ 
        success: true, 
        message: 'Authenticated successfully via API Key / Credentials' 
      });
      
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid API Key or Credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return response;
}
