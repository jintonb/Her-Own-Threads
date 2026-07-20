import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('vasthra_admin_session');

  // Verify auth on server side. If not logged in, redirect to login page
  if (!session || session.value !== 'authenticated') {
    redirect('/admin');
  }

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar />
      <div className="dashboard-main">
        {children}
      </div>
    </div>
  );
}
