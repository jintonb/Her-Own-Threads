import Link from 'next/link';
import { getProducts, getCategories, getBanners } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const banners = await getBanners();

  // Statistics calculations
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const publishedProducts = products.filter(p => p.isPublished).length;
  const featuredProducts = products.filter(p => p.isFeatured).length;
  const draftProducts = totalProducts - publishedProducts;

  // Get recent 5 products
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <div className="dashboard-title-row">
        <div>
          <h1 className="dashboard-title">Atelier Summary</h1>
          <p className="dashboard-subtitle">Quick overview of your Vasthra Katha digital inventory</p>
        </div>
        <Link href="/admin/dashboard/products" className="admin-add-btn">
          Manage Inventory
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Total Products</span>
          <span className="stat-val">{totalProducts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Categories</span>
          <span className="stat-val">{totalCategories}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Published Sarees</span>
          <span className="stat-val">{publishedProducts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Featured Sarees</span>
          <span className="stat-val">{featuredProducts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Drafts / Hidden</span>
          <span className="stat-val">{draftProducts}</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="recent-activity-section" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>
          Recently Added Sarees
        </h2>
        
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Code</th>
                <th>Saree Name</th>
                <th>Category</th>
                <th>Fabric</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <tr key={product.code}>
                    <td>
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="admin-table-thumb"
                      />
                    </td>
                    <td style={{ fontWeight: '600' }}>{product.code}</td>
                    <td>{product.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {product.category.replace('-', ' ')}
                    </td>
                    <td>{product.fabric}</td>
                    <td>{product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'N/A'}</td>
                    <td>
                      <span className={`toggle-badge ${product.isPublished ? 'toggle-badge-yes' : 'toggle-badge-no'}`}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No products found in the catalog. Add your first product to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
