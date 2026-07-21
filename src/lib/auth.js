import { cookies } from 'next/headers';

const SESSION_COOKIE = 'vasthra_admin_session';

/**
 * Reads API key from environment variables with fallback
 */
export function getAdminApiKey() {
  return process.env.ADMIN_API_KEY || 'vk_admin_secret_key_9961768565';
}

/**
 * Verifies request authorization via:
 * 1. 'x-api-key' Header
 * 2. 'Authorization: Bearer <API_KEY>' Header
 * 3. 'vasthra_admin_session' HttpOnly Cookie
 */
export async function isAuthorized(request) {
  const adminApiKey = getAdminApiKey();

  // 1. Check 'x-api-key' Header
  const apiKeyHeader = request?.headers?.get('x-api-key');
  if (apiKeyHeader && apiKeyHeader === adminApiKey) {
    return true;
  }

  // 2. Check 'Authorization: Bearer <API_KEY>' Header
  const authHeader = request?.headers?.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === adminApiKey) {
      return true;
    }
  }

  // 3. Check Session Cookie
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    if (session && session.value === 'authenticated') {
      return true;
    }
  } catch (err) {
    // Cookie store error fallback
  }

  return false;
}
