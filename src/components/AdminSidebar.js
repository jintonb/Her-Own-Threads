'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { name: 'Dashboard Home', path: '/admin/dashboard' },
    { name: 'Manage Products', path: '/admin/dashboard/products' },
    { name: 'Manage Categories', path: '/admin/dashboard/categories' },
    { name: 'Manage Banners', path: '/admin/dashboard/banners' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-brand">Vasthra Katha</h2>
        <span className="sidebar-badge">Admin Panel</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/" className="sidebar-link view-site-btn">
          ◀ View Catalog
        </Link>
        <button onClick={handleLogout} className="sidebar-logout-btn">
          Log Out
        </button>
      </div>
    </aside>
  );
}
