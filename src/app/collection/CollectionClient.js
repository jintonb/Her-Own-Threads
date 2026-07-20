'use client';

import { useState, useEffect } from 'react';
import SareeCard from '@/components/SareeCard';

export default function CollectionClient({ initialParams = {} }) {
  const initialCategory = initialParams.category || '';
  const initialNewArrival = initialParams.newArrival === 'true';
  const initialFeatured = initialParams.featured === 'true';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [filterNewArrival, setFilterNewArrival] = useState(initialNewArrival);
  const [filterFeatured, setFilterFeatured] = useState(initialFeatured);
  
  // Sort state
  const [sortBy, setSortBy] = useState('latest');

  // Dynamic filter values extracted from loaded products
  const [availableFabrics, setAvailableFabrics] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableOccasions, setAvailableOccasions] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch published products
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData);

        // Fetch categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData);

        // Extract filter parameters dynamically from products
        const fabrics = [...new Set(prodData.map(p => p.fabric).filter(Boolean))];
        const colors = [...new Set(prodData.map(p => p.color?.split(' / ')[0]).filter(Boolean))]; // get base colors
        const occasions = [...new Set(prodData.map(p => p.occasion).filter(Boolean))];

        setAvailableFabrics(fabrics);
        setAvailableColors(colors);
        setAvailableOccasions(occasions);
      } catch (error) {
        console.error('Failed to load catalog data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update filters if props change (e.g. user navigates to a new route path)
  useEffect(() => {
    if (initialParams.category !== undefined) {
      setSelectedCategory(initialParams.category || '');
    }
    if (initialParams.newArrival !== undefined) {
      setFilterNewArrival(initialParams.newArrival === 'true');
    }
    if (initialParams.featured !== undefined) {
      setFilterFeatured(initialParams.featured === 'true');
    }
  }, [initialParams.category, initialParams.newArrival, initialParams.featured]);

  // Handle Multi-checkbox toggles
  const toggleFabric = (fabric) => {
    setSelectedFabrics(prev => 
      prev.includes(fabric) ? prev.filter(f => f !== fabric) : [...prev, fabric]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleOccasion = (occasion) => {
    setSelectedOccasions(prev => 
      prev.includes(occasion) ? prev.filter(o => o !== occasion) : [...prev, occasion]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedFabrics([]);
    setSelectedColors([]);
    setSelectedOccasions([]);
    setFilterNewArrival(false);
    setFilterFeatured(false);
  };

  // Filter logic
  const filteredProducts = products.filter(product => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchCode = product.code.toLowerCase().includes(q);
      const matchFabric = product.fabric?.toLowerCase().includes(q);
      const matchDesc = product.description?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchFabric && !matchDesc) return false;
    }

    // Category filter
    if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Fabric filter
    if (selectedFabrics.length > 0 && !selectedFabrics.includes(product.fabric)) {
      return false;
    }

    // Color filter
    if (selectedColors.length > 0) {
      const baseColor = product.color?.split(' / ')[0];
      if (!selectedColors.includes(baseColor)) return false;
    }

    // Occasion filter
    if (selectedOccasions.length > 0 && !selectedOccasions.includes(product.occasion)) {
      return false;
    }

    // New Arrival filter
    if (filterNewArrival && !product.isNewArrival) {
      return false;
    }

    // Featured filter
    if (filterFeatured && !product.isFeatured) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'price-low') {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortBy === 'price-high') {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  return (
    <div className="collection-layout">
      <div className="catalog-heading-full">
        <h1 className="catalog-title">Our Saree Catalog</h1>
        <p className="results-count">
          {loading ? 'Loading catalog...' : `Showing ${sortedProducts.length} premium sarees`}
        </p>
      </div>

      {/* Sidebar Filters */}
      <aside className="filter-sidebar">
        <div className="filter-section">
          <h3 className="filter-section-title">Categories</h3>
          <div className="filter-options">
            <label className="checkbox-label">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ''}
                onChange={() => setSelectedCategory('')}
              />
              All Categories
            </label>
            {categories.map(cat => (
              <label key={cat.id} className="checkbox-label">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.id}
                  onChange={() => setSelectedCategory(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {availableFabrics.length > 0 && (
          <div className="filter-section">
            <h3 className="filter-section-title">Fabric</h3>
            <div className="filter-options">
              {availableFabrics.map(fabric => (
                <label key={fabric} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedFabrics.includes(fabric)}
                    onChange={() => toggleFabric(fabric)}
                  />
                  {fabric}
                </label>
              ))}
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div className="filter-section">
            <h3 className="filter-section-title">Colors</h3>
            <div className="filter-options">
              {availableColors.map(color => (
                <label key={color} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleColor(color)}
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>
        )}

        {availableOccasions.length > 0 && (
          <div className="filter-section">
            <h3 className="filter-section-title">Occasion</h3>
            <div className="filter-options">
              {availableOccasions.map(occ => (
                <label key={occ} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedOccasions.includes(occ)}
                    onChange={() => toggleOccasion(occ)}
                  />
                  {occ}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="filter-section">
          <h3 className="filter-section-title">Collections</h3>
          <div className="filter-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filterNewArrival}
                onChange={() => setFilterNewArrival(!filterNewArrival)}
              />
              New Arrivals
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filterFeatured}
                onChange={() => setFilterFeatured(!filterFeatured)}
              />
              Featured Collection
            </label>
          </div>
        </div>

        <button 
          onClick={clearAllFilters} 
          className="outline-btn"
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', marginTop: '1rem' }}
        >
          Reset Filters
        </button>
      </aside>

      {/* Main Catalog Grid */}
      <section className="catalog-main">
        {/* Search and Sort controls */}
        <div className="catalog-controls-row">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search sarees by name, code, fabric..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-field"
            />
            <svg className="search-icon-svg" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>

          <div className="sort-select-wrapper">
            <span>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="name">Product Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid Display */}
        {loading ? (
          <div className="catalog-loading-placeholder" style={{ padding: '5rem 0', textOrigin: 'center', color: 'var(--text-muted)' }}>
            Loading sarees from atelier...
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="saree-grid">
            {sortedProducts.map(product => (
              <SareeCard key={product.code} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-results-placeholder" style={{ padding: '6rem 0', textOrigin: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: '12px' }}>
            No sarees found matching your filters. Try resetting the filters or modifying your search query.
          </div>
        )}
      </section>
    </div>
  );
}
