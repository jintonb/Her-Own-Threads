'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'duplicate'
  const [uploading, setUploading] = useState(false);

  // Form State
  const initialFormState = {
    code: '',
    name: '',
    category: '',
    price: '',
    fabric: '',
    color: '',
    work: '',
    border: '',
    blouseIncluded: true,
    length: '5.5 meters + 0.8 meter blouse',
    weight: '600g',
    occasion: '',
    care: 'Dry Clean Only',
    description: '',
    thumbnail: '',
    images: [],
    videos: [],
    isPublished: true,
    isFeatured: false,
    isNewArrival: false,
  };
  const [form, setForm] = useState(initialFormState);
  const [selectedProductCode, setSelectedProductCode] = useState(''); // Tracking editing code

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch('/api/products?includeDrafts=true');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  }

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Upload Thumbnail or Images
  const handleFileUpload = async (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch('/api/upload?folder=products', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if (type === 'thumbnail') {
            setForm(prev => ({ ...prev, thumbnail: data.url }));
          } else if (type === 'images') {
            setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
          } else if (type === 'videos') {
            setForm(prev => ({ ...prev, videos: [...prev.videos, data.url] }));
          }
        } else {
          alert('Upload failed: ' + (data.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed due to connection error.');
    } finally {
      setUploading(false);
    }
  };

  // Delete uploaded item from array
  const removeUploadedImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const removeUploadedVideo = (index) => {
    setForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, idx) => idx !== index)
    }));
  };

  // Open Modals
  const openAddModal = () => {
    setForm(initialFormState);
    if (categories.length > 0) {
      setForm(prev => ({ ...prev, category: categories[0].id }));
    }
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProductCode(product.code);
    setForm({
      ...product,
      price: product.price || '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const openDuplicateModal = (product) => {
    setForm({
      ...product,
      code: `${product.code}-DUP`,
      price: product.price || '',
    });
    setModalMode('duplicate');
    setShowModal(true);
  };

  // Delete product
  const handleDelete = async (code) => {
    if (!confirm(`Are you sure you want to delete saree product "${code}"?`)) return;

    try {
      const res = await fetch(`/api/products/${code}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        loadProducts();
      } else {
        alert('Delete failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with server.');
    }
  };

  // Save Saree Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category) {
      alert('Please fill out Saree Name and Category.');
      return;
    }

    if (modalMode === 'edit' && !form.code) {
      alert('Missing Product Code.');
      return;
    }

    const payload = {
      ...form,
      price: form.price ? Number(form.price) : null,
      thumbnail: form.thumbnail || (form.images.length > 0 ? form.images[0] : ''),
    };

    try {
      let url = '/api/products';
      let method = 'POST';

      if (modalMode === 'edit') {
        url = `/api/products/${selectedProductCode}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        loadProducts();
      } else {
        alert('Save failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving product.');
    }
  };

  // Search/Filter client-side
  const filteredProducts = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchFabric = p.fabric?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchFabric) return false;
    }
    if (catFilter && p.category.toLowerCase() !== catFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="dashboard-title-row">
        <div>
          <h1 className="dashboard-title">Manage Saree Inventory</h1>
          <p className="dashboard-subtitle">Add, edit, duplicate, and publish sarees</p>
        </div>
        <button onClick={openAddModal} className="admin-add-btn">
          + Add New Saree
        </button>
      </div>

      {/* Filter Row */}
      <div className="catalog-controls-row" style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by name, code, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-field"
          />
        </div>
        
        <div className="sort-select-wrapper">
          <span>Category Filter:</span>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="sort-dropdown"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Saree List Table */}
      <div className="admin-table-container">
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading inventory products...
          </p>
        ) : filteredProducts.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Code</th>
                <th>Saree Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>New Arrival</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.code}>
                  <td>
                    <img
                      src={p.thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&auto=format&fit=crop'}
                      alt={p.name}
                      className="admin-table-thumb"
                    />
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.code}</td>
                  <td style={{ fontWeight: '500' }}>{p.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {p.category.replace('-', ' ')}
                  </td>
                  <td>{p.price ? `₹${p.price.toLocaleString('en-IN')}` : 'N/A'}</td>
                  <td>
                    <span className={`toggle-badge ${p.isPublished ? 'toggle-badge-yes' : 'toggle-badge-no'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <span className={`toggle-badge ${p.isFeatured ? 'toggle-badge-yes' : 'toggle-badge-no'}`}>
                      {p.isFeatured ? 'Featured' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`toggle-badge ${p.isNewArrival ? 'toggle-badge-yes' : 'toggle-badge-no'}`}>
                      {p.isNewArrival ? 'New' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        className="admin-action-btn-sm admin-edit-btn"
                        title="Edit Details"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDuplicateModal(p)}
                        className="admin-action-btn-sm admin-dup-btn"
                        title="Duplicate Saree"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(p.code)}
                        className="admin-action-btn-sm admin-delete-btn"
                        title="Delete Product"
                      >
                        Delete
                      </button>
                      {p.isPublished && (
                        <Link
                          href={`/product/${p.code.toLowerCase()}`}
                          target="_blank"
                          className="admin-action-btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderColor: 'var(--border-light)',
                            color: 'var(--text-main)',
                            lineHeight: 1
                          }}
                        >
                          Preview
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No sarees found matching your filters.
          </div>
        )}
      </div>

      {/* Add / Edit / Duplicate Modal Form */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <h2 className="modal-title">
              {modalMode === 'add'
                ? 'Add Saree Product'
                : modalMode === 'edit'
                ? `Edit Saree - ${selectedProductCode}`
                : 'Duplicate Saree'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="modal-form-grid">
                {/* Basic Information */}
                <div>
                  <label className="form-label">Product Code</label>
                  <input
                    type="text"
                    name="code"
                    disabled={true}
                    className="form-input"
                    value={modalMode === 'edit' ? form.code : 'VK-XXXX (Auto-generated)'}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="form-label">Saree Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="form-input"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Amber Gold Kanchipuram Brocade"
                  />
                </div>

                <div>
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    required
                    className="form-input"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Price (INR - Optional)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 12500"
                  />
                </div>

                <div>
                  <label className="form-label">Fabric</label>
                  <input
                    type="text"
                    name="fabric"
                    className="form-input"
                    value={form.fabric}
                    onChange={handleChange}
                    placeholder="e.g. Pure Organza / Katan Silk"
                  />
                </div>

                <div>
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    name="color"
                    className="form-input"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="e.g. Mustard Gold / Maroon Border"
                  />
                </div>

                <div>
                  <label className="form-label">Zari/Work details</label>
                  <input
                    type="text"
                    name="work"
                    className="form-input"
                    value={form.work}
                    onChange={handleChange}
                    placeholder="e.g. Handwoven Kadwa Zari Motifs"
                  />
                </div>

                <div>
                  <label className="form-label">Border Details</label>
                  <input
                    type="text"
                    name="border"
                    className="form-input"
                    value={form.border}
                    onChange={handleChange}
                    placeholder="e.g. Sleek Golden Selvedge Border"
                  />
                </div>

                <div>
                  <label className="form-label">Saree Length</label>
                  <input
                    type="text"
                    name="length"
                    className="form-input"
                    value={form.length}
                    onChange={handleChange}
                    placeholder="e.g. 5.5m + 0.8m blouse"
                  />
                </div>

                <div>
                  <label className="form-label">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    className="form-input"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="e.g. 650g"
                  />
                </div>

                <div>
                  <label className="form-label">Occasion</label>
                  <input
                    type="text"
                    name="occasion"
                    className="form-input"
                    value={form.occasion}
                    onChange={handleChange}
                    placeholder="e.g. Festivals / Wedding Special"
                  />
                </div>

                <div>
                  <label className="form-label">Care Instructions</label>
                  <input
                    type="text"
                    name="care"
                    className="form-input"
                    value={form.care}
                    onChange={handleChange}
                    placeholder="e.g. Dry Clean Only"
                  />
                </div>

                {/* Description */}
                <div className="modal-full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Provide details about craftsmanship, design patterns..."
                  />
                </div>

                {/* Settings & Flags */}
                <div className="modal-full-width" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
                  <label className="toggle-group">
                    <input
                      type="checkbox"
                      name="blouseIncluded"
                      checked={form.blouseIncluded}
                      onChange={handleChange}
                    />
                    Blouse Piece Included
                  </label>

                  <label className="toggle-group">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={form.isPublished}
                      onChange={handleChange}
                    />
                    Publish Immediately
                  </label>

                  <label className="toggle-group">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                    />
                    Featured Collection
                  </label>

                  <label className="toggle-group">
                    <input
                      type="checkbox"
                      name="isNewArrival"
                      checked={form.isNewArrival}
                      onChange={handleChange}
                    />
                    New Arrival
                  </label>
                </div>

                {/* Thumbnail upload */}
                <div className="modal-full-width">
                  <label className="form-label">Saree Thumbnail Image *</label>
                  {form.thumbnail && (
                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={form.thumbnail} alt="Thumbnail preview" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.thumbnail}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>

                {/* Multiple Images Upload */}
                <div className="modal-full-width">
                  <label className="form-label">Additional Saree Gallery Images (Multiple)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'images')}
                    style={{ fontSize: '0.8rem', marginBottom: '1rem' }}
                  />
                  {form.images.length > 0 && (
                    <div className="upload-preview-container">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="upload-preview-item">
                          <img src={img} alt={`Gallery prev ${idx}`} />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(idx)}
                            className="upload-preview-remove"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos Upload */}
                <div className="modal-full-width">
                  <label className="form-label">Saree Videos (Multiple)</label>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'videos')}
                    style={{ fontSize: '0.8rem', marginBottom: '1rem' }}
                  />
                  {form.videos.length > 0 && (
                    <div className="upload-preview-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                      {form.videos.map((vid, idx) => (
                        <div key={idx} className="upload-preview-item" style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', backgroundColor: '#000' }}>
                          <video src={vid} style={{ width: '100%', height: '100%', objectFit: 'contain' }} muted />
                          <button
                            type="button"
                            onClick={() => removeUploadedVideo(idx)}
                            className="upload-preview-remove"
                            title="Remove video"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {uploading && (
                <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Uploading assets to atelier uploads folder... Please wait.
                </p>
              )}

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {modalMode === 'add' ? 'Create Product' : modalMode === 'edit' ? 'Save Changes' : 'Create Duplicate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
