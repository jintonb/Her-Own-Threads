import CollectionClient from './CollectionClient';

export const dynamic = 'force-dynamic';

export default async function CollectionPage({ searchParams }) {
  // In Next.js 15, searchParams is an async promise. In Next.js 14, it is a plain object.
  // Using await resolves it safely in both environments.
  const resolvedParams = await searchParams;
  
  return <CollectionClient initialParams={resolvedParams || {}} />;
}
