'use client';

import { useState, useEffect } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    id: '',
    name: '',
    description: '',
    image: '',
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setForm((prev) => ({ ...prev, image: data.url }));
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setForm(initialFormState);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setForm(category);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete category "${id}"? This will not delete products under this category, but they will become uncategorized.`)) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        loadCategories();
      } else {
        alert('Delete failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name) {
      alert('Please fill out Category ID and Name.');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        loadCategories();
      } else {
        alert('Save failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="dashboard-title-row">
        <div>
          <h1 className="dashboard-title">Manage Categories</h1>
          <p className="dashboard-subtitle">Define saree collections by style, weave, or fabric</p>
        </div>
        <button onClick={openAddModal} className="admin-add-btn">
          + Add New Category
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading categories...
          </p>
        ) : categories.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category ID (Slug)</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <img
                      src={c.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&auto=format&fit=crop'}
                      alt={c.name}
                      className="admin-table-thumb"
                      style={{ height: '50px', width: '50px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{c.id}</td>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td style={{ maxWidth: '300px', color: 'var(--text-muted)' }}>{c.description}</td>
                  <td>
                    <button
                      onClick={() => openEditModal(c)}
                      className="admin-action-btn-sm admin-edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="admin-action-btn-sm admin-delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No categories defined. Add your first category!
          </div>
        )}
      </div>

      {/* Category Modal Form */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '500px' }}>
            <h2 className="modal-title">
              {modalMode === 'add' ? 'Create Saree Category' : 'Edit Category'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="form-label">Category ID (Slug) *</label>
                <input
                  type="text"
                  name="id"
                  required
                  disabled={modalMode === 'edit'}
                  className="form-input"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="e.g. linen-cotton (alphanumeric and hyphens only)"
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Linen & Cotton Classics"
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Category Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Soft cotton textures and breathable linen sarees."
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Category Image / Banner</label>
                {form.image && (
                  <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={form.image} alt="Category preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.image}</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              {uploading && (
                <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Uploading category image... Please wait.
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
                  {modalMode === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
