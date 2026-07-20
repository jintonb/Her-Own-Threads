'use client';

import { useState, useEffect } from 'react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [uploading, setUploading] = useState(false);

  const initialFormState = {
    id: '',
    title: '',
    subtitle: '',
    image: '',
    link: '/collection',
    type: 'home_banner',
    isActive: true,
  };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setLoading(true);
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload?folder=banners', {
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
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setForm(initialFormState);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setForm(banner);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete banner "${id}"?`)) return;

    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        loadBanners();
      } else {
        alert('Delete failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.title || !form.image) {
      alert('Please fill out Banner ID, Title, and upload an image.');
      return;
    }

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        loadBanners();
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
          <h1 className="dashboard-title">Manage Banners</h1>
          <p className="dashboard-subtitle">Control homepage sliding banners, festivals, and offer promotions</p>
        </div>
        <button onClick={openAddModal} className="admin-add-btn">
          + Add New Banner
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading banners...
          </p>
        ) : banners.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Banner Preview</th>
                <th>Banner ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Target Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id}>
                  <td>
                    <img
                      src={b.image}
                      alt={b.title}
                      className="admin-table-thumb"
                      style={{ width: '120px', height: '50px', objectFit: 'cover' }}
                    />
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{b.id}</td>
                  <td style={{ fontWeight: '600' }}>{b.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {b.type.replace('_', ' ')}
                  </td>
                  <td><code style={{ fontSize: '0.75rem' }}>{b.link}</code></td>
                  <td>
                    <span className={`toggle-badge ${b.isActive ? 'toggle-badge-yes' : 'toggle-badge-no'}`}>
                      {b.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openEditModal(b)}
                      className="admin-action-btn-sm admin-edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
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
            No banners defined. Add your first banner image!
          </div>
        )}
      </div>

      {/* Banner Modal Form */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '550px' }}>
            <h2 className="modal-title">
              {modalMode === 'add' ? 'Create Saree Banner' : 'Edit Banner'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="form-label">Banner ID (Slug) *</label>
                <input
                  type="text"
                  name="id"
                  required
                  disabled={modalMode === 'edit'}
                  className="form-input"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="e.g. hero-festival (alphanumeric and hyphens)"
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Banner Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="form-input"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Festive Splendor Collection"
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Subtitle / Caption</label>
                <input
                  type="text"
                  name="subtitle"
                  className="form-input"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="e.g. Pure silk masterworks for special occasions"
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Destination Link / Path</label>
                <input
                  type="text"
                  name="link"
                  className="form-input"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="e.g. /collection?category=kanchipuram-silk"
                />
              </div>

              <div className="login-form-group">
                <label className="form-label">Banner Type</label>
                <select
                  name="type"
                  className="form-input"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="home_banner">Homepage Main Hero Banner</option>
                  <option value="offers_banner">Campaign Special Offer Banner</option>
                  <option value="festival_banner">Festival Season Banner</option>
                </select>
              </div>

              <div className="login-form-group">
                <label className="toggle-group" style={{ padding: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Banner is Active (visible on store)
                </label>
              </div>

              <div className="login-form-group">
                <label className="form-label">Banner Image File *</label>
                {form.image && (
                  <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={form.image} alt="Banner preview" style={{ width: '100px', height: '45px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{form.image}</span>
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
                  Uploading banner image asset... Please wait.
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
                  {modalMode === 'add' ? 'Create Banner' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
